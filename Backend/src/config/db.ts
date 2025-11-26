import { Pool } from "pg"
import { env } from "./env";

// Crear pool de conexión usando la cadena de conexión de Neon/PostgreSQL
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

// Helper para ejecutar queries más fácil
export const query = (text: string, params?: any[]) => {
    return pool.query(text, params);
};