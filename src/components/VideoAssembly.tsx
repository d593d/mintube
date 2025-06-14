
import { useState } from "react";
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
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useVideoAssembly } from "@/hooks/useVideoAssembly";

export const VideoAssembly = () => {
  const { mediaAssets, templates, loading, createVideo } = useVideoAssembly();
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [outputQuality, setOutputQuality] = useState("1080p");
  const [frameRate, setFrameRate] = useState("30fps");

  const assemblySteps = [
    { name: "Loading assets", completed: true },
    { name: "Processing audio", completed: true },
    { name: "Generating visuals", completed: false },
    { name: "Adding transitions", completed: false },
    { name: "Rendering video", completed: false }
  ];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "audio": return <FileAudio className="w-4 h-4" />;
      case "script": return <Type className="w-4 h-4" />;
      case "background": return <Video className="w-4 h-4" />;
      case "music": return <FileAudio className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const assembleVideo = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    if (selectedAssets.length === 0) {
      toast.error("Please select at least one media asset");
      return;
    }

    setIsAssembling(true);
    setAssemblyProgress(0);

    try {
      // Start video creation
      await createVideo(selectedTemplate, selectedAssets, outputQuality, frameRate);

      // Simulate assembly progress
      const progressInterval = setInterval(() => {
        setAssemblyProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 300);

      setTimeout(() => {
        setIsAssembling(false);
        setAssemblyProgress(100);
        toast.success("Video assembled successfully!");
      }, 15000);
    } catch (error) {
      setIsAssembling(false);
      setAssemblyProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading media assets...</span>
      </div>
    );
  }

  return (
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
              <div className="text-sm text-gray-400">{template.style}</div>
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

          <Button variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Add More Assets
          </Button>
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
                <span>Assembling video...</span>
                <span>{assemblyProgress}%</span>
              </div>
              <Progress value={assemblyProgress} className="h-2" />
              
              <div className="space-y-2">
                {assemblySteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      step.completed ? "bg-green-500" : 
                      index === Math.floor(assemblyProgress / 20) ? "bg-blue-500 animate-pulse" : "bg-gray-600"
                    }`} />
                    <span className={step.completed ? "text-green-400" : "text-gray-400"}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={assembleVideo}
            disabled={isAssembling || !selectedTemplate || selectedAssets.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isAssembling ? (
              <>
                <Video className="w-4 h-4 mr-2 animate-pulse" />
                Assembling...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Assemble Video
              </>
            )}
          </Button>

          {assemblyProgress === 100 && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <Button className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload to YouTube
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <div className="text-gray-400">Video preview will appear here</div>
              <div className="text-sm text-gray-500 mt-2">
                {selectedTemplate && selectedAssets.length > 0 
                  ? "Click 'Assemble Video' to generate preview"
                  : "Select a template and assets to enable assembly"
                }
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-800/50 rounded">
              <div className="text-gray-400">Duration</div>
              <div className="font-medium flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {mediaAssets.find(a => a.type === 'script')?.duration || "N/A"}
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
              <div className="font-medium">MP4</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
