
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnalyticsData {
  total_views: number;
  total_subscribers: number;
  total_revenue: number;
  watch_time_hours: number;
  videos_published: number;
  date: string;
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('channel_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const updateAnalytics = async (analyticsData: Omit<AnalyticsData, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('channel_analytics')
        .upsert([{ ...analyticsData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setAnalytics(prev => {
          const filtered = prev.filter(item => item.date !== data.date);
          return [data, ...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
      }
    } catch (error: any) {
      console.error('Error updating analytics:', error);
      toast.error('Failed to update analytics');
      throw error;
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    updateAnalytics,
    refetch: fetchAnalytics
  };
};
