// import cron from "node-cron";
// import CheckoutSession from "../modules/checkoutSession/model";
// import Products from "../modules/products/model";
// import { revalidateTag } from "./revalidateTag";

// export const stockRelease = () => {
//   const now = new Date();
//   cron.schedule("*/15 * * * *", async () => {
//     console.log("Running stock release cron job...");
//     const sessions = await CheckoutSession.find({
//       status: "pending",
//       expiresAt: { $lt: now },
//     });

//     if (sessions.length > 0) {
//       for (const session of sessions) {
//         const items = session.items;
//         for (const item of items) {
//           const product = await Products.findById(item.productId);
//           if (product) {
//             product.stockQuantity += item.quantity;
//             product.reservedStock -= item.quantity;
//             await product.save();
//           }
//         }
//         session.status = "expired";
//         await revalidateTag("products");
//         await session.save();
//       }
//     }
//   });
// };
