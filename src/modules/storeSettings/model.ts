import mongoose from "mongoose";

const storeHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  open: { type: String, required: true },
  close: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
});

const storeSettingsSchema = new mongoose.Schema(
  {
    general: {
      storeName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    socialMedia: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
      youtube: { type: String },
    },
    dataProtectionOfficer: {
      officerName: { type: String },
      officerEmail: { type: String },
      officerPhone: { type: String },
      privacyPolicyUrl: { type: String },
      termsUrl: { type: String },
    },
    storeHours: [storeHoursSchema],
  },
  { timestamps: true }
);

storeSettingsSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const StoreSettings = mongoose.model("StoreSettings", storeSettingsSchema);

export default StoreSettings;
