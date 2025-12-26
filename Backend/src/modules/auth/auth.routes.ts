import { Router } from "express";
import { AuthController } from "./auth.controller";

export const authRouter = Router();

// POST /api/auth/login
authRouter.post("/login", AuthController.login);