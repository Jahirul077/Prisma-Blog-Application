import { prisma } from "@/lib/prisma";

const getAllUsers = async () => {
  const data = await prisma.user.findMany();
  return data;
};

const deleteUserById = async (id: string) => {
  const data = await prisma.user.delete({
    where: {
      id,
    },
  });
  return data;
};

export const UserService = {
  getAllUsers,
  deleteUserById,
};
