// ============================================
// DOM ELEMENTS
// ============================================

const responseBox = document.getElementById("response-box");
const statusBadge = document.getElementById("status-badge");

const buttons = {
    health: document.getElementById("btn-health"),
    get: document.getElementById("btn-get"),
    post: document.getElementById("btn-post"),
    encrypt: document.getElementById("btn-encrypt"),
    decrypt: document.getElementById("btn-decrypt"),
};

// Login elements
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const btnLogin = document.getElementById("btn-login");
const loginStatus = document.getElementById("login-status");

// Screen elements
const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");

// ============================================
// UTILITIES
// ============================================

function setLoading(isLoading) {
    Object.values(buttons).forEach((button) => {
        if (button) button.disabled = isLoading;
    });
}

function showStatus(label, isOk) {
    statusBadge.textContent = label;
    statusBadge.classList.remove("ok", "error");

    if (isOk === true) {
        statusBadge.classList.add("ok");
    } else if (isOk === false) {
        statusBadge.classList.add("error");
    }
}

function formatBody(text) {
    try {
        return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
        return text || "(empty response)";
    }
}

// ============================================
// SCREEN MANAGEMENT
// ============================================

function showMainScreen() {
    loginScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
}

function showLoginScreen() {
    mainScreen.classList.add("hidden");
    loginScreen.classList.remove("hidden");
}

// ============================================
// LOGIN
// ============================================

async function login() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    if (!username || !password) {
        loginStatus.textContent = "Please enter username and password";
        loginStatus.className = "error";
        return;
    }

    btnLogin.disabled = true;
    loginStatus.textContent = "Authenticating...";
    loginStatus.className = "";

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            loginStatus.textContent = `Welcome, ${data.username}!`;
            loginStatus.className = "success";
            setTimeout(showMainScreen, 800);
        } else {
            loginStatus.textContent = data.detail || "Login failed";
            loginStatus.className = "error";
        }
    } catch (error) {
        loginStatus.textContent = "Connection error";
        loginStatus.className = "error";
    } finally {
        btnLogin.disabled = false;
    }
}

if (btnLogin) {
    btnLogin.addEventListener("click", login);
}

// Allow Enter key in password field
if (loginPassword) {
    loginPassword.addEventListener("keypress", (e) => {
        if (e.key === "Enter") login();
    });
}

// ============================================
// API CALLS
// ============================================

async function callApi(path, method) {
    setLoading(true);
    showStatus("Loading", null);
    responseBox.textContent = "Sending request...";

    try {
        const response = await fetch(path, { method });
        const rawBody = await response.text();
        const formattedBody = formatBody(rawBody);

        showStatus(`${response.status} ${response.statusText}`, response.ok);
        responseBox.textContent =
            `${method} ${path}\n` +
            `Status: ${response.status} ${response.statusText}\n\n` +
            formattedBody;
    } catch (error) {
        showStatus("Request failed", false);
        responseBox.textContent =
            "Could not reach the API through this page.\n\n" +
            `Details: ${error.message}`;
    } finally {
        setLoading(false);
    }
}

async function callApiPost(path, data) {
    setLoading(true);
    showStatus("Loading", null);
    responseBox.textContent = "Sending request...";

    try {
        const response = await fetch(path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const rawBody = await response.text();
        const formattedBody = formatBody(rawBody);

        showStatus(`${response.status} ${response.statusText}`, response.ok);
        responseBox.textContent =
            `POST ${path}\n` +
            `Status: ${response.status} ${response.statusText}\n\n` +
            formattedBody;
    } catch (error) {
        showStatus("Request failed", false);
        responseBox.textContent =
            "Could not reach the API through this page.\n\n" +
            `Details: ${error.message}`;
    } finally {
        setLoading(false);
    }
}

// ============================================
// EVENT LISTENERS (main screen)
// ============================================

if (buttons.health) {
    buttons.health.addEventListener("click", () => {
        callApi("/health", "GET");
    });
}

if (buttons.get) {
    buttons.get.addEventListener("click", () => {
        callApi("/api/data", "GET");
    });
}

if (buttons.post) {
    buttons.post.addEventListener("click", () => {
        callApi("/api/data", "POST");
    });
}

if (buttons.encrypt) {
    buttons.encrypt.addEventListener("click", () => {
        const message = prompt("Enter message to encrypt:");
        if (message && message.trim()) {
            callApiPost("/api/encrypt", { mensaje: message });
        }
    });
}

if (buttons.decrypt) {
    buttons.decrypt.addEventListener("click", () => {
        const ciphertext = prompt("Paste the encrypted Base64 string to decrypt:");
        if (ciphertext && ciphertext.trim()) {
            callApiPost("/api/decrypt", { mensaje: ciphertext });
        }
    });
}
