const registerButton = document.getElementById("register-button");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const registerMessage = document.getElementById("register-message");

registerButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username || !password || !confirmPassword) {
        registerMessage.textContent = "All fields are required!";
        return;
    }

    if (password !== confirmPassword) {
        registerMessage.textContent = "Passwords do not match!";
        return;
    }

    try {
        const response = await fetch("/user/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            registerMessage.textContent = "Registration successful! Redirecting...";
            setTimeout(() => {
                window.location.href = "login.html"; 
            }, 1500);
        } else {
            registerMessage.textContent = data.error || "Registration failed.";
        }
    } catch (error) {
        registerMessage.textContent = "Error registering user.";
    }
});