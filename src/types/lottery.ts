export type UserRole = "user" | "agent" | "sub_agent" | "moderator" | "admin";
export type UserStatus = "active" | "blocked";

export interface PublicUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  chatProfileCompleted: boolean;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  spinCredits: number;
  totalDeposited: number;
  totalWithdrawn: number;
  winsCount: number;
  pinLockEnabled: boolean;
  registeredIp?: string | null;
  lastLoginIp?: string | null;
  deviceFingerprint?: string | null;
  registrationMethod?: "one_click" | "standard";
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  referralCode?: string;
  referredByUsername?: string | null;
  referralEarnings?: number;
  referralCount?: number;
  agentId?: string | null;
  createdAt: string;
}

export interface CategoryPrizeRule {
  rankPosition: number;
  title: string;
  winnersCount: number;
  amount: number;
}

export interface LotteryCategory {
  id: string;
  name: string;
  label: string;
  type: "single" | "multi" | "syndicate";
  defaultPrizes: string;
  defaultEntryFee?: number;
  defaultParticipants?: number;
  prizeTiers?: CategoryPrizeRule[];
  description?: string;
}

export interface PrizeTier {
  id: string;
  lotteryId: string;
  rankPosition: number;
  title: string;
  amount: number;
  winnersCount: number;
}

export type LotteryStatus = "scheduled" | "active" | "closed" | "drawn" | "refunded" | "paused";
export type DrawMode = "auto" | "auto_datetime" | "manual";

export interface LotteryCampaign {
  id: string;
  name: string;
  slug: string;
  details: string;
  category: string;
  categoryId?: string | null;
  categoryType?: "single" | "multi" | "syndicate";
  entryFee: number;
  prizeAmount: number;
  totalTickets: number;
  soldTickets: number;
  drawMode: DrawMode;
  status: LotteryStatus;
  startAt: string;
  endAt: string;
  drawnAt: string | null;
  resultsPublished: boolean;
  autoRefundIncomplete: boolean;
  prizes?: PrizeTier[];
}

export interface TicketRecord {
  id: string;
  purchaseId: string;
  lotteryId: string;
  lotteryName: string;
  userId: string;
  username: string;
  ticketNumber: string;
  slotNumber?: number;
  entryFee: number;
  status: "pending" | "won" | "lost" | "refunded";
  prizeAmount: number;
  prizeRank: number | null;
  purchasedAt: string;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  username: string;
  lotteryId: string;
  lotteryName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: "completed" | "refunded";
  createdAt: string;
}

export type PaymentGateway = string;

export type PaymentGatewayCategory =
  | "local_mfs"
  | "bd_checkout"
  | "international"
  | "bank"
  | "crypto"
  | "custom";

export type PaymentGatewayMode = "manual" | "auto_api";

export interface PublicPaymentGateway {
  id: string;
  code: string;
  name: string;
  category: PaymentGatewayCategory;
  mode: PaymentGatewayMode;
  enabled: boolean;
  supportsDeposit: boolean;
  supportsWithdrawal: boolean;
  currency: string;
  exchangeRate: number;
  minAmount: number;
  maxAmount: number;
  feePercent: number;
  accountLabel: string;
  accountValue: string;
  instructions: string;
  qrImageUrl?: string | null;
  qrPreferred?: boolean;
  qrInstructionsBn?: string;
  environment: "sandbox" | "live";
  hasApiConfigured: boolean;
}

