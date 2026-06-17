import express, { type Application } from "express";
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { commentRouter } from "./modules/comment/comment.router";
import globalErrorHandler from "./middlewares/globalErrorhandler";
import { notFound } from "./middlewares/notFound";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:4000",
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/posts", postRouter);


app.use("/comments", commentRouter);

app.get("/", (req, res) => {
  res.send("Hello World from Prisma Blog Application");
});

app.use(notFound)
app.use(globalErrorHandler)


export default app;
