import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  FileText, 
  Mic, 
  Video, 
  Upload,
  Brain,
  Calendar,
  BarChart3,
  Zap,
  LogOut,
  Loader2
} from "lucide-react";
import { ContentPlanner } from "@/components/ContentPlanner";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { VoiceStudio } from "@/components/VoiceStudio";
import { VideoAssembly } from "@/components/VideoAssembly";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { AutomationEngine } from "@/components/AutomationEngine";
import { AutomationConfig } from "@/components/AutomationConfig";
import { Auth } from "@/components/Auth";
import { supabase } from "@/integrations/supabase/client";
import { useVideos } from "@/hooks/useVideos";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAutomation } from "@/hooks/useAutomation";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  
  const { videos, loading: videosLoading } = useVideos();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { settings, currentJob, startAutomation, pauseAutomation, createJob } = useAutomation();

  useEffect(() => {
    // Check current user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const handleToggleAutomation = async () => {
    if (!settings) return;

    if (settings.is_enabled && currentJob?.status === 'running') {
      await pauseAutomation();
    } else {
      await startAutomation();
    }
  };

  // Calculate stats from real data
  const stats = [
    { 
      label: "Videos Generated", 
      value: videos.length.toString(), 
      change: "+12%" 
    },
    { 
      label: "Total Views", 
      value: videos.reduce((sum, video) => sum + video.views, 0).toLocaleString(), 
      change: "+8.5%" 
    },
    { 
      label: "Revenue", 
      value: `$${videos.reduce((sum, video) => sum + video.revenue, 0).toFixed(2)}`, 
      change: "+15%" 
    },
    { 
      label: "Active Videos", 
      value: videos.filter(video => video.status === 'published').length.toString(), 
      change: "+23%" 
    }
  ];

  // Get recent videos from real data
  const recentVideos = videos.slice(0, 3).map(video => ({
    title: video.title,
    status: video.status === 'published' ? 'Published' : video.status === 'processing' ? 'Processing' : 'Queued',
    views: video.views > 0 ? `${(video.views / 1000).toFixed(1)}K` : "-",
    date: video.published_at ? new Date(video.published_at).toLocaleDateString() : "Processing"
  }));

  // Determine automation status
  const getAutomationStatus = () => {
    if (!settings) return "loading";
    if (!settings.is_enabled) return "idle";
    if (currentJob?.status === 'running') return "running";
    if (currentJob?.status === 'paused') return "paused";
    return "idle";
  };

  const automationStatus = getAutomationStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "planner":
        return <ContentPlanner />;
      case "scripts":
        return <ScriptGenerator />;
      case "voice":
        return <VoiceStudio />;
      case "assembly":
        return <VideoAssembly />;
      case "analytics":
        return <AnalyticsDashboard />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Control Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Automation Control
                    </CardTitle>
                    <Badge variant={automationStatus === "running" ? "default" : "secondary"}>
                      {automationStatus.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleToggleAutomation}
                      size="lg"
                      disabled={!settings}
                      className={`${
                        automationStatus === "running" 
                          ? "bg-red-600 hover:bg-red-700" 
                          : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      } transition-all duration-300`}
                    >
                      {automationStatus === "running" ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause Automation
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Automation
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => setConfigOpen(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  {currentJob && currentJob.status === "running" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Task: {currentJob.current_step || 'Processing...'}</span>
                        <span>{currentJob.progress}%</span>
                      </div>
                      <Progress value={currentJob.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                        <div className="text-xs text-green-400">{stat.change}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Videos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Recent Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {videosLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2">Loading videos...</span>
                    </div>
                  ) : recentVideos.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No videos yet. Start by generating content ideas!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentVideos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">{video.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <Badge variant={
                                video.status === "Published" ? "default" : 
                                video.status === "Processing" ? "secondary" : "outline"
                              }>
                                {video.status}
                              </Badge>
                              <span>{video.views} views</span>
                              <span>{video.date}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost" 
                    onClick={() => createJob('generate_content_ideas')}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Content Ideas
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost" 
                    onClick={() => setActiveTab("scripts")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Create New Script
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost" 
                    onClick={() => setActiveTab("voice")}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Synthesis
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="ghost" 
                    onClick={() => setActiveTab("assembly")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Assemble Video
                  </Button>
                  <Button className="w-full justify-start" variant="ghost">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to YouTube
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Automation Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        settings?.auto_generate_ideas ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Content Planning</div>
                        <div className="text-xs text-gray-400">
                          {settings?.auto_generate_ideas ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        settings?.auto_generate_scripts ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Script Generation</div>
                        <div className="text-xs text-gray-400">
                          {settings?.auto_generate_scripts ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        settings?.auto_generate_voice ? 'bg-purple-600' : 'bg-gray-600'
                      }`}>
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Voice Synthesis</div>
                        <div className="text-xs text-gray-400">
                          {settings?.auto_generate_voice ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        settings?.auto_assemble_videos ? 'bg-orange-600' : 'bg-gray-600'
                      }`}>
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Video Assembly</div>
                        <div className="text-xs text-gray-400">
                          {settings?.auto_assemble_videos ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
      {/* Hidden automation engine component */}
      <AutomationEngine />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              YouTube Automation Studio
            </h1>
            <p className="text-gray-400 mt-2">Fully automated faceless YouTube channel management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-600/30">
              <Zap className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "planner", label: "Content Planner", icon: Calendar },
            { id: "scripts", label: "Script Generator", icon: FileText },
            { id: "voice", label: "Voice Studio", icon: Mic },
            { id: "assembly", label: "Video Assembly", icon: Video },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 transition-all duration-300 ${
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                  : "hover:bg-gray-800/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>
      </div>

      {/* Configuration Modal */}
      <AutomationConfig open={configOpen} onOpenChange={setConfigOpen} />
    </div>
  );
};

export default Index;
