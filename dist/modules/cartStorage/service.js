"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../products/model"));
const validation_1 = require("./validation");
const ValidationError_1 = require("../../config/ValidationError");
const NotFoundError_1 = require("../../config/NotFoundError");
const model_3 = __importDefault(require("../clientUsers/model"));
const createCartService = async (id) => {
    const parsed = validation_1.CreateCartServiceSchema.safeParse(id);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Product id");
    }
    const product = await model_2.default.findById(parsed.data);
    if (!product) {
        throw new NotFoundError_1.NotFoundError("Invalid Product id");
    }
    const totalPrice = product.price;
    const items = {
        productid: product.id,
        quantity: 1,
    };
    const isFreeDelivery = product.price >= 5000;
    const newCart = await model_1.default.create({
        items,
        isFreeDelivery,
        totalPrice,
    });
    return newCart;
};
const createClientUserCartService = async (body) => {
    const parsed = validation_1.CreateClientUserCartSchema.safeParse(body);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid Product or Client User id");
    }
    const [clientUser, product] = await Promise.all([
        model_3.default.findById(parsed.data.userId),
        model_2.default.findById(parsed.data.productId),
    ]);
    if (!clientUser || !product) {
        throw new NotFoundError_1.NotFoundError("Client User or Product was not found.");
    }
    const cart = await model_1.default.findOne({
        clientUserId: clientUser.id,
        status: "pending",
    });
    if (!cart) {
        const totalPrice = product.price;
        const items = [{ productid: product._id, quantity: 1 }];
        const isFreeDelivery = product.price >= 5000;
        const newCart = await model_1.default.create({
            items,
            isFreeDelivery,
            totalPrice,
            clientUserId: clientUser.id,
        });
        return newCart;
    }
    else {
        const cartItems = cart.items;
        const existingItem = cartItems.find((item) => item.productid.toString() === product.id.toString());
        if (existingItem) {
            if (existingItem.quantity < product.stockQuantity) {
                existingItem.quantity += 1;
            }
        }
        else {
            cartItems.push({
                productid: product._id,
                quantity: 1,
            });
        }
        const productIds = cart.items.map((item) => item.productid);
        const productsData = await model_2.default.find({ _id: { $in: productIds } });
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
const getCartService = async (id) => {
    const parsed = validation_1.getCartSchema.safeParse(id);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid cart id");
    }
    const idValue = parsed.data;
    let cart = await model_1.default.findById(idValue).populate("items.productid");
    if (!cart) {
        cart = await model_1.default.findOne({
            clientUserId: idValue,
            status: "pending",
        }).populate("items.productid");
    }
    return cart;
};
const addItemService = async (data) => {
    const parsed = validation_1.AddItemServiceSchema.safeParse(data);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid data");
    }
    const cartStorage = await model_1.default.findById(parsed.data.cartId);
    const product = await model_2.default.findById(parsed.data.productId);
    if (!cartStorage || !product) {
        throw new NotFoundError_1.NotFoundError("Cart Storage or product not found!");
    }
    const cartItems = cartStorage.items;
    const existingItem = cartItems.find((item) => item.productid.toString() === product.id.toString());
    if (existingItem) {
        if (existingItem.quantity < product.stockQuantity) {
            existingItem.quantity += 1;
        }
    }
    else {
        cartItems.push({
            productid: product._id,
            quantity: 1,
        });
    }
    const productIds = cartStorage.items.map((item) => item.productid);
    const productsData = await model_2.default.find({ _id: { $in: productIds } });
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
const addQuantiyService = async (data) => {
    const parsed = validation_1.AddItemServiceSchema.safeParse(data);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid data");
    }
    const cartStorage = await model_1.default.findById(parsed.data.cartId);
    const product = await model_2.default.findById(parsed.data.productId);
    console.log(cartStorage);
    if (!cartStorage || !product) {
        throw new NotFoundError_1.NotFoundError("Cart Storage or product not found!");
    }
    const cartItems = cartStorage.items;
    const itemToAddQuantity = cartItems.find((item) => item.productid.toString() === product.id.toString());
    if (!itemToAddQuantity) {
        throw new NotFoundError_1.NotFoundError("Product not found!");
    }
    const reservedStock = product.reservedStock.find((stock) => stock.cartId === cartStorage.id);
    if (reservedStock) {
        const reservedQuantity = reservedStock.quantity;
        const availableStock = reservedQuantity + product.stockQuantity;
        if (itemToAddQuantity.quantity >= availableStock) {
            return {
                message: "You’ve added the maximum number of this item",
            };
        }
    }
    else {
        if (itemToAddQuantity.quantity >= product.stockQuantity) {
            return {
                message: "You’ve added the maximum number of this item",
            };
        }
    }
    itemToAddQuantity.quantity += 1;
    let newTotal = 0;
    for (const item of cartStorage.items) {
        const prod = await model_2.default.findById(item.productid);
        if (prod) {
            newTotal += prod.price * item.quantity;
        }
    }
    cartStorage.totalPrice = newTotal;
    await cartStorage.save();
    return cartStorage;
};
const minusQuantityService = async (data) => {
    const parsed = validation_1.AddItemServiceSchema.safeParse(data);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid data");
    }
    const cartStorage = await model_1.default.findById(parsed.data.cartId);
    const product = await model_2.default.findById(parsed.data.productId);
    if (!cartStorage || !product) {
        throw new NotFoundError_1.NotFoundError("Cart Storage or product not found!");
    }
    const cartItems = cartStorage.items;
    const itemToUpdate = cartItems.find((item) => item.productid.toString() === product.id.toString());
    if (!itemToUpdate) {
        throw new NotFoundError_1.NotFoundError("Product not found in cart!");
    }
    if (itemToUpdate.quantity <= 1) {
        return {
            message: "Minimum quantity reached. You must have at least one item.",
        };
    }
    itemToUpdate.quantity -= 1;
    let newTotal = 0;
    for (const item of cartItems) {
        const prod = await model_2.default.findById(item.productid);
        if (prod) {
            newTotal += prod.price * item.quantity;
        }
    }
    cartStorage.totalPrice = newTotal;
    await cartStorage.save();
    return cartStorage;
};
const removeItemService = async (data) => {
    const parsed = validation_1.AddItemServiceSchema.safeParse(data);
    if (!parsed.success) {
        throw new ValidationError_1.ValidationError("Invalid data");
    }
    const { cartId, productId } = parsed.data;
    const cartStorage = await model_1.default.findById(cartId);
    if (!cartStorage) {
        throw new NotFoundError_1.NotFoundError("Cart Storage not found!");
    }
    const itemIndex = cartStorage.items.findIndex((item) => item.productid.toString() === productId);
    if (itemIndex === -1) {
        throw new NotFoundError_1.NotFoundError("Product not found in cart!");
    }
    // Remove item by index
    cartStorage.items.splice(itemIndex, 1);
    // Recalculate total price
    const productIds = cartStorage.items.map((i) => i.productid);
    const products = await model_2.default.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    cartStorage.totalPrice = cartStorage.items.reduce((sum, item) => {
        const prod = productMap.get(item.productid.toString());
        return prod ? sum + prod.price * item.quantity : sum;
    }, 0);
    await cartStorage.save();
    // Restore stock
    const product = await model_2.default.findById(productId);
    if (!product)
        throw new NotFoundError_1.NotFoundError("Product not found");
    const reservedStockIndex = product.reservedStock.findIndex((rs) => rs.cartId === cartId);
    if (reservedStockIndex !== -1) {
        const reservedStock = product.reservedStock[reservedStockIndex];
        product.stockQuantity += reservedStock.quantity;
        product.reservedStock.splice(reservedStockIndex, 1); // remove entry instead of zeroing
        await product.save();
    }
    return cartStorage;
};
exports.default = {
    createCartService,
    getCartService,
    addItemService,
    addQuantiyService,
    minusQuantityService,
    removeItemService,
    createClientUserCartService,
};
