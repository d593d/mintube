
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  Search, 
  Plus, 
  Lightbulb,
  Target,
  Clock,
  Tag
} from "lucide-react";
import { toast } from "sonner";

export const ContentPlanner = () => {
  const [niche, setNiche] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentGoals, setContentGoals] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [contentIdeas, setContentIdeas] = useState([
    {
      title: "The Science Behind Dreams: What Happens When We Sleep",
      category: "Educational",
      difficulty: "Beginner",
      estimatedViews: "15K-25K",
      competition: "Medium",
      keywords: ["dreams", "sleep science", "neuroscience"],
      script: "not_generated"
    },
    {
      title: "Lost Ancient Technologies That Changed History",
      category: "History",
      difficulty: "Intermediate",
      estimatedViews: "20K-35K",
      competition: "Low",
      keywords: ["ancient technology", "history", "archaeology"],
      script: "generated"
    },
    {
      title: "Future of Space Travel: Mars Colonization",
      category: "Science",
      difficulty: "Advanced",
      estimatedViews: "30K-50K",
      competition: "High",
      keywords: ["space travel", "mars", "future technology"],
      script: "not_generated"
    }
  ]);

  const niches = [
    "Educational Content",
    "History & Mysteries",
    "Science & Technology",
    "Self-Improvement",
    "Business & Finance",
    "Health & Wellness",
    "Entertainment",
    "Gaming",
    "Food & Cooking",
    "Travel & Culture"
  ];

  const generateContentIdeas = async () => {
    if (!niche) {
      toast.error("Please select a niche first");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI content generation
    setTimeout(() => {
      const newIdeas = [
        {
          title: `Top 10 ${niche} Secrets Nobody Talks About`,
          category: niche,
          difficulty: "Beginner",
          estimatedViews: "25K-40K",
          competition: "Medium",
          keywords: [niche.toLowerCase(), "secrets", "tips"],
          script: "not_generated"
        },
        {
          title: `The Ultimate Guide to ${niche} for Beginners`,
          category: niche,
          difficulty: "Beginner",
          estimatedViews: "20K-30K",
          competition: "Low",
          keywords: [niche.toLowerCase(), "guide", "beginners"],
          script: "not_generated"
        }
      ];
      
      setContentIdeas([...newIdeas, ...contentIdeas]);
      setIsGenerating(false);
      toast.success("New content ideas generated!");
    }, 2000);
  };

  const scheduleContent = (idea: any) => {
    toast.success(`"${idea.title}" scheduled for production`);
  };

  return (
    <div className="space-y-6">
      {/* Content Strategy Setup */}
      <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Content Strategy Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Niche/Category</label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your niche" />
                </SelectTrigger>
                <SelectContent>
                  {niches.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Input
                placeholder="e.g., Young adults interested in science"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Goals</label>
            <Textarea
              placeholder="Describe your content goals and objectives..."
              value={contentGoals}
              onChange={(e) => setContentGoals(e.target.value)}
              rows={3}
            />
          </div>
          <Button 
            onClick={generateContentIdeas}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate Content Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Content Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {contentIdeas.map((idea, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="mb-2">
                  {idea.category}
                </Badge>
                <Badge variant={idea.competition === "Low" ? "default" : idea.competition === "Medium" ? "secondary" : "destructive"}>
                  {idea.competition} Competition
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Difficulty:</span>
                  <div className="font-medium">{idea.difficulty}</div>
                </div>
                <div>
                  <span className="text-gray-400">Est. Views:</span>
                  <div className="font-medium text-green-400">{idea.estimatedViews}</div>
                </div>
              </div>
              
              <div>
                <span className="text-gray-400 text-sm">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {idea.keywords.map((keyword, kidx) => (
                    <Badge key={kidx} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => scheduleContent(idea)}
                  className="flex-1"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
                <Button size="sm" variant="outline">
                  <Search className="w-4 h-4 mr-1" />
                  Research
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Content Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-medium py-2 text-gray-400">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="aspect-square border border-gray-700 rounded-lg p-2 hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="text-sm">{((i % 31) + 1)}</div>
                {i === 5 && (
                  <div className="text-xs bg-purple-600 rounded px-1 py-0.5 mt-1">
                    Script due
                  </div>
                )}
                {i === 12 && (
                  <div className="text-xs bg-blue-600 rounded px-1 py-0.5 mt-1">
                    Upload
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
