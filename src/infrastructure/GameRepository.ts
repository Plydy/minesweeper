import type { RowDataPacket } from "mysql2";
import { Game } from "../domain/entities/Game";
import { pool } from "./database";

export class GameRepository {
    async save(id: string, game: Game): Promise<void> {
        const snapshot = game.serialize();

        await pool.execute(
            `INSERT INTO games (id, snapshot)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE snapshot = ?`,
            [id, snapshot, snapshot],
        );
    }

    async findById(id: string): Promise<Game | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            "SELECT snapshot FROM games WHERE id = ?",
            [id],
        );

        if (rows.length === 0) {
            return null;
        }

        const snapshot = rows[0]?.snapshot;

        if (snapshot === undefined) {
            return null;
        }

        const serialized =
            typeof snapshot === "string" ? snapshot : JSON.stringify(snapshot);

        return Game.deserialize(serialized);
    }
}