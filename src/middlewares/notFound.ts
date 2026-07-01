import type { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    message: "router not found!",
    path: req.originalUrl,
    date: new Date(),
  });
}