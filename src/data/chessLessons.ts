// Chess Academy & Interactive Training Lessons
// Covers Piece Movements, Special Rules (Castling, En Passant, Promotion), and Tactical Checkmate Motifs.

export interface ChessLesson {
  id: string;
  category: 'basics' | 'rules' | 'tactics';
  categoryTitle: { tr: string; en: string };
  title: { tr: string; en: string };
  pieceSymbol: string;
  description: { tr: string; en: string };
  instruction: { tr: string; en: string };
  hint: { tr: string; en: string };
  explanation: { tr: string; en: string };
  board: (string | null)[][];
  stars?: [number, number][]; // coordinates where stars are placed
  targetMove?: { from: [number, number]; to: [number, number] }; // for tactical moves
}

const emptyRow = () => [null, null, null, null, null, null, null, null];

export const CHESS_LESSONS: ChessLesson[] = [
  // ==========================================
  // 1. TEMEL TAŞ HAREKETLERİ (PIECE ACADEMY)
  // ==========================================
  {
    id: 'rook-1',
    category: 'basics',
    categoryTitle: { tr: '1. Taş Hareketleri', en: '1. Piece Moves' },
    title: { tr: 'Kale (Rook)', en: 'The Rook' },
    pieceSymbol: '♖',
    description: {
      tr: 'Kale düz hatlarda (ileri, geri, sağa, sola) önünde engel olmadığı sürece istediği kadar kare ilerleyebilir.',
      en: 'The Rook moves in straight lines (forward, backward, left, right) as many squares as it wants as long as no piece blocks it.',
    },
    instruction: {
      tr: 'Beyaz Kaleyi (♖) hareket ettirerek tahtadaki 2 yıldızı topla!',
      en: 'Move the White Rook (♖) to collect both stars on the board!',
    },
    hint: {
      tr: 'Önce dikey olarak yukarıdaki yıldıza git, ardından sağdaki yıldıza yönel.',
      en: 'First move vertically to the star above, then move horizontally to the right star.',
    },
    explanation: {
      tr: 'Harika! Kale dikey ve yatay yolları kontrol eden güçlü bir taştır (5 puan değerindedir).',
      en: 'Awesome! The Rook controls ranks and files and is worth 5 points.',
    },
    board: [
      emptyRow(),
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, null, null, null, null, null],
      [null, null, 'R', null, null, null, null, null], // c1
    ],
    stars: [
      [1, 2], // c7
      [1, 6], // g7
    ],
  },
  {
    id: 'bishop-1',
    category: 'basics',
    categoryTitle: { tr: '1. Taş Hareketleri', en: '1. Piece Moves' },
    title: { tr: 'Fil (Bishop)', en: 'The Bishop' },
    pieceSymbol: '♗',
    description: {
      tr: 'Fil sadece kendi rengindeki çapraz karelerde ilerler. Açık renk karedeki Fil asla koyu renk kareye geçemez.',
      en: 'The Bishop moves diagonally across squares of its own starting color. A light-squared bishop never touches dark squares.',
    },
    instruction: {
      tr: 'Beyaz Fili (♗) çapraz sürerek 2 yıldızı sırayla topla!',
      en: 'Move the White Bishop (♗) diagonally to capture both stars!',
    },
    hint: {
      tr: 'Çapraz hat boyunca yukarı-sağa doğru ilerle.',
      en: 'Slide diagonally up-right along the open diagonal.',
    },
    explanation: {
      tr: 'Tebrikler! Fil çaprazların efendisidir (3 puan değerindedir).',
      en: 'Great job! The Bishop commands open diagonals and is worth 3 points.',
    },
    board: [
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, 'B', null, null, null, null, null], // c1 (light square)
    ],
    stars: [
      [4, 6], // g4
      [2, 4], // e6
    ],
  },
  {
    id: 'queen-1',
    category: 'basics',
    categoryTitle: { tr: '1. Taş Hareketleri', en: '1. Piece Moves' },
    title: { tr: 'Vezir (Queen)', en: 'The Queen' },
    pieceSymbol: '♕',
    description: {
      tr: 'Vezir tahtanın en güçlü taşıdır (9 puan). Hem Kale gibi düz hem de Fil gibi çapraz istediği kadar gidebilir.',
      en: 'The Queen is the most powerful piece on the board (9 points). It can move both like a Rook (straight) and like a Bishop (diagonal).',
    },
    instruction: {
      tr: 'Vezir (♕) ile düz ve çapraz hareketleri kullanarak 3 yıldızı topla!',
      en: 'Use the Queen (♕) with straight and diagonal moves to collect all 3 stars!',
    },
    hint: {
      tr: 'Önce dikey yukarı git, sonra çapraz in, ardından yatay olarak son yıldızı al.',
      en: 'Move vertically up, then diagonally down, then slide horizontally for the last star.',
    },
    explanation: {
      tr: 'Mükemmel! Vezir geniş hareket kabiliyetiyle tahtanın her köşesine hızla ulaşabilir.',
      en: 'Superb! The Queen combines the power of Rook and Bishop to dominate the board.',
    },
    board: [
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, 'Q', null, null, null, null], // d1
    ],
    stars: [
      [1, 3], // d7 (vertical)
      [4, 6], // g4 (diagonal)
      [4, 1], // b4 (horizontal)
    ],
  },
  {
    id: 'knight-1',
    category: 'basics',
    categoryTitle: { tr: '1. Taş Hareketleri', en: '1. Piece Moves' },
    title: { tr: 'At (Knight)', en: 'The Knight' },
    pieceSymbol: '♘',
    description: {
      tr: 'At, diğer taşların üzerinden atlayabilen TEK taştır! "L" şeklinde hareket eder: 2 kare düz + 1 kare yana (veya 1 düz + 2 yana).',
      en: 'The Knight is the ONLY piece that can jump over other pieces! It moves in an "L" shape: 2 squares straight + 1 square sideways.',
    },
    instruction: {
      tr: 'Piyon duvarının üzerinden L çizerek zıpla ve arkadaki yıldızları topla!',
      en: 'Jump over the pawn wall using the L-shape and collect the stars behind it!',
    },
    hint: {
      tr: 'At f3 karesinden e5 veya d4 gibi karelere zıplayabilir.',
      en: 'From f3, the knight can leap to e5 or d4 jumping over the pawns.',
    },
    explanation: {
      tr: 'Bravo! Atın üzerinden atlama yeteneği onu kapalı konumlarda paha biçilmez kılar (3 puan değerindedir).',
      en: 'Bravo! The Knight is unique in leaping over pieces, making it lethal in closed positions.',
    },
    board: [
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, 'p', 'p', null, null, null], // pawn barrier
      [null, null, null, null, null, null, null, null],
      emptyRow(),
      [null, null, null, null, null, 'N', null, null], // f1
    ],
    stars: [
      [2, 3], // d6
      [3, 5], // f5
    ],
  },
  {
    id: 'king-1',
    category: 'basics',
    categoryTitle: { tr: '1. Taş Hareketleri', en: '1. Piece Moves' },
    title: { tr: 'Şah (King)', en: 'The King' },
    pieceSymbol: '♔',
    description: {
      tr: 'Şah tahtanın en önemli taşıdır. Her yöne (düz veya çapraz) sadece 1 kare gidebilir. Şah düşerse oyun biter!',
      en: 'The King is the most important piece. It can step 1 square in any direction (straight or diagonal). If the King falls, the game is over!',
    },
    instruction: {
      tr: 'Şahı (♔) adım adım ilerleterek yıldızlara ulaştır.',
      en: 'Move the King (♔) step by step to reach the stars.',
    },
    hint: {
      tr: 'Her hamlede 1 kare ilerle.',
      en: 'Take one step per turn.',
    },
    explanation: {
      tr: 'Harika! Şah oyun sonunda (endgame) bizzat savaşa katılarak piyonlara liderlik eder.',
      en: 'Well done! The King leads from the front in the endgame to support passed pawns.',
    },
    board: [
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, null, 'K', null, null, null], // e1
    ],
    stars: [
      [6, 4], // e2
      [5, 4], // e3
    ],
  },
  {
    id: 'pawn-1',
    category: 'basics',
    categoryTitle: { tr: '1. Taş Hareketleri', en: '1. Piece Moves' },
    title: { tr: 'Piyon (Pawn)', en: 'The Pawn' },
    pieceSymbol: '♙',
    description: {
      tr: 'Piyon sadece ileri gider. Başlangıç karesindeyken 1 veya 2 adım sürebilir. Ancak taş alırken 1 kare ÇAPRAZ alır!',
      en: 'Pawns only move forward. From their starting square they can move 1 or 2 steps. But they CAPTURE 1 square diagonally forward!',
    },
    instruction: {
      tr: 'Piyonu (♙) önce 2 adım sür, ardından çaprazdaki yıldızı al!',
      en: 'Push the Pawn (♙) 2 steps forward, then capture the diagonal star!',
    },
    hint: {
      tr: 'e2 karesindeki piyon ilk hamlesinde e4 karesine 2 adım gidebilir.',
      en: 'The pawn on e2 can step 2 squares directly to e4.',
    },
    explanation: {
      tr: 'Çok iyi! Piyonlar satrancın ruhudur; ileri yürüyüp son sıraya vardıklarında Vezir olurlar!',
      en: 'Great! Pawns are the soul of chess; advancing all the way turns them into Queens!',
    },
    board: [
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, null, 'P', null, null, null], // e2
      emptyRow(),
    ],
    stars: [
      [4, 4], // e4 (pawn double step)
      [3, 3], // d5 (diagonal capture)
    ],
  },

  // ==========================================
  // 2. ÖZEL KURALLAR (SPECIAL RULES)
  // ==========================================
  {
    id: 'promotion-1',
    category: 'rules',
    categoryTitle: { tr: '2. Özel Kurallar', en: '2. Special Rules' },
    title: { tr: 'Piyon Terfisi (Promotion)', en: 'Pawn Promotion' },
    pieceSymbol: '♙➔♕',
    description: {
      tr: 'Bir piyon karşı tarafın son sırasına (8. yataya) ulaştığında anında Vezir, Kale, Fil veya At\'a terfi eder!',
      en: 'When a pawn reaches the enemy back rank (8th rank), it immediately promotes into a Queen, Rook, Bishop, or Knight!',
    },
    instruction: {
      tr: 'e7 karesindeki piyonu son sıraya (e8) sürerek Vezir\'e dönüştür!',
      en: 'Push the pawn from e7 to the 8th rank (e8) to promote to a Queen!',
    },
    hint: {
      tr: 'Piyona tıkla ve 8. yataydaki kareyi seç.',
      en: 'Click the pawn and move it to the 8th rank.',
    },
    explanation: {
      tr: 'Tebrikler! Piyonun artık tahtanın en güçlü taşı olan Vezir\'e (♕) dönüştü!',
      en: 'Congratulations! Your pawn has promoted into a mighty Queen (♕)!',
    },
    board: [
      emptyRow(),
      [null, null, null, null, 'P', null, null, null], // e7
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, null, 'K', null, null, null], // e1
    ],
    stars: [
      [0, 4], // e8
    ],
  },
  {
    id: 'castling-1',
    category: 'rules',
    categoryTitle: { tr: '2. Özel Kurallar', en: '2. Special Rules' },
    title: { tr: 'Rok (Castling)', en: 'Castling' },
    pieceSymbol: '♔♖',
    description: {
      tr: 'Rok, Şah ve Kalenin aynı hamlede oynandığı özel bir kuraldır. Şahı güvenceye alır ve kaleyi merkeze getirir.',
      en: 'Castling is a special move where the King and Rook move together. It tucks the King safely into the corner and activates the Rook.',
    },
    instruction: {
      tr: 'Şah ile sağa doğru 2 kare giderek (g1 karesine) Kısa Rok yap!',
      en: 'Move the King two squares to the right (to g1) to castle kingside!',
    },
    hint: {
      tr: 'Şah e1\'den g1 karesine gidecek, Kale otomatik olarak f1 karesine gelecektir.',
      en: 'Move King from e1 to g1. The Rook will jump to f1.',
    },
    explanation: {
      tr: 'Mükemmel! Rok kuralı için Şah ve Kalenin daha önce oynamamış olması ve aralarının boş olması gerekir.',
      en: 'Perfect! Castling requires that neither the King nor the Rook has moved yet.',
    },
    board: [
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, null, 'K', null, null, 'R'], // e1, h1
    ],
    targetMove: {
      from: [7, 4], // e1
      to: [7, 6],   // g1
    },
    stars: [
      [7, 6], // g1 target
    ],
  },

  // ==========================================
  // 3. TAKTİK & MAT MOTİFLERİ (TACTICS & MATES)
  // ==========================================
  {
    id: 'backrank-mate',
    category: 'tactics',
    categoryTitle: { tr: '3. Taktik & Mat', en: '3. Tactics & Mate' },
    title: { tr: 'Koridor Matı (Back-Rank Mate)', en: 'Back-Rank Mate' },
    pieceSymbol: '♚⚔️',
    description: {
      tr: 'Rakip Şah kendi piyonlarının arkasında sıkışıp kaldığında, son sıraya inen bir Kale veya Vezir kaçacak yer bırakmadan mat eder!',
      en: 'When the enemy King is trapped behind its own pawns, a Rook or Queen descending to the back rank delivers an inescapable checkmate!',
    },
    instruction: {
      tr: 'Beyaz Kaleyi son sıraya (d8) indirerek Siyah Şah\'ı koridorda mat et!',
      en: 'Deliver the Back-Rank Mate by sliding the White Rook to d8!',
    },
    hint: {
      tr: 'Kaleyi d1 karesinden en üst sıraya (d8) sür.',
      en: 'Move the Rook on d1 all the way up to d8.',
    },
    explanation: {
      tr: 'ŞAH VE MAT! 🏆 Siyah Şah kendi piyonları yüzünden kaçamadı ve araya girecek taş bulunmuyor.',
      en: 'CHECKMATE! 🏆 The Black King is trapped behind its pawns with no escape.',
    },
    board: [
      [null, null, null, null, null, null, 'k', null], // g8 Black King
      [null, null, null, null, null, 'p', 'p', 'p'],   // f7, g7, h7 Black pawns (blocking escape)
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, 'R', null, null, null, 'K'], // d1 White Rook, h1 White King
    ],
    targetMove: {
      from: [7, 3], // d1
      to: [0, 3],   // d8
    },
    stars: [
      [0, 3], // d8
    ],
  },
  {
    id: 'knight-fork',
    category: 'tactics',
    categoryTitle: { tr: '3. Taktik & Mat', en: '3. Tactics & Mate' },
    title: { tr: 'At Çatalı (Knight Fork)', en: 'The Knight Fork' },
    pieceSymbol: '♘⚔️',
    description: {
      tr: 'Çatal, tek bir taşın aynı anda iki veya daha fazla rakip taşa birden saldırmasıdır. Rakip ikisini birden kurtaramaz!',
      en: 'A fork is a tactic where one piece attacks two or more enemy pieces simultaneously. The opponent cannot save both!',
    },
    instruction: {
      tr: 'Beyaz Atı (♘) e7 karesine oynayarak hem Şah\'a hem Vezir\'e aynı anda saldır (Çatal at)!',
      en: 'Move the White Knight (♘) to e7 to fork both the Black King and Queen!',
    },
    hint: {
      tr: 'c6 karesindeki Atı e7 karesine zıplat.',
      en: 'Leap your Knight from c6 to e7.',
    },
    explanation: {
      tr: 'Harika Çatal! Şah tehdit altında olduğu için kaçmak zorunda kalacak, bir sonraki hamlede bedava Vezir kazanacaksın!',
      en: 'Brilliant Fork! The King is in check and forced to run, allowing you to capture the Queen on the next turn!',
    },
    board: [
      [null, null, null, null, null, null, null, 'k'], // h8 Black King
      [null, null, null, 'q', null, null, null, null], // d7 Black Queen
      [null, null, 'N', null, null, null, null, null], // c6 White Knight
      emptyRow(),
      emptyRow(),
      emptyRow(),
      emptyRow(),
      [null, null, null, null, 'K', null, null, null], // e1
    ],
    targetMove: {
      from: [2, 2], // c6
      to: [0, 4],   // e8 / e7
    },
    stars: [
      [1, 4], // e7
    ],
  },
];

