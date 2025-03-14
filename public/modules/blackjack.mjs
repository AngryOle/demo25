const startGameBtn = document.getElementById("start-game");
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const confirmBetBtn = document.getElementById("confirm-bet");
const betInput = document.getElementById("bet-amount");
const dealerCardsDiv = document.getElementById("dealer-cards");
const playerCardsDiv = document.getElementById("player-cards");
const gameMessage = document.getElementById("game-message");
const betMessage = document.getElementById("bet-message");
const playerCreditsDisplay = document.getElementById("player-credits");

async function fetchCredits() {
    const storedCredits = localStorage.getItem("userCredits");
    if (storedCredits) {
        playerCreditsDisplay.textContent = storedCredits;
    } else {
        playerCreditsDisplay.textContent = "Loading...";
    }

    try {
        const response = await fetch("/user/session", { credentials: "include" });
        const data = await response.json();

        if (response.ok) {
            playerCreditsDisplay.textContent = data.credits;
            localStorage.setItem("userCredits", data.credits);
        } else {
            playerCreditsDisplay.textContent = "Error loading credits";
        }
    } catch (error) {
        playerCreditsDisplay.textContent = "Error loading credits";
    }
}

let sessionId = null;
let betAmount = 0;

confirmBetBtn.addEventListener("click", () => {
    betAmount = parseInt(betInput.value, 10);
    if (betAmount <= 0 || isNaN(betAmount)) {
        betMessage.textContent = "Please enter a valid bet amount!";
        return;
    }
    if (betAmount <= 0 || isNaN(betAmount)) {
        betMessage.textContent = "Please enter a valid bet amount!";
        startGameBtn.disabled = true;
        return;
    }
    
    betMessage.textContent = `Bet confirmed: ${betAmount} credits. Click "Start Game" to begin!`;
    startGameBtn.disabled = false;  
    confirmBetBtn.disabled = true;  
    betInput.disabled = true;
    const currentCredits = parseInt(playerCreditsDisplay.textContent, 10);
    playerCreditsDisplay.textContent = currentCredits - betAmount;
    localStorage.setItem("userCredits", currentCredits - betAmount);
});

async function startGame() {
    if (betAmount <= 0) {
        gameMessage.textContent = "Please confirm your bet before starting.";
        return;
    }

    try {
        const response = await fetch("/blackjack/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bet: betAmount })
        });
        const data = await response.json();

        if (data.error) {
            gameMessage.textContent = data.error;
            return;
        }

        sessionId = data.sessionId;
        updateUI(data.gameState);

        hitBtn.disabled = false;
        standBtn.disabled = false;
        startGameBtn.disabled = true;
        confirmBetBtn.disabled = true;
        betInput.disabled = true;
    } catch (error) {
        gameMessage.textContent = "Error starting game!";
    }
}

async function hit() {
    if (!sessionId) return;

    try {
        const response = await fetch(`/blackjack/play/${sessionId}`, { method: "PUT" });
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        gameMessage.textContent = "Error drawing a card!";
    }
}

async function stand() {
    if (!sessionId) return;

    try {
        const response = await fetch(`/blackjack/stand/${sessionId}`, { method: "PUT" });
        const data = await response.json();
        updateUI(data);

        hitBtn.disabled = true;
        standBtn.disabled = true;
        startGameBtn.disabled = false;
        confirmBetBtn.disabled = false;
        betInput.disabled = false;
    } catch (error) {
        gameMessage.textContent = "Error standing!";
    }
}

function updateUI(gameState) {
    dealerCardsDiv.innerHTML = "";
    playerCardsDiv.innerHTML = "";

    gameState.dealerCards.forEach(card => {
        dealerCardsDiv.innerHTML += `<div class="card">${card.value} ${getSuitSymbol(card.suit)}</div>`;
    });

    gameState.playerCards.forEach(card => {
        playerCardsDiv.innerHTML += `<div class="card">${card.value} ${getSuitSymbol(card.suit)}</div>`;
    });

    gameMessage.textContent = gameState.message;

    if (gameState.credits !== undefined) {
        playerCreditsDisplay.textContent = gameState.credits;
        localStorage.setItem("userCredits", gameState.credits);
    }

    if (gameState.gameOver) {
        hitBtn.disabled = true;
        standBtn.disabled = true;
        startGameBtn.disabled = true; 
        confirmBetBtn.disabled = false;
        betInput.disabled = false;
        betMessage.textContent = "Please confirm your new bet before starting!";
    }
}

function getSuitSymbol(suit) {
    const suits = { "hearts": "♥", "diamonds": "♦", "clubs": "♣", "spades": "♠" };
    return suits[suit] || suit;
}

startGameBtn.addEventListener("click", startGame);
document.addEventListener("DOMContentLoaded", fetchCredits);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);