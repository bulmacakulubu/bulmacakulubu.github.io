# Bulmaca Kulübü — Project Memory & Architectural Ledger

> Persistent context ledger maintained by the `claude-mem` protocol to eliminate session amnesia across agent restarts.

---

## 1. Core Architecture & Tech Stack
- **Framework:** React 19 + TypeScript + Vite + Tailwind CSS v4.
- **Design System:** Bauhaus Mono Zinc dark palette (`#09090b` background, `#121215` / `#16161a` cards, `#27272a` borders, `#f4f4f5` text). Strictly compliant with `unslop` and `ui-ux-pro-max` (no purple gradients, no emojis on badges, quiet chrome).
- **Data & Storage:** 100% authentic browser `localStorage` (`bulmaca_kulubu_stats_v1`, `bulmaca_kulubu_device_visits_v1`); zero simulated telemetry, zero fake bots.
- **Multiplayer Engine:** PeerJS (WebRTC) P2P room architecture with friendly 6-digit room codes (`BK-XXXX`).
- **Audio Engine:** HLS.js live streaming for national radio stations (TRT Radyo 3, TRT FM, Kral FM, CNN Türk Radyo, etc.) + Web Audio API / HTML5 Audio for local user MP3 playlists.

---

## 2. Key Architectural Decisions (`[DECISION]`)
- `2026-11-05`: **[DECISION] Universal Pub/Sub Social Share Modal (`ShareModal.tsx` & `shareService.ts`)**: Built a decoupled global share service supporting WhatsApp, X (Twitter), Telegram, Facebook, LinkedIn, Clipboard copy, and Web Share API.
- `2026-11-05`: **[DECISION] Global Toast Notification System (`GlobalToast.tsx` & `toastService.ts`)**: Migrated all game-specific toast notifications to a unified top-level component mounted at `z-50 top-16` to eliminate header clipping bugs.
- `2026-11-05`: **[DECISION] Segmented Music Player Station**: Completely partitioned live radio streaming stations from user-uploaded MP3 tracks into clean, dedicated tabs with separate persistence.
- `2026-11-06`: **[DECISION] 100% Genuine Records (Zero Mock Data)**: Removed all simulated bot players ("Eleanor Vance", "Jurnin V.") from Günün Bulmacası and LeaderboardModal. Removed fake visitor counters (1.766, 387k) from SettingsModal; replaced exclusively with authentic local device records (`userVisitCount`, `totalPlayed`, `totalWon`).
- `2026-11-07`: **[DECISION] GEO & Technical SEO Integration**: Added official `/llms.txt`, `/sitemap.xml`, AI crawler permissions in `/robots.txt` (GPTBot, PerplexityBot, ClaudeBot), and Schema.org JSON-LD structured data for Google rich snippets.

---

## 3. Critical Bug Resolutions (`[BUGFIX]`)
- `2026-11-05`: **[BUGFIX] Toast Header Clipping**: Game hints and error toasts were positioned at `-top-3` relative to game containers, slipping beneath the fixed header bar. Solved by mounting `GlobalToast.tsx` at the root application layer.
- `2026-11-05`: **[BUGFIX] AdSense AdBreak Hang on Adblockers**: When users had adblockers enabled, `adBreak` promises never resolved, locking game hints. Solved by implementing an automatic 1.8-second fallback timeout in `adSenseService.ts`.
- `2026-11-05`: **[BUGFIX] Gameplay Hover Card Viewport Sagging**: In `Sidebar.tsx`, the game info cards sagged below the screen under the bottom Google AdSense banner. Solved with dynamic viewport height clamping (`safeBottomLimit = innerHeight - bannerHeight - 16`).
- `2026-11-05`: **[BUGFIX] Audio Stream Fallbacks**: Fixed non-working stream URLs for TRT Radyo 3, TRT FM, TRT Radyo 1, TRT Türkü, Kral FM, and Voyage using verified live HLS/AAC streams.

---

## 4. User Preferences & Operating Guardrails (`[PREFERENCE]`)
- **Code Guard Rule:** Every change must adhere to the 5-step engineering protocol (Root Cause -> Blast Radius -> Surgical Edit -> Backward Compatibility -> Build Verification).
- **No Friction / No Permission Prompts:** Prioritize Antigravity native file tools (`read_file`, `edit_file`, `write_file`) over terminal shell commands (`run_command`) to avoid triggering manual IDE confirmation dialogs.
- **Data Integrity:** Sitede varsayılan olarak gerçekte olmayan veya yapay hiçbir veri bulunamaz. Her istatistik ve derece kullanıcının gerçek eylemlerinden beslenmelidir.
