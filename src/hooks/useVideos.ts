
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Video {
  id: string;
  title: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  revenue: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async (videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('videos')
        .insert([{ ...videoData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setVideos(prev => [data, ...prev]);
        return data;
      }
    } catch (error: any) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video');
      throw error;
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    createVideo,
    refetch: fetchVideos
  };
};
