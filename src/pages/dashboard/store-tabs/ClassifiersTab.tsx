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

interface ClassifiersTabProps {
  storeName: string;
}

export default function ClassifiersTab({ storeName }: ClassifiersTabProps) {
  const classifiers = [
    {
      id: "class-1",
      name: "Food & Beverage",
      description: "Restaurant and food service transactions",
      rules: 5,
      status: "active",
    },
    {
      id: "class-2",
      name: "Retail",
      description: "General retail and merchandise sales",
      rules: 3,
      status: "active",
    },
    {
      id: "class-3",
      name: "Services",
      description: "Service-based transactions",
      rules: 2,
      status: "pending",
    },
    {
      id: "class-4",
      name: "Digital",
      description: "Digital products and online services",
      rules: 1,
      status: "inactive",
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
        <CardTitle>Classification Rules</CardTitle>
        <CardDescription>
          Transaction classification rules for {storeName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classifier</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Rules</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classifiers.map((classifier) => (
              <TableRow key={classifier.id}>
                <TableCell className="font-medium">{classifier.name}</TableCell>
                <TableCell>{classifier.description}</TableCell>
                <TableCell>{classifier.rules} rules</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(classifier.status)}>
                    {classifier.status.charAt(0).toUpperCase() +
                      classifier.status.slice(1)}
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
