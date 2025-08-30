import mongoose from "mongoose";

const CartStorageSchema = new mongoose.Schema(
  {
    items: [
      {
        productid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      default: "pending",
    },
    clientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientUser",
      required: false,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isFreeDelivery: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

CartStorageSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const CartStorage = mongoose.model("CartStorage", CartStorageSchema);

export default CartStorage;
1;
