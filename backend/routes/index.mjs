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

app.get("/tmp/poem", (req, res) => {
    console.log("Poem route was accessed!");
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
    res.send(randomQuote);
});

// Start server on port
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});