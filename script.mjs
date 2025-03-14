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
        store: new FileStore({
            path: "./sessions",
            retries: 0,
            ttl: 3600,
            reapInterval: 600,
            fallbackSessionFn: () => ({})
        }),
        secret: "supersecretkey",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 1000 * 60 * 60 }
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

app.get("/tmp/poem", (req, res) => {
    console.log("Poem route was accessed!"); // Debugging
    const poem = `
        Roses are red,
        Violets are blue,
        These poems are so cheesy,
        and I think you're grate too.
    `;
    res.type("text/plain").send(poem);
});

app.get("/tmp/quote", (req, res) => {
    const quotes = [
        "Now and then we had a hope that if we lived and were good, God would permit us to be pirates. - Mark Twain",
        "It's more fun to be a pirate than to join the navy. - Steve Jobs",
        "When a pirate grows rich enough, they make him a prince. - George R R Martin",
        "Merchant and pirate were for a long period one and the same person. - Friedrich Nietzsche",
        "There is more treasure in books than in all the pirate's loot on Treasure Island. - Walt Disney"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.type("text/plain").send(randomQuote);
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