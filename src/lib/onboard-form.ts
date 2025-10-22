import { z } from "zod";

// Single-entry onboarding validation schema
export const singleEntryFullSchema = z.object({
  merchantId: z.string().min(1, "Required"),
  merchantName: z.string().min(1, "Required"),
  contactTitle: z.string().min(1, "Required"),
  contactName: z.string().min(1, "Required"),
  mobilePhone: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  emailAlerts: z.boolean(),
  physicalAddr: z.string().min(1, "Required"),
  stateCode: z.string().min(1, "Required"),

  terminalModelCode: z.string().min(1, "Required"),
  terminalId: z.string().min(1, "Required"),
  terminalOwnerCode: z.string().min(1, "Required"),
  payAttitudeBin: z.string().min(1, "Required"),

  bankCode: z.string().min(1, "Required"),
  bankAccNo: z.string().min(1, "Required"),
  bankType: z.string().min(1, "Required"),
  accountName: z.string().min(1, "Required"),

  businessOccupationCode: z.string().min(1, "Required"),
  merchantCategoryCode: z.string().min(1, "Required"),
  transactionCurrency: z.string().min(1, "Required"),
  ptsa: z.string().min(1, "Required"),
  ptsp: z.string().min(1, "Required"),
  visaAcquirerIdNumber: z.string().min(1, "Required"),
  verveAcquirerIdNumber: z.string().min(1, "Required"),
  mastercardAcquirerIdNumber: z.string().min(1, "Required"),
  stampDuty: z.boolean(),
});

export type SingleEntryForm = z.infer<typeof singleEntryFullSchema>;

// Canonical schema for Excel rows
export const excelMerchantSchema = z.object({
  merchantId: z.string().min(1),
  merchantName: z.string().min(1),
  contactTitle: z.string().min(1),
  contactName: z.string().min(1),
  mobilePhone: z.string().min(1),
  email: z.string().email(),
  emailAlerts: z
    .enum(["Y", "N"])
    .transform((v) => v.toUpperCase() as "Y" | "N"),
  physicalAddr: z.string().min(1),
  terminalModelCode: z.string().min(1),
  terminalId: z.string().min(1),
  bankCode: z.string().min(1),
  bankAccNo: z.string().min(1),
  bankType: z.string().min(1),
  businessOccupationCode: z.string().min(1),
  merchantCategoryCode: z.string().min(1),
  stateCode: z.string().min(1),
  visaAcquirerIdNumber: z.string().min(1),
  verveAcquirerIdNumber: z.string().min(1),
  mastercardAcquirerIdNumber: z.string().min(1),
  payAttitudeBin: z.union([z.string(), z.number()]).transform((v) => String(v)),
  terminalOwnerCode: z.string().min(1),
  accountName: z.string().min(1),
  ptsp: z.string().min(1),
  transactionCurrency: z
    .union([z.string(), z.number()])
    .transform((v) => String(v)),
  ptsa: z.string().min(1),
  stampDuty: z.enum(["Y", "N"]).transform((v) => v.toUpperCase() as "Y" | "N"),
});

export type ExcelMerchant = z.infer<typeof excelMerchantSchema>;
