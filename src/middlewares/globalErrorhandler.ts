import { Prisma } from "@/generated/prisma/client";
import type { NextFunction, Request, Response } from "express";

export default function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let errMessage = "Internal server error";
  let errorDetails = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errMessage = "Bad request";
    errorDetails = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errMessage =
        "An operation failed because it depends on one or more records that were required but not found.";
      errorDetails = err;
    } else if (err.code === "P2003") {
      statusCode = 400;
      errMessage = "Missing required field value.";
      errorDetails = err;
    } else if (err.code === "P2002") {
      statusCode = 400;
      errMessage = "Record already exists.";
      errorDetails = err;
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errMessage =
      "The provided value for the column is too long for the column's type. Column: {column_name}";
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 400;
    errMessage = "An unexpected database error occurred. Please try again later.";
    errorDetails = err;
  }

  res.status(statusCode);
  res.json({
    message: errMessage,
    error: errorDetails,
  });
}
