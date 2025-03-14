const poemDisplay = document.getElementById("poem-display");

async function fetchPoem() {
    try {
        console.log("Fetching poem..."); // Debugging
        const response = await fetch("/tmp/poem");
        const poem = await response.text();
        console.log("Poem received:", poem); // Here too
        poemDisplay.textContent = poem;
    } catch (error) {
        poemDisplay.textContent = "Error loading poem.";
    }
}

document.addEventListener("DOMContentLoaded", fetchPoem);