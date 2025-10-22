import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BusinessInfoTabProps {
  storeId: string;
  storeName: string;
}

export default function BusinessInfoTab({
  storeId,
  storeName,
}: BusinessInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>Business details for {storeName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Store Name
              </label>
              <p className="text-sm text-gray-900">{storeName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Store ID
              </label>
              <p className="text-sm text-gray-900">{storeId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Business Type
              </label>
              <p className="text-sm text-gray-900">Restaurant</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Registration Number
              </label>
              <p className="text-sm text-gray-900">
                REG-{storeId.toUpperCase()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Tax ID
              </label>
              <p className="text-sm text-gray-900">
                TAX-{storeId.toUpperCase()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Contact Email
              </label>
              <p className="text-sm text-gray-900">contact@{storeId}.com</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
