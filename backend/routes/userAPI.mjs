// Updated backend/routes/userAPI.mjs - Basic User Authentication

import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.mjs";
import HTTP_CODES from "../utils/httpCodes.mjs";

const userRouter = express.Router();

// Register a new user
userRouter.post("/register", async (req, res) => {
try {
const { username, password } = req.body;
if (!username || !password) {
return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Username and password required." });
}

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);

    res.status(HTTP_CODES.SUCCESS.CREATED).json({ message: "User registered successfully!" });
} catch (error) {
    console.error("Error registering user:", error);
    res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to register user." });
}

});

// User login
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

// Get current user session
userRouter.get("/session", (req, res) => {
if (!req.session.userId) {
return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: "Not logged in." });
}
res.status(HTTP_CODES.SUCCESS.OK).json({ userId: req.session.userId });
});

// Logout user
userRouter.post("/logout", (req, res) => {
req.session.destroy(err => {
if (err) {
return res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to log out." });
}
res.status(HTTP_CODES.SUCCESS.OK).json({ message: "Logged out successfully." });
});
});

export default userRouter;