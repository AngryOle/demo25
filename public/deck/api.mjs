const API_BASE_URL = '/temp';

export async function createDeck() {
    const response = await fetch(`${API_BASE_URL}/deck`, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`Failed to create deck: ${response.statusText}`);
    }
    return await response.json();
}

export async function drawCard(deckId) {
    const response = await fetch(`${API_BASE_URL}/deck/${deckId}/card`);
    if (!response.ok) {
        throw new Error(`Failed to draw card: ${response.statusText}`);
    }
    return await response.json();
}

export async function shuffleDeck(deckId) {
    const response = await fetch(`${API_BASE_URL}/deck/shuffle/${deckId}`, { method: 'PATCH' });
    if (!response.ok) {
        throw new Error(`Failed to shuffle deck: ${response.statusText}`);
    }
}