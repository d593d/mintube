
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Share,
  DollarSign,
  Users,
  Clock,
  Target
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const AnalyticsDashboard = () => {
  const viewsData = [
    { date: "Jan", views: 12400, revenue: 23 },
    { date: "Feb", views: 18600, revenue: 34 },
    { date: "Mar", views: 25200, revenue: 47 },
    { date: "Apr", views: 31800, revenue: 59 },
    { date: "May", views: 28900, revenue: 52 },
    { date: "Jun", views: 42300, revenue: 78 }
  ];

  const topVideos = [
    { title: "The Science Behind Dreams", views: "45.2K", ctr: "8.4%", revenue: "$89", trend: "up" },
    { title: "Ancient Lost Technologies", views: "38.7K", ctr: "7.2%", revenue: "$76", trend: "up" },
    { title: "Future Space Exploration", views: "29.1K", ctr: "6.8%", revenue: "$58", trend: "down" },
    { title: "AI Revolution Explained", views: "22.5K", ctr: "9.1%", revenue: "$45", trend: "up" }
  ];

  const metrics = [
    { 
      label: "Total Views", 
      value: "125.3K", 
      change: "+15.2%", 
      trend: "up", 
      icon: Eye,
      color: "text-blue-400"
    },
    { 
      label: "Revenue", 
      value: "$342", 
      change: "+22.1%", 
      trend: "up", 
      icon: DollarSign,
      color: "text-green-400"
    },
    { 
      label: "Subscribers", 
      value: "8.9K", 
      change: "+8.7%", 
      trend: "up", 
      icon: Users,
      color: "text-purple-400"
    },
    { 
      label: "Watch Time", 
      value: "2.1K hrs", 
      change: "+12.3%", 
      trend: "up", 
      icon: Clock,
      color: "text-orange-400"
    }
  ];

  const channelGoals = [
    { goal: "10K Subscribers", current: 8900, target: 10000, progress: 89 },
    { goal: "100K Total Views", current: 125300, target: 100000, progress: 100 },
    { goal: "$500 Monthly Revenue", current: 342, target: 500, progress: 68 },
    { goal: "50 Videos Published", current: 47, target: 50, progress: 94 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm ${
                      metric.trend === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Views & Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1F2937", 
                    border: "1px solid #374151",
                    borderRadius: "8px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1F2937", 
                    border: "1px solid #374151",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Top Performing Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topVideos.map((video, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium">{video.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views}
                    </span>
                    <span>CTR: {video.ctr}</span>
                    <span className="text-green-400">{video.revenue}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {video.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Channel Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channelGoals.map((goal, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.goal}</span>
                  <Badge variant={goal.progress >= 100 ? "default" : "secondary"}>
                    {goal.progress}%
                  </Badge>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="text-sm text-gray-400">
                  {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
