import express from "express";
import { pool } from "../infrastructure/database"

const app = express();
const port = Number(process.env.PORT ?? "3000");

app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({status: "OK"});
});

app.get("/db-health", async (_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ database: "OK" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ database: "ERROR" });
    }
});

app.listen(port, () => {
    console.log(`Minesweeper API listening on http://localhost:${port}`);
});