import Collections from "./model";
import { deleteImage } from "../../config/deleteImage";
import { revalidateTag } from "../../config/revalidateTag";
import { uploadImage } from "../../config/Upload";
import { UpdateCollectionService } from "./interface";
import { ValidationError } from "../../config/ValidationError";
import { NotFoundError } from "../../config/NotFoundError";
import {
  addCollectionSchema,
  AddCollectionType,
  deleteCollectionSchema,
  DeleteCollectionType,
  getCollectionSchema,
  GetCollectionType,
} from "./validation";

const addCollectionService = async (
  body: AddCollectionType,
  image: Express.Multer.File
) => {
  const parsed = addCollectionSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }

  if (!image) {
    throw new ValidationError("Upload collection image");
  }

  const { optimizeUrl, publicId } = await uploadImage(image);

  const validatedBody = parsed.data;

  const savedCollection = await Collections.create({
    name: validatedBody.name,
    description: validatedBody.description,
    image: {
      url: optimizeUrl,
      publicId: publicId,
    },
  });
  await revalidateTag("collections");
  return savedCollection;
};

const getCollectionService = async (id: GetCollectionType) => {
  if (!getCollectionSchema.safeParse(id).success) {
    throw new ValidationError("Validation failed");
  }

  const collection = await Collections.findById(id).populate("products", {
    name: 1,
    price: 1,
    status: 1,
  });
  if (!collection) {
    throw new NotFoundError("No collection found");
  }
  return collection;
};

const getCollectionsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [collections, total] = await Promise.all([
    Collections.find({}).skip(skip).limit(limit),
    Collections.countDocuments(),
  ]);

  return {
    collections,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getAllCollectionsService = async () => {
  const collections = await Collections.find({});
  return collections;
};

const deleteCollectionService = async (idsToDelete: DeleteCollectionType) => {
  const validation = deleteCollectionSchema.safeParse(idsToDelete);
  if (!validation.success) {
    throw new ValidationError("Invalid collection ID(s)");
  }

  let collectionsNotDeleted = [];
  let collectionsDeleted = [];
  for (const id of idsToDelete) {
    const collection = await Collections.findById(id);
    if (!collection) {
      throw new ValidationError("Collection ID is not valid");
    }

    if (collection.products.length > 0) {
      collectionsNotDeleted.push(collection.name);
    } else {
      collectionsDeleted.push(collection.name);
      await collection.deleteOne();
      await deleteImage(collection.image.publicId);
    }
  }
  await revalidateTag("collections");

  return { collectionsNotDeleted, collectionsDeleted };
};

const updateCollectionService = async (
  id: string,
  body: UpdateCollectionService,
  image: Express.Multer.File
) => {
  const parsed = addCollectionSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Validation failed");
  }
  if (!id) {
    throw new ValidationError("Collection ID is required");
  }
  const collection = await Collections.findById(id);

  if (!collection) {
    throw new NotFoundError("Collection Not Found");
  }

  const validatedBody = parsed.data;

  const updateData: {
    name: string;
    description: string;
    image?: { url: string; publicId: string };
  } = {
    name: validatedBody.name,
    description: validatedBody.description,
  };

  if (image) {
    const imageToDelete = collection.image.publicId;
    await deleteImage(imageToDelete);
    const { optimizeUrl, publicId } = await uploadImage(image);
    updateData.image = {
      url: optimizeUrl,
      publicId,
    };
  }

  const updatedCollection = await Collections.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
    }
  );
  if (!updatedCollection) {
    throw new NotFoundError("Collection not found");
  }
  await revalidateTag("collections");
  return updatedCollection;
};

const getCollectionsNameService = async (id: string) => {
  const collectionName = await Collections.findById(id).select("name");
  return collectionName;
};

export default {
  addCollectionService,
  getCollectionService,
  getCollectionsService,
  getAllCollectionsService,
  deleteCollectionService,
  updateCollectionService,
  getCollectionsNameService,
};
