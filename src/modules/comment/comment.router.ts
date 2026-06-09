import express, { Router } from "express";
import { CommentController } from "./comment.controller";

const router = express.Router();

router.post("/", CommentController.createComment);

export const commentRouter: Router = router;
