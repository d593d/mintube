
import { useState } from "react";
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
  Zap
} from "lucide-react";
import { ContentPlanner } from "@/components/ContentPlanner";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { VoiceStudio } from "@/components/VoiceStudio";
import { VideoAssembly } from "@/components/VideoAssembly";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [automationStatus, setAutomationStatus] = useState("idle"); // idle, running, paused

  const stats = [
    { label: "Videos Generated", value: "47", change: "+12%" },
    { label: "Total Views", value: "125.3K", change: "+8.5%" },
    { label: "Revenue", value: "$342", change: "+15%" },
    { label: "Automation Hours", value: "156", change: "+23%" }
  ];

  const recentVideos = [
    { title: "The Science of Sleep: Why We Dream", status: "Published", views: "12.4K", date: "2 hours ago" },
    { title: "Ancient Mysteries: Lost Civilizations", status: "Processing", views: "-", date: "Processing" },
    { title: "Future Technology: AI Revolution", status: "Queued", views: "-", date: "In queue" },
  ];

  const toggleAutomation = () => {
    if (automationStatus === "idle") {
      setAutomationStatus("running");
    } else if (automationStatus === "running") {
      setAutomationStatus("paused");
    } else {
      setAutomationStatus("running");
    }
  };

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
                      onClick={toggleAutomation}
                      size="lg"
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
                    <Button variant="outline" size="lg">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  {automationStatus === "running" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Task: Generating script for "Space Exploration"</span>
                        <span>73%</span>
                      </div>
                      <Progress value={73} className="h-2" />
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
                  <Button className="w-full justify-start" variant="ghost" onClick={() => setActiveTab("planner")}>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Content Ideas
                  </Button>
                  <Button className="w-full justify-start" variant="ghost" onClick={() => setActiveTab("scripts")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Create New Script
                  </Button>
                  <Button className="w-full justify-start" variant="ghost" onClick={() => setActiveTab("voice")}>
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Synthesis
                  </Button>
                  <Button className="w-full justify-start" variant="ghost" onClick={() => setActiveTab("assembly")}>
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
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Content Planning</div>
                        <div className="text-xs text-gray-400">Active</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Script Generation</div>
                        <div className="text-xs text-gray-400">Processing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Voice Synthesis</div>
                        <div className="text-xs text-gray-400">Queued</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Video Assembly</div>
                        <div className="text-xs text-gray-400">Queued</div>
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
    </div>
  );
};

export default Index;
