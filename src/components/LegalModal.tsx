import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  Cookie,
  Info,
  BookOpen,
  HelpCircle,
  ExternalLink,
  Mail,
  Award,
  Sparkles,
} from 'lucide-react';

export type LegalTabType = 'about' | 'guides' | 'faq' | 'privacy' | 'cookies' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'tr' | 'en';
  initialTab?: LegalTabType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  language = 'tr',
  initialTab = 'about',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);
  const isTr = language === 'tr';

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-card)] text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border-color)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--accent-light)] text-[var(--accent-color)] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {isTr ? 'Bulmaca Kulübü Bilgi & Kurumsal Merkez' : 'Bulmaca Kulübü Information & Legal Center'}
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {isTr
                  ? 'Hakkımızda, Oyun Kuralları, Sıkça Sorulan Sorular ve Yasal Politikalar'
                  : 'About Us, Game Guides, FAQ and Legal Policies'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
            aria-label={isTr ? 'Kapat' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation (Responsive Scrollable) */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 px-3 sm:px-5 pt-2 gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Info size={13} />
            <span>{isTr ? 'Hakkımızda & Künye' : 'About & Imprint'}</span>
          </button>

          <button
            onClick={() => setActiveTab('guides')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'guides'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen size={13} />
            <span>{isTr ? 'Oyun Rehberi (14 Oyun)' : 'Game Guide (14 Games)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'faq'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <HelpCircle size={13} />
            <span>{isTr ? 'SSS (Sorular & Cevaplar)' : 'FAQ'}</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Lock size={13} />
            <span>{isTr ? 'Gizlilik & KVKK' : 'Privacy & GDPR'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'cookies'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Cookie size={13} />
            <span>{isTr ? 'Çerezler' : 'Cookies'}</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <FileText size={13} />
            <span>{isTr ? 'Kullanım Şartları' : 'Terms of Service'}</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-[var(--text-primary)]/90">
          {/* TAB 1: ABOUT & IMPRINT */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-color)] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)] mb-1">
                    {isTr
                      ? 'Bulmaca Kulübü: Türkiye’nin Bilişsel Zeka ve Kelime Platformu'
                      : 'Bulmaca Kulübü: Premier Cognitive Brain Training Platform'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isTr
                      ? 'Hafıza, odaklanma, analitik düşünme ve kelime zenginliğini desteklemek amacıyla geliştirilmiş bağımsız dijital eğlence platformu.'
                      : 'An independent digital platform designed to foster vocabulary, memory retention, logical reasoning, and strategic thinking.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1.5">
                  {isTr ? '1. Misyonumuz ve Vizyonumuz' : '1. Mission & Vision'}
                </h4>
                <p>
                  {isTr
                    ? 'Bulmaca Kulübü (unscrambled.tr); geleneksel gazete bulmacası kültürünü modern dijital teknolojilerle buluşturarak kullanıcılarına temiz, hızlı, minimalist ve kesintisiz bir zihin egzersizi sunmayı hedefler. Platformumuzda yer alan 14 bağımsız zeka oyunu; sözcük bilgisi, mantıksal çıkarım, uzamsal algı ve ileri görüşlülük yeteneklerini eğlenceli bir rekabet ortamında geliştirmek üzere titizlikle tasarlanmıştır.'
                    : 'Bulmaca Kulübü combines traditional word puzzle heritage with modern web engineering, offering a distraction-free, elegant, and performance-optimized cognitive exercise arena.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1.5">
                  {isTr ? '2. Bilişsel ve Zihinsel Egzersiz İlkeleri' : '2. Cognitive Benefits of Puzzles'}
                </h4>
                <p>
                  {isTr
                    ? 'Bilimsel araştırmalar, düzenli olarak kelime ve mantık bulmacaları çözmenin beyin nöroplastisitesini güçlendirdiğini, günlük odaklanma süresini artırdığını ve hafıza zayıflamasına karşı koruyucu bir kalkan oluşturduğunu göstermektedir. Bulmaca Kulübü’nde yer alan algoritmalarımız; her seviyeden oyuncuya kademeli bir zihinsel meydan okuma sunacak şekilde dengelenmiştir.'
                    : 'Cognitive studies demonstrate that routine engagement in crossword puzzles, chess, and logic games enhances working memory, neural flexibility, and problem-solving velocity.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-color)]">
                <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1.5">
                  {isTr ? '3. Künye ve İletişim Bilgileri' : '3. Imprint & Contact Information'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-0.5">
                      {isTr ? 'Yayıncı & Geliştirici' : 'Publisher & Lead Engineer'}
                    </span>
                    <span className="font-semibold text-xs text-[var(--text-primary)]">Hakan Ulu</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-0.5">
                      {isTr ? 'Resmi Web Sitesi' : 'Official Website'}
                    </span>
                    <span className="font-semibold text-xs text-[var(--text-primary)]">https://unscrambled.tr</span>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-0.5">
                      {isTr ? 'Doğrudan İletişim E-Postası' : 'Direct Contact Email'}
                    </span>
                    <a
                      href="mailto:hknlaauu1@gmail.com"
                      className="font-semibold text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Mail size={12} />
                      <span>hknlaauu1@gmail.com</span>
                    </a>
                  </div>
                  <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/40">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] block mb-0.5">
                      {isTr ? 'Lokasyon' : 'Location'}
                    </span>
                    <span className="font-semibold text-xs text-[var(--text-primary)]">Türkiye</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAME GUIDES (14 GAMES) */}
          {activeTab === 'guides' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  {isTr ? '14 Zeka ve Kelime Oyununun Detaylı Kuralları' : 'Complete 14 Game Rules & Guide'}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isTr
                    ? 'Her oyunun amacı, kontrolleri, ipucu mekanikleri ve yüksek puan alma stratejileri aşağıda özetlenmiştir.'
                    : 'Review the rules, scoring criteria, and winning strategies for every game on Bulmaca Kulübü.'}
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Günün Bulmacası */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    1. Günün Bulmacası (Daily Puzzle Challenge)
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
                    {isTr
                      ? 'Her gün Türkiye saatiyle 00:00’da tüm dünya genelindeki oyuncular için eş zamanlı yenilenen ortak bir zeka mücadelesidir.'
                      : 'A globally synchronized daily challenge refreshed every midnight (GMT+3).'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li><strong>Kural:</strong> Günün belirlenen oyununu tek oturumda çözerek bitirme sürenizi kaydedin.</li>
                    <li><strong>Seri (Streak):</strong> Her gün aralıksız oynayarak aktif galibiyet serinizi koruyun.</li>
                    <li><strong>Sıralama:</strong> En kısa sürede tamamlayan oyuncular günlük liderlik kürsüsünde yer alır.</li>
                  </ul>
                </div>

                {/* 2. Kelime Bulmaca */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    2. Kelime Bulmaca (5 Harfli Gizli Kelime)
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
                    {isTr
                      ? 'Dünyaca ünlü 5 harfli kelime tahmin oyunu Wordle’ın zengin Türkçe sözlük ve sınırsız oyun motoruyla uyarlanmış sürümüdür.'
                      : 'The iconic 5-letter word deduction game with comprehensive dictionary verification.'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li><strong>Yeşil Renk:</strong> Harf doğru ve tam olarak olması gereken pozisyondadır.</li>
                    <li><strong>Sarı Renk:</strong> Harf gizli kelimenin içinde var ancak farklı bir pozisyondadır.</li>
                    <li><strong>Gri Renk:</strong> Harf gizli kelimenin hiçbir yerinde bulunmamaktadır.</li>
                    <li><strong>Taktik:</strong> İlk iki tahminde sesli harf çeşitliliği yüksek kelimeler (örn: KALEM, HURMA) tercih edin.</li>
                  </ul>
                </div>

                {/* 3. Kare / Çengel Bulmaca */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    3. Kare ve Çengel Bulmaca
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
                    {isTr
                      ? 'Geleneksel gazete kare bulmacası keyfi. Yatay ve dikey soru ipuçlarını çözerek ızgarayı eksiksiz tamamlayın.'
                      : 'Classic newspaper crossword puzzle experience with horizontal and vertical clues.'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Izgaradaki kutucuklara tıklayarak yatay/dikey yönü değiştirebilirsiniz.</li>
                    <li>Zorlandığınız noktalarda üst paneldeki "Harf Aç" veya "Kelime Aç" ipucu butonlarından yararlanabilirsiniz.</li>
                  </ul>
                </div>

                {/* 4. Satranç */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    4. Satranç (Chess AI & Strateji)
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
                    {isTr
                      ? 'Standart FIDE kurallarıyla çalışan yapay zeka satranç motoru. Kolay, orta ve usta seviyelerinde hamle derinliği.'
                      : 'Authentic FIDE rules chess engine featuring multi-tier AI evaluation.'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Tüm özel hamleler (Kısa/Uzun Rok, Geçerken Alma / En Passant, Piyon Terfisi) tam olarak desteklenir.</li>
                    <li>Şah çekildiğinde yalnızca şahı kurtaran yasal hamleler yapılabilir; kurtuluş yoksa Şah-Mat gerçekleşir.</li>
                  </ul>
                </div>

                {/* 5. Sudoku */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    5. Sudoku (9x9 Mantık Izgarası)
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
                    {isTr
                      ? 'Rakamların mantıksal sıralanışına dayanan, matematiksel işlem gerektirmeyen küresel zeka oyunu.'
                      : '9x9 combinatorial number-placement puzzle requiring rigorous logical deduction.'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Her satır, her sütun ve her 3x3 kalın çerçeveli bölge 1’den 9’a kadar tüm rakamları yalnızca bir kez barındırmalıdır.</li>
                    <li>Not alma moduyla hücrelere olasılık rakamları yazabilirsiniz.</li>
                  </ul>
                </div>

                {/* 6. Bağlantılar (Connections) */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    6. Bağlantılar (Word Connections)
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
                    {isTr
                      ? '16 kelimeden oluşan rastgele bir ızgarada ortak bir temayı paylaşan dörderli dört gizli grubu çözün.'
                      : 'Identify 4 distinct groups of 4 words sharing a hidden conceptual connection.'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Gruplar zorluk rengine göre ayrılır: Sarı (Doğrudan bağlantı), Yeşil (Orta), Mavi (İleri), Mor (Ters köşe / kelime oyunu).</li>
                    <li>Toplam 4 hata hakkınız bulunur; yanıltıcı eşanlamlılara dikkat edin.</li>
                  </ul>
                </div>

                {/* 7. Nonogram */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    7. Nonogram (Japon Piksel Bulmaca)
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mb-1.5">
                    {isTr
                      ? 'Satır ve sütun başındaki sayı ipuçlarına göre doğru kareleri karalayarak gizli piksel sanatını ortaya çıkarın.'
                      : 'Japanese picture logic puzzle revealing hidden pixel illustrations.'}
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Sayılar, o satır/sütundaki bitişik dolu kare gruplarının uzunluğunu belirtir.</li>
                    <li>Boş olduğundan emin olduğunuz karelere çarpı (X) koyarak ızgarayı güvenle daraltın.</li>
                  </ul>
                </div>

                {/* 8-14 Diğer Oyunlar Özeti */}
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--accent-color)] mb-1">
                    8 - 14. Diğer Zeka & Kelime Oyunları
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li><strong>Anagram Çözücü:</strong> Karışık harflerden anlamlı kelimeleri süre dolmadan türetin.</li>
                    <li><strong>Kelime Türetme:</strong> Verilen harf havuzunu kullanarak en uzun ve en yüksek puanlı kelimeleri oluşturun.</li>
                    <li><strong>Sözcük Avı:</strong> 8 farklı yönde (yatay, dikey, çapraz) gizlenmiş kelimeleri ızgarada tarayın.</li>
                    <li><strong>Adam Asmaca:</strong> Kısıtlı hata hakkıyla gizli deyim ve kelimeleri harf harf keşfedin.</li>
                    <li><strong>Kelime Zinciri:</strong> Önceki kelimenin son harfiyle başlayan yeni kelimelerle zinciri uzatın.</li>
                    <li><strong>Hafıza Kartları:</strong> Kapalı kartları çevirerek aynı sembol veya terimleri en az hamlede eşleştirin.</li>
                    <li><strong>Nokta Avı (Dots & Boxes):</strong> Çizgilerle kareleri kapatıp rakibe karşı alan üstünlüğü sağlayın.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] mb-2">
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  {isTr ? 'Sıkça Sorulan Sorular (SSS)' : 'Frequently Asked Questions (FAQ)'}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isTr
                    ? 'Bulmaca Kulübü platformunun işleyişi, gizliliği ve teknik özellikleri hakkında merak edilenler.'
                    : 'Everything you need to know about Bulmaca Kulübü, game mechanics, and privacy.'}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] mb-1">
                    {isTr ? '1. Bulmaca Kulübü ücretli mi? Herhangi bir abonelik gerekiyor mu?' : '1. Is Bulmaca Kulübü free to play?'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isTr
                      ? 'Hayır, Bulmaca Kulübü tamamen ücretsizdir. 14 oyunun tamamı, sınırsız oyun modu, Günün Bulmacası ve 1v1 Çevrimiçi Düello herhangi bir ücret veya zorunlu üyelik gerektirmeden herkese açıktır.'
                      : 'No, Bulmaca Kulübü is 100% free to play. All 14 games, daily puzzles, and online duels are available to everyone.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] mb-1">
                    {isTr ? '2. 1v1 Çevrimiçi Düello modu nasıl çalışır?' : '2. How does 1v1 Multiplayer work?'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isTr
                      ? '1v1 Düello sistemi, WebRTC Peer-to-Peer (noktadan noktaya) şifreli veri kanalı üzerinden çalışır. Bir oda kodu oluşturup arkadaşınıza gönderdiğinizde sunucuya ihtiyaç duymadan doğrudan cihazlar arası gerçek zamanlı yarışabilirsiniz.'
                      : 'The 1v1 Duel system leverages modern WebRTC peer-to-peer data channels for seamless, encrypted real-time competition.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] mb-1">
                    {isTr ? '3. Oyun skorlarım ve istatistiklerim kaybolur mu?' : '3. Are my game stats and streaks preserved?'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isTr
                      ? 'Tüm istatistikleriniz (kazanma oranları, aktif seriler, çözülen kelimeler) tarayıcınızın güvenli yerel hafızasında (LocalStorage) saklanır. Dilerseniz Google Hesabınızla giriş yaparak skorlarınızı küresel liderlik tablosuna da yazdırabilirsiniz.'
                      : 'All stats and streaks are safely saved in your browser local storage, with optional Google Sign-In for synchronized global leaderboards.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] mb-1">
                    {isTr ? '4. Uygulamayı telefona veya masaüstüne nasıl yükleyebilirim?' : '4. How do I install the app on mobile/desktop?'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isTr
                      ? 'Sitemiz PWA (Progressive Web App) standartlarına tam uyumludur. Sol menüdeki "Ana Ekrana Ekle" butonuna tıklayarak veya tarayıcınızın menüsünden "Uygulamayı Yükle" diyerek herhangi bir uygulama mağazasına ihtiyaç duymadan ana ekranınıza tek dokunuşla ekleyebilirsiniz.'
                      : 'Bulmaca Kulübü is a certified PWA. Click "Add to Home Screen" in the sidebar to install it on iOS, Android, or desktop.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] mb-1">
                    {isTr ? '5. Zeka oyunlarının hafızaya ve zihne faydaları nelerdir?' : '5. What are the cognitive benefits of brain puzzles?'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isTr
                      ? 'Düzenli bulmaca çözmek; çalışma belleğini (working memory) aktif tutar, analitik düşünme hızını yükseltir, yeni nöral yolların oluşmasını destekler ve stres seviyesini düşürerek odaklanma disiplini kazandırır.'
                      : 'Daily logic training enhances cognitive resilience, verbal fluency, executive function, and working memory performance.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] mb-1">
                    {isTr ? '6. Öneri, hata bildirimi veya yeni kelime ekleme talebi için kime ulaşabilirim?' : '6. How can I submit feedback or bug reports?'}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {isTr ? (
                      <>
                        Geliştiricimiz Hakan Ulu’ya doğrudan{' '}
                        <a href="mailto:hknlaauu1@gmail.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                          hknlaauu1@gmail.com
                        </a>{' '}
                        e-posta adresinden ulaşabilirsiniz. Tüm geri bildirimler 24 saat içinde titizlikle incelenmektedir.
                      </>
                    ) : (
                      'You can email lead developer Hakan Ulu directly at hknlaauu1@gmail.com. All inquiries are reviewed within 24 hours.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY & KVKK / GDPR */}
          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                {isTr ? '1. Gizlilik Politikası ve KVKK / GDPR Aydınlatma Metni' : '1. Privacy Policy & GDPR Notice'}
              </h3>
              <p>
                <strong>Bulmaca Kulübü</strong> (unscrambled.tr) olarak kullanıcılarımızın kişisel verilerinin korunmasına ve gizliliğine en yüksek derecede önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (“GDPR”) uyarınca veri sorumlusu sıfatıyla sizi bilgilendiriyoruz.
              </p>

              <h4 className="font-bold text-[var(--text-primary)] mt-3">İşlenen Veriler:</h4>
              <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                <li><strong>Oyun İstatistikleri:</strong> Oynanan oyun sayısı, kazanma oranı, çözülen kelimeler ve skorlar doğrudan kendi tarayıcınızın yerel hafızasında (LocalStorage) saklanır. Sunucularımıza aktarılmaz.</li>
                <li><strong>Kullanıcı Profili:</strong> Belirlediğiniz oyuncu adı ve tercihler yalnızca oyun içi deneyimi kişiselleştirmek için yerel olarak tutulur.</li>
                <li><strong>Teknik Veriler:</strong> Sitemizi ziyaret ettiğinizde barındırma sağlayıcımız (GitHub Pages) ve Google AdSense tarafından standart web sunucu kayıtları (IP adresi, tarayıcı türü, yönlendiren sayfa) işlenebilir.</li>
              </ul>

              <h4 className="font-bold text-[var(--text-primary)] mt-3">Haklarınız ve İletişim:</h4>
              <p>
                KVKK 11. maddesi ve GDPR uyarınca; verilerinizin işlenip işlenmediğini öğrenme, yerel depolama verilerinizi Ayarlar menüsünden sıfırlama veya tarayıcı geçmişinizi temizleme hakkına dilediğiniz zaman sahipsiniz.
              </p>
              <p className="mt-1">
                Geliştirici ve Veri Sorumlusu: <strong>Hakan Ulu</strong> • İletişim:{' '}
                <a
                  href="mailto:hknlaauu1@gmail.com"
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  hknlaauu1@gmail.com
                </a>
              </p>
            </div>
          )}

          {/* TAB 5: COOKIES */}
          {activeTab === 'cookies' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                {isTr ? '2. Çerez (Cookie) Politikası ve Reklam Tercihleri' : '2. Cookie Policy'}
              </h3>
              <p>
                Sitemizde kullanıcı deneyimini iyileştirmek, tema/dil ayarlarınızı hatırlamak ve Google AdSense aracılığıyla reklam sunabilmek amacıyla çerezler kullanılmaktadır.
              </p>

              <h4 className="font-bold text-[var(--text-primary)] mt-3">Google AdSense ve Üçüncü Taraf Çerezleri:</h4>
              <p>
                Google, sitemizde reklam yayınlamak için üçüncü taraf bir sağlayıcı olarak çerezlerden faydalanır. Google'ın reklam çerezlerini kullanması, kullanıcılarımızın sitemize ve internetteki diğer sitelere yaptıkları ziyaretlere dayalı olarak reklamlar sunmasını sağlar.
              </p>
              <p>
                Kişiselleştirilmiş reklamcılığı devre dışı bırakmak isterseniz,{' '}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
                >
                  <span>Google Reklam Ayarları</span>
                  <ExternalLink size={11} />
                </a>{' '}
                sayfasını ziyaret edebilirsiniz.
              </p>

              <h4 className="font-bold text-[var(--text-primary)] mt-3">Çerezlerin Yönetimi:</h4>
              <p>
                Tarayıcınızın ayarlarından çerezlerin kullanımını dilediğiniz an engelleyebilir, sınırlandırabilir veya silebilirsiniz. Çerezleri engellemeniz durumunda oyunlar temel düzeyde çalışmaya devam edecektir.
              </p>
            </div>
          )}

          {/* TAB 6: TERMS */}
          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                {isTr ? '3. Kullanıcı Sözleşmesi ve Oyun Koşulları' : '3. Terms of Service'}
              </h3>
              <p>
                Bulmaca Kulübü web sitesini ziyaret ederek ve oyunları oynayarak bu sözleşmede yer alan tüm şartları kabul etmiş sayılırsınız.
              </p>

              <h4 className="font-bold text-[var(--text-primary)] mt-3">Hizmetin Niteliği:</h4>
              <p>
                Bulmaca Kulübü, zeka ve kelime oyunları sunan ücretsiz bir eğlence platformudur. İçerikler olduğu gibi (“as-is”) sunulmakta olup kesintisiz çalışma taahhüdü verilmez.
              </p>

              <h4 className="font-bold text-[var(--text-primary)] mt-3">Adil Oyun ve Fikri Mülkiyet:</h4>
              <p>
                Platformda yer alan arayüz tasarımları, grafikler ve derlemeler Bulmaca Kulübü'ne aittir. Otomatik botlar, tersine mühendislik veya hile yazılımları kullanmak yasaktır.
              </p>

              <h4 className="font-bold text-[var(--text-primary)] mt-3">Geliştirici ve İletişim:</h4>
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
        <div className="p-3.5 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex items-center justify-between shrink-0">
          <span className="text-[10px] sm:text-[11px] text-[var(--text-secondary)]">
            {isTr ? 'Bulmaca Kulübü © 2026 • unscrambled.tr' : 'Bulmaca Kulübü © 2026 • unscrambled.tr'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 sm:py-2 bg-[var(--accent-color)] text-[var(--accent-contrast)] font-bold text-xs rounded-xl shadow-xs hover:opacity-90 transition cursor-pointer"
          >
            {isTr ? 'Tamam, Kapat' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
