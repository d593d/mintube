import { StatsOverview } from "./StatsOverview";
import { RecentVideos } from "./RecentVideos";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Clock } from "lucide-react";
import { AutomationJob } from "@/hooks/useAutomation";

interface Video {
  id: string;
  title: string;
  thumbnail_url?: string;
  status: string;
  views: number;
  likes: number;
  comments: number;
  revenue: number;
  published_at?: string;
}

interface Stat {
  label: string;
  value: string;
  change: string;
}

interface DashboardOverviewProps {
  stats: Stat[];
  videos: Video[];
  currentJob: AutomationJob | null;
  videosLoading: boolean;
  analyticsLoading: boolean;
  onUploadVideo?: (videoId: string) => void;
}

export const DashboardOverview = ({
  stats,
  videos,
  currentJob,
  videosLoading,
  analyticsLoading,
  onUploadVideo
}: DashboardOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview stats={stats} loading={analyticsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Videos */}
        <div className="lg:col-span-2">
          <RecentVideos 
            videos={videos} 
            loading={videosLoading}
            onUploadVideo={onUploadVideo}
          />
        </div>

        {/* Automation Status */}
        <div className="space-y-6">
          {/* Current Job Progress */}
          {currentJob && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>{currentJob.current_step || 'Initializing...'}</span>
                    <span>{currentJob.progress}%</span>
                  </div>
                  <Progress value={currentJob.progress} className="h-2" />
                </div>
                
                <div className="text-xs text-gray-400">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3" />
                    Status: {currentJob.status}
                  </div>
                  {currentJob.started_at && (
                    <div>
                      Started: {new Date(currentJob.started_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-400">
                <p>• Content ideas generated: {videos.length}</p>
                <p>• Videos published: {videos.filter(v => v.status === 'published').length}</p>
                <p>• Total revenue: ${videos.reduce((sum, v) => sum + v.revenue, 0).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};