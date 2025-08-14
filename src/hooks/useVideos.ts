@@ .. @@
   const createVideo = async (videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'>) => {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) throw new Error('User not authenticated');

       const { data, error } = await supabase
         .from('videos')
-        .insert([{ ...videoData, user_id: user.id }])
+        .insert([{ 
+          ...videoData, 
+          user_id: user.id,
+          status: videoData.status || 'draft',
+          views: videoData.views || 0,
+          likes: videoData.likes || 0,
+          comments: videoData.comments || 0,
+          revenue: videoData.revenue || 0
+        }])
         .select()
         .single();

       if (error) throw error;