export interface AdminPaymentGateway extends PublicPaymentGateway {
  isBuiltIn: boolean;
  apiBaseUrl: string;
  apiKeyHint: string;
  hasApiSecret: boolean;
  hasWebhookSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PluginCategory =
  | "payment"
  | "marketing"
  | "chat_support"
  | "analytics"
  | "security"
  | "ui_widget"
  | "custom";

export type PluginHookType =
  | "announcement_bar"
  | "floating_support"
  | "deposit_bonus"
  | "analytics_pixel"
  | "webhook_notifier"
  | "custom_widget"
  | "payment_addon";

export interface InstalledPlugin {
  id: string;
  slug: string;
  name: string;
  version: string;
  author: string;
  category: PluginCategory;
  hookType: PluginHookType;
  description: string;
  enabled: boolean;
  isBuiltIn: boolean;
  config: Record<string, string | number | boolean>;
  customCss: string;
  customHtml: string;
  webhookUrl: string;
  executionsCount: number;
  lastTriggeredAt: string | null;
  sourceType?: "native" | "zip_package" | "wordpress_zip";
  pluginUri?: string;
  packageFiles?: string[];
  linkedGatewayCode?: string | null;
  compatibilityNote?: string;
  installedAt: string;
  updatedAt: string;
}

export interface PublicPlugin {
  id: string;
  slug: string;
  name: string;
  version: string;
  category: PluginCategory;
  hookType: PluginHookType;
  config: Record<string, string | number | boolean>;
  customCss: string;
  customHtml: string;
}

export type AgentPaymentGatewayKey =
  | "bKash"
  | "Nagad"
  | "Rocket"
  | "Upay"
  | "TapTap"
  | "Bank";

export interface AgentGatewayConfig {
  enabled: boolean;
  number: string;
  accountType?: string;
  instructions?: string;
}

export type AgentPaymentGateways = Partial<
  Record<AgentPaymentGatewayKey, AgentGatewayConfig>
>;

export interface DistrictAgent {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  district: string;
  division: string;
  phone: string;
  channels: string[];
  paymentGateways?: AgentPaymentGateways;
  totalOrders: number;
  cashInOrders: number;
  cashOutOrders: number;
  isOnline: boolean;
  isVerified: boolean;
  tier?: "agent" | "sub_agent";
  parentAgentId?: string | null;
  parentAgentName?: string | null;
  commissionRate?: number;
  commissionEarned?: number;
  userId?: string | null;
  loginEmail?: string | null;
  status?: "active" | "suspended";
  createdAt?: string;
}

export interface AgentInboxThread {
  conversationKey: string;
  playerId: string;
  playerUsername: string;
  playerFullName: string;
  playerAvatarUrl: string;
  lastMessage: string;
  lastMessageAt: string;
  totalMessages: number;
  unreadCount: number;
  messages: Array<{
    id: string;
    senderId: string;
    senderType: "user" | "agent";
    senderUsername: string;
    senderFullName: string;
    message: string;
    createdAt: string;
  }>;
}

export interface AgentPlayerLookupResult {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  balance: number;
  status: UserStatus;
}

export interface AgentHistoryItem {
  id: string;
  type: "cash_in" | "cash_out" | "direct_transfer" | "commission";
  direction: "credit" | "debit";
  title: string;
  playerUsername: string | null;
  gateway: string | null;
  reference: string | null;
  amount: number;
  status: string;
  note: string;
  otpVerified?: boolean;
  createdAt: string;
}

export interface AgentPortalOverviewResponse {
  success: boolean;
  user: PublicUser;
  agent: DistrictAgent;
  settings: {
    siteName: string;
    currencySymbol: string;
  };
  stats: {
    floatBalance: number;
    pendingCashIn: number;
    approvedCashInCount: number;
    totalCashInVolume: number;
    pendingCashOut: number;
    approvedCashOutCount: number;
    totalCashOutVolume: number;
    totalCommissionEarned: number;
    commissionRate: number;
    subAgentsCount: number;
    unreadMessagesCount: number;
    totalOrders: number;
    pendingShopOrders?: number;
  };
  cashInRequests: PaymentRecord[];
  cashOutRequests: WithdrawalRecord[];
  subAgents: DistrictAgent[];
  inboxThreads: AgentInboxThread[];
  ledger: TransactionRecord[];
  history: AgentHistoryItem[];
}

export interface AgentsDirectoryResponse {
  districts: string[];
  agents: DistrictAgent[];
}

export interface PaymentRecord {
  id: string;
  userId: string;
  username: string;
  gateway: PaymentGateway;
  senderNumber: string;
  trxId: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "refunded";
  verificationNote: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  reservedLotteryId?: string | null;
  reservedSlots?: number[];
  agentId?: string | null;
  agentUsername?: string | null;
  agentDistrict?: string | null;
  createdAt: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  username: string;
  gateway: PaymentGateway;
  targetAccount: string;
  amount: number;
  fee: number;
  totalDebit: number;
  status: "pending" | "approved" | "rejected";
  adminNote: string;
  processedBy: string | null;
  processedAt: string | null;
  agentId?: string | null;
  agentUsername?: string | null;
  agentDistrict?: string | null;
  createdAt: string;
}

export interface LotteryResultRecord {
  id: string;
  lotteryId: string;
  lotteryName: string;
  category: string;
  drawSeedHash: string;
  winningNumbers: string[];
  totalTicketsEntered: number;
  totalPayout: number;
  isPublished: boolean;
  drawnBy: string | null;
  drawnAt: string;
}

export interface WinnerRecord {
  id: string;
  lotteryId: string;
  lotteryName: string;
  resultId: string;
  ticketId: string;
  userId: string;
  username: string;
  winnerFullName?: string;
  winnerAvatar?: string;
  prizeId: string | null;
  rankPosition: number;
  prizeTitle: string;
  prizeAmount: number;
  ticketNumber: string;
  awardedAt: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  username: string;
  direction: "credit" | "debit";
  category:
    | "deposit"
    | "withdrawal"
    | "ticket_purchase"
    | "prize_payout"
    | "refund"
    | "signup_bonus"
    | "admin_adjustment"
    | "shop_purchase"
    | "wheel_reward"
    | "task_reward"
    | "video_promo_reward"
    | "plugin_bonus"
    | "referral_commission"
    | "referral_signup_bonus"
    | "agent_commission"
    | "agent_transfer";
  amount: number;
  balanceAfter: number;
  referenceId: string | null;
  gateway: string | null;
  description: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "win";
  isRead: boolean;
  createdAt: string;
}

export interface BannerRecord {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTarget: string;
  placement: "hero" | "announcement";
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export type PopupEventTheme = "navy_gold" | "emerald" | "crimson";

export interface PopupEventConfig {
  enabled: boolean;
  eventTag: string;
  title: string;
  subtitle: string;
  message: string;
  imageUrl: string;
  ctaLabel: string;
  ctaTarget: string;
  cancelLabel: string;
  allowCancel: boolean;
  showOncePerSession: boolean;
  delaySeconds: number;
  startsAt: string;
  endsAt: string;
  theme: PopupEventTheme;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  currencySymbol: string;
  mobileAgentBkash: string;
  mobileAgentNagad: string;
  mobileAgentRocket: string;
  mobileAgentUpay: string;
  bankDetails: string;
  cryptoAddress: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  withdrawalFeePercent: number;
  signupBonusEnabled: boolean;
  signupBonus: number;
  jackpotPool: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  videoPromoEnabled?: boolean;
  videoPromoDefaultReward?: number;
  videoPromoRules?: string;
  popupEvent?: PopupEventConfig;
  checkoutBrand?: CheckoutBrandConfig;
  securityFlags?: {
    oneClickRegistrationEnabled: boolean;
    requirePrivacyConsent: boolean;
    requireRegisterCaptcha: boolean;
    requireLoginCaptcha: boolean;
    maxAccountsPerIp: number;
  };
  referralFlags?: {
    enabled: boolean;
    signupBonusForReferrer: number;
    signupBonusForInvitee: number;
    depositCommissionPercent: number;
    ticketCommissionPercent: number;
  };
}

export interface CheckoutBrandConfig {
  brandName: string;
  logoUrl: string | null;
  accentColor: string;
  supportUrl: string;
  whatsappNumber: string;
  supportEmail?: string;
  showSupportIcons: boolean;
  payButtonLabel: string;
  currencyCode: string;
  footerNote: string;
  updatedAt?: string;
}

export interface SecurityPolicyConfig {
  oneClickRegistrationEnabled: boolean;
  requirePrivacyConsent: boolean;
  requireRegisterCaptcha: boolean;
  requireLoginCaptcha: boolean;
  maxAccountsPerIp: number;
  autoSuspendMultiAccount: boolean;
  autoBlockIpOnMultiAccount: boolean;
  enforceDeviceFingerprint: boolean;
  blockDisposableEmails: boolean;
  maxFailedLogins: number;
  lockoutMinutes: number;
  registrationCooldownSeconds: number;
}

export interface BlockedIpRecord {
  id: string;
  ip: string;
  reason: string;
  blockedBy: string;
  blockedAt: string;
  expiresAt: string | null;
  hitCount: number;
  lastHitAt: string | null;
}

export interface SecurityEventRecord {
  id: string;
  type:
    | "MULTI_ACCOUNT_AUTO_SUSPEND"
    | "MULTI_ACCOUNT_BLOCKED"
    | "IP_BLOCKED"
    | "IP_UNBLOCKED"
    | "BLOCKED_IP_ATTEMPT"
    | "BRUTE_FORCE_LOCKOUT"
    | "CAPTCHA_FAILED"
    | "DISPOSABLE_EMAIL_BLOCKED"
    | "DEVICE_CLONE_DETECTED"
    | "ONE_CLICK_REGISTERED"
    | "USER_SUSPENDED"
    | "USER_RESTORED";
  severity: "info" | "warning" | "critical";
  ip: string;
  deviceFingerprint?: string | null;
  username?: string | null;
  affectedUsernames?: string[];
  message: string;
  createdAt: string;
}

export interface SecurityRoomState {
  policy: SecurityPolicyConfig;
  blockedIps: BlockedIpRecord[];
  events: SecurityEventRecord[];
  updatedAt: string;
}

export interface AdminSecurityCluster {
  key: string;
  kind: "ip" | "device";
  count: number;
  users: Array<{
    id: string;
    username: string;
    fullName: string;
    status: UserStatus;
    registeredIp: string | null;
    createdAt: string;
    suspendedReason: string | null;
  }>;
}

export interface AdminSecurityRoomResponse {
  security: SecurityRoomState;
  currentAdminIp: string;
  ipClusters: AdminSecurityCluster[];
  deviceClusters: AdminSecurityCluster[];
  suspendedUsers: PublicUser[];
  summary: {
    blockedIpsCount: number;
    suspendedUsersCount: number;
    criticalIncidentsCount: number;
    multiAccountClustersCount: number;
    oneClickUsersCount: number;
    activeShieldsCount: number;
  };
}

export interface AuditLogRecord {
  id: string;
  actorId: string | null;
  actorUsername: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export type CommunityChannel = "general" | "winners" | "agents";

export interface ChatReplyRef {
  id: string;
  username: string;
  fullName: string;
  message: string;
}

export interface ChatMessageRecord {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  channel?: CommunityChannel;
  message: string;
  imageUrl?: string | null;
  replyTo?: ChatReplyRef | null;
  reactions?: Record<string, string[]>;
  isPinned?: boolean;
  editedAt?: string | null;
  createdAt: string;
}

export type SocialTargetType = "user" | "agent";

export interface ChatDirectoryEntry {
  id: string;
  entityType: SocialTargetType;
  username: string;
  fullName: string;
  avatarUrl: string;
  role: UserRole | "agent";
  district?: string | null;
  division?: string | null;
  phone?: string | null;
  totalOrders?: number;
  isOnline: boolean;
  isVerified: boolean;
  followersCount: number;
  isFollowing: boolean;
  friendStatus: "none" | "pending_sent" | "pending_received" | "friends";
  friendRequestId: string | null;
}

export interface FriendRequestRecord {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromFullName: string;
  fromAvatarUrl: string;
  toId: string;
  toType: SocialTargetType;
  toUsername: string;
  toFullName: string;
  toAvatarUrl: string;
  toDistrict?: string | null;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface DirectMessageRecord {
  id: string;
  conversationKey: string;
  senderId: string;
  senderType: SocialTargetType;
  senderUsername: string;
  senderFullName: string;
  senderAvatarUrl: string;
  recipientId: string;
  recipientType: SocialTargetType;
  recipientUsername: string;
  recipientFullName: string;
  recipientAvatarUrl: string;
  recipientDistrict?: string | null;
  message: string;
  adminReadAt?: string | null;
  createdAt: string;
}

export interface DirectThreadSummary {
  conversationKey: string;
  partnerId: string;
  partnerType: SocialTargetType;
  partnerUsername: string;
  partnerFullName: string;
  partnerAvatarUrl: string;
  partnerDistrict?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ChatSocialResponse {
  incomingRequests: FriendRequestRecord[];
  outgoingRequests: FriendRequestRecord[];
  friends: ChatDirectoryEntry[];
  following: ChatDirectoryEntry[];
  followersCount: number;
  followingCount: number;
  threads: DirectThreadSummary[];
  supportAdmin?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  } | null;
}

export interface PublicOverviewResponse {
  settings: SiteSettings;
  banners: BannerRecord[];
  categories: LotteryCategory[];
  lotteries: LotteryCampaign[];
  results: LotteryResultRecord[];
  winners: WinnerRecord[];
  paymentGateways?: PublicPaymentGateway[];
  activePlugins?: PublicPlugin[];
  stats: {
    activeCampaigns: number;
    totalTicketsIssued: number;
    totalWinners: number;
    totalPrizesAwarded: number;
  };
}

export interface UserDashboardResponse {
  user: PublicUser;
  tickets: TicketRecord[];
  purchases: PurchaseRecord[];
  payments: PaymentRecord[];
  withdrawals: WithdrawalRecord[];
  transactions: TransactionRecord[];
  winnings: WinnerRecord[];
  notifications: NotificationRecord[];
}

export interface AdminOverviewResponse {
  stats: {
    totalUsers: number;
    totalTicketsSold: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalTicketRevenue: number;
    totalApprovedDeposits: number;
    totalApprovedWithdrawals: number;
    totalPayouts: number;
    totalWinners: number;
    pendingPayments: number;
    pendingWithdrawals: number;
    totalAgents?: number;
    totalSubAgents?: number;
    onlineAgents?: number;
    pendingVideoPromotions?: number;
    activeGateways?: number;
    activePlugins?: number;
    totalPlugins?: number;
    unreadInboxCount?: number;
    pendingShopOrdersCount?: number;
    pendingShopApprovalCount?: number;
  };
  users: PublicUser[];
  agents?: DistrictAgent[];
  videoPromotions?: VideoPromotionRecord[];
  paymentGateways?: AdminPaymentGateway[];
  plugins?: InstalledPlugin[];
  categories: LotteryCategory[];
  lotteries: LotteryCampaign[];
  tickets: TicketRecord[];
  payments: PaymentRecord[];
  withdrawals: WithdrawalRecord[];
  results: LotteryResultRecord[];
  winners: WinnerRecord[];
  banners: BannerRecord[];
  settings: SiteSettings;
  auditLogs: AuditLogRecord[];
}

export type TicketSlotState = "available" | "selected" | "reserved" | "sold";

export interface CampaignTicketSlot {
  slotNumber: number;
  label: string;
  state: "available" | "reserved" | "sold";
  ticketNumber: string | null;
  reservedByMe: boolean;
  ownedByMe: boolean;
  expiresAt: string | null;
}

export interface CampaignSummaryItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  entryFee: number;
  prizeAmount: number;
  soldTickets: number;
  totalTickets: number;
  status: LotteryStatus;
}

export interface CampaignDetailsResponse {
  lottery: LotteryCampaign;
  prizes: PrizeTier[];
  result: LotteryResultRecord | null;
  winners: WinnerRecord[];
  previousWinners: WinnerRecord[];
  slots: CampaignTicketSlot[];
  myReservation: {
    id: string;
    slotNumbers: number[];
    expiresAt: string;
    serverTotalAmount: number;
  } | null;
  allCampaigns: CampaignSummaryItem[];
  paymentAgents: {
    bKash: string;
    Nagad: string;
    Rocket: string;
    Upay: string;
    minDeposit: number;
  };
}

export type ShopCategory = "digital" | "physical" | "smm" | "cyber_pack" | "on_demand";
export type ShopDeliveryMode = "auto_email" | "manual_admin";
export type ShopPaymentMethod =
  | "wallet"
  | "bKash"
  | "Nagad"
  | "Rocket"
  | "Upay"
  | "TapTap"
  | "Bank"
  | "IslamiBank"
  | "CityBank"
  | "BanglaQR"
  | "Cryptomus"
  | "BinancePay"
  | "CellFin"
  | (string & {});
export type ShopPaymentOwner = "agent_wallet" | "owned_wallet";
export type ShopPaymentStatus = "paid" | "pending_verification" | "rejected";
export type ShopFulfillmentStatus =
  | "auto_delivered"
  | "pending_admin"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "partial"
  | "delivered"
  | "cancelled";

export type ShopDeliveryChannel = "email" | "shop_inbox" | "notification";

export interface ShopSellerPaymentGateway {
  gateway: "bKash" | "Nagad" | "Rocket" | "Upay" | "TapTap" | "Bank";
  accountNumber: string;
  accountType: string;
  instructions: string;
}

export interface ShopEmailDispatchRecord {
  id: string;
  orderId: string;
  toEmail: string;
  subject: string;
  body: string;
  attachmentName?: string | null;
  downloadUrl?: string | null;
  sentAt: string;
}

export interface ShopInboxMessage {
  id: string;
  orderId: string | null;
  userId: string;
  username: string;
  senderRole: "admin" | "user" | "system";
  senderName: string;
  subject: string;
  message: string;
  channels: ShopDeliveryChannel[];
  attachmentName?: string | null;
  downloadUrl?: string | null;
  createdAt: string;
}

export type ShopProductApprovalStatus = "approved" | "pending_approval" | "rejected";

export interface PublicShopCoupon {
  id: string;
  code: string;
  title?: string | null;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount: number;
  appliesToAllProducts: boolean;
  applicableProductIds: string[];
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  createdByRole?: UserRole | null;
  createdByUsername?: string | null;
}

export interface ShopCouponRecord extends PublicShopCoupon {
  isActive: boolean;
  createdByUserId: string;
  agentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShopCouponsManagementResponse {
  success: boolean;
  currencySymbol: string;
  coupons: ShopCouponRecord[];
  products: Array<{
    id: string;
    title: string;
    price: number;
    category?: ShopCategory;
    imageKey?: string;
    customImageUrl?: string | null;
    isActive?: boolean;
    approvalStatus?: ShopProductApprovalStatus;
    submittedByUsername?: string | null;
    submittedByRole?: UserRole | null;
  }>;
  summary: {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
    scheduledCoupons: number;
    totalRedemptions: number;
  };
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  price: number;
  kind: "spin_pack" | "ticket_entry" | "product";
  category?: ShopCategory;
  deliveryMode?: ShopDeliveryMode;
  imageKey?: string;
  customImageUrl?: string | null;
  spinsGranted: number;
  lotteryId: string | null;
  badgeText: string;
  stock?: number | null;
  autoDeliveryTemplate?: string | null;
  digitalFileName?: string | null;
  digitalFileMime?: string | null;
  digitalFileSize?: number | null;
  digitalDownloadUrl?: string | null;
  requiresShipping?: boolean;
  requiresTargetLink?: boolean;
  requiresGameUid?: boolean;
  requiresCustomBrief?: boolean;
  isActive?: boolean;
  approvalStatus?: ShopProductApprovalStatus;
  submittedByUserId?: string | null;
  submittedByUsername?: string | null;
  submittedByFullName?: string | null;
  submittedByRole?: UserRole | null;
  agentId?: string | null;
  agentDistrict?: string | null;
  sellerPaymentGateways?: ShopSellerPaymentGateway[];
  sellerAgentOnline?: boolean;
  sellerNotes?: string | null;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  couponCode?: string | null;
  couponDiscountType?: "percent" | "fixed";
  couponDiscountValue?: number;
  couponMinOrder?: number;
  couponActive?: boolean;
  activeCoupons?: PublicShopCoupon[];
  submittedAt?: string | null;
  updatedAt?: string | null;
}

export interface ShopOrderRecord {
  id: string;
  userId: string;
  username: string;
  itemId: string;
  itemTitle: string;
  quantity?: number;
  category?: ShopCategory;
  deliveryMode?: ShopDeliveryMode;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  couponCode?: string | null;
  rewardSummary: string;
  paymentMethod?: ShopPaymentMethod;
  paymentOwner?: ShopPaymentOwner;
  paymentTargetLabel?: string | null;
  paymentStatus?: ShopPaymentStatus;
  senderNumber?: string | null;
  trxId?: string | null;
  fulfillmentStatus?: ShopFulfillmentStatus;
  customerEmail?: string | null;
  customerPhone?: string | null;
  shippingAddress?: string | null;
  targetLink?: string | null;
  gameUid?: string | null;
  customNote?: string | null;
  deliveredContent?: string | null;
  digitalFileName?: string | null;
  digitalFileSize?: number | null;
  hasDigitalFile?: boolean;
  downloadUrl?: string | null;
  emailSent?: boolean;
  emailSentAt?: string | null;
  emailHistory?: ShopEmailDispatchRecord[];
  channelsDispatched?: ShopDeliveryChannel[];
  adminNote?: string | null;
  sellerUserId?: string | null;
  sellerUsername?: string | null;
  sellerRole?: UserRole | null;
  agentId?: string | null;
  agentDistrict?: string | null;
  processedBy?: string | null;
  updatedAt?: string | null;
  createdAt: string;
}

export interface WheelSegmentConfig {
  index: number;
  label: string;
  rewardAmount: number;
  rewardSpins: number;
  color: string;
}

export interface WheelSpinRecord {
  id: string;
  userId: string;
  username: string;
  segmentIndex: number;
  segmentLabel: string;
  rewardAmount: number;
  rewardSpins: number;
  spinType: "daily_free" | "spin_credit";
  createdAt: string;
}

export interface DailyTaskItem {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  rewardSpins: number;
  eligible: boolean;
  claimedToday: boolean;
  progressLabel: string;
}

export interface RewardsOverviewResponse {
  shopItems: ShopItem[];
  wheelSegments: WheelSegmentConfig[];
  dailyTasks: DailyTaskItem[];
  canUseFreeDailySpin: boolean;
  nextFreeSpinAt: string | null;
  spinCredits: number;
  recentOrders: ShopOrderRecord[];
  recentSpins: WheelSpinRecord[];
}

export interface ShopWalletBalanceResponse {
  success: boolean;
  authenticated: boolean;
  balance: number | null;
  currencySymbol: string;
}

export interface ShopCatalogResponse {
  success: boolean;
  siteName: string;
  currencySymbol: string;
  checkoutBrand?: CheckoutBrandConfig;
  products: ShopItem[];
  coupons?: PublicShopCoupon[];
  paymentGateways: PublicPaymentGateway[];
}

export interface ShopProductDetailResponse {
  success: boolean;
  siteName: string;
  currencySymbol: string;
  checkoutBrand?: CheckoutBrandConfig;
  product: ShopItem;
  relatedProducts: ShopItem[];
  paymentGateways: PublicPaymentGateway[];
}

export interface ShopCheckoutItemInput {
  itemId: string;
  quantity: number;
}

export interface ShopCouponValidationResponse {
  success: boolean;
  valid: boolean;
  couponCode: string;
  subtotal: number;
  discountTotal: number;
  finalTotal: number;
  appliedItemIds: string[];
  message: string;
}

export interface ShopCheckoutResponse {
  success: boolean;
  message: string;
  orderId: string;
  subtotalAmount?: number;
  discountAmount?: number;
  couponCode?: string | null;
  totalAmount: number;
  itemsCount: number;
  paymentMethod: ShopPaymentMethod;
  paymentOwner?: ShopPaymentOwner;
  paymentStatus: ShopPaymentStatus;
  rewardSummaries: string[];
  orders: ShopOrderRecord[];
  walletBalance: number;
  user: PublicUser;
}

export interface AdminShopOverviewResponse {
  success: boolean;
  currencySymbol: string;
  summary: {
    totalOrders: number;
    pendingAdminCount: number;
    pendingPaymentCount: number;
    autoDeliveredCount: number;
    deliveredCount: number;
    totalRevenue: number;
    productsCount: number;
    pendingApprovalCount?: number;
  };
  orders: ShopOrderRecord[];
  products: ShopItem[];
  inboxMessages?: ShopInboxMessage[];
}

export interface AgentShopProductsResponse {
  success: boolean;
  currencySymbol: string;
  summary: {
    totalCatalog: number;
    myTotal: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    pendingOrders?: number;
  };
  products: ShopItem[];
  orders: ShopOrderRecord[];
}

export type SmtpEmailTrigger =
  | "digital_product_sent"
  | "physical_order_confirmation"
  | "physical_order_update"
  | "on_demand_confirmation"
  | "cyber_pack_sent"
  | "admin_order_update"
  | "test_email";

export interface PublicSmtpConfig {
  enabled: boolean;
  providerPreset: "custom" | "gmail" | "brevo" | "zoho" | "cpanel";
  host: string;
  port: number;
  secure: boolean;
  username: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  triggers: {
    digitalProductSent: boolean;
    physicalOrderConfirmation: boolean;
    onDemandConfirmation: boolean;
    cyberPackSent: boolean;
  };
  lastHealthStatus: "connected" | "error" | "not_configured" | "disabled";
  lastHealthMessage: string;
  lastHealthLatencyMs: number | null;
  lastCheckedAt: string | null;
  updatedAt: string;
}

export interface SmtpEmailLogRecord {
  id: string;
  orderId: string | null;
  userId: string | null;
  username: string | null;
  trigger: SmtpEmailTrigger;
  toEmail: string;
  subject: string;
  bodyPreview: string;
  attachmentName: string | null;
  status: "sending" | "sent" | "logged_only" | "failed";
  providerMessageId: string | null;
  errorMessage: string | null;
  latencyMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminSmtpLiveResponse {
  success: boolean;
  serverTime: string;
  config: PublicSmtpConfig;
  stats: {
    totalEmails: number;
    sentCount: number;
    sendingCount: number;
    loggedOnlyCount: number;
    failedCount: number;
    digitalSentCount: number;
    physicalConfirmCount: number;
    onDemandConfirmCount: number;
    cyberPackSentCount: number;
  };
  logs: SmtpEmailLogRecord[];
}

export interface LotteryOneMinuteWarningPayload {
  warningId: string;
  lotteryId: string;
  lotterySlug: string;
  lotteryName: string;
  category: string;
  prizeAmount: number;
  entryFee: number;
  soldTickets: number;
  totalTickets: number;
  remainingTickets: number;
  currencySymbol: string;
  remainingSeconds: number;
  endAt: string;
  title: string;
  message: string;
}

export interface LiveDrawCountdownPayload {
  drawEventId: string;
  lotteryId: string;
  lotterySlug: string;
  lotteryName: string;
  category: string;
  prizeAmount: number;
  currencySymbol: string;
  totalTicketsEntered: number;
  sampleTicketNumbers: string[];
  countdownSeconds: number;
  drawAt: string;
}

export interface LiveDrawCompletedPayload {
  drawEventId: string;
  lotteryId: string;
  lotterySlug: string;
  lotteryName: string;
  category: string;
  prizeAmount: number;
  currencySymbol: string;
  result: LotteryResultRecord;
  winners: WinnerRecord[];
}

export interface LotteryRefundNoticePayload {
  refundEventId: string;
  notificationId: string;
  userId: string;
  username: string;
  lotteryId: string;
  lotterySlug: string;
  lotteryName: string;
  category: string;
  soldTickets: number;
  totalTickets: number;
  ticketCount: number;
  ticketNumbers: string[];
  refundAmount: number;
  balanceAfter: number;
  currencySymbol: string;
  title: string;
  message: string;
  reason: string;
  refundedAt: string;
}

export interface UserOtpResponse {
  code: string;
  counter: number;
  periodSeconds: number;
  remainingMs: number;
  remainingSeconds: number;
  expiresAt: string;
  serverTime: string;
  accountLabel: string;
}

export type VideoPromotionPlatform = "YouTube" | "TikTok" | "Facebook" | "Instagram" | "Other";

export interface VideoPromotionRecord {
  id: string;
  userId: string;
  username: string;
  userFullName: string;
  platform: VideoPromotionPlatform;
  videoUrl: string;
  title: string;
  channelHandle: string;
  status: "pending" | "approved" | "rejected";
  rewardAmount: number;
  adminNote: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface UserVideoPromotionsResponse {
  enabled: boolean;
  defaultReward: number;
  rules: string;
  currencySymbol: string;
  submissions: VideoPromotionRecord[];
}

export type LoadBalancerStrategy =
  | "round_robin"
  | "weighted"
  | "failover"
  | "least_connections";

export interface ServerNodeConfig {
  id: string;
  name: string;
  role: "primary" | "secondary";
  hostUrl: string;
  region: string;
  weight: number;
  enabled: boolean;
  lastStatus: "online" | "degraded" | "offline" | "standby";
  lastLatencyMs: number | null;
  lastCheckedAt: string | null;
  lastCheckMessage: string;
  routedRequests: number;
}

export interface MySqlStackConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  hasPassword?: boolean;
  sslEnabled: boolean;
  poolMax: number;
  lastStatus: "connected" | "not_configured" | "unreachable";
  lastLatencyMs: number | null;
  lastCheckedAt: string | null;
  lastMessage: string;
}

export type PhpIntegrationMode = "bridge_api" | "manual_db";

export interface PhpStackConfig {
  enabled: boolean;
  mode: PhpIntegrationMode;
  endpointUrl: string;
  bridgeHeaderName: string;
  hasBridgeApiKey?: boolean;
  bridgeApiKeyPreview?: string;
  bridgeDbHost: string;
  bridgeDbName: string;
  bridgeDbUser: string;
  hasBridgeDbPassword?: boolean;
  bridgeAllowedOrigins: string;
  bridgeLastHttpCode: number | null;
  bridgeLastLatencyMs: number | null;
  manualDbHost: string;
  manualDbPort: number;
  manualDbName: string;
  manualDbUser: string;
  hasManualDbPassword?: boolean;
  manualDbLastStatus: "connected" | "not_configured" | "unreachable";
  manualDbLastLatencyMs: number | null;
  manualDbLastMessage: string;
  targetVersion: string;
  fpmPort: number;
  lastStatus: "running" | "external_connected" | "configured" | "not_installed" | "unreachable";
  detectedVersion: string | null;
  lastCheckedAt: string | null;
  lastMessage: string;
}

export interface ServerClusterConfig {
  loadBalancer: {
    enabled: boolean;
    strategy: LoadBalancerStrategy;
    stickySession: boolean;
    autoFailover: boolean;
    healthCheckIntervalSec: number;
    roundRobinCursor: number;
  };
  nodes: ServerNodeConfig[];
  mysql: MySqlStackConfig;
  php: PhpStackConfig;
  updatedAt: string;
}

export interface ServerRuntimeMetrics {
  hostname: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  uptimeSeconds: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  rssMemoryMb: number;
  cpuCores: number;
  loadAvg1m: number;
  dbFileSizeKb: number;
  activeWebSockets: number;
  localMysqlCliDetected: boolean;
  localPhpDetected: boolean;
  localPhpVersion: string | null;
}

export interface AdminServerStatusResponse {
  success: boolean;
  cluster: ServerClusterConfig;
  runtime: ServerRuntimeMetrics;
}

export type ReferralCommissionTrigger = "signup" | "deposit" | "ticket_purchase";

export interface ReferralProgramConfig {
  enabled: boolean;
  signupBonusForReferrer: number;
  signupBonusForInvitee: number;
  depositCommissionPercent: number;
  ticketCommissionPercent: number;
  minDepositForCommission: number;
  maxCommissionPerEvent: number;
  blockSameIpSelfReferral: boolean;
  updatedAt: string;
}

export interface ReferralCommissionRecord {
  id: string;
  referrerUserId: string;
  referrerUsername: string;
  referredUserId: string;
  referredUsername: string;
  trigger: ReferralCommissionTrigger;
  baseAmount: number;
  ratePercent: number;
  commissionAmount: number;
  referenceId: string | null;
  note: string;
  createdAt: string;
}

export interface ReferralInvitedFriend {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  status: UserStatus;
  totalDeposited: number;
  ticketsBought: number;
  commissionGenerated: number;
  joinedAt: string;
}

export interface TopReferrerEntry {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  depositCommissionsCount: number;
  ticketCommissionsCount: number;
}

export interface UserReferralsResponse {
  success: boolean;
  referralCode: string;
  referredByUsername: string | null;
  config: ReferralProgramConfig;
  currencySymbol: string;
  stats: {
    totalInvited: number;
    activeInvited: number;
    totalEarned: number;
    signupEarned: number;
    depositEarned: number;
    ticketEarned: number;
  };
  invitedFriends: ReferralInvitedFriend[];
  commissions: ReferralCommissionRecord[];
  leaderboard: TopReferrerEntry[];
}

export interface AdminReferralsResponse {
  success: boolean;
  config: ReferralProgramConfig;
  currencySymbol: string;
  summary: {
    totalReferredUsers: number;
    activeReferrersCount: number;
    totalCommissionPaid: number;
    signupCommissionsPaid: number;
    depositCommissionsPaid: number;
    ticketCommissionsPaid: number;
    totalEventsCount: number;
  };
  topReferrers: TopReferrerEntry[];
  commissions: ReferralCommissionRecord[];
}

export interface AdminInboxThread {
  conversationKey: string;
  category: "admin" | "agent" | "peer";
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  userStatus: UserStatus;
  userBalance: number;
  counterpartId: string;
  counterpartType: SocialTargetType;
  counterpartUsername: string;
  counterpartFullName: string;
  counterpartDistrict?: string | null;
  lastMessage: string;
  lastSenderUsername: string;
  lastMessageAt: string;
  messageCount: number;
  unreadCount: number;
}

export interface AdminInboxPlayerOption {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  status: UserStatus;
  balance: number;
}

export interface AdminInboxResponse {
  success: boolean;
  summary: {
    adminThreadsCount: number;
    allThreadsCount: number;
    unreadMessagesCount: number;
    totalMessagesCount: number;
    todayMessagesCount: number;
  };
  adminThreads: AdminInboxThread[];
  allThreads: AdminInboxThread[];
  players: AdminInboxPlayerOption[];
}

export interface AdminInboxThreadMessagesResponse {
  success: boolean;
  conversationKey: string;
  messages: DirectMessageRecord[];
}

export interface AdminInboxConversationResponse {
  success: boolean;
  conversationKey: string;
  category: "admin" | "agent" | "peer";
  counterpartUsername: string | null;
  player: PublicUser;
  messages: DirectMessageRecord[];
}

export type MicroTaskCategory =
  | "website_traffic"
  | "youtube"
  | "social_media"
  | "app_signup"
  | "review_survey"
  | "other";

export type MicroTaskSubmissionStatus = "pending" | "approved" | "rejected";

export interface MicroTaskRecord {
  id: string;
  title: string;
  category: MicroTaskCategory;
  description: string;
  instructions: string;
  targetUrl: string;
  rewardAmount: number;
  maxWorkers: number;
  completedCount: number;
  clickCount: number;
  minStaySeconds: number;
  requireScreenshot: boolean;
  allowDailyRepeat: boolean;
  isActive: boolean;
  expiresAt?: string | null;
  createdByUserId: string;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
  pendingCount: number;
  remainingSlots: number | null;
  myLatestSubmission?: {
    id: string;
    status: MicroTaskSubmissionStatus;
    adminNote?: string | null;
    createdAt: string;
  } | null;
  canSubmitNow: boolean;
}

export interface MicroTaskSubmissionRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  taskCategory: MicroTaskCategory;
  targetUrl: string;
  userId: string;
  username: string;
  rewardAmount: number;
  proofNote: string;
  proofImageUrl?: string | null;
  clickedAt?: string | null;
  status: MicroTaskSubmissionStatus;
  adminNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedByUsername?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicMicroTasksResponse {
  success: boolean;
  currencySymbol: string;
  tasks: MicroTaskRecord[];
  mySubmissions: MicroTaskSubmissionRecord[];
  summary: {
    availableCount: number;
    totalEarned: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

export interface AdminMicroTasksResponse {
  success: boolean;
  currencySymbol: string;
  summary: {
    totalTasks: number;
    activeTasks: number;
    totalClicks: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    totalPaidOut: number;
  };
  tasks: MicroTaskRecord[];
  submissions: MicroTaskSubmissionRecord[];
}

