export interface Store {
  id: string;
  name: string;
  onboarded: string;
  active: boolean;
  description?: string;
  location?: string;
  status?: "active" | "inactive" | "pending";
  revenue?: number;
  transactions?: number;
}

export const stores: Store[] = [
  {
    id: "run2-dineout",
    name: "RUN2 - Dineout",
    onboarded: "30 Sep 2025",
    active: true,
    description: "Premium dining experience with modern payment solutions",
    location: "Reykjavik, Iceland",
    status: "active",
    revenue: 125000,
    transactions: 2450,
  },
  {
    id: "run2-noona",
    name: "RUN2 - Noona Pay",
    onboarded: "7 Feb 2025",
    active: false,
    description: "Fast-casual dining with quick payment processing",
    location: "Reykjavik, Iceland",
    status: "active",
    revenue: 89000,
    transactions: 1890,
  },
  {
    id: "fatur-gamalt",
    name: "Fætur Toga gamalt",
    onboarded: "15 Nov 2024",
    active: false,
    description: "Traditional Icelandic cuisine with heritage payment methods",
    location: "Reykjavik, Iceland",
    status: "active",
    revenue: 67000,
    transactions: 1340,
  },
  {
    id: "fatur-toga",
    name: "Fætur Toga",
    onboarded: "10 Jul 2023",
    active: false,
    description: "Contemporary dining with integrated payment systems",
    location: "Reykjavik, Iceland",
    status: "active",
    revenue: 156000,
    transactions: 3120,
  },
  {
    id: "run2",
    name: "RUN2",
    onboarded: "31 Mar 2023",
    active: false,
    description: "Flagship restaurant with comprehensive payment solutions",
    location: "Reykjavik, Iceland",
    status: "active",
    revenue: 234000,
    transactions: 4680,
  },
  {
    id: "fatur-toga-2",
    name: "Fætur Toga",
    onboarded: "",
    active: false,
    description: "New location under development",
    location: "Akureyri, Iceland",
    status: "pending",
    revenue: 0,
    transactions: 0,
  },
];

// Helper function to get store by ID
export const getStoreById = (id: string): Store | undefined => {
  return stores.find((store) => store.id === id);
};

// Helper function to get active store
export const getActiveStore = (): Store | undefined => {
  return stores.find((store) => store.active);
};
