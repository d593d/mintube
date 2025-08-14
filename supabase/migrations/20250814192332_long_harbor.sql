/*
  # YouTube Automation Platform Database Schema

  1. New Tables
    - `content_ideas` - Store AI-generated content ideas
    - `scripts` - Store generated video scripts  
    - `voice_generations` - Store voice synthesis data
    - `videos` - Store video information and metadata
    - `channel_analytics` - Store channel performance data
    - `automation_jobs` - Track automation task progress
    - `automation_settings` - Store user automation preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data

  3. Functions
    - `update_automation_job_progress` - Update job progress and status
*/

-- Create users table reference (Supabase auth.users)
-- This is handled by Supabase Auth automatically

-- Create content_ideas table
CREATE TABLE IF NOT EXISTS content_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  category text,
  difficulty text,
  estimated_views text,
  competition text,
  keywords text[],
  description text,
  script_status text DEFAULT 'not_generated',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_idea_id uuid REFERENCES content_ideas(id),
  title text NOT NULL,
  duration text,
  style text,
  target_audience text,
  script_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create voice_generations table
CREATE TABLE IF NOT EXISTS voice_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  script_id uuid REFERENCES scripts(id),
  voice_id text NOT NULL,
  audio_url text,
  duration integer,
  created_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  script_id uuid REFERENCES scripts(id),
  title text NOT NULL,
  thumbnail_url text,
  video_url text,
  youtube_video_id text,
  status text DEFAULT 'draft',
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  revenue numeric(10,2) DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create channel_analytics table
CREATE TABLE IF NOT EXISTS channel_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  total_views integer DEFAULT 0,
  total_subscribers integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  watch_time_hours integer DEFAULT 0,
  videos_published integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create automation_jobs table
CREATE TABLE IF NOT EXISTS automation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text DEFAULT 'pending',
  job_type text NOT NULL,
  current_step text,
  progress integer DEFAULT 0,
  total_steps integer DEFAULT 5,
  content_idea_id uuid REFERENCES content_ideas(id),
  script_id uuid REFERENCES scripts(id),
  video_id uuid REFERENCES videos(id),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create automation_settings table
CREATE TABLE IF NOT EXISTS automation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_enabled boolean DEFAULT false,
  auto_generate_ideas boolean DEFAULT true,
  auto_generate_scripts boolean DEFAULT true,
  auto_generate_voice boolean DEFAULT true,
  auto_assemble_videos boolean DEFAULT true,
  auto_upload_youtube boolean DEFAULT false,
  generation_frequency text DEFAULT 'daily',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_ideas
CREATE POLICY "Users can manage their own content ideas"
  ON content_ideas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for scripts
CREATE POLICY "Users can manage their own scripts"
  ON scripts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for voice_generations
CREATE POLICY "Users can manage their own voice generations"
  ON voice_generations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for videos
CREATE POLICY "Users can manage their own videos"
  ON videos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for channel_analytics
CREATE POLICY "Users can manage their own analytics"
  ON channel_analytics
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for automation_jobs
CREATE POLICY "Users can manage their own automation jobs"
  ON automation_jobs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for automation_settings
CREATE POLICY "Users can manage their own automation settings"
  ON automation_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update automation job progress
CREATE OR REPLACE FUNCTION update_automation_job_progress(
  job_id uuid,
  new_status text,
  new_step text DEFAULT NULL,
  new_progress integer DEFAULT NULL,
  error_msg text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE automation_jobs
  SET 
    status = new_status,
    current_step = COALESCE(new_step, current_step),
    progress = COALESCE(new_progress, progress),
    error_message = error_msg,
    updated_at = now(),
    completed_at = CASE WHEN new_status IN ('completed', 'failed') THEN now() ELSE completed_at END,
    started_at = CASE WHEN started_at IS NULL AND new_status = 'running' THEN now() ELSE started_at END
  WHERE id = job_id AND user_id = auth.uid();
END;
$$;