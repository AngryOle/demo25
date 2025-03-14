const quoteDisplay = document.getElementById("quote-display");

async function fetchQuote() {
    try {
        const response = await fetch("/tmp/quote");
        const quote = await response.text();
        quoteDisplay.textContent = quote;
    } catch (error) {
        quoteDisplay.textContent = "Error loading quote.";
    }
}

document.addEventListener("DOMContentLoaded", fetchQuote);