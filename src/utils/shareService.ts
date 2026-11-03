/**
 * Social Sharing Service (WhatsApp, X, Native Share, Clipboard)
 * Generates viral emoji grids for puzzle solutions.
 */

export interface ShareOptions {
  title: string;
  gameName: string;
  scoreOrAttempts: string;
  emojiGrid?: string;
  url?: string;
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

export async function shareScore(options: ShareOptions): Promise<'shared' | 'copied' | 'failed'> {
  const siteUrl = options.url || 'https://bulmacakulubu.github.io';
  const gridSection = options.emojiGrid ? `\n\n${options.emojiGrid}\n` : '\n';
  const textToShare = `🧩 Bulmaca Kulübü: ${options.gameName}\n🏆 Sonuç: ${options.scoreOrAttempts}${gridSection}\nSen de oyna 👉 ${siteUrl}`;

  // 1. Try Native Web Share API (Mobile phones, Android, iOS, macOS)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Bulmaca Kulübü - ${options.gameName}`,
        text: textToShare,
        url: siteUrl,
      });
      return 'shared';
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        // Fallback to clipboard if share failed for other reasons
      } else {
        return 'shared'; // User simply cancelled share dialog
      }
    }
  }

  // 2. Fallback to Clipboard copy
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(textToShare);
      return 'copied';
    }
  } catch {
    // ignore
  }

  return 'failed';
}

export function openWhatsAppShare(text: string, url = 'https://bulmacakulubu.github.io'): void {
  const full = `${text}\n👉 ${url}`;
  const encoded = encodeURIComponent(full);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
}
