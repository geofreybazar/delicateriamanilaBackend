import CartStorage from "./model";
import Products from "../products/model";
import {
  CreateCartServiceSchema,
  CreateCartServiceType,
  AddItemServiceType,
  AddItemServiceSchema,
  CreateClientUserCartSchema,
  CreateClientUserCartType,
  getCartSchema,
  GetCartType,
} from "./validation";
import { ValidationError } from "../../config/ValidationError";
import { NotFoundError } from "../../config/NotFoundError";
import ClientUser from "../clientUsers/model";

const createCartService = async (id: CreateCartServiceType) => {
  const parsed = CreateCartServiceSchema.safeParse(id);
  if (!parsed.success) {
    throw new ValidationError("Invalid Product id");
  }

  const product = await Products.findById(parsed.data);
  if (!product) {
    throw new NotFoundError("Invalid Product id");
  }

  const totalPrice = product.price;
  const items = {
    productid: product.id,
    quantity: 1,
  };
  const isFreeDelivery = product.price >= 5000;

  const newCart = await CartStorage.create({
    items,
    isFreeDelivery,
    totalPrice,
  });

  return newCart;
};

const createClientUserCartService = async (body: CreateClientUserCartType) => {
  const parsed = CreateClientUserCartSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid Product or Client User id");
  }

  const [clientUser, product] = await Promise.all([
    ClientUser.findById(parsed.data.userId),
    Products.findById(parsed.data.productId),
  ]);

  if (!clientUser || !product) {
    throw new NotFoundError("Client User or Product was not found.");
  }

  const cart = await CartStorage.findOne({
    clientUserId: clientUser.id,
    status: "pending",
  });

  if (!cart) {
    const totalPrice = product.price;
    const items = [{ productid: product._id, quantity: 1 }];
    const isFreeDelivery = product.price >= 5000;

    const newCart = await CartStorage.create({
      items,
      isFreeDelivery,
      totalPrice,
      clientUserId: clientUser.id,
    });

    return newCart;
  } else {
    const cartItems = cart.items;

    const existingItem = cartItems.find(
      (item) => item.productid.toString() === product.id.toString()
    );

    if (existingItem) {
      if (existingItem.quantity < product.stockQuantity) {
        existingItem.quantity += 1;
      }
    } else {
      cartItems.push({
        productid: product._id,
        quantity: 1,
      });
    }

    const productIds = cart.items.map((item) => item.productid);
    const productsData = await Products.find({ _id: { $in: productIds } });
    const productMap = new Map(productsData.map((p) => [p._id.toString(), p]));

    let newTotal = 0;
    for (const item of cart.items) {
      const productData = productMap.get(item.productid.toString());
      if (productData) {
        newTotal += productData.price * item.quantity;
      }
    }

    cart.totalPrice = newTotal;
    cart.isFreeDelivery = newTotal >= 5000;

    await cart.save();
    return cart;
  }
};

const getCartService = async (id: GetCartType) => {
  const parsed = getCartSchema.safeParse(id);

  if (!parsed.success) {
    throw new ValidationError("Invalid cart id");
  }

  const idValue = parsed.data;

  let cart = await CartStorage.findById(idValue).populate("items.productid");

  if (!cart) {
    cart = await CartStorage.findOne({
      clientUserId: idValue,
      status: "pending",
    }).populate("items.productid");
  }

  return cart;
};

const addItemService = async (data: AddItemServiceType) => {
  const parsed = AddItemServiceSchema.safeParse(data);

  if (!parsed.success) {
    throw new ValidationError("Invalid data");
  }

  const cartStorage = await CartStorage.findById(parsed.data.cartId);
  const product = await Products.findById(parsed.data.productId);

  if (!cartStorage || !product) {
    throw new NotFoundError("Cart Storage or product not found!");
  }

  const cartItems = cartStorage.items;

  const existingItem = cartItems.find(
    (item) => item.productid.toString() === product.id.toString()
  );

  if (existingItem) {
    if (existingItem.quantity < product.stockQuantity) {
      existingItem.quantity += 1;
    }
  } else {
    cartItems.push({
      productid: product._id,
      quantity: 1,
    });
  }

  const productIds = cartStorage.items.map((item) => item.productid);
  const productsData = await Products.find({ _id: { $in: productIds } });
  const productMap = new Map(productsData.map((p) => [p._id.toString(), p]));

  let newTotal = 0;
  for (const item of cartStorage.items) {
    const productData = productMap.get(item.productid.toString());
    if (productData) {
      newTotal += productData.price * item.quantity;
    }
  }

  cartStorage.totalPrice = newTotal;
  cartStorage.isFreeDelivery = newTotal >= 5000;

  await cartStorage.save();
  return cartStorage;
};

