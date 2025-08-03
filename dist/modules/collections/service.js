"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const deleteImage_1 = require("../../config/deleteImage");
const revalidateTag_1 = require("../../config/revalidateTag");
const Upload_1 = require("../../config/Upload");
const ValidationError_1 = require("../../config/ValidationError");
const NotFoundError_1 = require("../../config/NotFoundError");
const validation_1 = require("./validation");
const addCollectionService = async (body, image) => {
    const parsed = validation_1.addCollectionSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    if (!image) {
        throw new ValidationError_1.ValidationError("Upload collection image");
    }
    const { optimizeUrl, publicId } = await (0, Upload_1.uploadImage)(image);
    const validatedBody = parsed.data;
    const savedCollection = await model_1.default.create({
        name: validatedBody.name,
        description: validatedBody.description,
        image: {
            url: optimizeUrl,
            publicId: publicId,
        },
    });
    await (0, revalidateTag_1.revalidateTag)("collections");
    return savedCollection;
};
const getCollectionService = async (id) => {
    if (!validation_1.getCollectionSchema.safeParse(id).success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    const collection = await model_1.default.findById(id).populate("products", {
        name: 1,
        price: 1,
        status: 1,
    });
    if (!collection) {
        throw new NotFoundError_1.NotFoundError("No collection found");
    }
    return collection;
};
const getCollectionsService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [collections, total] = await Promise.all([
        model_1.default.find({}).skip(skip).limit(limit),
        model_1.default.countDocuments(),
    ]);
    return {
        collections,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getAllCollectionsService = async () => {
    const collections = await model_1.default.find({});
    return collections;
};
const deleteCollectionService = async (idsToDelete) => {
    const validation = validation_1.deleteCollectionSchema.safeParse(idsToDelete);
    if (!validation.success) {
        throw new ValidationError_1.ValidationError("Invalid collection ID(s)");
    }
    let collectionsNotDeleted = [];
    let collectionsDeleted = [];
    for (const id of idsToDelete) {
        const collection = await model_1.default.findById(id);
        if (!collection) {
            throw new ValidationError_1.ValidationError("Collection ID is not valid");
        }
        if (collection.products.length > 0) {
            collectionsNotDeleted.push(collection.name);
        }
        else {
            collectionsDeleted.push(collection.name);
            await collection.deleteOne();
            await (0, deleteImage_1.deleteImage)(collection.image.publicId);
        }
    }
    await (0, revalidateTag_1.revalidateTag)("collections");
    return { collectionsNotDeleted, collectionsDeleted };
};
const updateCollectionService = async (id, body, image) => {
    const parsed = validation_1.addCollectionSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Validation failed");
    }
    if (!id) {
        throw new ValidationError_1.ValidationError("Collection ID is required");
    }
    const collection = await model_1.default.findById(id);
    if (!collection) {
        throw new NotFoundError_1.NotFoundError("Collection Not Found");
    }
    const validatedBody = parsed.data;
    const updateData = {
        name: validatedBody.name,
        description: validatedBody.description,
    };
    if (image) {
        const imageToDelete = collection.image.publicId;
        await (0, deleteImage_1.deleteImage)(imageToDelete);
        const { optimizeUrl, publicId } = await (0, Upload_1.uploadImage)(image);
        updateData.image = {
            url: optimizeUrl,
            publicId,
        };
    }
    const updatedCollection = await model_1.default.findByIdAndUpdate(id, updateData, {
        new: true,
    });
    if (!updatedCollection) {
        throw new NotFoundError_1.NotFoundError("Collection not found");
    }
    await (0, revalidateTag_1.revalidateTag)("collections");
    return updatedCollection;
};
const getCollectionsNameService = async (id) => {
    const collectionName = await model_1.default.findById(id).select("name");
    return collectionName;
};
exports.default = {
    addCollectionService,
    getCollectionService,
    getCollectionsService,
    getAllCollectionsService,
    deleteCollectionService,
    updateCollectionService,
    getCollectionsNameService,
};
