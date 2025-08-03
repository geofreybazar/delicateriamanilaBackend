"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectionSchema = exports.deleteCollectionSchema = exports.addCollectionSchema = void 0;
const zod_1 = require("zod");
exports.addCollectionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Collection name is required"),
    description: zod_1.z.string().min(1, "Collection description is required"),
});
exports.deleteCollectionSchema = zod_1.z.array(zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Invalid collection ID"));
exports.getCollectionSchema = zod_1.z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid collection ID");
