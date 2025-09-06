import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    webhookId: {
      type: String,
      required: true,
      unique: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    clientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientUser",
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: String,
      required: true,
    },
    deliveryRider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
    },
    pickupDetails: {
      trackingNumber: { type: String, unique: true, required: false },
      modeOfPickup: { type: String, required: false },
      pickupPersonName: { type: String, required: false },
      validId: { type: String, required: false },
      idNumber: { type: String, required: false },
      contactNumber: { type: String, required: false },
      pickupDateAndTime: { type: Date, required: false },
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    totalClientPaid: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      paymentBrand: { type: String, required: false },
      paymentId: { type: String, required: false },
      paymentType: { type: String, required: false },
      paymentLast4: { type: String, required: false },
    },
    paymongoFee: {
      type: Number,
      required: true,
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    deliveryAddress: {
      line1: { type: String },
      city: { type: String, required: true },
      postalCode: { type: Number, required: true },
      state: { type: String, required: true },
    },
    itemsOrdered: [
      {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
        description: { type: String },
        images: [{ type: String, required: true }],
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

OrderSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Orders = mongoose.model("Orders", OrderSchema);

export default Orders;
