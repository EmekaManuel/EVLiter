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

interface SubscriptionsTabProps {
  storeName: string;
}

export default function SubscriptionsTab({ storeName }: SubscriptionsTabProps) {
  const subscriptions = [
    {
      id: "sub-1",
      name: "Payment Processing",
      status: "active",
      price: 99,
      billingCycle: "monthly",
      nextBilling: "15 Nov 2025",
    },
    {
      id: "sub-2",
      name: "Analytics Pro",
      status: "active",
      price: 49,
      billingCycle: "monthly",
      nextBilling: "15 Nov 2025",
    },
    {
      id: "sub-3",
      name: "Customer Support",
      status: "pending",
      price: 29,
      billingCycle: "monthly",
      nextBilling: "15 Nov 2025",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriptions</CardTitle>
        <CardDescription>Subscription details for {storeName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Next Billing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">
                  {subscription.name}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>${subscription.price}</TableCell>
                <TableCell>
                  {subscription.billingCycle.charAt(0).toUpperCase() +
                    subscription.billingCycle.slice(1)}
                </TableCell>
                <TableCell>{subscription.nextBilling}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
