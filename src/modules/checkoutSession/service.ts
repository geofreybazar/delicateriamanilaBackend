import mongoose, { Types } from "mongoose";
import CheckoutSession from "./model";
import Products from "../products/model";
import CartStorage from "../cartStorage/model";
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

  const expiresAt = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);

  const existingSession = await CheckoutSession.findOne({
    cartId: validatedBody.cartId,
  }).session(session);

  const itemsToSave = validatedBody.items.map((item) => ({
    productId: new Types.ObjectId(item.productid),
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    imgUrl: item.imgUrl,
    description: item.description,
  }));

  let checkoutSession;

  if (existingSession) {
    if (existingSession.status === "expired") {
      return {
        title: "Items out of Stock",
        message: "Chekout Session expired!",
      };
    }

    checkoutSession = await CheckoutSession.findOneAndUpdate(
      { cartId: validatedBody.cartId },
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
  } else {
    const created = await CheckoutSession.create(
      [
        {
          cartId: validatedBody.cartId,
          items: itemsToSave,
          expiresAt,
          totalPrice: validatedBody.totalPrice,
          isFreeDelivery: validatedBody.isFreeDelivery,
        },
      ],
      { session }
    );
    checkoutSession = created[0];
  }

  const notEnoughStock = [];
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

    const userReservation = product.reservedStock.find(
      (r: { cartId: string }) => r.cartId === validatedBody.cartId
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
    const cart = await CartStorage.findById(validatedBody.cartId);

    if (cart) {
      const outOfStockIds = notEnoughStock.map((item) => item.id.toString());

      for (const id of outOfStockIds) {
        cart.items.pull({ productid: id });
      }

      // Recalculate total price
      let newTotal = 0;
      for (const item of cart.items) {
        const product = productMap.get(item.productid.toString());
        if (product) {
          newTotal += product.price * item.quantity;
        }
      }

      cart.totalPrice = newTotal;

      await cart.save();
    }

    await session.abortTransaction();
    session.endSession();
    return {
      title: "Items out of Stock",
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
      (r: { cartId: string }) => r.cartId === validatedBody.cartId
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
        cartId: body.cartId,
        quantity: newQuantity,
      });
    }

    await product.save({ session });
  }

  await session.commitTransaction();
  await revalidateTag("checkoutSession");
  session.endSession();

  await revalidateTag("products");
  await revalidateTag("checkoutSession");

  return checkoutSession;
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

  await CartStorage.findByIdAndUpdate(
    parsed.data.cartId,
    { deliveryFee: parsed.data.shippingFee },
    { session }
  );

  await CheckoutSession.findByIdAndUpdate(
    parsed.data.sessionId,
    { deliveryFee: parsed.data.shippingFee },
    { session }
  );

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
