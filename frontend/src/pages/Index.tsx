import { useState, lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AutomationEngine } from "@/components/AutomationEngine";
import { Auth } from "@/components/Auth";

// Lazy load heavy components
const ContentPlanner = lazy(() => import("@/components/ContentPlanner").then(module => ({ default: module.ContentPlanner })));
const ScriptGenerator = lazy(() => import("@/components/ScriptGenerator").then(module => ({ default: module.ScriptGenerator })));
const VoiceStudio = lazy(() => import("@/components/VoiceStudio").then(module => ({ default: module.VoiceStudio })));
const VideoAssembly = lazy(() => import("@/components/VideoAssembly").then(module => ({ default: module.VideoAssembly })));
const AnalyticsDashboard = lazy(() => import("@/components/AnalyticsDashboard").then(module => ({ default: module.AnalyticsDashboard })));
const AutomationConfig = lazy(() => import("@/components/AutomationConfig").then(module => ({ default: module.AutomationConfig })));
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TabNavigation } from "@/components/dashboard/TabNavigation";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { useAuth } from "@/hooks/useAuth";
import { useVideos } from "@/hooks/useVideos";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAutomation } from "@/hooks/useAutomation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [configOpen, setConfigOpen] = useState(false);
  
  const { user, loading, signOut } = useAuth();
  const { videos, loading: videosLoading } = useVideos();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { settings, currentJob, startAutomation, pauseAutomation } = useAutomation();

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

  const renderTabContent = () => {
    const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
      <Suspense fallback={<LoadingSpinner size="sm" text="Loading component..." />}>
        {children}
      </Suspense>
    );

    switch (activeTab) {
      case "content":
        return <LazyWrapper><ContentPlanner /></LazyWrapper>;
      case "script":
        return <LazyWrapper><ScriptGenerator /></LazyWrapper>;
      case "voice":
        return <LazyWrapper><VoiceStudio /></LazyWrapper>;
      case "video":
        return <LazyWrapper><VideoAssembly /></LazyWrapper>;
      case "analytics":
        return <LazyWrapper><AnalyticsDashboard /></LazyWrapper>;
      case "automation":
        return <AutomationEngine />;
      case "overview":
      default:
        return (
          <DashboardOverview
            stats={stats}
            videos={videos}
            currentJob={currentJob}
            videosLoading={videosLoading}
            analyticsLoading={analyticsLoading}
          />
        );
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  if (!user) {
    return <Auth />;
  }



  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        
        {/* Hidden automation engine component */}
        <AutomationEngine />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <DashboardHeader
            user={user}
            settings={settings}
            currentJob={currentJob}
            onSignOut={signOut}
            onToggleAutomation={handleToggleAutomation}
            onOpenConfig={() => setConfigOpen(true)}
          />

          {/* Navigation Tabs */}
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />

          {/* Main Content */}
          <main 
            id="main-content" 
            className="animate-fade-in"
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
          >
            {renderTabContent()}
          </main>
        </div>

        {/* Configuration Modal */}
        <Suspense fallback={null}>
          <AutomationConfig open={configOpen} onOpenChange={setConfigOpen} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
