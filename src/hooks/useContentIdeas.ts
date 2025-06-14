
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContentIdea {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimated_views: string;
  competition: string;
  keywords: string[];
  description: string;
  script_status: string;
  created_at: string;
  updated_at: string;
}

export const useContentIdeas = () => {
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContentIdeas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentIdeas(data || []);
    } catch (error: any) {
      console.error('Error fetching content ideas:', error);
      toast.error('Failed to load content ideas');
    } finally {
      setLoading(false);
    }
  };

  const saveContentIdeas = async (ideas: Omit<ContentIdea, 'id' | 'created_at' | 'updated_at'>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const ideasWithUserId = ideas.map(idea => ({
        ...idea,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from('content_ideas')
        .insert(ideasWithUserId)
        .select();

      if (error) throw error;
      
      if (data) {
        setContentIdeas(prev => [...data, ...prev]);
        return data;
      }
    } catch (error: any) {
      console.error('Error saving content ideas:', error);
      toast.error('Failed to save content ideas');
      throw error;
    }
  };

  const updateScriptStatus = async (ideaId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('content_ideas')
        .update({ script_status: status })
        .eq('id', ideaId);

      if (error) throw error;

      setContentIdeas(prev => 
        prev.map(idea => 
          idea.id === ideaId ? { ...idea, script_status: status } : idea
        )
      );
    } catch (error: any) {
      console.error('Error updating script status:', error);
      toast.error('Failed to update script status');
    }
  };

  useEffect(() => {
    fetchContentIdeas();
  }, []);

  return {
    contentIdeas,
    loading,
    saveContentIdeas,
    updateScriptStatus,
    refetch: fetchContentIdeas
  };
};
