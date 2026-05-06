create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  billing_interval text check (billing_interval in ('month', 'year')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "本人のみ参照可"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "本人のみ挿入可"
  on public.subscriptions for insert with check (auth.uid() = user_id);
