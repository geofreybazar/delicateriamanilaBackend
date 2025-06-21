import { Request, Response } from "express";

export default function unknownEndpoint(_req: Request, res: Response) {
  res.status(404).send({ error: "unknown Endpoint" });
}
