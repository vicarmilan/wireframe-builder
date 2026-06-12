-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  client_name text not null,
  logo_url text,
  owner_id text not null, -- Clerk user ID
  preview_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pages table
create table pages (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  slug text not null,
  parent_id uuid references pages(id) on delete set null,
  "order" int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, slug)
);

-- Page components table
create table page_components (
  id uuid primary key default uuid_generate_v4(),
  page_id uuid not null references pages(id) on delete cascade,
  component_type text not null,
  component_variant text not null,
  "order" int not null default 0,
  props jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments table
create table comments (
  id uuid primary key default uuid_generate_v4(),
  page_component_id uuid not null references page_components(id) on delete cascade,
  author_id text not null,
  author_name text not null,
  author_email text not null,
  content text not null,
  resolved boolean not null default false,
  created_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();

create trigger pages_updated_at before update on pages
  for each row execute function update_updated_at();

create trigger page_components_updated_at before update on page_components
  for each row execute function update_updated_at();

-- RLS policies
alter table projects enable row level security;
alter table pages enable row level security;
alter table page_components enable row level security;
alter table comments enable row level security;

-- Admins can do everything (Clerk user ID matches owner_id)
create policy "owners can manage projects"
  on projects for all
  using (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "owners can manage pages"
  on pages for all
  using (
    project_id in (
      select id from projects
      where owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

create policy "owners can manage components"
  on page_components for all
  using (
    page_id in (
      select p.id from pages p
      join projects pr on pr.id = p.project_id
      where pr.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Anyone with preview_token can read
create policy "preview can read projects"
  on projects for select
  using (true);

create policy "preview can read pages"
  on pages for select
  using (true);

create policy "preview can read components"
  on page_components for select
  using (true);

-- Comments: anyone with preview access can insert, owners can update/delete
create policy "anyone can comment"
  on comments for insert
  with check (true);

create policy "anyone can read comments"
  on comments for select
  using (true);

create policy "owners can resolve comments"
  on comments for update
  using (
    page_component_id in (
      select pc.id from page_components pc
      join pages p on p.id = pc.page_id
      join projects pr on pr.id = p.project_id
      where pr.owner_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
