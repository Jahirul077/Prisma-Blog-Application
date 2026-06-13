import type { PostWhereInput } from "@/generated/prisma/models";
import {
  CommentStatus,
  type Post,
  type PostStatus,
} from "../../../generated/prisma/client";
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
  isFeatured?: boolean | undefined;
  status?: PostStatus | undefined;
  authorId?: string | undefined;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const {
    search,
    tags,
    isFeatured,
    status,
    authorId,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  } = payload;

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
  if (typeof isFeatured == "boolean") {
    andCondition.push({
      isFeatured: isFeatured,
    });
  }

  //status------------------
  if (status) {
    andCondition.push({
      status: status,
    });
  }

  // authorId -------------------
  if (authorId) {
    andCondition.push({
      authorId: authorId,
    });
  }

  // pagination---------------------

  const allPost = await prisma.post.findMany({
    take: limit,
    skip: skip,
    where: {
      AND: andCondition,
    },
    orderBy: { [sortBy]: sortOrder },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    data: allPost,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// getPost by ID
const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const postData = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return postData;
  });
};

export const PostService = {
  createPost,
  getAllPost,
  getPostById,
};
