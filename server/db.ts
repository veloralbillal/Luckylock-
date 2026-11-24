import fs from "fs";
import path from "path";
import { createSeedDistrictAgents } from "./agentsSeed";
import { computeDrawSeedHash, generateId, generateOtpSecret, hashPassword } from "./security";
import {
  createDefaultReferralState,
  ensureReferralState,
  ensureUserReferralFields,
} from "./services/referralService";
import { createDefaultSecurityRoom, DEFAULT_SECURITY_POLICY } from "./services/securityRoomService";
import type {
  InstalledPlugin,
  LotteryDatabase,
  PaymentGatewayConfig,
  PublicUser,
  ServerClusterConfig,
  ShopItem,
  SiteSettings,
  User,
} from "./types";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "lottery_db.json");
const DB_BACKUP_FILE = path.join(DATA_DIR, "lottery_db.backup.json");

export function buildSvgAvatar(nameOrUsername: string, accentIndex = 0): string {
  const palettes = [
    ["#065F46", "#10B981"],
    ["#1E3A8A", "#3B82F6"],
    ["#7C2D12", "#F59E0B"],
    ["#581C87", "#A855F7"],
    ["#881337", "#F43F5E"],
    ["#0F172A", "#14B8A6"],
  ];
  const clean = (nameOrUsername || "LW").trim();
  let hash = Math.abs(accentIndex);
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  const [bg1, bg2] = palettes[hash % palettes.length];
  const words = clean.split(/[\s_.-]+/).filter(Boolean);
  const initials =
    words.length >= 2
      ? `${words[0][0]}${words[1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><circle cx="60" cy="44" r="18" fill="rgba(255,255,255,0.2)"/><path d="M26 106c6-20 20-30 34-30s28 10 34 30" fill="rgba(255,255,255,0.18)"/><text x="60" y="70" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="700" fill="#ffffff" letter-spacing="1">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createSeedDatabase(): LotteryDatabase {
  const now = Date.now();
  const isoNow = new Date(now).toISOString();
  const hours = (h: number) => new Date(now + h * 3600 * 1000).toISOString();
  const pastHours = (h: number) => new Date(now - h * 3600 * 1000).toISOString();

  const adminId = "u_admin_01";
  const modId = "u_mod_01";
  const player1Id = "u_player_arif";
  const player2Id = "u_player_nusrat";
  const player3Id = "u_player_tanvir";

  const users: User[] = [
    {
      id: adminId,
      username: "Admin",
      fullName: "System Administrator",
      email: "admin@lotterywinner.app",
      phone: "01700000001",
      avatarUrl: buildSvgAvatar("System Administrator", 0),
      passwordHash: hashPassword("Admin123"),
      role: "admin",
      status: "active",
      balance: 55000,
      spinCredits: 5,
      totalDeposited: 55000,
      totalWithdrawn: 0,
      winsCount: 0,
      securityPinHash: hashPassword("1234"),
      pinLockEnabled: false,
      createdAt: pastHours(240),
      updatedAt: isoNow,
    },
    {
      id: modId,
      username: "moderator",
      fullName: "Operations Moderator",
      email: "mod@lotterywinner.app",
      phone: "01700000002",
      avatarUrl: buildSvgAvatar("Operations Moderator", 1),
      passwordHash: hashPassword("Mod123"),
      role: "moderator",
      status: "active",
      balance: 5000,
      spinCredits: 2,
      totalDeposited: 5000,
      totalWithdrawn: 0,
      winsCount: 0,
      securityPinHash: null,
      pinLockEnabled: false,
      createdAt: pastHours(200),
      updatedAt: isoNow,
    },
    {
      id: player1Id,
      username: "arif_99",
      fullName: "Arif Rahman",
      email: "player@lotterywinner.app",
      phone: "01711223344",
      avatarUrl: buildSvgAvatar("Arif Rahman", 2),
      passwordHash: hashPassword("Player123"),
      role: "user",
      status: "active",
      balance: 1850,
      spinCredits: 2,
      totalDeposited: 2000,
      totalWithdrawn: 500,
      winsCount: 1,
      securityPinHash: hashPassword("4321"),
      pinLockEnabled: false,
      createdAt: pastHours(160),
      updatedAt: isoNow,
    },
    {
      id: player2Id,
      username: "nusrat_k",
      fullName: "Nusrat Karim",
      email: "nusrat@lotterywinner.app",
      phone: "01822334455",
      avatarUrl: buildSvgAvatar("Nusrat Karim", 4),
      passwordHash: hashPassword("Player123"),
      role: "user",
      status: "active",
      balance: 920,
      spinCredits: 1,
      totalDeposited: 1200,
      totalWithdrawn: 0,
      winsCount: 1,
      securityPinHash: null,
      pinLockEnabled: false,
      createdAt: pastHours(120),
      updatedAt: isoNow,
    },
    {
      id: player3Id,
      username: "tanvir_b",
      fullName: "Tanvir Bashar",
      email: "tanvir@lotterywinner.app",
      phone: "01933445566",
      avatarUrl: buildSvgAvatar("Tanvir Bashar", 5),
      passwordHash: hashPassword("Player123"),
      role: "user",
      status: "active",
      balance: 650,
      spinCredits: 1,
      totalDeposited: 800,
      totalWithdrawn: 0,
      winsCount: 1,
      securityPinHash: null,
      pinLockEnabled: false,
      createdAt: pastHours(110),
      updatedAt: isoNow,
    },
  ];

  const categories = [
    {
      id: "c1",
      name: "10 Taka Banner",
      label: "10 Taka Single",
      type: "single" as const,
      defaultPrizes: "850",
      defaultEntryFee: 10,
      defaultParticipants: 100,
      description: "Single winner takes the entire grand prize pool.",
      prizeTiers: [{ rankPosition: 1, title: "Grand Prize", winnersCount: 1, amount: 850 }],
    },
    {
      id: "c2",
      name: "20 Taka Banner",
      label: "20 Taka Single",
      type: "single" as const,
      defaultPrizes: "3200",
      defaultEntryFee: 20,
      defaultParticipants: 200,
      description: "High-yield single grand winner pool.",
      prizeTiers: [{ rankPosition: 1, title: "Grand Winner", winnersCount: 1, amount: 3200 }],
    },
    {
      id: "c3",
      name: "Mega Jackpot",
      label: "Mega Jackpot",
      type: "single" as const,
      defaultPrizes: "25000",
      defaultEntryFee: 100,
      defaultParticipants: 300,
      description: "Flagship single-winner mega jackpot draw.",
      prizeTiers: [{ rankPosition: 1, title: "Mega Jackpot Winner", winnersCount: 1, amount: 25000 }],
    },
    {
      id: "c4",
      name: "3 Winner Category",
      label: "3 Winners Cup",
      type: "multi" as const,
      defaultPrizes: "1500, 1000, 500",
      defaultEntryFee: 50,
      defaultParticipants: 80,
      description: "Multi-winner podium split across 1st, 2nd, and 3rd ranks.",
      prizeTiers: [
        { rankPosition: 1, title: "1st Place Gold", winnersCount: 1, amount: 1500 },
        { rankPosition: 2, title: "2nd Place Silver", winnersCount: 1, amount: 1000 },
        { rankPosition: 3, title: "3rd Place Bronze", winnersCount: 1, amount: 500 },
      ],
    },
    {
      id: "c8",
      name: "20-Player Multi Profit",
      label: "20-Player Multi",
      type: "multi" as const,
      defaultPrizes: "1x120, 2x60, 5x20",
      defaultEntryFee: 20,
      defaultParticipants: 20,
      description: "20 participants total — 8 winners share profit across 3 payout tiers.",
      prizeTiers: [
        { rankPosition: 1, title: "1st Rank Profit", winnersCount: 1, amount: 120 },
        { rankPosition: 2, title: "2nd Rank Profit", winnersCount: 2, amount: 60 },
        { rankPosition: 3, title: "3rd Rank Profit", winnersCount: 5, amount: 20 },
      ],
    },
    {
      id: "c5",
      name: "15 Winner Category",
      label: "15 Winners Blitz",
      type: "multi" as const,
      defaultPrizes: "1x1000, 1x600, 1x400, 12x100",
      defaultEntryFee: 50,
      defaultParticipants: 100,
      description: "15 winners rewarded across 4 structured tiers.",
      prizeTiers: [
        { rankPosition: 1, title: "1st Place", winnersCount: 1, amount: 1000 },
        { rankPosition: 2, title: "2nd Place", winnersCount: 1, amount: 600 },
        { rankPosition: 3, title: "3rd Place", winnersCount: 1, amount: 400 },
        { rankPosition: 4, title: "Runner-Up Profit", winnersCount: 12, amount: 100 },
      ],
    },
    {
      id: "c7",
      name: "Quick Draw",
      label: "Quick Draw",
      type: "single" as const,
      defaultPrizes: "850",
      defaultEntryFee: 10,
      defaultParticipants: 100,
      description: "Fast single-winner draw pool.",
      prizeTiers: [{ rankPosition: 1, title: "Quick Draw Winner", winnersCount: 1, amount: 850 }],
    },
  ];

  const lotteries = [
    {
      id: "lot-1",
      name: "10-Taka Fast Cash Daily",
      slug: "10-taka-fast-cash-daily",
      details: "Buy tickets for only 10 Taka and win massive rewards! Grand prize is 850 Taka credited immediately upon draw verification.",
      category: "10 Taka Banner",
      entryFee: 10,
      prizeAmount: 850,
      totalTickets: 20,
      soldTickets: 2,
      drawMode: "auto" as const,
      status: "active" as const,
      startAt: pastHours(6),
      endAt: hours(4),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(6),
      updatedAt: isoNow,
    },
    {
      id: "lot-2",
      name: "20-Taka Golden Super Pool",
      slug: "20-taka-golden-super-pool",
      details: "High-yield 20 Taka lottery pool with transparent random number selection. Single winner claims 3,200 Taka.",
      category: "20 Taka Banner",
      entryFee: 20,
      prizeAmount: 3200,
      totalTickets: 200,
      soldTickets: 118,
      drawMode: "auto" as const,
      status: "active" as const,
      startAt: pastHours(12),
      endAt: hours(8),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(12),
      updatedAt: isoNow,
    },
    {
      id: "lot-3",
      name: "Mega Progressive Jackpot",
      slug: "mega-progressive-jackpot",
      details: "Our flagship 50 Taka Mega Jackpot campaign. Top prize is 25,000 Taka with cryptographic draw audit hash.",
      category: "Mega Jackpot",
      entryFee: 50,
      prizeAmount: 25000,
      totalTickets: 600,
      soldTickets: 314,
      drawMode: "manual" as const,
      status: "active" as const,
      startAt: pastHours(24),
      endAt: hours(24),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(24),
      updatedAt: isoNow,
    },
    {
      id: "lot-4",
      name: "3 Winners Premium Cup",
      slug: "3-winners-premium-cup",
      details: "Three top winners share the 3,000 Taka prize pool: 1st place 1,500 Taka, 2nd place 1,000 Taka, and 3rd place 500 Taka.",
      category: "3 Winner Category",
      entryFee: 30,
      prizeAmount: 3000,
      totalTickets: 150,
      soldTickets: 89,
      drawMode: "auto_datetime" as const,
      status: "active" as const,
      startAt: pastHours(8),
      endAt: hours(12),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(8),
      updatedAt: isoNow,
    },
    {
      id: "lot-5",
      name: "Quick Draw Express Round",
      slug: "quick-draw-express-round",
      details: "Rapid-cycle Quick Draw pool that executes regardless of total sell-through once the scheduled draw window closes.",
      category: "Quick Draw",
      entryFee: 15,
      prizeAmount: 1000,
      totalTickets: 100,
      soldTickets: 28,
      drawMode: "auto" as const,
      status: "active" as const,
      startAt: pastHours(2),
      endAt: hours(2),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: false,
      createdBy: adminId,
      createdAt: pastHours(2),
      updatedAt: isoNow,
    },
    {
      id: "lot-hist-1",
      name: "Evening 20-Taka Classic Draw",
      slug: "evening-20-taka-classic-draw",
      details: "Completed evening classic campaign with verified multi-tier winners and published audit hash.",
      category: "3 Winner Category",
      entryFee: 20,
      prizeAmount: 1500,
      totalTickets: 100,
      soldTickets: 100,
      drawMode: "manual" as const,
      status: "drawn" as const,
      startAt: pastHours(72),
      endAt: pastHours(18),
      drawnAt: pastHours(17),
      resultsPublished: true,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(72),
      updatedAt: pastHours(17),
    },
  ];

  const prizes = [
    { id: "pz_1", lotteryId: "lot-1", rankPosition: 1, title: "Grand Prize", amount: 850, winnersCount: 1 },
    { id: "pz_2", lotteryId: "lot-2", rankPosition: 1, title: "Super Jackpot", amount: 3200, winnersCount: 1 },
    { id: "pz_3", lotteryId: "lot-3", rankPosition: 1, title: "Mega Jackpot", amount: 25000, winnersCount: 1 },
    { id: "pz_4a", lotteryId: "lot-4", rankPosition: 1, title: "1st Place Gold", amount: 1500, winnersCount: 1 },
    { id: "pz_4b", lotteryId: "lot-4", rankPosition: 2, title: "2nd Place Silver", amount: 1000, winnersCount: 1 },
    { id: "pz_4c", lotteryId: "lot-4", rankPosition: 3, title: "3rd Place Bronze", amount: 500, winnersCount: 1 },
    { id: "pz_5", lotteryId: "lot-5", rankPosition: 1, title: "Express Winner", amount: 1000, winnersCount: 1 },
    { id: "pz_h1", lotteryId: "lot-hist-1", rankPosition: 1, title: "1st Prize", amount: 800, winnersCount: 1 },
    { id: "pz_h2", lotteryId: "lot-hist-1", rankPosition: 2, title: "2nd Prize", amount: 450, winnersCount: 1 },
    { id: "pz_h3", lotteryId: "lot-hist-1", rankPosition: 3, title: "3rd Prize", amount: 250, winnersCount: 1 },
  ];

  const purchases = [
    {
      id: "pur_seed_1",
      userId: player1Id,
      username: "arif_99",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      quantity: 2,
      unitPrice: 20,
      totalAmount: 40,
      status: "completed" as const,
      createdAt: pastHours(24),
    },
    {
      id: "pur_seed_2",
      userId: player2Id,
      username: "nusrat_k",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      quantity: 1,
      unitPrice: 20,
      totalAmount: 20,
      status: "completed" as const,
      createdAt: pastHours(23),
    },
    {
      id: "pur_seed_3",
      userId: player1Id,
      username: "arif_99",
      lotteryId: "lot-1",
      lotteryName: "10-Taka Fast Cash Daily",
      quantity: 2,
      unitPrice: 10,
      totalAmount: 20,
      status: "completed" as const,
      createdAt: pastHours(2),
    },
  ];

  const tickets = [
    {
      id: "tkt_seed_1",
      purchaseId: "pur_seed_1",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      userId: player1Id,
      username: "arif_99",
      ticketNumber: "LW-482910",
      entryFee: 20,
      status: "won" as const,
      prizeAmount: 800,
      prizeRank: 1,
      purchasedAt: pastHours(24),
    },
    {
      id: "tkt_seed_2",
      purchaseId: "pur_seed_1",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      userId: player1Id,
      username: "arif_99",
      ticketNumber: "LW-482911",
      entryFee: 20,
      status: "lost" as const,
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: pastHours(24),
    },
    {
      id: "tkt_seed_3",
      purchaseId: "pur_seed_2",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      userId: player2Id,
      username: "nusrat_k",
      ticketNumber: "LW-731542",
      entryFee: 20,
      status: "won" as const,
      prizeAmount: 450,
      prizeRank: 2,
      purchasedAt: pastHours(23),
    },
    {
      id: "tkt_seed_4",
      purchaseId: "pur_seed_3",
      lotteryId: "lot-1",
      lotteryName: "10-Taka Fast Cash Daily",
      userId: player1Id,
      username: "arif_99",
      ticketNumber: "LW-915420",
      slotNumber: 1,
      entryFee: 10,
      status: "pending" as const,
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: pastHours(2),
    },
    {
      id: "tkt_seed_5",
      purchaseId: "pur_seed_3",
      lotteryId: "lot-1",
      lotteryName: "10-Taka Fast Cash Daily",
      userId: player1Id,
      username: "arif_99",
      ticketNumber: "LW-915421",
      slotNumber: 2,
      entryFee: 10,
      status: "pending" as const,
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: pastHours(2),
    },
    {
      id: "tkt_seed_6",
      purchaseId: "pur_seed_2",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      userId: player3Id,
      username: "tanvir_b",
      ticketNumber: "LW-609118",
      entryFee: 20,
      status: "won" as const,
      prizeAmount: 250,
      prizeRank: 3,
      purchasedAt: pastHours(22),
    },
  ];

  const drawTimeHist = pastHours(17);
  const drawSeedHash = computeDrawSeedHash(
    "lot-hist-1",
    ["LW-482910", "LW-482911", "LW-731542", "LW-609118"],
    ["LW-482910", "LW-731542", "LW-609118"],
    drawTimeHist
  );

  const lotteryResults = [
    {
      id: "res_seed_1",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      category: "3 Winner Category",
      drawSeedHash,
      winningNumbers: ["LW-482910", "LW-731542", "LW-609118"],
      totalTicketsEntered: 100,
      totalPayout: 1500,
      isPublished: true,
      drawnBy: adminId,
      drawnAt: drawTimeHist,
    },
  ];

  const winners = [
    {
      id: "win_seed_1",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      resultId: "res_seed_1",
      ticketId: "tkt_seed_1",
      userId: player1Id,
      username: "arif_99",
      winnerFullName: "Arif Rahman",
      winnerAvatar: buildSvgAvatar("Arif Rahman", 2),
      prizeId: "pz_h1",
      rankPosition: 1,
      prizeTitle: "1st Prize",
      prizeAmount: 800,
      ticketNumber: "LW-482910",
      awardedAt: drawTimeHist,
    },
    {
      id: "win_seed_2",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      resultId: "res_seed_1",
      ticketId: "tkt_seed_3",
      userId: player2Id,
      username: "nusrat_k",
      winnerFullName: "Nusrat Karim",
      winnerAvatar: buildSvgAvatar("Nusrat Karim", 4),
      prizeId: "pz_h2",
      rankPosition: 2,
      prizeTitle: "2nd Prize",
      prizeAmount: 450,
      ticketNumber: "LW-731542",
      awardedAt: drawTimeHist,
    },
    {
      id: "win_seed_3",
      lotteryId: "lot-hist-1",
      lotteryName: "Evening 20-Taka Classic Draw",
      resultId: "res_seed_1",
      ticketId: "tkt_seed_6",
      userId: player3Id,
      username: "tanvir_b",
      winnerFullName: "Tanvir Bashar",
      winnerAvatar: buildSvgAvatar("Tanvir Bashar", 5),
      prizeId: "pz_h3",
      rankPosition: 3,
      prizeTitle: "3rd Prize",
      prizeAmount: 250,
      ticketNumber: "LW-609118",
      awardedAt: drawTimeHist,
    },
  ];

  const payments = [
    {
      id: "pay_seed_1",
      userId: player1Id,
      username: "arif_99",
      gateway: "bKash" as const,
      senderNumber: "01711223344",
      trxId: "BKA9X42100P",
      amount: 2000,
      status: "approved" as const,
      verificationNote: "Verified against bKash merchant ledger",
      verifiedBy: adminId,
      verifiedAt: pastHours(48),
      createdAt: pastHours(49),
    },
    {
      id: "pay_seed_2",
      userId: player2Id,
      username: "nusrat_k",
      gateway: "Nagad" as const,
      senderNumber: "01822334455",
      trxId: "NGD7731002A",
      amount: 500,
      status: "pending" as const,
      verificationNote: "Awaiting merchant TrxID verification",
      verifiedBy: null,
      verifiedAt: null,
      createdAt: pastHours(1),
    },
  ];

  const withdrawals = [
    {
      id: "wd_seed_1",
      userId: player1Id,
      username: "arif_99",
      gateway: "bKash" as const,
      targetAccount: "01711223344",
      amount: 500,
      fee: 0,
      totalDebit: 500,
      status: "approved" as const,
      adminNote: "Disbursed via bKash merchant payout",
      processedBy: adminId,
      processedAt: pastHours(10),
      createdAt: pastHours(12),
    },
  ];

  const transactions = [
    {
      id: "txn_seed_1",
      userId: player1Id,
      username: "arif_99",
      direction: "credit" as const,
      category: "deposit" as const,
      amount: 2000,
      balanceAfter: 2000,
      referenceId: "pay_seed_1",
      gateway: "bKash",
      description: "bKash deposit verified (TrxID: BKA9X42100P)",
      createdAt: pastHours(48),
    },
    {
      id: "txn_seed_2",
      userId: player1Id,
      username: "arif_99",
      direction: "debit" as const,
      category: "ticket_purchase" as const,
      amount: 40,
      balanceAfter: 1960,
      referenceId: "pur_seed_1",
      gateway: "Wallet",
      description: "Purchased 2 tickets for Evening 20-Taka Classic Draw",
      createdAt: pastHours(24),
    },
    {
      id: "txn_seed_3",
      userId: player1Id,
      username: "arif_99",
      direction: "credit" as const,
      category: "prize_payout" as const,
      amount: 800,
      balanceAfter: 2760,
      referenceId: "win_seed_1",
      gateway: "Wallet",
      description: "1st Prize payout for ticket LW-482910",
      createdAt: drawTimeHist,
    },
    {
      id: "txn_seed_4",
      userId: player1Id,
      username: "arif_99",
      direction: "debit" as const,
      category: "withdrawal" as const,
      amount: 500,
      balanceAfter: 2260,
      referenceId: "wd_seed_1",
      gateway: "bKash",
      description: "Withdrawal to bKash 01711223344",
      createdAt: pastHours(12),
    },
    {
      id: "txn_seed_5",
      userId: player1Id,
      username: "arif_99",
      direction: "debit" as const,
      category: "ticket_purchase" as const,
      amount: 20,
      balanceAfter: 1850,
      referenceId: "pur_seed_3",
      gateway: "Wallet",
      description: "Purchased 2 tickets for 10-Taka Fast Cash Daily",
      createdAt: pastHours(2),
    },
  ];

  const notifications = [
    {
      id: "notif_seed_1",
      userId: player1Id,
      title: "Prize Credited: 1st Place Winner",
      message: "Your ticket LW-482910 won 800 Taka in Evening 20-Taka Classic Draw. Funds are available in your wallet.",
      type: "win" as const,
      isRead: false,
      createdAt: drawTimeHist,
    },
    {
      id: "notif_seed_2",
      userId: player1Id,
      title: "Withdrawal Completed",
      message: "Your bKash withdrawal of 500 Taka to 01711223344 has been disbursed.",
      type: "success" as const,
      isRead: true,
      createdAt: pastHours(10),
    },
  ];

  const banners = [
    {
      id: "ban_hero_1",
      title: "Mega Progressive Jackpot — 25,000 Taka Grand Prize Pool",
      subtitle: "Verified cryptographic draws with instant wallet settlement and zero-fee bKash & Nagad withdrawals.",
      ctaLabel: "Explore All Lotteries",
      ctaTarget: "#campaigns",
      placement: "hero" as const,
      isActive: true,
      sortOrder: 1,
      createdAt: pastHours(24),
    },
    {
      id: "ban_hero_2",
      title: "10-Taka Fast Cash Daily — Entry Open Now",
      subtitle: "Affordable 10-Taka pools with automatic scheduled draws and instant multi-tier prize distribution.",
      ctaLabel: "Buy 10-Taka Ticket",
      ctaTarget: "#campaigns",
      placement: "hero" as const,
      isActive: true,
      sortOrder: 2,
      createdAt: pastHours(18),
    },
    {
      id: "ban_hero_3",
      title: "20-Taka Golden Super Pool — Audited SHA-256 RNG",
      subtitle: "Every ticket code is verifiable on the public audit ledger with transparent winner histories.",
      ctaLabel: "Verify Any Ticket",
      ctaTarget: "#verify",
      placement: "hero" as const,
      isActive: true,
      sortOrder: 3,
      createdAt: pastHours(12),
    },
    {
      id: "ban_ann_1",
      title: "Live Announcement: bKash, Nagad, Rocket & Upay MFS Verification Active",
      subtitle: "Submit your transaction ID from your wallet to fund your account and join active lottery rounds.",
      ctaLabel: "Browse Lotteries",
      ctaTarget: "#campaigns",
      placement: "announcement" as const,
      isActive: true,
      sortOrder: 4,
      createdAt: pastHours(8),
    },
    {
      id: "ban_ann_2",
      title: "Draw Results Published: Evening 20-Taka Classic Draw Winners Credited",
      subtitle: "Check winning ticket codes and cryptographic draw verification hashes in the Results ledger.",
      ctaLabel: "View Results",
      ctaTarget: "#results",
      placement: "announcement" as const,
      isActive: true,
      sortOrder: 5,
      createdAt: pastHours(4),
    },
  ];

  const settings = {
    siteName: "Lottery Winner",
    siteTagline: "Audited Multi-Tier Lottery & MFS Wallet Platform",
    currencySymbol: "৳",
    mobileAgentBkash: "01799228833",
    mobileAgentNagad: "01855221144",
    mobileAgentRocket: "01688554422",
    mobileAgentUpay: "01922334455",
    bankDetails: "Dutch-Bangla Bank · Account: 105-110-0048291 · Branch: Motijheel",
    cryptoAddress: "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X",
    minDeposit: 50,
    maxDeposit: 500000,
    minWithdrawal: 50,
    maxWithdrawal: 500000,
    withdrawalFeePercent: 0,
    signupBonusEnabled: true,
    signupBonus: 25,
    jackpotPool: 25000,
    maintenanceMode: false,
    maintenanceMessage: "Scheduled system maintenance in progress. Please check back shortly.",
    popupEvent: {
      enabled: true,
      eventTag: "Special Jackpot Event",
      title: "Mega Bonus Week Is Live",
      subtitle: "Verified Multi-Tier Draws · Instant bKash & Nagad Payouts",
      message:
        "Join active lottery draws today for verified SHA-256 results, instant wallet prize settlements, and bonus Lucky Wheel spins on deposits.",
      imageUrl: "",
      ctaLabel: "Explore Active Draws",
      ctaTarget: "#campaigns",
      cancelLabel: "Cancel",
      allowCancel: true,
      showOncePerSession: true,
      delaySeconds: 0,
      startsAt: "",
      endsAt: "",
      theme: "navy_gold" as const,
      updatedAt: new Date().toISOString(),
    },
    checkoutBrand: {
      brandName: "Lottery Winner",
      logoUrl: null,
      accentColor: "#0078E8",
      supportUrl: "https://t.me/lotterywinner_support",
      whatsappNumber: "+8801711000111",
      supportEmail: "support@lotterywinner.app",
      showSupportIcons: true,
      payButtonLabel: "Pay",
      currencyCode: "BDT",
      footerNote: "Secured Instant Checkout",
      updatedAt: new Date().toISOString(),
    },
  };

  const auditLogs = [
    {
      id: generateId("audit"),
      actorId: adminId,
      actorUsername: "Admin",
      action: "DRAW_EXECUTED_AND_PUBLISHED",
      targetType: "lottery",
      targetId: "lot-hist-1",
      details: { totalTickets: 100, totalPayout: 1250, drawSeedHash },
      ipAddress: "127.0.0.1",
      createdAt: drawTimeHist,
    },
  ];

  const chatMessages = [
    {
      id: "chat_seed_1",
      userId: adminId,
      username: "Admin",
      fullName: "System Administrator",
      role: "admin" as const,
      message: "Welcome to Lottery Winner Community & Support Chat. Ask questions about active draws or MFS deposits here.",
      createdAt: pastHours(12),
    },
    {
      id: "chat_seed_2",
      userId: player1Id,
      username: "arif_99",
      fullName: "Arif Rahman",
      role: "user" as const,
      message: "Just received my 1st Prize payout from the Evening 20-Taka Classic Draw. Withdrawal via bKash was smooth!",
      createdAt: pastHours(6),
    },
    {
      id: "chat_seed_3",
      userId: player2Id,
      username: "nusrat_k",
      fullName: "Nusrat Karim",
      role: "user" as const,
      message: "Good luck to everyone in the Mega Progressive Jackpot round!",
      createdAt: pastHours(2),
    },
  ];

  const shopItems: ShopItem[] = [
    // DIGITAL PRODUCTS — Auto-Sent to Email immediately upon paid checkout
    {
      id: "shop_dig_canva",
      title: "Canva Pro & Brand Kit (1-Year Access)",
      description: "Instant official digital invite & activation guide auto-dispatched directly to your email after payment.",
      price: 299,
      kind: "product",
      category: "digital",
      deliveryMode: "auto_email",
      imageKey: "digital",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Auto Email",
      stock: null,
      autoDeliveryTemplate: "CANVA-PRO-1YR-{{CODE}} · Activation Link: https://portal.access/canva/{{CODE}}",
      isActive: true,
    },
    {
      id: "shop_dig_win11",
      title: "Windows 11 Pro & Office Retail License Key",
      description: "Verified 25-character retail license key and setup PDF sent automatically to your inbox within seconds.",
      price: 450,
      kind: "product",
      category: "digital",
      deliveryMode: "auto_email",
      imageKey: "digital",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Auto Email",
      stock: null,
      autoDeliveryTemplate: "WIN11-PRO-{{CODE}} · Official Retail Activation Key",
      isActive: true,
    },
    {
      id: "shop_spin_1",
      title: "Lucky Wheel Single Spin",
      description: "Credits +1 bonus Lucky Wheel spin to your account immediately and sends digital receipt to your email.",
      price: 15,
      kind: "spin_pack",
      category: "digital",
      deliveryMode: "auto_email",
      imageKey: "spin_single",
      spinsGranted: 1,
      lotteryId: null,
      badgeText: "+1 Spin · Auto",
      stock: null,
      isActive: true,
    },
    {
      id: "shop_spin_5",
      title: "Lucky Wheel 5-Spin Bundle",
      description: "Save 13% and unlock 5 Lucky Wheel spins for instant Taka prize rounds with instant email receipt.",
      price: 65,
      kind: "spin_pack",
      category: "digital",
      deliveryMode: "auto_email",
      imageKey: "spin_bundle",
      spinsGranted: 5,
      lotteryId: null,
      badgeText: "+5 Spins · Auto",
      stock: null,
      isActive: true,
    },
    {
      id: "shop_tkt_fast10",
      title: "10-Taka Fast Cash Instant Ticket",
      description: "Auto-assigns 1 verified ticket entry in 10-Taka Fast Cash Daily and emails your ticket confirmation.",
      price: 10,
      kind: "ticket_entry",
      category: "digital",
      deliveryMode: "auto_email",
      imageKey: "ticket_fast",
      spinsGranted: 0,
      lotteryId: "lot-1",
      badgeText: "Auto Ticket",
      stock: null,
      isActive: true,
    },
    {
      id: "shop_tkt_mega",
      title: "Mega Progressive Jackpot Entry",
      description: "Instant 1-click ticket reservation and issuance for the 25,000 Taka Mega Jackpot + 1 bonus spin.",
      price: 50,
      kind: "ticket_entry",
      category: "digital",
      deliveryMode: "auto_email",
      imageKey: "ticket_mega",
      spinsGranted: 1,
      lotteryId: "lot-3",
      badgeText: "Ticket + 1 Spin",
      stock: null,
      isActive: true,
    },

    // CYBER PACK CATALOG — Carrom Board/Pool, Free Fire, PUBG (User enters email, Admin manually checks & sends)
    {
      id: "shop_cyber_carrom",
      title: "Carrom Board / Carrom Pool Pro Coins & VIP Striker Cyber Pack",
      description: "Includes 500K Carrom Coins + Legend Striker unlock pack. Enter your delivery email & Game ID — Admin verifies and sends manually.",
      price: 220,
      kind: "product",
      category: "cyber_pack",
      deliveryMode: "manual_admin",
      imageKey: "cyber_carrom",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Cyber Pack · Carrom",
      stock: 50,
      requiresGameUid: true,
      isActive: true,
    },
    {
      id: "shop_cyber_ff_1080",
      title: "Free Fire 1,080 Diamonds + Weekly Membership Cyber Pack",
      description: "Official Free Fire UID/Email Cyber Pack bundle with 1,080 Diamonds & Weekly Pass. Provide your email & FF UID for manual Admin delivery.",
      price: 780,
      kind: "product",
      category: "cyber_pack",
      deliveryMode: "manual_admin",
      imageKey: "cyber_freefire",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Cyber Pack · Free Fire",
      stock: 100,
      requiresGameUid: true,
      isActive: true,
    },
    {
      id: "shop_cyber_ff_evo",
      title: "Free Fire Max Booyah Pass & Evo Token Cyber Pack",
      description: "Full season Free Fire Max Booyah Pass + Evo upgrade crate bundle. Enter your email at checkout — Admin fulfills manually.",
      price: 540,
      kind: "product",
      category: "cyber_pack",
      deliveryMode: "manual_admin",
      imageKey: "cyber_freefire",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Cyber Pack · Free Fire",
      stock: 60,
      requiresGameUid: true,
      isActive: true,
    },
    {
      id: "shop_cyber_pubg",
      title: "PUBG Mobile 660 UC + Royale Cyber Pack",
      description: "660 Unknown Cash direct cyber pack top-up. Enter your email & PUBG Player ID — Admin checks and sends manually.",
      price: 850,
      kind: "product",
      category: "cyber_pack",
      deliveryMode: "manual_admin",
      imageKey: "cyber_freefire",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Cyber Pack · PUBG",
      stock: 40,
      requiresGameUid: true,
      isActive: true,
    },

    // PHYSICAL PRODUCTS — Admin manual check & nationwide courier delivery
    {
      id: "shop_phys_headset",
      title: "Obsidian Studio Wireless ANC Headphones",
      description: "Active noise-canceling matte obsidian over-ear headphones with 45-hour battery. Admin verifies address & dispatches via courier.",
      price: 2450,
      kind: "product",
      category: "physical",
      deliveryMode: "manual_admin",
      imageKey: "physical",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Physical · Courier",
      stock: 18,
      requiresShipping: true,
      isActive: true,
    },
    {
      id: "shop_phys_watch",
      title: "Titanium Smart Watch Series X (AMOLED)",
      description: "Brushed titanium frame smartwatch with Bluetooth calling, heart-rate & GPS tracking. Manually checked and shipped by Admin.",
      price: 3200,
      kind: "product",
      category: "physical",
      deliveryMode: "manual_admin",
      imageKey: "physical",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Physical · Courier",
      stock: 12,
      requiresShipping: true,
      isActive: true,
    },
    {
      id: "shop_phys_carrom",
      title: "Tournament Rosewood Carrom Board (32\" Full Set)",
      description: "Full-size handcrafted tournament hardwood carrom board complete with coins, ivory striker, and boric powder. Manual Admin dispatch.",
      price: 2850,
      kind: "product",
      category: "physical",
      deliveryMode: "manual_admin",
      imageKey: "cyber_carrom",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Physical · Board Set",
      stock: 9,
      requiresShipping: true,
      isActive: true,
    },

    // SMM PRODUCTS — Social Media Marketing Services (Admin manual verification & execution)
    {
      id: "shop_smm_yt",
      title: "YouTube 1,000 Real Subscribers & Channel Boost",
      description: "Non-drop organic channel promotion package. Paste your YouTube channel link & email — Admin reviews and starts campaign manually.",
      price: 1150,
      kind: "product",
      category: "smm",
      deliveryMode: "manual_admin",
      imageKey: "smm",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "SMM · YouTube",
      stock: null,
      requiresTargetLink: true,
      isActive: true,
    },
    {
      id: "shop_smm_fb",
      title: "Facebook Page 5,000 Followers & Reach Growth",
      description: "High-retention Facebook Page followers & post reach boost. Provide your Page URL & email for Admin manual processing.",
      price: 650,
      kind: "product",
      category: "smm",
      deliveryMode: "manual_admin",
      imageKey: "smm",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "SMM · Facebook",
      stock: null,
      requiresTargetLink: true,
      isActive: true,
    },
    {
      id: "shop_smm_tiktok",
      title: "TikTok 25K Views + 2K Likes Viral Pack",
      description: "Fast engagement booster for TikTok reels. Submit your video link & email — Admin checks and fulfills manually.",
      price: 380,
      kind: "product",
      category: "smm",
      deliveryMode: "manual_admin",
      imageKey: "smm",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "SMM · TikTok",
      stock: null,
      requiresTargetLink: true,
      isActive: true,
    },

    // ON-DEMAND PRODUCTS — Custom User Requests (Admin manual check & delivery)
    {
      id: "shop_ond_logo",
      title: "On-Demand Custom Brand Logo & Social Banner Kit",
      description: "Bespoke logo design + Facebook/YouTube cover kit tailored to your brief. Enter your email & design instructions — Admin delivers manually.",
      price: 950,
      kind: "product",
      category: "on_demand",
      deliveryMode: "manual_admin",
      imageKey: "digital",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "On-Demand · Custom",
      stock: null,
      requiresCustomBrief: true,
      isActive: true,
    },
    {
      id: "shop_ond_sourcing",
      title: "On-Demand VIP Product Sourcing & Setup Service",
      description: "Request any custom software, game item, or hardware sourcing. Submit your email & full requirement — Admin checks and fulfills manually.",
      price: 1500,
      kind: "product",
      category: "on_demand",
      deliveryMode: "manual_admin",
      imageKey: "physical",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "On-Demand · Concierge",
      stock: null,
      requiresCustomBrief: true,
      isActive: true,
    },
  ];

  ensureUserReferralFields(users);

  return {
    users,
    categories,
    lotteries,
    prizes,
    purchases,
    tickets,
    ticketReservations: [],
    payments,
    withdrawals,
    lotteryResults,
    winners,
    transactions,
    notifications,
    banners,
    settings,
    auditLogs,
    chatMessages,
    follows: [],
    friendRequests: [],
    directMessages: [],
    shopItems,
    shopOrders: [],
    shopCoupons: [],
    wheelSpins: [],
    dailyTaskClaims: [],
    microTasks: [],
    microTaskSubmissions: [],
    agents: createSeedDistrictAgents(buildSvgAvatar),
    videoPromotions: [],
    paymentGateways: createDefaultPaymentGateways(settings),
    plugins: createDefaultPlugins(),
    serverCluster: createDefaultServerCluster(),
    security: createDefaultSecurityRoom(),
    referrals: createDefaultReferralState(),
  };
}

export function createDefaultPaymentGateways(settings: SiteSettings): PaymentGatewayConfig[] {
  const now = new Date().toISOString();
  return [
    {
      id: "gw_bkash",
      code: "bKash",
      name: "bKash",
      category: "local_mfs",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: settings.minDeposit || 50,
      maxAmount: settings.maxDeposit || 100000,
      feePercent: 0,
      accountLabel: "bKash Personal / Agent Number",
      accountValue: settings.mobileAgentBkash || "01711-000111",
      instructions:
        "Send Money / Cash-Out or scan the bKash Bangla QR code (0% Fee via QR). Preferred fast options: City Bank & CellFin Bangla QR.",
      qrImageUrl: null,
      qrPreferred: false,
      qrInstructionsBn:
        "বিকাশ (bKash) অ্যাপ দিয়ে নিচের Bangla QR কোড স্ক্যান করে টাকা পাঠালে কোনো ফী (০% চার্জ) কাটবে না। পেমেন্ট করার পর Sender Number ও Transaction ID (TrxID) সাবমিট করুন। ★ আরও দ্রুত পেমেন্টের জন্য City Bank ও CellFin Bangla QR ব্যবহার করা প্রিফার্ড (Preferred)।",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_bkash_merchant",
      code: "bKashMerchant",
      name: "bKash Merchant",
      category: "local_mfs",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: false,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: settings.minDeposit || 50,
      maxAmount: settings.maxDeposit || 100000,
      feePercent: 0,
      accountLabel: "bKash Merchant Payment Number",
      accountValue: "01711-000112",
      instructions:
        "Make Payment to this bKash Merchant Account Number or scan the bKash Merchant Bangla QR code (0% Fee) and submit your TrxID below.",
      qrImageUrl: null,
      qrPreferred: false,
      qrInstructionsBn:
        "বিকাশ মার্চেন্ট (bKash Merchant Payment · ০% ফী): বিকাশ অ্যাপ থেকে 'Payment' অপশনে গিয়ে নিচের মার্চেন্ট অ্যাকাউন্ট নম্বরে অথবা নিচের Bangla QR কোড স্ক্যান করে পেমেন্ট করলে কোনো ফী (০% চার্জ) কাটবে না। পেমেন্ট শেষে Sender Number ও Transaction ID (TrxID) সাবমিট করুন। ★ City Bank ও CellFin Bangla QR প্রিফার্ড (Preferred)।",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_nagad",
      code: "Nagad",
      name: "Nagad",
      category: "local_mfs",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: settings.minDeposit || 50,
      maxAmount: settings.maxDeposit || 100000,
      feePercent: 0,
      accountLabel: "Nagad Agent Number",
      accountValue: settings.mobileAgentNagad || "01811-000222",
      instructions: "Send Money via Nagad app to the number above and enter your Transaction ID.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_rocket",
      code: "Rocket",
      name: "Rocket",
      category: "local_mfs",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: settings.minDeposit || 50,
      maxAmount: settings.maxDeposit || 100000,
      feePercent: 0,
      accountLabel: "Rocket (DBBL) Number",
      accountValue: settings.mobileAgentRocket || "01911-000333",
      instructions: "Transfer to our DBBL Rocket number and paste your TrxID for fast credit.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_upay",
      code: "Upay",
      name: "Upay",
      category: "local_mfs",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: settings.minDeposit || 50,
      maxAmount: settings.maxDeposit || 100000,
      feePercent: 0,
      accountLabel: "Upay Mobile Wallet",
      accountValue: settings.mobileAgentUpay || "01611-000444",
      instructions: "Complete Upay transfer and enter the transaction reference ID.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_zinipay",
      code: "ZiniPay",
      name: "ZiniPay",
      category: "bd_checkout",
      mode: "auto_api",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: false,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: 50,
      maxAmount: 100000,
      feePercent: 1.5,
      accountLabel: "ZiniPay Instant Checkout",
      accountValue: "ZiniPay Auto MFS (bKash / Nagad / Rocket / Upay)",
      instructions: "Pay instantly via ZiniPay hosted checkout (bKash, Nagad, Rocket, Upay) or enter your ZiniPay Invoice/TrxID.",
      environment: "sandbox",
      apiBaseUrl: "https://api.zinipay.com/v1/payment/create",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_uddoktapay",
      code: "UddoktaPay",
      name: "UddoktaPay",
      category: "bd_checkout",
      mode: "auto_api",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: false,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: 50,
      maxAmount: 100000,
      feePercent: 1.5,
      accountLabel: "UddoktaPay Auto Gateway",
      accountValue: "UddoktaPay Checkout v2 (All BD MFS & Cards)",
      instructions: "Launch instant UddoktaPay checkout to pay with bKash, Nagad, Rocket, Upay, or Visa/Mastercard.",
      environment: "sandbox",
      apiBaseUrl: "https://sandbox.uddoktapay.com/api/checkout-v2",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_paypal",
      code: "PayPal",
      name: "PayPal",
      category: "international",
      mode: "auto_api",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "USD",
      exchangeRate: 120,
      minAmount: 100,
      maxAmount: 250000,
      feePercent: 2.5,
      accountLabel: "PayPal Merchant Email",
      accountValue: "payments@lotterywinner.app",
      instructions: "Pay via PayPal in USD (auto-converted at 1 USD = ৳120) or submit your PayPal Transaction ID.",
      environment: "sandbox",
      apiBaseUrl: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_stripe",
      code: "Stripe",
      name: "Stripe",
      category: "international",
      mode: "auto_api",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: false,
      isBuiltIn: true,
      currency: "USD",
      exchangeRate: 120,
      minAmount: 100,
      maxAmount: 250000,
      feePercent: 2.9,
      accountLabel: "Stripe Global Cards (Visa / Mastercard)",
      accountValue: "Stripe Checkout (USD Auto-Converted to BDT)",
      instructions: "Pay securely with Visa, Mastercard, Apple Pay, or Google Pay through Stripe Checkout.",
      environment: "sandbox",
      apiBaseUrl: "https://api.stripe.com/v1/checkout/sessions",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_bank",
      code: "Bank",
      name: "Bank Transfer",
      category: "bank",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: 500,
      maxAmount: 500000,
      feePercent: 0,
      accountLabel: "Official Bank Account Details",
      accountValue: settings.bankDetails || "Dutch-Bangla Bank · A/C 101-120-884421 (Lottery Winner Trust)",
      instructions: "Deposit via NPSB / BEFTN / EFT to our official bank account and enter your reference number.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_usdt",
      code: "USDT",
      name: "USDT (TRC-20)",
      category: "crypto",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "USDT",
      exchangeRate: 122,
      minAmount: 500,
      maxAmount: 500000,
      feePercent: 0,
      accountLabel: "USDT (TRC-20) Deposit Address",
      accountValue: settings.cryptoAddress || "TX9vLotteryWinnerOfficialTRC20Wallet8891",
      instructions: "Send USDT on TRON (TRC-20) network only and paste the TxID hash.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_islami_bank",
      code: "IslamiBank",
      name: "Islami Bank (IBBL / CellFin)",
      category: "bank",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: 500,
      maxAmount: 500000,
      feePercent: 0,
      accountLabel: "Islami Bank A/C & Branch",
      accountValue: "Islami Bank Bangladesh PLC · A/C 2050-1122-004411 (Motijheel Br.)",
      instructions:
        "Transfer via Islami Bank BEFTN, NPSB, or CellFin app and submit your Transaction/Reference ID below.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_city_bank",
      code: "CityBank",
      name: "City Bank (Citytouch)",
      category: "bank",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: 500,
      maxAmount: 500000,
      feePercent: 0,
      accountLabel: "City Bank A/C & Citytouch (Preferred Bangla QR)",
      accountValue: "The City Bank PLC · A/C 1402-8833-10092 (Gulshan Ave Br.)",
      instructions:
        "Preferred Gateway · 0% Fee: Scan the City Bank Bangla QR from Citytouch or any bank/MFS app — zero fee deducted. Or transfer via NPSB/EFT.",
      qrImageUrl: null,
      qrPreferred: true,
      qrInstructionsBn:
        "★ প্রিফার্ড (Preferred · ০% ফী): সিটি ব্যাংক (Citytouch) বা যেকোনো ব্যাংক/MFS অ্যাপ থেকে নিচের City Bank Bangla QR কোড স্ক্যান করে টাকা পাঠালে কোনো ফী (০% চার্জ) কাটবে না। পেমেন্ট শেষে আপনার অ্যাকাউন্ট নম্বর/নাম এবং Reference/TrxID নিচে সাবমিট করুন।",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_cryptomus",
      code: "Cryptomus",
      name: "Cryptomus",
      category: "crypto",
      mode: "auto_api",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "USDT",
      exchangeRate: 122,
      minAmount: 500,
      maxAmount: 1000000,
      feePercent: 0,
      accountLabel: "Cryptomus Merchant UUID / Multi-Coin",
      accountValue: "Cryptomus Auto Checkout (USDT · BTC · ETH · TON · LTC)",
      instructions:
        "Pay via Cryptomus hosted multi-coin crypto checkout (auto-converted to BDT) or submit your Cryptomus TxID.",
      environment: "sandbox",
      apiBaseUrl: "https://api.cryptomus.com/v1/payment",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_binance_pay",
      code: "BinancePay",
      name: "Binance Pay",
      category: "crypto",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "USDT",
      exchangeRate: 122,
      minAmount: 500,
      maxAmount: 1000000,
      feePercent: 0,
      accountLabel: "Binance Pay Merchant / UID",
      accountValue: "Binance Pay ID: 492817360",
      instructions:
        "Send USDT via Binance Pay (zero network fee) to the Binance Pay ID above and enter your Order/Tx ID.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_cellfin",
      code: "CellFin",
      name: "CellFin (Islami Bank)",
      category: "local_mfs",
      mode: "manual",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: true,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: settings.minDeposit || 50,
      maxAmount: settings.maxDeposit || 100000,
      feePercent: 0,
      accountLabel: "CellFin Wallet & Bangla QR (Preferred)",
      accountValue: "01711-885522",
      instructions:
        "Preferred Gateway · 0% Fee: Scan CellFin Bangla QR or Send Money via Islami Bank CellFin app — zero fee deducted.",
      qrImageUrl: null,
      qrPreferred: true,
      qrInstructionsBn:
        "★ প্রিফার্ড (Preferred · ০% ফী): ইসলামী ব্যাংক CellFin অ্যাপ থেকে নিচের CellFin Bangla QR কোড স্ক্যান করে পেমেন্ট করলে কোনো ফী (০% চার্জ) কাটবে না। টাকা পাঠানোর পর আপনার নম্বর ও Transaction ID (TrxID) সাবমিট করুন।",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gw_sslcommerz",
      code: "SSLCommerz",
      name: "SSLCommerz",
      category: "bd_checkout",
      mode: "auto_api",
      enabled: true,
      supportsDeposit: true,
      supportsWithdrawal: false,
      isBuiltIn: true,
      currency: "BDT",
      exchangeRate: 1,
      minAmount: 50,
      maxAmount: 200000,
      feePercent: 1.8,
      accountLabel: "SSLCommerz Store Checkout",
      accountValue: "All BD Cards, Banks, Bangla QR & MFS",
      instructions:
        "Pay securely with Visa, Mastercard, NexusPay, City Bank, Islami Bank, or MFS via SSLCommerz.",
      environment: "sandbox",
      apiBaseUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createDefaultPlugins(): InstalledPlugin[] {
  const now = new Date().toISOString();
  return [
    {
      id: "plg_deposit_cashback",
      slug: "deposit-cashback-engine",
      name: "Deposit Cashback Bonus Engine",
      version: "1.2.0",
      author: "Core Finance",
      category: "payment",
      hookType: "deposit_bonus",
      description:
        "Automatically credits an extra cashback percentage to a player's wallet whenever Admin approves a qualifying deposit.",
      enabled: false,
      isBuiltIn: true,
      config: {
        bonusPercent: 5,
        minDepositAmount: 500,
        maxBonusCap: 1000,
        label: "Instant Deposit Cashback",
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_floating_support",
      slug: "whatsapp-telegram-support",
      name: "WhatsApp & Telegram Floating Support",
      version: "1.4.0",
      author: "Support Suite",
      category: "chat_support",
      hookType: "floating_support",
      description:
        "Displays a mobile-friendly floating live help button on every user page connecting directly to your WhatsApp or Telegram.",
      enabled: false,
      isBuiltIn: true,
      config: {
        buttonLabel: "Live Help",
        supportUrl: "https://t.me/lotterywinner_support",
        position: "bottom-right",
        accentColor: "#059669",
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_announcement_bar",
      slug: "promo-announcement-bar",
      name: "Global Promo Announcement Bar",
      version: "1.1.0",
      author: "Growth Tools",
      category: "marketing",
      hookType: "announcement_bar",
      description:
        "Shows a dismissible top announcement strip across the consumer site for flash jackpots, deposit bonuses, or maintenance notices.",
      enabled: false,
      isBuiltIn: true,
      config: {
        message: "Instant Deposits Live via bKash, Nagad, ZiniPay, UddoktaPay, PayPal & Stripe!",
        ctaLabel: "Deposit Now",
        ctaPath: "/wallet/deposit",
        theme: "navy-gold",
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_webhook_notifier",
      slug: "realtime-webhook-notifier",
      name: "Webhook Event Notifier",
      version: "1.0.0",
      author: "Integrations",
      category: "analytics",
      hookType: "webhook_notifier",
      description:
        "Dispatches live JSON HTTP POST webhooks to Discord, Slack, Telegram Bot, or your external CRM when deposits are submitted or approved.",
      enabled: false,
      isBuiltIn: true,
      config: {
        notifyOnDeposit: true,
        notifyOnApproval: true,
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_first_deposit_booster",
      slug: "first-deposit-10-booster",
      name: "First-Deposit 10% Welcome Booster",
      version: "1.3.0",
      author: "Lottery Winner Core",
      category: "payment",
      hookType: "deposit_bonus",
      description:
        "Credits an extra +10% welcome cashback bonus (capped at ৳1,000) automatically on approved player deposits of ৳200 or more.",
      enabled: false,
      isBuiltIn: true,
      config: {
        bonusPercent: 10,
        minDepositAmount: 200,
        maxBonusCap: 1000,
        label: "10% Welcome Deposit Booster",
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_mfs_checkout_trust",
      slug: "mfs-global-payment-trust-badge",
      name: "MFS & Global Checkout Trust Badge",
      version: "1.2.0",
      author: "Checkout Suite",
      category: "payment",
      hookType: "payment_addon",
      description:
        "Displays a verified payment trust card on the storefront highlighting instant bKash, Nagad, Rocket, Upay, ZiniPay, UddoktaPay, PayPal & Stripe support.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "Verified Instant Payment Gateways",
      },
      customCss: "",
      customHtml:
        "<div style='font-weight:700;font-size:12px;'>bKash · Nagad · Rocket · Upay · ZiniPay</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Instant MFS, UddoktaPay, PayPal & Stripe deposits & verified payouts.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_live_winner_ticker",
      slug: "live-winner-payout-ticker",
      name: "Live Verified Winners Payout Ticker",
      version: "2.0.0",
      author: "Growth Tools",
      category: "marketing",
      hookType: "custom_widget",
      description:
        "Shows a live rotating social-proof card of real verified lottery winners and credited payouts directly from your draw ledger.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "Recent Verified Winner",
        rotateSeconds: 6,
        liveWinnerFeed: true,
      },
      customCss: "",
      customHtml:
        "<div style='font-weight:700;font-size:12px;'>Live Verified Payouts</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Real-time SHA-256 draw winners credited instantly.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_lucky_wheel_promo_bar",
      slug: "lucky-wheel-rewards-promo-bar",
      name: "Lucky Wheel & Daily Rewards Top Bar",
      version: "1.1.0",
      author: "Retention Suite",
      category: "marketing",
      hookType: "announcement_bar",
      description:
        "Highlights free Lucky Wheel spins, Daily Task coins, and Video Promotion cash rewards in a clean dismissible top strip.",
      enabled: false,
      isBuiltIn: true,
      config: {
        message: "Spin the Lucky Wheel & complete Daily Tasks to earn free wallet bonus credits!",
        ctaLabel: "Open Lucky Wheel",
        ctaPath: "/lucky-wheel",
        theme: "navy-gold",
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_telegram_draw_alerts",
      slug: "telegram-discord-draw-bot",
      name: "Telegram & Discord Draw Result Bot",
      version: "1.5.0",
      author: "Community Automation",
      category: "chat_support",
      hookType: "webhook_notifier",
      description:
        "Automatically pushes completed draw announcements, winning ticket numbers, and SHA-256 hashes to your Telegram channel or Discord webhook.",
      enabled: false,
      isBuiltIn: true,
      config: {
        notifyOnDraw: true,
        notifyOnDeposit: true,
        includeSeedHash: true,
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_fairplay_sha256_seal",
      slug: "sha256-provably-fair-seal",
      name: "SHA-256 Provably Fair & Anti-Fraud Seal",
      version: "1.2.0",
      author: "Security Lab",
      category: "security",
      hookType: "custom_widget",
      description:
        "Displays a cryptographic audit seal confirming Fisher-Yates SHA-256 fair draws and 1-IP-1-Account player protection.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "Provably Fair · SHA-256 Audited",
      },
      customCss: "",
      customHtml:
        "<div style='font-weight:700;font-size:12px;'>Cryptographic Draw Protection</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Every draw seed hash is publicly verifiable &amp; protected against multi-account bots.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_anti_fraud_alert_webhook",
      slug: "security-room-threat-alert-relay",
      name: "Security Room Threat Alert Relay",
      version: "1.0.0",
      author: "Security Lab",
      category: "security",
      hookType: "webhook_notifier",
      description:
        "Relays real-time JSON alerts to your Admin Ops Slack/Discord/Telegram endpoint when Security Room blocks an IP or auto-suspends multi-account abuse.",
      enabled: false,
      isBuiltIn: true,
      config: {
        alertOnMultiAccount: true,
        alertOnIpBlock: true,
        alertOnBruteForce: true,
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_meta_ga4_tracker",
      slug: "ga4-meta-conversion-pixel",
      name: "Google Analytics 4 & Meta Pixel Suite",
      version: "2.2.0",
      author: "Analytics Suite",
      category: "analytics",
      hookType: "analytics_pixel",
      description:
        "Tracks player registrations, ticket purchases, and verified deposits across Google Analytics 4 (GA4) and Meta/Facebook Conversion Pixel.",
      enabled: false,
      isBuiltIn: true,
      config: {
        ga4MeasurementId: "",
        metaPixelId: "",
        trackRegistrations: true,
        trackDeposits: true,
        trackTicketPurchases: true,
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
    {
      id: "plg_agent_network_widget",
      slug: "district-agent-fast-cashin-card",
      name: "64-District Verified Agent Cash-In Widget",
      version: "1.1.0",
      author: "Agent Network",
      category: "ui_widget",
      hookType: "custom_widget",
      description:
        "Shows a quick-access card promoting your 64-district verified local Agent & Sub-Agent network for fast bKash/Nagad Cash-In and Cash-Out.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "64-District Verified Agents",
      },
      customCss: "",
      customHtml:
        "<div style='font-weight:700;font-size:12px;'>Fast Local Agent Cash-In / Cash-Out</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Verified Master Agents &amp; Sub-Agents available across all 64 districts of Bangladesh.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now,
    },
  ];
}

export function createDefaultServerCluster(): ServerClusterConfig {
  const now = new Date().toISOString();
  return {
    loadBalancer: {
      enabled: true,
      strategy: "weighted",
      stickySession: true,
      autoFailover: true,
      healthCheckIntervalSec: 30,
      roundRobinCursor: 0,
    },
    nodes: [
      {
        id: "srv_primary_1",
        name: "Server 1 (Primary — bridge.php / veloralb_lottery)",
        role: "primary",
        hostUrl: "http://127.0.0.1:3000",
        region: "Primary PHP Bridge / cPanel",
        weight: 60,
        enabled: true,
        lastStatus: "online",
        lastLatencyMs: null,
        lastCheckedAt: null,
        lastCheckMessage: "Ready — click Run Live Health Check to verify latency.",
        routedRequests: 0,
      },
      {
        id: "srv_secondary_2",
        name: "Server 2 (Load Balance — Direct MySQL veloralb_shop)",
        role: "secondary",
        hostUrl: "http://127.0.0.1:3000",
        region: "Secondary Direct MySQL / Failover",
        weight: 40,
        enabled: true,
        lastStatus: "standby",
        lastLatencyMs: null,
        lastCheckedAt: null,
        lastCheckMessage: "Direct Load Balance DB configured: veloralb_shop @ localhost:3306 (veloralb_billal).",
        routedRequests: 0,
      },
    ],
    mysql: {
      host: "localhost",
      port: 3306,
      database: "veloralb_shop",
      username: "veloralb_billal",
      password: "Z3[9T*x39URzna",
      sslEnabled: false,
      poolMax: 20,
      lastStatus: "not_configured",
      lastLatencyMs: null,
      lastCheckedAt: null,
      lastMessage: "Direct Load Balancing MySQL configured (veloralb_shop @ localhost:3306). Click Run Live Health Check to verify TCP.",
    },
    php: {
      enabled: true,
      mode: "bridge_api",
      endpointUrl: "",
      bridgeApiKey: "Billal2026@bd",
      bridgeHeaderName: "X-Bridge-Key",
      bridgeDbHost: "localhost",
      bridgeDbName: "veloralb_lottery",
      bridgeDbUser: "veloralb_billal",
      bridgeDbPassword: "Z3[9T*x39URzna",
      bridgeAllowedOrigins: "*",
      bridgeLastHttpCode: null,
      bridgeLastLatencyMs: null,
      manualDbHost: "localhost",
      manualDbPort: 3306,
      manualDbName: "veloralb_shop",
      manualDbUser: "veloralb_billal",
      manualDbPassword: "Z3[9T*x39URzna",
      manualDbLastStatus: "not_configured",
      manualDbLastLatencyMs: null,
      manualDbLastMessage: "Direct Load Balancing MySQL ready: veloralb_shop @ localhost:3306 (User: veloralb_billal). Click Test Manual DB Connection.",
      targetVersion: "8.3",
      fpmPort: 9000,
      lastStatus: "configured",
      detectedVersion: null,
      lastCheckedAt: null,
      lastMessage: "Configured & Ready — Option 1 (bridge.php · X-Bridge-Key · veloralb_lottery) & Option 2 (Direct Load Balance DB · veloralb_shop). Paste your cPanel bridge.php URL and click Send Test Request.",
    },
    updatedAt: now,
  };
}

let memoryDb: LotteryDatabase | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();

function loadDbFromDisk(): LotteryDatabase {
  if (memoryDb) return memoryDb;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE) && !fs.existsSync(DB_BACKUP_FILE)) {
    const seeded = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), "utf8");
    memoryDb = seeded;
    return memoryDb;
  }
  try {
    let raw = "";
    if (fs.existsSync(DB_FILE)) {
      raw = fs.readFileSync(DB_FILE, "utf8");
    } else if (fs.existsSync(DB_BACKUP_FILE)) {
      raw = fs.readFileSync(DB_BACKUP_FILE, "utf8");
    }
    const parsed = JSON.parse(raw) as LotteryDatabase;
    const seeded = createSeedDatabase();
    if (!Array.isArray(parsed.chatMessages)) {
      parsed.chatMessages = [];
    }
    if (!Array.isArray(parsed.follows)) {
      parsed.follows = [];
    }
    if (!Array.isArray(parsed.friendRequests)) {
      parsed.friendRequests = [];
    }
    if (!Array.isArray(parsed.directMessages)) {
      parsed.directMessages = [];
    }
    if (!Array.isArray(parsed.ticketReservations)) {
      parsed.ticketReservations = [];
    }
    if (!Array.isArray(parsed.banners)) {
      parsed.banners = [];
    }
    if (!parsed.banners.some((b) => b.placement === "hero")) {
      const defaults = seeded.banners.filter((b) => b.placement === "hero");
      parsed.banners = [...defaults, ...parsed.banners];
    }
    if (!Array.isArray(parsed.shopItems) || parsed.shopItems.length === 0) {
      parsed.shopItems = seeded.shopItems;
    } else {
      const existingIds = new Set(parsed.shopItems.map((i) => i.id));
      // Upgrade legacy shopItems with category/deliveryMode/imageKey metadata
      const seedById = new Map(seeded.shopItems.map((s) => [s.id, s]));
      parsed.shopItems = parsed.shopItems.map((item) => {
        const seedMatch = seedById.get(item.id);
        return {
          ...seedMatch,
          ...item,
          category: item.category || seedMatch?.category || "digital",
          deliveryMode: item.deliveryMode || seedMatch?.deliveryMode || "auto_email",
          imageKey: item.imageKey || seedMatch?.imageKey,
          isActive: item.isActive ?? true,
        };
      });
      // Additively append newly seeded e-commerce catalog items if missing (only once when legacy 4-item list detected)
      const hasEcommerceCats = parsed.shopItems.some(
        (i) => i.category === "cyber_pack" || i.category === "physical" || i.category === "smm"
      );
      if (!hasEcommerceCats) {
        for (const seedItem of seeded.shopItems) {
          if (!existingIds.has(seedItem.id)) {
            parsed.shopItems.push(seedItem);
          }
        }
      }
    }
    if (!Array.isArray(parsed.shopOrders)) {
      parsed.shopOrders = [];
    }
    if (!Array.isArray(parsed.shopCoupons)) {
      parsed.shopCoupons = [];
    }
    if (!Array.isArray(parsed.wheelSpins)) {
      parsed.wheelSpins = [];
    }
    if (!Array.isArray(parsed.dailyTaskClaims)) {
      parsed.dailyTaskClaims = [];
    }
    if (!Array.isArray(parsed.microTasks)) {
      parsed.microTasks = [];
    }
    if (!Array.isArray(parsed.microTaskSubmissions)) {
      parsed.microTaskSubmissions = [];
    }
    if (!Array.isArray(parsed.agents) || parsed.agents.length < 64) {
      const existingByDistrict = new Map(
        (Array.isArray(parsed.agents) ? parsed.agents : []).map((a) => [a.district.toLowerCase(), a])
      );
      parsed.agents = seeded.agents.map((seedAgent) => {
        const prev = existingByDistrict.get(seedAgent.district.toLowerCase());
        return prev ? { ...seedAgent, ...prev } : seedAgent;
      });
    }
    for (const agent of parsed.agents) {
      if (!agent.tier) agent.tier = "agent";
      if (!agent.status) agent.status = "active";
      if (typeof agent.commissionRate !== "number") {
        agent.commissionRate = agent.tier === "sub_agent" ? 2.5 : 4.5;
      }
    }
    if (!parsed.agents.some((a) => a.tier === "sub_agent")) {
      const masterAgents = parsed.agents.filter((a) => (a.tier || "agent") === "agent");
      const subSeedSpecs = [
        { district: "Dhaka", area: "Mirpur-10, Dhaka", fullName: "Kamrul Hasan", username: "sub_dhaka_mirpur", phone: "01791-224401", cashIn: 84, cashOut: 52, online: true },
        { district: "Dhaka", area: "Uttara Sector-7, Dhaka", fullName: "Sadia Afrin", username: "sub_dhaka_uttara", phone: "01891-335502", cashIn: 67, cashOut: 41, online: true },
        { district: "Chattogram", area: "Agrabad, Chattogram", fullName: "Mizanur Rahman", username: "sub_ctg_agrabad", phone: "01991-446603", cashIn: 73, cashOut: 38, online: true },
        { district: "Sylhet", area: "Zindabazar, Sylhet", fullName: "Faisal Ahmed", username: "sub_sylhet_city", phone: "01792-557704", cashIn: 56, cashOut: 29, online: false },
        { district: "Rajshahi", area: "Shaheb Bazar, Rajshahi", fullName: "Nabil Islam", username: "sub_rajshahi_central", phone: "01691-668805", cashIn: 48, cashOut: 24, online: true },
        { district: "Khulna", area: "Shib Bari, Khulna", fullName: "Tanha Akter", username: "sub_khulna_sadar", phone: "01793-779906", cashIn: 42, cashOut: 21, online: true },
        { district: "Cumilla", area: "Kandirpar, Cumilla", fullName: "Mahfuzur Karim", username: "sub_cumilla_town", phone: "01892-880007", cashIn: 51, cashOut: 27, online: false },
        { district: "Rangpur", area: "Jahaj Company, Rangpur", fullName: "Rashedul Alam", username: "sub_rangpur_hub", phone: "01794-991108", cashIn: 39, cashOut: 19, online: true },
      ];
      subSeedSpecs.forEach((spec, idx) => {
        const parent =
          masterAgents.find((m) => m.district.toLowerCase() === spec.district.toLowerCase()) ||
          masterAgents[0];
        parsed.agents.push({
          id: `sub_agent_${idx + 1}`,
          username: spec.username,
          fullName: spec.fullName,
          avatarUrl: buildSvgAvatar(spec.fullName, idx + 4),
          district: spec.area,
          division: parent?.division || "Dhaka",
          phone: spec.phone,
          channels: ["bKash", "Nagad", idx % 2 === 0 ? "Rocket" : "Upay"],
          totalOrders: spec.cashIn + spec.cashOut,
          cashInOrders: spec.cashIn,
          cashOutOrders: spec.cashOut,
          isOnline: spec.online,
          isVerified: true,
          tier: "sub_agent",
          parentAgentId: parent?.id || null,
          parentAgentName: parent ? `${parent.fullName} (@${parent.username})` : null,
          commissionRate: 2.5,
          status: "active",
          createdAt: new Date(Date.now() - (idx + 2) * 86400 * 1000).toISOString(),
        });
      });
    }
    if (!Array.isArray(parsed.videoPromotions)) {
      parsed.videoPromotions = [];
    }
    if (!Array.isArray(parsed.paymentGateways) || parsed.paymentGateways.length === 0) {
      parsed.paymentGateways = createDefaultPaymentGateways(parsed.settings);
    } else {
      // Remove legacy standalone BanglaQR gateway — Bangla QR now lives inside each gateway (bKash Personal, bKash Merchant, CellFin, City Bank, etc.)
      parsed.paymentGateways = parsed.paymentGateways.filter(
        (g) => g.id !== "gw_bangla_qr" && g.code.toLowerCase() !== "banglaqr"
      );
      const defaults = createDefaultPaymentGateways(parsed.settings);
      for (const defGw of defaults) {
        const existing = parsed.paymentGateways.find(
          (g) => g.code.toLowerCase() === defGw.code.toLowerCase()
        );
        if (!existing) {
          parsed.paymentGateways.push(defGw);
        } else {
          if (existing.qrImageUrl === undefined) existing.qrImageUrl = defGw.qrImageUrl ?? null;
          if (existing.qrPreferred === undefined) existing.qrPreferred = Boolean(defGw.qrPreferred);
          if (!existing.qrInstructionsBn && defGw.qrInstructionsBn) {
            existing.qrInstructionsBn = defGw.qrInstructionsBn;
          }
        }
      }
    }
    if (!Array.isArray(parsed.plugins) || parsed.plugins.length === 0) {
      parsed.plugins = createDefaultPlugins();
    } else {
      const defaultPlugins = createDefaultPlugins();
      for (const defPlg of defaultPlugins) {
        if (
          !parsed.plugins.some(
            (p) => p.id === defPlg.id || p.slug.toLowerCase() === defPlg.slug.toLowerCase()
          )
        ) {
          parsed.plugins.push(defPlg);
        }
      }
    }
    if (!parsed.serverCluster || !Array.isArray(parsed.serverCluster.nodes) || parsed.serverCluster.nodes.length < 2) {
      parsed.serverCluster = createDefaultServerCluster();
    } else {
      const defCluster = createDefaultServerCluster();
      const defPhp = defCluster.php;
      parsed.serverCluster.mysql = {
        ...defCluster.mysql,
        ...(parsed.serverCluster.mysql || {}),
        password: parsed.serverCluster.mysql?.password ?? defCluster.mysql.password,
      };
      parsed.serverCluster.php = {
        ...defPhp,
        ...(parsed.serverCluster.php || {}),
        mode: parsed.serverCluster.php?.mode || "bridge_api",
        bridgeApiKey: parsed.serverCluster.php?.bridgeApiKey || defPhp.bridgeApiKey,
        bridgeHeaderName: parsed.serverCluster.php?.bridgeHeaderName || "X-Bridge-Key",
        bridgeDbHost: parsed.serverCluster.php?.bridgeDbHost || defPhp.bridgeDbHost,
        bridgeDbName: parsed.serverCluster.php?.bridgeDbName || defPhp.bridgeDbName,
        bridgeDbUser: parsed.serverCluster.php?.bridgeDbUser || defPhp.bridgeDbUser,
        bridgeDbPassword: parsed.serverCluster.php?.bridgeDbPassword || defPhp.bridgeDbPassword,
        bridgeAllowedOrigins: parsed.serverCluster.php?.bridgeAllowedOrigins || defPhp.bridgeAllowedOrigins,
        manualDbHost: parsed.serverCluster.php?.manualDbHost || parsed.serverCluster.mysql?.host || "localhost",
        manualDbPort: parsed.serverCluster.php?.manualDbPort || parsed.serverCluster.mysql?.port || 3306,
        manualDbName: parsed.serverCluster.php?.manualDbName || parsed.serverCluster.mysql?.database || "veloralb_shop",
        manualDbUser: parsed.serverCluster.php?.manualDbUser || parsed.serverCluster.mysql?.username || "veloralb_billal",
        manualDbPassword: parsed.serverCluster.php?.manualDbPassword || defPhp.manualDbPassword,
        manualDbLastStatus: parsed.serverCluster.php?.manualDbLastStatus || "not_configured",
        manualDbLastLatencyMs: parsed.serverCluster.php?.manualDbLastLatencyMs ?? null,
        manualDbLastMessage: parsed.serverCluster.php?.manualDbLastMessage || defPhp.manualDbLastMessage,
        lastStatus:
          parsed.serverCluster.php?.lastStatus === "not_installed" || !parsed.serverCluster.php?.lastStatus
            ? "configured"
            : parsed.serverCluster.php.lastStatus,
      };
    }
    if (typeof parsed.settings.videoPromoEnabled !== "boolean") {
      parsed.settings.videoPromoEnabled = true;
    }
    if (typeof parsed.settings.videoPromoDefaultReward !== "number") {
      parsed.settings.videoPromoDefaultReward = 100;
    }
    if (typeof parsed.settings.videoPromoRules !== "string" || !parsed.settings.videoPromoRules.trim()) {
      parsed.settings.videoPromoRules =
        "আমাদের ওয়েবসাইট নিয়ে YouTube, TikTok, Facebook বা Instagram-এ প্রমোশনাল ভিডিও তৈরি করে লিংক সাবমিট করুন। অ্যাডমিন ভিডিও চেক করে আপনার অ্যাকাউন্টে রিওয়ার্ড টাকা যোগ করে দেবেন।";
    }
    if (!parsed.settings.popupEvent || typeof parsed.settings.popupEvent !== "object") {
      parsed.settings.popupEvent = seeded.settings.popupEvent;
    } else {
      parsed.settings.popupEvent = {
        ...seeded.settings.popupEvent,
        ...parsed.settings.popupEvent,
        allowCancel: parsed.settings.popupEvent.allowCancel !== false,
        cancelLabel:
          typeof parsed.settings.popupEvent.cancelLabel === "string" &&
          parsed.settings.popupEvent.cancelLabel.trim()
            ? parsed.settings.popupEvent.cancelLabel
            : "Cancel",
      };
    }
    if (!parsed.security || typeof parsed.security !== "object") {
      parsed.security = createDefaultSecurityRoom();
    } else {
      parsed.security = {
        policy: {
          ...DEFAULT_SECURITY_POLICY,
          ...(parsed.security.policy || {}),
        },
        blockedIps: Array.isArray(parsed.security.blockedIps) ? parsed.security.blockedIps : [],
        events: Array.isArray(parsed.security.events) ? parsed.security.events : [],
        updatedAt: parsed.security.updatedAt || new Date().toISOString(),
      };
    }
    for (let i = 0; i < parsed.users.length; i++) {
      const u = parsed.users[i];
      if (!u.avatarUrl) {
        u.avatarUrl = buildSvgAvatar(u.fullName || u.username, i);
      }
      if (!u.otpSecret) {
        u.otpSecret = generateOtpSecret();
      }
      if (typeof u.spinCredits !== "number") {
        u.spinCredits = 1;
      }
    }
    if (!parsed.users.some((u) => u.id === "u_player_tanvir")) {
      const tanvir = seeded.users.find((u) => u.id === "u_player_tanvir");
      if (tanvir) parsed.users.push(tanvir);
    }
    ensureReferralState(parsed);
    ensureUserReferralFields(parsed.users);
    if (!parsed.winners.some((w) => w.id === "win_seed_3")) {
      const win3 = seeded.winners.find((w) => w.id === "win_seed_3");
      if (win3) parsed.winners.push(win3);
    }
    const fast10 = parsed.lotteries.find((l) => l.id === "lot-1" && l.entryFee === 10);
    if (fast10 && fast10.totalTickets === 120 && fast10.soldTickets === 42) {
      const actualSold = parsed.tickets.filter(
        (t) => t.lotteryId === fast10.id && t.status !== "refunded"
      ).length;
      fast10.totalTickets = 20;
      fast10.soldTickets = actualSold;
    }
    if (!Array.isArray(parsed.categories) || parsed.categories.length === 0) {
      parsed.categories = seeded.categories;
    } else {
      const seedCatById = new Map(seeded.categories.map((c) => [c.id, c]));
      parsed.categories = parsed.categories.map((cat) => {
        const seedMatch = seedCatById.get(cat.id);
        if (Array.isArray(cat.prizeTiers) && cat.prizeTiers.length > 0) {
          return {
            ...cat,
            defaultEntryFee: cat.defaultEntryFee ?? seedMatch?.defaultEntryFee ?? 20,
            defaultParticipants: cat.defaultParticipants ?? seedMatch?.defaultParticipants ?? 20,
          };
        }
        if (seedMatch) {
          return {
            ...cat,
            defaultEntryFee: cat.defaultEntryFee ?? seedMatch.defaultEntryFee,
            defaultParticipants: cat.defaultParticipants ?? seedMatch.defaultParticipants,
            description: cat.description ?? seedMatch.description,
            prizeTiers: seedMatch.prizeTiers,
          };
        }
        const parsedNums = String(cat.defaultPrizes || "500")
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => Number.isFinite(n) && n > 0);
        const tiers =
          parsedNums.length > 0
            ? parsedNums.map((amt, idx) => ({
                rankPosition: idx + 1,
                title: idx === 0 ? "1st Prize" : `Rank #${idx + 1}`,
                winnersCount: 1,
                amount: amt,
              }))
            : [{ rankPosition: 1, title: "Grand Prize", winnersCount: 1, amount: 500 }];
        return {
          ...cat,
          defaultEntryFee: cat.defaultEntryFee ?? 20,
          defaultParticipants: cat.defaultParticipants ?? Math.max(20, tiers.length * 2),
          prizeTiers: tiers,
        };
      });
      if (!parsed.categories.some((c) => c.id === "c8")) {
        const multi20 = seeded.categories.find((c) => c.id === "c8");
        if (multi20) parsed.categories.push(multi20);
      }
    }

    // Ensure a ready-to-use Master Agent login account exists (linked to Dhaka Master District Agent)
    const dhakaMaster =
      parsed.agents.find(
        (a) => (a.tier || "agent") === "agent" && a.district.toLowerCase() === "dhaka"
      ) || parsed.agents.find((a) => (a.tier || "agent") === "agent");
    if (dhakaMaster) {
      let agentUser = parsed.users.find(
        (u) =>
          u.role === "agent" ||
          u.email.toLowerCase() === "agent@lotterywinner.app" ||
          (u.agentId && u.agentId === dhakaMaster.id)
      );
      if (!agentUser) {
        const nowIso = new Date().toISOString();
        agentUser = {
          id: "u_agent_dhaka_01",
          username: dhakaMaster.username || "dhaka_agent",
          fullName: dhakaMaster.fullName || "Dhaka Master Agent",
          email: "agent@lotterywinner.app",
          phone: dhakaMaster.phone || "01711-009900",
          avatarUrl: dhakaMaster.avatarUrl || buildSvgAvatar(dhakaMaster.fullName || "Dhaka Agent", 3),
          passwordHash: hashPassword("Agent123"),
          role: "agent",
          status: "active",
          balance: 25000,
          spinCredits: 0,
          totalDeposited: 25000,
          totalWithdrawn: 0,
          winsCount: 0,
          securityPinHash: null,
          pinLockEnabled: false,
          agentId: dhakaMaster.id,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        parsed.users.push(agentUser);
      } else {
        if (!agentUser.agentId) agentUser.agentId = dhakaMaster.id;
      }
      dhakaMaster.userId = agentUser.id;
      dhakaMaster.loginEmail = agentUser.email;
      if (typeof dhakaMaster.commissionEarned !== "number") {
        dhakaMaster.commissionEarned = 1480;
      }

      // Seed 1 pending Cash-In & 1 pending Cash-Out for the Dhaka Master Agent if none exist yet
      const samplePlayer = parsed.users.find((u) => u.role === "user");
      const hasAgentCashIn = parsed.payments.some((p) => p.agentId === dhakaMaster.id);
      if (samplePlayer && !hasAgentCashIn) {
        parsed.payments.unshift({
          id: "pay_agent_seed_01",
          userId: samplePlayer.id,
          username: samplePlayer.username,
          gateway: "bKash",
          senderNumber: samplePlayer.phone || "01711223344",
          trxId: "BKAG948271",
          amount: 500,
          status: "pending",
          verificationNote: `Submitted via District Agent @${dhakaMaster.username}`,
          verifiedBy: null,
          verifiedAt: null,
          agentId: dhakaMaster.id,
          agentUsername: dhakaMaster.username,
          agentDistrict: dhakaMaster.district,
          createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        });
      }
      const hasAgentCashOut = parsed.withdrawals.some((w) => w.agentId === dhakaMaster.id);
      if (samplePlayer && !hasAgentCashOut) {
        parsed.withdrawals.unshift({
          id: "wd_agent_seed_01",
          userId: samplePlayer.id,
          username: samplePlayer.username,
          gateway: "Nagad",
          targetAccount: samplePlayer.phone || "01711223344",
          amount: 300,
          fee: 0,
          totalDebit: 300,
          status: "pending",
          adminNote: `Cash-Out requested via District Agent @${dhakaMaster.username}`,
          processedBy: null,
          processedAt: null,
          agentId: dhakaMaster.id,
          agentUsername: dhakaMaster.username,
          agentDistrict: dhakaMaster.district,
          createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        });
      }
    }

    if (!parsed.settings.checkoutBrand) {
      parsed.settings.checkoutBrand = {
        brandName: parsed.settings.siteName || "Lottery Winner",
        logoUrl: null,
        accentColor: "#0078E8",
        supportUrl: "https://t.me/lotterywinner_support",
        whatsappNumber: "+8801711000111",
        supportEmail: "support@lotterywinner.app",
        showSupportIcons: true,
        payButtonLabel: "Pay",
        currencyCode: "BDT",
        footerNote: "Secured Instant Checkout",
        updatedAt: new Date().toISOString(),
      };
    } else if (typeof parsed.settings.checkoutBrand.supportEmail !== "string") {
      parsed.settings.checkoutBrand.supportEmail = "support@lotterywinner.app";
    }

    memoryDb = parsed;
    return memoryDb;
  } catch (err) {
    // Preserve corrupt file for diagnostics and attempt backup recovery before ever falling back to seed
    try {
      if (fs.existsSync(DB_FILE)) {
        const corruptCopy = path.join(DATA_DIR, `lottery_db.corrupt.${Date.now()}.json`);
        fs.copyFileSync(DB_FILE, corruptCopy);
      }
      if (fs.existsSync(DB_BACKUP_FILE)) {
        const backupRaw = fs.readFileSync(DB_BACKUP_FILE, "utf8");
        const recovered = JSON.parse(backupRaw) as LotteryDatabase;
        persistDbToDisk(recovered);
        memoryDb = recovered;
        console.warn("[db] Recovered database from lottery_db.backup.json after read error:", err);
        return memoryDb;
      }
    } catch {
      // Fall through to seed only if both primary and backup are unusable
    }
    const seeded = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), "utf8");
    memoryDb = seeded;
    return memoryDb;
  }
}

