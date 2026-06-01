import type { PostWhereInput } from "@/generated/prisma/models";
import type { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string,
) => {
  const result = await prisma.post.create({
    data: { ...data, authorId: userId },
  });
  return result;
};

// getPost

const getAllPost = async (payload: {
  search?: string | undefined;
  tags?: string[] | [];
}) => {
  const { search, tags } = payload;

  const andCondition: PostWhereInput[] = [];

  if (search) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: payload.search as string,
          },
        },
      ],
    });
  }

  if (tags && tags.length > 0) {
    andCondition.push({
      tags: {
        hasEvery: tags as string[],
      },
    });
  }

  const allPost = await prisma.post.findMany({
    where: {
      AND: andCondition,
    },
  });
  return allPost;
};

export const PostService = {
  createPost,
  getAllPost,
};
