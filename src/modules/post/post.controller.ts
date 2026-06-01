import { PostService } from "./post.service";
import type { Request, Response } from "express";

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized",
      });
    }
    const result = await PostService.createPost(req.body, user.id);
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

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const searchString = typeof search === "string" ? search : undefined

    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    const result = await PostService.getAllPost({ search: searchString, tags });
    res.status(200).json(result);
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
  getAllPost,
};
