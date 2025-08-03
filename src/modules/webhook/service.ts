import Webhook from "./model";
import Orders from "../orders/model";
import CheckoutSession from "../checkoutSession/model";
import { WebhookEventType, WebhookEventSchema } from "./validation";

const acceptWebhookEndpointService = async (webhookbody: WebhookEventType) => {
  const parsed = WebhookEventSchema.safeParse(webhookbody);

  if (!parsed.success) {
    console.log("Invalid webhook payload", parsed.error);
    return;
  }

  const newWebhook = await Webhook.create({
    eventId: webhookbody.data.id,
    type: webhookbody.data.attributes.type,
    livemode: webhookbody.data.attributes.livemode,
    data: webhookbody,
  });

  if (webhookbody.data.attributes.type === "checkout_session.payment.paid") {
    await Orders.create({
      webhookId: webhookbody.data.id,
      type: webhookbody.data.attributes.type,
      paymentStatus: "payment received",
      orderStatus: "pending",
      totalAmount:
        webhookbody.data.attributes.data.attributes.payments?.[0].attributes
          .amount,
      customerDetails: {
        name: webhookbody?.data?.attributes?.data?.attributes?.payments?.[0]
          ?.attributes?.billing?.name,
        email:
          webhookbody.data.attributes.data.attributes.payments?.[0].attributes
            .billing?.email,
        phoneNumber:
          webhookbody.data.attributes.data.attributes.payments?.[0].attributes
            .billing?.phone,
      },
      deliveryAddress: {
        line1:
          webhookbody.data.attributes.data.attributes.payments?.[0].attributes
            .billing?.address.line1,
        city: webhookbody.data.attributes.data.attributes.payments?.[0]
          .attributes.billing?.address.city,
        postalCode:
          webhookbody.data.attributes.data.attributes.payments?.[0].attributes
            .billing?.address.postal_code,
        state:
          webhookbody.data.attributes.data.attributes.payments?.[0].attributes
            .billing?.address.state,
      },
      itemsOrdered: webhookbody.data.attributes.data.attributes.line_items,
    });

    const reference_number =
      webhookbody.data.attributes.data.attributes.reference_number;

    await CheckoutSession.findByIdAndUpdate(reference_number, {
      status: "paid",
    });
  }

  return newWebhook;
};

export default {
  acceptWebhookEndpointService,
};
