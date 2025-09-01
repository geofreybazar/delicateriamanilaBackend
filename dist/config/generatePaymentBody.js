"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentBody = void 0;
const config_1 = __importDefault(require("./config"));
const url = config_1.default.NODE_ENV === "development"
    ? "http://localhost:3000 "
    : "https://www.delicateriamanila.com";
const generatePaymentBody = (data) => {
    const items = data.items.map((item) => {
        return {
            currency: "PHP",
            images: [item.imgUrl],
            amount: item.price * 100,
            quantity: item.quantity,
            description: "item discription",
            name: item.name,
        };
    });
    const paymentData = {
        data: {
            attributes: {
                billing: {
                    address: {
                        line1: data.address,
                        city: data.city,
                        state: "Metro Manila",
                        postal_code: data.postalCode,
                        country: "PH",
                    },
                    name: data.firstName + " " + data.lastName,
                    email: data.emailAddress,
                    phone: data.phoneNumber,
                },
                send_email_receipt: true,
                show_description: true,
                show_line_items: true,
                line_items: [
                    ...items,
                    {
                        currency: "PHP",
                        amount: data.shippingFee * 100,
                        description: "Shipping fee",
                        name: "Shipping fee",
                        quantity: 1,
                    },
                ],
                description: `Delicateria goods purchased by ${data.firstName} ${data.lastName} from Delicateria Manila`,
                payment_method_types: [
                    "gcash",
                    "paymaya",
                    "card",
                    "dob",
                    "dob_ubp",
                    "brankas_landbank",
                    "brankas_metrobank",
                ],
                reference_number: `${data.sessionId}_${data.cartId}`,
                statement_descriptor: "Delicateria Manila",
                success_url: `${url}/checkout/successpayment/${data.sessionId}_${data.cartId}`,
                cancel_url: `${url}/checkout/cancel`,
            },
        },
    };
    return paymentData;
};
exports.generatePaymentBody = generatePaymentBody;
