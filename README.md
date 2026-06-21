# Compi Frontend

Animated, streaming chat UI for the Compi chatbot. Talks to the `compi-backend`
API gateway.

## Stack

- **React + Vite + TypeScript**
- **Tailwind CSS v4** (theme tokens + dark mode)
- **Framer Motion** for animations
- **react-markdown** + **rehype-highlight** for assistant markdown / code
- **react-router-dom** for routing
- **@microsoft/fetch-event-source** for authenticated SSE streaming

## Prerequisites

The backend gateway must be running on `http://localhost:8000`. From `../compi-backend`:

```bash
docker compose up
```

Confirm it's up at http://localhost:8000/docs.

## Setup

```bash
npm install
cp .env.example .env   # or create .env (see below)
npm run dev
```

Open http://localhost:5173.

### Environment

`.env`:

```
VITE_API_BASE=http://localhost:8000
```

## Features

- Email/password **register & login** (JWT stored in `localStorage`)
- **Conversation sidebar** — list, create new chats, switch between them
- **Streaming chat** — assistant responses stream token-by-token over SSE, with an
  animated status pill ("Thinking…", "Using <tool>…") driven by the backend agent
- **Markdown + syntax-highlighted code** in assistant messages
- **Dark / light mode** toggle (persisted)
- Responsive layout with a slide-in sidebar on mobile
- Error toasts; auto-logout + redirect to login on `401`

## API contract (from `compi-backend`)

| Method | Path                                          | Notes                          |
| ------ | --------------------------------------------- | ------------------------------ |
| POST   | `/auth/register`                              | `{name,email,password}` → `{token}` |
| POST   | `/auth/login`                                 | `{email,password}` → `{token}` |
| GET    | `/auth/google`                                | OAuth redirect (see note)      |
| GET    | `/chat/conversations`                         | list (Bearer)                  |
| POST   | `/chat/conversations`                         | `{title}` → conversation       |
| GET    | `/chat/conversations/{id}/messages`           | history                        |
| POST   | `/chat/conversations/{id}/messages`           | `{content}` → **SSE stream**   |

SSE events consumed: `status`, `content` (token), `done` (`usage` is ignored).

## Note on Google OAuth

The button redirects to `GET /auth/google`. The backend's callback currently
**returns the JWT as JSON** rather than redirecting back to the frontend, so the
flow won't complete in-browser as-is. To enable it, change the backend
`google_callback` to redirect to `http://localhost:5173/auth/callback?token=<jwt>` —
`src/pages/OAuthCallbackPage.tsx` already reads the token from that query param.
Email/password auth works end-to-end today.

## Scripts

- `npm run dev` — dev server
- `npm run build` — type-check + production build
- `npm run preview` — preview the production build
- `npm run lint` — eslint
