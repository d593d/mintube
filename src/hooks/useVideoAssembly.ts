
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
}

export interface VideoTemplate {
  id: string;
  name: string;
  style: string;
  description: string;
}

export const useVideoAssembly = () => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [templates] = useState<VideoTemplate[]>([
    { id: "minimal", name: "Minimal Clean", style: "Clean typography, subtle animations", description: "Simple and professional" },
    { id: "scientific", name: "Scientific", style: "Diagrams, charts, professional", description: "Technical and educational" },
    { id: "storytelling", name: "Storytelling", style: "Cinematic, narrative flow", description: "Narrative-driven content" },
    { id: "educational", name: "Educational", style: "Clear structure, highlights", description: "Learning-focused design" }
  ]);
  const [loading, setLoading] = useState(true);

  const fetchMediaAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch scripts
      const { data: scripts, error: scriptsError } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (scriptsError) throw scriptsError;

      // Fetch voice generations
      const { data: voices, error: voicesError } = await supabase
        .from('voice_generations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (voicesError) throw voicesError;

      const assets: MediaAsset[] = [];

      // Add script assets
      scripts?.forEach((script) => {
        assets.push({
          id: script.id,
          type: 'script',
          name: `${script.title.slice(0, 20)}...txt`,
          duration: script.duration || "Unknown",
          size: `${Math.round(script.script_content?.length / 1024 || 0)} KB`,
          status: 'ready',
          script_id: script.id
        });
      });

      // Add voice generation assets
      voices?.forEach((voice) => {
        assets.push({
          id: voice.id,
          type: 'audio',
          name: `voice-${voice.voice_id}.mp3`,
          duration: voice.duration ? `${Math.floor(voice.duration / 60)}:${(voice.duration % 60).toString().padStart(2, '0')}` : "Unknown",
          size: "~2-5 MB",
          status: 'ready',
          voice_generation_id: voice.id,
          url: voice.audio_url
        });
      });

      // Add some default background assets (these would typically be uploaded by users)
      assets.push({
        id: 'default-bg-1',
        type: 'background',
        name: 'default-background.mp4',
        duration: '10:00',
        size: '45 MB',
        status: 'ready'
      });

      assets.push({
        id: 'default-music-1',
        type: 'music',
        name: 'ambient-music.mp3',
        duration: '10:00',
        size: '8.1 MB',
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

  const createVideo = async (templateId: string, selectedAssets: string[], quality: string, frameRate: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find the main script asset
      const scriptAsset = mediaAssets.find(asset => 
        selectedAssets.includes(asset.id) && asset.type === 'script'
      );

      const template = templates.find(t => t.id === templateId);

      const { data, error } = await supabase
        .from('videos')
        .insert([{
          user_id: user.id,
          title: scriptAsset ? `Video: ${scriptAsset.name.replace('.txt', '')}` : `Video ${Date.now()}`,
          script_id: scriptAsset?.script_id,
          status: 'processing'
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Video creation started!');
      return data;
    } catch (error: any) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video');
      throw error;
    }
  };

  useEffect(() => {
    fetchMediaAssets();
  }, []);

  return {
    mediaAssets,
    templates,
    loading,
    createVideo,
    refetch: fetchMediaAssets
  };
};
