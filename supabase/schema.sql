-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  cover_url text,
  tagline text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create Categories Table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  featured boolean default false,
  image_url text,
  post_count integer default 0
);

alter table categories enable row level security;
create policy "Categories are viewable by everyone." on categories for select using (true);
create policy "Only authenticated users can create categories." on categories for insert with check (auth.role() = 'authenticated');

-- Create Category Followers Table (Junction Table)
create table category_followers (
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, category_id)
);

alter table category_followers enable row level security;
create policy "Followers are viewable by everyone." on category_followers for select using (true);
create policy "Users can follow categories." on category_followers for insert with check (auth.uid() = user_id);
create policy "Users can unfollow categories." on category_followers for delete using (auth.uid() = user_id);

-- Create posts table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references profiles(id) not null,
  category_id uuid references categories(id),
  title text not null,
  slug text not null unique,
  description text,
  content text,
  html text,
  cover_image text,
  tags text[],
  published boolean default false,
  featured boolean default false,
  likes integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table posts enable row level security;

create policy "Published posts are viewable by everyone."
  on posts for select
  using ( published = true );

create policy "Users can view their own unpublished posts."
  on posts for select
  using ( auth.uid() = author_id );

create policy "Users can insert their own posts."
  on posts for insert
  with check ( auth.uid() = author_id );

create policy "Users can update own posts."
  on posts for update
  using ( auth.uid() = author_id );

create policy "Users can delete own posts."
  on posts for delete
  using ( auth.uid() = author_id );

-- Create a function to handle new user signups
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create Comments Table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references comments(id) on delete cascade,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;
create policy "Comments are viewable by everyone." on comments for select using (true);
create policy "Users can insert comments." on comments for insert with check (auth.uid() = author_id);
create policy "Users can delete own comments." on comments for delete using (auth.uid() = author_id);

-- Create Likes Table
create table likes (
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, post_id)
);

alter table likes enable row level security;
create policy "Likes are viewable by everyone." on likes for select using (true);
create policy "Users can insert their own likes." on likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes." on likes for delete using (auth.uid() = user_id);

-- Create Comment Likes Table
create table comment_likes (
  user_id uuid references profiles(id) on delete cascade not null,
  comment_id uuid references comments(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, comment_id)
);

alter table comment_likes enable row level security;
create policy "Comment likes are viewable by everyone." on comment_likes for select using (true);
create policy "Users can insert their own comment likes." on comment_likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comment likes." on comment_likes for delete using (auth.uid() = user_id);

-- Create Bookmarks Table
create table bookmarks (
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, post_id)
);

alter table bookmarks enable row level security;
create policy "Bookmarks are viewable by the user." on bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert their own bookmarks." on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete their own bookmarks." on bookmarks for delete using (auth.uid() = user_id);

-- Alter posts table to include category_id
alter table posts add column if not exists category_id uuid references categories(id) on delete set null;

-- RPC for incrementing likes
create or replace function increment_likes(p_id uuid)
returns void language sql security definer as $$
  update posts set likes = likes + 1 where id = p_id;
$$;

-- RPC for decrementing likes
create or replace function decrement_likes(p_id uuid)
returns void language sql security definer as $$
  update posts set likes = greatest(likes - 1, 0) where id = p_id;
$$;

-- RPC for incrementing comments
create or replace function increment_comments(p_id uuid)
returns void language sql security definer as $$
  update posts set comments_count = comments_count + 1 where id = p_id;
$$;

-- RPC for incrementing comment likes
create or replace function increment_comment_likes(c_id uuid)
returns void language sql security definer as $$
  update comments set likes = likes + 1 where id = c_id;
$$;

-- RPC for decrementing comment likes
create or replace function decrement_comment_likes(c_id uuid)
returns void language sql security definer as $$
  update comments set likes = greatest(likes - 1, 0) where id = c_id;
$$;

-- Create Reports Table
create table reports (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete set null,
  reason text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table reports enable row level security;
create policy "Reports are viewable by everyone." on reports for select using (true);
create policy "Anyone can insert reports." on reports for insert with check (true);

-- Add views_count to posts
alter table posts add column if not exists views_count integer default 0;

-- RPC for incrementing views safely
create or replace function increment_views(p_id uuid)
returns void language sql security definer as $$
  update posts set views_count = views_count + 1 where id = p_id;
$$;

-- Trigger to update category post_count
create or replace function update_category_post_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if (TG_OP = 'INSERT' and new.category_id is not null) then
    update categories set post_count = post_count + 1 where id = new.category_id;
  elsif (TG_OP = 'DELETE' and old.category_id is not null) then
    update categories set post_count = greatest(post_count - 1, 0) where id = old.category_id;
  elsif (TG_OP = 'UPDATE') then
    if (old.category_id is distinct from new.category_id) then
      if (old.category_id is not null) then
        update categories set post_count = greatest(post_count - 1, 0) where id = old.category_id;
      end if;
      if (new.category_id is not null) then
        update categories set post_count = post_count + 1 where id = new.category_id;
      end if;
    end if;
  end if;
  return null;
end;
$$;

create trigger on_post_category_change
  after insert or update or delete on posts
  for each row execute procedure update_category_post_count();
