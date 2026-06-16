import type { PostWhereInput } from "@/generated/prisma/models";
import {
  CommentStatus,
  PostStatus,
  type Post,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { boolean } from "better-auth";
import { UserRole } from "@/middlewares/auth";

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

const getMyPosts = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
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
      authorId,
    },
  });

  return {
    data: result,
    total,
  };
};

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("you are Unauthorized");
  }

  if (!isAdmin) {
    delete data.isFeatured;
  }

  const result = await prisma.post.update({
    where: {
      id: postData.id,
    },
    data,
  });
  return result;
};

const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findFirstOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId === authorId) {
    throw new Error("You are not the owner/creator of this post.");
  }

  return prisma.post.delete({
    where: {
      id: postData.id,
    },
  });
};

// get stats for dashboard
const getStats = async () => {
  //postCount, publishedPosts, draftPosts, totalViews, totalComments, totalUser, adminCount, userCount
  return prisma.$transaction(async (tx) => {
    const [
      postCount,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComments,
      totalUser,
      adminCount,
      userCount,
      totalViews,
    ] = await Promise.all([
      await tx.post.count(),

      await tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),

      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),

      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),

      await tx.comment.count(),

      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),

      await tx.user.count(),

      await tx.user.count({
        where: {
          role: UserRole.ADMIN,
        },
      }),

      await tx.user.count({
        where: {
          role: UserRole.USER,
        },
      }),

      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      })
    ]);

    return {
      postCount,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      approvedComments,
      totalUser,
      adminCount,
      userCount,
      totalViews:totalViews._sum.views
    };
  });
};

export const PostService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats,
};
