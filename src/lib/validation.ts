import { z } from 'zod';

// Content validation schemas
export const contentIdeaSchema = z.object({
  niche: z.string().min(1, 'Niche is required').max(100, 'Niche too long'),
  targetAudience: z.string().min(1, 'Target audience is required').max(200, 'Target audience too long'),
  contentGoals: z.string().min(1, 'Content goals are required').max(500, 'Content goals too long'),
});

export const scriptGenerationSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic too long'),
  duration: z.enum(['short', 'medium', 'long'], { required_error: 'Duration is required' }),
  style: z.enum(['educational', 'entertaining', 'storytelling', 'tutorial'], { required_error: 'Style is required' }),
  targetAudience: z.string().min(1, 'Target audience is required').max(200, 'Target audience too long'),
  additionalNotes: z.string().max(1000, 'Additional notes too long').optional(),
});

export const voiceGenerationSchema = z.object({
  text: z.string().min(1, 'Text is required').max(5000, 'Text too long for voice generation'),
  voiceId: z.string().min(1, 'Voice ID is required'),
  speed: z.number().min(0.5).max(2.0).default(1.0),
});

// Sanitization functions
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function sanitizeText(input: string): string {
  // Remove potential XSS characters and normalize whitespace
  return input
    .replace(/[<>\"'&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateAndSanitizeContentIdea(data: unknown) {
  const parsed = contentIdeaSchema.parse(data);
  return {
    niche: sanitizeText(parsed.niche),
    targetAudience: sanitizeText(parsed.targetAudience),
    contentGoals: sanitizeText(parsed.contentGoals),
  };
}

export function validateAndSanitizeScript(data: unknown) {
  const parsed = scriptGenerationSchema.parse(data);
  return {
    ...parsed,
    topic: sanitizeText(parsed.topic),
    targetAudience: sanitizeText(parsed.targetAudience),
    additionalNotes: parsed.additionalNotes ? sanitizeText(parsed.additionalNotes) : undefined,
  };
}

export function validateAndSanitizeVoice(data: unknown) {
  const parsed = voiceGenerationSchema.parse(data);
  return {
    ...parsed,
    text: sanitizeHtml(parsed.text), // Allow some HTML formatting for voice
    voiceId: sanitizeText(parsed.voiceId),
  };
}

// AI response validation
export const aiContentIdeaResponseSchema = z.array(z.object({
  title: z.string().min(1).max(200),
  estimatedViews: z.string().min(1).max(50),
  competition: z.enum(['Low', 'Medium', 'High']),
  keywords: z.array(z.string()).min(1).max(10),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  description: z.string().min(1).max(1000),
}));

export const aiScriptResponseSchema = z.object({
  script: z.string().min(1).max(10000),
  estimatedDuration: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
});

export function validateAIResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`AI response validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}