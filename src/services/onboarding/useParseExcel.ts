import { useState } from "react";

export type ParsedExcelResult<T> = {
  total: number;
  valid: number;
  invalid: number;
  validRecords: T[];
  invalidRecords: { index: number; issues: string[] }[];
};

export function useParseExcel<T>(
  normalizeRow: (row: Record<string, unknown>) => Record<string, unknown>,
  validate: (row: Record<string, unknown>) => {
    success: boolean;
    data?: T;
    error?: { issues: { path: (string | number)[]; message: string }[] };
  }
) {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ParsedExcelResult<T> | null>(null);
  const [loading, setLoading] = useState(false);

  const parseFile = async (file: File) => {
    try {
      setError(null);
      setLoading(true);
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
      const normalized = rows.map((r) => normalizeRow(r));
      const results = normalized.map((r) => validate(r));
      const validRecords: T[] = [];
      const invalidRecords: { index: number; issues: string[] }[] = [];
      results.forEach((res, idx) => {
        if (res.success && res.data) validRecords.push(res.data);
        else if (res.error)
          invalidRecords.push({
            index: idx,
            issues: res.error.issues.map(
              (i) => `${i.path.join(".")}: ${i.message}`
            ),
          });
      });
      setResult({
        total: rows.length,
        valid: validRecords.length,
        invalid: invalidRecords.length,
        validRecords,
        invalidRecords,
      });
    } catch (e) {
      console.error(e);
      setError("Failed to parse file. Ensure it is a valid .xlsx");
    } finally {
      setLoading(false);
    }
  };

  return { parseFile, error, result, loading };
}
