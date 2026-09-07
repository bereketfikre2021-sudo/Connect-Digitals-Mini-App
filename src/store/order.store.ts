/**
 * Order creation flow store.
 * Holds selections as the customer progresses through the checkout funnel.
 */
import { create } from "zustand";

interface ServicePackage {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  priceETB: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
}

interface ServiceInfo {
  id: string;
  name: string;
  slug: string;
  targetType: string;
  targetLabel: string;
  targetPlaceholder: string;
  targetHelpText: string | null;
  requiresTargetUrl: boolean;
  platform: { name: string; slug: string };
}

interface OrderFlowState {
  service: ServiceInfo | null;
  selectedPackage: ServicePackage | null;
  targetUrl: string;
  notes: string;
  setService: (s: ServiceInfo) => void;
  setPackage: (p: ServicePackage) => void;
  setTargetUrl: (url: string) => void;
  setNotes: (n: string) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderFlowState>((set) => ({
  service: null,
  selectedPackage: null,
  targetUrl: "",
  notes: "",
  setService: (s) => set({ service: s, selectedPackage: null, targetUrl: "" }),
  setPackage: (p) => set({ selectedPackage: p }),
  setTargetUrl: (url) => set({ targetUrl: url }),
  setNotes: (n) => set({ notes: n }),
  reset: () => set({ service: null, selectedPackage: null, targetUrl: "", notes: "" }),
}));
