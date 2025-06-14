
-- Create automation jobs table to track automation tasks
CREATE TABLE public.automation_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  job_type TEXT NOT NULL,
  current_step TEXT,
  progress INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 5,
  content_idea_id UUID REFERENCES public.content_ideas(id),
  script_id UUID REFERENCES public.scripts(id),
  video_id UUID REFERENCES public.videos(id),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation settings table
CREATE TABLE public.automation_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  auto_generate_ideas BOOLEAN DEFAULT true,
  auto_generate_scripts BOOLEAN DEFAULT true,
  auto_generate_voice BOOLEAN DEFAULT true,
  auto_assemble_videos BOOLEAN DEFAULT true,
  auto_upload_youtube BOOLEAN DEFAULT false,
  generation_frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for automation_jobs
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation jobs" 
  ON public.automation_jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automation jobs" 
  ON public.automation_jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation jobs" 
  ON public.automation_jobs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for automation_settings
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation settings" 
  ON public.automation_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automation settings" 
  ON public.automation_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation settings" 
  ON public.automation_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to update automation job progress
CREATE OR REPLACE FUNCTION update_automation_job_progress(
  job_id UUID,
  new_status TEXT,
  new_step TEXT DEFAULT NULL,
  new_progress INTEGER DEFAULT NULL,
  error_msg TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.automation_jobs
  SET 
    status = new_status,
    current_step = COALESCE(new_step, current_step),
    progress = COALESCE(new_progress, progress),
    error_message = error_msg,
    updated_at = now(),
    completed_at = CASE WHEN new_status IN ('completed', 'failed') THEN now() ELSE completed_at END,
    started_at = CASE WHEN started_at IS NULL AND new_status = 'running' THEN now() ELSE started_at END
  WHERE id = job_id;
END;
$$;
