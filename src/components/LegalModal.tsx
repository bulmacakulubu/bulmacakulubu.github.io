import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, Cookie } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'tr' | 'en';
}

type TabType = 'terms' | 'privacy' | 'cookies';

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  language = 'tr',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('privacy');
  const isTr = language === 'tr';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-card)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isTr ? 'Yasal Bilgilendirme ve Politikalar' : 'Legal & Privacy Information'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {isTr ? 'KVKK, GDPR, Çerez ve Kullanım Koşulları' : 'KVKK, GDPR, Cookie & Terms of Service'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-[var(--text-primary)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/30 px-5 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'privacy'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Lock size={13} />
            <span>{isTr ? 'Gizlilik & KVKK / GDPR' : 'Privacy & GDPR'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'cookies'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Cookie size={13} />
            <span>{isTr ? 'Çerez Politikası (AdSense)' : 'Cookie Policy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 ${
              activeTab === 'terms'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>{isTr ? 'Kullanıcı Sözleşmesi' : 'Terms of Service'}</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                1. Gizlilik Politikası ve KVKK / GDPR Aydınlatma Metni
              </h3>
              <p>
                <strong>Bulmaca Kulübü</strong> (bulmacakulubu.github.io) olarak kullanıcılarımızın kişisel verilerinin korunmasına ve gizliliğine en yüksek derecede önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (“GDPR”) uyarınca veri sorumlusu sıfatıyla sizi bilgilendiriyoruz.
              </p>

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-3">İşlenen Veriler:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li><strong>Oyun İstatistikleri:</strong> Oynanan oyun sayısı, kazanma oranı, çözülen kelimeler ve skorlar doğrudan kendi tarayıcınızın yerel hafızasında (LocalStorage) saklanır. Sunucularımıza aktarılmaz.</li>
                <li><strong>Kullanıcı Profili:</strong> Belirlediğiniz oyuncu adı ve tercihler yalnızca oyun içi deneyimi kişiselleştirmek için yerel olarak tutulur.</li>
                <li><strong>Teknik Veriler:</strong> Sitemizi ziyaret ettiğinizde barındırma sağlayıcımız (GitHub Pages) ve Google AdSense tarafından standart web sunucu kayıtları (IP adresi, tarayıcı türü, yönlendiren sayfa) işlenebilir.</li>
              </ul>

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-3">Haklarınız ve İletişim:</h4>
              <p>
                KVKK 11. maddesi ve GDPR uyarınca; verilerinizin işlenip işlenmediğini öğrenme, yerel depolama verilerinizi Ayarlar menüsünden sıfırlama veya tarayıcı geçmişinizi temizleme hakkına dilediğiniz zaman sahipsiniz.
              </p>
              <p className="mt-1">
                Bu site <strong>Hakan Ulu</strong> tarafından geliştirilmiştir, iletişim için:{' '}
                <a
                  href="mailto:hknlaauu1@gmail.com"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  hknlaauu1@gmail.com
                </a>
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                2. Çerez (Cookie) Politikası ve Reklam Tercihleri
              </h3>
              <p>
                Sitemizde kullanıcı deneyimini iyileştirmek, tema/dil ayarlarınızı hatırlamak ve Google AdSense aracılığıyla reklam sunabilmek amacıyla çerezler kullanılmaktadır.
              </p>

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-3">Google AdSense ve Üçüncü Taraf Çerezleri:</h4>
              <p>
                Google, sitemizde reklam yayınlamak için üçüncü taraf bir sağlayıcı olarak çerezlerden faydalanır. Google'ın reklam çerezlerini kullanması, kullanıcılarımızın sitemize ve internetteki diğer sitelere yaptıkları ziyaretlere dayalı olarak reklamlar sunmasını sağlar.
              </p>
              <p>
                Kişiselleştirilmiş reklamcılığı devre dışı bırakmak isterseniz,{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-bold"
                >
                  Google Reklam Ayarları
                </a>{' '}
                sayfasını ziyaret edebilirsiniz.
              </p>

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-3">Çerezlerin Yönetimi:</h4>
              <p>
                Tarayıcınızın ayarlarından çerezlerin kullanımını dilediğiniz an engelleyebilir, sınırlandırabilir veya silebilirsiniz. Çerezleri engellemeniz durumunda oyunlar temel düzeyde çalışmaya devam edecektir.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                3. Kullanıcı Sözleşmesi ve Oyun Koşulları
              </h3>
              <p>
                Bulmaca Kulübü web sitesini ziyaret ederek ve oyunları oynayarak bu sözleşmede yer alan tüm şartları kabul etmiş sayılırsınız.
              </p>

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-3">Hizmetin Niteliği:</h4>
              <p>
                Bulmaca Kulübü, zeka ve kelime oyunları sunan ücretsiz bir eğlence platformudur. İçerikler olduğu gibi (“as-is”) sunulmakta olup kesintisiz çalışma taahhüdü verilmez.
              </p>

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-3">Adil Oyun ve Fikri Mülkiyet:</h4>
              <p>
                Platformda yer alan arayüz tasarımları, grafikler ve derlemeler Bulmaca Kulübü'ne aittir. Otomatik botlar, tersine mühendislik veya hile yazılımları kullanmak yasaktır.
              </p>

              <h4 className="font-bold text-gray-900 dark:text-gray-100 mt-3">Geliştirici ve İletişim:</h4>
              <p>
                Bu site <strong>Hakan Ulu</strong> tarafından geliştirilmiştir. İletişim için:{' '}
                <a
                  href="mailto:hknlaauu1@gmail.com"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  hknlaauu1@gmail.com
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500">
            Son Güncelleme: 03.11.2026 • Sürüm 1.0.0
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition cursor-pointer"
          >
            {isTr ? 'Anladım, Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

