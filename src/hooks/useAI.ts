
import { supabase } from "@/integrations/supabase/client";
import { 
  validateAndSanitizeContentIdea, 
  validateAndSanitizeScript, 
  validateAndSanitizeVoice,
  validateAIResponse,
  aiContentIdeaResponseSchema,
  aiScriptResponseSchema
} from "@/lib/validation";
import { logger } from "@/lib/logger";
import { 
  openAILimiter, 
  elevenLabsLimiter, 
  generalAILimiter, 
  enforceRateLimit,
  RateLimitError 
} from "@/lib/rateLimiter";
import { useAuth } from "./useAuth";

export const useAI = () => {
  const { user } = useAuth();

  const generateContentIdeas = async (niche: string, targetAudience: string, contentGoals: string) => {
    try {
      // Rate limiting
      await enforceRateLimit(openAILimiter, { userId: user?.id });
      
      // Validate and sanitize input
      const sanitizedInput = validateAndSanitizeContentIdea({ niche, targetAudience, contentGoals });
      
      logger.info('Generating content ideas', { niche: sanitizedInput.niche, userId: user?.id });
      
      const { data, error } = await supabase.functions.invoke('generate-content-ideas', {
        body: sanitizedInput
      });
      
      if (error) throw error;
      
      // Validate AI response
      const validatedData = validateAIResponse(aiContentIdeaResponseSchema, data);
      
      logger.info('Content ideas generated successfully', { count: validatedData.length, userId: user?.id });
      return validatedData;
    } catch (error) {
      if (error instanceof RateLimitError) {
        logger.warn('Rate limit hit for content ideas generation', { userId: user?.id, resetTime: error.resetTime });
        throw new Error(`Too many requests. Please wait ${Math.ceil((error.resetTime - Date.now()) / 1000)} seconds before trying again.`);
      }
      logger.error('Failed to generate content ideas', error, { userId: user?.id });
      throw error;
    }
  };

  const generateScript = async (topic: string, duration: string, style: string, targetAudience: string, additionalNotes: string) => {
    const { data, error } = await supabase.functions.invoke('generate-script', {
      body: { topic, duration, style, targetAudience, additionalNotes }
    });
    
    if (error) throw error;
    return data;
  };

  const generateVoice = async (text: string, voiceId: string, speed = 1.0) => {
    try {
      // Rate limiting for voice synthesis (more restrictive)
      await enforceRateLimit(elevenLabsLimiter, { userId: user?.id });
      
      // Validate and sanitize input
      const sanitizedInput = validateAndSanitizeVoice({ text, voiceId, speed });
      
      logger.info('Generating voice synthesis', { textLength: text.length, voiceId, userId: user?.id });
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: sanitizedInput
      });
      
      if (error) throw error;
      
      logger.info('Voice synthesis completed successfully', { userId: user?.id });
      return data;
    } catch (error) {
      if (error instanceof RateLimitError) {
        logger.warn('Rate limit hit for voice synthesis', { userId: user?.id, resetTime: error.resetTime });
        throw new Error(`Too many voice synthesis requests. Please wait ${Math.ceil((error.resetTime - Date.now()) / 1000)} seconds before trying again.`);
      }
      logger.error('Failed to generate voice', error, { userId: user?.id });
      throw error;
    }
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
