import { logger } from "./logger";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (context: any) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  private getKey(context: any): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(context);
    }
    return 'default';
  }

  async checkLimit(context: any = {}): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.getKey(context);
    const now = Date.now();
    
    let entry = this.requests.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs
      };
      this.requests.set(key, entry);
    }

    const allowed = entry.count < this.config.maxRequests;
    
    if (allowed) {
      entry.count++;
      logger.debug('Rate limit check passed', { 
        key, 
        count: entry.count, 
        maxRequests: this.config.maxRequests,
        remaining: this.config.maxRequests - entry.count
      });
    } else {
      logger.warn('Rate limit exceeded', { 
        key, 
        count: entry.count, 
        maxRequests: this.config.maxRequests,
        resetTime: entry.resetTime
      });
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  async waitForReset(context: any = {}): Promise<void> {
    const key = this.getKey(context);
    const entry = this.requests.get(key);
    
    if (entry) {
      const waitTime = Math.max(0, entry.resetTime - Date.now());
      if (waitTime > 0) {
        logger.info('Waiting for rate limit reset', { key, waitTime });
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

// Create rate limiters for different AI services
export const openAILimiter = new RateLimiter({
  maxRequests: 10, // 10 requests per minute
  windowMs: 60 * 1000,
  keyGenerator: (context) => `openai:${context.userId || 'anonymous'}`
});

export const elevenLabsLimiter = new RateLimiter({
  maxRequests: 5, // 5 requests per minute (voice synthesis is expensive)
  windowMs: 60 * 1000,
  keyGenerator: (context) => `elevenlabs:${context.userId || 'anonymous'}`
});

export const generalAILimiter = new RateLimiter({
  maxRequests: 20, // 20 requests per minute for general AI operations
  windowMs: 60 * 1000,
  keyGenerator: (context) => `ai:${context.userId || 'anonymous'}`
});

// Rate limit error class
export class RateLimitError extends Error {
  public resetTime: number;
  public remaining: number;

  constructor(message: string, resetTime: number, remaining: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
    this.remaining = remaining;
  }
}

// Helper function to enforce rate limits
export async function enforceRateLimit(
  limiter: RateLimiter, 
  context: any = {},
  autoWait: boolean = false
): Promise<void> {
  const result = await limiter.checkLimit(context);
  
  if (!result.allowed) {
    if (autoWait) {
      await limiter.waitForReset(context);
      return;
    }
    
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`,
      result.resetTime,
      result.remaining
    );
  }
}