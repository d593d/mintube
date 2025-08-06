
import { useState, useEffect } from "react";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

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
  features?: string[]; // Enhanced features like professional_transitions, smart_sync, etc.
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
      const response = await fetch(`${BACKEND_URL}/api/video/templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const templatesData = await response.json();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Enhanced fallback templates with professional features
      setTemplates([
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
      ]);
    }
  };

  const fetchRecentRenders = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/video/recent-renders?limit=5`);
      if (response.ok) {
        const renders = await response.json();
        setRecentRenders(renders);
      }
    } catch (error) {
      console.error('Error fetching recent renders:', error);
    }
  };

  const fetchBatchJobs = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/video/batch/jobs?limit=10`);
      if (response.ok) {
        const jobs = await response.json();
        setBatchJobs(jobs);
      }
    } catch (error) {
      console.error('Error fetching batch jobs:', error);
    }
  };

  const fetchBatchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/video/batch/stats`);
      if (response.ok) {
        const stats = await response.json();
        setBatchStats(stats);
      }
    } catch (error) {
      console.error('Error fetching batch stats:', error);
    }
  };

  const fetchMediaAssets = async () => {
    try {
      const assets: MediaAsset[] = [];

      // Fetch scripts from localStorage (since we don't have Supabase)
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

      // Add some default background assets
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

      // Prepare request data for enhanced backend
      const requestData = {
        script_content: scriptAsset.script_content || 'Default script content',
        voice_audio_base64: voiceAsset?.audio_base64 || null,
        template_id: templateId,
        quality: quality,
        background_config: {
          frameRate: frameRate
        },
        project_id: `project_${Date.now()}`
      };

      // Create automated video using enhanced backend
      const response = await fetch(`${BACKEND_URL}/api/video/create-automated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create video');
      }

      const render = await response.json();
      toast.success('Professional video creation started! Check the status below.');

      // Save to localStorage for persistence
      const savedRenders = JSON.parse(localStorage.getItem('video_renders') || '[]');
      savedRenders.unshift(render);
      localStorage.setItem('video_renders', JSON.stringify(savedRenders.slice(0, 10))); // Keep latest 10

      // Refresh recent renders
      await fetchRecentRenders();
      
      return render;
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
      // Find script and voice assets
      const scriptAsset = mediaAssets.find(asset => 
        selectedAssets.includes(asset.id) && asset.type === 'script'
      );
      const voiceAsset = mediaAssets.find(asset => 
        selectedAssets.includes(asset.id) && asset.type === 'audio'
      );

      if (!scriptAsset) {
        throw new Error('Script is required for batch video creation');
      }

      // Prepare request data for batch processing
      const requestData = {
        script_content: scriptAsset.script_content || 'Default script content',
        voice_audio_base64: voiceAsset?.audio_base64 || null,
        template_id: templateId,
        quality: quality,
        background_config: {
          frameRate: frameRate
        },
        project_id: `batch_project_${Date.now()}`
      };

      // Submit batch job
      const response = await fetch(`${BACKEND_URL}/api/video/batch/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit batch job');
      }

      const result = await response.json();
      toast.success('Batch video job submitted! Processing in background.');

      // Refresh batch jobs
      await fetchBatchJobs();
      await fetchBatchStats();
      
      return result.job_id;
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
      const requestData = jobConfigs.map(config => {
        const scriptAsset = mediaAssets.find(asset => 
          config.selectedAssets.includes(asset.id) && asset.type === 'script'
        );
        const voiceAsset = mediaAssets.find(asset => 
          config.selectedAssets.includes(asset.id) && asset.type === 'audio'
        );

        return {
          script_content: scriptAsset?.script_content || 'Default script content',
          voice_audio_base64: voiceAsset?.audio_base64 || null,
          template_id: config.templateId,
          quality: config.quality,
          background_config: {
            frameRate: config.frameRate
          },
          project_id: `multi_batch_project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      });

      const response = await fetch(`${BACKEND_URL}/api/video/batch/submit-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit multiple batch jobs');
      }

      const result = await response.json();
      toast.success(`${result.total_jobs} batch video jobs submitted! Processing in background.`);

      // Refresh batch jobs and stats
      await fetchBatchJobs();
      await fetchBatchStats();
      
      return result.job_ids;
    } catch (error: any) {
      console.error('Error creating multiple batch videos:', error);
      toast.error(error.message || 'Failed to submit multiple batch jobs');
      throw error;
    }
  };

  const getRenderStatus = async (renderId: string): Promise<VideoRender> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/video/render-status/${renderId}`);
      if (!response.ok) throw new Error('Failed to fetch render status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching render status:', error);
      throw error;
    }
  };

  const getBatchJobStatus = async (jobId: string): Promise<BatchJob> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/video/batch/status/${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch batch job status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching batch job status:', error);
      throw error;
    }
  };

  const cancelBatchJob = async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/video/batch/cancel/${jobId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
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
      const response = await fetch(`${BACKEND_URL}/api/video/batch/retry/${jobId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
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
    return `${BACKEND_URL}/api/video/download/${renderId}`;
  };

  const getPreviewUrl = (renderId: string): string => {
    return `${BACKEND_URL}/api/video/preview/${renderId}`;
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
    }, 5000); // Refresh every 5 seconds

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
    refreshBatchStats: fetchBatchStats
  };
};
