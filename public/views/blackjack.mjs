import { placeTemplate } from "../modules/load-templates.mjs";

let currentGameId = null;

export async function init() {
    document.getElementById("start-game").addEventListener("click", startGame);
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stand").addEventListener("click", stand);
}

async function startGame() {
    const response = await fetch("/blackjack/start", { method: "POST" });
    const gameData = await response.json();
    
    currentGameId = gameData.gameId;
    updateUI(gameData);
    
    document.getElementById("hit").disabled = false;
    document.getElementById("stand").disabled = false;
}

async function hit() {
    if (!currentGameId) return;
    const response = await fetch(`/blackjack/play/${currentGameId}`, { method: "PUT" });
    const gameData = await response.json();
    updateUI(gameData);
}

async function stand() {
    if (!currentGameId) return;
    const response = await fetch(`/blackjack/stand/${currentGameId}`, { method: "PUT" });
    const gameData = await response.json();
    updateUI(gameData);
}

function updateUI(gameData) {
    document.getElementById("blackjack-message").innerText = gameData.message;

    // Player
    const playerCardsDiv = document.getElementById("player-cards");
    playerCardsDiv.innerHTML = "";
    gameData.playerCards.forEach(card => {
        playerCardsDiv.innerHTML += `<div class="card">${card.value} of ${card.suit}</div>`;
    });

    // Dealer
    const dealerCardsDiv = document.getElementById("dealer-cards");
    dealerCardsDiv.innerHTML = "";
    gameData.dealerCards.forEach(card => {
        dealerCardsDiv.innerHTML += `<div class="card">${card.value} of ${card.suit}</div>`;
    });

    // Game over
    if (gameData.gameOver) {
        document.getElementById("hit").disabled = true;
        document.getElementById("stand").disabled = true;
    }
}