import mongoose from "mongoose";
import Webhook from "./model";
import Orders from "../orders/model";
import CheckoutSession from "../checkoutSession/model";
import Products from "../products/model";
import {
  WebhookEventType,
  WebhookEventSchema,
  GetPaymentServiceType,
  getPaymentServiceSchema,
} from "./validation";
import CartStorage from "../cartStorage/model";
import { ValidationError } from "../../config/ValidationError";
import { NotFoundError } from "../../config/NotFoundError";
import { getIO } from "../../config/socket";
import ClientUser from "../clientUsers/model";

const acceptWebhookEndpointService = async (webhookbody: WebhookEventType) => {
  const parsed = WebhookEventSchema.safeParse(webhookbody);

  if (!parsed.success) {
    console.log("Invalid webhook payload", parsed.error);
    return;
  }

  const event = parsed.data;

  const existingWebhook = await Webhook.findOne({ eventId: event.data.id });
  if (existingWebhook) {
    console.log("Duplicate webhook event");
    return { success: false, message: "Duplicate event" };
  }

  const newWebhook = await Webhook.create({
    eventId: event.data.id,
    type: event.data.attributes.type,
    livemode: event.data.attributes.livemode,
    data: event,
  });

  const reference_number =
    event.data.attributes.data.attributes.reference_number;
  if (!reference_number?.includes("_")) {
    console.error("Invalid reference number format");
    return { success: false, message: "Invalid reference format" };
  }

  const [sessionId, cartId] = reference_number!.split("_");
  const cartStorage = await CartStorage.findById(cartId);
  const clientUserId = cartStorage?.clientUserId;

  if (event.data.attributes.type === "checkout_session.payment.paid") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const checkoutData = event.data.attributes.data.attributes;
      const payment = checkoutData.payments?.[0]?.attributes;
      const netAmount = payment.net_amount! / 100;
      const paymongoFee = payment.fee! / 100;
      const totalClientPaid = payment?.amount / 100;
      const paymentBrand = payment?.source?.brand;
      const paymentId = payment?.source?.id;
      const paymentType = payment?.source?.type;
      const paymentLast4 = payment?.source?.last4;

      const shippingFeeItem = checkoutData.line_items.filter(
        (item) => item.name === "Shipping Fee"
      );

      const orderedItems = checkoutData.line_items.filter(
        (item) => item.name !== "Shipping Fee"
      );

      const newOrder = await Orders.create(
        [
          {
            webhookId: event.data.id,
            referenceNumber: reference_number,
            clientUserId,
            type: event.data.attributes.type,
            paymentStatus: "payment received",
            paymentMethod: {
              paymentBrand,
              paymentId,
              paymentType,
              paymentLast4,
            },
            deliveryFee: shippingFeeItem[0].amount / 100,
            orderStatus: "pending",
            netAmount,
            totalClientPaid,
            paymongoFee,
            customerDetails: {
              name: payment?.billing?.name,
              email: payment?.billing?.email,
              phoneNumber: payment?.billing?.phone,
            },
            deliveryAddress: {
              line1: payment.billing?.address.line1,
              city: payment.billing?.address.city,
              postalCode: payment.billing?.address.postal_code,
              state: payment.billing?.address.state,
            },
            itemsOrdered: orderedItems,
          },
        ],
        { session }
      );

      await CheckoutSession.findByIdAndUpdate(
        sessionId,
        {
          status: "paid",
        },
        { session }
      );

      await CartStorage.findByIdAndUpdate(
        cartId,
        {
          status: "completed",
        },
        { session }
      );

      await ClientUser.findByIdAndUpdate(
        clientUserId,
        { $push: { orders: newOrder[0].id } },
        { new: true, session }
      );

      await Products.updateMany(
        { "reservedStock.cartId": cartId },
        { $pull: { reservedStock: { cartId } } },
        { session }
      );

      await session.commitTransaction();
      // socket io event
      getIO().emit("orderCreated", {
        newOrder,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Transaction failed:", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  return newWebhook;
};

const getPaymentsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Webhook.find({}).skip(skip).limit(limit),
    Webhook.countDocuments(),
  ]);

  return {
    payments,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getPaymentService = async (id: GetPaymentServiceType) => {
  if (!id || !getPaymentServiceSchema.safeParse(id).success) {
    throw new ValidationError("Invalid product id");
  }
  const payment = await Webhook.findById(id);
  if (!payment) {
    throw new NotFoundError("Product not found");
  }
  return payment;
};

const getPaymentSummaryService = async () => {
  const payments = await Webhook.find({});

  const allPayments =
    payments.flatMap((p) => {
      const session = p.data.data.attributes.data.attributes;
      return session.payments.map((payment: any) => payment.attributes);
    }) || [];

  const totalPaid = allPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount / 100, 0);

  const totalRefunded = allPayments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount / 100, 0);

  const totalFee = allPayments.reduce((sum, p) => sum + (p.fee / 100 || 0), 0);

  const totalRevenue = totalPaid - totalRefunded - totalFee;

  return {
    totalRevenue,
    totalPaid,
    totalRefunded,
    totalFee,
  };
};

export default {
  acceptWebhookEndpointService,
  getPaymentsService,
  getPaymentService,
  getPaymentSummaryService,
};
