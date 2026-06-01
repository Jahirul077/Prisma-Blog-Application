import type { PostWhereInput } from "@/generated/prisma/models";
import type { Post } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { boolean } from "better-auth";

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
  isFeatured?: boolean;
}) => {
  const { search, tags, isFeatured } = payload;

  const andCondition: PostWhereInput[] = [];


  //search------------------------
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

  //tags---------------
  if (tags && tags.length > 0) {
    andCondition.push({
      tags: {
        hasEvery: tags as string[],
      },
    });
  }


  //isFeatured---------------
  if( typeof isFeatured == "boolean"){
    andCondition.push({
      isFeatured: isFeatured,
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
