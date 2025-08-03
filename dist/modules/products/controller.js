"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const validation_1 = require("./validation");
const addProduct = async (req, res, next) => {
    const body = req.body;
    const files = req.files;
    const images = Array.isArray(files) ? files : [];
    try {
        const saveProduct = await service_1.default.addProductService(body, images);
        res.status(201).json(saveProduct);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getProducts = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const products = await service_1.default.getProductsService(page, limit);
        res.status(201).json(products);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getProduct = async (req, res, next) => {
    const id = req.params.id;
    try {
        const product = await service_1.default.getProductService(id);
        res.status(200).json(product);
        return;
    }
    catch (error) {
        next(error);
    }
};
const deleteProducts = async (req, res, next) => {
    const idsToDelete = req.body;
    try {
        const deletionStatus = await service_1.default.deleteProductsService(idsToDelete);
        res.status(200).json(deletionStatus);
        return;
    }
    catch (error) {
        next(error);
    }
};
const updateProduct = async (req, res, next) => {
    const body = req.body;
    const id = req.params.id;
    const files = req.files;
    const newImages = Array.isArray(files)
        ? files
        : [];
    let dataImages = [];
    if (Array.isArray(body.images)) {
        dataImages = body.images;
    }
    else if (typeof body.images === "string") {
        dataImages = [body.images];
    }
    else {
        dataImages = [];
    }
    body.images = dataImages;
    try {
        const updatedProduct = await service_1.default.updateProductService(id, body, newImages);
        res.status(200).json(updatedProduct);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getShopProducts = async (req, res, next) => {
    const category = req.query.category;
    const page = parseInt(req.query.page) || 1;
    if (category !== undefined && typeof category !== "string") {
        const error = new Error("Validation failed: 'category' must be a string");
        error.name = "ValidationError";
        error.status = 400;
        next(error);
        return;
    }
    try {
        const products = await service_1.default.getShopProductsService(category, page);
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
};
const getFeaturedProducts = async (req, res, next) => {
    const query = req.query;
    const parsedData = validation_1.featuredProductsSchema.safeParse(query);
    if (!query || !parsedData.success) {
        const error = new Error("Invalid page and limit");
        error.name = "ValidationError";
        error.status = 400;
        throw error;
    }
    try {
        const featuredProducts = await service_1.default.getFeaturedProductService(parsedData.data);
        res.status(200).json(featuredProducts);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getShopFeaturedProducts = async (req, res, next) => {
    try {
        const featuredProducts = await service_1.default.getShopFeaturedProductsService();
        res.status(200).json(featuredProducts);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    addProduct,
    getProducts,
    deleteProducts,
    getProduct,
    updateProduct,
    getShopProducts,
    getFeaturedProducts,
    getShopFeaturedProducts,
};
