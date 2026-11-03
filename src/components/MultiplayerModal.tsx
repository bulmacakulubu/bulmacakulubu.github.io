import React, { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  Crown,
  Sparkles,
  Radio,
  ArrowRight,
  MessageCircle,
  AlertCircle,
  Type,
} from 'lucide-react';
import { GameId, UserProfile, MultiplayerSession } from '../types';
import { multiplayerService, MultiplayerService, MultiplayerMessage } from '../utils/multiplayer';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onStartMultiplayer: (session: MultiplayerSession) => void;
  onDataMessage: (msg: MultiplayerMessage) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartMultiplayer,
  onDataMessage,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [selectedGame, setSelectedGame] = useState<GameId>('satranc');
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'waiting' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    const code = MultiplayerService.generateRoomCode();
    setRoomCode(code);
    setStatus('waiting');
    setErrorMessage('');

    multiplayerService.hostRoom(code, selectedGame, currentUser.name, {
      onConnect: (opponentName) => {
        setStatus('connected');
        setTimeout(() => {
          onStartMultiplayer({
            roomCode: code,
            isHost: true,
            gameId: selectedGame,
            opponentName,
            connected: true,
            playerColor: 'white',
          });
          onClose();
        }, 1200);
      },
      onData: (msg) => {
        onDataMessage(msg);
      },
      onDisconnect: () => {
        setStatus('error');
        setErrorMessage('Rakip bağlantıyı kesti.');
      },
      onError: (err) => {
        setStatus('error');
        setErrorMessage(err);
      },
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    setStatus('connecting');
    setErrorMessage('');

    multiplayerService.joinRoom(cleanCode, currentUser.name, {
      onConnect: (opponentName) => {
        setStatus('connected');
        setTimeout(() => {
          onStartMultiplayer({
            roomCode: cleanCode,
            isHost: false,
            gameId: selectedGame,
            opponentName,
            connected: true,
            playerColor: 'black',
          });
          onClose();
        }, 1200);
      },
      onData: (msg) => {
        onDataMessage(msg);
      },
      onDisconnect: () => {
        setStatus('error');
        setErrorMessage('Bağlantı koptu.');
      },
      onError: (err) => {
        setStatus('error');
        setErrorMessage(err);
      },
    });
  };

  const shareUrl = `${window.location.origin}?room=${roomCode}&game=${selectedGame}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const gameName =
      selectedGame === 'kelime-bulmaca'
        ? 'Kelime Bulmaca'
        : selectedGame === 'satranc'
        ? 'Satranç'
        : 'Kelime Zinciri';
    const text = `🎮 Bulmaca Kulübü'nde benimle 1v1 ${gameName} maçına var mısın?\nOda Kodu: ${roomCode}\n\nDoğrudan odaya girmek için tıkla:\n${shareUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden transition-all bg-[var(--bg-card)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">1v1 Çevrimiçi Düello (Multiplayer)</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Arkadaşınla gerçek zamanlı karşılıklı oyna
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              multiplayerService.cleanup();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[var(--text-primary)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40 p-1">
          <button
            onClick={() => {
              setTab('create');
              setStatus('idle');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              tab === 'create'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                : 'text-gray-500 hover:text-[var(--text-primary)]'
            }`}
          >
            Oda Kur (Host)
          </button>
          <button
            onClick={() => {
              setTab('join');
              setStatus('idle');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              tab === 'join'
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-xs'
                : 'text-gray-500 hover:text-[var(--text-primary)]'
            }`}
          >
            Odaya Katıl
          </button>
        </div>

        <div className="p-5 space-y-4">
          {tab === 'create' ? (
            /* CREATE ROOM TAB */
            <div className="space-y-4">
              {status === 'idle' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-2">Oyun Seçin</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => setSelectedGame('kelime-bulmaca')}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition ${
                          selectedGame === 'kelime-bulmaca'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50'
                        }`}
                      >
                        <Type
                          size={20}
                          className={selectedGame === 'kelime-bulmaca' ? 'text-purple-600' : 'text-gray-400'}
                        />
                        <div>
                          <div className="text-xs font-bold">Kelime Bulmaca</div>
                          <div className="text-[9px] text-gray-400">Canlı Wordle Düellosu</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedGame('satranc')}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition ${
                          selectedGame === 'satranc'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50'
                        }`}
                      >
                        <Crown
                          size={20}
                          className={selectedGame === 'satranc' ? 'text-purple-600' : 'text-gray-400'}
                        />
                        <div>
                          <div className="text-xs font-bold">Satranç 1v1</div>
                          <div className="text-[9px] text-gray-400">Hamle senkronizasyonu</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedGame('kelime-zinciri')}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition ${
                          selectedGame === 'kelime-zinciri'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50'
                        }`}
                      >
                        <Sparkles
                          size={20}
                          className={selectedGame === 'kelime-zinciri' ? 'text-purple-600' : 'text-gray-400'}
                        />
                        <div>
                          <div className="text-xs font-bold">Kelime Zinciri</div>
                          <div className="text-[9px] text-gray-400">Sırayla kelime kapışması</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Radio size={16} />
                    Odayı Oluştur ve Kod Al
                  </button>
                </>
              )}

              {status === 'waiting' && (
                <div className="space-y-4 text-center py-2 animate-fadeIn">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center relative">
                    <Radio size={28} className="text-purple-600 dark:text-purple-400 animate-pulse" />
                    <span className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping"></span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base">Arkadaşınız Bekleniyor...</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Aşağıdaki kodu veya bağlantıyı arkadaşınıza iletin.
                    </p>
                  </div>

                  {/* Room code display */}
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Oda Kodu
                      </div>
                      <div className="text-2xl font-black tracking-widest text-purple-600 dark:text-purple-400">
                        {roomCode}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Kopyalandı' : 'Linki Kopyala'}
                    </button>
                  </div>

                  {/* WhatsApp Direct Share Button */}
                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <MessageCircle size={16} />
                    WhatsApp ile Arkadaşını Çağır
                  </button>
                </div>
              )}

              {status === 'connected' && (
                <div className="py-8 text-center space-y-2 animate-fadeIn">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Check size={32} />
                  </div>
                  <h3 className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    Oyuncu Bağlandı!
                  </h3>
                  <p className="text-xs text-gray-400">Maç başlatılıyor...</p>
                </div>
              )}
            </div>
          ) : (
            /* JOIN ROOM TAB */
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1.5">
                  6 Haneli Oda Kodunu Girin
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: BK-8492"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full text-center text-xl font-mono font-bold tracking-widest px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {status === 'connecting' && (
                <div className="flex items-center justify-center gap-2 text-xs text-purple-600 font-bold py-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Odaya bağlanılıyor...
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'connecting' || !joinCodeInput.trim()}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Odaya Katıl ve Oyna</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {status === 'error' && errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
