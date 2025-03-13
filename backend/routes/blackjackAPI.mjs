import express from "express";
import { pool } from "../db.mjs";
import HTTP_CODES from "../utils/httpCodes.mjs";

const blackjackRouter = express.Router();

// Start game
blackjackRouter.post("/start", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: "You must be logged in to play." });
        }
        const { bet } = req.body;
        if (!bet || bet <= 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Invalid bet amount." });
        }

        // Get credits
        const userResult = await pool.query("SELECT credits FROM users WHERE id = $1", [req.session.userId]);
        if (userResult.rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: "User not found." });
        }
        
        const userCredits = userResult.rows[0].credits;
        if (bet > userCredits) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Not enough credits." });
        }

        await pool.query("UPDATE users SET credits = credits - $1 WHERE id = $2", [bet, req.session.userId]);

        const gameState = {
            playerCards: [drawCard(), drawCard()],
            dealerCards: [drawCard()],
            gameOver: false,
            message: "Game started! Place your bet."
        };

        const result = await pool.query(
            "INSERT INTO blackjack_sessions (user_id, game_state, bet_amount) VALUES ($1, $2, $3) RETURNING id",
            [req.session.userId, JSON.stringify(gameState), bet]
        );

        res.status(HTTP_CODES.SUCCESS.CREATED).json({ sessionId: result.rows[0].id, gameState });
    } catch (error) {
        console.error("Error starting Blackjack game:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to start game." });
    }
});

// Hit
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

// Stand (dealer play)
blackjackRouter.put("/stand/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = await pool.query("SELECT user_id, game_state, bet_amount FROM blackjack_sessions WHERE id = $1", [sessionId]);

        if (result.rows.length === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "Game session not found." });
        }

        let gameState = result.rows[0].game_state;
        if (gameState.gameOver) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: "Game is already over." });
        }

        const betAmount = result.rows[0].bet_amount;
        const userId = result.rows[0].user_id;

        // Dealer plays until 17+
        while (calculateTotal(gameState.dealerCards) < 17) {
            gameState.dealerCards.push(drawCard());
        }

        const playerTotal = calculateTotal(gameState.playerCards);
        const dealerTotal = calculateTotal(gameState.dealerCards);

        gameState.gameOver = true;
        let payout = 0;

        if (dealerTotal > 21 || playerTotal > dealerTotal) {
            gameState.message = "Winrar!";
            payout = betAmount * 2;
        } else if (playerTotal < dealerTotal) {
            gameState.message = "Dealer wins!";
        } else {
            gameState.message = "Tie!";
            payout = betAmount; //refund
        }

        if (payout > 0) {
            await pool.query("UPDATE users SET credits = credits + $1 WHERE id = $2", [payout, userId]);
        }

        await pool.query("UPDATE blackjack_sessions SET game_state = $1 WHERE id = $2", [JSON.stringify(gameState), sessionId]);

        res.status(HTTP_CODES.SUCCESS.OK).json(gameState);
    } catch (error) {
        console.error("Error processing Blackjack stand:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to process stand." });
    }
});

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