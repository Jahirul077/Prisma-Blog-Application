import express from "express";
import { UserController } from "./user.controller";
import auth, { UserRole } from "@/middlewares/auth";

const router = express.Router();

router.get("/all-users", auth(UserRole.ADMIN), UserController.getAllUsers);

router.delete(
    "/:id",
    auth(UserRole.ADMIN),
    UserController.deleteUserById,
);


export const UserRouter = router;
