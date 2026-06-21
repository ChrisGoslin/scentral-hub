-- Phase 8-F: Community Features — Wear & Share Forum + Creator Dashboard

-- 1. wear_posts table
CREATE TABLE public.wear_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fragrance_id uuid NOT NULL REFERENCES public.fragrances(id) ON DELETE CASCADE,
  caption text,
  wear_photo_url text,
  likes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS for wear_posts
ALTER TABLE public.wear_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all posts"
  ON public.wear_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.wear_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.wear_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.wear_posts FOR DELETE
  USING (auth.uid() = user_id);

-- 2. post_likes table
CREATE TABLE public.post_likes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.wear_posts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- RLS for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create likes"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. creator_reels table
CREATE TABLE public.creator_reels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  thumbnail_url text,
  views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS for creator_reels
ALTER TABLE public.creator_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published reels"
  ON public.creator_reels FOR SELECT
  USING (true);

CREATE POLICY "Creators can create reels"
  ON public.creator_reels FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own reels"
  ON public.creator_reels FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their own reels"
  ON public.creator_reels FOR DELETE
  USING (auth.uid() = creator_id);

-- Indexes for performance
CREATE INDEX idx_wear_posts_user_id ON public.wear_posts(user_id);
CREATE INDEX idx_wear_posts_fragrance_id ON public.wear_posts(fragrance_id);
CREATE INDEX idx_wear_posts_created_at ON public.wear_posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_creator_reels_creator_id ON public.creator_reels(creator_id);
CREATE INDEX idx_creator_reels_created_at ON public.creator_reels(created_at DESC);

-- Function to increment like count on wear_posts
CREATE OR REPLACE FUNCTION increment_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.wear_posts
  SET likes = likes + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_likes
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION increment_post_likes();

-- Function to decrement like count on wear_posts
CREATE OR REPLACE FUNCTION decrement_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.wear_posts
  SET likes = likes - 1
  WHERE id = OLD.post_id AND likes > 0;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_likes
AFTER DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_post_likes();
