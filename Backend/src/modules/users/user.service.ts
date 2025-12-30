import bcrypt from "bcryptjs";
import { query } from "../../config/db";
import { UserRole } from "../../middlewares/auth.middleware";

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserInput {
    name?: string;
    role?: UserRole;
    password?: string; // opcional: si quieres resetear clave
}

export class UserService {
    static async list() {
        const { rows } = await query(
            `SELECT id, name, email, role, created_at
             FROM users
             ORDER BY id DESC`
        );
        return rows;
    }

    static async getById(id: number) {
        const { rows } = await query(
            `SELECT id, name, email, role, created_at
             FROM users
             WHERE id = $1`,
            [id]
        );
        return rows[0] || null;
    }

    static async create(data: CreateUserInput) {
        // Validaciones mínimas
        if (!data.name || !data.email || !data.password || !data.role) {
            throw new Error("name, email, password, role son requeridos");
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        try {
            const { rows } = await query(
                `INSERT INTO users (name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, name, email, role, created_at`,
                [data.name, data.email.toLowerCase().trim(), passwordHash, data.role]
            );
            return rows[0];
        } catch (err: any) {
            // Neon/Postgres: unique violation = 23505
            if (err?.code === "23505") {
                throw new Error("Ya existe un usuario con ese email");
            }
            throw err;
        }
    }

    static async update(id: number, data: UpdateUserInput){
        const existing = await UserService.getById(id);
        if (!existing) throw new Error("Usuario no encontrado");

        // Si viene password, la actualizamos
        let newHash: string | null = null;
        if (typeof data.password === "string" && data.password.length > 0) {
            newHash = await bcrypt.hash(data.password, 10);
        }

        const { rows } = await query(
            `UPDATE users
             SET name = COALESCE($1, name),
             role = COALESCE($2, role),
             password_hash = COALESCE($3, password_hash)
             WHERE id = $4
             RETURNING id, name, email, role, created_at`,
            [data.name ?? null, data.role ?? null, newHash, id]
        );

        return rows[0];
    }

    static async remove(id: number) {
        const existing = await UserService.getById(id);
        if (!existing) throw new Error("Usuario no encontrado");

        await query(`DELETE FROM users WHERE id = $1`, [id]);
        return true;
    }
}