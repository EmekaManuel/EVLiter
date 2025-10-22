export interface Settlement {
  id: string;
  storeId: string;
  date: string;
  initialBalance: number;
  sales: number;
  balanceTransfers: number;
  refunds: number;
  chargeback: number;
  fees: number;
  settlement: number;
  status: "paid" | "postponed" | "pending";
}

export interface Transaction {
  id: string;
  storeId: string;
  date: string;
  amount: number;
  type: "sale" | "refund" | "chargeback";
  status: "completed" | "pending" | "failed";
  customerId: string;
  paymentMethod: string;
}

export interface Billing {
  id: string;
  storeId: string;
  period: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  invoiceNumber: string;
}

// Settlement data for stores
export const settlements: Settlement[] = [
  {
    id: "settlement-1",
    storeId: "run2-dineout",
    date: "13 Oct 2025",
    initialBalance: 10,
    sales: 32980,
    balanceTransfers: 0,
    refunds: 0,
    chargeback: 0,
    fees: -610,
    settlement: 32380,
    status: "paid",
  },
  {
    id: "settlement-2",
    storeId: "run2-dineout",
    date: "8 Oct 2025",
    initialBalance: 0,
    sales: 10,
    balanceTransfers: 0,
    refunds: 0,
    chargeback: 0,
    fees: 0,
    settlement: 0,
    status: "postponed",
  },
  {
    id: "settlement-3",
    storeId: "run2-noona",
    date: "12 Oct 2025",
    initialBalance: 50,
    sales: 15600,
    balanceTransfers: 0,
    refunds: 200,
    chargeback: 0,
    fees: -300,
    settlement: 15150,
    status: "paid",
  },
  {
    id: "settlement-4",
    storeId: "fatur-toga",
    date: "11 Oct 2025",
    initialBalance: 25,
    sales: 23400,
    balanceTransfers: 0,
    refunds: 0,
    chargeback: 150,
    fees: -450,
    settlement: 22925,
    status: "paid",
  },
];

// Transaction data for stores
export const transactions: Transaction[] = [
  {
    id: "txn-1",
    storeId: "run2-dineout",
    date: "13 Oct 2025",
    amount: 2500,
    type: "sale",
    status: "completed",
    customerId: "cust-001",
    paymentMethod: "Card",
  },
  {
    id: "txn-2",
    storeId: "run2-dineout",
    date: "13 Oct 2025",
    amount: 1800,
    type: "sale",
    status: "completed",
    customerId: "cust-002",
    paymentMethod: "Mobile",
  },
  {
    id: "txn-3",
    storeId: "run2-noona",
    date: "12 Oct 2025",
    amount: 1200,
    type: "refund",
    status: "completed",
    customerId: "cust-003",
    paymentMethod: "Card",
  },
  {
    id: "txn-4",
    storeId: "fatur-toga",
    date: "11 Oct 2025",
    amount: 3200,
    type: "sale",
    status: "completed",
    customerId: "cust-004",
    paymentMethod: "Card",
  },
];

// Billing data for stores
export const billing: Billing[] = [
  {
    id: "bill-1",
    storeId: "run2-dineout",
    period: "October 2025",
    amount: 2500,
    status: "paid",
    dueDate: "15 Oct 2025",
    invoiceNumber: "INV-2025-001",
  },
  {
    id: "bill-2",
    storeId: "run2-noona",
    period: "October 2025",
    amount: 1800,
    status: "pending",
    dueDate: "15 Oct 2025",
    invoiceNumber: "INV-2025-002",
  },
  {
    id: "bill-3",
    storeId: "fatur-toga",
    period: "October 2025",
    amount: 3200,
    status: "paid",
    dueDate: "15 Oct 2025",
    invoiceNumber: "INV-2025-003",
  },
];

// Helper functions
export const getSettlementsByStoreId = (storeId: string): Settlement[] => {
  return settlements.filter((settlement) => settlement.storeId === storeId);
};

export const getTransactionsByStoreId = (storeId: string): Transaction[] => {
  return transactions.filter((transaction) => transaction.storeId === storeId);
};

export const getBillingByStoreId = (storeId: string): Billing[] => {
  return billing.filter((bill) => bill.storeId === storeId);
};
