# Security Frontend

Frontend for the API Key authentication exercise.

The browser never sees the API key. JavaScript only calls same-origin paths such as `/login`, `/api/data`, `/api/encrypt`, and `/api/decrypt`. **Nginx** reverse-proxies those requests to the backend running on the host and adds the `x-api-key` header on the server side for protected API routes.

```text
Browser  --(no API key)-->  Nginx (this Docker container)
                                |
                                |  x-api-key added here (protected /api routes)
                                v
                         Backend on the host
                         (host.docker.internal:8000)
```

This repository is independent from the backend repository. Do not put both in one Compose file.

## Login screen

The HTML has two screens: `login-screen` and `main-screen`.

- The **login screen** is shown first.
- The user enters a username and password and clicks **Login**.
- The frontend sends `POST /login` to the backend (proxied by Nginx). Authentication uses LDAP credentials, not the API Key.
- After a successful response, the **main screen** is shown automatically.

Login UI lives in `index.html`. Screen switching and the login request are in `app.js`. Styles for the login panel and screen transitions are in `styles.css`. Nginx proxies `/login` in `nginx/default.conf.template`.

## Prerequisites

1. Start the backend **locally** from the other repository so it listens on port `8000`.
2. Start OpenLDAP (port `389`) so `POST /login` can authenticate users.
3. Docker must be running (Docker Desktop on Windows is fine).

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

The API Key is injected by Nginx on the **server side**. The browser never sends `x-api-key`. Login uses LDAP username and password only.

Open:

```text
http://localhost
```

Stop the container with `Ctrl+C`, then:

```bash
docker rm security-frontend
```

After an API Key rotation, the `rotate-secrets` script recreates this container automatically with the new key. You do not need to rebuild the image for a key change.

## Verify that Nginx has the API key

```bash
docker exec -it security-frontend cat /etc/nginx/conf.d/default.conf
```

You should see `proxy_set_header x-api-key` with the value you passed in `-e API_KEY=...`. That file is generated inside the container at startup; it is not stored in Git.

## Verify that the browser does not send the key

1. Open `http://localhost`, log in, then open DevTools → **Network**.
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
| Login | `POST /login` | Nobody (uses LDAP credentials) |
| Check Health | `GET /health` | Nobody (public endpoint) |
| Get Protected Data | `GET /api/data` | Nginx |
| Send POST Request | `POST /api/data` | Nginx |
| Encrypt Message | `POST /api/encrypt` | Nginx |
| Decrypt Message | `POST /api/decrypt` | Nginx |

## Test login from the frontend

1. Start the backend on port `8000` and OpenLDAP on port `389`.
2. Open `http://localhost`. The login screen should appear first.
3. Enter a lab user (for example `alice` / `alice123`) and click **Login**.
4. A success message is shown, then the main screen appears.
5. Invalid credentials show an error and keep you on the login screen.

## Test encryption and decryption from the frontend

1. Log in so the main screen is visible, with the backend running on port `8000`.
2. Click **Encrypt Message**, type a short string, and confirm.
3. Copy `encrypted_data` from the response panel.
4. Click **Decrypt Message**, paste that value, and confirm.
5. The response should show the original string in `plaintext`.

If you get `401` on protected API calls, the container’s `API_KEY` does not match the backend `.env`. After a rotation, wait for `rotate-secrets` to recreate the frontend container, or recreate it yourself with the current key.
