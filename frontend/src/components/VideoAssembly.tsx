
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Video, 
  Image, 
  FileAudio, 
  Type, 
  Play, 
  Pause,
  Download,
  Upload,
  Settings,
  Layers,
  Clock,
  Palette,
  Loader2,
  Eye,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useVideoAssembly, VideoRender } from "@/hooks/useVideoAssembly";

export const VideoAssembly = () => {
  const { 
    mediaAssets, 
    templates, 
    recentRenders,
    loading, 
    createAutomatedVideo, 
    getRenderStatus,
    getDownloadUrl,
    getPreviewUrl,
    refreshRenders
  } = useVideoAssembly();

  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [outputQuality, setOutputQuality] = useState("1080p");
  const [frameRate, setFrameRate] = useState("30fps");
  const [currentRender, setCurrentRender] = useState<VideoRender | null>(null);
  const [statusPolling, setStatusPolling] = useState<boolean>(false);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "audio": return <FileAudio className="w-4 h-4" />;
      case "script": return <Type className="w-4 h-4" />;
      case "background": return <Video className="w-4 h-4" />;
      case "music": return <FileAudio className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const pollRenderStatus = useCallback(async (renderId: string) => {
    try {
      const status = await getRenderStatus(renderId);
      setCurrentRender(status);
      setAssemblyProgress(status.progress);

      if (status.status === 'completed' || status.status === 'failed') {
        setStatusPolling(false);
        setIsAssembling(false);
        await refreshRenders();
        
        if (status.status === 'completed') {
          toast.success('Video created successfully! You can now download or preview it.');
        } else {
          toast.error(`Video creation failed: ${status.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error polling render status:', error);
    }
  }, [getRenderStatus, refreshRenders]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (statusPolling && currentRender) {
      interval = setInterval(() => {
        pollRenderStatus(currentRender.render_id);
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [statusPolling, currentRender, pollRenderStatus]);

  const assembleVideo = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    if (selectedAssets.length === 0) {
      toast.error("Please select at least one media asset");
      return;
    }

    // Check if we have required assets (script)
    const hasScript = mediaAssets.some(asset => 
      selectedAssets.includes(asset.id) && asset.type === 'script'
    );

    if (!hasScript) {
      toast.error("Please select a script for automated video creation");
      return;
    }

    setIsAssembling(true);
    setAssemblyProgress(0);
    setCurrentRender(null);

    try {
      const render = await createAutomatedVideo(
        selectedTemplate, 
        selectedAssets, 
        outputQuality, 
        frameRate
      );

      setCurrentRender(render);
      setStatusPolling(true);
      setAssemblyProgress(10);

    } catch (error) {
      setIsAssembling(false);
      setAssemblyProgress(0);
      setStatusPolling(false);
    }
  };

  const downloadVideo = (render: VideoRender) => {
    if (render.status !== 'completed') return;
    
    const downloadUrl = getDownloadUrl(render.render_id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = render.output_file || `video_${render.render_id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  const previewVideo = (render: VideoRender) => {
    if (render.status !== 'completed') return;
    
    const previewUrl = getPreviewUrl(render.render_id);
    window.open(previewUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading enhanced video engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* OpenCut Integration Banner */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              OpenCut-Powered Video Engine
            </h3>
          </div>
          <p className="text-gray-300">
            Professional video creation with timeline-based editing, multi-track composition, and automated rendering. 
            Create cinematic videos from your scripts and voices with zero manual editing.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Video Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="font-medium mb-1">{template.name}</div>
                <div className="text-sm text-gray-400 mb-2">{template.style}</div>
                <div className="text-xs text-gray-500">{template.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Media Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Media Assets ({mediaAssets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mediaAssets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No media assets available</p>
                <p className="text-sm">Create scripts and generate voices first</p>
              </div>
            ) : (
              mediaAssets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <Checkbox
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={() => handleAssetToggle(asset.id)}
                  />
                  <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{asset.name}</div>
                    <div className="text-xs text-gray-400">
                      {asset.duration} • {asset.size}
                    </div>
                  </div>
                  <Badge variant={asset.status === "ready" ? "default" : "secondary"}>
                    {asset.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Assembly Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Assembly Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Quality</label>
              <Select value={outputQuality} onValueChange={setOutputQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="4k">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Frame Rate</label>
              <Select value={frameRate} onValueChange={setFrameRate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24fps">24 FPS (Cinematic)</SelectItem>
                  <SelectItem value="30fps">30 FPS (Standard)</SelectItem>
                  <SelectItem value="60fps">60 FPS (Smooth)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-400">
              Selected assets: {selectedAssets.length}
            </div>

            {isAssembling && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Creating professional video...</span>
                  <span>{assemblyProgress}%</span>
                </div>
                <Progress value={assemblyProgress} className="h-2" />
                
                {currentRender && (
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(currentRender.status)}
                      <span className="capitalize">{currentRender.status}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Render ID: {currentRender.render_id}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={assembleVideo}
              disabled={isAssembling || !selectedTemplate || selectedAssets.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAssembling ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Creating Video...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Professional Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Renders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Recent Video Renders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRenders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent renders</p>
              <p className="text-sm">Your created videos will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRenders.map((render) => (
                <div key={render.render_id} className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(render.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      Video Render • {render.render_id.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-4">
                      <span className="capitalize">{render.status}</span>
                      {render.duration && <span>{render.duration.toFixed(1)}s</span>}
                      {render.file_size && (
                        <span>{(render.file_size / (1024 * 1024)).toFixed(1)}MB</span>
                      )}
                      {render.render_time && (
                        <span>Rendered in {render.render_time.toFixed(1)}s</span>
                      )}
                    </div>
                  </div>

                  {render.status === 'completed' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => previewVideo(render)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadVideo(render)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}

                  {render.status === 'failed' && (
                    <div className="text-xs text-red-400">
                      {render.error}
                    </div>
                  )}

                  {render.status === 'processing' && (
                    <div className="text-xs text-blue-400">
                      {render.progress}% complete
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Professional Video Output
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <div className="text-gray-300 text-lg mb-2">OpenCut-Powered Video Engine</div>
              <div className="text-gray-400">
                {selectedTemplate && selectedAssets.length > 0 
                  ? "Click 'Create Professional Video' to generate your automated video"
                  : "Select a template and assets to enable professional video creation"
                }
              </div>
              <div className="text-sm text-gray-500 mt-3">
                ✨ Timeline-based editing • Multi-track composition • Professional transitions
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <div className="text-gray-400">Engine</div>
              <div className="font-medium flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-purple-400" />
                OpenCut Core
              </div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <div className="text-gray-400">Resolution</div>
              <div className="font-medium">
                {outputQuality === '720p' ? '1280x720' : 
                 outputQuality === '4k' ? '3840x2160' : '1920x1080'}
              </div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <div className="text-gray-400">Frame Rate</div>
              <div className="font-medium">{frameRate.toUpperCase()}</div>
            </div>
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <div className="text-gray-400">Format</div>
              <div className="font-medium">MP4 (H.264)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
