import { Request, Response } from "express";
import { UserService } from "./user.service";
import { Prisma } from "@/generated/prisma/client";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await UserService.getAllUsers();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "User Data not found",
      details: error,
    });
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await UserService.deleteUserById(id as string);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        success: false,
        message: "User already deleted or not found.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
      details: error,
    });
  }
};

export const UserController = {
  getAllUsers,
  deleteUserById,
};
