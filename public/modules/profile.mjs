const usernameDisplay = document.getElementById("username");
const userCreditsDisplay = document.getElementById("user-credits");
const gameHistoryTable = document.querySelector("#game-history tbody");
const logoutButton = document.getElementById("logout-button");
const logoutMessage = document.getElementById("logout-message");

async function fetchProfile() {
    try {
        const response = await fetch("/user/session", { credentials: "include" });
        const data = await response.json();

        if (response.ok) {
            usernameDisplay.textContent = data.username;
            userCreditsDisplay.textContent = data.credits;
            localStorage.setItem("userCredits", data.credits);
        } else {
            usernameDisplay.textContent = "Not logged in";
            userCreditsDisplay.textContent = "-";
        }
    } catch (error) {
        usernameDisplay.textContent = "Error loading profile";
        userCreditsDisplay.textContent = "-";
    }
}

async function fetchGameHistory() {
    try {
        const response = await fetch("/blackjack/history", { credentials: "include" });
        const data = await response.json();

        gameHistoryTable.innerHTML = "";

        if (data.length === 0) {
            gameHistoryTable.innerHTML = "<tr><td colspan='3'>No games played yet</td></tr>";
        } else {
            data.forEach(game => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${game.id}</td>
                    <td>${game.bet_amount}</td>
                    <td>${game.result}</td>
                `;
                gameHistoryTable.appendChild(row);
            });
        }
    } catch (error) {
        gameHistoryTable.innerHTML = "<tr><td colspan='3'>Error loading history</td></tr>";
    }
}

async function logout() {
    try {
        const response = await fetch("/user/logout", { method: "POST", credentials: "include" });

        if (response.ok) {
            logoutMessage.textContent = "Logout successful! Redirecting...";
            localStorage.removeItem("userCredits");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            logoutMessage.textContent = "Logout failed.";
        }
    } catch (error) {
        logoutMessage.textContent = "Error logging out.";
    }
}

logoutButton.addEventListener("click", logout);
document.addEventListener("DOMContentLoaded", () => {
    fetchProfile();
    fetchGameHistory();
});