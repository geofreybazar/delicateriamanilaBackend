import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";

import config from "./config/config";
import connectToDB from "./config/connectToDb";
import upload from "./config/multer";
import cookieParser from "cookie-parser";

import unknownEndpoint from "./middlewares/unknownEndpoint";
import { errorHandler } from "./middlewares/errorHandler";

import AdminUserRouter from "./modules/adminUsers/routes";

const MONGO_URI = config.MONGO_URI;
const app = express();

connectToDB(MONGO_URI);
morgan.token("body", function (req: express.Request) {
  return JSON.stringify(req.body);
});

app.use(cors());
app.use(morgan(":method :url :status :body"));
app.use(express.json());
app.use(cookieParser());

app.use(express.static("dist"));
// app.use(express.static(path.join(__dirname, "public")));

app.use("/adminuser_api", upload.array("image"), AdminUserRouter);

app.use(errorHandler);
app.use(unknownEndpoint);

export default app;
