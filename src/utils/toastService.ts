/**
 * Global Toast Notification Service
 * Ensures all games and components display standardized, unclipped, centered notifications.
 */

export interface ToastOptions {
  message: string;
  duration?: number;
  type?: 'info' | 'error' | 'success' | 'warning';
}

type ToastListener = (toast: ToastOptions | null) => void;

let currentToast: ToastOptions | null = null;
let toastTimer: any = null;
const listeners = new Set<ToastListener>();

export function showToast(messageOrOptions: string | ToastOptions, duration = 2800): void {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  const options: ToastOptions =
    typeof messageOrOptions === 'string'
      ? { message: messageOrOptions, duration }
      : { duration: 2800, ...messageOrOptions };

  currentToast = options;
  listeners.forEach((fn) => fn(currentToast));

  toastTimer = setTimeout(() => {
    currentToast = null;
    listeners.forEach((fn) => fn(null));
    toastTimer = null;
  }, options.duration || duration);
}

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  listener(currentToast);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof window !== 'undefined') {
  (window as any).showToast = showToast;
}

