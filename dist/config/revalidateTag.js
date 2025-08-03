"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidateTag = void 0;
const config_1 = __importDefault(require("./config"));
const revalidateTag = async (tag) => {
    const environment = config_1.default.NODE_ENV;
    let url;
    if (environment === "development") {
        url = "http://localhost:3000/";
    }
    else {
        url = "productionURL";
    }
    await fetch(`${url}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tag }),
    });
};
exports.revalidateTag = revalidateTag;
