const createDeckButton = document.getElementById('create-deck');
const shuffleDeckButton = document.getElementById('shuffle-deck');
const drawCardButton = document.getElementById('draw-card');
const cardDisplay = document.getElementById('card-display');
const errorMessage = document.getElementById('error-message');

let currentDeckId = null;

// API CALL
async function apiRequest(method, url) {
    try {
        const response = await fetch(url, { method });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        errorMessage.textContent = error.message;
        throw error;
    }
}

// CREATE DECK
createDeckButton.addEventListener('click', async () => {
    errorMessage.textContent = '';
    cardDisplay.textContent = '';
    try {
        const result = await apiRequest('POST', '/temp/deck');
        currentDeckId = result.deck_id;
        errorMessage.textContent = `Deck created with ID: ${currentDeckId}`;
        shuffleDeckButton.disabled = false;
        drawCardButton.disabled = false;
    } catch {
        errorMessage.textContent = 'Failed to create deck.';
    }
});

// SHUFFLE DECK
shuffleDeckButton.addEventListener('click', async () => {
    errorMessage.textContent = '';
    try {
        await apiRequest('PATCH', `/temp/deck/shuffle/${currentDeckId}`);
        errorMessage.textContent = 'Deck shuffled successfully!';
    } catch {
        errorMessage.textContent = 'Failed to shuffle deck. .';
    }
});

// DRAW A CARD
drawCardButton.addEventListener('click', async () => {
    errorMessage.textContent = '';
    cardDisplay.textContent = '';
    try {
        const card = await apiRequest('GET', `/temp/deck/${currentDeckId}/card`);
        const { suit, value } = card;
        cardDisplay.innerHTML = `
            <div class="card">
                <strong>${value}</strong>
                <br>
                <em>${suit}</em>
            </div>
        `;
    } catch {
        errorMessage.textContent = 'Failed to draw a card. . .';
    }
});