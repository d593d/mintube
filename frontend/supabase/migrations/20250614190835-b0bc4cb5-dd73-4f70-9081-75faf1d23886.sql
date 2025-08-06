
-- Create table for storing generated content ideas
CREATE TABLE public.content_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  estimated_views TEXT,
  competition TEXT,
  keywords TEXT[],
  description TEXT,
  script_status TEXT DEFAULT 'not_generated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing generated scripts
CREATE TABLE public.scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  content_idea_id UUID REFERENCES public.content_ideas,
  title TEXT NOT NULL,
  duration TEXT,
  style TEXT,
  target_audience TEXT,
  script_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing voice generations
CREATE TABLE public.voice_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  script_id UUID REFERENCES public.scripts,
  voice_id TEXT NOT NULL,
  audio_url TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing videos
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  script_id UUID REFERENCES public.scripts,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  video_url TEXT,
  youtube_video_id TEXT,
  status TEXT DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing channel analytics
CREATE TABLE public.channel_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  date DATE NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_subscribers INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  watch_time_hours INTEGER DEFAULT 0,
  videos_published INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_ideas
CREATE POLICY "Users can view their own content ideas" ON public.content_ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own content ideas" ON public.content_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content ideas" ON public.content_ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content ideas" ON public.content_ideas FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scripts
CREATE POLICY "Users can view their own scripts" ON public.scripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own scripts" ON public.scripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scripts" ON public.scripts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scripts" ON public.scripts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for voice_generations
CREATE POLICY "Users can view their own voice generations" ON public.voice_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own voice generations" ON public.voice_generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own voice generations" ON public.voice_generations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own voice generations" ON public.voice_generations FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for videos
CREATE POLICY "Users can view their own videos" ON public.videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own videos" ON public.videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own videos" ON public.videos FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for channel_analytics
CREATE POLICY "Users can view their own analytics" ON public.channel_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analytics" ON public.channel_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analytics" ON public.channel_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analytics" ON public.channel_analytics FOR DELETE USING (auth.uid() = user_id);
