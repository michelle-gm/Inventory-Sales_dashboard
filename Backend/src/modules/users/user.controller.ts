import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
    static async list(req: Request, res: Response) {
        const users = await UserService.list();
        return res.json(users);
    }

    static async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const user = await UserService.getById(id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        return res.json(user);
    }

    static async create(req: Request, res: Response) {
        try {
            const created = await UserService.create(req.body);
            return res.status(201).json(created);
        } catch (err: any) {
            return res.status(400).json({ message: err.message || "Error creando usuario" });
        }
    }

    static async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        try {
            const updated = await UserService.update(id, req.body);
            return res.json(updated);
        } catch (err: any) {
            const msg = err.message || "Error actualizando usuario";
            const status = msg.includes("no encontrado") ? 404 : 400;
            return res.status(status).json({ message: msg });
        }
    }

    static async remove(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        try {
            await UserService.remove(id);
            return res.status(204).send();
        } catch (err: any) {
            const msg = err.message || "Error eliminando usuario";
            const status = msg.includes("no encontrado") ? 404 : 400;
            return res.status(status).json({ message: msg });
        }
    }
}
