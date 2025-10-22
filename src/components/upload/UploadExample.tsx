import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DragDropUpload,
  UploadSummary,
  UploadError,
  UploadHelp,
} from "./index";

/**
 * Example component demonstrating how to use the upload components
 * This shows how the components can be reused in different contexts
 */
export function UploadExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<{
    total: number;
    valid: number;
    invalid: number;
  } | null>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleFileError = (error: string | null) => {
    setFileError(error);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setFileError(null);

    // Simulate processing
    setTimeout(() => {
      setUploadSummary({
        total: 100,
        valid: 85,
        invalid: 15,
      });
      setIsProcessing(false);
    }, 2000);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileError(null);
    setUploadSummary(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Upload Example</h2>

      {/* Upload Area - Can be customized for different file types */}
      <DragDropUpload
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onError={handleFileError}
        accept=".pdf,.doc,.docx" // Different file types
        maxSize={5} // Different size limit
        disabled={isProcessing}
      />

      {/* Error Display */}
      {fileError && <UploadError error={fileError} />}

      {/* Results Summary */}
      {uploadSummary && (
        <UploadSummary
          total={uploadSummary.total}
          valid={uploadSummary.valid}
          invalid={uploadSummary.invalid}
        />
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleProcess}
          disabled={!selectedFile || isProcessing}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {isProcessing ? "Processing..." : "Process File"}
        </Button>

        {selectedFile && (
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isProcessing}
            className="px-8 py-3"
          >
            Clear File
          </Button>
        )}
      </div>

      {/* Help Section - Can be customized or omitted */}
      <UploadHelp
        onDownloadTemplate={() => {
          // Custom template download logic
          console.log("Downloading custom template...");
        }}
      />
    </div>
  );
}
