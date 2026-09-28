# faceb0ok backend

Independent educational authentication API for **faceb0ok**. It does not connect to Facebook, Meta, OAuth providers, or external credential services.

## Setup

Requirements: Node.js 20+, npm, and PostgreSQL.

```bash
cd backend
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to a PostgreSQL database and replace `JWT_SECRET` with a long random value. The default server is `http://localhost:5000` and accepts credentialed requests from `FRONTEND_URL` (`http://localhost:3000` by default).

The values in `.env.example` are placeholders and must not be used literally. For a local Linux PostgreSQL installation, create a development role and database as the PostgreSQL administrator:

```bash
sudo -u postgres createuser --createdb faceb0ok_user
sudo -u postgres createdb --owner=faceb0ok_user faceb0ok
```

Then set this value in `.env` (choose a password only if you configure one for the role):

```dotenv
DATABASE_URL="postgresql://faceb0ok_user@localhost:5432/faceb0ok"
JWT_SECRET="replace-with-a-long-random-secret"
```

If the role already has a password, use `postgresql://faceb0ok_user:YOUR_PASSWORD@localhost:5432/faceb0ok` instead. Verify the connection before running Prisma:

```bash
psql "postgresql://faceb0ok_user@localhost:5432/faceb0ok" -c "SELECT 1;"
```

When PostgreSQL is managed remotely or through Docker, use the host, port, role, password, and database supplied by that installation instead.

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

For a production build:

```bash
npm run build
npm start
```

The demo account is `demo@faceb0ok.local` with password `DemoPassword123!` and username `demo_user`.

## API

All endpoints are under `/api/auth`. Authentication uses the `faceb0ok_token` HTTP-only cookie. The frontend must use `credentials: "include"`.

### `POST /api/auth/register`

Authentication: not required.

Request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123!",
  "dateOfBirth": "2000-01-01"
}
```

Success: `201 Created`, `{ "user": { ... } }`, plus an HTTP-only cookie.

Errors: `400` validation failure, `409` duplicate email or username.

### `POST /api/auth/login`

Authentication: not required.

Request: `{ "email": "john@example.com", "password": "Password123!" }`.

Success: `200 OK`, `{ "user": { ... } }`, plus an HTTP-only cookie.

Errors: `400` validation failure, `401` `{ "message": "Invalid email or password" }`, `429` rate limit.

### `POST /api/auth/logout`

Authentication: not required. Clears the cookie and returns `200 OK` with `{ "message": "Logged out successfully" }`. Safe to call repeatedly.

### `GET /api/auth/me`

Authentication: required via cookie.

Success: `200 OK` with `{ "user": { "id", "firstName", "lastName", "username", "email", "dateOfBirth", "createdAt" } }`.

Errors: `401` for a missing, invalid, expired, or deleted-user session.

### `POST /api/auth/forgot-password`

Authentication: not required.

Request: `{ "email": "john@example.com" }`.

Success: `200 OK` with `{ "message": "If an account exists for this email, password-reset instructions would be sent." }`. This response is identical for known and unknown addresses.

Errors: `400` validation failure, `429` rate limit.

## Tests

The integration suite exercises registration, validation, invalid login, protected access, forgot-password privacy, and logout. Provide a test PostgreSQL `DATABASE_URL`, apply the migration, then run:

```bash
npm test
```

Without `DATABASE_URL`, the database-dependent integration suite is skipped. Prisma parameterizes database operations, and passwords are bcrypt-hashed before storage.

## Authentication flow

The Next.js frontend sends JSON with credentials enabled. Express validates the request, the auth service checks or creates the Prisma `User`, and bcrypt handles password verification. A JWT containing only the user ID is signed with `JWT_SECRET` and stored in an HTTP-only cookie. Protected requests verify that cookie and load a safe user projection from PostgreSQL; the JWT and password hash never appear in JSON responses.