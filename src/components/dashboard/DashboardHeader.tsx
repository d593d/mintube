import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Settings, LogOut, Loader2 } from "lucide-react";
import { AutomationJob, AutomationSettings } from "@/hooks/useAutomation";

interface DashboardHeaderProps {
  user: any;
  settings: AutomationSettings | null;
  currentJob: AutomationJob | null;
  onSignOut: () => void;
  onToggleAutomation: () => void;
  onOpenConfig: () => void;
}

export const DashboardHeader = ({
  user,
  settings,
  currentJob,
  onSignOut,
  onToggleAutomation,
  onOpenConfig
}: DashboardHeaderProps) => {
  const isAutomationRunning = settings?.is_enabled && currentJob?.status === 'running';

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'Creator'}!
        </h1>
        <p className="text-gray-400" role="status" aria-live="polite">
          Your YouTube automation is {isAutomationRunning ? 'running' : 'paused'}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Automation Status */}
        <div className="flex items-center gap-2">
          <Badge variant={isAutomationRunning ? "default" : "secondary"}>
            {isAutomationRunning ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Running
              </>
            ) : (
              'Paused'
            )}
          </Badge>
          
          <Button 
            onClick={onToggleAutomation}
            variant={isAutomationRunning ? "destructive" : "default"}
            size="sm"
            disabled={!settings}
            aria-label={isAutomationRunning ? "Pause automation" : "Start automation"}
          >
            {isAutomationRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                Start
              </>
            )}
          </Button>
        </div>

        {/* Settings Button */}
        <Button onClick={onOpenConfig} variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>

        {/* Sign Out Button */}
        <Button onClick={onSignOut} variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  );
};