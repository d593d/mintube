
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Play, 
  Pause, 
  Download,
  Waveform,
  Volume2,
  Clock,
  FileAudio,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/useAI";

export const VoiceStudio = () => {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("aria");
  const [speed, setSpeed] = useState([1.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { generateVoice } = useAI();

  const voices = [
    { id: "aria", name: "Aria", description: "Warm and friendly female voice" },
    { id: "david", name: "David", description: "Professional male voice" },
    { id: "emma", name: "Emma", description: "Clear and articulate female voice" },
    { id: "james", name: "James", description: "Deep and authoritative male voice" },
    { id: "sophia", name: "Sophia", description: "Elegant and sophisticated female voice" },
    { id: "oliver", name: "Oliver", description: "Youthful and energetic male voice" }
  ];

  const generateAIVoice = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to generate voice");
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const result = await generateVoice(text, selectedVoice, speed[0]);
      
      if (result.audioContent) {
        // Convert base64 to blob URL
        const audioBlob = new Blob(
          [Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        toast.success("Voice generated successfully!");
      } else {
        throw new Error("No audio content received");
      }
    } catch (error: any) {
      console.error('Voice generation error:', error);
      toast.error(`Failed to generate voice: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentAudio(null);
    };
    audio.onerror = () => {
      toast.error("Error playing audio");
      setIsPlaying(false);
      setCurrentAudio(null);
    };

    setCurrentAudio(audio);
    setIsPlaying(true);
    audio.play();
  };

  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;

    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voice-${selectedVoice}-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audio downloaded!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Text Input */}
      <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-400" />
            Text to Speech
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Content</label>
            <Textarea
              placeholder="Enter the text you want to convert to speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-gray-400">
              {text.length} characters
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div>
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-xs text-gray-400">{voice.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Speed: {speed[0]}x</label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <Button 
            onClick={generateAIVoice}
            disabled={isGenerating || !text.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Voice...
              </>
            ) : (
              <>
                <Waveform className="w-4 h-4 mr-2" />
                Generate AI Voice
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Audio Player */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Audio Player
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {audioUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">Generated Voice</div>
                    <div className="text-sm text-gray-400">
                      {voices.find(v => v.id === selectedVoice)?.name} • {speed[0]}x speed
                    </div>
                  </div>
                </div>
                <Badge variant="default">Ready</Badge>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={isPlaying ? pauseAudio : playAudio}
                  className="flex-1"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button 
                  onClick={downloadAudio}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Visual waveform placeholder */}
              <div className="h-20 bg-gray-800/30 rounded-lg flex items-center justify-center">
                <div className="flex items-end gap-1 h-12">
                  {Array.from({ length: 40 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gradient-to-t from-purple-600 to-blue-400 rounded-sm ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 50}ms`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileAudio className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <div className="text-gray-400 mb-2">No audio generated yet</div>
              <div className="text-sm text-gray-500">
                Enter text and generate voice to see audio player
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voice Library */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedVoice === voice.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onClick={() => setSelectedVoice(voice.id)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{voice.id}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">{voice.description}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Natural
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    High Quality
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
