# EasyGenerator Auth

A full-stack authentication application: sign up, sign in, and a protected page — built with a **NestJS + MongoDB** API and a **React + Vite** front end.

| Layer    | Stack                                                                       |
| -------- | --------------------------------------------------------------------------- |
| Backend  | NestJS 11, TypeScript, MongoDB, Mongoose, JWT, Argon2, Swagger              |
| Frontend | React 19, TypeScript, Vite, React Router, React Hook Form, Zod, TanStack Query, Tailwind |
| Infra    | Docker, docker-compose, GitHub Actions CI                                   |

---

## Features

- Email / name / password sign up with strong password policy
- Email / password sign in
- **Access + refresh token flow:** short-lived JWT access token (in memory) + long-lived refresh token in an `HttpOnly` cookie, with rotation on every refresh
- Passwords hashed with **Argon2id**; refresh-token hashes stored for rotation/revocation
- Protected `/auth/me` endpoint guarded by `JwtAuthGuard`
- Route protection on the front end, redirect of authenticated users, **automatic silent access-token refresh** and redirect to sign-in when the refresh token expires
- **Light / dark theme** with a toggle, OS-preference detection, persistence, and no flash on load
- Reusable, strongly-typed **`Button`** with CVA variants (`primary` / `secondary` / `outline` / `danger`)
- Security baseline: Helmet, CORS, global rate limiting, global validation & exception handling
- Swagger docs, health probe, unit tests, Docker, CI

---

## Prerequisites

- Node.js **20+** (LTS) and npm
- MongoDB running locally **or** Docker + Docker Compose

---

## Quick start (Docker — recommended)

The fastest way to run everything (MongoDB, API, web) with one command:

```bash
# from the repository root
docker compose up --build
```

- Frontend: <http://localhost:8080>
- Backend API: <http://localhost:3000/api>
- Swagger docs: <http://localhost:3000/api/docs>

> Set a strong `JWT_SECRET` before deploying: `JWT_SECRET=$(openssl rand -hex 32) docker compose up --build`.

---

## Running locally (without Docker)

You need a running MongoDB. To start one quickly with Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### Backend

```bash
cd backend
cp .env.example .env        # adjust values if needed
npm install
npm run start:dev           # http://localhost:3000/api
```

### Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL defaults to http://localhost:3000/api
npm install
npm run dev                 # http://localhost:5173
```

---

## Environment variables

### Backend (`backend/.env`)

| Variable                        | Required | Default                 | Description                                              |
| ------------------------------- | -------- | ----------------------- | ------------------------------------------------------- |
| `NODE_ENV`                      | no       | `development`           | Runtime environment                                     |
| `PORT`                          | no       | `3000`                  | HTTP port                                               |
| `CORS_ORIGIN`                   | no       | `http://localhost:5173` | Comma-separated allowed origins (exact, for cookies)    |
| `MONGODB_URI`                   | **yes**  | —                       | MongoDB connection string                               |
| `JWT_ACCESS_SECRET`             | **yes**  | —                       | Access-token signing secret (min 16 chars)              |
| `JWT_ACCESS_EXPIRES_IN_MINUTES` | no       | `15`                    | Access-token lifetime in minutes                        |
| `JWT_REFRESH_SECRET`            | **yes**  | —                       | Refresh-token signing secret (min 16 chars, different)  |
| `JWT_REFRESH_EXPIRES_IN_DAYS`   | no       | `7`                     | Refresh-token lifetime in days                          |
| `COOKIE_SECURE`                 | no       | `true` in prod          | Send the refresh cookie only over HTTPS                 |
| `COOKIE_SAMESITE`               | no       | `lax`                   | Refresh cookie `SameSite` (`lax`/`strict`/`none`)       |
| `THROTTLE_TTL`                  | no       | `60000`                 | Rate-limit window in milliseconds                       |
| `THROTTLE_LIMIT`                | no       | `100`                   | Max requests per window per IP                          |

Configuration is validated at boot — the app refuses to start with an invalid environment.

### Frontend (`frontend/.env`)

| Variable       | Required | Default                       | Description           |
| -------------- | -------- | ----------------------------- | --------------------- |
| `VITE_API_URL` | no       | `http://localhost:3000/api`   | Base URL of the API   |

---

## API endpoints

Base path: `/api`

| Method | Endpoint        | Auth          | Description                                            | Success |
| ------ | --------------- | ------------- | ----------------------------------------------------- | ------- |
| POST   | `/auth/signup`  | —             | Register; returns access token + sets refresh cookie  | `201`   |
| POST   | `/auth/signin`  | —             | Authenticate; returns access token + sets cookie      | `200`   |
| POST   | `/auth/refresh` | Refresh cookie| Rotate refresh token, return a new access token        | `200`   |
| POST   | `/auth/logout`  | Refresh cookie| Invalidate refresh token and clear the cookie          | `200`   |
| GET    | `/auth/me`      | Bearer        | Get the current authenticated user                     | `200`   |
| GET    | `/health`       | —             | Liveness probe incl. MongoDB connectivity              | `200`   |
| GET    | `/docs`         | —             | Swagger UI                                             | —       |

