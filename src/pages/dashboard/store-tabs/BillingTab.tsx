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
import { getBillingByStoreId } from "@/data/storeData";

interface BillingTabProps {
  storeId: string;
  storeName: string;
}

export default function BillingTab({ storeId, storeName }: BillingTabProps) {
  const billing = getBillingByStoreId(storeId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} kr.`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Billing information for {storeName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Invoice Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billing.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.period}</TableCell>
                <TableCell>{formatCurrency(bill.amount)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(bill.status)}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{bill.dueDate}</TableCell>
                <TableCell>{bill.invoiceNumber}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