const addQuantiyService = async (data: AddItemServiceType) => {
  const parsed = AddItemServiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError("Invalid data");
  }
  const cartStorage = await CartStorage.findById(parsed.data.cartId);
  const product = await Products.findById(parsed.data.productId);
  console.log(cartStorage);
  if (!cartStorage || !product) {
    throw new NotFoundError("Cart Storage or product not found!");
  }

  const cartItems = cartStorage.items;

  const itemToAddQuantity = cartItems.find(
    (item) => item.productid.toString() === product.id.toString()
  );

  if (!itemToAddQuantity) {
    throw new NotFoundError("Product not found!");
  }

  const reservedStock = product.reservedStock.find(
    (stock) => stock.cartId === cartStorage.id
  );

  if (reservedStock) {
    const reservedQuantity = reservedStock.quantity;
    const availableStock = reservedQuantity + product.stockQuantity;

    if (itemToAddQuantity.quantity >= availableStock) {
      return {
        message: "You’ve added the maximum number of this item",
      };
    }
  } else {
    if (itemToAddQuantity.quantity >= product.stockQuantity) {
      return {
        message: "You’ve added the maximum number of this item",
      };
    }
  }

  itemToAddQuantity.quantity += 1;

  let newTotal = 0;
  for (const item of cartStorage.items) {
    const prod = await Products.findById(item.productid);
    if (prod) {
      newTotal += prod.price * item.quantity;
    }
  }
  cartStorage.totalPrice = newTotal;

  await cartStorage.save();
  return cartStorage;
};

const minusQuantityService = async (data: AddItemServiceType) => {
  const parsed = AddItemServiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError("Invalid data");
  }

  const cartStorage = await CartStorage.findById(parsed.data.cartId);
  const product = await Products.findById(parsed.data.productId);

  if (!cartStorage || !product) {
    throw new NotFoundError("Cart Storage or product not found!");
  }

  const cartItems = cartStorage.items;

  const itemToUpdate = cartItems.find(
    (item) => item.productid.toString() === product.id.toString()
  );

  if (!itemToUpdate) {
    throw new NotFoundError("Product not found in cart!");
  }

  if (itemToUpdate.quantity <= 1) {
    return {
      message: "Minimum quantity reached. You must have at least one item.",
    };
  }

  itemToUpdate.quantity -= 1;

  let newTotal = 0;
  for (const item of cartItems) {
    const prod = await Products.findById(item.productid);
    if (prod) {
      newTotal += prod.price * item.quantity;
    }
  }

  cartStorage.totalPrice = newTotal;

  await cartStorage.save();
  return cartStorage;
};

const removeItemService = async (data: AddItemServiceType) => {
  const parsed = AddItemServiceSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError("Invalid data");
  }

  const { cartId, productId } = parsed.data;
  console.log(cartId);
  const cartStorage = await CartStorage.findById(cartId);
  if (!cartStorage) {
    throw new NotFoundError("Cart Storage not found!");
  }

  const itemIndex = cartStorage.items.findIndex(
    (item) => item.productid.toString() === productId
  );

  if (itemIndex === -1) {
    throw new NotFoundError("Product not found in cart!");
  }

  // Remove item by index
  cartStorage.items.splice(itemIndex, 1);

  // Recalculate total price
  let newTotal = 0;
  for (const item of cartStorage.items) {
    const prod = await Products.findById(item.productid);
    if (prod) {
      newTotal += prod.price * item.quantity;
    }
  }

  cartStorage.totalPrice = newTotal;

  await cartStorage.save();
  return cartStorage;
};

export default {
  createCartService,
  getCartService,
  addItemService,
  addQuantiyService,
  minusQuantityService,
  removeItemService,
  createClientUserCartService,
};
