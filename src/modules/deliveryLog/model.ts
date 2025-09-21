import mongoose from "mongoose";

const DeliveryLogSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminUser",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders",
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "in-transit", "delivered", "failed"],
      default: "assigned",
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

DeliveryLogSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const DeliveryLog = mongoose.model("DeliveryLog", DeliveryLogSchema);

export default DeliveryLog;
