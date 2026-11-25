export type UserRole = "user" | "agent" | "sub_agent" | "moderator" | "admin";
export type UserStatus = "active" | "blocked";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string | null;
  chatProfileCompleted?: boolean;
  avatarUrl: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  spinCredits: number;
  totalDeposited: number;
  totalWithdrawn: number;
  winsCount: number;
  securityPinHash: string | null;
  pinLockEnabled: boolean;
  otpSecret?: string;
  registeredIp?: string | null;
  lastLoginIp?: string | null;
  deviceFingerprint?: string | null;
  registrationMethod?: "one_click" | "standard";
  privacyAcceptedAt?: string | null;
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  referralCode?: string;
  referredByUserId?: string | null;
  referredByUsername?: string | null;
  referralEarnings?: number;
  referralCount?: number;
  agentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export type LotteryStatus = "scheduled" | "active" | "closed" | "drawn" | "refunded" | "paused";
export type DrawMode = "auto" | "auto_datetime" | "manual";

export interface PrizeTier {
  id: string;
  lotteryId: string;
  rankPosition: number;
  title: string;
  amount: number;
  winnersCount: number;
}

export interface Lottery {
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
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
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

export interface Ticket {
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

export interface TicketReservation {
  id: string;
  lotteryId: string;
  userId: string;
  username: string;
  slotNumbers: number[];
  status: "held" | "pending_payment";
  paymentId: string | null;
  expiresAt: string;
  createdAt: string;
}

export type PaymentGateway = string;
export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";

export type PaymentGatewayCategory =
  | "local_mfs"
  | "bd_checkout"
  | "international"
  | "bank"
  | "crypto"
  | "custom";

export type PaymentGatewayMode = "manual" | "auto_api";

export interface PaymentGatewayConfig {
  id: string;
  code: string;
  name: string;
  category: PaymentGatewayCategory;
  mode: PaymentGatewayMode;
  enabled: boolean;
  supportsDeposit: boolean;
  supportsWithdrawal: boolean;
  isBuiltIn: boolean;
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
  apiBaseUrl: string;
  apiKey: string;
  apiSecret: string;
  webhookSecret: string;
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

export interface Payment {
  id: string;
  userId: string;
  username: string;
  gateway: PaymentGateway;
  senderNumber: string;
  trxId: string;
  amount: number;
  status: PaymentStatus;
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

export interface Withdrawal {
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

export interface LotteryResult {
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

export interface Banner {
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

export interface AuditLog {
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

export interface ChatMessage {
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

export interface UserFollow {
  id: string;
  followerUserId: string;
  targetId: string;
  targetType: SocialTargetType;
  targetUsername: string;
  createdAt: string;
}

export interface FriendRequest {
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

export interface DirectMessage {
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

export interface ShopCoupon extends PublicShopCoupon {
  isActive: boolean;
  createdByUserId: string;
  agentId?: string | null;
  createdAt: string;
  updatedAt: string;
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
  digitalFileStorageName?: string | null;
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

export interface ShopOrder {
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

export interface DailyTaskClaim {
  id: string;
  userId: string;
  username: string;
  taskId: string;
  claimDate: string;
  rewardAmount: number;
  rewardSpins: number;
  createdAt: string;
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
  password?: string;
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
  // Option 1: bridge.php API Key request mode (matches X-Bridge-Key + ping/query/execute)
  endpointUrl: string;
  bridgeApiKey: string;
  bridgeHeaderName: string;
  bridgeDbHost: string;
  bridgeDbName: string;
  bridgeDbUser: string;
  bridgeDbPassword: string;
  bridgeAllowedOrigins: string;
  bridgeLastHttpCode: number | null;
  bridgeLastLatencyMs: number | null;
  // Option 2: Manual PHP + Direct Load Balancing MySQL Database setup
  manualDbHost: string;
  manualDbPort: number;
  manualDbName: string;
  manualDbUser: string;
  manualDbPassword: string;
  manualDbLastStatus: "connected" | "not_configured" | "unreachable";
  manualDbLastLatencyMs: number | null;
  manualDbLastMessage: string;
  // Runtime metadata
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

export type SecurityEventType =
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

export interface SecurityEventRecord {
  id: string;
  type: SecurityEventType;
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

export interface ReferralSystemState {
  config: ReferralProgramConfig;
  commissions: ReferralCommissionRecord[];
}

export type SmtpEmailTrigger =
  | "digital_product_sent"
  | "physical_order_confirmation"
  | "physical_order_update"
  | "on_demand_confirmation"
  | "cyber_pack_sent"
  | "admin_order_update"
  | "test_email";

export interface SmtpConfig {
  enabled: boolean;
  providerPreset: "custom" | "gmail" | "brevo" | "zoho" | "cpanel";
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
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
  attachmentPath: string | null;
  status: "sending" | "sent" | "logged_only" | "failed";
  providerMessageId: string | null;
  errorMessage: string | null;
  latencyMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

export type MicroTaskCategory =
  | "website_traffic"
  | "youtube"
  | "social_media"
  | "app_signup"
  | "review_survey"
  | "other";

export type MicroTaskSubmissionStatus = "pending" | "approved" | "rejected";

export interface MicroTask {
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
}

export interface MicroTaskSubmission {
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

export type SupportRepStatus = "online" | "offline" | "busy";
export type SupportRepAccountStatus = "active" | "suspended";
export type SupportChatStatus = "waiting" | "active" | "closed";
export type SupportSenderType = "customer" | "representative" | "system";
export type SupportAssignmentTrigger = "auto" | "admin" | "transfer";

export interface SupportDepartment {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupportRepresentative {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  avatarUrl: string;
  departmentId: string | null;
  status: SupportRepStatus;
  accountStatus: SupportRepAccountStatus;
  maxActiveChats: number;
  lastAssignedAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportChat {
  id: string;
  ticketCode: string;
  customerUserId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  departmentId: string | null;
  representativeId: string | null;
  status: SupportChatStatus;
  queueEnteredAt: string | null;
  assignedAt: string | null;
  closedAt: string | null;
  closedByType: "customer" | "representative" | "admin" | null;
  closedById: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  customerUnreadCount: number;
  repUnreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  chatId: string;
  senderType: SupportSenderType;
  senderId: string | null;
  senderName: string;
  body: string;
  attachmentIds: string[];
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface SupportAttachment {
  id: string;
  chatId: string;
  messageId: string | null;
  uploadedByType: "customer" | "representative";
  uploadedById: string | null;
  originalName: string;
  storedName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  url: string;
  createdAt: string;
}

export interface SupportAssignment {
  id: string;
  chatId: string;
  representativeId: string;
  representativeName: string;
  previousRepresentativeId: string | null;
  assignedByType: SupportAssignmentTrigger;
  assignedById: string | null;
  reason: string | null;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface SupportRating {
  id: string;
  chatId: string;
  representativeId: string | null;
  representativeName: string | null;
  customerName: string;
  customerPhone: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface SupportSettings {
  autoAssignEnabled: boolean;
  maxActiveChatsPerRep: number;
  maxUploadMb: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  welcomeMessage: string;
  queueMessage: string;
  offlineMessage: string;
  updatedAt: string;
}

export interface SupportPresence {
  representativeId: string;
  isConnected: boolean;
  socketCount: number;
  lastHeartbeatAt: string;
  disconnectedAt: string | null;
}

export interface LiveSupportState {
  departments: SupportDepartment[];
  representatives: SupportRepresentative[];
  chats: SupportChat[];
  messages: SupportMessage[];
  attachments: SupportAttachment[];
  assignments: SupportAssignment[];
  ratings: SupportRating[];
  settings: SupportSettings;
  presence: SupportPresence[];
}

export interface LotteryDatabase {
  users: User[];
  categories: LotteryCategory[];
  lotteries: Lottery[];
  prizes: PrizeTier[];
  purchases: Purchase[];
  tickets: Ticket[];
  ticketReservations: TicketReservation[];
  payments: Payment[];
  withdrawals: Withdrawal[];
  lotteryResults: LotteryResult[];
  winners: WinnerRecord[];
  transactions: TransactionRecord[];
  notifications: NotificationRecord[];
  banners: Banner[];
  settings: SiteSettings;
  auditLogs: AuditLog[];
  chatMessages: ChatMessage[];
  follows: UserFollow[];
  friendRequests: FriendRequest[];
  directMessages: DirectMessage[];
  shopItems: ShopItem[];
  shopOrders: ShopOrder[];
  shopCoupons?: ShopCoupon[];
  shopInboxMessages?: ShopInboxMessage[];
  wheelSpins: WheelSpinRecord[];
  dailyTaskClaims: DailyTaskClaim[];
  microTasks?: MicroTask[];
  microTaskSubmissions?: MicroTaskSubmission[];
  agents: DistrictAgent[];
  videoPromotions: VideoPromotionRecord[];
  paymentGateways: PaymentGatewayConfig[];
  plugins: InstalledPlugin[];
  serverCluster: ServerClusterConfig;
  security?: SecurityRoomState;
  referrals?: ReferralSystemState;
  smtpConfig?: SmtpConfig;
  smtpLogs?: SmtpEmailLogRecord[];
  liveSupport?: LiveSupportState;
}

