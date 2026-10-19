# Shakil Store

Public static website for APK and source-code downloads. Catalog metadata is stored in Supabase Postgres and binary files are stored in the `store-files` Storage bucket.

## Deployment
- Render Static Site: repository root, publish directory `.`, no build command.
- Auto-deploy from `main` is enabled when connected in Render.
- Frontend config is in `app.js` and uses the Supabase project URL plus publishable key. Never place a Supabase service-role/secret key in frontend files.

## Admin bootstrap (required once)
1. In Supabase Dashboard → Authentication → Users, create an admin account using an email and a strong password.
2. Copy that user's UUID.
3. Run this SQL in Supabase SQL Editor, replacing the UUID:
   ```sql
   insert into public.admin_users(user_id) values ('PASTE-USER-UUID-HERE')
   on conflict (user_id) do nothing;
   ```
4. Sign in to the website's Admin panel with that email and password. Only users listed in `public.admin_users` can upload, edit, or delete content.
5. Keep public sign-ups disabled unless needed; create admins from the Supabase Dashboard.

## File upload size
The `store-files` bucket is currently configured with a 50 MiB per-file limit. The actual maximum is also constrained by the Supabase plan and upload method. Large videos should use resumable/TUS uploads and an appropriately configured plan; this simple browser uploader is intended for files up to the configured 50 MiB cap.

## Database
Schema and RLS/storage policies are in `supabase/migrations/202610190001_shakil_store.sql`.
