
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Wand2, 
  Download, 
  Copy, 
  Clock, 
  Target,
  Volume2,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { useAI } from "@/hooks/useAI";

export const ScriptGenerator = () => {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [style, setStyle] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [scriptMetrics, setScriptMetrics] = useState({
    wordCount: 1247,
    readingTime: "9:32",
    speakingRate: 130,
    readability: "Good"
  });
  const { generateScript } = useAI();

  const [generatedScript, setGeneratedScript] = useState(`
[HOOK - 0:00-0:15]
Did you know that every night, your brain essentially goes offline for maintenance? What happens during those mysterious 8 hours might shock you.

[INTRODUCTION - 0:15-0:45]
Welcome back to MindScience! I'm your host, and today we're diving deep into the fascinating world of sleep and dreams. By the end of this video, you'll understand exactly why your brain needs sleep and what those weird dreams actually mean.

[MAIN CONTENT - 0:45-8:30]

## The Sleep Cycle Mystery
Your sleep isn't just one long blackout. It's actually a carefully orchestrated symphony of brain activity that cycles through distinct phases every 90 minutes.

### Phase 1: Light Sleep (5% of sleep)
This is where you're drifting off. Your brain waves slow down, but you're still easily awakened. Fun fact: this is when you might experience those weird falling sensations!

### Phase 2: Deep Sleep Preparation (45% of sleep)
Your brain temperature drops, heart rate slows, and your brain starts preparing for the deep maintenance work ahead.

### Phase 3: Deep Sleep (25% of sleep)
This is where the magic happens. Your brain literally shrinks by 60%, allowing cerebrospinal fluid to flush out toxins like a dishwasher for your mind.

### REM Sleep: The Dream Theater (25% of sleep)
Rapid Eye Movement sleep is when most vivid dreams occur. Your brain is almost as active as when you're awake, but your body is paralyzed to prevent you from acting out your dreams.

## Why We Dream
Dreams aren't just random brain static. They serve three crucial functions:
1. Memory consolidation - filing away important information
2. Emotional processing - working through feelings and experiences  
3. Creative problem-solving - making unexpected connections

[CONCLUSION - 8:30-9:45]
Understanding your sleep isn't just fascinating - it's essential for optimizing your health, creativity, and performance. Tonight, when you lay your head down, remember that your brain is about to embark on one of nature's most incredible processes.

[CALL TO ACTION - 9:45-10:00]
If this blew your mind, hit that subscribe button for more brain science content. What's the weirdest dream you've ever had? Let me know in the comments below!

[END SCREEN - 10:00]
Don't forget to check out our video on lucid dreaming techniques - the link is right here on your screen!
  `);

  const scriptStyles = [
    "Educational & Informative",
    "Storytelling & Narrative",
    "Quick Facts & Lists",
    "Documentary Style",
    "Conversational & Casual",
    "Motivational & Inspiring"
  ];

  const durations = [
    "Short (3-5 minutes)",
    "Medium (8-12 minutes)",
    "Long (15-20 minutes)",
    "Deep Dive (25+ minutes)"
  ];

  const generateAIScript = async () => {
    if (!topic || !duration || !style) {
      toast.error("Please fill in all required fields");
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
        return prev + 10;
      });
    }, 200);

    try {
      const result = await generateScript(topic, duration, style, targetAudience, additionalNotes);
      
      if (result.script) {
        setGeneratedScript(result.script);
        if (result.metrics) {
          setScriptMetrics(result.metrics);
        }
        setGenerationProgress(100);
        toast.success("AI script generated successfully!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error("Failed to generate script. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    toast.success("Script copied to clipboard!");
  };

  const downloadScript = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Script downloaded!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Script Configuration */}
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-400" />
              AI Script Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Topic *</label>
              <Input
                placeholder="e.g., The Science Behind Dreams"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration *</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Style *</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {scriptStyles.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Input
                placeholder="e.g., Young adults interested in science"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                placeholder="Any specific requirements, tone, or key points to include..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI generating script...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-2" />
              </div>
            )}

            <Button 
              onClick={generateAIScript}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate AI Script
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Script Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Script Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm text-gray-400">Read Time</span>
                </div>
                <div className="text-xl font-bold">{scriptMetrics.readingTime}</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm text-gray-400">Word Count</span>
                </div>
                <div className="text-xl font-bold">{scriptMetrics.wordCount}</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm text-gray-400">Speaking Rate</span>
                </div>
                <div className="text-xl font-bold">{scriptMetrics.speakingRate} WPM</div>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm text-gray-400">Readability</span>
                </div>
                <div className="text-xl font-bold text-green-400">{scriptMetrics.readability}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Script */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              AI Generated Script
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyScript}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={downloadScript}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900/50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {generatedScript}
            </pre>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button className="flex-1">
              <Volume2 className="w-4 h-4 mr-2" />
              Generate AI Voice
            </Button>
            <Button variant="outline" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
