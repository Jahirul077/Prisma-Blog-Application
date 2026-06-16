import express from "express";
import { PostController } from "./post.controller";
import auth, { UserRole } from "@/middlewares/auth";

const router = express.Router();

// get stats
router.get("/stats", PostController.getStats);

// get all post
router.get("/", PostController.getAllPost);

//create post
router.post("/", auth(UserRole.USER), PostController.createPost);

//get my post
router.get(
  "/myPosts",
  auth(UserRole.USER, UserRole.ADMIN),
  PostController.getMyPosts,
);

//create post
router.post("/", auth(UserRole.USER), PostController.createPost);

// get post by id
router.get("/:postId", PostController.getPostById);

// update post
router.patch(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  PostController.updatePost,
);

// delete post
router.delete(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  PostController.deletePost,
);

export const postRouter = router;
