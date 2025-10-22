import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Download, AlertCircle, CheckCircle } from "lucide-react";
import type { ExcelMerchant } from "@/lib/onboard-form";

interface ExcelDataPreviewProps {
  validRecords: ExcelMerchant[];
  invalidRecords: { index: number; issues: string[] }[];
  total: number;
  onClose: () => void;
}

export function ExcelDataPreview({
  validRecords,
  invalidRecords,
  total,
  onClose,
}: ExcelDataPreviewProps) {
  const [showInvalid, setShowInvalid] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(
    new Set()
  );

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const downloadValidData = () => {
    const csvContent = [
      // Headers
      Object.keys(validRecords[0] || {}).join(","),
      // Data rows
      ...validRecords.map((record) =>
        Object.values(record)
          .map((value) =>
            typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "valid_merchant_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFieldDisplayName = (key: string): string => {
    const fieldNames: Record<string, string> = {
      merchantId: "Merchant ID",
      merchantName: "Merchant Name",
      contactTitle: "Contact Title",
      contactName: "Contact Name",
      mobilePhone: "Mobile Phone",
      email: "Email",
      emailAlerts: "Email Alerts",
      physicalAddr: "Physical Address",
      terminalModelCode: "Terminal Model Code",
      terminalId: "Terminal ID",
      bankCode: "Bank Code",
      bankAccNo: "Bank Account No",
      bankType: "Bank Type",
      businessOccupationCode: "Business Occupation Code",
      merchantCategoryCode: "Merchant Category Code",
      stateCode: "State Code",
      visaAcquirerIdNumber: "VISA Acquirer ID",
      verveAcquirerIdNumber: "VERVE Acquirer ID",
      mastercardAcquirerIdNumber: "Mastercard Acquirer ID",
      payAttitudeBin: "Payattitude BIN",
      terminalOwnerCode: "Terminal Owner Code",
      accountName: "Account Name",
      ptsp: "PTSP",
      transactionCurrency: "Transaction Currency",
      ptsa: "PTSA",
      stampDuty: "Stamp Duty",
    };
    return fieldNames[key] || key;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Total Records</span>
            </div>
            <p className="text-2xl font-bold mt-2">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Valid Records</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">
              {validRecords.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Invalid Records</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">
              {invalidRecords.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setShowInvalid(!showInvalid)}
          variant="outline"
          className="flex items-center gap-2"
        >
          {showInvalid ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showInvalid ? "Hide Invalid" : "Show Invalid"}
        </Button>

        {validRecords.length > 0 && (
          <Button
            onClick={downloadValidData}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download Valid Data
          </Button>
        )}

        <Button onClick={onClose} variant="outline">
          Close Preview
        </Button>
      </div>

      {/* Valid Records Table */}
      {validRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Valid Records ({validRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Merchant ID</TableHead>
                    <TableHead>Merchant Name</TableHead>
                    <TableHead>Contact Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validRecords.map((record, index) => (
                    <React.Fragment key={index}>
                      <TableRow>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>{record.merchantId}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {record.merchantName}
                        </TableCell>
                        <TableCell>{record.contactName}</TableCell>
                        <TableCell>{record.email}</TableCell>
                        <TableCell>{record.mobilePhone}</TableCell>
                        <TableCell>
                          <Button
                            className="bg-green-200 hover:bg-green-500"
                            size="sm"
                            onClick={() => toggleRowExpansion(index)}
                          >
                            {expandedRows.has(index)
                              ? "Hide Details"
                              : "Show Details"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(index) && (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(record).map(([key, value]) => (
                                  <div key={key} className="space-y-1">
                                    <span className="text-xs font-medium text-gray-600">
                                      {getFieldDisplayName(key)}
                                    </span>
                                    <p className="text-sm">
                                      {String(value || "-")}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Invalid Records */}
      {showInvalid && invalidRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Invalid Records ({invalidRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {invalidRecords.map((invalid, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">
                        Row {invalid.index + 1}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {invalid.issues.map((issue, issueIndex) => (
                        <p key={issueIndex} className="text-sm text-red-700">
                          • {issue}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
