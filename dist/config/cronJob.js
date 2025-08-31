"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockRelease = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const mongoose_1 = __importDefault(require("mongoose"));
const model_1 = __importDefault(require("../modules/checkoutSession/model"));
const model_2 = __importDefault(require("../modules/products/model"));
const revalidateTag_1 = require("./revalidateTag");
const NotFoundError_1 = require("./NotFoundError");
const stockRelease = () => {
    node_cron_1.default.schedule("*/15 * * * *", async () => {
        console.log("Running stock release cron job...");
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const now = new Date();
            const checkoutSessions = await model_1.default.find({
                status: "pending",
                expiresAt: { $lt: now },
            }).session(session); // bind query to transaction
            for (const checkoutSession of checkoutSessions) {
                const cartId = checkoutSession.cartId;
                const items = checkoutSession.items;
                for (const item of items) {
                    const product = await model_2.default.findById(item.productId).session(session);
                    if (!product)
                        throw new NotFoundError_1.NotFoundError("Product not found");
                    const reservedStock = product.reservedStock.find((prod) => prod.cartId === cartId);
                    if (!reservedStock)
                        throw new NotFoundError_1.NotFoundError("Reserved stock not found");
                    product.stockQuantity += reservedStock.quantity;
                    reservedStock.quantity = 0;
                    await product.save({ session });
                }
                checkoutSession.status = "expired";
                await checkoutSession.save({ session });
            }
            await session.commitTransaction();
            console.log("Stock released successfully.");
            await (0, revalidateTag_1.revalidateTag)("products");
        }
        catch (error) {
            console.error("Stock release failed:", error);
            await session.abortTransaction(); // rollback
        }
        finally {
            session.endSession(); // cleanup
        }
    });
};
exports.stockRelease = stockRelease;