function persistDbToDisk(db: LotteryDatabase) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const serialized = JSON.stringify(db, null, 2);
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, serialized, "utf8");
  if (fs.existsSync(DB_FILE)) {
    try {
      fs.copyFileSync(DB_FILE, DB_BACKUP_FILE);
    } catch {
      // Non-fatal if backup copy cannot be written
    }
  }
  fs.renameSync(tmpFile, DB_FILE);
}

export function getDbSnapshot(): LotteryDatabase {
  return loadDbFromDisk();
}

export async function withTransaction<T>(fn: (db: LotteryDatabase) => Promise<T> | T): Promise<T> {
  const run = async (): Promise<T> => {
    const db = loadDbFromDisk();
    const cloned = structuredClone(db);
    const result = await fn(cloned);
    persistDbToDisk(cloned);
    memoryDb = cloned;
    return result;
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.catch(() => undefined);
  return next;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth || null,
    chatProfileCompleted: Boolean(user.chatProfileCompleted),
    avatarUrl: user.avatarUrl || buildSvgAvatar(user.fullName || user.username),
    role: user.role,
    status: user.status,
    balance: Number(user.balance) || 0,
    spinCredits: Number(user.spinCredits) || 0,
    totalDeposited: Number(user.totalDeposited) || 0,
    totalWithdrawn: Number(user.totalWithdrawn) || 0,
    winsCount: Number(user.winsCount) || 0,
    pinLockEnabled: Boolean(user.pinLockEnabled),
    registeredIp: user.registeredIp ?? null,
    lastLoginIp: user.lastLoginIp ?? null,
    deviceFingerprint: user.deviceFingerprint ?? null,
    registrationMethod: user.registrationMethod || "standard",
    suspendedReason: user.suspendedReason ?? null,
    suspendedAt: user.suspendedAt ?? null,
    referralCode: user.referralCode || "",
    referredByUsername: user.referredByUsername ?? null,
    referralEarnings: Number(user.referralEarnings) || 0,
    referralCount: Number(user.referralCount) || 0,
    agentId: user.agentId ?? null,
    createdAt: user.createdAt,
  };
}

export function pushAuditLog(
  db: LotteryDatabase,
  actor: { id: string | null; username: string },
  action: string,
  targetType: string,
  targetId: string | null,
  details: Record<string, unknown>,
  ipAddress: string
) {
  db.auditLogs.unshift({
    id: generateId("audit"),
    actorId: actor.id,
    actorUsername: actor.username,
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    createdAt: new Date().toISOString(),
  });
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
}
