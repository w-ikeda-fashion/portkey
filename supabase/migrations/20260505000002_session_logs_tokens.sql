-- session_logs: AI作業セッション記録
create table public.session_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  summary text not null,
  model text not null,
  tokens_input integer not null default 0,
  tokens_output integer not null default 0,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  tags text[] not null default '{}',
  created_at timestamptz default now() not null
);

alter table public.session_logs enable row level security;

create policy "本人のみ参照可"
  on public.session_logs for select using (auth.uid() = user_id);

create policy "本人のみ挿入可"
  on public.session_logs for insert with check (auth.uid() = user_id);

create policy "本人のみ削除可"
  on public.session_logs for delete using (auth.uid() = user_id);

create index session_logs_user_id_created_at_idx
  on public.session_logs (user_id, created_at desc);

-- portkey_tokens: MCP認証用トークン（ハッシュのみ保存）
create table public.portkey_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  token_hash text not null unique,
  label text not null default 'My Token',
  created_at timestamptz default now() not null,
  last_used_at timestamptz
);

alter table public.portkey_tokens enable row level security;

create policy "本人のみ参照可"
  on public.portkey_tokens for select using (auth.uid() = user_id);

create policy "本人のみ挿入可"
  on public.portkey_tokens for insert with check (auth.uid() = user_id);

create policy "本人のみ削除可"
  on public.portkey_tokens for delete using (auth.uid() = user_id);

create index portkey_tokens_token_hash_idx
  on public.portkey_tokens (token_hash);
