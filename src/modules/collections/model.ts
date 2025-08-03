import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
    ],
    image: {
      type: {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
      required: true,
    },
  },
  { timestamps: true }
);

CollectionSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Collections = mongoose.model("Collection", CollectionSchema);

export default Collections;
