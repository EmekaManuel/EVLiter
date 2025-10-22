import { Button } from "@/components/ui/button";

interface UploadHelpProps {
  onDownloadTemplate?: () => void;
  className?: string;
}

export function UploadHelp({
  onDownloadTemplate,
  className = "",
}: UploadHelpProps) {
  return (
    <div
      className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}
    >
      <h4 className="text-sm font-semibold text-blue-800 mb-2">Need Help?</h4>
      <div className="text-sm text-blue-700 space-y-1">
        <p>• Download our sample template to see the required format</p>
        <p>• Ensure all required fields are filled in your file</p>
        <p>• Supported file format: .xlsx only</p>
      </div>
      {onDownloadTemplate && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 text-blue-700 border-blue-300 hover:bg-blue-100"
          onClick={onDownloadTemplate}
        >
          Download Sample Template
        </Button>
      )}
    </div>
  );
}
