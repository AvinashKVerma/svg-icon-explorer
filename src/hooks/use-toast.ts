import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
}

interface ToastStore {
  toasts: Toast[];
  push: (message: string, variant?: Toast["variant"]) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, variant = "success") =>
    set((s) => {
      const id = ++counter;
      setTimeout(() => {
        useToastStore.getState().dismiss(id);
      }, 2200);
      return { toasts: [...s.toasts, { id, message, variant }] };
    }),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, variant?: Toast["variant"]) {
  useToastStore.getState().push(message, variant);
}
