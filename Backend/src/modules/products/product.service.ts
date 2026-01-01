import { query } from "../../config/db";

export interface CreateProductInput {
    name: string;
    sku: string;
    price: number;
    stock: number;
}

export interface UpdateProductInput {
    name?: string;
    sku?: string;
    price?: number;
    stock?: number;
}

export class ProductService {
    static async list() {
        const { rows } = await query(
            `SELECT id, name, sku, price, stock, created_at
             FROM products
             ORDER BY id DESC`
        );
        return rows;
    }

    static async getById(id: number) {
        const { rows } = await query(
            `SELECT id, name, sku, price, stock, created_at
             FROM products
             WHERE id = $1`,
            [id]
        );
        return rows[0] || null;
    }

    static async create(data: CreateProductInput){
        // Validaciones mínimas
        const name = data.name?.trim();
        const sku = data.sku?.trim();

        if (!name || !sku) throw new Error("name y sku son requeridos");
        if (typeof data.price !== "number" || data.price < 0) {
            throw new Error("price debe ser un número >= 0");
        }
        if (!Number.isInteger(data.stock) || data.stock < 0) {
            throw new Error("stock debe ser un entero >= 0");
        }

        try {
            const { rows } = await query(
                `INSERT INTO products (name, sku, price, stock)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, name, sku, price, stock, created_at`,
                [name, sku, data.price, data.stock]
            );
            return rows[0];
        } catch (err: any) {
            // unique violation
            if (err?.code === "23505") {
                throw new Error("Ya existe un producto con ese SKU");
            }
            throw err;
        }
    }

    static async update(id: number, data: UpdateProductInput){
        const existing = await ProductService.getById(id);
        if (!existing) throw new Error("Producto no encontrado");

        // Validar campos si vienen
        if (data.price !== undefined) {
            if (typeof data.price !== "number" || data.price < 0) {
                throw new Error("price debe ser un número >= 0");
            }
        }
        if (data.stock !== undefined) {
            if (!Number.isInteger(data.stock) || data.stock < 0) {
                throw new Error("stock debe ser un entero >= 0");
            }
        }

        const name = data.name !== undefined ? data.name.trim() : null;
        const sku = data.sku !== undefined ? data.sku.trim() : null;

        try {
            const { rows } = await query(
                `UPDATE products
                 SET name = COALESCE($1, name),
                 sku = COALESCE($2, sku),
                 price = COALESCE($3, price),
                 stock = COALESCE($4, stock)
                 WHERE id = $5
                 RETURNING id, name, sku, price, stock, created_at`,
                [
                    name && name.length ? name : null,
                    sku && sku.length ? sku : null,
                    data.price ?? null,
                    data.stock ?? null,
                    id,
                ]
            );
            return rows[0];
        } catch (err: any) {
            if (err?.code === "23505") {
                throw new Error("Ya existe un producto con ese SKU");
            }
            throw err;
        }
    }

    static async remove(id: number) {
        const existing = await ProductService.getById(id);
        if (!existing) throw new Error("Producto no encontrado");

        await query(`DELETE FROM products WHERE id = $1`, [id]);
        return true;
    }
}