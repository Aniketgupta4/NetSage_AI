# NetSage AI — PostgreSQL + JWT upgrade

## What's added
- PostgreSQL persistence using SQLAlchemy 2.x and psycopg 3.
- Signup/login with JWT bearer tokens and Argon2 password hashes.
- User and admin roles. Public signup always creates a `user`; the first admin is provisioned only from `ADMIN_EMAIL` + `ADMIN_PASSWORD` environment variables.
- Authenticated diagnosis creation/history and user-scoped review records.
- Shared historical case library remains read-only and available to signed-in users.

## Windows setup
1. Install PostgreSQL and create a database named `netsage_ai` (pgAdmin: Databases > Create > Database).
2. In the project root, copy `.env.example` to `.env`.
3. Set `DATABASE_URL` to your local PostgreSQL username/password, for example `postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/netsage_ai`.
4. Replace `JWT_SECRET_KEY` with a long random secret. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` for the initial admin account. Never commit `.env`.
5. Install backend dependencies: `pip install -r backend/requirements.txt`.
6. Start backend from the project root: `python -m uvicorn backend.main:app --reload`.
7. Start frontend: `cd frontend`, `npm install`, `npm run dev`.
8. Open the frontend and create a user account. Login with the admin credentials configured in `.env` to access the admin role.

The application creates tables on startup for a fresh local setup. Alembic configuration and an initial migration are included for schema evolution (`alembic -c backend/alembic.ini upgrade head` from the project root, after dependencies and database are configured).

## API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT required)
- `POST /api/diagnosis` (JWT required; saves owner-scoped record)
- `GET /api/diagnosis/history` (JWT required; only own records)
- `GET /api/reviews` and `POST /api/reviews` (JWT required; own records only)
- `GET /api/dashboard` (JWT required; personal diagnosis/review metrics)
- `GET /api/cases` (shared historical reference catalog)

## Important scope notes
- This upgrade preserves the existing deterministic rules, Gemini service, React case library and navigation. Existing JSON files are retained as legacy/export artifacts; new diagnosis and review writes go to PostgreSQL.
- Historical cases are still loaded from `data/cases.csv`; the `historical_cases` table is a planned next migration, not populated by this initial release.
- Admin role provisioning is implemented, but a full admin management UI (user activation/deactivation and case CRUD) is not included yet.
- Forgot-password email, refresh-token rotation, rate limiting, audit trail and production deployment hardening remain future work.
