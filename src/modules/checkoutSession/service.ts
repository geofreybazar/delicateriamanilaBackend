import mongoose, { Types } from "mongoose";
import CheckoutSession from "./model";
import Products from "../products/model";

import {
  CheckoutSessionSchema,
  CheckoutSessionType,
  CreatePaymongoPaymentRequestType,
  CreatePaymongoPaymentRequestSchema,
} from "./validation";

import { generatePaymentBody } from "../../config/generatePaymentBody";
import { ValidationError } from "../../config/ValidationError";
import { NotFoundError } from "../../config/NotFoundError";
import { NoEnoughStockError } from "../../config/NoEnoughStockError";
import { revalidateTag } from "../../config/revalidateTag";
import { paymentPageRequest } from "../../config/paymentPageRequest";

const createCheckoutSessionService = async (body: CheckoutSessionType) => {
  const parsed = CheckoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const validatedBody = parsed.data;

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const existingSession = await CheckoutSession.findOne({
    guestId: validatedBody.guestId,
  }).session(session);

  const itemsToSave = validatedBody.items.map((item) => ({
    productId: new Types.ObjectId(item.productid),
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    imgUrl: item.imgUrl,
  }));

  if (existingSession) {
    const updatedCheckoutSession = await CheckoutSession.findOneAndUpdate(
      { guestId: validatedBody.guestId },
      {
        $set: {
          items: itemsToSave,
          totalPrice: validatedBody.totalPrice,
          expiresAt: expiresAt,
          isFreeDelivery: validatedBody.isFreeDelivery,
        },
      },
      { new: true }
    ).session(session);

    await revalidateTag("checkoutSession");
    return updatedCheckoutSession;
  }

  const checkoutSession = await CheckoutSession.create(
    [
      {
        guestId: validatedBody.guestId,
        items: itemsToSave,
        expiresAt,
        totalPrice: validatedBody.totalPrice,
        isFreeDelivery: validatedBody.isFreeDelivery,
      },
    ],
    { session }
  );

  const notEnoughStock = [];
  const now = new Date();
  const productIds = body.items.map((item) => item.productid);
  const products = await Products.find({ _id: { $in: productIds } }).session(
    session
  );

  const productMap = new Map();
  products.forEach((product) => {
    productMap.set(product._id.toString(), product);
  });

  for (const item of validatedBody.items) {
    const product = productMap.get(item.productid);
    if (!product) {
      await session.abortTransaction();
      throw new NotFoundError("Product not Found");
    }

    product.reservedStock = product.reservedStock.filter(
      (r: { expiresAt: Date }) => new Date(r.expiresAt) > now
    );

    const userReservation = product.reservedStock.find(
      (r: { guestId: string }) => r.guestId === validatedBody.guestId
    );

    const userHasReserved = userReservation?.quantity || 0;

    const availableStock = product.stockQuantity + userHasReserved;

    if (availableStock < item.quantity) {
      notEnoughStock.push({
        productName: product.name,
        availableStock,
        id: item.productid,
      });
    }

    await product.save({ session });
  }

  if (notEnoughStock.length > 0) {
    await session.abortTransaction();
    return {
      message: "Some items are out of stock, refresh to update",
      itemsNoStock: notEnoughStock,
    };
  }

  for (const item of validatedBody.items) {
    const product = productMap.get(item.productid);

    if (!product) {
      await session.abortTransaction();
      throw new NotFoundError("Product not found");
    }

    // Check if user already has a reservation
    const existingReservation = product.reservedStock.find(
      (r: { guestId: string }) => r.guestId === validatedBody.guestId
    );

    const newQuantity = item.quantity;

    if (existingReservation) {
      const previousQuantity = existingReservation.quantity;
      const diff = newQuantity - previousQuantity;

      if (diff > 0) {
        // Need to deduct more from stock
        if (product.stockQuantity < diff) {
          await session.abortTransaction();
          throw new NoEnoughStockError("Not enough stock to increase quantity");
        }
        product.stockQuantity -= diff;
      } else if (diff < 0) {
        // User reduced quantity — return stock
        product.stockQuantity += Math.abs(diff);
      }

      existingReservation.quantity = newQuantity;
      existingReservation.expiresAt = expiresAt;
    } else {
      // New reservation
      if (product.stockQuantity < newQuantity) {
        await session.abortTransaction();
        throw new NoEnoughStockError("Not enough stock to reserve");
      }
      product.stockQuantity -= newQuantity;
      product.reservedStock.push({
        guestId: body.guestId,
        quantity: newQuantity,
        expiresAt: expiresAt,
      });
    }

    await product.save({ session });
  }

  await session.commitTransaction();
  session.endSession();

  await revalidateTag("products");
  await revalidateTag("checkoutSession");

  console.log(checkoutSession);
  return checkoutSession[0];
};

const getCheckoutSessionService = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError("Invalid session ID");
  }

  const checkoutSession = await CheckoutSession.findById(id);
  if (!checkoutSession) {
    throw new NotFoundError("Checkout session not found");
  }

  return checkoutSession;
};

const createPaymongoPaymentRequestService = async (
  body: CreatePaymongoPaymentRequestType
) => {
  const parsed = CreatePaymongoPaymentRequestSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const data = generatePaymentBody(body);

  const paymongoPayment = await paymentPageRequest(data);

  if (!paymongoPayment) {
    await session.abortTransaction();
    throw new ValidationError("Payment request failed");
  }

  await session.commitTransaction();
  session.endSession();

  await revalidateTag("products");

  return paymongoPayment.data.attributes.checkout_url;
};

export default {
  createCheckoutSessionService,
  getCheckoutSessionService,
  createPaymongoPaymentRequestService,
};
