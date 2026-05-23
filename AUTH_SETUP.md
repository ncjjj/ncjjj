# Authentication Setup (NextAuth + Drizzle + Supabase Postgres)

## 1) Environment Variables

Create `.env.local` from `.env.example` and set real values:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_STORAGE_PUBLIC` (`true` for public bucket, `false` for private bucket)

For admin login, the default seeded account is `admin@gmail.com / Admin@124`.

Use `npm run db:admin` after migrations to upsert the admin credential into the `admin_accounts` table. If you want to override the defaults for a different admin, you can still set `ADMIN_ID`, `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, or `ADMIN_PASSWORD_HASH` before running the script.

For private buckets, the app serves signed URLs for avatars at runtime. For public buckets, it stores and serves public URLs.

## 2) Create Users Table

Run migrations and push schema (if needed):

```bash
npm run db:migrate
npm run db:generate
npm run db:push
```

`db:migrate` applies SQL files from `drizzle/*.sql` in order and tracks them in `public._app_migrations`.

The app uses a single `users` table with:

- `id` (primary key)
- `name` (required)
- `mobile_number` (required)
- `avatar_path` (optional, storage object path)
- `avatar_url` (optional, persisted public URL when bucket is public)
- `email` (required, unique)
- `password` (required, bcrypt hash)
- `createdAt` (timestamp)

The app also uses a `documents` table with:

- `user_id` (foreign key to `users.id`)
- `document_type`
- `file_name`
- `file_url`
- `storage_path`
- `mime_type`
- `created_at`

## 3) Login and Signup Behavior

- `/api/register` creates regular user accounts.
- Credentials login reads from the `users` table.
- Passwords are never stored in plain text.
- The signup form already captures phone number and stores it in `mobile_number`.

## 4) Storage Uploads

- `POST /api/uploads/avatar` uploads a profile photo to Supabase Storage and updates `avatar_path` plus `avatar_url` (when bucket is public).
- `POST /api/uploads/document` uploads selected documents to Supabase Storage, saves a `documents` record, and returns a public URL.
- `GET /api/documents` loads the authenticated user's uploaded documents.
- `DELETE /api/documents` removes a document record for the authenticated user.
- The navbar and dashboard use the database-backed profile image URL (or signed URL for private bucket) with a default avatar fallback.

## 5) Admin Credentials

Use `npm run db:admin` to upsert the admin credential into the database. By default it seeds `admin@gmail.com / Admin@124` and stores a bcrypt hash in `admin_accounts`.
