/**
 * Social Sharing Service (WhatsApp, X / Twitter, Telegram, Facebook, LinkedIn, Web Share API, Clipboard)
 * Generates viral emoji grids and coordinates the unified multi-platform ShareModal.
 */

export interface ShareOptions {
  title?: string;
  gameName: string;
  scoreOrAttempts: string;
  emojiGrid?: string;
  url?: string;
  customText?: string;
}

export interface ShareModalState extends ShareOptions {
  isOpen: boolean;
}

export type ShareModalListener = (state: ShareModalState) => void;

let currentShareState: ShareModalState = {
  isOpen: false,
  gameName: '',
  scoreOrAttempts: '',
};

const modalListeners = new Set<ShareModalListener>();

export function openShareModal(options: ShareOptions): void {
  currentShareState = {
    ...options,
    isOpen: true,
  };
  modalListeners.forEach((listener) => listener(currentShareState));
}

if (typeof window !== 'undefined') {
  (window as any).openShareModal = openShareModal;
}

export function closeShareModal(): void {
  currentShareState = {
    ...currentShareState,
    isOpen: false,
  };
  modalListeners.forEach((listener) => listener(currentShareState));
}

export function subscribeShareModal(listener: ShareModalListener): () => void {
  modalListeners.add(listener);
  listener(currentShareState);
  return () => {
    modalListeners.delete(listener);
  };
}

export function generateWordleEmojiGrid(
  guesses: string[],
  solution: string
): string {
  return guesses
    .map((guess) => {
      const letters = guess.split('');
      const solLetters = solution.split('');
      const line = letters.map((char, idx) => {
        if (char === solLetters[idx]) {
          return '🟩';
        } else if (solLetters.includes(char)) {
          return '🟨';
        }
        return '⬛';
      });
      return line.join('');
    })
    .join('\n');
}

export function formatShareText(options: ShareOptions): string {
  if (options.customText) return options.customText;
  const siteUrl = options.url || 'https://bulmacakulubu.github.io';
  const gridSection = options.emojiGrid ? `\n\n${options.emojiGrid}\n` : '\n';
  return `🧩 Bulmaca Kulübü: ${options.gameName}\n🏆 Sonuç: ${options.scoreOrAttempts}${gridSection}\nSen de oyna 👉 ${siteUrl}`;
}

export async function shareScore(options: ShareOptions): Promise<'shared' | 'copied' | 'failed'> {
  // Opening the comprehensive multi-network modal
  openShareModal(options);
  return 'shared';
}

export function openWhatsAppShare(text: string, url = 'https://bulmacakulubu.github.io'): void {
  const full = `${text}\n👉 ${url}`;
  const encoded = encodeURIComponent(full);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
}

export function openTwitterShare(text: string, url = 'https://bulmacakulubu.github.io'): void {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'noopener,noreferrer');
}

export function openTelegramShare(text: string, url = 'https://bulmacakulubu.github.io'): void {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
}

export function openFacebookShare(text: string, url = 'https://bulmacakulubu.github.io'): void {
  const encodedUrl = encodeURIComponent(url);
  const encodedQuote = encodeURIComponent(text);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`, '_blank', 'noopener,noreferrer');
}

export function openLinkedInShare(text: string, url = 'https://bulmacakulubu.github.io'): void {
  const encodedUrl = encodeURIComponent(url);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank', 'noopener,noreferrer');
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export async function triggerNativeShare(title: string, text: string, url = 'https://bulmacakulubu.github.io'): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (e: any) {
      if (e.name === 'AbortError') return true;
    }
  }
  return false;
}
