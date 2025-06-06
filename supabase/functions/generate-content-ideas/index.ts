
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
    const { niche, targetAudience, contentGoals } = await req.json();
    
    console.log('Environment check:', {
      hasOpenAIKey: !!openAIApiKey,
      keyLength: openAIApiKey ? openAIApiKey.length : 0,
      keyPrefix: openAIApiKey ? openAIApiKey.substring(0, 10) + '...' : 'none'
    });

    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate 5 YouTube video content ideas for a faceless channel in the ${niche} niche.
Target audience: ${targetAudience}
Content goals: ${contentGoals}

For each idea, provide:
1. A compelling title
2. Estimated view range (e.g., "15K-25K")
3. Competition level (Low/Medium/High)
4. 3-5 relevant keywords
5. Difficulty level (Beginner/Intermediate/Advanced)
6. Brief description

Format as JSON array with objects containing: title, estimatedViews, competition, keywords, difficulty, description`;

    console.log('Making request to OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a YouTube content strategist specializing in faceless channels. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = data.choices[0].message.content;
    
    // Parse the JSON response
    let contentIdeas;
    try {
      contentIdeas = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw content:', generatedContent);
      // Fallback if JSON parsing fails
      contentIdeas = [{
        title: "AI-Generated Content Ideas",
        estimatedViews: "20K-30K",
        competition: "Medium",
        keywords: [niche.toLowerCase(), "content", "ideas"],
        difficulty: "Intermediate",
        description: "AI-generated content ideas for your channel"
      }];
    }

    return new Response(JSON.stringify({ contentIdeas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content-ideas function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
