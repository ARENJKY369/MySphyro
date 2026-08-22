-- Apply with: supabase db push, or paste into the Supabase SQL editor.
create table if not exists public.resources (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 type text not null check (type in ('tasks','documents','expenses','plans','personal','classes','activities')),
 data jsonb not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists resources_user_type_updated on public.resources(user_id, type, updated_at desc);
create table if not exists public.dashboard_states (user_id uuid primary key references auth.users(id) on delete cascade, state jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.uploads (filename text primary key, user_id uuid not null references auth.users(id) on delete cascade, original_name text not null, mime_type text not null, size bigint not null check(size >= 0), created_at timestamptz not null default now());
alter table public.resources enable row level security; alter table public.dashboard_states enable row level security; alter table public.uploads enable row level security;
create policy "own resources" on public.resources for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own dashboard state" on public.dashboard_states for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own uploads" on public.uploads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private object storage used by the Vercel serverless upload endpoint.
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;
create policy "private document owner access" on storage.objects for all using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]) with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
