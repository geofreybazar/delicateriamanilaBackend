"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = unknownEndpoint;
function unknownEndpoint(_req, res) {
    res.status(404).send({ error: "unknown Endpoint" });
}
