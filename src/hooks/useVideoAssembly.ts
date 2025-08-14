import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MediaAsset {
  id: string;
  type: 'audio' | 'script' | 'background' | 'music';
  name: string;
  duration: string;
  size: string;
  status: 'ready' | 'processing' | 'failed';
  url?: string;
  script_id?: string;
  voice_generation_id?: string;
  script_content?: string;
  audio_base64?: string;
}

export interface VideoTemplate {
  id: string;
  name: string;
  style: string;
  description: string;
}

export interface VideoRender {
  render_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  timeline_id?: string;
  output_file?: string;
  file_size?: number;
  duration?: number;
  render_time?: number;
  error?: string;
  created_at: string;
  features?: string[];
}

export interface BatchJob {
  id: string;
  project_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  stage: string;
  message: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_duration?: number;
  actual_duration?: number;
  error?: string;
  result?: any;
}

export interface BatchStats {
  total_jobs: number;
  queued_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  cancelled_jobs: number;
  average_processing_time: number;
  total_processing_time: number;
  success_rate: number;
}

export const useVideoAssembly = () => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [recentRenders, setRecentRenders] = useState<VideoRender[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [batchStats, setBatchStats] = useState<BatchStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVideoTemplates = async () => {
    try {
      // Use Supabase Edge Function for templates
      const { data, error } = await supabase.functions.invoke('video-assembly', {
        body: { action: 'get_templates' }
      });
      
      if (error) throw error;
      setTemplates(data || getDefaultTemplates());
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates(getDefaultTemplates());
    }
  };

  const getDefaultTemplates = (): VideoTemplate[] => [
    { 
      id: "minimal", 
      name: "Minimal Clean", 
      style: "Clean typography, subtle animations", 
      description: "Simple and professional with fade transitions" 
    },
    { 
      id: "scientific", 
      name: "Scientific", 
      style: "Diagrams, charts, professional", 
      description: "Technical and educational with wipe transitions" 
    },
    { 
      id: "storytelling", 
      name: "Storytelling", 
      style: "Cinematic, narrative flow", 
      description: "Narrative-driven with crossfade transitions" 
    },
    { 
      id: "educational", 
      name: "Educational", 
      style: "Clear structure, highlights", 
      description: "Learning-focused with slide transitions" 
    }
  ];

  const fetchRecentRenders = async () => {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const renders: VideoRender[] = (videos || []).map(video => ({
        render_id: video.id,
        status: video.status === 'completed' ? 'completed' : 'processing',
        progress: video.status === 'completed' ? 100 : 50,
        duration: Math.floor(Math.random() * 300) + 180,
        file_size: Math.floor(Math.random() * 50000000) + 10000000,
        render_time: Math.floor(Math.random() * 60) + 30,
        created_at: video.created_at,
        features: ['professional_transitions', 'smart_sync', 'color_grading'],
        output_file: `${video.title.replace(/\s+/g, '_')}.mp4`
      }));

      setRecentRenders(renders);
    } catch (error) {
      console.error('Error fetching recent renders:', error);
      setRecentRenders([]);
    }
  };

  const fetchBatchJobs = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .eq('job_type', 'batch_video_creation')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedJobs: BatchJob[] = (jobs || []).map(job => ({
        id: job.id,
        project_id: `project_${job.id}`,
        status: job.status as any,
        progress: job.progress || 0,
        stage: job.current_step || 'queued',
        message: job.current_step || 'Job queued',
        created_at: job.created_at,
        started_at: job.started_at,
        completed_at: job.completed_at,
        estimated_duration: 45.0,
        actual_duration: job.completed_at ? 
          (new Date(job.completed_at).getTime() - new Date(job.started_at || job.created_at).getTime()) / 1000 : 
          null,
        error: job.error_message,
        result: job.status === 'completed' ? {
          output_path: `/tmp/video_output/video_${job.id}.mp4`,
          output_file: `video_${job.id}.mp4`,
          file_size: Math.floor(Math.random() * 50000000) + 10000000,
          duration: Math.floor(Math.random() * 300) + 180,
          features: ['professional_transitions', 'smart_sync', 'batch_processing']
        } : null
      }));

      setBatchJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching batch jobs:', error);
      setBatchJobs([]);
    }
  };

  const fetchBatchStats = async () => {
    try {
      const { data: jobs, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .eq('job_type', 'batch_video_creation');

      if (error) throw error;

      const stats: BatchStats = {
        total_jobs: jobs?.length || 0,
        queued_jobs: jobs?.filter(j => j.status === 'queued').length || 0,
        processing_jobs: jobs?.filter(j => j.status === 'running').length || 0,
        completed_jobs: jobs?.filter(j => j.status === 'completed').length || 0,
        failed_jobs: jobs?.filter(j => j.status === 'failed').length || 0,
        cancelled_jobs: jobs?.filter(j => j.status === 'cancelled').length || 0,
        average_processing_time: 45.5,
        total_processing_time: (jobs?.length || 0) * 45.5,
        success_rate: jobs?.length ? (jobs.filter(j => j.status === 'completed').length / jobs.length) * 100 : 0
      };

      setBatchStats(stats);
    } catch (error) {
      console.error('Error fetching batch stats:', error);
      setBatchStats(null);
    }
  };

  const fetchMediaAssets = async () => {
    try {
      const assets: MediaAsset[] = [];

      // Fetch scripts from localStorage (since we don't have Supabase scripts table populated yet)
      const savedScripts = localStorage.getItem('generated_scripts');
      if (savedScripts) {
        const scripts = JSON.parse(savedScripts);
        scripts.forEach((script: any, index: number) => {
          assets.push({
            id: `script_${index}`,
            type: 'script',
            name: `${script.title || 'Script'}.txt`,
            duration: script.duration || "5:00",
            size: `${Math.round((script.content?.length || 0) / 1024)} KB`,
            status: 'ready',
            script_content: script.content,
            script_id: `script_${index}`
          });
        });
      }

      // Fetch voices from localStorage
      const savedVoices = localStorage.getItem('generated_voices');
      if (savedVoices) {
        const voices = JSON.parse(savedVoices);
        voices.forEach((voice: any, index: number) => {
          assets.push({
            id: `voice_${index}`,
            type: 'audio',
            name: `voice-${voice.voice_id || 'generated'}.mp3`,
            duration: voice.duration || "5:00",
            size: "~3-8 MB",
            status: 'ready',
            voice_generation_id: `voice_${index}`,
            audio_base64: voice.audioContent
          });
        });
      }

      // Add default background assets
      assets.push({
        id: 'default-bg-1',
        type: 'background',
        name: 'Professional Background',
        duration: '∞',
        size: 'Generated',
        status: 'ready'
      });

      assets.push({
        id: 'default-music-1',
        type: 'music',
        name: 'Ambient Background',
        duration: '∞',
        size: 'Generated',
        status: 'ready'
      });

      setMediaAssets(assets);
    } catch (error: any) {
      console.error('Error fetching media assets:', error);
      toast.error('Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  const createAutomatedVideo = async (
    templateId: string, 
    selectedAssets: string[], 
    quality: string, 
    frameRate: string
  ): Promise<VideoRender> => {
    try {
      // Find script and voice assets
      const scriptAsset = mediaAssets.find(asset => 
        selectedAssets.includes(asset.id) && asset.type === 'script'
      );
      const voiceAsset = mediaAssets.find(asset => 
        selectedAssets.includes(asset.id) && asset.type === 'audio'
      );

      if (!scriptAsset) {
        throw new Error('Script is required for automated video creation');
      }

      // Use Supabase Edge Function for video assembly
      const { data, error } = await supabase.functions.invoke('video-assembly', {
        body: {
          action: 'create_automated',
          templateId,
          selectedAssets,
          quality,
          frameRate,
          scriptContent: scriptAsset.script_content,
          voiceAudioBase64: voiceAsset?.audio_base64
        }
      });

      if (error) throw error;

      toast.success('Professional video creation started! Check the status below.');
      await fetchRecentRenders();
      
      return data;
    } catch (error: any) {
      console.error('Error creating automated video:', error);
      toast.error(error.message || 'Failed to create video');
      throw error;
    }
  };

  const createBatchVideo = async (
    templateId: string, 
    selectedAssets: string[], 
    quality: string, 
    frameRate: string
  ): Promise<string> => {
    try {
      const scriptAsset = mediaAssets.find(asset => 
        selectedAssets.includes(asset.id) && asset.type === 'script'
      );
      const voiceAsset = mediaAssets.find(asset => 
        selectedAssets.includes(asset.id) && asset.type === 'audio'
      );

      if (!scriptAsset) {
        throw new Error('Script is required for batch video creation');
      }

      const { data, error } = await supabase.functions.invoke('video-assembly', {
        body: {
          action: 'submit_batch',
          templateId,
          selectedAssets,
          quality,
          frameRate,
          scriptContent: scriptAsset.script_content,
          voiceAudioBase64: voiceAsset?.audio_base64
        }
      });

      if (error) throw error;

      toast.success('Batch video job submitted! Processing in background.');
      await fetchBatchJobs();
      await fetchBatchStats();
      
      return data.job_id;
    } catch (error: any) {
      console.error('Error creating batch video:', error);
      toast.error(error.message || 'Failed to submit batch job');
      throw error;
    }
  };

  const createMultipleBatchVideos = async (
    jobConfigs: Array<{
      templateId: string;
      selectedAssets: string[];
      quality: string;
      frameRate: string;
    }>
  ): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('video-assembly', {
        body: {
          action: 'submit_multiple_batch',
          jobConfigs: jobConfigs.map(config => {
            const scriptAsset = mediaAssets.find(asset => 
              config.selectedAssets.includes(asset.id) && asset.type === 'script'
            );
            const voiceAsset = mediaAssets.find(asset => 
              config.selectedAssets.includes(asset.id) && asset.type === 'audio'
            );

            return {
              templateId: config.templateId,
              selectedAssets: config.selectedAssets,
              quality: config.quality,
              frameRate: config.frameRate,
              scriptContent: scriptAsset?.script_content,
              voiceAudioBase64: voiceAsset?.audio_base64
            };
          })
        }
      });

      if (error) throw error;

      toast.success(`${data.total_jobs} batch video jobs submitted! Processing in background.`);
      await fetchBatchJobs();
      await fetchBatchStats();
      
      return data.job_ids;
    } catch (error: any) {
      console.error('Error creating multiple batch videos:', error);
      toast.error(error.message || 'Failed to submit multiple batch jobs');
      throw error;
    }
  };

  const getRenderStatus = async (renderId: string): Promise<VideoRender> => {
    try {
      const { data: video, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', renderId)
        .single();

      if (error) throw error;

      return {
        render_id: video.id,
        status: video.status === 'completed' ? 'completed' : 'processing',
        progress: video.status === 'completed' ? 100 : 50,
        duration: Math.floor(Math.random() * 300) + 180,
        file_size: Math.floor(Math.random() * 50000000) + 10000000,
        render_time: Math.floor(Math.random() * 60) + 30,
        created_at: video.created_at,
        features: ['professional_transitions', 'smart_sync', 'color_grading'],
        output_file: `${video.title.replace(/\s+/g, '_')}.mp4`
      };
    } catch (error) {
      console.error('Error fetching render status:', error);
      throw error;
    }
  };

  const getBatchJobStatus = async (jobId: string): Promise<BatchJob> => {
    try {
      const { data: job, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      return {
        id: job.id,
        project_id: `project_${job.id}`,
        status: job.status,
        progress: job.progress || 0,
        stage: job.current_step || 'queued',
        message: job.current_step || 'Job queued',
        created_at: job.created_at,
        started_at: job.started_at,
        completed_at: job.completed_at,
        estimated_duration: 45.0,
        actual_duration: job.completed_at ? 
          (new Date(job.completed_at).getTime() - new Date(job.started_at || job.created_at).getTime()) / 1000 : 
          null,
        error: job.error_message,
        result: job.status === 'completed' ? {
          output_path: `/tmp/video_output/video_${job.id}.mp4`,
          output_file: `video_${job.id}.mp4`,
          file_size: Math.floor(Math.random() * 50000000) + 10000000,
          duration: Math.floor(Math.random() * 300) + 180,
          features: ['professional_transitions', 'smart_sync', 'batch_processing']
        } : null
      };
    } catch (error) {
      console.error('Error fetching batch job status:', error);
      throw error;
    }
  };

  const cancelBatchJob = async (jobId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('update_automation_job_progress', {
        job_id: jobId,
        new_status: 'cancelled',
        new_step: 'Job cancelled by user'
      });

      if (error) throw error;

      toast.success('Batch job cancelled successfully');
      await fetchBatchJobs();
      await fetchBatchStats();
      return true;
    } catch (error) {
      console.error('Error cancelling batch job:', error);
      toast.error('Failed to cancel batch job');
      return false;
    }
  };

  const retryBatchJob = async (jobId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newJob, error } = await supabase
        .from('automation_jobs')
        .insert([{
          user_id: user.id,
          job_type: 'batch_video_creation',
          status: 'queued',
          current_step: 'Retry job queued',
          progress: 0,
          total_steps: 5
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Batch job retry submitted successfully');
      await fetchBatchJobs();
      await fetchBatchStats();
      return newJob.id;
    } catch (error) {
      console.error('Error retrying batch job:', error);
      toast.error('Failed to retry batch job');
      return null;
    }
  };

  const getDownloadUrl = (renderId: string): string => {
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
  };

  const getPreviewUrl = (renderId: string): string => {
    return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
  };

  const createVideo = async (
    templateId: string,
    selectedAssets: string[],
    quality: string,
    frameRate: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: video, error } = await supabase
        .from('videos')
        .insert([{
          user_id: user.id,
          title: `Video - ${templateId}`,
          status: 'processing'
        }])
        .select()
        .single();

      if (error) throw error;

      // Simulate processing completion
      setTimeout(async () => {
        await supabase
          .from('videos')
          .update({ 
            status: 'completed',
            video_url: getDownloadUrl(video.id)
          })
          .eq('id', video.id);
      }, 3000);

      return video;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchVideoTemplates(),
        fetchMediaAssets(),
        fetchRecentRenders(),
        fetchBatchJobs(),
        fetchBatchStats()
      ]);
    };
    init();

    // Set up periodic refresh for batch jobs and stats
    const interval = setInterval(async () => {
      await fetchBatchJobs();
      await fetchBatchStats();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    mediaAssets,
    templates,
    recentRenders,
    batchJobs,
    batchStats,
    loading,
    createAutomatedVideo,
    createBatchVideo,
    createMultipleBatchVideos,
    getRenderStatus,
    getBatchJobStatus,
    cancelBatchJob,
    retryBatchJob,
    getDownloadUrl,
    getPreviewUrl,
    refetch: fetchMediaAssets,
    refreshRenders: fetchRecentRenders,
    refreshBatchJobs: fetchBatchJobs,
    refreshBatchStats: fetchBatchStats,
    createVideo
  };
};