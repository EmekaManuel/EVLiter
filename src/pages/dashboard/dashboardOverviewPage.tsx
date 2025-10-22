import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Car,
  MapPin,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardOverviewPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Car,
      title: "AI Car Recognition",
      description:
        "Identify your EV and get charging specifications automatically",
      href: "/dashboard/ai-car-recognition",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: MapPin,
      title: "Charging Stations",
      description: "Find nearby charging stations with real-time availability",
      href: "/dashboard/charging-stations",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Brain,
      title: "Smart Advisor",
      description: "Get AI-powered charging recommendations",
      href: "/dashboard/smart-advisor",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Zap,
      title: "My Charging",
      description: "Track your charging history and manage sessions",
      href: "/dashboard/my-charging",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  const stats = [
    { label: "Total Sessions", value: "1,247", icon: Zap },
    { label: "Energy Delivered", value: "45.2k kWh", icon: TrendingUp },
    { label: "Active Users", value: "2,847", icon: Users },
    { label: "Stations Available", value: "156", icon: MapPin },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to EVLiter</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your intelligent EV charging companion. Find stations, get
          recommendations, and manage your charging experience with AI-powered
          insights.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(feature.href)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full group"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(feature.href);
                }}
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Getting Started</span>
          </CardTitle>
          <CardDescription>
            Follow these steps to get the most out of EVLiter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium">Identify Your EV</h3>
              <p className="text-sm text-gray-600">
                Use AI car recognition to automatically identify your electric
                vehicle and get charging specifications.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium">Find Stations</h3>
              <p className="text-sm text-gray-600">
                Discover nearby charging stations with real-time availability,
                pricing, and detailed information.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium">Get Recommendations</h3>
              <p className="text-sm text-gray-600">
                Receive AI-powered charging recommendations based on your
                preferences and current needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