The access token is returned in the **response body** (kept in memory by the client) and sent as `Authorization: Bearer <token>`. The refresh token is delivered only in an **`HttpOnly` cookie** scoped to `/api/auth` and is **rotated on every `/auth/refresh`** — a previously used token is rejected.

**Password policy:** at least 8 characters, containing a letter, a number and a special character.

Example:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"jane@example.com","name":"Jane Doe","password":"Str0ng!Pass"}'
```

Interactive documentation with request/response schemas is available at **`/api/docs`** (Swagger).

---

## Scripts

Both apps expose the same script names:

| Script              | Description                       |
| ------------------- | -------------------------------- |
| `npm run dev` / `start:dev` | Start in watch mode       |
| `npm run build`     | Production build                  |
| `npm run lint`      | ESLint (zero warnings allowed)    |
| `npm run typecheck` | TypeScript type checking          |
| `npm test`          | Unit tests                        |

---

## Project structure

```
easygenerator/
├── backend/
│   └── src/
│       ├── config/                 # env loading + validation
│       ├── common/filters/         # global exception filter
│       └── modules/
│           ├── auth/               # controller, service, DTOs, strategies, guards, hashing
│           ├── users/              # schema + data-access service
│           └── health/             # health controller
├── frontend/
│   └── src/
│       ├── lib/                    # axios instance, in-memory token store, cn(), query client
│       ├── components/ui/          # reusable components (Button + CVA variants, TextField, ThemeToggle…)
│       ├── routes/                 # route guards + path constants
│       └── features/
│           ├── auth/               # api, schemas, context, hooks, pages
│           ├── theme/              # ThemeProvider, context, useTheme
│           └── home/               # protected application page
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Design decisions

- **Feature-based modules on both sides.** Each feature owns its API, validation and UI/logic, which keeps the codebase navigable and changes localized.
- **`users` owns persistence, `auth` owns identity.** The auth service never touches the Mongoose model directly — it depends on `UsersService`. Single responsibility, easy to test.
- **Argon2id** for hashing (memory-hard, OWASP-recommended) wrapped in a small `HashingService` so it can be mocked in unit tests.
- **Password hash never leaves the server.** The schema sets `select: false`, and responses are explicitly mapped to a safe shape.
- **Access + refresh token strategy (production-oriented):**
  - Short-lived **access token (15 min)** is returned in the response body and held **only in memory** on the client — never in `localStorage`/`sessionStorage`, so it is not exposed to persistent XSS exfiltration.
  - Long-lived **refresh token (7 days)** is sent in an **`HttpOnly`, `Secure`, `SameSite`** cookie scoped to `/api/auth`, so JavaScript can never read it.
  - The refresh token is **rotated on every use**; only the Argon2 hash of the current token is stored on the user, which enables revocation (logout) and **reuse detection** (a stale token fails the hash check).
  - The Axios response interceptor **transparently refreshes** the access token on a `401` and replays the request (single-flight, so concurrent 401s share one refresh). If the refresh itself fails, the client clears state and **redirects to sign-in**.
  - On reload the access token is gone, so the app **bootstraps the session from the refresh cookie**.
  - _Tradeoff:_ a single refresh token per user (one active session) keeps the model simple; multi-device sessions would need a sessions collection. Concurrent refreshes from multiple tabs can trip reuse detection — acceptable for this scope.
- **Validation shared in spirit across the stack.** Zod on the client mirrors the class-validator rules on the server, so users get instant feedback while the server stays the source of truth.
- **UI variants via CVA + `tailwind-merge`.** The `Button` keeps all styling in one `cva` config keyed by variant — adding a variant is a one-line change with no conditional branching (open/closed). A `cn()` helper merges classes so a caller's `className` always wins. Styling lives in a separate `button-variants.ts` module so the component file stays Fast-Refresh friendly.
- **Theming via a `ThemeProvider` + Context.** Initial theme comes from `localStorage`, falling back to `prefers-color-scheme`; it is applied with Tailwind's `class` strategy on `<html>` and persisted. An inline boot script in `index.html` sets the class before paint to avoid a flash of the wrong theme. The context value is memoized to avoid unnecessary re-renders. _(The theme preference is non-sensitive, so `localStorage` is appropriate here — unlike the auth tokens.)_
- **Global `ValidationPipe` + exception filter** guarantee a single, predictable request-validation and error-response shape everywhere.

See [AI.md](AI.md) for how AI tooling was used during development.
