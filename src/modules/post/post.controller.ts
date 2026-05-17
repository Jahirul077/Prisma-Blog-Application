import { PostService } from "./post.service";
import type { Request, Response } from "express";

const createPost = async (req: Request, res: Response) => {
  try {
    const result = await PostService.createPost(req.body);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "post creation failed",
      details: error,
    });
  }
};

export const PostController = {
  createPost,
};
