
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAutomation } from "@/hooks/useAutomation";
import { Brain, FileText, Mic, Video, Upload, Clock, Target, Settings2 } from "lucide-react";

interface AutomationConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AutomationConfig = ({ open, onOpenChange }: AutomationConfigProps) => {
  const { settings, updateSettings } = useAutomation();
  const [localSettings, setLocalSettings] = useState(settings || {
    auto_generate_ideas: true,
    auto_generate_scripts: true,
    auto_generate_voice: true,
    auto_assemble_videos: true,
    auto_upload_youtube: false,
    generation_frequency: 'daily'
  });

  const [contentPreferences, setContentPreferences] = useState({
    niche: 'Educational Content',
    target_audience: 'General audience',
    content_goals: 'Create engaging educational videos',
    video_duration: '5-10 minutes',
    voice_style: 'Professional',
    upload_schedule: 'daily'
  });

  const handleSave = async () => {
    await updateSettings(localSettings);
    onOpenChange(false);
  };

  const pipelineSteps = [
    {
      id: 'auto_generate_ideas',
      label: 'Content Ideas Generation',
      description: 'Automatically generate video content ideas based on trends and preferences',
      icon: Brain,
      color: 'text-green-500'
    },
    {
      id: 'auto_generate_scripts',
      label: 'Script Generation',
      description: 'Create detailed scripts from content ideas using AI',
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      id: 'auto_generate_voice',
      label: 'Voice Synthesis',
      description: 'Convert scripts to natural-sounding voice narration',
      icon: Mic,
      color: 'text-purple-500'
    },
    {
      id: 'auto_assemble_videos',
      label: 'Video Assembly',
      description: 'Combine voice, visuals, and effects into complete videos',
      icon: Video,
      color: 'text-orange-500'
    },
    {
      id: 'auto_upload_youtube',
      label: 'YouTube Upload',
      description: 'Automatically upload finished videos to YouTube channel',
      icon: Upload,
      color: 'text-red-500'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings2 className="w-5 h-5" />
            Automation Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pipeline Steps Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Pipeline Steps
              </CardTitle>
              <CardDescription>
                Configure which steps should run automatically in your content creation pipeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pipelineSteps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${step.color}`} />
                      <div>
                        <Label className="font-medium">{step.label}</Label>
                        <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={localSettings[step.id as keyof typeof localSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setLocalSettings(prev => ({ ...prev, [step.id]: checked }))
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Schedule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule & Frequency
              </CardTitle>
              <CardDescription>
                Set how often the automation should run
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Generation Frequency</Label>
                <Select
                  value={localSettings.generation_frequency}
                  onValueChange={(value) =>
                    setLocalSettings(prev => ({ ...prev, generation_frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Upload Schedule</Label>
                <Select
                  value={contentPreferences.upload_schedule}
                  onValueChange={(value) =>
                    setContentPreferences(prev => ({ ...prev, upload_schedule: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily at 9 AM</SelectItem>
                    <SelectItem value="weekly">Weekly on Mondays</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Content Preferences
              </CardTitle>
              <CardDescription>
                Configure your content style and target audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Content Niche</Label>
                  <Input
                    value={contentPreferences.niche}
                    onChange={(e) =>
                      setContentPreferences(prev => ({ ...prev, niche: e.target.value }))
                    }
                    placeholder="e.g., Educational Content, Tech Reviews"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input
                    value={contentPreferences.target_audience}
                    onChange={(e) =>
                      setContentPreferences(prev => ({ ...prev, target_audience: e.target.value }))
                    }
                    placeholder="e.g., Young adults, Professionals"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Video Duration</Label>
                  <Select
                    value={contentPreferences.video_duration}
                    onValueChange={(value) =>
                      setContentPreferences(prev => ({ ...prev, video_duration: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3 minutes">1-3 minutes (Short)</SelectItem>
                      <SelectItem value="5-10 minutes">5-10 minutes (Medium)</SelectItem>
                      <SelectItem value="10-20 minutes">10-20 minutes (Long)</SelectItem>
                      <SelectItem value="20+ minutes">20+ minutes (Extended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Voice Style</Label>
                  <Select
                    value={contentPreferences.voice_style}
                    onValueChange={(value) =>
                      setContentPreferences(prev => ({ ...prev, voice_style: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Energetic">Energetic</SelectItem>
                      <SelectItem value="Calm">Calm & Soothing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content Goals</Label>
                <Textarea
                  value={contentPreferences.content_goals}
                  onChange={(e) =>
                    setContentPreferences(prev => ({ ...prev, content_goals: e.target.value }))
                  }
                  placeholder="Describe what you want to achieve with your content..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
