import { Request, Response } from "express";
import { ProductService } from "./product.service";

export class ProductController {
    static async list(req: Request, res: Response) {
        const products = await ProductService.list();
        return res.json(products);
    }

    static async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

        const product = await ProductService.getById(id);
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });

        return res.json(product);
    }

    static async create(req: Request, res: Response) {
        try {
            const created = await ProductService.create(req.body);
            return res.status(201).json(created);
        } catch (err: any) {
            return res.status(400).json({ message: err.message || "Error creando producto" });
        }
    }

    static async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

        try {
            const updated = await ProductService.update(id, req.body);
            return res.json(updated);
        } catch (err: any) {
            const msg = err.message || "Error actualizando producto";
            const status = msg.includes("no encontrado") ? 404 : 400;
            return res.status(status).json({ message: msg });
        }
    }

    static async remove(req: Request, res: Response) {
        const id = Number(req.params.id);
        if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

        try {
            await ProductService.remove(id);
            return res.status(204).send();
        } catch (err: any) {
            const msg = err.message || "Error eliminando producto";
            const status = msg.includes("no encontrado") ? 404 : 400;
            return res.status(status).json({ message: msg });
        }
    }
}