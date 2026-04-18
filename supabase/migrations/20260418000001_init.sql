-- usersテーブル（Supabase authと連携）
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  name text,
  bio text,
  avatar_url text,
  ai_tools jsonb default '[]'::jsonb,
  domains jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- usernameのバリデーション（英数字・ハイフンのみ）
alter table public.users
  add constraint username_format check (username ~ '^[a-z0-9-]+$');

-- achievementsテーブル
create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  category text check (category in ('webapp', 'business')),
  ai_tools jsonb default '[]'::jsonb,
  outcome text,
  url text,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- RLS有効化
alter table public.users enable row level security;
alter table public.achievements enable row level security;

-- usersのRLSポリシー
create policy "公開プロフィールは誰でも参照可"
  on public.users for select using (true);

create policy "本人のみ更新可"
  on public.users for update using (auth.uid() = id);

create policy "本人のみ挿入可"
  on public.users for insert with check (auth.uid() = id);

-- achievementsのRLSポリシー
create policy "公開成果物は誰でも参照可"
  on public.achievements for select
  using (is_public = true or auth.uid() = user_id);

create policy "本人のみ挿入可"
  on public.achievements for insert with check (auth.uid() = user_id);

create policy "本人のみ更新可"
  on public.achievements for update using (auth.uid() = user_id);

create policy "本人のみ削除可"
  on public.achievements for delete using (auth.uid() = user_id);

-- 新規登録時にusersレコードを自動作成するトリガー
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, username, name)
  values (
    new.id,
    -- メールのローカル部をデフォルトusernameに（重複時は連番付与）
    regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9-]', '-', 'g'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
