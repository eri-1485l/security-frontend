# Security Frontend

Frontend for the **API Key Authentication Anti-Pattern** class exercise.

This client calls a separate backend API and sends a static `x-api-key` header from the browser. That is intentional: the assignment is to reproduce a common security weakness, not to build production authentication.

## Requirements

- Backend API running at `http://localhost:8000`
- A modern browser (Chrome, Firefox, Edge, or similar)

## Files

```text
security-frontend/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## How to run

1. Start the backend from the `security-api` repository first.
2. Open `index.html` in a browser.

You can open the file directly:

```text
file:///C:/path/to/security-frontend/index.html
```

Or serve the folder with a simple local server (recommended):

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## Configuration

The frontend is configured in `app.js`:

- API URL: `http://localhost:8000`
- API key: `mi-api-key-secreta-123456`

## Buttons

| Button | Request | API key |
| ------ | ------- | ------- |
| Check Health | `GET /health` | No |
| Get Protected Data | `GET /api/data` | Yes (`x-api-key`) |
| Send POST Request | `POST /api/data` | Yes (`x-api-key`) |

The JSON (or error) returned by the API is shown in the response panel.

## Expected results

With the backend running:

- **Check Health** → `200 OK` and `{"status": "ok"}`
- **Get Protected Data** → `200 OK` and the protected JSON payload
- **Send POST Request** → `200 OK` and `{"message": "POST received"}`

If the backend is not running, the page shows a connection error.

## Why this is an anti-pattern

The API key is stored in client-side JavaScript (`app.js`). Anyone can open DevTools, view the source, or inspect the network tab and copy the key. A static key in the browser is not a real authentication or authorization mechanism.
