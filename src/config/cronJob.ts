import cron from "node-cron";
import mongoose from "mongoose";
import CheckoutSession from "../modules/checkoutSession/model";
import Products from "../modules/products/model";
import { revalidateTag } from "./revalidateTag";
import { NotFoundError } from "./NotFoundError";

export const stockRelease = () => {
  cron.schedule("*/15 * * * *", async () => {
    console.log("Running stock release cron job...");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const now = new Date();

      const checkoutSessions = await CheckoutSession.find({
        status: "pending",
        expiresAt: { $lt: now },
      }).session(session); // bind query to transaction

      for (const checkoutSession of checkoutSessions) {
        const cartId = checkoutSession.cartId;
        const items = checkoutSession.items;

        for (const item of items) {
          const product = await Products.findById(item.productId).session(
            session
          );
          if (!product) throw new NotFoundError("Product not found");

          const reservedStock = product.reservedStock.find(
            (prod) => prod.cartId === cartId
          );

          if (!reservedStock)
            throw new NotFoundError("Reserved stock not found");

          product.stockQuantity += reservedStock.quantity;
          reservedStock.quantity = 0;

          await product.save({ session });
        }

        checkoutSession.status = "expired";
        await checkoutSession.save({ session });
      }

      await session.commitTransaction();
      console.log("Stock released successfully.");
      await revalidateTag("products");
    } catch (error) {
      console.error("Stock release failed:", error);
      await session.abortTransaction(); // rollback
    } finally {
      session.endSession(); // cleanup
    }
  });
};
