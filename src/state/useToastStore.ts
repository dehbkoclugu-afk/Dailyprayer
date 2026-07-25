import { create } from 'zustand';

interface ToastState {
  message: string | null;
  actionLabel: string | null;
  action: (() => void) | null;
  /** monotonically increasing id so repeated messages re-trigger */
  seq: number;
  show: (message: string, actionLabel?: string, action?: () => void) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  actionLabel: null,
  action: null,
  seq: 0,
  show: (message, actionLabel, action) =>
    set((s) => ({
      message,
      actionLabel: actionLabel ?? null,
      action: action ?? null,
      seq: s.seq + 1,
    })),
  clear: () => set({ message: null, actionLabel: null, action: null }),
}));

export const toast = (message: string, actionLabel?: string, action?: () => void) =>
  useToastStore.getState().show(message, actionLabel, action);
