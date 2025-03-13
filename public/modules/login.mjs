const loginButton = document.getElementById("login-button");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("login-message");

loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        loginMessage.textContent = "Enter a username and password.";
        return;
    }

    try {
        const response = await fetch("/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            loginMessage.textContent = "Login successful! Redirecting...";
            setTimeout(() => {
                window.location.href = "blackjack.html"; // GOTO GAME
            }, 1500);
        } else {
            loginMessage.textContent = data.error || "Login failed.";
        }
    } catch (error) {
        loginMessage.textContent = "Error logging in.";
    }
});