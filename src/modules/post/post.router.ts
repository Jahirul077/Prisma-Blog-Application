import express from "express";
import { PostController } from "./post.controller";
import auth, { UserRole } from "@/middlewares/auth";

const router = express.Router();

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

router.post("/", auth(UserRole.USER), PostController.createPost);

router.get("/:postId", PostController.getPostById);

router.patch(
  "/:postId",
  auth(UserRole.USER, UserRole.ADMIN),
  PostController.updatePost,
);

export const postRouter = router;
