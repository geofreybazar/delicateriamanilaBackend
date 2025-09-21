import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import { setupSocket } from "./config/socket";
import config from "./config/config";
import connectToDB from "./config/connectToDb";
import upload from "./config/multer";
import { stockRelease } from "./config/cronJob";

import unknownEndpoint from "./middlewares/unknownEndpoint";
import { errorHandler } from "./middlewares/errorHandler";

import AdminUserRouter from "./modules/adminUsers/routes";
import ProductsRouter from "./modules/products/routes";
import CollectionsRouter from "./modules/collections/routes";
import CheckoutSessionRouter from "./modules/checkoutSession/routes";
import OrdersRouter from "./modules/orders/routes";
import WebhookRouter from "./modules/webhook/routes";
import CartStorageRouter from "./modules/cartStorage/route";
import ClienUserRouter from "./modules/clientUsers/routes";
import StaffActivityRouter from "./modules/staffActivityLog/routes";
import DeliveryLogsRouter from "./modules/deliveryLog/routes";
import StoreSettingsRouter from "./modules/storeSettings/routes";

import { resolve } from "path";

const MONGO_URI = config.MONGO_URI;
const app = express();

connectToDB(MONGO_URI);
stockRelease();

morgan.token("body", function (req: express.Request) {
  return JSON.stringify(req.body);
});

app.use(cors());

// socket io connection
const httpServer = createServer(app);
setupSocket(httpServer);

app.use(morgan(":method :url :status :body"));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(resolve("dist/public")));

app.use("/adminuser_api", upload.array("image"), AdminUserRouter);
app.use("/product_api", upload.array("image"), ProductsRouter);
app.use("/collection_api", upload.single("image"), CollectionsRouter);
app.use("/checkoutsession_api", CheckoutSessionRouter);
app.use("/order_api", upload.single("image"), OrdersRouter);
app.use("/webhook_api", WebhookRouter);
app.use("/cart_api", CartStorageRouter);
app.use("/clientuser_api", ClienUserRouter);
app.use("/staffactivity_api", StaffActivityRouter);
app.use("/deliverylogs_api", DeliveryLogsRouter);
app.use("/storesettings_api", StoreSettingsRouter);

try {
  app.get(/.*/, (_, res) => {
    res.sendFile(resolve("dist/public/index.html"));
  });
} catch (err) {
  console.error("app.get('*') route failed to register:", err);
}

app.use(unknownEndpoint);
app.use(errorHandler);

export default { app, httpServer };
