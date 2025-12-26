// En este archivo se busca el usuario en la BD, valida contraseña y genera el token.

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../../config/db";
import { env } from "../../config/env";

export type UserRole = "admin" | "seller" | "viewer";

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

export interface LoginResult {
    token: string;
    user: AuthUser;
}

export class AuthService {
    static async login(email: string, password: string): Promise<LoginResult>{
        const { rows } = await query(
            "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
            [email]
        );

        const user = rows[0];
        if (!user) {
            throw new Error("Credenciales inválidas");
        }

        // Comparar contraseña con bcrypt
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error("Credenciales inválidas");
        }

        // Payload del token
        const payload = {
            userId: user.id,
            role: user.role as UserRole,
        };

        // Firmar JWT
        const token = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: "8h",
        });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}