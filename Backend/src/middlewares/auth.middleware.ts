import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type UserRole = "admin" | "seller" | "viewer";

export interface AuthTokenPayload {
    userId: number;
    role: UserRole;
    iat?: number;
    exp?: number;
}

// Extiende Request para tener req.user
export interface AuthenticatedRequest extends Request {
    user?: AuthTokenPayload;
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    // Espera: "Bearer <token>"
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Unauthorized: invalid token format" });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
        req.user = decoded;
        return next();
    } catch {
        return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
    }
};