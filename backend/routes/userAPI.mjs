import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.mjs";
import HTTP_CODES from "../utils/httpCodes.mjs";

const userRouter = express.Router();

// Register
userRouter.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Username and password required." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (username, password, credits) VALUES ($1, $2, 10000)", [username, hashedPassword]);

        res.status(HTTP_CODES.SUCCESS.CREATED).json({ message: "User registered successfully!" });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Username already exists. Choose another!" });
        }
        console.error("Error registering user:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to register user." });
    }
});

// Login
userRouter.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Username and password required." });
        }

        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: "Invalid credentials." });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: "Invalid credentials." });
        }

        req.session.userId = user.id;
        res.status(HTTP_CODES.SUCCESS.OK).json({ message: "Login successful!" });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to log in." });
    }
});

userRouter.get("/session", async (req, res) => {
    if (!req.session.userId) {
        return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: "Not logged in." });
    }

    try {
        const result = await pool.query("SELECT username, credits FROM users WHERE id = $1", [req.session.userId]);
        if (result.rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "User not found." });
        }

        const user = result.rows[0];
        res.status(HTTP_CODES.SUCCESS.OK).json({ username: user.username, credits: user.credits });
    } catch (error) {
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch user profile." });
    }
});

// Logout
userRouter.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to log out." });
        }
        res.status(HTTP_CODES.SUCCESS.OK).json({ message: "Logged out successfully." });
    });
});

export default userRouter;