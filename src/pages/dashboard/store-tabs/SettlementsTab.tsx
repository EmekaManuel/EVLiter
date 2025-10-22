import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getSettlementsByStoreId } from "@/data/storeData";
import { Calendar, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettlementsTabProps {
  storeId: string;
  storeName: string;
}

export default function SettlementsTab({
  storeId,
  storeName,
}: SettlementsTabProps) {
  const settlements = getSettlementsByStoreId(storeId);

  const getSettlementStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return "✓";
      case "postponed":
        return "→";
      case "pending":
        return "⏳";
      default:
        return "?";
    }
  };

  const getSettlementStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "postponed":
        return "text-yellow-600";
      case "pending":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} kr.`;
  };

  return (
    <Tabs defaultValue="settlements" className="w-[90vw] md:w-full ">
      <ScrollArea className="w-full md:w-full ">
        <TabsList className="grid w-full grid-cols-3 bg-gray-50">
          <TabsTrigger value="settlements" className="text-sm">
            Settlements
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm">
            Reports
          </TabsTrigger>
          <TabsTrigger value="settlement-frequency" className="text-sm">
            Settlement Frequency
          </TabsTrigger>
        </TabsList>

        {/* Settlements Sub-tab */}
        <TabsContent value="settlements" className="mt-6">
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Select Date Range</span>
                </Button>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>

            {/* Settlements Table */}
            <Card>
              <CardHeader>
                <CardTitle>Settlements</CardTitle>
                <CardDescription>
                  Settlement data for {storeName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Initial balance</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Balance transfers</TableHead>
                      <TableHead>Refunds</TableHead>
                      <TableHead>Chargeback</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Settlement</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.map((settlement) => (
                      <TableRow key={settlement.id}>
                        <TableCell className="font-medium">
                          {settlement.date}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(settlement.initialBalance)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(settlement.sales)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(settlement.balanceTransfers)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(settlement.refunds)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(settlement.chargeback)}
                        </TableCell>
                        <TableCell>{formatCurrency(settlement.fees)}</TableCell>
                        <TableCell>
                          {formatCurrency(settlement.settlement)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={getSettlementStatusColor(
                              settlement.status
                            )}
                          >
                            {getSettlementStatusIcon(settlement.status)}{" "}
                            {settlement.status.charAt(0).toUpperCase() +
                              settlement.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Rows per page:
                    </span>
                    <Select defaultValue="25">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Sub-tab */}
        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Settlement Reports</CardTitle>
              <CardDescription>
                Generate and view settlement reports for {storeName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Settlement reports will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlement Frequency Sub-tab */}
        <TabsContent value="settlement-frequency" className="mt-6 space-y-6">
          {/* Settlement Payment Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600 text-lg">
                Settlement Payment Frequency
              </CardTitle>
              <CardDescription className="text-blue-600">
                View the payment frequency settings for every-day and instant
                settlements configured for this merchant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="business-day" className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="every-day" id="every-day" />
                  <Label htmlFor="every-day" className="text-sm font-medium">
                    Every Day
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instant" id="instant" />
                  <Label htmlFor="instant" className="text-sm font-medium">
                    Instant
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business-day" id="business-day" />
                  <Label htmlFor="business-day" className="text-sm font-medium">
                    Business Day
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Settlement Report Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Settlement Report Frequency
              </CardTitle>
              <CardDescription>
                Configure daily and monthly settlement reports frequency at the
                store level. Customers can also update settings via the portal
                and app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-report" className="text-sm font-medium">
                  Daily Report
                </Label>
                <Switch id="daily-report" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="monthly-report" className="text-sm font-medium">
                  Monthly Report
                </Label>
                <Switch id="monthly-report" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}
