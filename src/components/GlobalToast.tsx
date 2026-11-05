import React, { useEffect, useState } from 'react';
import { AlertCircle, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { ToastOptions, subscribeToast } from '../utils/toastService';

export const GlobalToast: React.FC = () => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  useEffect(() => {
    return subscribeToast(setToast);
  }, []);

  if (!toast) return null;

  const msg = toast.message;
  const isHint = msg.includes('💡') || msg.toLowerCase().includes('ipucu') || msg.toLowerCase().includes('hint');
  const isError = msg.includes('❌') || msg.toLowerCase().includes('hata') || msg.toLowerCase().includes('bulunamadı') || msg.toLowerCase().includes('geçersiz');
  const isSuccess = msg.includes('✅') || msg.includes('✨') || msg.includes('🏆') || msg.toLowerCase().includes('tebrikler') || msg.toLowerCase().includes('doğru') || msg.toLowerCase().includes('puan');

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 sm:top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700 dark:border-zinc-300 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 max-w-[92vw] animate-bounce pointer-events-none select-none text-center"
    >
      {isHint ? (
        <Lightbulb size={16} className="text-amber-400 shrink-0 animate-pulse" />
      ) : isError ? (
        <XCircle size={16} className="text-rose-500 shrink-0" />
      ) : isSuccess ? (
        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle size={16} className="text-amber-500 shrink-0" />
      )}
      <span className="leading-snug">{msg}</span>
    </div>
  );
};

