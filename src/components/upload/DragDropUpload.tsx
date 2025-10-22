import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

interface DragDropUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onError: (error: string | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
}

export function DragDropUpload({
  selectedFile,
  onFileSelect,
  onError,
  accept = ".xlsx",
  maxSize = 10,
  disabled = false,
  className = "",
}: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      onError(null);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (!file) return;

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        onError(`File size must be less than ${maxSize}MB`);
        return;
      }

      // Check file type
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isValidType) {
        onError(`Please upload a valid file (${accept})`);
        return;
      }

      onFileSelect(file);
    },
    [disabled, maxSize, accept, onFileSelect, onError]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onError(null);
    const file = e.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  const getUploadState = () => {
    if (selectedFile) return "success";
    if (isDragOver) return "dragging";
    return "idle";
  };

  const state = getUploadState();

  const getStateClasses = () => {
    const baseClasses =
      "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200";

    switch (state) {
      case "dragging":
        return `${baseClasses} border-blue-500 bg-blue-50`;
      case "success":
        return `${baseClasses} border-green-500 bg-green-50`;
      default:
        return `${baseClasses} border-gray-300 hover:border-gray-400`;
    }
  };

  const getIconClasses = () => {
    switch (state) {
      case "success":
        return "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center";
      case "dragging":
        return "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center";
      default:
        return "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center";
    }
  };

  const getTextClasses = () => {
    switch (state) {
      case "success":
        return "text-green-700";
      case "dragging":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  const getTitle = () => {
    switch (state) {
      case "success":
        return "File Ready for Processing";
      case "dragging":
        return "Drop your file here";
      default:
        return "Upload File";
    }
  };

  const getDescription = () => {
    if (selectedFile) {
      return `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(
        2
      )} MB)`;
    }
    return `Drag and drop your file here, or click to browse (Max ${maxSize}MB)`;
  };

  return (
    <div
      className={`${getStateClasses()} ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        {/* Upload Icon */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center">
          <div className={getIconClasses()}>
            {selectedFile ? (
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className={`w-8 h-8 ${
                  state === "dragging" ? "text-blue-600" : "text-gray-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Upload Text */}
        <div className="space-y-2">
          <h3 className={`text-lg font-semibold ${getTextClasses()}`}>
            {getTitle()}
          </h3>
          <p className="text-sm text-gray-600">{getDescription()}</p>
        </div>

        {/* File Input */}
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={disabled}
          />
          <Button variant="outline" className="px-6 py-2" disabled={disabled}>
            {selectedFile ? "Choose Different File" : "Browse Files"}
          </Button>
        </div>
      </div>
    </div>
  );
}
