
import { supabase } from "@/integrations/supabase/client";

export const useAI = () => {
  const generateContentIdeas = async (niche: string, targetAudience: string, contentGoals: string) => {
    const { data, error } = await supabase.functions.invoke('generate-content-ideas', {
      body: { niche, targetAudience, contentGoals }
    });
    
    if (error) throw error;
    return data;
  };

  const generateScript = async (topic: string, duration: string, style: string, targetAudience: string, additionalNotes: string) => {
    const { data, error } = await supabase.functions.invoke('generate-script', {
      body: { topic, duration, style, targetAudience, additionalNotes }
    });
    
    if (error) throw error;
    return data;
  };

  const generateVoice = async (text: string, voiceId: string, speed = 1.0) => {
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text, voiceId, speed }
    });
    
    if (error) throw error;
    return data;
  };

  const generateThumbnail = async (title: string, style = 'vivid') => {
    const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
      body: { title, style }
    });
    
    if (error) throw error;
    return data;
  };

  const optimizeSEO = async (title: string, script: string, niche: string) => {
    const { data, error } = await supabase.functions.invoke('optimize-seo', {
      body: { title, script, niche }
    });
    
    if (error) throw error;
    return data;
  };

  return {
    generateContentIdeas,
    generateScript,
    generateVoice,
    generateThumbnail,
    optimizeSEO
  };
};
