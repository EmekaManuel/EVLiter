import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="border-gray-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 md:px-6 md:pt-6">
        <CardTitle className="text-xs sm:text-sm text-gray-600 font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
        <div className="text-xl sm:text-2xl text-black font-bold break-words">
          {value}
        </div>
        <p className="text-xs text-gray-600 text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
