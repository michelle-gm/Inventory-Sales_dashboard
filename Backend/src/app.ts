import express from "express";
import cors from "cors";
import { query } from "./config/db";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta simple para probar que el servidor está funcionando
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

// Ruta para probar la conexión a la base de datos
app.get("/test-db", async (_, res) => {
    try {
        const result = await query("SELECT NOW()");
        res.json({
            message: "Database connection successful",
            server_time: result.rows[0],
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Database connection failed",
            error: error.message,
        });
    }
});

export { app };
