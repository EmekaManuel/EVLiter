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
import { getTransactionsByStoreId } from "@/data/storeData";

interface TransactionsTabProps {
  storeId: string;
  storeName: string;
}

export default function TransactionsTab({
  storeId,
  storeName,
}: TransactionsTabProps) {
  const transactions = getTransactionsByStoreId(storeId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
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
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Transaction data for {storeName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {transaction.date}
                </TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.customerId}</TableCell>
                <TableCell>{transaction.paymentMethod}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
