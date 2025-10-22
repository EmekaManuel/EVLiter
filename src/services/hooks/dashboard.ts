import { useQuery } from "@tanstack/react-query";
import {
  invoicesApi,
  settlementsApi,
  transactionsApi,
  devicesApi,
  billingApi,
  classifiersApi,
  pricingApi,
  activityApi,
  companyApi,
} from "@/services/api";

export function useTransactions(
  params?: transactionsApi.ListTransactionsParams
) {
  return useQuery({
    queryKey: ["transactions", params ?? {}],
    queryFn: () => transactionsApi.listTransactions(params ?? {}),
    staleTime: 60_000,
  });
}

export function useInvoices(params?: invoicesApi.ListInvoicesParams) {
  return useQuery({
    queryKey: ["invoices", params ?? {}],
    queryFn: () => invoicesApi.listInvoices(params ?? {}),
    staleTime: 60_000,
  });
}

export function useSettlements(params?: settlementsApi.ListSettlementsParams) {
  return useQuery({
    queryKey: ["settlements", params ?? {}],
    queryFn: () => settlementsApi.listSettlements(params ?? {}),
    staleTime: 60_000,
  });
}

export function useDevices(params?: devicesApi.ListDevicesParams) {
  return useQuery({
    queryKey: ["devices", params ?? {}],
    queryFn: () => devicesApi.listDevices(params ?? {}),
    staleTime: 60_000,
  });
}

export function useBillingSummary() {
  return useQuery({
    queryKey: ["billing", "summary"],
    queryFn: billingApi.getBillingSummary,
    staleTime: 60_000,
  });
}

export function useClassifiers() {
  return useQuery({
    queryKey: ["classifiers"],
    queryFn: classifiersApi.listClassifiers,
    staleTime: 60_000,
  });
}

export function usePricingPlans() {
  return useQuery({
    queryKey: ["pricing", "plans"],
    queryFn: pricingApi.listPricingPlans,
    staleTime: 60_000,
  });
}

export function useActivity(params?: activityApi.ListActivityParams) {
  return useQuery({
    queryKey: ["activity", params ?? {}],
    queryFn: () => activityApi.listActivity(params ?? {}),
    staleTime: 60_000,
  });
}

export function useCompanyProfile() {
  return useQuery({
    queryKey: ["company", "profile"],
    queryFn: companyApi.getCompanyProfile,
    staleTime: 60_000,
  });
}
