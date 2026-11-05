import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Share2, Globe, Sparkles } from 'lucide-react';
import {
  ShareModalState,
  subscribeShareModal,
  closeShareModal,
  formatShareText,
  openWhatsAppShare,
  openTwitterShare,
  openTelegramShare,
  openFacebookShare,
  openLinkedInShare,
  copyShareText,
  triggerNativeShare,
} from '../utils/shareService';

interface ShareModalProps {
  language?: 'tr' | 'en';
}

export const ShareModal: React.FC<ShareModalProps> = ({ language = 'tr' }) => {
  const [state, setState] = useState<ShareModalState>({
    isOpen: false,
    gameName: '',
    scoreOrAttempts: '',
  });
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeShareModal((newState) => {
      setState(newState);
      if (newState.isOpen) {
        setCopied(false);
        setUrlCopied(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isOpen) {
        closeShareModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen]);

  if (!state.isOpen) return null;

  const isTr = language === 'tr';
  const siteUrl = state.url || 'https://bulmacakulubu.github.io';
  const shareText = formatShareText(state);

  const handleCopyText = async () => {
    const success = await copyShareText(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleCopyUrl = async () => {
    const success = await copyShareText(siteUrl);
    if (success) {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2200);
    }
  };

  const handleNativeShare = async () => {
    await triggerNativeShare(`Bulmaca Kulübü - ${state.gameName}`, shareText, siteUrl);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeShareModal();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-secondary)]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-100 flex items-center justify-center border border-zinc-700 shadow-2xs">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                <span>{isTr ? 'Skoru Paylaş' : 'Share Your Score'}</span>
                <Sparkles size={13} className="text-amber-400" />
              </h3>
              <p className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                {state.gameName} • {state.scoreOrAttempts}
              </p>
            </div>
          </div>
          <button
            onClick={closeShareModal}
            className="p-1.5 rounded-xl hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            title={isTr ? 'Kapat' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Formatted Text Preview Card */}
          <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] relative group">
            <div className="text-[11px] font-mono whitespace-pre-line text-zinc-300 leading-relaxed max-h-36 overflow-y-auto pr-1">
              {shareText}
            </div>
            <button
              onClick={handleCopyText}
              className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              {copied ? (
                <>
                  <Check size={12} className="text-white" />
                  <span>{isTr ? 'Kopyalandı' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>{isTr ? 'Metni Kopyala' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Social Platforms Grid */}
          <div>
            <div className="text-[11px] font-bold text-zinc-400 mb-2.5 tracking-wider uppercase">
              {isTr ? 'Paylaşmak İstediğiniz Ağı Seçin' : 'Select Social Network'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* WhatsApp */}
              <button
                onClick={() => openWhatsAppShare(shareText, siteUrl)}
                className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition flex items-center gap-2.5 cursor-pointer group shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                  {/* WhatsApp SVG */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-1.954-.462-1.611-.669-2.646-2.316-2.727-2.423-.08-.108-.654-.871-.654-1.662 0-.791.414-1.18.561-1.341.144-.162.315-.203.42-.203.104 0 .209.002.3.007.095.006.223-.036.349.266.13.311.442 1.077.481 1.157.039.08.065.174.013.279-.052.105-.078.17-.156.262-.078.092-.164.205-.235.275-.078.078-.16.162-.069.317.091.156.403.666.865 1.077.595.53 1.097.694 1.253.772.156.078.247.069.339-.036.091-.105.39-.455.494-.611.104-.156.208-.13.349-.078.14.052.887.418 1.039.494.152.076.253.114.29.178.038.064.038.373-.106.778zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.957-1.399C8.423 21.492 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">WhatsApp</div>
                  <div className="text-[10px] text-zinc-400 truncate">{isTr ? 'Doğrudan Gönder' : 'Direct message'}</div>
                </div>
              </button>

              {/* X / Twitter */}
              <button
                onClick={() => openTwitterShare(shareText, siteUrl)}
                className="p-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 transition flex items-center gap-2.5 cursor-pointer group shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                  {/* X Logo */}
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">X (Twitter)</div>
                  <div className="text-[10px] text-zinc-400 truncate">{isTr ? 'Tweet At' : 'Post tweet'}</div>
                </div>
              </button>

              {/* Telegram */}
              <button
                onClick={() => openTelegramShare(shareText, siteUrl)}
                className="p-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition flex items-center gap-2.5 cursor-pointer group shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                  {/* Telegram SVG */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Telegram</div>
                  <div className="text-[10px] text-zinc-400 truncate">{isTr ? 'Mesaj Gönder' : 'Send message'}</div>
                </div>
              </button>

              {/* Facebook */}
              <button
                onClick={() => openFacebookShare(shareText, siteUrl)}
                className="p-2.5 rounded-xl border border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition flex items-center gap-2.5 cursor-pointer group shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                  {/* Facebook SVG */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">Facebook</div>
                  <div className="text-[10px] text-zinc-400 truncate">{isTr ? 'Akışta Paylaş' : 'Share to feed'}</div>
                </div>
              </button>

              {/* LinkedIn */}
              <button
                onClick={() => openLinkedInShare(shareText, siteUrl)}
                className="p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition flex items-center gap-2.5 cursor-pointer group shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                  {/* LinkedIn SVG */}
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">LinkedIn</div>
                  <div className="text-[10px] text-zinc-400 truncate">{isTr ? 'Ağında Paylaş' : 'Share to network'}</div>
                </div>
              </button>

              {/* Native / All Apps Share */}
              <button
                onClick={handleNativeShare}
                className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition flex items-center gap-2.5 cursor-pointer group shadow-2xs text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                  <Share2 size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{isTr ? 'Cihaz Paylaşımı' : 'Device Share'}</div>
                  <div className="text-[10px] text-zinc-400 truncate">{isTr ? 'Tüm Uygulamalar' : 'All apps'}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick URL Copy Bar */}
          <div className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 text-zinc-400">
              <Globe size={14} className="shrink-0 text-zinc-500" />
              <span className="text-xs font-mono text-zinc-300 truncate">{siteUrl}</span>
            </div>
            <button
              onClick={handleCopyUrl}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                urlCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              {urlCopied ? (
                <>
                  <Check size={12} className="text-white" />
                  <span>{isTr ? 'Kopyalandı' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>{isTr ? 'Linki Kopyala' : 'Copy Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 flex items-center justify-end">
          <button
            onClick={closeShareModal}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition border border-zinc-700 cursor-pointer"
          >
            {isTr ? 'Tamam' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

