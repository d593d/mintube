import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface MediaAsset {
  id: string;
  type: 'script' | 'voice' | 'image' | 'video';
  name: string;
  url?: string;
  script_content?: string;
  audio_base64?: string;
  created_at: string;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  duration?: number;
  created_at: string;
}

export interface VideoRender {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  video_url?: string;
  preview_url?: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface BatchJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  total_videos?: number;
  completed_videos?: number;
  failed_videos?: number;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface BatchStats {
  total_jobs: number;
  pending_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  cancelled_jobs: number;
}

export interface BatchConfig {
  templateId: string;
  selectedAssets: string[];
  quality: string;
  frameRate: string;
}

export const useVideoAssembly = () => {
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [recentRenders, setRecentRenders] = useState<VideoRender[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [batchStats, setBatchStats] = useState<BatchStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideoTemplates = async () => {
    try {
      const { data: templatesData, error } = await supabase.functions.invoke('video-assembly/templates');
      if (error) throw error;
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch video templates');
    }
  };

  const fetchRecentRenders = async () => {
    try {
      const { data: renders, error } = await supabase.functions.invoke('video-assembly/recent-renders');
      if (!error && renders) {
        setRecentRenders(renders);
      }
    } catch (error) {
      console.error('Error fetching recent renders:', error);
    }
  };

  const fetchBatchJobs = async () => {
    try {
      const { data: jobs, error } = await supabase.functions.invoke('video-assembly/batch/jobs');
      if (!error && jobs) {
        setBatchJobs(jobs);
      }
    } catch (error) {
      console.error('Error fetching batch jobs:', error);
    }
  };

  const fetchBatchStats = async () => {
    try {
      const { data: stats, error } = await supabase.functions.invoke('video-assembly/batch/stats');
      if (!error && stats) {
        setBatchStats(stats);
      }
    } catch (error) {
      console.error('Error fetching batch stats:', error);
    }
  };

  const createVideo = async (templateId: string, selectedAssets: string[], quality: string, frameRate: string) => {
    setIsLoading(true);
    try {
      // Find the script and voice assets from selected assets
      const scriptAsset = selectedAssets.find(asset => asset.type === 'script');
      const voiceAsset = selectedAssets.find(asset => asset.type === 'voice');

      // Prepare request data for enhanced backend
      const requestData = {
        templateId: templateId,
        selectedAssets: selectedAssets,
        quality: quality,
        frameRate: frameRate,
        scriptContent: scriptAsset.script_content || 'Default script content',
        voiceAudioBase64: voiceAsset?.audio_base64 || null
      };

      // Create automated video using Supabase Edge Function
      const { data: render, error } = await supabase.functions.invoke('video-assembly/create-automated', {
        body: requestData
      });
      
      if (error) throw error;
      toast.success('Professional video creation started! Check the status below.');

      // Refresh recent renders to show the new one
      await fetchRecentRenders();
      
      return render;
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitBatchJob = async (templateId: string, selectedAssets: string[], quality: string, frameRate: string) => {
    setIsLoading(true);
    try {
      // Find the script and voice assets from selected assets
      const scriptAsset = selectedAssets.find(asset => asset.type === 'script');
      const voiceAsset = selectedAssets.find(asset => asset.type === 'voice');

      // Prepare request data for batch processing
      const requestData = {
        templateId: templateId,
        selectedAssets: selectedAssets,
        quality: quality,
        frameRate: frameRate,
        scriptContent: scriptAsset.script_content || 'Default script content',
        voiceAudioBase64: voiceAsset?.audio_base64 || null
      };

      // Submit batch job using Supabase Edge Function
      const { data: result, error } = await supabase.functions.invoke('video-assembly/batch/submit', {
        body: requestData
      });
      
      if (error) throw error;
      toast.success('Batch video job submitted! Processing in background.');

      // Refresh batch data
      await fetchBatchJobs();
      await fetchBatchStats();
      
      return result;
    } catch (error) {
      console.error('Error submitting batch job:', error);
      toast.error('Failed to submit batch job. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const submitMultipleBatchJobs = async (configs: BatchConfig[]) => {
    setIsLoading(true);
    try {
      const requestData = configs.map(config => {
        // Find the script and voice assets from selected assets
        const scriptAsset = config.selectedAssets.find(asset => asset.type === 'script');
        const voiceAsset = config.selectedAssets.find(asset => asset.type === 'voice');

        return {
          templateId: config.templateId,
          selectedAssets: config.selectedAssets,
          quality: config.quality,
          frameRate: config.frameRate,
          scriptContent: scriptAsset?.script_content || 'Default script content',
          voiceAudioBase64: voiceAsset?.audio_base64 || null
        };
      });

      const { data: result, error } = await supabase.functions.invoke('video-assembly/batch/submit-multiple', {
        body: requestData
      });
      
      if (error) throw error;
      toast.success(`${result.total_jobs} batch video jobs submitted! Processing in background.`);

      // Refresh batch data
      await fetchBatchJobs();
      await fetchBatchStats();
      
      return result;
    } catch (error) {
      console.error('Error submitting multiple batch jobs:', error);
      toast.error('Failed to submit batch jobs. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getRenderStatus = async (renderId: string): Promise<VideoRender> => {
    try {
      const { data: status, error } = await supabase.functions.invoke(`video-assembly/render-status/${renderId}`);
      if (error) throw error;
      return status;
    } catch (error) {
      console.error('Error fetching render status:', error);
      throw error;
    }
  };

  const getBatchJobStatus = async (jobId: string): Promise<BatchJob> => {
    try {
      const { data: status, error } = await supabase.functions.invoke(`video-assembly/batch/status/${jobId}`);
      if (error) throw error;
      return status;
    } catch (error) {
      console.error('Error fetching batch job status:', error);
      throw error;
    }
  };

  const cancelBatchJob = async (jobId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke(`video-assembly/batch/cancel/${jobId}`);
      
      if (!error) {
        toast.success('Batch job cancelled successfully');
        await fetchBatchJobs();
        await fetchBatchStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling batch job:', error);
      toast.error('Failed to cancel batch job');
      return false;
    }
  };

  const retryBatchJob = async (jobId: string): Promise<string | null> => {
    try {
      const { data: result, error } = await supabase.functions.invoke(`video-assembly/batch/retry/${jobId}`);
      
      if (!error && result) {
        toast.success('Batch job retry submitted successfully');
        await fetchBatchJobs();
        await fetchBatchStats();
        return result.new_job_id;
      }
      return null;
    } catch (error) {
      console.error('Error retrying batch job:', error);
      toast.error('Failed to retry batch job');
      return null;
    }
  };

  const getDownloadUrl = (renderId: string): string => {
    return `${SUPABASE_URL}/functions/v1/video-assembly/download/${renderId}`;
  };

  const getPreviewUrl = (renderId: string): string => {
    return `${SUPABASE_URL}/functions/v1/video-assembly/preview/${renderId}`;
  };

  useEffect(() => {
    fetchVideoTemplates();
    fetchRecentRenders();
    fetchBatchJobs();
    fetchBatchStats();
  }, []);

  return {
    templates,
    recentRenders,
    batchJobs,
    batchStats,
    isLoading,
    createVideo,
    submitBatchJob,
    submitMultipleBatchJobs,
    getRenderStatus,
    getBatchJobStatus,
    cancelBatchJob,
    retryBatchJob,
    getDownloadUrl,
    getPreviewUrl,
    fetchVideoTemplates,
    fetchRecentRenders,
    fetchBatchJobs,
    fetchBatchStats
  };
};