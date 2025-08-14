@@ .. @@
 import { useState, useEffect } from "react";
 import { toast } from "sonner";
+import { supabase } from "@/integrations/supabase/client";

-const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
+const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

 export interface MediaAsset {
@@ .. @@
   const fetchVideoTemplates = async () => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/templates`);
-      if (!response.ok) throw new Error('Failed to fetch templates');
-      const templatesData = await response.json();
+      const { data: templatesData, error } = await supabase.functions.invoke('video-assembly/templates');
+      if (error) throw error;
       setTemplates(templatesData);
     } catch (error) {
       console.error('Error fetching templates:', error);
@@ .. @@
   const fetchRecentRenders = async () => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/recent-renders?limit=5`);
-      if (response.ok) {
-        const renders = await response.json();
-        setRecentRenders(renders);
-      }
+      const { data: renders, error } = await supabase.functions.invoke('video-assembly/recent-renders');
+      if (!error && renders) {
+        setRecentRenders(renders);
+      }
     } catch (error) {
       console.error('Error fetching recent renders:', error);
     }
@@ .. @@
   const fetchBatchJobs = async () => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/batch/jobs?limit=10`);
-      if (response.ok) {
-        const jobs = await response.json();
-        setBatchJobs(jobs);
-      }
+      const { data: jobs, error } = await supabase.functions.invoke('video-assembly/batch/jobs');
+      if (!error && jobs) {
+        setBatchJobs(jobs);
+      }
     } catch (error) {
       console.error('Error fetching batch jobs:', error);
     }
@@ .. @@
   const fetchBatchStats = async () => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/batch/stats`);
-      if (response.ok) {
-        const stats = await response.json();
-        setBatchStats(stats);
-      }
+      const { data: stats, error } = await supabase.functions.invoke('video-assembly/batch/stats');
+      if (!error && stats) {
+        setBatchStats(stats);
+      }
     } catch (error) {
       console.error('Error fetching batch stats:', error);
     }
@@ .. @@
       // Prepare request data for enhanced backend
       const requestData = {
-        script_content: scriptAsset.script_content || 'Default script content',
-        voice_audio_base64: voiceAsset?.audio_base64 || null,
-        template_id: templateId,
+        templateId: templateId,
+        selectedAssets: selectedAssets,
         quality: quality,
-        background_config: {
-          frameRate: frameRate
-        },
-        project_id: `project_${Date.now()}`
+        frameRate: frameRate,
+        scriptContent: scriptAsset.script_content || 'Default script content',
+        voiceAudioBase64: voiceAsset?.audio_base64 || null
       };

-      // Create automated video using enhanced backend
-      const response = await fetch(`${BACKEND_URL}/api/video/create-automated`, {
-        method: 'POST',
-        headers: {
-          'Content-Type': 'application/json',
-        },
-        body: JSON.stringify(requestData)
-      });
-
-      if (!response.ok) {
-        const errorData = await response.json();
-        throw new Error(errorData.detail || 'Failed to create video');
-      }
-
-      const render = await response.json();
+      // Create automated video using Supabase Edge Function
+      const { data: render, error } = await supabase.functions.invoke('video-assembly/create-automated', {
+        body: requestData
+      });
+      
+      if (error) throw error;
       toast.success('Professional video creation started! Check the status below.');

@@ .. @@
       // Prepare request data for batch processing
       const requestData = {
-        script_content: scriptAsset.script_content || 'Default script content',
-        voice_audio_base64: voiceAsset?.audio_base64 || null,
-        template_id: templateId,
+        templateId: templateId,
+        selectedAssets: selectedAssets,
         quality: quality,
-        background_config: {
-          frameRate: frameRate
-        },
-        project_id: `batch_project_${Date.now()}`
+        frameRate: frameRate,
+        scriptContent: scriptAsset.script_content || 'Default script content',
+        voiceAudioBase64: voiceAsset?.audio_base64 || null
       };

-      // Submit batch job
-      const response = await fetch(`${BACKEND_URL}/api/video/batch/submit`, {
-        method: 'POST',
-        headers: {
-          'Content-Type': 'application/json',
-        },
-        body: JSON.stringify(requestData)
-      });
-
-      if (!response.ok) {
-        const errorData = await response.json();
-        throw new Error(errorData.detail || 'Failed to submit batch job');
-      }
-
-      const result = await response.json();
+      // Submit batch job using Supabase Edge Function
+      const { data: result, error } = await supabase.functions.invoke('video-assembly/batch/submit', {
+        body: requestData
+      });
+      
+      if (error) throw error;
       toast.success('Batch video job submitted! Processing in background.');

