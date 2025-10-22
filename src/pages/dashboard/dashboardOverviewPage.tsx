import { ArrowRight, Battery, Car, MapPin, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardOverviewPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Car,
      title: "Car Recognition",
      description: "Identify your EV specifications",
      href: "/dashboard/ai-car-recognition",
    },
    {
      icon: MapPin,
      title: "Find Stations",
      description: "Locate nearby charging points",
      href: "/dashboard/charging-stations",
    },
    {
      icon: Battery,
      title: "Smart Charging",
      description: "Optimize your charging strategy",
      href: "/dashboard/smart-advisor",
    },
    {
      icon: Zap,
      title: "My Sessions",
      description: "Track charging history",
      href: "/dashboard/my-charging",
    },
  ];

  const stats = [
    { label: "Sessions", value: "1,247" },
    { label: "Energy", value: "45.2k kWh" },
    { label: "Savings", value: "$187" },
    { label: "Stations", value: "156" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-light text-gray-900 mb-2">EVLite</h1>
            <p className="text-gray-500 font-light">Intelligent EV charging</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-light text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 font-light">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={() => navigate(feature.href)}
            >
              <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <feature.icon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 font-light">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
