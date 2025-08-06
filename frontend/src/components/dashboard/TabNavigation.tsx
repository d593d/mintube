import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Mic, 
  Video, 
  BarChart3,
  Brain,
  Calendar,
  Zap
} from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { id: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "content", label: "Content Planning", icon: <Calendar className="h-4 w-4" /> },
  { id: "script", label: "Script Generator", icon: <FileText className="h-4 w-4" /> },
  { id: "voice", label: "Voice Studio", icon: <Mic className="h-4 w-4" /> },
  { id: "video", label: "Video Assembly", icon: <Video className="h-4 w-4" /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "automation", label: "Automation", icon: <Zap className="h-4 w-4" /> },
];

export const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav 
      className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-800/30 rounded-lg"
      role="tablist"
      aria-label="Dashboard navigation"
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={`flex items-center gap-2 ${
            activeTab === tab.id 
              ? "bg-blue-600 text-white" 
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </nav>
  );
};