import { FilterQuery } from "mongoose";
import Products from "./model";
import Collections from "../collections/model";
import { uploadImage } from "../../config/Upload";
import { deleteImage } from "../../config/deleteImage";
import { revalidateTag } from "../../config/revalidateTag";
import { UpdateProductServiceType } from "./interface";
import { ValidationError } from "../../config/ValidationError";
import { NotFoundError } from "../../config/NotFoundError";
import {
  addProductSchema,
  AddProductType,
  deleteProductsSchema,
  DeleteProductsType,
  FeaturedProductsType,
  getProductSchema,
  GetProductType,
} from "./validation";

const addProductService = async (
  body: AddProductType,
  images: Express.Multer.File[]
) => {
  const parsed = addProductSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Name field is required");
  }

  const validatedBody = parsed.data;

  if (!images || images.length < 3) {
    throw new ValidationError("Upload at least 3 images");
  }

  const uploadedImages = await Promise.all(
    images.map(async (image) => {
      const { optimizeUrl, publicId } = await uploadImage(image);
      return { url: optimizeUrl, publicId };
    })
  );

  const featured = validatedBody.featured === "true" ? true : false;

  const saveProduct = await Products.create({
    name: validatedBody.name,
    description: validatedBody.description,
    status: validatedBody.status,
    price: validatedBody.price,
    category: validatedBody.category,
    stockQuantity: validatedBody.stockQuantity,
    images: uploadedImages,
    featured,
  });

  await revalidateTag("products");
  await revalidateTag("featuredProducts");

  await Collections.findByIdAndUpdate(
    validatedBody.category,
    {
      $push: { products: saveProduct.id },
    },
    { new: true }
  );

  return saveProduct;
};

const getProductsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Products.find({}).populate("category", { name: 1 }).skip(skip).limit(limit),
    Products.countDocuments(),
  ]);

  return {
    products,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const deleteProductsService = async (ids: DeleteProductsType) => {
  if (!deleteProductsSchema.safeParse(ids).success) {
    throw new ValidationError("Invalid product ID(s)");
  }

  const products = await Products.find({ _id: { $in: ids } });

  if (products.length !== ids.length) {
    throw new ValidationError("One or more product IDs are invalid");
  }

  for (const product of products) {
    for (const image of product.images) {
      await deleteImage(image.publicId);
    }

    if (product.category) {
      const category = await Collections.findById(product.category);
      if (category) {
        category.products = category.products.filter(
          (p) => p.toString() !== product._id.toString()
        );
        await category.save();
      }
    }

    await product.deleteOne();
  }
  await revalidateTag("products");
  await revalidateTag("featuredProducts");
  return { success: true, deletedCount: products.length };
};

const getProductService = async (id: GetProductType) => {
  if (!id || !getProductSchema.safeParse(id).success) {
    throw new ValidationError("Invalid product id");
  }

  const product = await Products.findById(id).populate("category", { name: 1 });
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

const updateProductService = async (
  id: string,
  body: UpdateProductServiceType,
  newImages: Express.Multer.File[]
) => {
  if (!id || !body || !addProductSchema.safeParse(body).success) {
    throw new ValidationError("Invalid product data");
  }

  const totalImagesLength = [...body.images, ...newImages];

  if (totalImagesLength.length < 3) {
    throw new ValidationError("Upload at least 3 images");
  }

  const product = await Products.findById(id);
  if (!product) {
    throw new ValidationError("Product not found");
  }

  const uploadedImages = [];
  if (newImages && newImages.length > 0) {
    for (const image of newImages) {
      const { optimizeUrl, publicId } = await uploadImage(image);
      uploadedImages.push({ url: optimizeUrl, publicId });
    }
  }

  const oldImages = body.images;

  const currentImages = product.images;

  const imagesToDelete = currentImages.filter(
    (img) => !oldImages.some((d) => d === img.publicId)
  );

  if (imagesToDelete.length > 0) {
    await Promise.all(imagesToDelete.map((img) => deleteImage(img.publicId)));
  }

  const remainingImages = currentImages.filter(
    (img) => !imagesToDelete.some((d) => d.publicId === img.publicId)
  );

  const finalImages = [...remainingImages, ...uploadedImages];

  if (product.category.toString() !== body.category) {
    await Collections.findByIdAndUpdate(
      product.category.toString(),
      {
        $pull: { products: product.id },
      },
      { new: true }
    );

    await Collections.findByIdAndUpdate(
      body.category,
      {
        $push: { products: product.id },
      },
      { new: true }
    );
  }
  const featured = body.featured === "true" ? true : false;

  const updateProduct = await Products.findByIdAndUpdate(
    id,
    {
      name: body.name,
      description: body.description,
      status: body.status,
      price: body.price,
      category: body.category,
      stockQuantity: body.stockQuantity,
      images: finalImages,
      featured,
    },
    { new: true }
  );

  await revalidateTag("products");
  await revalidateTag("featuredProducts");
  return updateProduct;
};

const getShopProductsService = async (
  category: string | undefined,
  page: number
) => {
  const categoryArray =
    category && category.trim() !== "" ? category.split(",") : [];

  const skip = (page - 1) * 20;

  const query: FilterQuery<AddProductType> = {};

  if (categoryArray.length) {
    query.category = { $in: categoryArray };
  }

  const [products, total] = await Promise.all([
    Products.find(query).skip(skip).limit(20),
    Products.countDocuments(query),
  ]);

  return {
    products,
    currentPage: page,
    totalPages: Math.ceil(total / 20),
    totalItems: total,
  };
};

const getFeaturedProductService = async (parsedData: FeaturedProductsType) => {
  const page = parseInt(parsedData.page as string) || 1;
  const limit = parseInt(parsedData.limit as string) || 1;
  const skip = (page - 1) * limit;

  const [featuredProducts, total] = await Promise.all([
    Products.find({ featured: true })
      .populate("category", { name: 1 })
      .skip(skip)
      .limit(limit),
    Products.countDocuments({ featured: true }),
  ]);

  return {
    products: featuredProducts,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
};

const getShopFeaturedProductsService = async () => {
  const featuredProducts = await Products.find({ featured: true });
  return featuredProducts;
};

const incrementProductQuantitybyOneService = async (id: string) => {
  const incrementedProduct = await Products.findByIdAndUpdate(
    id,
    { $inc: { stockQuantity: 1 } },
    { new: true }
  );

  if (!incrementedProduct) {
    throw new NotFoundError("product not found!");
  }

  return incrementedProduct;
};

const decrementProductQuantitybyOneService = async (id: string) => {
  const decrementedProduct = await Products.findOneAndUpdate(
    { _id: id, stockQuantity: { $gt: 0 } }, // only update if stock > 0
    { $inc: { stockQuantity: -1 } },
    { new: true }
  );

  if (!decrementedProduct) {
    throw new Error("Product not found or stock already at 0");
  }

  return decrementedProduct;
};

export default {
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
