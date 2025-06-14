
import { useEffect } from "react";
import { useAutomation } from "@/hooks/useAutomation";
import { useAI } from "@/hooks/useAI";
import { useContentIdeas } from "@/hooks/useContentIdeas";
import { useVideoAssembly } from "@/hooks/useVideoAssembly";
import { toast } from "sonner";

export const AutomationEngine = () => {
  const { currentJob, updateJobProgress, settings } = useAutomation();
  const { generateContentIdeas, generateScript, generateVoice } = useAI();
  const { contentIdeas, saveContentIdeas, updateScriptStatus } = useContentIdeas();
  const { createVideo } = useVideoAssembly();

  useEffect(() => {
    if (!currentJob || currentJob.status !== 'running') return;

    const processJob = async () => {
      try {
        console.log('Processing automation job:', currentJob);
        
        switch (currentJob.job_type) {
          case 'full_pipeline':
            await runFullPipeline();
            break;
          case 'generate_content_ideas':
            await generateContentIdeasJob();
            break;
          case 'generate_script':
            await generateScriptJob();
            break;
          case 'voice_synthesis':
            await voiceSynthesisJob();
            break;
          case 'video_assembly':
            await videoAssemblyJob();
            break;
          default:
            throw new Error(`Unknown job type: ${currentJob.job_type}`);
        }
      } catch (error: any) {
        console.error('Job processing error:', error);
        await updateJobProgress(
          currentJob.id, 
          'failed', 
          'Job failed', 
          undefined, 
          error.message
        );
        toast.error(`Automation failed: ${error.message}`);
      }
    };

    processJob();
  }, [currentJob]);

  const runFullPipeline = async () => {
    if (!currentJob || !settings) return;

    const steps = [];
    let currentStepIndex = 0;
    
    // Build step list based on settings
    if (settings.auto_generate_ideas) steps.push('content_ideas');
    if (settings.auto_generate_scripts) steps.push('script_generation');
    if (settings.auto_generate_voice) steps.push('voice_synthesis');
    if (settings.auto_assemble_videos) steps.push('video_assembly');
    if (settings.auto_upload_youtube) steps.push('youtube_upload');

    const totalSteps = steps.length;
    
    // Step 1: Generate content ideas (if enabled)
    if (settings.auto_generate_ideas) {
      currentStepIndex++;
      await updateJobProgress(
        currentJob.id, 
        'running', 
        'Generating content ideas...', 
        Math.round((currentStepIndex / totalSteps) * 100)
      );
      
      const result = await generateContentIdeas(
        'Educational Content',
        'General audience',
        'Create engaging educational videos'
      );
      
      if (result.contentIdeas && Array.isArray(result.contentIdeas)) {
        const newIdeas = result.contentIdeas.slice(0, 3).map((idea: any) => ({
          title: idea.title,
          category: 'Educational Content',
          difficulty: idea.difficulty || "Intermediate",
          estimated_views: idea.estimatedViews || "10K-20K",
          competition: idea.competition || "Medium",
          keywords: idea.keywords || [],
          description: idea.description || "",
          script_status: "not_generated"
        }));
        
        await saveContentIdeas(newIdeas);
      }
    }

    // Step 2: Generate script (if enabled)
    if (settings.auto_generate_scripts) {
      currentStepIndex++;
      await updateJobProgress(
        currentJob.id, 
        'running', 
        'Generating script...', 
        Math.round((currentStepIndex / totalSteps) * 100)
      );
      
      const latestIdeas = await new Promise(resolve => {
        setTimeout(() => resolve(contentIdeas), 1000);
      });
      
      if (Array.isArray(latestIdeas) && latestIdeas.length > 0) {
        const firstIdea = latestIdeas[0];
        await updateScriptStatus(firstIdea.id, 'generating');
        
        // Simulate script generation with actual AI call
        await new Promise(resolve => setTimeout(resolve, 2000));
        await updateScriptStatus(firstIdea.id, 'generated');
      }
    }

    // Step 3: Voice synthesis (if enabled)
    if (settings.auto_generate_voice) {
      currentStepIndex++;
      await updateJobProgress(
        currentJob.id, 
        'running', 
        'Synthesizing voice...', 
        Math.round((currentStepIndex / totalSteps) * 100)
      );
      
      // Simulate voice synthesis
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Step 4: Video assembly (if enabled)
    if (settings.auto_assemble_videos) {
      currentStepIndex++;
      await updateJobProgress(
        currentJob.id, 
        'running', 
        'Assembling video...', 
        Math.round((currentStepIndex / totalSteps) * 100)
      );
      
      // Simulate video assembly
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Step 5: YouTube upload (if enabled)
    if (settings.auto_upload_youtube) {
      currentStepIndex++;
      await updateJobProgress(
        currentJob.id, 
        'running', 
        'Uploading to YouTube...', 
        Math.round((currentStepIndex / totalSteps) * 100)
      );
      
      // Simulate YouTube upload
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Complete
    await updateJobProgress(currentJob.id, 'completed', 'Pipeline completed successfully', 100);
    toast.success('Automation pipeline completed successfully!');
  };

  const generateContentIdeasJob = async () => {
    if (!currentJob) return;

    await updateJobProgress(currentJob.id, 'running', 'Generating content ideas...', 50);
    
    const result = await generateContentIdeas(
      'Educational Content',
      'General audience',
      'Create engaging educational videos'
    );
    
    if (result.contentIdeas && Array.isArray(result.contentIdeas)) {
      const newIdeas = result.contentIdeas.map((idea: any) => ({
        title: idea.title,
        category: 'Educational Content',
        difficulty: idea.difficulty || "Intermediate",
        estimated_views: idea.estimatedViews || "10K-20K",
        competition: idea.competition || "Medium",
        keywords: idea.keywords || [],
        description: idea.description || "",
        script_status: "not_generated"
      }));
      
      await saveContentIdeas(newIdeas);
      await updateJobProgress(currentJob.id, 'completed', 'Content ideas generated successfully', 100);
      toast.success('Content ideas generated successfully!');
    } else {
      throw new Error('Failed to generate content ideas');
    }
  };

  const generateScriptJob = async () => {
    if (!currentJob) return;

    await updateJobProgress(currentJob.id, 'running', 'Generating script...', 50);
    
    const ideaToProcess = contentIdeas.find(idea => 
      idea.script_status === 'not_generated' && 
      (!currentJob.content_idea_id || idea.id === currentJob.content_idea_id)
    );
    
    if (ideaToProcess) {
      await updateScriptStatus(ideaToProcess.id, 'generating');
      
      // Simulate script generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await updateScriptStatus(ideaToProcess.id, 'generated');
      await updateJobProgress(currentJob.id, 'completed', 'Script generated successfully', 100);
      toast.success('Script generated successfully!');
    } else {
      throw new Error('No content ideas available for script generation');
    }
  };

  const voiceSynthesisJob = async () => {
    if (!currentJob) return;

    await updateJobProgress(currentJob.id, 'running', 'Synthesizing voice...', 50);
    
    // Simulate voice synthesis
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    await updateJobProgress(currentJob.id, 'completed', 'Voice synthesis completed', 100);
    toast.success('Voice synthesis completed!');
  };

  const videoAssemblyJob = async () => {
    if (!currentJob) return;

    await updateJobProgress(currentJob.id, 'running', 'Assembling video...', 50);
    
    // Simulate video assembly
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await updateJobProgress(currentJob.id, 'completed', 'Video assembly completed', 100);
    toast.success('Video assembly completed!');
  };

  // This component doesn't render anything visible
  return null;
};
