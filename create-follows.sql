-- Execute this in the Supabase SQL Editor

CREATE TABLE public.follows (
    follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Allow users to read all follows
CREATE POLICY "Allow public read access on follows" ON public.follows
    FOR SELECT USING (true);

-- Allow authenticated users to follow people
CREATE POLICY "Allow authenticated to follow" ON public.follows
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

-- Allow authenticated users to unfollow people
CREATE POLICY "Allow authenticated to unfollow" ON public.follows
    FOR DELETE TO authenticated USING (auth.uid() = follower_id);
