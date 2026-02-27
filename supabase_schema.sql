-- SUPABASE DATABASE SETUP FOR HYU44E PORTFOLIO
-- Run this block in the Supabase SQL Editor to set up tables and storage.

-- 1. Create the blog_posts table
create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the songs table
create table public.songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  audio_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Set up Row Level Security (RLS)
-- Enable RLS
alter table public.blog_posts enable row level security;
alter table public.songs enable row level security;

-- Create policies for public reading (anyone can read)
create policy "Public blog posts are viewable by everyone." on public.blog_posts for select using (true);
create policy "Public songs are viewable by everyone." on public.songs for select using (true);

-- Create policies for admin full access (requires authenticated users)
-- Assuming the admin will be the only authenticated user on this project.
create policy "Admins can insert blog posts." on public.blog_posts for insert with check (auth.role() = 'authenticated');
create policy "Admins can update blog posts." on public.blog_posts for update using (auth.role() = 'authenticated');
create policy "Admins can delete blog posts." on public.blog_posts for delete using (auth.role() = 'authenticated');

create policy "Admins can insert songs." on public.songs for insert with check (auth.role() = 'authenticated');
create policy "Admins can update songs." on public.songs for update using (auth.role() = 'authenticated');
create policy "Admins can delete songs." on public.songs for delete using (auth.role() = 'authenticated');

-- 4. Setup Storage
-- Create 'audio' bucket for music and 'images' bucket (optional)
insert into storage.buckets (id, name, public) values ('audio', 'audio', true);

-- Storage Policies
create policy "Audio bucket is publicly readable" on storage.objects for select using (bucket_id = 'audio');
create policy "Authenticated users can upload audio" on storage.objects for insert with check (bucket_id = 'audio' and auth.role() = 'authenticated');
create policy "Authenticated users can update audio" on storage.objects for update using (bucket_id = 'audio' and auth.role() = 'authenticated');
create policy "Authenticated users can delete audio" on storage.objects for delete using (bucket_id = 'audio' and auth.role() = 'authenticated');
