import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ActivityLogTabProps {
  storeName: string;
}

export default function ActivityLogTab({ storeName }: ActivityLogTabProps) {
  const activities = [
    {
      id: "activity-1",
      timestamp: "2025-10-13 14:30:25",
      action: "Settlement processed",
      user: "System",
      details: "Daily settlement completed for 13 Oct 2025",
      status: "success",
    },
    {
      id: "activity-2",
      timestamp: "2025-10-13 12:15:10",
      action: "Device status changed",
      user: "Admin User",
      details: "Terminal POS-001 went offline",
      status: "warning",
    },
    {
      id: "activity-3",
      timestamp: "2025-10-13 10:45:33",
      action: "Transaction processed",
      user: "Customer",
      details: "Payment of 2,500 kr. completed",
      status: "success",
    },
    {
      id: "activity-4",
      timestamp: "2025-10-13 09:20:15",
      action: "Settings updated",
      user: "Store Manager",
      details: "Settlement frequency changed to Business Day",
      status: "info",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Activity history for {storeName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {activity.timestamp}
                </TableCell>
                <TableCell>{activity.action}</TableCell>
                <TableCell>{activity.user}</TableCell>
                <TableCell>{activity.details}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status.charAt(0).toUpperCase() +
                      activity.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
