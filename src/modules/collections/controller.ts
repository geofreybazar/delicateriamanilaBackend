import { Request, Response, NextFunction } from "express";
import service from "./service";

const addCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  const image = req.file as Express.Multer.File;

  try {
    const savedCollection = await service.addCollectionService(body, image);
    res.status(201).json(savedCollection);
    return;
  } catch (error) {
    next(error);
  }
};

const getCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;

  try {
    const collection = await service.getCollectionService(id);
    res.status(200).json(collection);
    return;
  } catch (error) {
    next(error);
  }
};

const getCollections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const collections = await service.getCollectionsService(page, limit);
    res.status(201).json(collections);
    return;
  } catch (error) {
    next(error);
  }
};

const getAllColletions = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const collections = await service.getAllCollectionsService();
    res.status(201).json(collections);
  } catch (error) {
    next(error);
  }
};

const deleteCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idsToDelete = req.body;

  try {
    const collectionsNotDelete = await service.deleteCollectionService(
      idsToDelete
    );
    res.status(200).json(collectionsNotDelete);
    return;
  } catch (error) {
    next(error);
  }
};

const updateCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const body = req.body;
  const image = req.file as Express.Multer.File;

  try {
    const updatedCollection = await service.updateCollectionService(
      id,
      body,
      image
    );
    res.status(200).json(updatedCollection);
    return;
  } catch (error) {
    next(error);
  }
};

const getCollectionsName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const collectionName = await service.getCollectionsNameService(id);
    res.status(200).json(collectionName);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  addCollection,
  getCollection,
  getCollections,
  getAllColletions,
  deleteCollection,
  updateCollection,
  getCollectionsName,
};
