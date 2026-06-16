import type { PostStatus } from "@/generated/prisma/enums";
import { PostService } from "./post.service";
import type { Request, Response } from "express";
import paginationSortingHelper from "@/helpers/Paginationsortinghelper";
import { UserRole } from "@/middlewares/auth";

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
    // search------------------------
    const { search } = req.query;

    const searchString = typeof search === "string" ? search : undefined;

    // tags---------------------------------------
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];

    // isFeatured----------------------------------
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined
      : undefined;

    // STATUS-------------------------
    const status = req.query.status as PostStatus | undefined;

    // authorId----------------------
    const authorId = req.query.authorId as string | undefined;

    const options = paginationSortingHelper(req.query);

    const { page, limit, skip, sortBy, sortOrder } = options;

    const result = await PostService.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "post creation failed",
      details: error,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    if (!postId || typeof postId !== "string") {
      throw new Error("post id is required and must be a string");
    }

    const result = await PostService.getPostById(postId);
    res.status(200).json({
      success: true,
      message: "Post retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve post",
      details: error.message || error,
    });
  }
};

const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("you are Unauthorized");
    }

    const result = await PostService.getMyPosts(user.id as string);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to my post",
      details: error.message || error,
    });
  }
};



const updatePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("you are Unauthorized");
    }

    const { postId } = req.params;
    const isAdmin = user.role === UserRole.ADMIN;
    console.log(user)
    const result = await PostService.updatePost(
      postId as string,
      req.body,
      user.id as string,
      isAdmin as boolean
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to Updated post",
      details: error.message || error,
    });
  }
};

export const PostController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
};
