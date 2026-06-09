import type { Request, Response } from "express";
import { CommentSercive } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const result = await CommentSercive.createComment();
    res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: result
    });
  } catch (error: any) {
    res.status(400).json({
      error: "comment creation failed",
      message: error.message,
    });
  }
};

export const CommentController = {
    createComment
}
