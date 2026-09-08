/**
 * Order creation flow store.
 * Holds selections as the customer progresses through the checkout funnel.
 *
 * Flow:
 *  1. ServiceDetailPage  → setService() + setPackage() → /order/new
 *  2. OrderNewPage       → setTargetUrl() + setNotes() → /order/checkout
 *  3. OrderCheckoutPage  → setPaymentSelection() → confirms & creates order + payment
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

export interface PaymentMethodInfo {
  id: string;
  name: string;
  description: string | null;
  accountName: string;
  accountNumber: string;
  bankName: string | null;
  instructions: string;
}

export type PaymentType = "wallet" | "bank";

interface OrderFlowState {
  service: ServiceInfo | null;
  selectedPackage: ServicePackage | null;
  targetUrl: string;
  notes: string;
  // Payment selections — set on OrderCheckoutPage
  paymentType: PaymentType | null;
  selectedPaymentMethod: PaymentMethodInfo | null;

  setService: (s: ServiceInfo) => void;
  setPackage: (p: ServicePackage) => void;
  setTargetUrl: (url: string) => void;
  setNotes: (n: string) => void;
  setPaymentSelection: (type: PaymentType, method?: PaymentMethodInfo) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderFlowState>((set) => ({
  service: null,
  selectedPackage: null,
  targetUrl: "",
  notes: "",
  paymentType: null,
  selectedPaymentMethod: null,

  setService: (s) => set({ service: s, selectedPackage: null, targetUrl: "" }),
  setPackage: (p) => set({ selectedPackage: p }),
  setTargetUrl: (url) => set({ targetUrl: url }),
  setNotes: (n) => set({ notes: n }),
  setPaymentSelection: (type, method) => set({ paymentType: type, selectedPaymentMethod: method ?? null }),
  reset: () => set({
    service: null,
    selectedPackage: null,
    targetUrl: "",
    notes: "",
    paymentType: null,
    selectedPaymentMethod: null,
  }),
}));
