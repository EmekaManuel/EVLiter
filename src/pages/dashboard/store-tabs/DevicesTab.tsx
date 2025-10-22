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

interface DevicesTabProps {
  storeName: string;
}

export default function DevicesTab({ storeName }: DevicesTabProps) {
  const devices = [
    {
      id: "device-1",
      name: "Terminal POS-001",
      type: "Payment Terminal",
      status: "online",
      lastSeen: "2 minutes ago",
      location: "Main Counter",
    },
    {
      id: "device-2",
      name: "Terminal POS-002",
      type: "Payment Terminal",
      status: "offline",
      lastSeen: "1 hour ago",
      location: "Drive-through",
    },
    {
      id: "device-3",
      name: "Mobile App",
      type: "Mobile Payment",
      status: "online",
      lastSeen: "5 minutes ago",
      location: "Staff Device",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>Device information for {storeName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell className="font-medium">{device.name}</TableCell>
                <TableCell>{device.type}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(device.status)}>
                    {device.status.charAt(0).toUpperCase() +
                      device.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{device.lastSeen}</TableCell>
                <TableCell>{device.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
