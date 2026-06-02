import express from "express";
import { PostController } from "./post.controller";
import auth, { UserRole } from "@/middlewares/auth";

const router = express.Router();

// get all post
router.get("/", PostController.getAllPost);

//create post
router.post("/", auth(UserRole.USER), PostController.createPost);

export const postRouter = router;
