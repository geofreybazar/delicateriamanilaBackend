import { Request, Response, NextFunction } from "express";
import service from "./service";
import { featuredProductsSchema } from "./validation";

const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const files = req.files;
  const images = Array.isArray(files) ? (files as Express.Multer.File[]) : [];
  try {
    const saveProduct = await service.addProductService(body, images);
    res.status(201).json(saveProduct);
    return;
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const products = await service.getProductsService(page, limit);
    res.status(201).json(products);
    return;
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;

  try {
    const product = await service.getProductService(id);
    res.status(200).json(product);
    return;
  } catch (error) {
    next(error);
  }
};

const deleteProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idsToDelete = req.body;
  try {
    const deletionStatus = await service.deleteProductsService(idsToDelete);
    res.status(200).json(deletionStatus);
    return;
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  const id = req.params.id;

  const files = req.files;

  const newImages = Array.isArray(files)
    ? (files as Express.Multer.File[])
    : [];

  let dataImages = [];
  if (Array.isArray(body.images)) {
    dataImages = body.images;
  } else if (typeof body.images === "string") {
    dataImages = [body.images];
  } else {
    dataImages = [];
  }

  body.images = dataImages;

  try {
    const updatedProduct = await service.updateProductService(
      id,
      body,
      newImages
    );
    res.status(200).json(updatedProduct);
    return;
  } catch (error) {
    next(error);
  }
};

const getShopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const category = req.query.category;

  const page = parseInt(req.query.page as string) || 1;

  if (category !== undefined && typeof category !== "string") {
    const error: any = new Error(
      "Validation failed: 'category' must be a string"
    );
    error.name = "ValidationError";
    error.status = 400;
    next(error);
    return;
  }

  try {
    const products = await service.getShopProductsService(category, page);
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query;
  const parsedData = featuredProductsSchema.safeParse(query);
  if (!query || !parsedData.success) {
    const error: any = new Error("Invalid page and limit");
    error.name = "ValidationError";
    error.status = 400;
    throw error;
  }

  try {
    const featuredProducts = await service.getFeaturedProductService(
      parsedData.data
    );
    res.status(200).json(featuredProducts);
    return;
  } catch (error) {
    next(error);
  }
};

const getShopFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const featuredProducts = await service.getShopFeaturedProductsService();
    res.status(200).json(featuredProducts);
    return;
  } catch (error) {
    next(error);
  }
};

export default {
  addProduct,
  getProducts,
  deleteProducts,
  getProduct,
  updateProduct,
  getShopProducts,
  getFeaturedProducts,
  getShopFeaturedProducts,
};
