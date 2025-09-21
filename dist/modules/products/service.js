"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../collections/model"));
const Upload_1 = require("../../config/Upload");
const deleteImage_1 = require("../../config/deleteImage");
const revalidateTag_1 = require("../../config/revalidateTag");
const ValidationError_1 = require("../../config/ValidationError");
const NotFoundError_1 = require("../../config/NotFoundError");
const validation_1 = require("./validation");
const addProductService = async (body, images) => {
    const parsed = validation_1.addProductSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Name field is required");
    }
    const validatedBody = parsed.data;
    if (!images || images.length < 3) {
        throw new ValidationError_1.ValidationError("Upload at least 3 images");
    }
    const uploadedImages = await Promise.all(images.map(async (image) => {
        const { optimizeUrl, publicId } = await (0, Upload_1.uploadImage)(image);
        return { url: optimizeUrl, publicId };
    }));
    const featured = validatedBody.featured === "true" ? true : false;
    const saveProduct = await model_1.default.create({
        name: validatedBody.name,
        description: validatedBody.description,
        status: validatedBody.status,
        price: validatedBody.price,
        category: validatedBody.category,
        stockQuantity: validatedBody.stockQuantity,
        images: uploadedImages,
        featured,
    });
    await (0, revalidateTag_1.revalidateTag)("products");
    await (0, revalidateTag_1.revalidateTag)("featuredProducts");
    await model_2.default.findByIdAndUpdate(validatedBody.category, {
        $push: { products: saveProduct.id },
    }, { new: true });
    return saveProduct;
};
const getProductsService = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        model_1.default.find({}).populate("category", { name: 1 }).skip(skip).limit(limit),
        model_1.default.countDocuments(),
    ]);
    return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const deleteProductsService = async (ids) => {
    if (!validation_1.deleteProductsSchema.safeParse(ids).success) {
        throw new ValidationError_1.ValidationError("Invalid product ID(s)");
    }
    const products = await model_1.default.find({ _id: { $in: ids } });
    if (products.length !== ids.length) {
        throw new ValidationError_1.ValidationError("One or more product IDs are invalid");
    }
    for (const product of products) {
        for (const image of product.images) {
            await (0, deleteImage_1.deleteImage)(image.publicId);
        }
        if (product.category) {
            const category = await model_2.default.findById(product.category);
            if (category) {
                category.products = category.products.filter((p) => p.toString() !== product._id.toString());
                await category.save();
            }
        }
        await product.deleteOne();
    }
    await (0, revalidateTag_1.revalidateTag)("products");
    await (0, revalidateTag_1.revalidateTag)("featuredProducts");
    return { success: true, deletedCount: products.length };
};
const getProductService = async (id) => {
    if (!id || !validation_1.getProductSchema.safeParse(id).success) {
        throw new ValidationError_1.ValidationError("Invalid product id");
    }
    const product = await model_1.default.findById(id).populate("category", { name: 1 });
    if (!product) {
        throw new NotFoundError_1.NotFoundError("Product not found");
    }
    return product;
};
const updateProductService = async (id, body, newImages) => {
    if (!id || !body || !validation_1.addProductSchema.safeParse(body).success) {
        throw new ValidationError_1.ValidationError("Invalid product data");
    }
    const totalImagesLength = [...body.images, ...newImages];
    if (totalImagesLength.length < 3) {
        throw new ValidationError_1.ValidationError("Upload at least 3 images");
    }
    const product = await model_1.default.findById(id);
    if (!product) {
        throw new ValidationError_1.ValidationError("Product not found");
    }
    const uploadedImages = [];
    if (newImages && newImages.length > 0) {
        for (const image of newImages) {
            const { optimizeUrl, publicId } = await (0, Upload_1.uploadImage)(image);
            uploadedImages.push({ url: optimizeUrl, publicId });
        }
    }
    const oldImages = body.images;
    const currentImages = product.images;
    const imagesToDelete = currentImages.filter((img) => !oldImages.some((d) => d === img.publicId));
    if (imagesToDelete.length > 0) {
        await Promise.all(imagesToDelete.map((img) => (0, deleteImage_1.deleteImage)(img.publicId)));
    }
    const remainingImages = currentImages.filter((img) => !imagesToDelete.some((d) => d.publicId === img.publicId));
    const finalImages = [...remainingImages, ...uploadedImages];
    if (product.category.toString() !== body.category) {
        await model_2.default.findByIdAndUpdate(product.category.toString(), {
            $pull: { products: product.id },
        }, { new: true });
        await model_2.default.findByIdAndUpdate(body.category, {
            $push: { products: product.id },
        }, { new: true });
    }
    const featured = body.featured === "true" ? true : false;
    const updateProduct = await model_1.default.findByIdAndUpdate(id, {
        name: body.name,
        description: body.description,
        status: body.status,
        price: body.price,
        category: body.category,
        stockQuantity: body.stockQuantity,
        images: finalImages,
        featured,
    }, { new: true });
    await (0, revalidateTag_1.revalidateTag)("products");
    await (0, revalidateTag_1.revalidateTag)("featuredProducts");
    return updateProduct;
};
const getShopProductsService = async (category, page) => {
    const categoryArray = category && category.trim() !== "" ? category.split(",") : [];
    const skip = (page - 1) * 20;
    const query = {};
    if (categoryArray.length) {
        query.category = { $in: categoryArray };
    }
    const [products, total] = await Promise.all([
        model_1.default.find(query).skip(skip).limit(20),
        model_1.default.countDocuments(query),
    ]);
    return {
        products,
        currentPage: page,
        totalPages: Math.ceil(total / 20),
        totalItems: total,
    };
};
const getFeaturedProductService = async (parsedData) => {
    const page = parseInt(parsedData.page) || 1;
    const limit = parseInt(parsedData.limit) || 1;
    const skip = (page - 1) * limit;
    const [featuredProducts, total] = await Promise.all([
        model_1.default.find({ featured: true })
            .populate("category", { name: 1 })
            .skip(skip)
            .limit(limit),
        model_1.default.countDocuments({ featured: true }),
    ]);
    return {
        products: featuredProducts,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
    };
};
const getShopFeaturedProductsService = async () => {
    const featuredProducts = await model_1.default.find({ featured: true });
    return featuredProducts;
};
const incrementProductQuantitybyOneService = async (id) => {
    const incrementedProduct = await model_1.default.findByIdAndUpdate(id, { $inc: { stockQuantity: 1 } }, { new: true });
    if (!incrementedProduct) {
        throw new NotFoundError_1.NotFoundError("product not found!");
    }
    return incrementedProduct;
};
const decrementProductQuantitybyOneService = async (id) => {
    const decrementedProduct = await model_1.default.findOneAndUpdate({ _id: id, stockQuantity: { $gt: 0 } }, // only update if stock > 0
    { $inc: { stockQuantity: -1 } }, { new: true });
    if (!decrementedProduct) {
        throw new Error("Product not found or stock already at 0");
    }
    return decrementedProduct;
};
exports.default = {
    addProductService,
    getProductsService,
    deleteProductsService,
    getProductService,
    updateProductService,
    getShopProductsService,
    getFeaturedProductService,
    getShopFeaturedProductsService,
    incrementProductQuantitybyOneService,
    decrementProductQuantitybyOneService,
};
