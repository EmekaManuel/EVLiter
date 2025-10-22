interface UploadSummaryProps {
  total: number;
  valid: number;
  invalid: number;
  className?: string;
}

export function UploadSummary({
  total,
  valid,
  invalid,
  className = "",
}: UploadSummaryProps) {
  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <h4 className="text-lg font-semibold text-gray-800 mb-4">
        Processing Results
      </h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{total}</div>
          <div className="text-sm text-gray-600">Total Records</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{valid}</div>
          <div className="text-sm text-gray-600">Valid Records</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{invalid}</div>
          <div className="text-sm text-gray-600">Invalid Records</div>
        </div>
      </div>
      {invalid > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Some records have validation errors. Please
            review your file and ensure all required fields are properly filled.
          </p>
        </div>
      )}
    </div>
  );
}
