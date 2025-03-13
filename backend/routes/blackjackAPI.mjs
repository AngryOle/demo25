import express from "express";
import { pool } from "../db.mjs";
import HTTP_CODES from "../utils/httpCodes.mjs";

const blackjackRouter = express.Router();

// Start a new Blackjack game
blackjackRouter.post("/start", async (req, res) => {
    try {
        const gameState = {
            playerCards: [drawCard(), drawCard()],
            dealerCards: [drawCard()],
            gameOver: false,
            message: "Game started! Draw your first card."
        };

        const result = await pool.query(
            "INSERT INTO blackjack_sessions (user_id, game_state) VALUES ($1, $2) RETURNING id",
            [req.session.userId || null, JSON.stringify(gameState)]
        );

        res.status(HTTP_CODES.SUCCESS.CREATED).json({ sessionId: result.rows[0].id, gameState });
    } catch (error) {
        console.error("Error starting Blackjack game:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to start game." });
    }
});

// Player draws a card (Hit)
blackjackRouter.put("/play/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await pool.query("SELECT game_state FROM blackjack_sessions WHERE id = $1", [sessionId]);

        if (result.rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "Game session not found." });
        }

        let gameState = result.rows[0].game_state;
        if (gameState.gameOver) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Game is already over." });
        }

        gameState.playerCards.push(drawCard());

        // Check if the player busted (total over 21)
        if (calculateTotal(gameState.playerCards) > 21) {
            gameState.gameOver = true;
            gameState.message = "You busted! Dealer wins.";
        } else {
            gameState.message = "You drew a card.";
        }

        await pool.query("UPDATE blackjack_sessions SET game_state = $1 WHERE id = $2", [JSON.stringify(gameState), sessionId]);

        res.status(HTTP_CODES.SUCCESS.OK).json(gameState);
    } catch (error) {
        console.error("Error playing Blackjack:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to play game." });
    }
});

// Player stands (Dealer plays)
blackjackRouter.put("/stand/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await pool.query("SELECT game_state FROM blackjack_sessions WHERE id = $1", [sessionId]);

        if (result.rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "Game session not found." });
        }

        let gameState = result.rows[0].game_state;
        if (gameState.gameOver) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Game is already over." });
        }

        // Dealer keeps drawing until 17+
        while (calculateTotal(gameState.dealerCards) < 17) {
            gameState.dealerCards.push(drawCard());
        }

        const playerTotal = calculateTotal(gameState.playerCards);
        const dealerTotal = calculateTotal(gameState.dealerCards);

        gameState.gameOver = true;
        if (dealerTotal > 21 || playerTotal > dealerTotal) {
            gameState.message = "You win!";
        } else if (playerTotal < dealerTotal) {
            gameState.message = "Dealer wins!";
        } else {
            gameState.message = "It's a tie!";
        }

        await pool.query("UPDATE blackjack_sessions SET game_state = $1 WHERE id = $2", [JSON.stringify(gameState), sessionId]);

        res.status(HTTP_CODES.SUCCESS.OK).json(gameState);
    } catch (error) {
        console.error("Error processing Blackjack stand:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to process stand." });
    }
});

// Get a Blackjack game session
blackjackRouter.get("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await pool.query("SELECT game_state FROM blackjack_sessions WHERE id = $1", [sessionId]);

        if (result.rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "Game session not found." });
        }

        res.status(HTTP_CODES.SUCCESS.OK).json(result.rows[0].game_state);
    } catch (error) {
        console.error("Error retrieving Blackjack session:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to retrieve session." });
    }
});

// Delete a Blackjack game session
blackjackRouter.delete("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        await pool.query("DELETE FROM blackjack_sessions WHERE id = $1", [sessionId]);

        res.status(HTTP_CODES.SUCCESS.OK).json({ message: "Blackjack session deleted." });
    } catch (error) {
        console.error("Error deleting Blackjack session:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to delete session." });
    }
});

function drawCard() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    return {
        suit: suits[Math.floor(Math.random() * suits.length)],
        value: values[Math.floor(Math.random() * values.length)]
    };
}

function calculateTotal(cards) {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
        if (["J", "Q", "K"].includes(card.value)) {
            total += 10;
        } else if (card.value === "A") {
            aces += 1;
            total += 11;
        } else {
            total += parseInt(card.value);
        }
    }

    // Ace is always 1 or 11, but will be assumed to be 11 at first
    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    return total;
}

export default blackjackRouter;