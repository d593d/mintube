import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeHtml,
  validateAndSanitizeContentIdea,
  validateAndSanitizeScript,
  validateAIResponse,
  aiContentIdeaResponseSchema,
} from '../validation';

describe('Validation Utils', () => {
  describe('sanitizeText', () => {
    it('should remove dangerous characters', () => {
      const input = '<script>alert("xss")</script>Hello & "World"';
      const result = sanitizeText(input);
      expect(result).toBe('scriptalert(xss)/scriptHello  World');
    });

    it('should normalize whitespace', () => {
      const input = '  Hello    World  \n\t  ';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><span>World</span>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<p>Hello</p><span>World</span>');
    });

    it('should remove javascript: protocols', () => {
      const input = '<a href="javascript:alert(1)">Click me</a>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<a href="">Click me</a>');
    });
  });

  describe('validateAndSanitizeContentIdea', () => {
    it('should validate and sanitize valid input', () => {
      const input = {
        niche: '  Technology  ',
        targetAudience: 'Tech enthusiasts & developers',
        contentGoals: 'Educational content for <beginners>',
      };

      const result = validateAndSanitizeContentIdea(input);
      expect(result).toEqual({
        niche: 'Technology',
        targetAudience: 'Tech enthusiasts  developers',
        contentGoals: 'Educational content for beginners',
      });
    });

    it('should throw error for invalid input', () => {
      const input = {
        niche: '',
        targetAudience: 'Valid audience',
        contentGoals: 'Valid goals',
      };

      expect(() => validateAndSanitizeContentIdea(input)).toThrow('Niche is required');
    });
  });

  describe('validateAIResponse', () => {
    it('should validate correct AI response', () => {
      const validResponse = [
        {
          title: 'Test Video Title',
          estimatedViews: '10K-20K',
          competition: 'Medium' as const,
          keywords: ['tech', 'tutorial'],
          difficulty: 'Beginner' as const,
          description: 'A test video description',
        },
      ];

      expect(() => validateAIResponse(aiContentIdeaResponseSchema, validResponse)).not.toThrow();
    });

    it('should throw error for invalid AI response', () => {
      const invalidResponse = [
        {
          title: '',
          estimatedViews: '10K-20K',
          competition: 'Invalid',
          keywords: [],
          difficulty: 'Beginner',
          description: 'A test video description',
        },
      ];

      expect(() => validateAIResponse(aiContentIdeaResponseSchema, invalidResponse)).toThrow();
    });
  });
});