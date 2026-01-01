import { Router } from "express";
import { ProductController } from "./product.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/rbac.middleware";

export const productRouter = Router();

// Todos requieren estar autenticados
productRouter.use(authMiddleware);

// GET: cualquier rol
productRouter.get("/", ProductController.list);
productRouter.get("/:id", ProductController.getById);

// POST/PUT: admin y seller
productRouter.post("/", requireRole(["admin", "seller"]), ProductController.create);
productRouter.put("/:id", requireRole(["admin", "seller"]), ProductController.update);

// DELETE: solo admin
productRouter.delete("/:id", requireRole(["admin"]), ProductController.remove);