@@ .. @@
         return {
-          script_content: scriptAsset?.script_content || 'Default script content',
-          voice_audio_base64: voiceAsset?.audio_base64 || null,
-          template_id: config.templateId,
+          templateId: config.templateId,
+          selectedAssets: config.selectedAssets,
           quality: config.quality,
-          background_config: {
-            frameRate: config.frameRate
-          },
-          project_id: `multi_batch_project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
+          frameRate: config.frameRate,
+          scriptContent: scriptAsset?.script_content || 'Default script content',
+          voiceAudioBase64: voiceAsset?.audio_base64 || null
         };
       });

-      const response = await fetch(`${BACKEND_URL}/api/video/batch/submit-multiple`, {
-        method: 'POST',
-        headers: {
-          'Content-Type': 'application/json',
-        },
-        body: JSON.stringify(requestData)
-      });
-
-      if (!response.ok) {
-        const errorData = await response.json();
-        throw new Error(errorData.detail || 'Failed to submit multiple batch jobs');
-      }
-
-      const result = await response.json();
+      const { data: result, error } = await supabase.functions.invoke('video-assembly/batch/submit-multiple', {
+        body: requestData
+      });
+      
+      if (error) throw error;
       toast.success(`${result.total_jobs} batch video jobs submitted! Processing in background.`);

@@ .. @@
   const getRenderStatus = async (renderId: string): Promise<VideoRender> => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/render-status/${renderId}`);
-      if (!response.ok) throw new Error('Failed to fetch render status');
-      return await response.json();
+      const { data: status, error } = await supabase.functions.invoke(`video-assembly/render-status/${renderId}`);
+      if (error) throw error;
+      return status;
     } catch (error) {
       console.error('Error fetching render status:', error);
       throw error;
@@ .. @@
   const getBatchJobStatus = async (jobId: string): Promise<BatchJob> => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/batch/status/${jobId}`);
-      if (!response.ok) throw new Error('Failed to fetch batch job status');
-      return await response.json();
+      const { data: status, error } = await supabase.functions.invoke(`video-assembly/batch/status/${jobId}`);
+      if (error) throw error;
+      return status;
     } catch (error) {
       console.error('Error fetching batch job status:', error);
       throw error;
@@ .. @@
   const cancelBatchJob = async (jobId: string): Promise<boolean> => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/batch/cancel/${jobId}`, {
-        method: 'POST'
-      });
-      
-      if (response.ok) {
-        toast.success('Batch job cancelled successfully');
-        await fetchBatchJobs();
-        await fetchBatchStats();
-        return true;
-      }
-      return false;
+      const { error } = await supabase.functions.invoke(`video-assembly/batch/cancel/${jobId}`);
+      
+      if (!error) {
+        toast.success('Batch job cancelled successfully');
+        await fetchBatchJobs();
+        await fetchBatchStats();
+        return true;
+      }
+      return false;
     } catch (error) {
       console.error('Error cancelling batch job:', error);
       toast.error('Failed to cancel batch job');
@@ .. @@
   const retryBatchJob = async (jobId: string): Promise<string | null> => {
     try {
-      const response = await fetch(`${BACKEND_URL}/api/video/batch/retry/${jobId}`, {
-        method: 'POST'
-      });
-      
-      if (response.ok) {
-        const result = await response.json();
-        toast.success('Batch job retry submitted successfully');
-        await fetchBatchJobs();
-        await fetchBatchStats();
-        return result.new_job_id;
-      }
-      return null;
+      const { data: result, error } = await supabase.functions.invoke(`video-assembly/batch/retry/${jobId}`);
+      
+      if (!error && result) {
+        toast.success('Batch job retry submitted successfully');
+        await fetchBatchJobs();
+        await fetchBatchStats();
+        return result.new_job_id;
+      }
+      return null;
     } catch (error) {
       console.error('Error retrying batch job:', error);
       toast.error('Failed to retry batch job');
@@ .. @@
   const getDownloadUrl = (renderId: string): string => {
-    return `${BACKEND_URL}/api/video/download/${renderId}`;
+    return `${SUPABASE_URL}/functions/v1/video-assembly/download/${renderId}`;
   };

   const getPreviewUrl = (renderId: string): string => {
-    return `${BACKEND_URL}/api/video/preview/${renderId}`;
+    return `${SUPABASE_URL}/functions/v1/video-assembly/preview/${renderId}`;
   };