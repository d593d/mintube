
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AutomationJob {
  id: string;
  status: string;
  job_type: string;
  current_step: string | null;
  progress: number;
  total_steps: number;
  content_idea_id: string | null;
  script_id: string | null;
  video_id: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationSettings {
  id: string;
  is_enabled: boolean;
  auto_generate_ideas: boolean;
  auto_generate_scripts: boolean;
  auto_generate_voice: boolean;
  auto_assemble_videos: boolean;
  auto_upload_youtube: boolean;
  generation_frequency: string;
}

export const useAutomation = () => {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [settings, setSettings] = useState<AutomationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentJob, setCurrentJob] = useState<AutomationJob | null>(null);

  const fetchJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobs(data || []);
      
      // Set current job to the most recent running job
      const runningJob = data?.find(job => job.status === 'running');
      setCurrentJob(runningJob || null);
    } catch (error: any) {
      console.error('Error fetching automation jobs:', error);
      toast.error('Failed to load automation jobs');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('automation_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('automation_settings')
          .insert([{ user_id: user.id }])
          .select()
          .single();
        
        if (createError) throw createError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error fetching automation settings:', error);
      toast.error('Failed to load automation settings');
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobType: string, contentIdeaId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('automation_jobs')
        .insert([{
          user_id: user.id,
          job_type: jobType,
          content_idea_id: contentIdeaId,
          current_step: 'Initializing...',
          progress: 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setJobs(prev => [data, ...prev]);
        setCurrentJob(data);
        toast.success(`${jobType} automation started`);
        return data;
      }
    } catch (error: any) {
      console.error('Error creating automation job:', error);
      toast.error('Failed to start automation');
      throw error;
    }
  };

  const updateJobProgress = async (jobId: string, status: string, step?: string, progress?: number, errorMsg?: string) => {
    try {
      const { error } = await supabase.rpc('update_automation_job_progress', {
        job_id: jobId,
        new_status: status,
        new_step: step,
        new_progress: progress,
        error_msg: errorMsg
      });

      if (error) throw error;

      // Update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status, 
              current_step: step || job.current_step,
              progress: progress !== undefined ? progress : job.progress,
              error_message: errorMsg || job.error_message
            }
          : job
      ));

      if (currentJob?.id === jobId) {
        setCurrentJob(prev => prev ? {
          ...prev,
          status,
          current_step: step || prev.current_step,
          progress: progress !== undefined ? progress : prev.progress,
          error_message: errorMsg || prev.error_message
        } : null);
      }
    } catch (error: any) {
      console.error('Error updating job progress:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AutomationSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('automation_settings')
        .update(newSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
        toast.success('Automation settings updated');
      }
    } catch (error: any) {
      console.error('Error updating automation settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const startAutomation = async () => {
    if (!settings) return;
    
    await updateSettings({ is_enabled: true });
    await createJob('full_pipeline');
  };

  const pauseAutomation = async () => {
    if (!settings) return;
    
    await updateSettings({ is_enabled: false });
    
    if (currentJob && currentJob.status === 'running') {
      await updateJobProgress(currentJob.id, 'paused', 'Automation paused by user');
      setCurrentJob(null);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSettings();
  }, []);

  return {
    jobs,
    settings,
    currentJob,
    loading,
    createJob,
    updateJobProgress,
    updateSettings,
    startAutomation,
    pauseAutomation,
    refetch: () => {
      fetchJobs();
      fetchSettings();
    }
  };
};
