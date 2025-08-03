"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("./service"));
const addCollection = async (req, res, next) => {
    const body = req.body;
    const image = req.file;
    try {
        const savedCollection = await service_1.default.addCollectionService(body, image);
        res.status(201).json(savedCollection);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getCollection = async (req, res, next) => {
    const id = req.params.id;
    try {
        const collection = await service_1.default.getCollectionService(id);
        res.status(200).json(collection);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getCollections = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const collections = await service_1.default.getCollectionsService(page, limit);
        res.status(201).json(collections);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getAllColletions = async (_, res, next) => {
    try {
        const collections = await service_1.default.getAllCollectionsService();
        res.status(201).json(collections);
    }
    catch (error) {
        next(error);
    }
};
const deleteCollection = async (req, res, next) => {
    const idsToDelete = req.body;
    try {
        const collectionsNotDelete = await service_1.default.deleteCollectionService(idsToDelete);
        res.status(200).json(collectionsNotDelete);
        return;
    }
    catch (error) {
        next(error);
    }
};
const updateCollection = async (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    const image = req.file;
    try {
        const updatedCollection = await service_1.default.updateCollectionService(id, body, image);
        res.status(200).json(updatedCollection);
        return;
    }
    catch (error) {
        next(error);
    }
};
const getCollectionsName = async (req, res, next) => {
    const id = req.params.id;
    try {
        const collectionName = await service_1.default.getCollectionsNameService(id);
        res.status(200).json(collectionName);
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    addCollection,
    getCollection,
    getCollections,
    getAllColletions,
    deleteCollection,
    updateCollection,
    getCollectionsName,
};
