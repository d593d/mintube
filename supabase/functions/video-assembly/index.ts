import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface VideoRequest {
  templateId: string;
  selectedAssets: string[];
  quality: string;
  frameRate: string;
  scriptContent?: string;
  voiceAudioBase64?: string;
}

interface BatchJobRequest extends VideoRequest {
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    const url = new URL(req.url);
    const path = url.pathname;

    // Route handling
    if (path.includes('/templates')) {
      return handleGetTemplates();
    } else if (path.includes('/create-automated')) {
      return await handleCreateAutomatedVideo(req, supabaseClient, user);
    } else if (path.includes('/batch/submit-multiple')) {
      return await handleSubmitMultipleBatchJobs(req, supabaseClient, user);
    } else if (path.includes('/batch/submit')) {
      return await handleSubmitBatchJob(req, supabaseClient, user);
    } else if (path.includes('/batch/status/')) {
      const jobId = path.split('/').pop();
      return await handleGetBatchJobStatus(jobId!, supabaseClient, user);
    } else if (path.includes('/batch/stats')) {
      return await handleGetBatchStats(supabaseClient, user);
    } else if (path.includes('/batch/jobs')) {
      return await handleGetBatchJobs(supabaseClient, user);
    } else if (path.includes('/batch/cancel/')) {
      const jobId = path.split('/').pop();
      return await handleCancelBatchJob(jobId!, supabaseClient, user);
    } else if (path.includes('/batch/retry/')) {
      const jobId = path.split('/').pop();
      return await handleRetryBatchJob(jobId!, supabaseClient, user);
    } else if (path.includes('/recent-renders')) {
      return await handleGetRecentRenders(supabaseClient, user);
    } else if (path.includes('/download/')) {
      const renderId = path.split('/').pop();
      return handleDownloadVideo(renderId!);
    } else if (path.includes('/preview/')) {
      const renderId = path.split('/').pop();
      return handlePreviewVideo(renderId!);
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Video assembly error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function handleGetTemplates() {
  const templates = [
    {
      id: "minimal",
      name: "Minimal Clean",
      style: "Clean typography, subtle animations",
      description: "Simple and professional with fade transitions"
    },
    {
      id: "scientific",
      name: "Scientific",
      style: "Diagrams, charts, professional",
      description: "Technical and educational with wipe transitions"
    },
    {
      id: "storytelling",
      name: "Storytelling",
      style: "Cinematic, narrative flow",
      description: "Narrative-driven with crossfade transitions"
    },
    {
      id: "educational",
      name: "Educational",
      style: "Clear structure, highlights",
      description: "Learning-focused with slide transitions"
    }
  ];

  return new Response(JSON.stringify(templates), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCreateAutomatedVideo(req: Request, supabaseClient: any, user: any) {
  const requestData: VideoRequest = await req.json();
  
  // Create video record in database
  const { data: video, error: videoError } = await supabaseClient
    .from('videos')
    .insert([{
      user_id: user.id,
      title: `Video - ${requestData.templateId}`,
      status: 'processing',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (videoError) throw videoError;

  // Simulate video processing
  const render = {
    render_id: video.id,
    timeline_id: `timeline_${video.id}`,
    status: 'completed',
    progress: 100,
    output_file: `video_${video.id}.mp4`,
    file_size: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
    duration: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
    render_time: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
    created_at: new Date().toISOString(),
    features: ['professional_transitions', 'smart_sync', 'color_grading', 'professional_effects']
  };

  // Update video status
  await supabaseClient
    .from('videos')
    .update({ 
      status: 'completed',
      video_url: `/api/video/download/${video.id}`
    })
    .eq('id', video.id);

  return new Response(JSON.stringify(render), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSubmitBatchJob(req: Request, supabaseClient: any, user: any) {
  const requestData: BatchJobRequest = await req.json();
  
  // Create automation job record
  const { data: job, error: jobError } = await supabaseClient
    .from('automation_jobs')
    .insert([{
      user_id: user.id,
      job_type: 'batch_video_creation',
      status: 'queued',
      current_step: 'Queued for processing',
      progress: 0,
      total_steps: 5
    }])
    .select()
    .single();

  if (jobError) throw jobError;

  // Simulate batch processing
  setTimeout(async () => {
    try {
      // Update to processing
      await supabaseClient.rpc('update_automation_job_progress', {
        job_id: job.id,
        new_status: 'running',
        new_step: 'Processing video...',
        new_progress: 50
      });

      // Simulate completion after 10 seconds
      setTimeout(async () => {
        await supabaseClient.rpc('update_automation_job_progress', {
          job_id: job.id,
          new_status: 'completed',
          new_step: 'Video created successfully',
          new_progress: 100
        });
      }, 10000);
    } catch (error) {
      console.error('Batch job processing error:', error);
    }
  }, 2000);

  return new Response(JSON.stringify({
    job_id: job.id,
    status: 'queued',
    message: 'Batch job submitted successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSubmitMultipleBatchJobs(req: Request, supabaseClient: any, user: any) {
  const jobConfigs: BatchJobRequest[] = await req.json();
  
  const jobIds = [];
  
  for (const config of jobConfigs) {
    const { data: job, error: jobError } = await supabaseClient
      .from('automation_jobs')
      .insert([{
        user_id: user.id,
        job_type: 'batch_video_creation',
        status: 'queued',
        current_step: `Queued for ${config.quality} processing`,
        progress: 0,
        total_steps: 5
      }])
      .select()
      .single();

    if (!jobError) {
      jobIds.push(job.id);
    }
  }

  return new Response(JSON.stringify({
    job_ids: jobIds,
    total_jobs: jobIds.length,
    status: 'queued',
    message: `Successfully submitted ${jobIds.length} batch jobs`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetBatchJobStatus(jobId: string, supabaseClient: any, user: any) {
  const { data: job, error } = await supabaseClient
    .from('automation_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Job not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const jobStatus = {
    id: job.id,
    project_id: `project_${job.id}`,
    status: job.status,
    progress: job.progress || 0,
    stage: job.current_step || 'queued',
    message: job.current_step || 'Job queued',
    created_at: job.created_at,
    started_at: job.started_at,
    completed_at: job.completed_at,
    estimated_duration: 45.0,
    actual_duration: job.completed_at ? 
      (new Date(job.completed_at).getTime() - new Date(job.started_at || job.created_at).getTime()) / 1000 : 
      null,
    error: job.error_message,
    result: job.status === 'completed' ? {
      output_path: `/tmp/video_output/video_${job.id}.mp4`,
      output_file: `video_${job.id}.mp4`,
      file_size: Math.floor(Math.random() * 50000000) + 10000000,
      duration: Math.floor(Math.random() * 300) + 180,
      features: ['professional_transitions', 'smart_sync', 'batch_processing']
    } : null
  };

  return new Response(JSON.stringify(jobStatus), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetBatchStats(supabaseClient: any, user: any) {
  const { data: jobs, error } = await supabaseClient
    .from('automation_jobs')
    .select('*')
    .eq('user_id', user.id)
    .eq('job_type', 'batch_video_creation');

  if (error) throw error;

  const stats = {
    total_jobs: jobs.length,
    queued_jobs: jobs.filter(j => j.status === 'queued').length,
    processing_jobs: jobs.filter(j => j.status === 'running').length,
    completed_jobs: jobs.filter(j => j.status === 'completed').length,
    failed_jobs: jobs.filter(j => j.status === 'failed').length,
    cancelled_jobs: jobs.filter(j => j.status === 'cancelled').length,
    average_processing_time: 45.5,
    total_processing_time: jobs.length * 45.5,
    success_rate: jobs.length > 0 ? (jobs.filter(j => j.status === 'completed').length / jobs.length) * 100 : 0
  };

  return new Response(JSON.stringify(stats), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetBatchJobs(supabaseClient: any, user: any) {
  const { data: jobs, error } = await supabaseClient
    .from('automation_jobs')
    .select('*')
    .eq('user_id', user.id)
    .eq('job_type', 'batch_video_creation')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  const formattedJobs = jobs.map(job => ({
    id: job.id,
    project_id: `project_${job.id}`,
    status: job.status,
    progress: job.progress || 0,
    stage: job.current_step || 'queued',
    message: job.current_step || 'Job queued',
    created_at: job.created_at,
    started_at: job.started_at,
    completed_at: job.completed_at,
    estimated_duration: 45.0,
    actual_duration: job.completed_at ? 
      (new Date(job.completed_at).getTime() - new Date(job.started_at || job.created_at).getTime()) / 1000 : 
      null,
    error: job.error_message,
    result: job.status === 'completed' ? {
      output_path: `/tmp/video_output/video_${job.id}.mp4`,
      output_file: `video_${job.id}.mp4`,
      file_size: Math.floor(Math.random() * 50000000) + 10000000,
      duration: Math.floor(Math.random() * 300) + 180,
      features: ['professional_transitions', 'smart_sync', 'batch_processing']
    } : null
  }));

  return new Response(JSON.stringify(formattedJobs), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCancelBatchJob(jobId: string, supabaseClient: any, user: any) {
  const { error } = await supabaseClient.rpc('update_automation_job_progress', {
    job_id: jobId,
    new_status: 'cancelled',
    new_step: 'Job cancelled by user'
  });

  if (error) throw error;

  return new Response(JSON.stringify({
    message: `Job ${jobId} cancelled successfully`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleRetryBatchJob(jobId: string, supabaseClient: any, user: any) {
  // Create new job as retry
  const { data: newJob, error } = await supabaseClient
    .from('automation_jobs')
    .insert([{
      user_id: user.id,
      job_type: 'batch_video_creation',
      status: 'queued',
      current_step: 'Retry job queued',
      progress: 0,
      total_steps: 5
    }])
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({
    message: `Job ${jobId} retry submitted`,
    new_job_id: newJob.id
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetRecentRenders(supabaseClient: any, user: any) {
  const { data: videos, error } = await supabaseClient
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) throw error;

  const renders = videos.map(video => ({
    render_id: video.id,
    status: video.status || 'completed',
    progress: video.status === 'completed' ? 100 : 0,
    duration: Math.floor(Math.random() * 300) + 180,
    file_size: Math.floor(Math.random() * 50000000) + 10000000,
    render_time: Math.floor(Math.random() * 60) + 30,
    created_at: video.created_at,
    features: ['professional_transitions', 'smart_sync', 'color_grading']
  }));

  return new Response(JSON.stringify(renders), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function handleDownloadVideo(renderId: string) {
  // In a real implementation, this would serve the actual video file
  // For now, return a redirect to a placeholder
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      'Location': `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
    }
  });
}

function handlePreviewVideo(renderId: string) {
  // Return preview URL
  return new Response(JSON.stringify({
    preview_url: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}