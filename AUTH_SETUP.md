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
- `role` (`user` or `admin`)
- `createdAt` (timestamp)

The app also uses a `documents` table with:

- `user_id` (foreign key to `users.id`)
- `document_type`
- `file_name`
- `file_url`
- `storage_path`
- `mime_type`
- `created_at`

## 3) Seed Admin (Manual)

Admin signup is blocked by API by design.
Seed pre-created admin account manually:

```bash
npm run seed:admin
```

Default seed values:

- `email`: `admin@example.com`
- `password`: `Admin@123`
- `role`: `admin`

For production, change these values in `scripts/seed-admin.js` and rotate credentials after first login.

## 4) Login and Signup Behavior

- `/api/register` creates **only** `role = "user"` accounts.
- Credentials login supports both `user` and `admin` from the same table.
- Passwords are never stored in plain text.
- The signup form already captures phone number and stores it in `mobile_number`.

## 5) Storage Uploads

- `POST /api/uploads/avatar` uploads a profile photo to Supabase Storage and updates `avatar_path` plus `avatar_url` (when bucket is public).
- `POST /api/uploads/document` uploads selected documents to Supabase Storage, saves a `documents` record, and returns a public URL.
- `GET /api/documents` loads the authenticated user's uploaded documents.
- `DELETE /api/documents` removes a document record for the authenticated user.
- The navbar and dashboard use the database-backed profile image URL (or signed URL for private bucket) with a default avatar fallback.

## 6) Route Protection

- `src/app/admin/layout.jsx` uses `getServerSession()` and blocks non-admin users.
- `src/middleware.js` adds an additional guard for `/admin/*` routes.
