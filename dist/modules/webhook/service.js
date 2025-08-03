"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../orders/model"));
const model_3 = __importDefault(require("../checkoutSession/model"));
const validation_1 = require("./validation");
const acceptWebhookEndpointService = async (webhookbody) => {
    const parsed = validation_1.WebhookEventSchema.safeParse(webhookbody);
    if (!parsed.success) {
        console.log("Invalid webhook payload", parsed.error);
        return;
    }
    const newWebhook = await model_1.default.create({
        eventId: webhookbody.data.id,
        type: webhookbody.data.attributes.type,
        livemode: webhookbody.data.attributes.livemode,
        data: webhookbody,
    });
    if (webhookbody.data.attributes.type === "checkout_session.payment.paid") {
        await model_2.default.create({
            webhookId: webhookbody.data.id,
            type: webhookbody.data.attributes.type,
            paymentStatus: "payment received",
            orderStatus: "pending",
            totalAmount: webhookbody.data.attributes.data.attributes.payments?.[0].attributes
                .amount,
            customerDetails: {
                name: webhookbody?.data?.attributes?.data?.attributes?.payments?.[0]
                    ?.attributes?.billing?.name,
                email: webhookbody.data.attributes.data.attributes.payments?.[0].attributes
                    .billing?.email,
                phoneNumber: webhookbody.data.attributes.data.attributes.payments?.[0].attributes
                    .billing?.phone,
            },
            deliveryAddress: {
                line1: webhookbody.data.attributes.data.attributes.payments?.[0].attributes
                    .billing?.address.line1,
                city: webhookbody.data.attributes.data.attributes.payments?.[0]
                    .attributes.billing?.address.city,
                postalCode: webhookbody.data.attributes.data.attributes.payments?.[0].attributes
                    .billing?.address.postal_code,
                state: webhookbody.data.attributes.data.attributes.payments?.[0].attributes
                    .billing?.address.state,
            },
            itemsOrdered: webhookbody.data.attributes.data.attributes.line_items,
        });
        const reference_number = webhookbody.data.attributes.data.attributes.reference_number;
        await model_3.default.findByIdAndUpdate(reference_number, {
            status: "paid",
        });
    }
    return newWebhook;
};
exports.default = {
    acceptWebhookEndpointService,
};
