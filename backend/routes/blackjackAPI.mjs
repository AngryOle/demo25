import express from "express";
import { saveBlackjackSession, getBlackjackSession, updateBlackjackSession } from "../db.mjs";
import HTTP_CODES from "../utils/httpCodes.mjs";

const blackjackRouter = express.Router();

// Start a new Blackjack game
blackjackRouter.post("/start", async (req, res) => {
    try {
        const userId = req.session.userId || null; // Ensure user authentication
        const gameState = {
            playerCards: [drawRandomCard(), drawRandomCard()],
            dealerCards: [drawRandomCard()],
            gameOver: false,
            message: "Game started! Draw your first card."
        };

        const sessionId = await saveBlackjackSession(userId, gameState);
        res.status(HTTP_CODES.SUCCESS.CREATED).json({ sessionId, gameState });
    } catch (error) {
        console.error("Error starting game:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to start game." });
    }
});

// Draw a card (Hit)
blackjackRouter.put("/play/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        let session = await getBlackjackSession(sessionId);

        if (!session) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "Game not found." });
        }

        let gameState = session.game_state;
        const card = drawRandomCard();
        gameState.playerCards.push(card);

        // Check if player busts
        if (calculateHandValue(gameState.playerCards) > 21) {
            gameState.gameOver = true;
            gameState.message = "You busted! Dealer wins.";
        } else {
            gameState.message = `You drew a ${card.value} of ${card.suit}.`;
        }

        await updateBlackjackSession(sessionId, gameState);
        res.status(HTTP_CODES.SUCCESS.OK).json(gameState);
    } catch (error) {
        console.error("Error hitting:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to draw card." });
    }
});

// Stand (Dealer Plays)
blackjackRouter.put("/stand/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        let session = await getBlackjackSession(sessionId);

        if (!session) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "Game not found." });
        }

        let gameState = session.game_state;
        
        // Dealer draws cards until they reach 17 or higher
        while (calculateHandValue(gameState.dealerCards) < 17) {
            gameState.dealerCards.push(drawRandomCard());
        }

        // Determine Winner
        const playerScore = calculateHandValue(gameState.playerCards);
        const dealerScore = calculateHandValue(gameState.dealerCards);

        if (dealerScore > 21) {
            gameState.message = "Dealer busted! You win!";
        } else if (playerScore > dealerScore) {
            gameState.message = "You win!";
        } else if (playerScore < dealerScore) {
            gameState.message = "Dealer wins!";
        } else {
            gameState.message = "It's a tie!";
        }

        gameState.gameOver = true;
        await updateBlackjackSession(sessionId, gameState);
        res.status(HTTP_CODES.SUCCESS.OK).json(gameState);
    } catch (error) {
        console.error("Error standing:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to complete dealer turn." });
    }
});

// Get game session
blackjackRouter.get("/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await getBlackjackSession(sessionId);

        if (!session) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: "Game not found." });
        }
        res.status(HTTP_CODES.SUCCESS.OK).json(session.game_state);
    } catch (error) {
        console.error("Error fetching session:", error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: "Failed to retrieve game session." });
    }
});

// Helper functions
function drawRandomCard() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    return { suit: suits[Math.floor(Math.random() * suits.length)], value: values[Math.floor(Math.random() * values.length)] };
}

function calculateHandValue(cards) {
    let total = 0;
    let aceCount = 0;
    for (let card of cards) {
        if (["J", "Q", "K"].includes(card.value)) {
            total += 10;
        } else if (card.value === "A") {
            total += 11;
            aceCount++;
        } else {
            total += parseInt(card.value);
        }
    }
    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    }
    return total;
}

export default blackjackRouter;