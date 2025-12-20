-- Create push_subscriptions table for web push notifications
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create unique index on user_id and endpoint to prevent duplicates
create unique index if not exists push_subscriptions_user_endpoint_idx
  on push_subscriptions (user_id, endpoint);

-- Create index on user_id for fast lookups
create index if not exists push_subscriptions_user_id_idx
  on push_subscriptions (user_id);

-- Enable RLS
alter table push_subscriptions enable row level security;

-- Create RLS policy for select - users can see their own subscriptions
create policy "Users can read their own push subscriptions"
  on push_subscriptions for select
  using (user_id = auth.uid());

-- Create RLS policy for insert - users can add their own subscriptions
create policy "Users can create their own push subscriptions"
  on push_subscriptions for insert
  with check (user_id = auth.uid());

-- Create RLS policy for update - users can update their own subscriptions
create policy "Users can update their own push subscriptions"
  on push_subscriptions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Create RLS policy for delete - users can delete their own subscriptions
create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  using (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
create or replace function update_push_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger push_subscriptions_updated_at before update on push_subscriptions
  for each row execute function update_push_subscriptions_updated_at();
