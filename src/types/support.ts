export type SupportRepresentativeStatus = "online" | "busy" | "offline";
export type SupportRepresentativeAccountStatus = "active" | "suspended";
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
}

export interface SupportAttachmentRecord {
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

export interface SupportMessageRecord {
  id: string;
  chatId: string;
  senderType: SupportSenderType;
  senderId: string | null;
  senderName: string;
  body: string;
  attachmentIds: string[];
  attachments: SupportAttachmentRecord[];
  deliveredAt: string;
  readAt: string | null;
  createdAt: string;
}

export interface SupportAssignedRepBadge {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  departmentName: string;
  status: SupportRepresentativeStatus;
}

export interface SupportRatingSummary {
  id: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface SupportRatingRecord {
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

export interface SupportAssignmentRecord {
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

export interface SupportChatSummary {
  id: string;
  ticketCode: string;
  customerUserId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  departmentId: string | null;
  departmentName: string;
  representativeId: string | null;
  status: SupportChatStatus;
  queueEnteredAt: string | null;
  queuePosition: number | null;
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
  assignedRepresentative: SupportAssignedRepBadge | null;
  rating: SupportRatingSummary | null;
}

export interface SupportSettingsRecord {
  autoAssignEnabled: boolean;
  maxActiveChatsPerRep?: number;
  maxUploadMb: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  welcomeMessage: string;
  queueMessage: string;
  offlineMessage: string;
  updatedAt?: string;
}

export interface SupportPublicRepresentative {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string;
  departmentId: string;
  departmentName: string;
  status: SupportRepresentativeStatus;
  accountStatus: SupportRepresentativeAccountStatus;
  maxActiveChats: number;
  activeChatsCount: number;
  activeChatId: string | null;
  totalChatsHandled: number;
  totalAssignments: number;
  ratingsCount: number;
  averageRating: number | null;
  isSocketConnected: boolean;
  lastAssignedAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface SupportConfigResponse {
  success: boolean;
  departments: SupportDepartment[];
  onlineFreeCount: number;
  onlineTotalCount: number;
  waitingQueueCount: number;
  settings: SupportSettingsRecord;
}

export interface SupportMyChatsResponse {
  success: boolean;
  activeChat: SupportChatSummary | null;
  activeMessages: SupportMessageRecord[];
  history: SupportChatSummary[];
}

export interface SupportStartChatResponse {
  success: boolean;
  customerToken: string;
  chat: SupportChatSummary;
  messages: SupportMessageRecord[];
  reused?: boolean;
}

export interface SupportChatDetailResponse {
  success: boolean;
  chat: SupportChatSummary;
  messages: SupportMessageRecord[];
  assignments?: SupportAssignmentRecord[];
  customerAccount?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    balance: number;
    role: string;
  } | null;
}

export interface SupportRepDashboardResponse {
  success: boolean;
  representative: SupportPublicRepresentative;
  stats: {
    activeChatsCount: number;
    maxActiveChats: number;
    handledToday: number;
    totalHandled: number;
    waitingQueueCount: number;
    averageRating: number | null;
    ratingsCount: number;
  };
  activeChat: SupportChatSummary | null;
  activeMessages: SupportMessageRecord[];
  activeCustomerProfile: {
    name: string;
    phone: string;
    email: string | null;
    registeredUsername: string | null;
    registeredRole: string | null;
    registeredBalance: number | null;
    previousChats: SupportChatSummary[];
    assignments: SupportAssignmentRecord[];
  } | null;
  historyChats: SupportChatSummary[];
  ratings: SupportRatingRecord[];
  availablePeers: SupportPublicRepresentative[];
  settings: SupportSettingsRecord;
}

export interface AdminSupportOverviewResponse {
  success: boolean;
  summary: {
    totalRepresentatives: number;
    onlineRepresentatives: number;
    busyRepresentatives: number;
    offlineRepresentatives: number;
    waitingChatsCount: number;
    activeChatsCount: number;
    closedChatsCount: number;
    totalRatings: number;
    averageRating: number | null;
  };
  departments: SupportDepartment[];
  representatives: SupportPublicRepresentative[];
  chats: SupportChatSummary[];
  assignments: SupportAssignmentRecord[];
  ratings: SupportRatingRecord[];
  settings: SupportSettingsRecord;
}
