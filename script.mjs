import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import fileStoreFactory from "session-file-store";
import blackjackRouter from "./backend/routes/blackjackAPI.mjs";
import userRouter from "./backend/routes/userAPI.mjs";
import hashmapRouter from "./backend/routes/hashmapAPI.mjs";
import HTTP_CODES from "./backend/utils/httpCodes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 8000;
const FileStore = fileStoreFactory(session);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        store: new FileStore({ path: "./sessions" }),
        secret: "supersecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);
app.use(express.static(path.join(__dirname, "public")));

app.use("/blackjack", blackjackRouter);
app.use("/user", userRouter);
app.use("/hashmap", hashmapRouter);

// index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Errors
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});