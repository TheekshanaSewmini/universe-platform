# Universe Platform

Universe Platform is a full-stack university services application for students and staff. It includes authentication, lost-and-found listings, library seat booking, and study material sharing.

## Features

- User registration, login, email verification, password reset, and role-based access
- Lost-and-found item posting, browsing, updates, and suggestions
- Library seat availability checks, booking, cancellation, and librarian management
- Study material courses, subjects, uploads, versions, public/private visibility, and owner controls

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Axios |
| Backend | Java, Spring Boot, Spring Security, Spring Data JPA |
| Database | PostgreSQL |
| Auth | JWT stored in HttpOnly cookies |
| Build Tools | npm, Maven |

## Project Structure

```text
universe-platform/
  backend/    Spring Boot API
  frontend/   React/Vite client
```

Generated folders, uploaded files, IDE metadata, and local environment files are ignored and should not be committed.

## Environment Setup

Copy the example files and fill in local values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Required backend secrets are loaded from environment variables:

- `DB_PASSWORD`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `JWT_SECRET`

Do not commit real `.env` files or uploaded user content.

## Run Locally

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4040`

## Security Notes

- Rotate any database, email, or JWT secrets that were previously committed.
- Keep `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=None` for HTTPS deployments that need cross-site cookies.
- Use `COOKIE_SECURE=false` only for local HTTP testing.
- Keep `CORS_ALLOWED_ORIGINS` limited to trusted frontend origins.
