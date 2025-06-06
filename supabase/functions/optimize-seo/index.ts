
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, script, niche } = await req.json();

    const prompt = `Based on this YouTube video content, generate SEO optimization suggestions:

Title: ${title}
Niche: ${niche}
Script excerpt: ${script?.substring(0, 500)}...

Provide:
1. 3 alternative optimized titles (max 60 characters each)
2. A compelling description (150-200 words) with keywords naturally integrated
3. 15-20 relevant tags/keywords
4. Best upload time recommendation
5. Suggested thumbnail text overlay

Format as JSON with keys: titles, description, tags, uploadTime, thumbnailText`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a YouTube SEO expert. Always respond with valid JSON formatted optimization suggestions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
      }),
    });

    const data = await response.json();
    const seoSuggestions = data.choices[0].message.content;
    
    let parsedSuggestions;
    try {
      parsedSuggestions = JSON.parse(seoSuggestions);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      parsedSuggestions = {
        titles: [title, `${title} - Explained`, `The Truth About ${title}`],
        description: `Learn everything about ${title} in this comprehensive guide. Perfect for ${niche} enthusiasts.`,
        tags: [niche.toLowerCase(), 'tutorial', 'guide', 'explained'],
        uploadTime: 'Tuesday or Thursday, 2-4 PM EST',
        thumbnailText: title.split(' ').slice(0, 3).join(' ')
      };
    }

    return new Response(JSON.stringify(parsedSuggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in optimize-seo function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
