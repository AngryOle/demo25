import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://your-local-user:your-local-password@localhost:5432/your-local-db",
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, 
});

export async function saveBlackjackSession(userId, gameState) {
    const query = `INSERT INTO blackjack_sessions (user_id, game_state) VALUES ($1, $2) RETURNING id`;
    const values = [userId, gameState];
    const result = await pool.query(query, values);
    return result.rows[0].id;
}

export async function getBlackjackSession(sessionId) {
    const query = `SELECT * FROM blackjack_sessions WHERE id = $1`;
    const result = await pool.query(query, [sessionId]);
    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function updateBlackjackSession(sessionId, gameState) {
    const query = `UPDATE blackjack_sessions SET game_state = $1 WHERE id = $2`;
    await pool.query(query, [gameState, sessionId]);
}