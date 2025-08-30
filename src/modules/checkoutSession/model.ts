import mongoose from "mongoose";

const CheckoutSessionSchema = new mongoose.Schema({
  cartId: String,
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      imgUrl: { type: String, required: true },
    },
  ],
  isFreeDelivery: { type: Boolean, required: true },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
});

CheckoutSessionSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const CheckoutSession = mongoose.model(
  "CheckoutSession",
  CheckoutSessionSchema
);

export default CheckoutSession;
