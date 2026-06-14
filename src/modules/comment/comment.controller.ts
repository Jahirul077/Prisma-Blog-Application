import type { Request, Response } from "express";
import { CommentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.authorId = user?.id;
    const result = await CommentService.createComment(req.body);
    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      error: "comment creation failed",
      message: error.message,
    });
  }
};

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await CommentService.getCommentById(commentId as string);
    res.status(200).json({
      success: true,
      message: "Comment fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      error: "comment fetched failed",
      details: error.message,
    });
  }
};

const getCommentsByAuthorId = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await CommentService.getCommentsByAuthorId(
      authorId as string,
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: "comment fetched by author failed",
      details: error.message,
    });
  }
};

const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { commentId } = req.params;
    const result = await CommentService.deleteComment(
      commentId as string,
      user?.id as string,
    );
    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      error: "comment delete failed",
      details: error.message,
    });
  }
};

const updateComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { commentId } = req.params;

    const result = await CommentService.updateComment(
      commentId as string,
      req.body,
      user?.id as string,
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: "comment update failed",
      details: error.message,
    });
  }
};

// ==================moderate===================

const moderateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await CommentService.moderateComment(
      commentId as string,
      req.body,
    );
    res.status(200).json(result);
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "comment moderation failed";
    res.status(409).json({
      error: errorMessage,
    });
  }
};

export const CommentController = {
  createComment,
  getCommentById,
  getCommentsByAuthorId,
  deleteComment,
  updateComment,
  moderateComment,
};
