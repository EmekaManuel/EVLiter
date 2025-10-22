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

interface PricingTabProps {
  storeName: string;
}

export default function PricingTab({ storeName }: PricingTabProps) {
  const pricingTiers = [
    {
      id: "tier-1",
      name: "Basic",
      transactionFee: 2.9,
      monthlyFee: 0,
      features: ["Card payments", "Basic reporting"],
      status: "active",
    },
    {
      id: "tier-2",
      name: "Professional",
      transactionFee: 2.5,
      monthlyFee: 29,
      features: [
        "All Basic features",
        "Advanced analytics",
        "Priority support",
      ],
      status: "active",
    },
    {
      id: "tier-3",
      name: "Enterprise",
      transactionFee: 2.1,
      monthlyFee: 99,
      features: [
        "All Professional features",
        "Custom integrations",
        "Dedicated support",
      ],
      status: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Configuration</CardTitle>
        <CardDescription>
          Pricing tiers and configuration for {storeName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Transaction Fee</TableHead>
              <TableHead>Monthly Fee</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pricingTiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">{tier.name}</TableCell>
                <TableCell>{tier.transactionFee}%</TableCell>
                <TableCell>${tier.monthlyFee}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {tier.features.map((feature, index) => (
                      <div key={index}>• {feature}</div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(tier.status)}>
                    {tier.status.charAt(0).toUpperCase() + tier.status.slice(1)}
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
