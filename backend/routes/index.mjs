import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import blackjackRouter from "./blackjackAPI.mjs";
import userRouter from "./userAPI.mjs";
import hashmapRouter from "./hashmapAPI.mjs";
import HTTP_CODES from "./utils/httpCodes.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware !!
app.use(express.json());
app.use(express.static(path.join(__dirname, "../../public")));

app.use("/blackjack", blackjackRouter);
app.use("/user", userRouter);
app.use("/hashmap", hashmapRouter);

// Serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../public/index.html"));
});

// Start server on port
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});