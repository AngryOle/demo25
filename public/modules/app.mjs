import { createDeck, drawCard, shuffleDeck } from './api.mjs';
import { placeTemplate } from './load-templates.mjs';

let currentDeckId = null;

export function updateOutput(message) {
    document.getElementById('output').innerText = message;
}

export function displayCard(card) {
    const cardContainer = document.getElementById('cardContainer');
    cardContainer.innerHTML = `
        <div class="card ${card.suit}">
            <div class="value">${card.value}</div>
            <div class="suit">${getSuitSymbol(card.suit)}</div>
        </div>
    `;
}

export function clearUI() {
    document.getElementById('cardContainer').innerHTML = '';
    document.getElementById('usedCardsContainer').innerHTML = '';
    updateOutput("New deck created! Deck is shuffled and ready.");
}

export function addToUsedCards(card) {
    const usedCardsContainer = document.getElementById('usedCardsContainer');
    const cardElement = document.createElement('div');
    cardElement.classList.add('card-placeholder', 'used-card', card.suit);
    cardElement.style.setProperty('--index', usedCardsContainer.childElementCount);
    cardElement.style.top = `${usedCardsContainer.childElementCount * 5}px`;
    cardElement.style.zIndex = usedCardsContainer.childElementCount;
    cardElement.innerHTML = `
        <div class="value">${card.value}</div>
        <div class="suit">${getSuitSymbol(card.suit)}</div>
    `;
    usedCardsContainer.appendChild(cardElement);
}

function getSuitSymbol(suit) {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
        default: return '';
    }
}

// Deck Game Functions
async function handleCreateDeck() {
    try {
        const response = await createDeck(); 
        currentDeckId = response.deckId; 
        updateOutput(`Deck created successfully! Deck ID: ${currentDeckId}`);
        document.getElementById('shuffle-deck').disabled = false;
        document.getElementById('draw-card').disabled = false;
    } catch (error) {
        updateOutput("Failed to create deck.");
    }
}

async function handleDrawCard() {
    if (!currentDeckId) {
        updateOutput("No deck created yet!");
        return;
    }
    try {
        const card = await drawCard(currentDeckId);
        displayCard(card);  
        addToUsedCards(card);  
    } catch (error) {
        updateOutput("Failed to draw card.");
    }
}

async function handleShuffleDeck() {
    if (!currentDeckId) {
        updateOutput("No deck created yet!");
        return;
    }
    try {
        await shuffleDeck(currentDeckId);
        updateOutput("Deck shuffled!");
    } catch (error) {
        updateOutput("Failed to shuffle deck.");
    }
}

// Initialize Deck Game Event Listeners
function initializeDeckGame() {
    const createDeckButton = document.getElementById('create-deck');
    const drawCardButton = document.getElementById('draw-card');
    const shuffleDeckButton = document.getElementById('shuffle-deck');

    createDeckButton.addEventListener('click', handleCreateDeck); 
    drawCardButton.addEventListener('click', handleDrawCard);
    shuffleDeckButton.addEventListener('click', handleShuffleDeck);
}

// Navigation Logic
document.getElementById("home-button").addEventListener("click", () => {
    placeTemplate("home-template.html", "home.mjs");
});

document.getElementById("blackjack-button").addEventListener("click", () => {
    placeTemplate("blackjack-template.html", "blackjack.mjs");
});

document.getElementById("deck-button").addEventListener("click", () => {
    placeTemplate("deck-template.html", "index.mjs", null, initializeDeckGame);
});

document.getElementById("poem-button").addEventListener("click", () => {
    placeTemplate("poem-template.html", "poem.mjs");
});

placeTemplate("deck-template.html", "index.mjs", null, initializeDeckGame);
