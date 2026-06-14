import type { CommentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

// ----------------------------------------

const createComment = async (payload: {
  content: string;
  postId: string;
  authorId: string;
  parentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });

  if (payload.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }

  return await prisma.comment.create({
    data: payload,
  });
};

// ----------------------------------------

const getCommentById = async (commentId: string) => {
  return await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });
};

// ----------------------------------------

const getCommentsByAuthorId = async (authorId: string) => {
  return await prisma.comment.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

// ----------------------------------------

// 1. nijer comment delete korte parbo,
// 2. login thkate hoibo
// 3. tar nijer comment ki ta dekhte hobe.

const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("comment not found");
  }

  return await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
};

// ----------------------------------------

const updateComment = async (
  commentId: string,
  data: { content?: string; status?: CommentStatus },
  authorId: string,
) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("comment not found");
  }

  return await prisma.comment.update({
    where: {
      id: commentId,
    },
    data,
  });
};

export const CommentService = {
  createComment,
  getCommentById,
  getCommentsByAuthorId,
  deleteComment,
  updateComment,
};
