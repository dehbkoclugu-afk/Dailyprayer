import { create } from 'zustand';

interface ToastState {
  message: string | null;
  /** monotonically increasing id so repeated messages re-trigger */
  seq: number;
  show: (message: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  seq: 0,
  show: (message) => set((s) => ({ message, seq: s.seq + 1 })),
  clear: () => set({ message: null }),
}));

export const toast = (message: string) => useToastStore.getState().show(message);
