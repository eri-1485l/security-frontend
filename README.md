# Security Frontend

Frontend for the API Key authentication exercise.

The browser never sees the API key. JavaScript only calls same-origin paths such as `/api/data`, `/api/encrypt`, and `/api/decrypt`. **Nginx** reverse-proxies those requests to the backend running on the host and adds the `x-api-key` header on the server side.

```text
Browser  --(no API key)-->  Nginx (this Docker container)
                                |
                                |  x-api-key added here
                                v
                         Backend on the host
                         (host.docker.internal:8000)
```

This repository is independent from the backend repository. Do not put both in one Compose file.

## Prerequisites

1. Start the backend **locally** from the other repository so it listens on port `8000`.
2. Docker must be running (Docker Desktop on Windows is fine).

## Build and run

From this `security-frontend` folder:

```bash
docker build -t security-frontend .
```

```bash
docker run --name security-frontend -p 80:80 -e API_KEY=your-secret-key -e BACKEND_HOST=host.docker.internal -e BACKEND_PORT=8000 --add-host=host.docker.internal:host-gateway security-frontend
```

`--add-host=host.docker.internal:host-gateway` lets the container reach the host on Linux as well as Docker Desktop (Windows/Mac).

Replace `your-secret-key` with the same key the local backend expects. The key is passed only as a runtime environment variable. It is not in `app.js`, `index.html`, `styles.css`, the Dockerfile, or the Nginx template.

Open:

```text
http://localhost
```

Stop the container with `Ctrl+C`, then:

```bash
docker rm security-frontend
```

## Verify that Nginx has the API key

```bash
docker exec -it security-frontend cat /etc/nginx/conf.d/default.conf
```

You should see `proxy_set_header x-api-key` with the value you passed in `-e API_KEY=...`. That file is generated inside the container at startup; it is not stored in Git.

## Verify that the browser does not send the key

1. Open `http://localhost` and DevTools → **Network**.
2. Click **Get Protected Data**, **Send POST Request**, **Encrypt Message**, or **Decrypt Message**.
3. Select the request (`/api/data`, `/api/encrypt`, or `/api/decrypt`).
4. Confirm there is **no** `x-api-key` request header.

The key is added only on the hop from Nginx to `host.docker.internal:8000`. The browser never sees it.

## Encrypt and Decrypt buttons

A horizontal separator sits between the original actions and the crypto actions.

- **Encrypt Message** — prompts for plaintext, then `POST /api/encrypt` with JSON `{ "mensaje": "..." }` via `callApiPost()` in `app.js`. The response panel shows `encrypted_data`.
- **Decrypt Message** — prompts for a Base64 ciphertext, then `POST /api/decrypt` with JSON `{ "mensaje": "..." }`. The response panel shows `plaintext`.

`index.html` defines the buttons; `styles.css` uses `--encrypt` and `--decrypt` for their colors.

## Buttons

| Button | Browser request | Who adds `x-api-key` |
| ------ | --------------- | -------------------- |
| Check Health | `GET /health` | Nobody (public endpoint) |
| Get Protected Data | `GET /api/data` | Nginx |
| Send POST Request | `POST /api/data` | Nginx |
| Encrypt Message | `POST /api/encrypt` | Nginx |
| Decrypt Message | `POST /api/decrypt` | Nginx |

## Test encryption and decryption from the frontend

1. Open `http://localhost` with the backend running on port `8000`.
2. Click **Encrypt Message**, type a short string, and confirm.
3. Copy `encrypted_data` from the response panel.
4. Click **Decrypt Message**, paste that value, and confirm.
5. The response should show the original string in `plaintext`.

If you get `401`, the container’s `API_KEY` does not match the backend `.env` (for example after `rotate_secret.py` ran). Recreate the frontend container with the current key, or let the rotation script restart it.
