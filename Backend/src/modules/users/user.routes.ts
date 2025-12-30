import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";

export const userRouter = Router();

// Todo users está protegido y SOLO admin
userRouter.use(authMiddleware, requireRole(["admin"]));

userRouter.get("/", UserController.list);
userRouter.get("/:id", UserController.getById);
userRouter.post("/", UserController.create);
userRouter.put("/:id", UserController.update);
userRouter.delete("/:id", UserController.remove);