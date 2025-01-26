import { createDeck, drawCard, shuffleDeck } from './api.mjs';

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
        case 'hearts': 
            return '♥';
        case 'diamonds': 
            return '♦';
        case 'clubs': 
            return '♣';
        case 'spades': 
            return '♠';
        default: 
            return '';
    }
}

async function handleCreateDeck() {
    try {
        const response = await createDeck(); 
        currentDeckId = response.deckId; 
        updateOutput(`Deck created successfully! Deck ID: ${currentDeckId}`);
        document.getElementById('shuffleDeckButton').disabled = false;
        document.getElementById('drawCardButton').disabled = false;
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

document.addEventListener('DOMContentLoaded', () => {
    const createDeckButton = document.getElementById('createDeckButton');
    const drawCardButton = document.getElementById('drawCardButton');
    const shuffleDeckButton = document.getElementById('shuffleDeckButton');

    createDeckButton.addEventListener('click', handleCreateDeck); 
    drawCardButton.addEventListener('click', handleDrawCard);
    shuffleDeckButton.addEventListener('click', handleShuffleDeck);
});