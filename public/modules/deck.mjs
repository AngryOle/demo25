const drawCardButton = document.getElementById("draw-card");
const cardDisplay = document.getElementById("card-display");

const suits = ["hearts", "diamonds", "clubs", "spades"];
const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function getRandomCard() {
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { suit, value };
}

drawCardButton.addEventListener("click", () => {
    const card = getRandomCard();
    cardDisplay.innerHTML = `<div class="card">${card.value} ${getSuitSymbol(card.suit)}</div>`;
});

function getSuitSymbol(suit) {
    return { hearts: "♥", diamonds: "♦", clubs: "♣", spades: "♠" }[suit] || suit;
}