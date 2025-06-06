import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Settings, 
  Volume2,
  AudioWaveform,
  Clock,
  FileAudio
} from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/useAI";

export const VoiceStudio = () => {
  const [selectedVoice, setSelectedVoice] = useState("");
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const { generateVoice } = useAI();

  const voices = [
    { id: "aria", name: "Aria", gender: "Female", accent: "American", quality: "Premium" },
    { id: "david", name: "David", gender: "Male", accent: "British", quality: "Premium" },
    { id: "emma", name: "Emma", gender: "Female", accent: "Australian", quality: "Standard" },
    { id: "james", name: "James", gender: "Male", accent: "American", quality: "Premium" },
    { id: "sophia", name: "Sophia", gender: "Female", accent: "Canadian", quality: "Standard" },
    { id: "oliver", name: "Oliver", gender: "Male", accent: "British", quality: "Premium" }
  ];

  const sampleScript = `Did you know that every night, your brain essentially goes offline for maintenance? What happens during those mysterious 8 hours might shock you. Welcome back to MindScience! I'm your host, and today we're diving deep into the fascinating world of sleep and dreams.`;

  const generateAIVoice = async () => {
    if (!selectedVoice) {
      toast.error("Please select a voice first");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const result = await generateVoice(sampleScript, selectedVoice, speed[0]);
      
      if (result.audioContent) {
        // Create audio URL from base64
        const audioBlob = new Blob([
          new Uint8Array(
            atob(result.audioContent)
              .split('')
              .map(char => char.charCodeAt(0))
          )
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setGeneratedAudio(audioUrl);
        setGenerationProgress(100);
        toast.success("AI voice generated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error generating voice:', error);
      toast.error("Failed to generate voice. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (generatedAudio) {
      const audio = new Audio(generatedAudio);
      if (!isPlaying) {
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        toast.success("Playing AI-generated voice");
      } else {
        audio.pause();
        setIsPlaying(false);
        toast.success("Playback paused");
      }
    } else {
      toast.error("Please generate voice first");
    }
  };

  const downloadAudio = () => {
    if (generatedAudio) {
      const a = document.createElement('a');
      a.href = generatedAudio;
      a.download = `ai-voice-${selectedVoice}-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Audio file downloaded!");
    } else {
      toast.error("Please generate voice first");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Voice Selection */}
      <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            AI Voice Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedVoice === voice.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-sm text-gray-400">
                      {voice.gender} • {voice.accent}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={voice.quality === "Premium" ? "default" : "secondary"}>
                      {voice.quality}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Voice Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Speed</label>
              <span className="text-sm text-gray-400">{speed[0]}x</span>
            </div>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pitch</label>
              <span className="text-sm text-gray-400">{pitch[0]}x</span>
            </div>
            <Slider
              value={pitch}
              onValueChange={setPitch}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Output Format</label>
            <Select defaultValue="mp3">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
                <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
                <SelectItem value="ogg">OGG (Open Source)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <Select defaultValue="high">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (64 kbps)</SelectItem>
                <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                <SelectItem value="high">High (320 kbps)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI generating voice...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          <Button 
            onClick={generateAIVoice}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <AudioWaveform className="w-4 h-4 mr-2 animate-pulse" />
                AI Generating...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Generate AI Voice
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Preview & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            AI Audio Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Sample Script:</div>
            <div className="text-sm leading-relaxed">
              {sampleScript}
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="bg-gray-900/50 rounded-lg p-4 h-24 flex items-center">
            <div className="w-full flex items-end justify-center gap-1 h-16">
              {Array.from({ length: 50 }, (_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-t from-purple-600 to-blue-600 rounded-full"
                  style={{
                    width: "3px",
                    height: `${Math.random() * 100}%`,
                    opacity: isPlaying ? 1 : 0.3,
                    animation: isPlaying ? `pulse 0.5s infinite ${i * 0.1}s` : "none"
                  }}
                />
              ))}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button size="sm" variant="outline" onClick={togglePlayback}>
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <div className="text-sm text-gray-400">
              {isPlaying ? "0:23 / 2:45" : "2:45"}
            </div>
          </div>

          {/* Audio Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">Duration</div>
              <div className="font-medium">2:45</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded">
              <div className="text-gray-400">File Size</div>
              <div className="font-medium">4.2 MB</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={downloadAudio}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button className="flex-1">
              <FileAudio className="w-4 h-4 mr-2" />
              Use in Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
