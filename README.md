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
- JWT access tokens, passwords hashed with **Argon2id**
- Protected `/auth/me` endpoint guarded by `JwtAuthGuard`
- Route protection on the front end, redirect of authenticated users, graceful handling of expired tokens
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

| Variable          | Required | Default                 | Description                                   |
| ----------------- | -------- | ----------------------- | --------------------------------------------- |
| `NODE_ENV`        | no       | `development`           | Runtime environment                           |
| `PORT`            | no       | `3000`                  | HTTP port                                     |
| `CORS_ORIGIN`     | no       | `http://localhost:5173` | Comma-separated list of allowed origins       |
| `MONGODB_URI`     | **yes**  | —                       | MongoDB connection string                     |
| `JWT_SECRET`      | **yes**  | —                       | JWT signing secret (min 16 chars)             |
| `JWT_EXPIRES_IN`  | no       | `1h`                    | Access token lifetime                         |
| `THROTTLE_TTL`    | no       | `60000`                 | Rate-limit window in milliseconds             |
| `THROTTLE_LIMIT`  | no       | `100`                   | Max requests per window per IP                |

Configuration is validated at boot — the app refuses to start with an invalid environment.

### Frontend (`frontend/.env`)

| Variable       | Required | Default                       | Description           |
| -------------- | -------- | ----------------------------- | --------------------- |
| `VITE_API_URL` | no       | `http://localhost:3000/api`   | Base URL of the API   |

---

## API endpoints

Base path: `/api`

| Method | Endpoint        | Auth   | Description                                  | Success |
| ------ | --------------- | ------ | -------------------------------------------- | ------- |
| POST   | `/auth/signup`  | —      | Register and receive an access token         | `201`   |
| POST   | `/auth/signin`  | —      | Authenticate and receive an access token     | `200`   |
| GET    | `/auth/me`      | Bearer | Get the current authenticated user           | `200`   |
| GET    | `/health`       | —      | Liveness probe incl. MongoDB connectivity    | `200`   |
| GET    | `/docs`         | —      | Swagger UI                                   | —       |

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
│           ├── auth/               # controller, service, DTOs, strategy, guard, hashing
│           ├── users/              # schema + data-access service
│           └── health/             # health controller
├── frontend/
│   └── src/
│       ├── lib/                    # axios instance, token storage, query client
│       ├── components/ui/          # reusable presentational components
│       ├── routes/                 # route guards + path constants
│       └── features/
│           ├── auth/               # api, schemas, context, hooks, pages
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
- **Access token only (no refresh token).** The assignment calls for an access token; refresh-token rotation adds meaningful complexity (storage, revocation) that is out of scope.
- **Token stored in `localStorage` with an Axios interceptor.** Simple, works across tabs, and a response interceptor clears the token and triggers logout on any `401`, which covers expiry gracefully. _Tradeoff:_ `localStorage` is readable by JavaScript, so it is vulnerable to XSS; an `httpOnly` cookie would be more secure but requires CSRF handling and same-site/cookie infrastructure — documented as a deliberate scope choice.
- **Validation shared in spirit across the stack.** Zod on the client mirrors the class-validator rules on the server, so users get instant feedback while the server stays the source of truth.
- **Global `ValidationPipe` + exception filter** guarantee a single, predictable request-validation and error-response shape everywhere.

See [AI.md](AI.md) for how AI tooling was used during development.
