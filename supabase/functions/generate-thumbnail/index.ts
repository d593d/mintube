
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
    const { title, style = 'vivid', size = '1792x1024' } = await req.json();

    if (!title) {
      throw new Error('Video title is required');
    }

    const prompt = `Create a compelling YouTube thumbnail for a video titled "${title}". 
The thumbnail should be eye-catching, professional, and suitable for a faceless YouTube channel. 
Include bold text, vibrant colors, and engaging visual elements that would make viewers want to click. 
The style should be modern and attention-grabbing without being clickbait.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        style: style,
        quality: 'hd'
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate thumbnail');
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    return new Response(JSON.stringify({ 
      imageUrl,
      title,
      prompt
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-thumbnail function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
