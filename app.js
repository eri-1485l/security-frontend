const responseBox = document.getElementById("response-box");
const statusBadge = document.getElementById("status-badge");
const buttons = {
    health: document.getElementById("btn-health"),
    get: document.getElementById("btn-get"),
    post: document.getElementById("btn-post"),
};

function setLoading(isLoading) {
    Object.values(buttons).forEach((button) => {
        button.disabled = isLoading;
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

buttons.health.addEventListener("click", () => {
    callApi("/health", "GET");
});

buttons.get.addEventListener("click", () => {
    callApi("/api/data", "GET");
});

buttons.post.addEventListener("click", () => {
    callApi("/api/data", "POST");
});
