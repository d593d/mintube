
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
    const { topic, duration, style, targetAudience, additionalNotes } = await req.json();

    const prompt = `Create a detailed YouTube script for a faceless channel video.

Topic: ${topic}
Duration: ${duration}
Style: ${style}
Target Audience: ${targetAudience}
Additional Notes: ${additionalNotes}

Structure the script with:
[HOOK - 0:00-0:15] - Compelling opening to grab attention
[INTRODUCTION - 0:15-0:45] - Introduce the topic and what viewers will learn
[MAIN CONTENT - 0:45-X:XX] - Detailed content with clear sections and subheadings
[CONCLUSION - X:XX-Y:YY] - Summarize key points
[CALL TO ACTION - Y:YY-Z:ZZ] - Subscribe, like, comment prompts
[END SCREEN - Z:ZZ] - Suggest related videos

Make it engaging, informative, and optimized for retention. Include natural transitions and keep the tone conversational yet authoritative.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert YouTube script writer specializing in engaging, high-retention scripts for faceless channels.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const script = data.choices[0].message.content;

    // Calculate basic metrics
    const wordCount = script.split(' ').length;
    const readingTime = Math.ceil(wordCount / 130); // ~130 words per minute
    const speakingRate = Math.round(wordCount / readingTime);

    return new Response(JSON.stringify({ 
      script,
      metrics: {
        wordCount,
        readingTime: `${readingTime}:${String(Math.round((wordCount % 130) * 60 / 130)).padStart(2, '0')}`,
        speakingRate,
        readability: wordCount > 1000 ? 'Good' : 'Fair'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-script function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
