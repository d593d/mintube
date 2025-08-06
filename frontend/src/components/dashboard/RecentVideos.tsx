import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Eye, ThumbsUp, MessageCircle, Upload, Video } from "lucide-react";

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

interface RecentVideosProps {
  videos: Video[];
  loading?: boolean;
  onUploadVideo?: (videoId: string) => void;
}

export const RecentVideos = ({ videos, loading = false, onUploadVideo }: RecentVideosProps) => {
  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="w-20 h-12 bg-gray-600 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded animate-pulse" />
                  <div className="h-3 bg-gray-600 rounded animate-pulse w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentVideos = videos.slice(0, 5);

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Play className="h-5 w-5" />
          Recent Videos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No videos generated yet</p>
            <p className="text-sm">Start the automation to create your first video!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-20 h-12 bg-gray-600 rounded overflow-hidden flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate mb-1">
                    {video.title}
                  </h4>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {video.likes.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {video.comments.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      video.status === 'published' ? 'default' :
                      video.status === 'processing' ? 'secondary' :
                      'outline'
                    }
                  >
                    {video.status}
                  </Badge>
                  
                  {video.status === 'ready' && onUploadVideo && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUploadVideo(video.id)}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};