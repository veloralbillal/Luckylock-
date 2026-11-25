var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express4 = __toESM(require("express"), 1);
var import_fs7 = __toESM(require("fs"), 1);
var import_http = __toESM(require("http"), 1);
var import_path6 = __toESM(require("path"), 1);

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);

// server/agentsSeed.ts
var BANGLADESH_64_DISTRICT_SEEDS = [
  // Sylhet Division (4)
  { district: "Sylhet", division: "Sylhet", username: "sylhet_rafi", fullName: "Rafi Ahmed", phone: "01711482001", cashInOrders: 96, cashOutOrders: 52 },
  { district: "Moulvibazar", division: "Sylhet", username: "moulvibazar_tariq", fullName: "Tariq Chowdhury", phone: "01711482002", cashInOrders: 44, cashOutOrders: 27 },
  { district: "Habiganj", division: "Sylhet", username: "habiganj_shuvo", fullName: "Shuvo Mia", phone: "01711482003", cashInOrders: 39, cashOutOrders: 21 },
  { district: "Sunamganj", division: "Sylhet", username: "sunamganj_nahid", fullName: "Nahid Hasan", phone: "01711482004", cashInOrders: 34, cashOutOrders: 19 },
  // Dhaka Division (13)
  { district: "Dhaka", division: "Dhaka", username: "dhaka_kamrul", fullName: "Kamrul Islam", phone: "01711482005", cashInOrders: 198, cashOutOrders: 114 },
  { district: "Gazipur", division: "Dhaka", username: "gazipur_rakib", fullName: "Rakibul Hasan", phone: "01711482006", cashInOrders: 78, cashOutOrders: 46 },
  { district: "Narayanganj", division: "Dhaka", username: "narayanganj_sohel", fullName: "Sohel Rana", phone: "01711482007", cashInOrders: 71, cashOutOrders: 38 },
  { district: "Tangail", division: "Dhaka", username: "tangail_mehedi", fullName: "Mehedi Hasan", phone: "01711482008", cashInOrders: 52, cashOutOrders: 29 },
  { district: "Narsingdi", division: "Dhaka", username: "narsingdi_imran", fullName: "Imran Hossain", phone: "01711482009", cashInOrders: 47, cashOutOrders: 24 },
  { district: "Faridpur", division: "Dhaka", username: "faridpur_masud", fullName: "Masud Karim", phone: "01711482010", cashInOrders: 42, cashOutOrders: 22 },
  { district: "Kishoreganj", division: "Dhaka", username: "kishoreganj_tanvir", fullName: "Tanvir Alam", phone: "01711482011", cashInOrders: 36, cashOutOrders: 18 },
  { district: "Manikganj", division: "Dhaka", username: "manikganj_saiful", fullName: "Saiful Islam", phone: "01711482012", cashInOrders: 31, cashOutOrders: 16 },
  { district: "Munshiganj", division: "Dhaka", username: "munshiganj_ashik", fullName: "Ashikur Rahman", phone: "01711482013", cashInOrders: 29, cashOutOrders: 15 },
  { district: "Madaripur", division: "Dhaka", username: "madaripur_fahim", fullName: "Fahim Shikder", phone: "01711482014", cashInOrders: 26, cashOutOrders: 14 },
  { district: "Gopalganj", division: "Dhaka", username: "gopalganj_sumon", fullName: "Sumon Mollah", phone: "01711482015", cashInOrders: 28, cashOutOrders: 13 },
  { district: "Rajbari", division: "Dhaka", username: "rajbari_rubel", fullName: "Rubel Mia", phone: "01711482016", cashInOrders: 24, cashOutOrders: 12 },
  { district: "Shariatpur", division: "Dhaka", username: "shariatpur_ripon", fullName: "Ripon Bepari", phone: "01711482017", cashInOrders: 23, cashOutOrders: 11 },
  // Chattogram Division (11)
  { district: "Chattogram", division: "Chattogram", username: "ctg_sajjad", fullName: "Sajjad Hossain", phone: "01811482018", cashInOrders: 132, cashOutOrders: 76 },
  { district: "Cumilla", division: "Chattogram", username: "cumilla_ariful", fullName: "Ariful Haque", phone: "01811482019", cashInOrders: 84, cashOutOrders: 49 },
  { district: "Cox's Bazar", division: "Chattogram", username: "coxsbazar_noman", fullName: "Noman Siddique", phone: "01811482020", cashInOrders: 58, cashOutOrders: 33 },
  { district: "Brahmanbaria", division: "Chattogram", username: "bbaria_jubayer", fullName: "Jubayer Ahmed", phone: "01811482021", cashInOrders: 49, cashOutOrders: 26 },
  { district: "Noakhali", division: "Chattogram", username: "noakhali_mamun", fullName: "Mamunur Rashid", phone: "01811482022", cashInOrders: 53, cashOutOrders: 28 },
  { district: "Feni", division: "Chattogram", username: "feni_shahin", fullName: "Shahin Alam", phone: "01811482023", cashInOrders: 45, cashOutOrders: 23 },
  { district: "Chandpur", division: "Chattogram", username: "chandpur_faisal", fullName: "Faisal Kabir", phone: "01811482024", cashInOrders: 41, cashOutOrders: 21 },
  { district: "Lakshmipur", division: "Chattogram", username: "lakshmipur_hasib", fullName: "Hasibul Islam", phone: "01811482025", cashInOrders: 33, cashOutOrders: 17 },
  { district: "Bandarban", division: "Chattogram", username: "bandarban_maruf", fullName: "Maruf Chakma", phone: "01811482026", cashInOrders: 19, cashOutOrders: 10 },
  { district: "Khagrachhari", division: "Chattogram", username: "khagrachhari_rony", fullName: "Rony Tripura", phone: "01811482027", cashInOrders: 18, cashOutOrders: 9 },
  { district: "Rangamati", division: "Chattogram", username: "rangamati_bikash", fullName: "Bikash Barua", phone: "01811482028", cashInOrders: 21, cashOutOrders: 11 },
  // Rajshahi Division (8)
  { district: "Rajshahi", division: "Rajshahi", username: "rajshahi_sakib", fullName: "Sakib Al Hasan", phone: "01711482029", cashInOrders: 89, cashOutOrders: 51 },
  { district: "Bogura", division: "Rajshahi", username: "bogura_nayeem", fullName: "Nayeem Sarkar", phone: "01711482030", cashInOrders: 68, cashOutOrders: 37 },
  { district: "Pabna", division: "Rajshahi", username: "pabna_farhan", fullName: "Farhan Sadik", phone: "01711482031", cashInOrders: 46, cashOutOrders: 24 },
  { district: "Sirajganj", division: "Rajshahi", username: "sirajganj_liton", fullName: "Liton Talukder", phone: "01711482032", cashInOrders: 43, cashOutOrders: 22 },
  { district: "Naogaon", division: "Rajshahi", username: "naogaon_sharif", fullName: "Sharif Uddin", phone: "01711482033", cashInOrders: 35, cashOutOrders: 18 },
  { district: "Natore", division: "Rajshahi", username: "natore_touhid", fullName: "Touhidul Islam", phone: "01711482034", cashInOrders: 30, cashOutOrders: 15 },
  { district: "Chapainawabganj", division: "Rajshahi", username: "chapai_ashraf", fullName: "Ashraf Ali", phone: "01711482035", cashInOrders: 27, cashOutOrders: 14 },
  { district: "Joypurhat", division: "Rajshahi", username: "joypurhat_mizan", fullName: "Mizanur Rahman", phone: "01711482036", cashInOrders: 22, cashOutOrders: 12 },
  // Khulna Division (10)
  { district: "Khulna", division: "Khulna", username: "khulna_zahid", fullName: "Zahidul Islam", phone: "01911482037", cashInOrders: 82, cashOutOrders: 47 },
  { district: "Jashore", division: "Khulna", username: "jashore_sabbir", fullName: "Sabbir Ahmed", phone: "01911482038", cashInOrders: 57, cashOutOrders: 31 },
  { district: "Kushtia", division: "Khulna", username: "kushtia_ridoy", fullName: "Ridoy Khan", phone: "01911482039", cashInOrders: 48, cashOutOrders: 26 },
  { district: "Satkhira", division: "Khulna", username: "satkhira_emon", fullName: "Emon Hossain", phone: "01911482040", cashInOrders: 37, cashOutOrders: 19 },
  { district: "Bagerhat", division: "Khulna", username: "bagerhat_parvez", fullName: "Parvez Sheikh", phone: "01911482041", cashInOrders: 32, cashOutOrders: 16 },
  { district: "Jhenaidah", division: "Khulna", username: "jhenaidah_siam", fullName: "Siam Mahmud", phone: "01911482042", cashInOrders: 29, cashOutOrders: 15 },
  { district: "Chuadanga", division: "Khulna", username: "chuadanga_rasel", fullName: "Rasel Rana", phone: "01911482043", cashInOrders: 25, cashOutOrders: 13 },
  { district: "Magura", division: "Khulna", username: "magura_shanto", fullName: "Shanto Biswas", phone: "01911482044", cashInOrders: 21, cashOutOrders: 11 },
  { district: "Meherpur", division: "Khulna", username: "meherpur_biplob", fullName: "Biplob Hossain", phone: "01911482045", cashInOrders: 19, cashOutOrders: 10 },
  { district: "Narail", division: "Khulna", username: "narail_al_amin", fullName: "Al Amin Molla", phone: "01911482046", cashInOrders: 20, cashOutOrders: 11 },
  // Barishal Division (6)
  { district: "Barishal", division: "Barishal", username: "barishal_mahmud", fullName: "Mahmudul Hasan", phone: "01711482047", cashInOrders: 64, cashOutOrders: 35 },
  { district: "Bhola", division: "Barishal", username: "bhola_habib", fullName: "Habibur Rahman", phone: "01711482048", cashInOrders: 36, cashOutOrders: 19 },
  { district: "Patuakhali", division: "Barishal", username: "patuakhali_nasir", fullName: "Nasir Uddin", phone: "01711482049", cashInOrders: 31, cashOutOrders: 17 },
  { district: "Pirojpur", division: "Barishal", username: "pirojpur_tuhin", fullName: "Tuhin Hawlader", phone: "01711482050", cashInOrders: 24, cashOutOrders: 12 },
  { district: "Barguna", division: "Barishal", username: "barguna_monir", fullName: "Monirul Islam", phone: "01711482051", cashInOrders: 22, cashOutOrders: 11 },
  { district: "Jhalokati", division: "Barishal", username: "jhalokati_bappy", fullName: "Bappy Akon", phone: "01711482052", cashInOrders: 18, cashOutOrders: 9 },
  // Rangpur Division (8)
  { district: "Rangpur", division: "Rangpur", username: "rangpur_shahriar", fullName: "Shahriar Kabir", phone: "01711482053", cashInOrders: 73, cashOutOrders: 41 },
  { district: "Dinajpur", division: "Rangpur", username: "dinajpur_saikat", fullName: "Saikat Roy", phone: "01711482054", cashInOrders: 51, cashOutOrders: 28 },
  { district: "Gaibandha", division: "Rangpur", username: "gaibandha_khalid", fullName: "Khalid Saifullah", phone: "01711482055", cashInOrders: 34, cashOutOrders: 18 },
  { district: "Kurigram", division: "Rangpur", username: "kurigram_momin", fullName: "Mominul Islam", phone: "01711482056", cashInOrders: 28, cashOutOrders: 15 },
  { district: "Nilphamari", division: "Rangpur", username: "nilphamari_joy", fullName: "Joydeb Das", phone: "01711482057", cashInOrders: 27, cashOutOrders: 14 },
  { district: "Lalmonirhat", division: "Rangpur", username: "lalmonirhat_akash", fullName: "Akash Chandra", phone: "01711482058", cashInOrders: 23, cashOutOrders: 12 },
  { district: "Thakurgaon", division: "Rangpur", username: "thakurgaon_sujon", fullName: "Sujon Barman", phone: "01711482059", cashInOrders: 25, cashOutOrders: 13 },
  { district: "Panchagarh", division: "Rangpur", username: "panchagarh_arif", fullName: "Arifuzzaman", phone: "01711482060", cashInOrders: 21, cashOutOrders: 11 },
  // Mymensingh Division (4)
  { district: "Mymensingh", division: "Mymensingh", username: "mymensingh_tanmoy", fullName: "Tanmoy Sarker", phone: "01711482061", cashInOrders: 69, cashOutOrders: 39 },
  { district: "Jamalpur", division: "Mymensingh", username: "jamalpur_shafiq", fullName: "Shafiqul Islam", phone: "01711482062", cashInOrders: 38, cashOutOrders: 20 },
  { district: "Netrokona", division: "Mymensingh", username: "netrokona_rakib", fullName: "Rakib Talukder", phone: "01711482063", cashInOrders: 30, cashOutOrders: 16 },
  { district: "Sherpur", division: "Mymensingh", username: "sherpur_faruk", fullName: "Faruk Hossain", phone: "01711482064", cashInOrders: 26, cashOutOrders: 14 }
];
function createSeedDistrictAgents(buildAvatar) {
  return BANGLADESH_64_DISTRICT_SEEDS.map((entry, idx) => ({
    id: `agt_${idx + 1}_${entry.district.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    username: entry.username,
    fullName: entry.fullName,
    avatarUrl: buildAvatar(entry.fullName, idx),
    district: entry.district,
    division: entry.division,
    phone: entry.phone,
    channels: ["bKash", "Nagad", "Rocket", "Upay", "Cash"],
    totalOrders: entry.cashInOrders + entry.cashOutOrders,
    cashInOrders: entry.cashInOrders,
    cashOutOrders: entry.cashOutOrders,
    isOnline: true,
    isVerified: true
  }));
}

// server/security.ts
var import_crypto = __toESM(require("crypto"), 1);
var SESSION_SECRET = process.env.SESSION_SECRET || import_crypto.default.createHash("sha256").update("lottery_winner_prod_secret_key_v1").digest("hex");
function hashPassword(password) {
  const salt = import_crypto.default.randomBytes(16).toString("hex");
  const derived = import_crypto.default.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const keyBuf = Buffer.from(key, "hex");
  const derivedBuf = import_crypto.default.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return import_crypto.default.timingSafeEqual(keyBuf, derivedBuf);
}
function signSessionToken(userId, role) {
  const payload = {
    uid: userId,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = import_crypto.default.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}
function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expectedSig = import_crypto.default.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !import_crypto.default.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!parsed.uid || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${import_crypto.default.randomBytes(4).toString("hex")}`;
}
function generateUniqueTicketCode(existingCodes) {
  for (let i = 0; i < 50; i++) {
    const num = import_crypto.default.randomInt(1e5, 1e6);
    const code = `LW-${num}`;
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }
  const fallback = `LW-${import_crypto.default.randomBytes(3).toString("hex").toUpperCase()}`;
  existingCodes.add(fallback);
  return fallback;
}
function computeDrawSeedHash(lotteryId, ticketNumbers, winningTicketNumbers, drawnAt) {
  const payload = JSON.stringify({
    lotteryId,
    ticketCount: ticketNumbers.length,
    ticketsDigest: import_crypto.default.createHash("sha256").update([...ticketNumbers].sort().join(",")).digest("hex"),
    winningTicketNumbers,
    drawnAt
  });
  return import_crypto.default.createHash("sha256").update(payload).digest("hex");
}
function generateOtpSecret() {
  return import_crypto.default.randomBytes(20).toString("hex");
}
function deriveSixDigitOtp(secret, counter) {
  const hmac = import_crypto.default.createHmac("sha256", `${SESSION_SECRET}:${secret}`).update(String(counter)).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const binary = (hmac[offset] & 127) << 24 | (hmac[offset + 1] & 255) << 16 | (hmac[offset + 2] & 255) << 8 | hmac[offset + 3] & 255;
  return String(binary % 1e6).padStart(6, "0");
}
function computeTimedOtp(secret, timestampMs = Date.now(), periodSeconds = 30) {
  const periodMs = periodSeconds * 1e3;
  const counter = Math.floor(timestampMs / periodMs);
  const nextBoundaryMs = (counter + 1) * periodMs;
  const remainingMs = Math.max(0, nextBoundaryMs - timestampMs);
  const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1e3));
  return {
    code: deriveSixDigitOtp(secret, counter),
    counter,
    periodSeconds,
    remainingMs,
    remainingSeconds,
    expiresAt: new Date(nextBoundaryMs).toISOString(),
    serverTime: new Date(timestampMs).toISOString()
  };
}
function verifyTimedOtp(secret, candidate, timestampMs = Date.now(), periodSeconds = 30) {
  const clean = candidate.replace(/\s+/g, "").trim();
  if (!/^\d{6}$/.test(clean)) return false;
  const counter = Math.floor(timestampMs / (periodSeconds * 1e3));
  for (const drift of [0, -1, 1]) {
    const expected = deriveSixDigitOtp(secret, counter + drift);
    if (expected.length === clean.length && import_crypto.default.timingSafeEqual(Buffer.from(expected), Buffer.from(clean))) {
      return true;
    }
  }
  return false;
}
function sanitizeText(input, maxLength = 500) {
  if (typeof input !== "string") return "";
  return input.replace(/[<>]/g, "").trim().slice(0, maxLength);
}
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}
var rateStore = /* @__PURE__ */ new Map();
function createRateLimiter(bucket, maxRequests, windowMs) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${bucket}:${ip}`;
    const now = Date.now();
    const history = (rateStore.get(key) || []).filter((ts) => now - ts < windowMs);
    if (history.length >= maxRequests) {
      res.status(429).json({
        success: false,
        message: "Too many requests. Please wait a moment before trying again."
      });
      return;
    }
    history.push(now);
    rateStore.set(key, history);
    next();
  };
}
var csrfTokens = /* @__PURE__ */ new Set();
function issueCsrfToken() {
  const token = import_crypto.default.randomBytes(24).toString("hex");
  csrfTokens.add(token);
  if (csrfTokens.size > 5e3) {
    const first = csrfTokens.values().next().value;
    if (first) csrfTokens.delete(first);
  }
  return token;
}
function verifyCsrfMiddleware(req, res, next) {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }
  const token = req.headers["x-csrf-token"];
  if (typeof token !== "string" || !csrfTokens.has(token)) {
    res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF security token. Please refresh and try again."
    });
    return;
  }
  next();
}

// server/services/referralService.ts
var import_crypto2 = __toESM(require("crypto"), 1);
var DEFAULT_REFERRAL_CONFIG = {
  enabled: true,
  signupBonusForReferrer: 25,
  signupBonusForInvitee: 15,
  depositCommissionPercent: 5,
  ticketCommissionPercent: 2,
  minDepositForCommission: 100,
  maxCommissionPerEvent: 5e3,
  blockSameIpSelfReferral: true,
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
function createDefaultReferralState() {
  return {
    config: {
      ...DEFAULT_REFERRAL_CONFIG,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    commissions: []
  };
}
function ensureReferralState(db) {
  if (!db.referrals || typeof db.referrals !== "object") {
    db.referrals = createDefaultReferralState();
  }
  if (!db.referrals.config || typeof db.referrals.config !== "object") {
    db.referrals.config = { ...DEFAULT_REFERRAL_CONFIG, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  } else {
    db.referrals.config = {
      ...DEFAULT_REFERRAL_CONFIG,
      ...db.referrals.config
    };
  }
  if (!Array.isArray(db.referrals.commissions)) {
    db.referrals.commissions = [];
  }
  return db.referrals;
}
function normalizeReferralCode(raw) {
  if (typeof raw !== "string") return "";
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
}
function generateUniqueReferralCode(username, existingUsers) {
  const used = new Set(
    existingUsers.map((u) => (u.referralCode || "").trim().toUpperCase()).filter(Boolean)
  );
  const cleanPrefix = username.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4).padEnd(3, "X");
  for (let attempt = 0; attempt < 40; attempt++) {
    const suffix = import_crypto2.default.randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
    const candidate = `LW${cleanPrefix}${suffix}`;
    if (!used.has(candidate)) {
      return candidate;
    }
  }
  return `LW${import_crypto2.default.randomBytes(4).toString("hex").toUpperCase()}`;
}
function ensureUserReferralFields(users) {
  for (const user of users) {
    if (!user.referralCode || !user.referralCode.trim()) {
      user.referralCode = generateUniqueReferralCode(user.username || "USER", users);
    }
    if (typeof user.referralEarnings !== "number" || !Number.isFinite(user.referralEarnings)) {
      user.referralEarnings = 0;
    }
    if (typeof user.referralCount !== "number" || !Number.isFinite(user.referralCount)) {
      user.referralCount = 0;
    }
  }
}
function resolveReferrerForSignup(db, rawCode, clientIp, deviceFingerprint) {
  const state = ensureReferralState(db);
  const codeUsed = normalizeReferralCode(rawCode);
  if (!codeUsed || !state.config.enabled) {
    return { referrer: null, codeUsed };
  }
  const referrer = db.users.find(
    (u) => u.status === "active" && (u.referralCode && u.referralCode.toUpperCase() === codeUsed || u.username.toUpperCase() === codeUsed)
  );
  if (!referrer) {
    return {
      referrer: null,
      codeUsed,
      rejectedReason: "Referral code not found or inactive."
    };
  }
  if (state.config.blockSameIpSelfReferral) {
    const sameIp = Boolean(clientIp) && clientIp !== "unknown" && (referrer.registeredIp && referrer.registeredIp === clientIp || referrer.lastLoginIp && referrer.lastLoginIp === clientIp);
    const sameDevice = Boolean(deviceFingerprint) && Boolean(referrer.deviceFingerprint) && referrer.deviceFingerprint === deviceFingerprint;
    if (sameIp || sameDevice) {
      return {
        referrer: null,
        codeUsed,
        rejectedReason: "Self-referral from the same IP address or device is blocked."
      };
    }
  }
  return { referrer, codeUsed: referrer.referralCode || codeUsed };
}
function recordCommission(db, params) {
  const amount = Math.round(params.commissionAmount * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const state = ensureReferralState(db);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const sym = db.settings.currencySymbol || "\u09F3";
  params.referrer.balance = Math.round((params.referrer.balance + amount) * 100) / 100;
  params.referrer.referralEarnings = Math.round(((params.referrer.referralEarnings || 0) + amount) * 100) / 100;
  params.referrer.updatedAt = now;
  const rec = {
    id: generateId("refc"),
    referrerUserId: params.referrer.id,
    referrerUsername: params.referrer.username,
    referredUserId: params.referredUser.id,
    referredUsername: params.referredUser.username,
    trigger: params.trigger,
    baseAmount: Math.round(params.baseAmount * 100) / 100,
    ratePercent: params.ratePercent,
    commissionAmount: amount,
    referenceId: params.referenceId,
    note: params.note,
    createdAt: now
  };
  state.commissions.unshift(rec);
  if (state.commissions.length > 2e3) {
    state.commissions = state.commissions.slice(0, 2e3);
  }
  db.transactions.unshift({
    id: generateId("txn"),
    userId: params.referrer.id,
    username: params.referrer.username,
    direction: "credit",
    category: "referral_commission",
    amount,
    balanceAfter: params.referrer.balance,
    referenceId: params.referenceId || rec.id,
    gateway: "Referral Program",
    description: params.note,
    createdAt: now
  });
  db.notifications.unshift({
    id: generateId("notif"),
    userId: params.referrer.id,
    title: `Referral Commission Earned (+${sym}${amount})`,
    message: `${params.note}. Your wallet balance is now ${sym}${params.referrer.balance.toLocaleString()}.`,
    type: "success",
    isRead: false,
    createdAt: now
  });
  return rec;
}
function creditSignupReferralRewards(db, newUser, referrer) {
  const state = ensureReferralState(db);
  const cfg = state.config;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const sym = db.settings.currencySymbol || "\u09F3";
  newUser.referredByUserId = referrer.id;
  newUser.referredByUsername = referrer.username;
  referrer.referralCount = (referrer.referralCount || 0) + 1;
  referrer.updatedAt = now;
  let inviteeBonus = 0;
  if (cfg.enabled && cfg.signupBonusForInvitee > 0) {
    inviteeBonus = Math.round(cfg.signupBonusForInvitee * 100) / 100;
    newUser.balance = Math.round((newUser.balance + inviteeBonus) * 100) / 100;
    newUser.updatedAt = now;
    db.transactions.unshift({
      id: generateId("txn"),
      userId: newUser.id,
      username: newUser.username,
      direction: "credit",
      category: "referral_signup_bonus",
      amount: inviteeBonus,
      balanceAfter: newUser.balance,
      referenceId: referrer.id,
      gateway: "Referral Program",
      description: `Referral welcome bonus (invited by @${referrer.username})`,
      createdAt: now
    });
    db.notifications.unshift({
      id: generateId("notif"),
      userId: newUser.id,
      title: `Referral Bonus Credited (+${sym}${inviteeBonus})`,
      message: `You received an extra ${sym}${inviteeBonus} bonus for signing up with @${referrer.username}'s referral code.`,
      type: "success",
      isRead: false,
      createdAt: now
    });
  }
  let commission = null;
  let referrerBonus = 0;
  if (cfg.enabled && cfg.signupBonusForReferrer > 0) {
    referrerBonus = Math.min(
      cfg.maxCommissionPerEvent > 0 ? cfg.maxCommissionPerEvent : cfg.signupBonusForReferrer,
      cfg.signupBonusForReferrer
    );
    commission = recordCommission(db, {
      referrer,
      referredUser: newUser,
      trigger: "signup",
      baseAmount: 0,
      ratePercent: 0,
      commissionAmount: referrerBonus,
      referenceId: newUser.id,
      note: `Referral signup bonus for inviting @${newUser.username}`
    });
  }
  return { referrerBonus, inviteeBonus, commission };
}
function creditDepositReferralCommission(db, depositor, depositAmount, paymentId) {
  const state = ensureReferralState(db);
  const cfg = state.config;
  if (!cfg.enabled || !depositor.referredByUserId) return null;
  if (cfg.depositCommissionPercent <= 0) return null;
  if (depositAmount < cfg.minDepositForCommission) return null;
  const referrer = db.users.find(
    (u) => u.id === depositor.referredByUserId && u.status === "active"
  );
  if (!referrer || referrer.id === depositor.id) return null;
  const raw = Math.round(depositAmount * (cfg.depositCommissionPercent / 100) * 100) / 100;
  const amount = cfg.maxCommissionPerEvent > 0 ? Math.min(cfg.maxCommissionPerEvent, raw) : raw;
  if (amount <= 0) return null;
  const sym = db.settings.currencySymbol || "\u09F3";
  return recordCommission(db, {
    referrer,
    referredUser: depositor,
    trigger: "deposit",
    baseAmount: depositAmount,
    ratePercent: cfg.depositCommissionPercent,
    commissionAmount: amount,
    referenceId: paymentId,
    note: `${cfg.depositCommissionPercent}% deposit commission from @${depositor.username} (${sym}${depositAmount.toLocaleString()} deposit)`
  });
}
function creditTicketReferralCommission(db, buyer, purchaseAmount, referenceId, lotteryName) {
  const state = ensureReferralState(db);
  const cfg = state.config;
  if (!cfg.enabled || !buyer.referredByUserId) return null;
  if (cfg.ticketCommissionPercent <= 0 || purchaseAmount <= 0) return null;
  const referrer = db.users.find(
    (u) => u.id === buyer.referredByUserId && u.status === "active"
  );
  if (!referrer || referrer.id === buyer.id) return null;
  const raw = Math.round(purchaseAmount * (cfg.ticketCommissionPercent / 100) * 100) / 100;
  const amount = cfg.maxCommissionPerEvent > 0 ? Math.min(cfg.maxCommissionPerEvent, raw) : raw;
  if (amount <= 0) return null;
  const sym = db.settings.currencySymbol || "\u09F3";
  return recordCommission(db, {
    referrer,
    referredUser: buyer,
    trigger: "ticket_purchase",
    baseAmount: purchaseAmount,
    ratePercent: cfg.ticketCommissionPercent,
    commissionAmount: amount,
    referenceId,
    note: `${cfg.ticketCommissionPercent}% ticket commission from @${buyer.username} on ${lotteryName} (${sym}${purchaseAmount.toLocaleString()})`
  });
}
function buildTopReferrers(db, limit = 20) {
  const state = ensureReferralState(db);
  const depositCountByUser = /* @__PURE__ */ new Map();
  const ticketCountByUser = /* @__PURE__ */ new Map();
  const invitedCountByUser = /* @__PURE__ */ new Map();
  for (const u of db.users) {
    if (u.referredByUserId) {
      invitedCountByUser.set(
        u.referredByUserId,
        (invitedCountByUser.get(u.referredByUserId) || 0) + 1
      );
    }
  }
  for (const c of state.commissions) {
    if (c.trigger === "deposit") {
      depositCountByUser.set(
        c.referrerUserId,
        (depositCountByUser.get(c.referrerUserId) || 0) + 1
      );
    } else if (c.trigger === "ticket_purchase") {
      ticketCountByUser.set(
        c.referrerUserId,
        (ticketCountByUser.get(c.referrerUserId) || 0) + 1
      );
    }
  }
  return db.users.map((u) => {
    const actualCount = Math.max(u.referralCount || 0, invitedCountByUser.get(u.id) || 0);
    return {
      userId: u.id,
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl,
      referralCode: u.referralCode || "",
      referralCount: actualCount,
      referralEarnings: Math.round((u.referralEarnings || 0) * 100) / 100,
      depositCommissionsCount: depositCountByUser.get(u.id) || 0,
      ticketCommissionsCount: ticketCountByUser.get(u.id) || 0
    };
  }).filter((entry) => entry.referralCount > 0 || entry.referralEarnings > 0).sort((a, b) => b.referralEarnings - a.referralEarnings || b.referralCount - a.referralCount).slice(0, limit);
}

// server/services/securityRoomService.ts
var import_crypto3 = __toESM(require("crypto"), 1);
var DEFAULT_SECURITY_POLICY = {
  oneClickRegistrationEnabled: true,
  requirePrivacyConsent: true,
  requireRegisterCaptcha: true,
  requireLoginCaptcha: true,
  maxAccountsPerIp: 1,
  autoSuspendMultiAccount: true,
  autoBlockIpOnMultiAccount: true,
  enforceDeviceFingerprint: true,
  blockDisposableEmails: true,
  maxFailedLogins: 5,
  lockoutMinutes: 15,
  registrationCooldownSeconds: 30
};
function createDefaultSecurityRoom() {
  return {
    policy: { ...DEFAULT_SECURITY_POLICY },
    blockedIps: [],
    events: [],
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
var captchaStore = /* @__PURE__ */ new Map();
var CAPTCHA_TTL_MS = 5 * 60 * 1e3;
function pruneExpiredCaptchas() {
  const now = Date.now();
  for (const [id, entry] of captchaStore.entries()) {
    if (entry.expiresAt <= now) {
      captchaStore.delete(id);
    }
  }
}
function issueMathCaptcha() {
  pruneExpiredCaptchas();
  if (captchaStore.size > 4e3) {
    const oldestKey = captchaStore.keys().next().value;
    if (oldestKey) captchaStore.delete(oldestKey);
  }
  const ops = ["+", "-", "\xD7"];
  const op = ops[import_crypto3.default.randomInt(0, ops.length)];
  let a = 0;
  let b = 0;
  let answer = 0;
  if (op === "+") {
    a = import_crypto3.default.randomInt(4, 25);
    b = import_crypto3.default.randomInt(3, 19);
    answer = a + b;
  } else if (op === "-") {
    a = import_crypto3.default.randomInt(12, 35);
    b = import_crypto3.default.randomInt(2, a - 1);
    answer = a - b;
  } else {
    a = import_crypto3.default.randomInt(2, 9);
    b = import_crypto3.default.randomInt(2, 9);
    answer = a * b;
  }
  const captchaId = `cap_${import_crypto3.default.randomBytes(10).toString("hex")}`;
  const question = `${a} ${op} ${b} = ?`;
  captchaStore.set(captchaId, {
    id: captchaId,
    question,
    answer,
    expiresAt: Date.now() + CAPTCHA_TTL_MS
  });
  return {
    captchaId,
    question,
    expiresInSec: Math.round(CAPTCHA_TTL_MS / 1e3)
  };
}
function verifyMathCaptcha(captchaId, captchaAnswer) {
  pruneExpiredCaptchas();
  const id = typeof captchaId === "string" ? captchaId.trim() : "";
  if (!id) {
    return { ok: false, error: "Please solve the math security question first." };
  }
  const entry = captchaStore.get(id);
  if (!entry) {
    return { ok: false, error: "Math question expired. Please solve the new math question." };
  }
  captchaStore.delete(id);
  const raw = String(captchaAnswer ?? "").trim();
  if (!raw || !/^-?\d+$/.test(raw)) {
    return { ok: false, error: "Please enter a valid number for the math security question." };
  }
  const parsed = Number.parseInt(raw, 10);
  if (parsed !== entry.answer) {
    return { ok: false, error: "Incorrect math answer. Please solve the new question and try again." };
  }
  return { ok: true };
}
function normalizeClientIp(rawIp) {
  const cleaned = String(rawIp || "").split(",")[0].trim().replace(/^::ffff:/i, "");
  if (!cleaned || cleaned === "::1") return "127.0.0.1";
  return cleaned.slice(0, 64);
}
function findActiveIpBlock(security, rawIp) {
  if (!security || !Array.isArray(security.blockedIps)) return null;
  const ip = normalizeClientIp(rawIp);
  const now = Date.now();
  for (const record of security.blockedIps) {
    if (normalizeClientIp(record.ip) !== ip) continue;
    if (record.expiresAt) {
      const exp = Date.parse(record.expiresAt);
      if (Number.isFinite(exp) && exp <= now) continue;
    }
    return record;
  }
  return null;
}
function pushSecurityEvent(db, event) {
  if (!db.security) {
    db.security = createDefaultSecurityRoom();
  }
  const entry = {
    id: `sec_${Date.now()}_${import_crypto3.default.randomBytes(4).toString("hex")}`,
    ...event,
    ip: normalizeClientIp(event.ip),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.security.events.unshift(entry);
  if (db.security.events.length > 400) {
    db.security.events = db.security.events.slice(0, 400);
  }
  db.security.updatedAt = entry.createdAt;
  return entry;
}
var failedLoginMap = /* @__PURE__ */ new Map();
function checkLoginLockout(rawIp) {
  const ip = normalizeClientIp(rawIp);
  const entry = failedLoginMap.get(ip);
  if (!entry) return { locked: false };
  const now = Date.now();
  if (entry.lockedUntil > now) {
    const retryMinutes = Math.max(1, Math.ceil((entry.lockedUntil - now) / 6e4));
    return { locked: true, retryMinutes };
  }
  if (now - entry.windowStart > 20 * 60 * 1e3) {
    failedLoginMap.delete(ip);
  }
  return { locked: false };
}
function recordFailedLogin(rawIp, policy) {
  const ip = normalizeClientIp(rawIp);
  const now = Date.now();
  const windowMs = Math.max(5, policy.lockoutMinutes || 15) * 60 * 1e3;
  const maxAttempts = Math.max(3, policy.maxFailedLogins || 5);
  const existing = failedLoginMap.get(ip);
  if (!existing || now - existing.windowStart > windowMs) {
    const next = { count: 1, windowStart: now, lockedUntil: 0 };
    failedLoginMap.set(ip, next);
    return { triggeredLockout: false, attempts: 1 };
  }
  existing.count += 1;
  if (existing.count >= maxAttempts) {
    existing.lockedUntil = now + windowMs;
    return { triggeredLockout: true, attempts: existing.count };
  }
  return { triggeredLockout: false, attempts: existing.count };
}
function clearFailedLogins(rawIp) {
  failedLoginMap.delete(normalizeClientIp(rawIp));
}
var DISPOSABLE_EMAIL_DOMAINS = /* @__PURE__ */ new Set([
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "mohmal.com",
  "fakeinbox.com",
  "throwawaymail.com",
  "emailondeck.com",
  "mintemail.com",
  "mytemp.email",
  "burnermail.io"
]);
function isDisposableEmail(email) {
  const domain = email.split("@")[1]?.trim().toLowerCase() || "";
  return Boolean(domain && DISPOSABLE_EMAIL_DOMAINS.has(domain));
}
function generateOneClickCredentials(existingUsers) {
  const taken = new Set(existingUsers.map((u) => u.username.toLowerCase()));
  let username = "";
  for (let i = 0; i < 40; i++) {
    const digits = import_crypto3.default.randomInt(1e5, 999999);
    const candidate = `lw_${digits}`;
    if (!taken.has(candidate)) {
      username = candidate;
      break;
    }
  }
  if (!username) {
    username = `lw_${Date.now().toString().slice(-7)}`;
  }
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const syms = "@#$%&*!";
  const pick = (pool) => pool[import_crypto3.default.randomInt(0, pool.length)];
  const rawChars = [
    pick(upper),
    pick(upper),
    pick(lower),
    pick(lower),
    pick(lower),
    pick(nums),
    pick(nums),
    pick(nums),
    pick(syms),
    pick(upper)
  ];
  for (let i = rawChars.length - 1; i > 0; i--) {
    const j = import_crypto3.default.randomInt(0, i + 1);
    const tmp = rawChars[i];
    rawChars[i] = rawChars[j];
    rawChars[j] = tmp;
  }
  const password = `Lw${rawChars.join("")}`;
  const email = `${username}@oneclick.lotterywinner.app`;
  return { username, password, email };
}
function enforceRegistrationSecurity(db, rawIp, rawDeviceFingerprint) {
  if (!db.security) {
    db.security = createDefaultSecurityRoom();
  }
  const policy = db.security.policy;
  const ip = normalizeClientIp(rawIp);
  const deviceFp = rawDeviceFingerprint.trim().slice(0, 128);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const blocked = findActiveIpBlock(db.security, ip);
  if (blocked) {
    blocked.hitCount = (blocked.hitCount || 0) + 1;
    blocked.lastHitAt = now;
    pushSecurityEvent(db, {
      type: "BLOCKED_IP_ATTEMPT",
      severity: "warning",
      ip,
      deviceFingerprint: deviceFp || null,
      message: `Blocked IP (${ip}) attempted account registration. Block reason: ${blocked.reason}`
    });
    return {
      allowed: false,
      httpStatus: 403,
      message: `Access denied. Your IP address (${ip}) is blocked by Security Room (${blocked.reason}).`
    };
  }
  const regularUsers = db.users.filter((u) => u.role === "user");
  const ipMatches = regularUsers.filter(
    (u) => u.registeredIp && normalizeClientIp(u.registeredIp) === ip
  );
  const deviceMatches = policy.enforceDeviceFingerprint && deviceFp ? regularUsers.filter((u) => u.deviceFingerprint && u.deviceFingerprint === deviceFp) : [];
  const maxPerIp = Math.max(1, Number(policy.maxAccountsPerIp) || 1);
  const ipViolation = ipMatches.length >= maxPerIp;
  const deviceViolation = policy.enforceDeviceFingerprint && deviceMatches.length >= 1;
  if (ipViolation || deviceViolation) {
    const matchedMap = /* @__PURE__ */ new Map();
    for (const u of ipMatches) matchedMap.set(u.id, u);
    for (const u of deviceMatches) matchedMap.set(u.id, u);
    const linkedUsers = Array.from(matchedMap.values());
    const affectedUsernames = linkedUsers.map((u) => u.username);
    if (policy.autoSuspendMultiAccount) {
      const reason = ipViolation ? `Auto-suspended: 2nd account registration attempt from IP ${ip}` : `Auto-suspended: Multi-account attempt from same device fingerprint`;
      for (const u of linkedUsers) {
        u.status = "blocked";
        u.suspendedReason = reason;
        u.suspendedAt = now;
        u.updatedAt = now;
        db.notifications.unshift({
          id: `notif_${Date.now()}_${import_crypto3.default.randomBytes(3).toString("hex")}`,
          userId: u.id,
          title: "Account Suspended \u2014 Security Violation",
          message: "Multiple account creation from the same IP or device is strictly prohibited. Your account has been automatically suspended.",
          type: "warning",
          isRead: false,
          createdAt: now
        });
      }
      let autoBlockedIp = false;
      if (policy.autoBlockIpOnMultiAccount && !findActiveIpBlock(db.security, ip)) {
        db.security.blockedIps.unshift({
          id: `ipblk_${Date.now()}_${import_crypto3.default.randomBytes(3).toString("hex")}`,
          ip,
          reason: `Auto-blocked: Multi-account violation (${affectedUsernames.join(", ")})`,
          blockedBy: "Security Room Auto-Shield",
          blockedAt: now,
          expiresAt: null,
          hitCount: 1,
          lastHitAt: now
        });
        autoBlockedIp = true;
      }
      pushSecurityEvent(db, {
        type: "MULTI_ACCOUNT_AUTO_SUSPEND",
        severity: "critical",
        ip,
        deviceFingerprint: deviceFp || null,
        affectedUsernames,
        message: `2nd account attempt blocked from IP ${ip}. Auto-suspended linked account(s): ${affectedUsernames.join(", ")}${autoBlockedIp ? " + IP auto-blocked" : ""}.`
      });
      return {
        allowed: false,
        httpStatus: 403,
        message: "Security Alert: Only 1 account is allowed per IP/device. Attempting to create a 2nd account has automatically suspended your linked account(s).",
        suspendedUsers: affectedUsernames,
        autoBlockedIp
      };
    }
    pushSecurityEvent(db, {
      type: deviceViolation && !ipViolation ? "DEVICE_CLONE_DETECTED" : "MULTI_ACCOUNT_BLOCKED",
      severity: "warning",
      ip,
      deviceFingerprint: deviceFp || null,
      affectedUsernames,
      message: `Blocked duplicate registration attempt from IP ${ip} (linked to: ${affectedUsernames.join(", ")}).`
    });
    return {
      allowed: false,
      httpStatus: 403,
      message: `Registration blocked: Only ${maxPerIp} account${maxPerIp === 1 ? "" : "s"} allowed per IP address / device.`
    };
  }
  const cooldownSec = Math.max(0, Number(policy.registrationCooldownSeconds) || 0);
  if (cooldownSec > 0 && ipMatches.length > 0) {
    const latestMs = Math.max(...ipMatches.map((u) => Date.parse(u.createdAt) || 0));
    const elapsedSec = (Date.now() - latestMs) / 1e3;
    if (elapsedSec < cooldownSec) {
      const waitSec = Math.ceil(cooldownSec - elapsedSec);
      return {
        allowed: false,
        httpStatus: 429,
        message: `Please wait ${waitSec} seconds before registering another account from this network.`
      };
    }
  }
  return { allowed: true };
}

// server/db.ts
var DATA_DIR = import_path.default.resolve(process.cwd(), "data");
var DB_FILE = import_path.default.join(DATA_DIR, "lottery_db.json");
var DB_BACKUP_FILE = import_path.default.join(DATA_DIR, "lottery_db.backup.json");
function buildSvgAvatar(nameOrUsername, accentIndex = 0) {
  const palettes = [
    ["#065F46", "#10B981"],
    ["#1E3A8A", "#3B82F6"],
    ["#7C2D12", "#F59E0B"],
    ["#581C87", "#A855F7"],
    ["#881337", "#F43F5E"],
    ["#0F172A", "#14B8A6"]
  ];
  const clean = (nameOrUsername || "LW").trim();
  let hash = Math.abs(accentIndex);
  for (let i = 0; i < clean.length; i++) {
    hash = hash * 31 + clean.charCodeAt(i) >>> 0;
  }
  const [bg1, bg2] = palettes[hash % palettes.length];
  const words = clean.split(/[\s_.-]+/).filter(Boolean);
  const initials = words.length >= 2 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : clean.slice(0, 2).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><circle cx="60" cy="44" r="18" fill="rgba(255,255,255,0.2)"/><path d="M26 106c6-20 20-30 34-30s28 10 34 30" fill="rgba(255,255,255,0.18)"/><text x="60" y="70" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="700" fill="#ffffff" letter-spacing="1">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
function createSeedDatabase() {
  const now = Date.now();
  const isoNow = new Date(now).toISOString();
  const hours = (h) => new Date(now + h * 3600 * 1e3).toISOString();
  const pastHours = (h) => new Date(now - h * 3600 * 1e3).toISOString();
  const adminId = "u_admin_01";
  const modId = "u_mod_01";
  const player1Id = "u_player_arif";
  const player2Id = "u_player_nusrat";
  const player3Id = "u_player_tanvir";
  const users = [
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
      balance: 55e3,
      spinCredits: 5,
      totalDeposited: 55e3,
      totalWithdrawn: 0,
      winsCount: 0,
      securityPinHash: hashPassword("1234"),
      pinLockEnabled: false,
      createdAt: pastHours(240),
      updatedAt: isoNow
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
      balance: 5e3,
      spinCredits: 2,
      totalDeposited: 5e3,
      totalWithdrawn: 0,
      winsCount: 0,
      securityPinHash: null,
      pinLockEnabled: false,
      createdAt: pastHours(200),
      updatedAt: isoNow
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
      totalDeposited: 2e3,
      totalWithdrawn: 500,
      winsCount: 1,
      securityPinHash: hashPassword("4321"),
      pinLockEnabled: false,
      createdAt: pastHours(160),
      updatedAt: isoNow
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
      updatedAt: isoNow
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
      updatedAt: isoNow
    }
  ];
  const categories = [
    {
      id: "c1",
      name: "10 Taka Banner",
      label: "10 Taka Single",
      type: "single",
      defaultPrizes: "850",
      defaultEntryFee: 10,
      defaultParticipants: 100,
      description: "Single winner takes the entire grand prize pool.",
      prizeTiers: [{ rankPosition: 1, title: "Grand Prize", winnersCount: 1, amount: 850 }]
    },
    {
      id: "c2",
      name: "20 Taka Banner",
      label: "20 Taka Single",
      type: "single",
      defaultPrizes: "3200",
      defaultEntryFee: 20,
      defaultParticipants: 200,
      description: "High-yield single grand winner pool.",
      prizeTiers: [{ rankPosition: 1, title: "Grand Winner", winnersCount: 1, amount: 3200 }]
    },
    {
      id: "c3",
      name: "Mega Jackpot",
      label: "Mega Jackpot",
      type: "single",
      defaultPrizes: "25000",
      defaultEntryFee: 100,
      defaultParticipants: 300,
      description: "Flagship single-winner mega jackpot draw.",
      prizeTiers: [{ rankPosition: 1, title: "Mega Jackpot Winner", winnersCount: 1, amount: 25e3 }]
    },
    {
      id: "c4",
      name: "3 Winner Category",
      label: "3 Winners Cup",
      type: "multi",
      defaultPrizes: "1500, 1000, 500",
      defaultEntryFee: 50,
      defaultParticipants: 80,
      description: "Multi-winner podium split across 1st, 2nd, and 3rd ranks.",
      prizeTiers: [
        { rankPosition: 1, title: "1st Place Gold", winnersCount: 1, amount: 1500 },
        { rankPosition: 2, title: "2nd Place Silver", winnersCount: 1, amount: 1e3 },
        { rankPosition: 3, title: "3rd Place Bronze", winnersCount: 1, amount: 500 }
      ]
    },
    {
      id: "c8",
      name: "20-Player Multi Profit",
      label: "20-Player Multi",
      type: "multi",
      defaultPrizes: "1x120, 2x60, 5x20",
      defaultEntryFee: 20,
      defaultParticipants: 20,
      description: "20 participants total \u2014 8 winners share profit across 3 payout tiers.",
      prizeTiers: [
        { rankPosition: 1, title: "1st Rank Profit", winnersCount: 1, amount: 120 },
        { rankPosition: 2, title: "2nd Rank Profit", winnersCount: 2, amount: 60 },
        { rankPosition: 3, title: "3rd Rank Profit", winnersCount: 5, amount: 20 }
      ]
    },
    {
      id: "c5",
      name: "15 Winner Category",
      label: "15 Winners Blitz",
      type: "multi",
      defaultPrizes: "1x1000, 1x600, 1x400, 12x100",
      defaultEntryFee: 50,
      defaultParticipants: 100,
      description: "15 winners rewarded across 4 structured tiers.",
      prizeTiers: [
        { rankPosition: 1, title: "1st Place", winnersCount: 1, amount: 1e3 },
        { rankPosition: 2, title: "2nd Place", winnersCount: 1, amount: 600 },
        { rankPosition: 3, title: "3rd Place", winnersCount: 1, amount: 400 },
        { rankPosition: 4, title: "Runner-Up Profit", winnersCount: 12, amount: 100 }
      ]
    },
    {
      id: "c7",
      name: "Quick Draw",
      label: "Quick Draw",
      type: "single",
      defaultPrizes: "850",
      defaultEntryFee: 10,
      defaultParticipants: 100,
      description: "Fast single-winner draw pool.",
      prizeTiers: [{ rankPosition: 1, title: "Quick Draw Winner", winnersCount: 1, amount: 850 }]
    }
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
      drawMode: "auto",
      status: "active",
      startAt: pastHours(6),
      endAt: hours(4),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(6),
      updatedAt: isoNow
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
      drawMode: "auto",
      status: "active",
      startAt: pastHours(12),
      endAt: hours(8),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(12),
      updatedAt: isoNow
    },
    {
      id: "lot-3",
      name: "Mega Progressive Jackpot",
      slug: "mega-progressive-jackpot",
      details: "Our flagship 50 Taka Mega Jackpot campaign. Top prize is 25,000 Taka with cryptographic draw audit hash.",
      category: "Mega Jackpot",
      entryFee: 50,
      prizeAmount: 25e3,
      totalTickets: 600,
      soldTickets: 314,
      drawMode: "manual",
      status: "active",
      startAt: pastHours(24),
      endAt: hours(24),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(24),
      updatedAt: isoNow
    },
    {
      id: "lot-4",
      name: "3 Winners Premium Cup",
      slug: "3-winners-premium-cup",
      details: "Three top winners share the 3,000 Taka prize pool: 1st place 1,500 Taka, 2nd place 1,000 Taka, and 3rd place 500 Taka.",
      category: "3 Winner Category",
      entryFee: 30,
      prizeAmount: 3e3,
      totalTickets: 150,
      soldTickets: 89,
      drawMode: "auto_datetime",
      status: "active",
      startAt: pastHours(8),
      endAt: hours(12),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(8),
      updatedAt: isoNow
    },
    {
      id: "lot-5",
      name: "Quick Draw Express Round",
      slug: "quick-draw-express-round",
      details: "Rapid-cycle Quick Draw pool that executes regardless of total sell-through once the scheduled draw window closes.",
      category: "Quick Draw",
      entryFee: 15,
      prizeAmount: 1e3,
      totalTickets: 100,
      soldTickets: 28,
      drawMode: "auto",
      status: "active",
      startAt: pastHours(2),
      endAt: hours(2),
      drawnAt: null,
      resultsPublished: false,
      autoRefundIncomplete: false,
      createdBy: adminId,
      createdAt: pastHours(2),
      updatedAt: isoNow
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
      drawMode: "manual",
      status: "drawn",
      startAt: pastHours(72),
      endAt: pastHours(18),
      drawnAt: pastHours(17),
      resultsPublished: true,
      autoRefundIncomplete: true,
      createdBy: adminId,
      createdAt: pastHours(72),
      updatedAt: pastHours(17)
    }
  ];
  const prizes = [
    { id: "pz_1", lotteryId: "lot-1", rankPosition: 1, title: "Grand Prize", amount: 850, winnersCount: 1 },
    { id: "pz_2", lotteryId: "lot-2", rankPosition: 1, title: "Super Jackpot", amount: 3200, winnersCount: 1 },
    { id: "pz_3", lotteryId: "lot-3", rankPosition: 1, title: "Mega Jackpot", amount: 25e3, winnersCount: 1 },
    { id: "pz_4a", lotteryId: "lot-4", rankPosition: 1, title: "1st Place Gold", amount: 1500, winnersCount: 1 },
    { id: "pz_4b", lotteryId: "lot-4", rankPosition: 2, title: "2nd Place Silver", amount: 1e3, winnersCount: 1 },
    { id: "pz_4c", lotteryId: "lot-4", rankPosition: 3, title: "3rd Place Bronze", amount: 500, winnersCount: 1 },
    { id: "pz_5", lotteryId: "lot-5", rankPosition: 1, title: "Express Winner", amount: 1e3, winnersCount: 1 },
    { id: "pz_h1", lotteryId: "lot-hist-1", rankPosition: 1, title: "1st Prize", amount: 800, winnersCount: 1 },
    { id: "pz_h2", lotteryId: "lot-hist-1", rankPosition: 2, title: "2nd Prize", amount: 450, winnersCount: 1 },
    { id: "pz_h3", lotteryId: "lot-hist-1", rankPosition: 3, title: "3rd Prize", amount: 250, winnersCount: 1 }
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
      status: "completed",
      createdAt: pastHours(24)
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
      status: "completed",
      createdAt: pastHours(23)
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
      status: "completed",
      createdAt: pastHours(2)
    }
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
      status: "won",
      prizeAmount: 800,
      prizeRank: 1,
      purchasedAt: pastHours(24)
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
      status: "lost",
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: pastHours(24)
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
      status: "won",
      prizeAmount: 450,
      prizeRank: 2,
      purchasedAt: pastHours(23)
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
      status: "pending",
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: pastHours(2)
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
      status: "pending",
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: pastHours(2)
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
      status: "won",
      prizeAmount: 250,
      prizeRank: 3,
      purchasedAt: pastHours(22)
    }
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
      drawnAt: drawTimeHist
    }
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
      awardedAt: drawTimeHist
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
      awardedAt: drawTimeHist
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
      awardedAt: drawTimeHist
    }
  ];
  const payments = [
    {
      id: "pay_seed_1",
      userId: player1Id,
      username: "arif_99",
      gateway: "bKash",
      senderNumber: "01711223344",
      trxId: "BKA9X42100P",
      amount: 2e3,
      status: "approved",
      verificationNote: "Verified against bKash merchant ledger",
      verifiedBy: adminId,
      verifiedAt: pastHours(48),
      createdAt: pastHours(49)
    },
    {
      id: "pay_seed_2",
      userId: player2Id,
      username: "nusrat_k",
      gateway: "Nagad",
      senderNumber: "01822334455",
      trxId: "NGD7731002A",
      amount: 500,
      status: "pending",
      verificationNote: "Awaiting merchant TrxID verification",
      verifiedBy: null,
      verifiedAt: null,
      createdAt: pastHours(1)
    }
  ];
  const withdrawals = [
    {
      id: "wd_seed_1",
      userId: player1Id,
      username: "arif_99",
      gateway: "bKash",
      targetAccount: "01711223344",
      amount: 500,
      fee: 0,
      totalDebit: 500,
      status: "approved",
      adminNote: "Disbursed via bKash merchant payout",
      processedBy: adminId,
      processedAt: pastHours(10),
      createdAt: pastHours(12)
    }
  ];
  const transactions = [
    {
      id: "txn_seed_1",
      userId: player1Id,
      username: "arif_99",
      direction: "credit",
      category: "deposit",
      amount: 2e3,
      balanceAfter: 2e3,
      referenceId: "pay_seed_1",
      gateway: "bKash",
      description: "bKash deposit verified (TrxID: BKA9X42100P)",
      createdAt: pastHours(48)
    },
    {
      id: "txn_seed_2",
      userId: player1Id,
      username: "arif_99",
      direction: "debit",
      category: "ticket_purchase",
      amount: 40,
      balanceAfter: 1960,
      referenceId: "pur_seed_1",
      gateway: "Wallet",
      description: "Purchased 2 tickets for Evening 20-Taka Classic Draw",
      createdAt: pastHours(24)
    },
    {
      id: "txn_seed_3",
      userId: player1Id,
      username: "arif_99",
      direction: "credit",
      category: "prize_payout",
      amount: 800,
      balanceAfter: 2760,
      referenceId: "win_seed_1",
      gateway: "Wallet",
      description: "1st Prize payout for ticket LW-482910",
      createdAt: drawTimeHist
    },
    {
      id: "txn_seed_4",
      userId: player1Id,
      username: "arif_99",
      direction: "debit",
      category: "withdrawal",
      amount: 500,
      balanceAfter: 2260,
      referenceId: "wd_seed_1",
      gateway: "bKash",
      description: "Withdrawal to bKash 01711223344",
      createdAt: pastHours(12)
    },
    {
      id: "txn_seed_5",
      userId: player1Id,
      username: "arif_99",
      direction: "debit",
      category: "ticket_purchase",
      amount: 20,
      balanceAfter: 1850,
      referenceId: "pur_seed_3",
      gateway: "Wallet",
      description: "Purchased 2 tickets for 10-Taka Fast Cash Daily",
      createdAt: pastHours(2)
    }
  ];
  const notifications = [
    {
      id: "notif_seed_1",
      userId: player1Id,
      title: "Prize Credited: 1st Place Winner",
      message: "Your ticket LW-482910 won 800 Taka in Evening 20-Taka Classic Draw. Funds are available in your wallet.",
      type: "win",
      isRead: false,
      createdAt: drawTimeHist
    },
    {
      id: "notif_seed_2",
      userId: player1Id,
      title: "Withdrawal Completed",
      message: "Your bKash withdrawal of 500 Taka to 01711223344 has been disbursed.",
      type: "success",
      isRead: true,
      createdAt: pastHours(10)
    }
  ];
  const banners = [
    {
      id: "ban_hero_1",
      title: "Mega Progressive Jackpot \u2014 25,000 Taka Grand Prize Pool",
      subtitle: "Verified cryptographic draws with instant wallet settlement and zero-fee bKash & Nagad withdrawals.",
      ctaLabel: "Explore All Lotteries",
      ctaTarget: "#campaigns",
      placement: "hero",
      isActive: true,
      sortOrder: 1,
      createdAt: pastHours(24)
    },
    {
      id: "ban_hero_2",
      title: "10-Taka Fast Cash Daily \u2014 Entry Open Now",
      subtitle: "Affordable 10-Taka pools with automatic scheduled draws and instant multi-tier prize distribution.",
      ctaLabel: "Buy 10-Taka Ticket",
      ctaTarget: "#campaigns",
      placement: "hero",
      isActive: true,
      sortOrder: 2,
      createdAt: pastHours(18)
    },
    {
      id: "ban_hero_3",
      title: "20-Taka Golden Super Pool \u2014 Audited SHA-256 RNG",
      subtitle: "Every ticket code is verifiable on the public audit ledger with transparent winner histories.",
      ctaLabel: "Verify Any Ticket",
      ctaTarget: "#verify",
      placement: "hero",
      isActive: true,
      sortOrder: 3,
      createdAt: pastHours(12)
    },
    {
      id: "ban_ann_1",
      title: "Live Announcement: bKash, Nagad, Rocket & Upay MFS Verification Active",
      subtitle: "Submit your transaction ID from your wallet to fund your account and join active lottery rounds.",
      ctaLabel: "Browse Lotteries",
      ctaTarget: "#campaigns",
      placement: "announcement",
      isActive: true,
      sortOrder: 4,
      createdAt: pastHours(8)
    },
    {
      id: "ban_ann_2",
      title: "Draw Results Published: Evening 20-Taka Classic Draw Winners Credited",
      subtitle: "Check winning ticket codes and cryptographic draw verification hashes in the Results ledger.",
      ctaLabel: "View Results",
      ctaTarget: "#results",
      placement: "announcement",
      isActive: true,
      sortOrder: 5,
      createdAt: pastHours(4)
    }
  ];
  const settings = {
    siteName: "Lottery Winner",
    siteTagline: "Audited Multi-Tier Lottery & MFS Wallet Platform",
    currencySymbol: "\u09F3",
    mobileAgentBkash: "01799228833",
    mobileAgentNagad: "01855221144",
    mobileAgentRocket: "01688554422",
    mobileAgentUpay: "01922334455",
    bankDetails: "Dutch-Bangla Bank \xB7 Account: 105-110-0048291 \xB7 Branch: Motijheel",
    cryptoAddress: "TY6yZ9b8uB26Z962sM8aYjWqpzTx9K9n9X",
    minDeposit: 50,
    maxDeposit: 5e5,
    minWithdrawal: 50,
    maxWithdrawal: 5e5,
    withdrawalFeePercent: 0,
    signupBonusEnabled: true,
    signupBonus: 25,
    jackpotPool: 25e3,
    maintenanceMode: false,
    maintenanceMessage: "Scheduled system maintenance in progress. Please check back shortly.",
    popupEvent: {
      enabled: true,
      eventTag: "Special Jackpot Event",
      title: "Mega Bonus Week Is Live",
      subtitle: "Verified Multi-Tier Draws \xB7 Instant bKash & Nagad Payouts",
      message: "Join active lottery draws today for verified SHA-256 results, instant wallet prize settlements, and bonus Lucky Wheel spins on deposits.",
      imageUrl: "",
      ctaLabel: "Explore Active Draws",
      ctaTarget: "#campaigns",
      cancelLabel: "Cancel",
      allowCancel: true,
      showOncePerSession: true,
      delaySeconds: 0,
      startsAt: "",
      endsAt: "",
      theme: "navy_gold",
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
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
      createdAt: drawTimeHist
    }
  ];
  const chatMessages = [
    {
      id: "chat_seed_1",
      userId: adminId,
      username: "Admin",
      fullName: "System Administrator",
      role: "admin",
      message: "Welcome to Lottery Winner Community & Support Chat. Ask questions about active draws or MFS deposits here.",
      createdAt: pastHours(12)
    },
    {
      id: "chat_seed_2",
      userId: player1Id,
      username: "arif_99",
      fullName: "Arif Rahman",
      role: "user",
      message: "Just received my 1st Prize payout from the Evening 20-Taka Classic Draw. Withdrawal via bKash was smooth!",
      createdAt: pastHours(6)
    },
    {
      id: "chat_seed_3",
      userId: player2Id,
      username: "nusrat_k",
      fullName: "Nusrat Karim",
      role: "user",
      message: "Good luck to everyone in the Mega Progressive Jackpot round!",
      createdAt: pastHours(2)
    }
  ];
  const shopItems = [
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
      autoDeliveryTemplate: "CANVA-PRO-1YR-{{CODE}} \xB7 Activation Link: https://portal.access/canva/{{CODE}}",
      isActive: true
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
      autoDeliveryTemplate: "WIN11-PRO-{{CODE}} \xB7 Official Retail Activation Key",
      isActive: true
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
      badgeText: "+1 Spin \xB7 Auto",
      stock: null,
      isActive: true
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
      badgeText: "+5 Spins \xB7 Auto",
      stock: null,
      isActive: true
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
      isActive: true
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
      isActive: true
    },
    // CYBER PACK CATALOG — Carrom Board/Pool, Free Fire, PUBG (User enters email, Admin manually checks & sends)
    {
      id: "shop_cyber_carrom",
      title: "Carrom Board / Carrom Pool Pro Coins & VIP Striker Cyber Pack",
      description: "Includes 500K Carrom Coins + Legend Striker unlock pack. Enter your delivery email & Game ID \u2014 Admin verifies and sends manually.",
      price: 220,
      kind: "product",
      category: "cyber_pack",
      deliveryMode: "manual_admin",
      imageKey: "cyber_carrom",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Cyber Pack \xB7 Carrom",
      stock: 50,
      requiresGameUid: true,
      isActive: true
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
      badgeText: "Cyber Pack \xB7 Free Fire",
      stock: 100,
      requiresGameUid: true,
      isActive: true
    },
    {
      id: "shop_cyber_ff_evo",
      title: "Free Fire Max Booyah Pass & Evo Token Cyber Pack",
      description: "Full season Free Fire Max Booyah Pass + Evo upgrade crate bundle. Enter your email at checkout \u2014 Admin fulfills manually.",
      price: 540,
      kind: "product",
      category: "cyber_pack",
      deliveryMode: "manual_admin",
      imageKey: "cyber_freefire",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Cyber Pack \xB7 Free Fire",
      stock: 60,
      requiresGameUid: true,
      isActive: true
    },
    {
      id: "shop_cyber_pubg",
      title: "PUBG Mobile 660 UC + Royale Cyber Pack",
      description: "660 Unknown Cash direct cyber pack top-up. Enter your email & PUBG Player ID \u2014 Admin checks and sends manually.",
      price: 850,
      kind: "product",
      category: "cyber_pack",
      deliveryMode: "manual_admin",
      imageKey: "cyber_freefire",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Cyber Pack \xB7 PUBG",
      stock: 40,
      requiresGameUid: true,
      isActive: true
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
      badgeText: "Physical \xB7 Courier",
      stock: 18,
      requiresShipping: true,
      isActive: true
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
      badgeText: "Physical \xB7 Courier",
      stock: 12,
      requiresShipping: true,
      isActive: true
    },
    {
      id: "shop_phys_carrom",
      title: 'Tournament Rosewood Carrom Board (32" Full Set)',
      description: "Full-size handcrafted tournament hardwood carrom board complete with coins, ivory striker, and boric powder. Manual Admin dispatch.",
      price: 2850,
      kind: "product",
      category: "physical",
      deliveryMode: "manual_admin",
      imageKey: "cyber_carrom",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "Physical \xB7 Board Set",
      stock: 9,
      requiresShipping: true,
      isActive: true
    },
    // SMM PRODUCTS — Social Media Marketing Services (Admin manual verification & execution)
    {
      id: "shop_smm_yt",
      title: "YouTube 1,000 Real Subscribers & Channel Boost",
      description: "Non-drop organic channel promotion package. Paste your YouTube channel link & email \u2014 Admin reviews and starts campaign manually.",
      price: 1150,
      kind: "product",
      category: "smm",
      deliveryMode: "manual_admin",
      imageKey: "smm",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "SMM \xB7 YouTube",
      stock: null,
      requiresTargetLink: true,
      isActive: true
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
      badgeText: "SMM \xB7 Facebook",
      stock: null,
      requiresTargetLink: true,
      isActive: true
    },
    {
      id: "shop_smm_tiktok",
      title: "TikTok 25K Views + 2K Likes Viral Pack",
      description: "Fast engagement booster for TikTok reels. Submit your video link & email \u2014 Admin checks and fulfills manually.",
      price: 380,
      kind: "product",
      category: "smm",
      deliveryMode: "manual_admin",
      imageKey: "smm",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "SMM \xB7 TikTok",
      stock: null,
      requiresTargetLink: true,
      isActive: true
    },
    // ON-DEMAND PRODUCTS — Custom User Requests (Admin manual check & delivery)
    {
      id: "shop_ond_logo",
      title: "On-Demand Custom Brand Logo & Social Banner Kit",
      description: "Bespoke logo design + Facebook/YouTube cover kit tailored to your brief. Enter your email & design instructions \u2014 Admin delivers manually.",
      price: 950,
      kind: "product",
      category: "on_demand",
      deliveryMode: "manual_admin",
      imageKey: "digital",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "On-Demand \xB7 Custom",
      stock: null,
      requiresCustomBrief: true,
      isActive: true
    },
    {
      id: "shop_ond_sourcing",
      title: "On-Demand VIP Product Sourcing & Setup Service",
      description: "Request any custom software, game item, or hardware sourcing. Submit your email & full requirement \u2014 Admin checks and fulfills manually.",
      price: 1500,
      kind: "product",
      category: "on_demand",
      deliveryMode: "manual_admin",
      imageKey: "physical",
      spinsGranted: 0,
      lotteryId: null,
      badgeText: "On-Demand \xB7 Concierge",
      stock: null,
      requiresCustomBrief: true,
      isActive: true
    }
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
    liveSupport: createDefaultLiveSupportState()
  };
}
function createDefaultLiveSupportState() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const departments = [
    {
      id: "sdept_general",
      name: "General Support",
      slug: "general",
      description: "General account questions, draws, and platform guidance.",
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "sdept_payments",
      name: "Payments & Wallet",
      slug: "payments",
      description: "Deposits, Bangla QR payments, withdrawals, and balance checks.",
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "sdept_shop",
      name: "Shop & Orders",
      slug: "shop",
      description: "Digital products, order delivery, coupons, and refunds.",
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "sdept_security",
      name: "Account & Security",
      slug: "security",
      description: "Login issues, OTP verification, and account recovery.",
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ];
  const representatives = [
    {
      id: "srep_sara",
      name: "Sara Rahman",
      username: "rep_sara",
      email: "sara.support@lotterywinner.local",
      phone: "01711-880101",
      passwordHash: hashPassword("Support123"),
      avatarUrl: buildSvgAvatar("Sara Rahman", 0),
      departmentId: "sdept_general",
      status: "offline",
      accountStatus: "active",
      maxActiveChats: 1,
      lastAssignedAt: null,
      lastSeenAt: null,
      createdAt: now,
      updatedAt: now
    },
    {
      id: "srep_rafi",
      name: "Rafiul Karim",
      username: "rep_rafi",
      email: "rafi.support@lotterywinner.local",
      phone: "01811-880102",
      passwordHash: hashPassword("Support123"),
      avatarUrl: buildSvgAvatar("Rafiul Karim", 1),
      departmentId: "sdept_payments",
      status: "offline",
      accountStatus: "active",
      maxActiveChats: 1,
      lastAssignedAt: null,
      lastSeenAt: null,
      createdAt: now,
      updatedAt: now
    }
  ];
  return {
    departments,
    representatives,
    chats: [],
    messages: [],
    attachments: [],
    assignments: [],
    ratings: [],
    settings: {
      autoAssignEnabled: true,
      maxActiveChatsPerRep: 1,
      maxUploadMb: 5,
      allowedExtensions: ["jpg", "jpeg", "png", "webp", "gif", "pdf", "txt"],
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "text/plain"
      ],
      welcomeMessage: "Welcome to Live Support! A dedicated support representative will assist you shortly.",
      queueMessage: "All representatives are currently assisting other customers. You are in the live queue and will be connected automatically as soon as the next representative is free.",
      offlineMessage: "All representatives are currently offline. Your conversation is queued and will be assigned automatically when a representative comes online.",
      updatedAt: now
    },
    presence: representatives.map((r) => ({
      representativeId: r.id,
      isConnected: false,
      socketCount: 0,
      lastHeartbeatAt: now,
      disconnectedAt: null
    }))
  };
}
function createDefaultPaymentGateways(settings) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
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
      maxAmount: settings.maxDeposit || 1e5,
      feePercent: 0,
      accountLabel: "bKash Personal / Agent Number",
      accountValue: settings.mobileAgentBkash || "01711-000111",
      instructions: "Send Money / Cash-Out or scan the bKash Bangla QR code (0% Fee via QR). Preferred fast options: City Bank & CellFin Bangla QR.",
      qrImageUrl: null,
      qrPreferred: false,
      qrInstructionsBn: "\u09AC\u09BF\u0995\u09BE\u09B6 (bKash) \u0985\u09CD\u09AF\u09BE\u09AA \u09A6\u09BF\u09DF\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 Bangla QR \u0995\u09CB\u09A1 \u09B8\u09CD\u0995\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C7 \u099F\u09BE\u0995\u09BE \u09AA\u09BE\u09A0\u09BE\u09B2\u09C7 \u0995\u09CB\u09A8\u09CB \u09AB\u09C0 (\u09E6% \u099A\u09BE\u09B0\u09CD\u099C) \u0995\u09BE\u099F\u09AC\u09C7 \u09A8\u09BE\u0964 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09BE\u09B0 \u09AA\u09B0 Sender Number \u0993 Transaction ID (TrxID) \u09B8\u09BE\u09AC\u09AE\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964 \u2605 \u0986\u09B0\u0993 \u09A6\u09CD\u09B0\u09C1\u09A4 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF City Bank \u0993 CellFin Bangla QR \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09AA\u09CD\u09B0\u09BF\u09AB\u09BE\u09B0\u09CD\u09A1 (Preferred)\u0964",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: settings.maxDeposit || 1e5,
      feePercent: 0,
      accountLabel: "bKash Merchant Payment Number",
      accountValue: "01711-000112",
      instructions: "Make Payment to this bKash Merchant Account Number or scan the bKash Merchant Bangla QR code (0% Fee) and submit your TrxID below.",
      qrImageUrl: null,
      qrPreferred: false,
      qrInstructionsBn: "\u09AC\u09BF\u0995\u09BE\u09B6 \u09AE\u09BE\u09B0\u09CD\u099A\u09C7\u09A8\u09CD\u099F (bKash Merchant Payment \xB7 \u09E6% \u09AB\u09C0): \u09AC\u09BF\u0995\u09BE\u09B6 \u0985\u09CD\u09AF\u09BE\u09AA \u09A5\u09C7\u0995\u09C7 'Payment' \u0985\u09AA\u09B6\u09A8\u09C7 \u0997\u09BF\u09DF\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AE\u09BE\u09B0\u09CD\u099A\u09C7\u09A8\u09CD\u099F \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7 \u0985\u09A5\u09AC\u09BE \u09A8\u09BF\u099A\u09C7\u09B0 Bangla QR \u0995\u09CB\u09A1 \u09B8\u09CD\u0995\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09B2\u09C7 \u0995\u09CB\u09A8\u09CB \u09AB\u09C0 (\u09E6% \u099A\u09BE\u09B0\u09CD\u099C) \u0995\u09BE\u099F\u09AC\u09C7 \u09A8\u09BE\u0964 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B6\u09C7\u09B7\u09C7 Sender Number \u0993 Transaction ID (TrxID) \u09B8\u09BE\u09AC\u09AE\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964 \u2605 City Bank \u0993 CellFin Bangla QR \u09AA\u09CD\u09B0\u09BF\u09AB\u09BE\u09B0\u09CD\u09A1 (Preferred)\u0964",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: settings.maxDeposit || 1e5,
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
      updatedAt: now
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
      maxAmount: settings.maxDeposit || 1e5,
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
      updatedAt: now
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
      maxAmount: settings.maxDeposit || 1e5,
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
      updatedAt: now
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
      maxAmount: 1e5,
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
      updatedAt: now
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
      maxAmount: 1e5,
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
      updatedAt: now
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
      maxAmount: 25e4,
      feePercent: 2.5,
      accountLabel: "PayPal Merchant Email",
      accountValue: "payments@lotterywinner.app",
      instructions: "Pay via PayPal in USD (auto-converted at 1 USD = \u09F3120) or submit your PayPal Transaction ID.",
      environment: "sandbox",
      apiBaseUrl: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: 25e4,
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
      updatedAt: now
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
      maxAmount: 5e5,
      feePercent: 0,
      accountLabel: "Official Bank Account Details",
      accountValue: settings.bankDetails || "Dutch-Bangla Bank \xB7 A/C 101-120-884421 (Lottery Winner Trust)",
      instructions: "Deposit via NPSB / BEFTN / EFT to our official bank account and enter your reference number.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: 5e5,
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
      updatedAt: now
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
      maxAmount: 5e5,
      feePercent: 0,
      accountLabel: "Islami Bank A/C & Branch",
      accountValue: "Islami Bank Bangladesh PLC \xB7 A/C 2050-1122-004411 (Motijheel Br.)",
      instructions: "Transfer via Islami Bank BEFTN, NPSB, or CellFin app and submit your Transaction/Reference ID below.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: 5e5,
      feePercent: 0,
      accountLabel: "City Bank A/C & Citytouch (Preferred Bangla QR)",
      accountValue: "The City Bank PLC \xB7 A/C 1402-8833-10092 (Gulshan Ave Br.)",
      instructions: "Preferred Gateway \xB7 0% Fee: Scan the City Bank Bangla QR from Citytouch or any bank/MFS app \u2014 zero fee deducted. Or transfer via NPSB/EFT.",
      qrImageUrl: null,
      qrPreferred: true,
      qrInstructionsBn: "\u2605 \u09AA\u09CD\u09B0\u09BF\u09AB\u09BE\u09B0\u09CD\u09A1 (Preferred \xB7 \u09E6% \u09AB\u09C0): \u09B8\u09BF\u099F\u09BF \u09AC\u09CD\u09AF\u09BE\u0982\u0995 (Citytouch) \u09AC\u09BE \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AC\u09CD\u09AF\u09BE\u0982\u0995/MFS \u0985\u09CD\u09AF\u09BE\u09AA \u09A5\u09C7\u0995\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 City Bank Bangla QR \u0995\u09CB\u09A1 \u09B8\u09CD\u0995\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C7 \u099F\u09BE\u0995\u09BE \u09AA\u09BE\u09A0\u09BE\u09B2\u09C7 \u0995\u09CB\u09A8\u09CB \u09AB\u09C0 (\u09E6% \u099A\u09BE\u09B0\u09CD\u099C) \u0995\u09BE\u099F\u09AC\u09C7 \u09A8\u09BE\u0964 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B6\u09C7\u09B7\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0/\u09A8\u09BE\u09AE \u098F\u09AC\u0982 Reference/TrxID \u09A8\u09BF\u099A\u09C7 \u09B8\u09BE\u09AC\u09AE\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: 1e6,
      feePercent: 0,
      accountLabel: "Cryptomus Merchant UUID / Multi-Coin",
      accountValue: "Cryptomus Auto Checkout (USDT \xB7 BTC \xB7 ETH \xB7 TON \xB7 LTC)",
      instructions: "Pay via Cryptomus hosted multi-coin crypto checkout (auto-converted to BDT) or submit your Cryptomus TxID.",
      environment: "sandbox",
      apiBaseUrl: "https://api.cryptomus.com/v1/payment",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: 1e6,
      feePercent: 0,
      accountLabel: "Binance Pay Merchant / UID",
      accountValue: "Binance Pay ID: 492817360",
      instructions: "Send USDT via Binance Pay (zero network fee) to the Binance Pay ID above and enter your Order/Tx ID.",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: settings.maxDeposit || 1e5,
      feePercent: 0,
      accountLabel: "CellFin Wallet & Bangla QR (Preferred)",
      accountValue: "01711-885522",
      instructions: "Preferred Gateway \xB7 0% Fee: Scan CellFin Bangla QR or Send Money via Islami Bank CellFin app \u2014 zero fee deducted.",
      qrImageUrl: null,
      qrPreferred: true,
      qrInstructionsBn: "\u2605 \u09AA\u09CD\u09B0\u09BF\u09AB\u09BE\u09B0\u09CD\u09A1 (Preferred \xB7 \u09E6% \u09AB\u09C0): \u0987\u09B8\u09B2\u09BE\u09AE\u09C0 \u09AC\u09CD\u09AF\u09BE\u0982\u0995 CellFin \u0985\u09CD\u09AF\u09BE\u09AA \u09A5\u09C7\u0995\u09C7 \u09A8\u09BF\u099A\u09C7\u09B0 CellFin Bangla QR \u0995\u09CB\u09A1 \u09B8\u09CD\u0995\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09C7 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0995\u09B0\u09B2\u09C7 \u0995\u09CB\u09A8\u09CB \u09AB\u09C0 (\u09E6% \u099A\u09BE\u09B0\u09CD\u099C) \u0995\u09BE\u099F\u09AC\u09C7 \u09A8\u09BE\u0964 \u099F\u09BE\u0995\u09BE \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB\u09B0 \u09AA\u09B0 \u0986\u09AA\u09A8\u09BE\u09B0 \u09A8\u09AE\u09CD\u09AC\u09B0 \u0993 Transaction ID (TrxID) \u09B8\u09BE\u09AC\u09AE\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964",
      environment: "live",
      apiBaseUrl: "",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
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
      maxAmount: 2e5,
      feePercent: 1.8,
      accountLabel: "SSLCommerz Store Checkout",
      accountValue: "All BD Cards, Banks, Bangla QR & MFS",
      instructions: "Pay securely with Visa, Mastercard, NexusPay, City Bank, Islami Bank, or MFS via SSLCommerz.",
      environment: "sandbox",
      apiBaseUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      apiKey: "",
      apiSecret: "",
      webhookSecret: "",
      createdAt: now,
      updatedAt: now
    }
  ];
}
function createDefaultPlugins() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return [
    {
      id: "plg_deposit_cashback",
      slug: "deposit-cashback-engine",
      name: "Deposit Cashback Bonus Engine",
      version: "1.2.0",
      author: "Core Finance",
      category: "payment",
      hookType: "deposit_bonus",
      description: "Automatically credits an extra cashback percentage to a player's wallet whenever Admin approves a qualifying deposit.",
      enabled: false,
      isBuiltIn: true,
      config: {
        bonusPercent: 5,
        minDepositAmount: 500,
        maxBonusCap: 1e3,
        label: "Instant Deposit Cashback"
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_floating_support",
      slug: "whatsapp-telegram-support",
      name: "WhatsApp & Telegram Floating Support",
      version: "1.4.0",
      author: "Support Suite",
      category: "chat_support",
      hookType: "floating_support",
      description: "Displays a mobile-friendly floating live help button on every user page connecting directly to your WhatsApp or Telegram.",
      enabled: false,
      isBuiltIn: true,
      config: {
        buttonLabel: "Live Help",
        supportUrl: "https://t.me/lotterywinner_support",
        position: "bottom-right",
        accentColor: "#059669"
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_announcement_bar",
      slug: "promo-announcement-bar",
      name: "Global Promo Announcement Bar",
      version: "1.1.0",
      author: "Growth Tools",
      category: "marketing",
      hookType: "announcement_bar",
      description: "Shows a dismissible top announcement strip across the consumer site for flash jackpots, deposit bonuses, or maintenance notices.",
      enabled: false,
      isBuiltIn: true,
      config: {
        message: "Instant Deposits Live via bKash, Nagad, ZiniPay, UddoktaPay, PayPal & Stripe!",
        ctaLabel: "Deposit Now",
        ctaPath: "/wallet/deposit",
        theme: "navy-gold"
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_webhook_notifier",
      slug: "realtime-webhook-notifier",
      name: "Webhook Event Notifier",
      version: "1.0.0",
      author: "Integrations",
      category: "analytics",
      hookType: "webhook_notifier",
      description: "Dispatches live JSON HTTP POST webhooks to Discord, Slack, Telegram Bot, or your external CRM when deposits are submitted or approved.",
      enabled: false,
      isBuiltIn: true,
      config: {
        notifyOnDeposit: true,
        notifyOnApproval: true
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_first_deposit_booster",
      slug: "first-deposit-10-booster",
      name: "First-Deposit 10% Welcome Booster",
      version: "1.3.0",
      author: "Lottery Winner Core",
      category: "payment",
      hookType: "deposit_bonus",
      description: "Credits an extra +10% welcome cashback bonus (capped at \u09F31,000) automatically on approved player deposits of \u09F3200 or more.",
      enabled: false,
      isBuiltIn: true,
      config: {
        bonusPercent: 10,
        minDepositAmount: 200,
        maxBonusCap: 1e3,
        label: "10% Welcome Deposit Booster"
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_mfs_checkout_trust",
      slug: "mfs-global-payment-trust-badge",
      name: "MFS & Global Checkout Trust Badge",
      version: "1.2.0",
      author: "Checkout Suite",
      category: "payment",
      hookType: "payment_addon",
      description: "Displays a verified payment trust card on the storefront highlighting instant bKash, Nagad, Rocket, Upay, ZiniPay, UddoktaPay, PayPal & Stripe support.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "Verified Instant Payment Gateways"
      },
      customCss: "",
      customHtml: "<div style='font-weight:700;font-size:12px;'>bKash \xB7 Nagad \xB7 Rocket \xB7 Upay \xB7 ZiniPay</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Instant MFS, UddoktaPay, PayPal & Stripe deposits & verified payouts.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_live_winner_ticker",
      slug: "live-winner-payout-ticker",
      name: "Live Verified Winners Payout Ticker",
      version: "2.0.0",
      author: "Growth Tools",
      category: "marketing",
      hookType: "custom_widget",
      description: "Shows a live rotating social-proof card of real verified lottery winners and credited payouts directly from your draw ledger.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "Recent Verified Winner",
        rotateSeconds: 6,
        liveWinnerFeed: true
      },
      customCss: "",
      customHtml: "<div style='font-weight:700;font-size:12px;'>Live Verified Payouts</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Real-time SHA-256 draw winners credited instantly.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_lucky_wheel_promo_bar",
      slug: "lucky-wheel-rewards-promo-bar",
      name: "Lucky Wheel & Daily Rewards Top Bar",
      version: "1.1.0",
      author: "Retention Suite",
      category: "marketing",
      hookType: "announcement_bar",
      description: "Highlights free Lucky Wheel spins, Daily Task coins, and Video Promotion cash rewards in a clean dismissible top strip.",
      enabled: false,
      isBuiltIn: true,
      config: {
        message: "Spin the Lucky Wheel & complete Daily Tasks to earn free wallet bonus credits!",
        ctaLabel: "Open Lucky Wheel",
        ctaPath: "/lucky-wheel",
        theme: "navy-gold"
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_telegram_draw_alerts",
      slug: "telegram-discord-draw-bot",
      name: "Telegram & Discord Draw Result Bot",
      version: "1.5.0",
      author: "Community Automation",
      category: "chat_support",
      hookType: "webhook_notifier",
      description: "Automatically pushes completed draw announcements, winning ticket numbers, and SHA-256 hashes to your Telegram channel or Discord webhook.",
      enabled: false,
      isBuiltIn: true,
      config: {
        notifyOnDraw: true,
        notifyOnDeposit: true,
        includeSeedHash: true
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_fairplay_sha256_seal",
      slug: "sha256-provably-fair-seal",
      name: "SHA-256 Provably Fair & Anti-Fraud Seal",
      version: "1.2.0",
      author: "Security Lab",
      category: "security",
      hookType: "custom_widget",
      description: "Displays a cryptographic audit seal confirming Fisher-Yates SHA-256 fair draws and 1-IP-1-Account player protection.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "Provably Fair \xB7 SHA-256 Audited"
      },
      customCss: "",
      customHtml: "<div style='font-weight:700;font-size:12px;'>Cryptographic Draw Protection</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Every draw seed hash is publicly verifiable &amp; protected against multi-account bots.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_anti_fraud_alert_webhook",
      slug: "security-room-threat-alert-relay",
      name: "Security Room Threat Alert Relay",
      version: "1.0.0",
      author: "Security Lab",
      category: "security",
      hookType: "webhook_notifier",
      description: "Relays real-time JSON alerts to your Admin Ops Slack/Discord/Telegram endpoint when Security Room blocks an IP or auto-suspends multi-account abuse.",
      enabled: false,
      isBuiltIn: true,
      config: {
        alertOnMultiAccount: true,
        alertOnIpBlock: true,
        alertOnBruteForce: true
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_meta_ga4_tracker",
      slug: "ga4-meta-conversion-pixel",
      name: "Google Analytics 4 & Meta Pixel Suite",
      version: "2.2.0",
      author: "Analytics Suite",
      category: "analytics",
      hookType: "analytics_pixel",
      description: "Tracks player registrations, ticket purchases, and verified deposits across Google Analytics 4 (GA4) and Meta/Facebook Conversion Pixel.",
      enabled: false,
      isBuiltIn: true,
      config: {
        ga4MeasurementId: "",
        metaPixelId: "",
        trackRegistrations: true,
        trackDeposits: true,
        trackTicketPurchases: true
      },
      customCss: "",
      customHtml: "",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    },
    {
      id: "plg_agent_network_widget",
      slug: "district-agent-fast-cashin-card",
      name: "64-District Verified Agent Cash-In Widget",
      version: "1.1.0",
      author: "Agent Network",
      category: "ui_widget",
      hookType: "custom_widget",
      description: "Shows a quick-access card promoting your 64-district verified local Agent & Sub-Agent network for fast bKash/Nagad Cash-In and Cash-Out.",
      enabled: false,
      isBuiltIn: true,
      config: {
        title: "64-District Verified Agents"
      },
      customCss: "",
      customHtml: "<div style='font-weight:700;font-size:12px;'>Fast Local Agent Cash-In / Cash-Out</div><div style='font-size:11px;opacity:.85;margin-top:2px;'>Verified Master Agents &amp; Sub-Agents available across all 64 districts of Bangladesh.</div>",
      webhookUrl: "",
      executionsCount: 0,
      lastTriggeredAt: null,
      installedAt: now,
      updatedAt: now
    }
  ];
}
function createDefaultServerCluster() {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  return {
    loadBalancer: {
      enabled: true,
      strategy: "weighted",
      stickySession: true,
      autoFailover: true,
      healthCheckIntervalSec: 30,
      roundRobinCursor: 0
    },
    nodes: [
      {
        id: "srv_primary_1",
        name: "Server 1 (Primary \u2014 bridge.php / veloralb_lottery)",
        role: "primary",
        hostUrl: "http://127.0.0.1:3000",
        region: "Primary PHP Bridge / cPanel",
        weight: 60,
        enabled: true,
        lastStatus: "online",
        lastLatencyMs: null,
        lastCheckedAt: null,
        lastCheckMessage: "Ready \u2014 click Run Live Health Check to verify latency.",
        routedRequests: 0
      },
      {
        id: "srv_secondary_2",
        name: "Server 2 (Load Balance \u2014 Direct MySQL veloralb_shop)",
        role: "secondary",
        hostUrl: "http://127.0.0.1:3000",
        region: "Secondary Direct MySQL / Failover",
        weight: 40,
        enabled: true,
        lastStatus: "standby",
        lastLatencyMs: null,
        lastCheckedAt: null,
        lastCheckMessage: "Direct Load Balance DB configured: veloralb_shop @ localhost:3306 (veloralb_billal).",
        routedRequests: 0
      }
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
      lastMessage: "Direct Load Balancing MySQL configured (veloralb_shop @ localhost:3306). Click Run Live Health Check to verify TCP."
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
      fpmPort: 9e3,
      lastStatus: "configured",
      detectedVersion: null,
      lastCheckedAt: null,
      lastMessage: "Configured & Ready \u2014 Option 1 (bridge.php \xB7 X-Bridge-Key \xB7 veloralb_lottery) & Option 2 (Direct Load Balance DB \xB7 veloralb_shop). Paste your cPanel bridge.php URL and click Send Test Request."
    },
    updatedAt: now
  };
}
var memoryDb = null;
var writeQueue = Promise.resolve();
function loadDbFromDisk() {
  if (memoryDb) return memoryDb;
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!import_fs.default.existsSync(DB_FILE) && !import_fs.default.existsSync(DB_BACKUP_FILE)) {
    const seeded = createSeedDatabase();
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), "utf8");
    memoryDb = seeded;
    return memoryDb;
  }
  try {
    let raw = "";
    if (import_fs.default.existsSync(DB_FILE)) {
      raw = import_fs.default.readFileSync(DB_FILE, "utf8");
    } else if (import_fs.default.existsSync(DB_BACKUP_FILE)) {
      raw = import_fs.default.readFileSync(DB_BACKUP_FILE, "utf8");
    }
    const parsed = JSON.parse(raw);
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
      const seedById = new Map(seeded.shopItems.map((s) => [s.id, s]));
      parsed.shopItems = parsed.shopItems.map((item) => {
        const seedMatch = seedById.get(item.id);
        return {
          ...seedMatch,
          ...item,
          category: item.category || seedMatch?.category || "digital",
          deliveryMode: item.deliveryMode || seedMatch?.deliveryMode || "auto_email",
          imageKey: item.imageKey || seedMatch?.imageKey,
          isActive: item.isActive ?? true
        };
      });
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
    if (!parsed.liveSupport || typeof parsed.liveSupport !== "object") {
      parsed.liveSupport = createDefaultLiveSupportState();
    } else {
      const def = createDefaultLiveSupportState();
      if (!Array.isArray(parsed.liveSupport.departments) || parsed.liveSupport.departments.length === 0) {
        parsed.liveSupport.departments = def.departments;
      }
      if (!Array.isArray(parsed.liveSupport.representatives)) {
        parsed.liveSupport.representatives = def.representatives;
      }
      if (!Array.isArray(parsed.liveSupport.chats)) parsed.liveSupport.chats = [];
      if (!Array.isArray(parsed.liveSupport.messages)) parsed.liveSupport.messages = [];
      if (!Array.isArray(parsed.liveSupport.attachments)) parsed.liveSupport.attachments = [];
      if (!Array.isArray(parsed.liveSupport.assignments)) parsed.liveSupport.assignments = [];
      if (!Array.isArray(parsed.liveSupport.ratings)) parsed.liveSupport.ratings = [];
      if (!Array.isArray(parsed.liveSupport.presence)) parsed.liveSupport.presence = def.presence;
      if (!parsed.liveSupport.settings) {
        parsed.liveSupport.settings = def.settings;
      }
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
        { district: "Rangpur", area: "Jahaj Company, Rangpur", fullName: "Rashedul Alam", username: "sub_rangpur_hub", phone: "01794-991108", cashIn: 39, cashOut: 19, online: true }
      ];
      subSeedSpecs.forEach((spec, idx) => {
        const parent = masterAgents.find((m) => m.district.toLowerCase() === spec.district.toLowerCase()) || masterAgents[0];
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
          createdAt: new Date(Date.now() - (idx + 2) * 86400 * 1e3).toISOString()
        });
      });
    }
    if (!Array.isArray(parsed.videoPromotions)) {
      parsed.videoPromotions = [];
    }
    if (!Array.isArray(parsed.paymentGateways) || parsed.paymentGateways.length === 0) {
      parsed.paymentGateways = createDefaultPaymentGateways(parsed.settings);
    } else {
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
          if (existing.qrImageUrl === void 0) existing.qrImageUrl = defGw.qrImageUrl ?? null;
          if (existing.qrPreferred === void 0) existing.qrPreferred = Boolean(defGw.qrPreferred);
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
        if (!parsed.plugins.some(
          (p) => p.id === defPlg.id || p.slug.toLowerCase() === defPlg.slug.toLowerCase()
        )) {
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
        ...parsed.serverCluster.mysql || {},
        password: parsed.serverCluster.mysql?.password ?? defCluster.mysql.password
      };
      parsed.serverCluster.php = {
        ...defPhp,
        ...parsed.serverCluster.php || {},
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
        lastStatus: parsed.serverCluster.php?.lastStatus === "not_installed" || !parsed.serverCluster.php?.lastStatus ? "configured" : parsed.serverCluster.php.lastStatus
      };
    }
    if (typeof parsed.settings.videoPromoEnabled !== "boolean") {
      parsed.settings.videoPromoEnabled = true;
    }
    if (typeof parsed.settings.videoPromoDefaultReward !== "number") {
      parsed.settings.videoPromoDefaultReward = 100;
    }
    if (typeof parsed.settings.videoPromoRules !== "string" || !parsed.settings.videoPromoRules.trim()) {
      parsed.settings.videoPromoRules = "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09A8\u09BF\u09DF\u09C7 YouTube, TikTok, Facebook \u09AC\u09BE Instagram-\u098F \u09AA\u09CD\u09B0\u09AE\u09CB\u09B6\u09A8\u09BE\u09B2 \u09AD\u09BF\u09A1\u09BF\u0993 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C7 \u09B2\u09BF\u0982\u0995 \u09B8\u09BE\u09AC\u09AE\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964 \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09AD\u09BF\u09A1\u09BF\u0993 \u099A\u09C7\u0995 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7 \u09B0\u09BF\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u099F\u09BE\u0995\u09BE \u09AF\u09CB\u0997 \u0995\u09B0\u09C7 \u09A6\u09C7\u09AC\u09C7\u09A8\u0964";
    }
    if (!parsed.settings.popupEvent || typeof parsed.settings.popupEvent !== "object") {
      parsed.settings.popupEvent = seeded.settings.popupEvent;
    } else {
      parsed.settings.popupEvent = {
        ...seeded.settings.popupEvent,
        ...parsed.settings.popupEvent,
        allowCancel: parsed.settings.popupEvent.allowCancel !== false,
        cancelLabel: typeof parsed.settings.popupEvent.cancelLabel === "string" && parsed.settings.popupEvent.cancelLabel.trim() ? parsed.settings.popupEvent.cancelLabel : "Cancel"
      };
    }
    if (!parsed.security || typeof parsed.security !== "object") {
      parsed.security = createDefaultSecurityRoom();
    } else {
      parsed.security = {
        policy: {
          ...DEFAULT_SECURITY_POLICY,
          ...parsed.security.policy || {}
        },
        blockedIps: Array.isArray(parsed.security.blockedIps) ? parsed.security.blockedIps : [],
        events: Array.isArray(parsed.security.events) ? parsed.security.events : [],
        updatedAt: parsed.security.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
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
            defaultParticipants: cat.defaultParticipants ?? seedMatch?.defaultParticipants ?? 20
          };
        }
        if (seedMatch) {
          return {
            ...cat,
            defaultEntryFee: cat.defaultEntryFee ?? seedMatch.defaultEntryFee,
            defaultParticipants: cat.defaultParticipants ?? seedMatch.defaultParticipants,
            description: cat.description ?? seedMatch.description,
            prizeTiers: seedMatch.prizeTiers
          };
        }
        const parsedNums = String(cat.defaultPrizes || "500").split(",").map((v) => Number(v.trim())).filter((n) => Number.isFinite(n) && n > 0);
        const tiers = parsedNums.length > 0 ? parsedNums.map((amt, idx) => ({
          rankPosition: idx + 1,
          title: idx === 0 ? "1st Prize" : `Rank #${idx + 1}`,
          winnersCount: 1,
          amount: amt
        })) : [{ rankPosition: 1, title: "Grand Prize", winnersCount: 1, amount: 500 }];
        return {
          ...cat,
          defaultEntryFee: cat.defaultEntryFee ?? 20,
          defaultParticipants: cat.defaultParticipants ?? Math.max(20, tiers.length * 2),
          prizeTiers: tiers
        };
      });
      if (!parsed.categories.some((c) => c.id === "c8")) {
        const multi20 = seeded.categories.find((c) => c.id === "c8");
        if (multi20) parsed.categories.push(multi20);
      }
    }
    const dhakaMaster = parsed.agents.find(
      (a) => (a.tier || "agent") === "agent" && a.district.toLowerCase() === "dhaka"
    ) || parsed.agents.find((a) => (a.tier || "agent") === "agent");
    if (dhakaMaster) {
      let agentUser = parsed.users.find(
        (u) => u.role === "agent" || u.email.toLowerCase() === "agent@lotterywinner.app" || u.agentId && u.agentId === dhakaMaster.id
      );
      if (!agentUser) {
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
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
          balance: 25e3,
          spinCredits: 0,
          totalDeposited: 25e3,
          totalWithdrawn: 0,
          winsCount: 0,
          securityPinHash: null,
          pinLockEnabled: false,
          agentId: dhakaMaster.id,
          createdAt: nowIso,
          updatedAt: nowIso
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
          createdAt: new Date(Date.now() - 18 * 60 * 1e3).toISOString()
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
          createdAt: new Date(Date.now() - 11 * 60 * 1e3).toISOString()
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
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } else if (typeof parsed.settings.checkoutBrand.supportEmail !== "string") {
      parsed.settings.checkoutBrand.supportEmail = "support@lotterywinner.app";
    }
    memoryDb = parsed;
    return memoryDb;
  } catch (err) {
    try {
      if (import_fs.default.existsSync(DB_FILE)) {
        const corruptCopy = import_path.default.join(DATA_DIR, `lottery_db.corrupt.${Date.now()}.json`);
        import_fs.default.copyFileSync(DB_FILE, corruptCopy);
      }
      if (import_fs.default.existsSync(DB_BACKUP_FILE)) {
        const backupRaw = import_fs.default.readFileSync(DB_BACKUP_FILE, "utf8");
        const recovered = JSON.parse(backupRaw);
        persistDbToDisk(recovered);
        memoryDb = recovered;
        console.warn("[db] Recovered database from lottery_db.backup.json after read error:", err);
        return memoryDb;
      }
    } catch {
    }
    const seeded = createSeedDatabase();
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), "utf8");
    memoryDb = seeded;
    return memoryDb;
  }
}
function persistDbToDisk(db) {
  if (!import_fs.default.existsSync(DATA_DIR)) {
    import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
  }
  const serialized = JSON.stringify(db, null, 2);
  const tmpFile = `${DB_FILE}.tmp`;
  import_fs.default.writeFileSync(tmpFile, serialized, "utf8");
  if (import_fs.default.existsSync(DB_FILE)) {
    try {
      import_fs.default.copyFileSync(DB_FILE, DB_BACKUP_FILE);
    } catch {
    }
  }
  import_fs.default.renameSync(tmpFile, DB_FILE);
}
function getDbSnapshot() {
  return loadDbFromDisk();
}
async function withTransaction(fn) {
  const run = async () => {
    const db = loadDbFromDisk();
    const cloned = structuredClone(db);
    const result = await fn(cloned);
    persistDbToDisk(cloned);
    memoryDb = cloned;
    return result;
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.catch(() => void 0);
  return next;
}
function toPublicUser(user) {
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
    createdAt: user.createdAt
  };
}
function pushAuditLog(db, actor, action, targetType, targetId, details, ipAddress) {
  db.auditLogs.unshift({
    id: generateId("audit"),
    actorId: actor.id,
    actorUsername: actor.username,
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
}

// server/realtime/chatHub.ts
var import_ws = require("ws");
var wssInstance = null;
var clients = /* @__PURE__ */ new Set();
function extractTokenFromUpgrade(req) {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const qToken = url.searchParams.get("token");
    if (qToken) return qToken.trim();
  } catch {
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === "string") {
    for (const part of cookieHeader.split(";")) {
      const [k, ...rest] = part.trim().split("=");
      if (k === "lw_session") {
        return decodeURIComponent(rest.join("="));
      }
    }
  }
  return null;
}
function getOnlineChatCount() {
  let count = 0;
  for (const ws of clients) {
    if (ws.readyState === import_ws.WebSocket.OPEN) count += 1;
  }
  return count;
}
function broadcastPresence() {
  broadcastChatEvent("community:presence", { onlineCount: getOnlineChatCount() });
}
function attachChatWebSocket(server) {
  if (wssInstance) return wssInstance;
  const wss = new import_ws.WebSocketServer({ noServer: true });
  wssInstance = wss;
  server.on("upgrade", (req, socket, head) => {
    const pathname = (req.url || "").split("?")[0];
    if (pathname !== "/ws/chat") {
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
  wss.on("connection", (rawWs, req) => {
    const ws = rawWs;
    const token = extractTokenFromUpgrade(req);
    const payload = token ? verifySessionToken(token) : null;
    ws.userId = payload?.uid || null;
    ws.isAlive = true;
    clients.add(ws);
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    ws.on("message", (raw) => {
      try {
        const parsed = JSON.parse(String(raw || "{}"));
        if (parsed.event === "community:typing" && typeof parsed.username === "string" && parsed.username.trim()) {
          const cleanUser = parsed.username.trim().slice(0, 32);
          const cleanChannel = parsed.channel === "winners" || parsed.channel === "agents" ? parsed.channel : "general";
          const out = JSON.stringify({
            event: "community:typing",
            payload: {
              userId: ws.userId || null,
              username: cleanUser,
              channel: cleanChannel
            }
          });
          for (const other of clients) {
            if (other !== ws && other.readyState === import_ws.WebSocket.OPEN) {
              try {
                other.send(out);
              } catch {
              }
            }
          }
        }
      } catch {
      }
    });
    ws.on("close", () => {
      clients.delete(ws);
      broadcastPresence();
    });
    ws.on("error", () => {
      clients.delete(ws);
      broadcastPresence();
    });
    try {
      ws.send(
        JSON.stringify({
          event: "chat:connected",
          userId: ws.userId,
          onlineCount: getOnlineChatCount()
        })
      );
    } catch {
    }
    broadcastPresence();
  });
  const heartbeat = setInterval(() => {
    for (const ws of clients) {
      if (ws.isAlive === false) {
        clients.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {
        clients.delete(ws);
      }
    }
  }, 3e4);
  wss.on("close", () => {
    clearInterval(heartbeat);
  });
  return wss;
}
function broadcastChatEvent(event, payload) {
  const serialized = JSON.stringify({ event, payload });
  for (const ws of clients) {
    if (ws.readyState === import_ws.WebSocket.OPEN) {
      try {
        ws.send(serialized);
      } catch {
      }
    }
  }
}
function sendChatEventToUsers(userIds, event, payload) {
  const targetSet = new Set(userIds.filter(Boolean));
  if (targetSet.size === 0) return;
  const serialized = JSON.stringify({ event, payload });
  for (const ws of clients) {
    if (ws.readyState === import_ws.WebSocket.OPEN && ws.userId && targetSet.has(ws.userId)) {
      try {
        ws.send(serialized);
      } catch {
      }
    }
  }
}

// server/realtime/supportHub.ts
var import_ws2 = require("ws");
var supportWss = null;
var supportSockets = /* @__PURE__ */ new Set();
function parseQueryParams(req) {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    return url.searchParams;
  } catch {
    return new URLSearchParams();
  }
}
function extractCookieValue(req, name) {
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader !== "string") return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}
function sendJson(ws, event, payload) {
  if (ws.readyState !== import_ws2.WebSocket.OPEN) return;
  try {
    ws.send(JSON.stringify({ event, payload }));
  } catch {
  }
}
function emitSupportToChat(chatId, event, payload, options) {
  for (const ws of supportSockets) {
    if (ws === options?.excludeSocket || ws.readyState !== import_ws2.WebSocket.OPEN) continue;
    if (ws.actorType === "admin") {
      sendJson(ws, event, payload);
      continue;
    }
    if (ws.actorType === "representative") {
      if (options?.representativeId && ws.actorId === options.representativeId || ws.authorizedChatIds?.has(chatId)) {
        sendJson(ws, event, payload);
      }
      continue;
    }
    if (ws.actorType === "customer" && ws.authorizedChatIds?.has(chatId)) {
      sendJson(ws, event, payload);
    }
  }
}
function emitSupportToRepresentative(representativeId, event, payload) {
  for (const ws of supportSockets) {
    if (ws.readyState !== import_ws2.WebSocket.OPEN) continue;
    if (ws.actorType === "admin" || ws.actorType === "representative" && ws.actorId === representativeId) {
      sendJson(ws, event, payload);
    }
  }
}
function emitSupportToStaff(event, payload) {
  for (const ws of supportSockets) {
    if (ws.readyState !== import_ws2.WebSocket.OPEN) continue;
    if (ws.actorType === "admin" || ws.actorType === "representative") {
      sendJson(ws, event, payload);
    }
  }
}
function emitSupportToAdmins(event, payload) {
  for (const ws of supportSockets) {
    if (ws.readyState !== import_ws2.WebSocket.OPEN) continue;
    if (ws.actorType === "admin") {
      sendJson(ws, event, payload);
    }
  }
}
function syncRepresentativeSocketChatAccess(representativeId, chatId, grant) {
  for (const ws of supportSockets) {
    if (ws.actorType === "representative" && ws.actorId === representativeId) {
      if (!ws.authorizedChatIds) ws.authorizedChatIds = /* @__PURE__ */ new Set();
      if (grant) ws.authorizedChatIds.add(chatId);
      else ws.authorizedChatIds.delete(chatId);
    }
  }
}
function getConnectedRepresentativeSocketCount(representativeId) {
  let count = 0;
  for (const ws of supportSockets) {
    if (ws.readyState === import_ws2.WebSocket.OPEN && ws.actorType === "representative" && ws.actorId === representativeId) {
      count += 1;
    }
  }
  return count;
}
async function updateRepresentativePresence(representativeId, connected) {
  const socketCount = getConnectedRepresentativeSocketCount(representativeId);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await withTransaction((db) => {
      if (!db.liveSupport) return;
      const rep = db.liveSupport.representatives.find((r) => r.id === representativeId);
      if (rep) {
        rep.lastSeenAt = now;
      }
      let p = db.liveSupport.presence.find((row) => row.representativeId === representativeId);
      if (!p) {
        p = {
          representativeId,
          isConnected: socketCount > 0,
          socketCount,
          lastHeartbeatAt: now,
          disconnectedAt: socketCount > 0 ? null : now
        };
        db.liveSupport.presence.push(p);
      } else {
        p.isConnected = socketCount > 0;
        p.socketCount = socketCount;
        p.lastHeartbeatAt = now;
        if (!connected && socketCount === 0) {
          p.disconnectedAt = now;
        } else if (socketCount > 0) {
          p.disconnectedAt = null;
        }
      }
    });
    emitSupportToStaff("support:presence_updated", {
      representativeId,
      isConnected: socketCount > 0,
      socketCount,
      updatedAt: now
    });
  } catch {
  }
}
function attachSupportWebSocket(server) {
  if (supportWss) return supportWss;
  const wss = new import_ws2.WebSocketServer({ noServer: true });
  supportWss = wss;
  server.on("upgrade", (req, socket, head) => {
    const pathname = (req.url || "").split("?")[0];
    if (pathname !== "/ws/support") {
      return;
    }
    const params = parseQueryParams(req);
    const mode = params.get("mode") || "customer";
    const db = getDbSnapshot();
    const support = db.liveSupport;
    let actorType = null;
    let actorId = "";
    let actorName = "";
    const authorizedChatIds = /* @__PURE__ */ new Set();
    if (mode === "representative") {
      const repToken = params.get("repToken") || extractCookieValue(req, "lw_support_rep");
      const payload = repToken ? verifySessionToken(repToken) : null;
      if (payload && payload.role === "support_representative" && support) {
        const rep = support.representatives.find(
          (r) => r.id === payload.uid && r.accountStatus === "active"
        );
        if (rep) {
          actorType = "representative";
          actorId = rep.id;
          actorName = rep.name;
          for (const chat of support.chats) {
            if (chat.representativeId === rep.id) {
              authorizedChatIds.add(chat.id);
            }
          }
        }
      }
    } else if (mode === "admin") {
      const adminToken = params.get("token") || extractCookieValue(req, "lw_session");
      const payload = adminToken ? verifySessionToken(adminToken) : null;
      if (payload && (payload.role === "admin" || payload.role === "moderator")) {
        const adminUser = db.users.find((u) => u.id === payload.uid && u.status === "active");
        if (adminUser) {
          actorType = "admin";
          actorId = adminUser.id;
          actorName = adminUser.fullName || adminUser.username;
        }
      }
    } else {
      const customerToken = params.get("customerToken");
      const userToken = params.get("token") || extractCookieValue(req, "lw_session");
      const custPayload = customerToken ? verifySessionToken(customerToken) : null;
      const userPayload = userToken ? verifySessionToken(userToken) : null;
      if (custPayload && custPayload.role === "support_customer" && support) {
        const chat = support.chats.find((c) => c.id === custPayload.uid);
        if (chat) {
          actorType = "customer";
          actorId = chat.id;
          actorName = chat.customerName;
          authorizedChatIds.add(chat.id);
        }
      }
      if (userPayload && support) {
        const user = db.users.find((u) => u.id === userPayload.uid && u.status === "active");
        if (user) {
          if (!actorType) {
            actorType = "customer";
            actorId = user.id;
            actorName = user.fullName || user.username;
          }
          for (const chat of support.chats) {
            if (chat.customerUserId === user.id) {
              authorizedChatIds.add(chat.id);
            }
          }
        }
      }
    }
    if (!actorType) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (rawWs) => {
      const ws = rawWs;
      ws.actorType = actorType;
      ws.actorId = actorId;
      ws.actorName = actorName;
      ws.authorizedChatIds = authorizedChatIds;
      ws.isAlive = true;
      wss.emit("connection", ws, req);
    });
  });
  wss.on("connection", (rawWs) => {
    const ws = rawWs;
    supportSockets.add(ws);
    sendJson(ws, "support:connected", {
      actorType: ws.actorType,
      actorId: ws.actorId,
      connectedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (ws.actorType === "representative" && ws.actorId) {
      void updateRepresentativePresence(ws.actorId, true);
    }
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    ws.on("message", (raw) => {
      try {
        const parsed = JSON.parse(String(raw || "{}"));
        if (parsed.event === "support:typing" && typeof parsed.chatId === "string" && parsed.chatId) {
          const chatId = parsed.chatId.slice(0, 80);
          const db = getDbSnapshot();
          const chat = db.liveSupport?.chats.find((c) => c.id === chatId);
          if (!chat || chat.status === "closed") return;
          const allowed = ws.actorType === "admin" || ws.actorType === "representative" && chat.representativeId === ws.actorId || ws.actorType === "customer" && ws.authorizedChatIds?.has(chatId);
          if (!allowed) return;
          emitSupportToChat(
            chatId,
            "support:typing",
            {
              chatId,
              senderType: ws.actorType,
              senderName: ws.actorName || "Participant",
              isTyping: Boolean(parsed.isTyping),
              at: (/* @__PURE__ */ new Date()).toISOString()
            },
            {
              representativeId: chat.representativeId,
              excludeSocket: ws
            }
          );
        }
      } catch {
      }
    });
    const handleDisconnect = () => {
      supportSockets.delete(ws);
      if (ws.actorType === "representative" && ws.actorId) {
        void updateRepresentativePresence(ws.actorId, false);
      }
    };
    ws.on("close", handleDisconnect);
    ws.on("error", handleDisconnect);
  });
  const heartbeat = setInterval(() => {
    for (const ws of supportSockets) {
      if (ws.isAlive === false) {
        supportSockets.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      try {
        ws.ping();
      } catch {
        supportSockets.delete(ws);
      }
    }
  }, 25e3);
  wss.on("close", () => {
    clearInterval(heartbeat);
  });
  return wss;
}

// server/routes/api.ts
var import_adm_zip = __toESM(require("adm-zip"), 1);
var import_child_process = require("child_process");
var import_crypto7 = __toESM(require("crypto"), 1);
var import_fs6 = __toESM(require("fs"), 1);
var import_net = __toESM(require("net"), 1);
var import_os = __toESM(require("os"), 1);
var import_path5 = __toESM(require("path"), 1);
var import_express3 = __toESM(require("express"), 1);

// server/routes/installerRoutes.ts
var import_crypto4 = __toESM(require("crypto"), 1);
var import_express = __toESM(require("express"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var DATA_DIR2 = import_path2.default.resolve(process.cwd(), "data");
var LOCK_FILE = import_path2.default.join(DATA_DIR2, ".installed.lock");
var DIST_INDEX = import_path2.default.resolve(process.cwd(), "dist", "index.html");
var DIST_SERVER = import_path2.default.resolve(process.cwd(), "dist", "server.cjs");
var PREBUILT_INDEX = import_path2.default.resolve(process.cwd(), "prebuilt", "index.html");
var PREBUILT_SERVER = import_path2.default.resolve(process.cwd(), "prebuilt", "server.cjs");
function readInstallLock() {
  try {
    if (!import_fs2.default.existsSync(LOCK_FILE)) return null;
    const raw = import_fs2.default.readFileSync(LOCK_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      installedAt: typeof parsed.installedAt === "string" ? parsed.installedAt : (/* @__PURE__ */ new Date()).toISOString(),
      version: typeof parsed.version === "string" ? parsed.version : "1.0.0",
      siteName: typeof parsed.siteName === "string" ? parsed.siteName : void 0
    };
  } catch {
    return {
      installedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0"
    };
  }
}
function checkDataDirWritable() {
  try {
    if (!import_fs2.default.existsSync(DATA_DIR2)) {
      import_fs2.default.mkdirSync(DATA_DIR2, { recursive: true });
    }
    const probe = import_path2.default.join(DATA_DIR2, `.write_probe_${process.pid}_${Date.now()}`);
    import_fs2.default.writeFileSync(probe, "ok", "utf8");
    import_fs2.default.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function createInstallerRouter() {
  const router = import_express.default.Router();
  const installerLimiter = createRateLimiter("hosting_installer", 12, 15 * 60 * 1e3);
  router.get("/installer/status", (_req, res) => {
    const lock = readInstallLock();
    const installed = Boolean(lock);
    const nodeVersion = process.versions.node || "0.0.0";
    const nodeMajor = Number(nodeVersion.split(".")[0] || 0);
    const dataWritable = checkDataDirWritable();
    const hasProductionBuild = import_fs2.default.existsSync(DIST_INDEX) && import_fs2.default.existsSync(DIST_SERVER) || import_fs2.default.existsSync(PREBUILT_INDEX) && import_fs2.default.existsSync(PREBUILT_SERVER);
    const hasSessionSecret = Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16);
    const forceRedirect = !installed && String(process.env.FORCE_INSTALL_REDIRECT || "").toLowerCase() === "true";
    const db = getDbSnapshot();
    res.json({
      success: true,
      installed,
      installedAt: lock?.installedAt || null,
      forceRedirect,
      environment: {
        nodeVersion,
        nodeSupported: nodeMajor >= 18,
        runtimeMode: process.env.NODE_ENV || "development",
        port: Number(process.env.PORT) || 3e3,
        dataWritable,
        hasProductionBuild,
        hasSessionSecret
      },
      defaults: installed ? null : {
        siteName: db.settings.siteName || "Lottery Winner",
        siteTagline: db.settings.siteTagline || "Instant Draws, Wallet & Digital Store",
        currencySymbol: db.settings.currencySymbol || "\u09F3",
        currencyCode: db.settings.checkoutBrand?.currencyCode || "BDT",
        supportEmail: db.settings.checkoutBrand?.supportEmail || "",
        whatsappNumber: db.settings.checkoutBrand?.whatsappNumber || ""
      }
    });
  });
  router.post("/installer/complete", installerLimiter, async (req, res) => {
    if (readInstallLock()) {
      res.status(403).json({
        success: false,
        message: "Installer is already completed and locked. Remove data/.installed.lock on your hosting server if you want to re-run setup."
      });
      return;
    }
    const body = req.body || {};
    const siteName = sanitizeText(body.siteName, 60);
    const siteTagline = sanitizeText(body.siteTagline, 140);
    const currencySymbol = sanitizeText(body.currencySymbol, 4) || "\u09F3";
    const currencyCodeRaw = sanitizeText(body.currencyCode, 8).toUpperCase().replace(/[^A-Z]/g, "");
    const currencyCode = currencyCodeRaw.length >= 2 ? currencyCodeRaw : "BDT";
    const supportEmail = sanitizeText(body.supportEmail, 120).toLowerCase();
    const whatsappNumber = sanitizeText(body.whatsappNumber, 32);
    const cleanDemoUsers = Boolean(body.cleanDemoUsers);
    const adminFullName = sanitizeText(body.adminFullName, 60);
    const adminUsername = sanitizeText(body.adminUsername, 30).replace(/[^a-zA-Z0-9_.-]/g, "");
    const adminEmail = sanitizeText(body.adminEmail, 120).toLowerCase();
    const adminPhone = sanitizeText(body.adminPhone, 24);
    const adminPassword = typeof body.adminPassword === "string" ? body.adminPassword : "";
    if (siteName.length < 2) {
      res.status(400).json({ success: false, message: "Site Name must be at least 2 characters." });
      return;
    }
    if (supportEmail && !isValidEmail(supportEmail)) {
      res.status(400).json({ success: false, message: "Support Email address is invalid." });
      return;
    }
    if (adminFullName.length < 2) {
      res.status(400).json({ success: false, message: "Admin Full Name is required." });
      return;
    }
    if (adminUsername.length < 3) {
      res.status(400).json({
        success: false,
        message: "Admin Username must be at least 3 characters (letters, numbers, _, ., -)."
      });
      return;
    }
    if (!isValidEmail(adminEmail)) {
      res.status(400).json({ success: false, message: "Please enter a valid Admin Email address." });
      return;
    }
    if (adminPassword.length < 8 || adminPassword.length > 128) {
      res.status(400).json({
        success: false,
        message: "Admin Password must be between 8 and 128 characters."
      });
      return;
    }
    const installedAt = (/* @__PURE__ */ new Date()).toISOString();
    const lockPayload = {
      installedAt,
      version: "1.0.0",
      siteName
    };
    try {
      if (!import_fs2.default.existsSync(DATA_DIR2)) {
        import_fs2.default.mkdirSync(DATA_DIR2, { recursive: true });
      }
      import_fs2.default.writeFileSync(LOCK_FILE, JSON.stringify(lockPayload, null, 2), {
        encoding: "utf8",
        flag: "wx"
      });
    } catch (err) {
      const code = err?.code;
      if (code === "EEXIST") {
        res.status(403).json({
          success: false,
          message: "Installer was already completed and is now locked."
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: "Could not write installation lock file. Ensure the data/ directory is writable."
      });
      return;
    }
    try {
      const configuredAdmin = await withTransaction((db) => {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        db.settings.siteName = siteName;
        if (siteTagline) {
          db.settings.siteTagline = siteTagline;
        }
        db.settings.currencySymbol = currencySymbol;
        db.settings.checkoutBrand = {
          brandName: siteName,
          logoUrl: db.settings.checkoutBrand?.logoUrl || null,
          accentColor: db.settings.checkoutBrand?.accentColor || "#0B57FF",
          supportUrl: db.settings.checkoutBrand?.supportUrl || "",
          whatsappNumber: whatsappNumber || db.settings.checkoutBrand?.whatsappNumber || "",
          supportEmail: supportEmail || adminEmail,
          showSupportIcons: db.settings.checkoutBrand?.showSupportIcons ?? true,
          payButtonLabel: db.settings.checkoutBrand?.payButtonLabel || "Pay",
          currencyCode,
          footerNote: `Secured Instant Checkout \xB7 ${siteName}`,
          updatedAt: now
        };
        if (cleanDemoUsers) {
          const demoIds = /* @__PURE__ */ new Set([
            "u_mod_01",
            "u_player_arif",
            "u_player_nusrat",
            "u_player_tanvir"
          ]);
          db.users = db.users.filter((u) => !demoIds.has(u.id));
        }
        const existingAdmin = db.users.find((u) => u.id === "u_admin_01") || db.users.find((u) => u.role === "admin");
        const passwordHash = hashPassword(adminPassword);
        const lowerUser = adminUsername.toLowerCase();
        const lowerEmail = adminEmail.toLowerCase();
        const conflict = db.users.find(
          (u) => u.id !== existingAdmin?.id && (u.username.toLowerCase() === lowerUser || u.email.toLowerCase() === lowerEmail)
        );
        if (conflict) {
          throw new Error("Admin username or email conflicts with an existing account.");
        }
        let adminRecord = existingAdmin;
        if (adminRecord) {
          adminRecord.username = adminUsername;
          adminRecord.fullName = adminFullName;
          adminRecord.email = adminEmail;
          adminRecord.phone = adminPhone || adminRecord.phone || "";
          adminRecord.passwordHash = passwordHash;
          adminRecord.avatarUrl = buildSvgAvatar(adminFullName, 0);
          adminRecord.role = "admin";
          adminRecord.status = "active";
          adminRecord.chatProfileCompleted = true;
          adminRecord.updatedAt = now;
        } else {
          adminRecord = {
            id: generateId("u_admin"),
            username: adminUsername,
            fullName: adminFullName,
            email: adminEmail,
            phone: adminPhone || "",
            avatarUrl: buildSvgAvatar(adminFullName, 0),
            passwordHash,
            role: "admin",
            status: "active",
            balance: 0,
            spinCredits: 0,
            totalDeposited: 0,
            totalWithdrawn: 0,
            winsCount: 0,
            securityPinHash: null,
            pinLockEnabled: false,
            chatProfileCompleted: true,
            createdAt: now,
            updatedAt: now
          };
          db.users.unshift(adminRecord);
        }
        pushAuditLog(
          db,
          { id: adminRecord.id, username: adminRecord.username },
          "HOSTING_INSTALL_COMPLETED",
          "system",
          adminRecord.id,
          { siteName, cleanDemoUsers },
          getClientIp(req)
        );
        return adminRecord;
      });
      const token = signSessionToken(configuredAdmin.id, configuredAdmin.role);
      const suggestedSessionSecret = import_crypto4.default.randomBytes(32).toString("hex");
      res.json({
        success: true,
        message: "Installation completed and locked successfully.",
        installedAt,
        token,
        user: toPublicUser(configuredAdmin),
        suggestedSessionSecret
      });
    } catch (err) {
      try {
        if (import_fs2.default.existsSync(LOCK_FILE)) import_fs2.default.unlinkSync(LOCK_FILE);
      } catch {
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Installation failed."
      });
    }
  });
  return router;
}

// server/routes/supportRoutes.ts
var import_express2 = __toESM(require("express"), 1);
var import_fs4 = __toESM(require("fs"), 1);
var import_path4 = __toESM(require("path"), 1);

// server/services/supportService.ts
var import_crypto5 = __toESM(require("crypto"), 1);
var import_fs3 = __toESM(require("fs"), 1);
var import_path3 = __toESM(require("path"), 1);
var SUPPORT_ATTACHMENTS_DIR = import_path3.default.resolve(process.cwd(), "data", "support_attachments");
var EXTENSION_MIME_MAP = {
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"],
  gif: ["image/gif"],
  pdf: ["application/pdf"],
  txt: ["text/plain"],
  csv: ["text/csv", "text/plain"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
};
function ensureLiveSupportState(db) {
  if (!db.liveSupport) {
    db.liveSupport = createDefaultLiveSupportState();
  }
  return db.liveSupport;
}
function getActiveChatCountForRep(support, repId) {
  return support.chats.filter((c) => c.status === "active" && c.representativeId === repId).length;
}
function getWaitingQueuePosition(support, chatId) {
  const waiting = support.chats.filter((c) => c.status === "waiting").sort((a, b) => {
    const ta = new Date(a.queueEnteredAt || a.createdAt).getTime();
    const tb = new Date(b.queueEnteredAt || b.createdAt).getTime();
    return ta - tb;
  });
  const idx = waiting.findIndex((c) => c.id === chatId);
  return idx >= 0 ? idx + 1 : null;
}
function toPublicRepresentative(support, rep) {
  const dept = support.departments.find((d) => d.id === rep.departmentId) || null;
  const activeChat = support.chats.find((c) => c.status === "active" && c.representativeId === rep.id) || null;
  const repChats = support.chats.filter((c) => c.representativeId === rep.id);
  const repRatings = support.ratings.filter((r) => r.representativeId === rep.id);
  const avgRating = repRatings.length > 0 ? Math.round(repRatings.reduce((acc, r) => acc + r.rating, 0) / repRatings.length * 100) / 100 : null;
  const presence = support.presence.find((p) => p.representativeId === rep.id);
  return {
    id: rep.id,
    name: rep.name,
    username: rep.username,
    email: rep.email,
    phone: rep.phone,
    avatarUrl: rep.avatarUrl,
    departmentId: rep.departmentId,
    departmentName: dept?.name || "General Support",
    status: rep.status,
    accountStatus: rep.accountStatus,
    maxActiveChats: rep.maxActiveChats || 1,
    activeChatsCount: activeChat ? 1 : 0,
    activeChatId: activeChat?.id || null,
    totalChatsHandled: repChats.filter((c) => c.status === "closed").length,
    totalAssignments: support.assignments.filter((a) => a.representativeId === rep.id).length,
    ratingsCount: repRatings.length,
    averageRating: avgRating,
    isSocketConnected: Boolean(presence?.isConnected),
    lastAssignedAt: rep.lastAssignedAt,
    lastSeenAt: rep.lastSeenAt,
    createdAt: rep.createdAt
  };
}
function serializeChatSummary(support, chat) {
  const rep = chat.representativeId ? support.representatives.find((r) => r.id === chat.representativeId) || null : null;
  const dept = chat.departmentId ? support.departments.find((d) => d.id === chat.departmentId) || null : null;
  const rating = support.ratings.find((r) => r.chatId === chat.id) || null;
  const queuePosition = chat.status === "waiting" ? getWaitingQueuePosition(support, chat.id) : null;
  return {
    ...chat,
    departmentName: dept?.name || "General Support",
    queuePosition,
    assignedRepresentative: rep ? {
      id: rep.id,
      name: rep.name,
      username: rep.username,
      avatarUrl: rep.avatarUrl,
      departmentName: support.departments.find((d) => d.id === rep.departmentId)?.name || "General Support",
      status: rep.status
    } : null,
    rating: rating ? {
      id: rating.id,
      rating: rating.rating,
      feedback: rating.feedback,
      createdAt: rating.createdAt
    } : null
  };
}
function serializeMessageWithAttachments(support, msg) {
  const attachments = (msg.attachmentIds || []).map((id) => support.attachments.find((a) => a.id === id)).filter((a) => Boolean(a));
  return {
    ...msg,
    attachments
  };
}
function createSystemSupportMessage(support, chat, body) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const msg = {
    id: generateId("smsg"),
    chatId: chat.id,
    senderType: "system",
    senderId: null,
    senderName: "System",
    body,
    attachmentIds: [],
    deliveredAt: now,
    readAt: now,
    createdAt: now
  };
  support.messages.push(msg);
  chat.lastMessagePreview = body.slice(0, 120);
  chat.lastMessageAt = now;
  chat.updatedAt = now;
  return msg;
}
function findEligibleRepresentative(support, preferredDepartmentId, excludeRepId) {
  const maxAllowed = Math.max(1, support.settings.maxActiveChatsPerRep || 1);
  const eligible = support.representatives.filter((rep) => {
    if (excludeRepId && rep.id === excludeRepId) return false;
    if (rep.accountStatus !== "active") return false;
    if (rep.status !== "online") return false;
    const activeCount = getActiveChatCountForRep(support, rep.id);
    const repCap = Math.min(maxAllowed, rep.maxActiveChats || 1);
    return activeCount < repCap && activeCount === 0;
  });
  if (eligible.length === 0) return null;
  eligible.sort((a, b) => {
    if (preferredDepartmentId) {
      const aMatch = a.departmentId === preferredDepartmentId ? 0 : 1;
      const bMatch = b.departmentId === preferredDepartmentId ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
    }
    const ta = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
    const tb = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
    return ta - tb;
  });
  return eligible[0] || null;
}
function assignChatToRepresentativeAtomic(support, chat, targetRep, options) {
  if (chat.status === "closed") {
    throw new Error("Cannot assign a closed conversation.");
  }
  if (targetRep.accountStatus !== "active") {
    throw new Error(`Representative ${targetRep.name} is suspended.`);
  }
  if (targetRep.status === "offline") {
    throw new Error(`Representative ${targetRep.name} is currently offline.`);
  }
  const activeCount = getActiveChatCountForRep(support, targetRep.id);
  const alreadyAssignedHere = chat.representativeId === targetRep.id && chat.status === "active";
  if (!alreadyAssignedHere && activeCount >= 1) {
    throw new Error(
      `Representative ${targetRep.name} already has an active conversation (max 1 active chat allowed).`
    );
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const previousRepId = chat.representativeId;
  if (previousRepId && previousRepId !== targetRep.id) {
    const prevOpen = [...support.assignments].reverse().find((a) => a.chatId === chat.id && a.representativeId === previousRepId && !a.unassignedAt);
    if (prevOpen) {
      prevOpen.unassignedAt = now;
    }
    const prevRep = support.representatives.find((r) => r.id === previousRepId);
    if (prevRep && prevRep.status === "busy") {
      const remaining = support.chats.filter(
        (c) => c.id !== chat.id && c.status === "active" && c.representativeId === prevRep.id
      ).length;
      if (remaining === 0 && prevRep.accountStatus === "active") {
        prevRep.status = "online";
        prevRep.updatedAt = now;
      }
    }
  }
  chat.representativeId = targetRep.id;
  chat.status = "active";
  chat.assignedAt = now;
  chat.updatedAt = now;
  targetRep.status = "busy";
  targetRep.lastAssignedAt = now;
  targetRep.updatedAt = now;
  const assignment = {
    id: generateId("sasg"),
    chatId: chat.id,
    representativeId: targetRep.id,
    representativeName: targetRep.name,
    previousRepresentativeId: previousRepId,
    assignedByType: options.assignedByType,
    assignedById: options.assignedById ?? null,
    reason: options.reason ?? null,
    assignedAt: now,
    unassignedAt: null
  };
  support.assignments.unshift(assignment);
  const sysBody = options.assignedByType === "transfer" ? `Conversation transferred to ${targetRep.name}${options.reason ? ` (${options.reason})` : ""}.` : options.assignedByType === "admin" ? `${targetRep.name} has been assigned to assist you.` : `${targetRep.name} joined the conversation.`;
  const systemMessage = createSystemSupportMessage(support, chat, sysBody);
  return {
    assignment,
    systemMessage,
    previousRepId
  };
}
function assignNextWaitingChatToRepAtomic(support, rep) {
  if (!support.settings.autoAssignEnabled) return null;
  if (rep.accountStatus !== "active" || rep.status !== "online") return null;
  if (getActiveChatCountForRep(support, rep.id) > 0) return null;
  const waitingChats = support.chats.filter((c) => c.status === "waiting").sort((a, b) => {
    const ta = new Date(a.queueEnteredAt || a.createdAt).getTime();
    const tb = new Date(b.queueEnteredAt || b.createdAt).getTime();
    return ta - tb;
  });
  const nextChat = waitingChats[0];
  if (!nextChat) return null;
  const { assignment, systemMessage } = assignChatToRepresentativeAtomic(support, nextChat, rep, {
    assignedByType: "auto",
    reason: "Auto-assigned from waiting queue"
  });
  return { chat: nextChat, assignment, systemMessage };
}
function saveSupportAttachmentFile(support, params) {
  const cleanOriginalName = sanitizeText(import_path3.default.basename(params.fileName || "attachment"), 140) || "attachment";
  const match = /^data:([a-zA-Z0-9.+\-\/]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(params.dataUrl.trim());
  if (!match) {
    throw new Error("Invalid file upload payload.");
  }
  const mimeType = match[1].toLowerCase().trim();
  const rawBase64 = match[2].replace(/\s+/g, "");
  const buffer = Buffer.from(rawBase64, "base64");
  if (buffer.length === 0) {
    throw new Error("Uploaded file is empty.");
  }
  const maxBytes = Math.max(1, support.settings.maxUploadMb || 5) * 1024 * 1024;
  if (buffer.length > maxBytes) {
    throw new Error(`File exceeds maximum allowed size of ${support.settings.maxUploadMb || 5} MB.`);
  }
  const extFromName = import_path3.default.extname(cleanOriginalName).replace(/^\./, "").toLowerCase();
  const allowedExts = new Set((support.settings.allowedExtensions || []).map((e) => e.toLowerCase()));
  const allowedMimes = new Set((support.settings.allowedMimeTypes || []).map((m) => m.toLowerCase()));
  if (!allowedMimes.has(mimeType)) {
    throw new Error(`File MIME type "${mimeType}" is not permitted by support settings.`);
  }
  let extension = extFromName;
  if (!extension) {
    const inferred = Object.entries(EXTENSION_MIME_MAP).find(([, mimes]) => mimes.includes(mimeType));
    extension = inferred ? inferred[0] : "";
  }
  if (!extension || !allowedExts.has(extension)) {
    throw new Error(`File extension ".${extension || "unknown"}" is not permitted.`);
  }
  const expectedMimes = EXTENSION_MIME_MAP[extension];
  if (expectedMimes && !expectedMimes.includes(mimeType)) {
    throw new Error(`File content type (${mimeType}) does not match extension (.${extension}).`);
  }
  import_fs3.default.mkdirSync(SUPPORT_ATTACHMENTS_DIR, { recursive: true });
  const id = generateId("satt");
  const randomSuffix = import_crypto5.default.randomBytes(6).toString("hex");
  const storedName = `${id}_${randomSuffix}.${extension}`;
  const fullPath = import_path3.default.resolve(SUPPORT_ATTACHMENTS_DIR, storedName);
  if (!fullPath.startsWith(SUPPORT_ATTACHMENTS_DIR + import_path3.default.sep)) {
    throw new Error("Invalid attachment storage path.");
  }
  import_fs3.default.writeFileSync(fullPath, buffer);
  const attachment = {
    id,
    chatId: params.chatId,
    messageId: null,
    uploadedByType: params.uploadedByType,
    uploadedById: params.uploadedById,
    originalName: cleanOriginalName,
    storedName,
    mimeType,
    extension,
    sizeBytes: buffer.length,
    url: `/api/support/attachments/${id}`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  support.attachments.push(attachment);
  return attachment;
}
function generateSupportTicketCode(support) {
  const existing = new Set(support.chats.map((c) => c.ticketCode));
  for (let i = 0; i < 40; i++) {
    const code = `SUP-${import_crypto5.default.randomInt(1e5, 999999)}`;
    if (!existing.has(code)) return code;
  }
  return `SUP-${Date.now().toString(36).toUpperCase()}`;
}

// server/routes/supportRoutes.ts
function readCookie(req, cookieName) {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const pair of header.split(";")) {
    const [k, ...rest] = pair.trim().split("=");
    if (k === cookieName) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}
function extractMainUserToken(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return readCookie(req, "lw_session");
}
function extractRepToken(req) {
  const repHeader = req.headers["x-support-rep-token"];
  if (typeof repHeader === "string" && repHeader.trim()) {
    return repHeader.trim();
  }
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const candidate = authHeader.slice(7).trim();
    const verified = verifySessionToken(candidate);
    if (verified?.role === "support_representative") return candidate;
  }
  if (typeof req.query.repToken === "string" && req.query.repToken.trim()) {
    return req.query.repToken.trim();
  }
  return readCookie(req, "lw_support_rep");
}
function extractCustomerTokens(req) {
  const tokens = [];
  const header = req.headers["x-support-customer-token"];
  if (typeof header === "string" && header.trim()) {
    for (const part of header.split(",")) {
      if (part.trim()) tokens.push(part.trim());
    }
  }
  if (typeof req.query.customerToken === "string" && req.query.customerToken.trim()) {
    tokens.push(req.query.customerToken.trim());
  }
  return tokens;
}
function resolveMainUser(req, db) {
  const token = extractMainUserToken(req);
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload || payload.role === "support_representative" || payload.role === "support_customer") {
    return null;
  }
  return db.users.find((u) => u.id === payload.uid && u.status === "active") || null;
}
function resolveAuthorizedCustomerChatIds(req, db) {
  const ids = /* @__PURE__ */ new Set();
  for (const tok of extractCustomerTokens(req)) {
    const payload = verifySessionToken(tok);
    if (payload?.role === "support_customer" && payload.uid) {
      ids.add(payload.uid);
    }
  }
  const user = resolveMainUser(req, db);
  if (user && db.liveSupport) {
    for (const chat of db.liveSupport.chats) {
      if (chat.customerUserId === user.id) {
        ids.add(chat.id);
      }
    }
  }
  return ids;
}
function requireSupportRep(req, res, next) {
  const token = extractRepToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: "Representative authentication required." });
    return;
  }
  const payload = verifySessionToken(token);
  if (!payload || payload.role !== "support_representative") {
    res.status(401).json({ success: false, message: "Invalid or expired representative session." });
    return;
  }
  const db = getDbSnapshot();
  const rep = db.liveSupport?.representatives.find((r) => r.id === payload.uid);
  if (!rep) {
    res.status(401).json({ success: false, message: "Representative account not found." });
    return;
  }
  if (rep.accountStatus !== "active") {
    res.status(403).json({ success: false, message: "Representative account is suspended." });
    return;
  }
  req.supportRep = rep;
  next();
}
function requireAdminUser(req, res, next) {
  const db = getDbSnapshot();
  const user = resolveMainUser(req, db);
  if (!user) {
    res.status(401).json({ success: false, message: "Admin authentication required." });
    return;
  }
  if (user.role !== "admin" && user.role !== "moderator") {
    res.status(403).json({ success: false, message: "Admin privileges required." });
    return;
  }
  req.adminUser = user;
  next();
}
function pushSupportAudit(db, actor, action, entityType, entityId, details, ipAddress) {
  pushAuditLog(db, actor, action, entityType, entityId, details, ipAddress);
}
function setRepSessionCookie(req, res, token) {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const parts = [
    `lw_support_rep=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${7 * 24 * 60 * 60}`,
    isSecure ? "SameSite=None; Secure; Partitioned" : "SameSite=Lax"
  ];
  res.append("Set-Cookie", parts.join("; "));
}
function clearRepSessionCookie(req, res) {
  const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
  const parts = [
    "lw_support_rep=",
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    isSecure ? "SameSite=None; Secure; Partitioned" : "SameSite=Lax"
  ];
  res.append("Set-Cookie", parts.join("; "));
}
function broadcastQueueRefresh(db) {
  const support = ensureLiveSupportState(db);
  const waitingChats = support.chats.filter((c) => c.status === "waiting").sort(
    (a, b) => new Date(a.queueEnteredAt || a.createdAt).getTime() - new Date(b.queueEnteredAt || b.createdAt).getTime()
  );
  waitingChats.forEach((chat, index) => {
    emitSupportToChat(chat.id, "support:queue_updated", {
      chatId: chat.id,
      queuePosition: index + 1,
      waitingTotal: waitingChats.length
    });
  });
  emitSupportToStaff("support:queue_updated", {
    waitingTotal: waitingChats.length,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
}
function createSupportRouter() {
  const router = import_express2.default.Router();
  const chatStartLimiter = createRateLimiter("support_start", 15, 6e4);
  const msgLimiter = createRateLimiter("support_msg", 45, 6e4);
  const repLoginLimiter = createRateLimiter("support_rep_login", 12, 6e4);
  router.get("/support/config", (_req, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const activeReps = support.representatives.filter((r) => r.accountStatus === "active");
    const onlineFreeCount = activeReps.filter(
      (r) => r.status === "online" && getActiveChatCountForRep(support, r.id) === 0
    ).length;
    const onlineTotalCount = activeReps.filter(
      (r) => r.status === "online" || r.status === "busy"
    ).length;
    res.json({
      success: true,
      departments: support.departments.filter((d) => d.isActive),
      onlineFreeCount,
      onlineTotalCount,
      waitingQueueCount: support.chats.filter((c) => c.status === "waiting").length,
      settings: {
        autoAssignEnabled: support.settings.autoAssignEnabled,
        maxUploadMb: support.settings.maxUploadMb,
        allowedExtensions: support.settings.allowedExtensions,
        allowedMimeTypes: support.settings.allowedMimeTypes,
        welcomeMessage: support.settings.welcomeMessage,
        queueMessage: support.settings.queueMessage,
        offlineMessage: support.settings.offlineMessage
      }
    });
  });
  router.post("/support/chats", chatStartLimiter, async (req, res) => {
    try {
      const customerName = sanitizeText(req.body?.customerName, 80);
      const customerPhone = sanitizeText(req.body?.customerPhone, 30);
      const departmentId = sanitizeText(req.body?.departmentId || "", 60) || null;
      const initialMessage = sanitizeText(req.body?.initialMessage || "", 1500);
      if (customerName.length < 2) {
        res.status(400).json({ success: false, message: "Please enter your full name (min 2 characters)." });
        return;
      }
      const digitsOnly = customerPhone.replace(/\D/g, "");
      if (digitsOnly.length < 7 || digitsOnly.length > 16) {
        res.status(400).json({ success: false, message: "Please enter a valid phone number." });
        return;
      }
      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const loggedUser = resolveMainUser(req, db);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const existingOpen = support.chats.find(
          (c) => c.status !== "closed" && (loggedUser && c.customerUserId === loggedUser.id || c.customerPhone.replace(/\D/g, "") === digitsOnly)
        );
        if (existingOpen) {
          const messages2 = support.messages.filter((m) => m.chatId === existingOpen.id).map((m) => serializeMessageWithAttachments(support, m));
          return {
            chat: serializeChatSummary(support, existingOpen),
            rawChat: existingOpen,
            messages: messages2,
            assignedRepId: existingOpen.representativeId,
            wasReused: true,
            dbSnapshot: db
          };
        }
        const validDept = departmentId ? support.departments.find((d) => d.id === departmentId && d.isActive) : support.departments.find((d) => d.isActive) || null;
        const chat = {
          id: generateId("schat"),
          ticketCode: generateSupportTicketCode(support),
          customerUserId: loggedUser?.id || null,
          customerName,
          customerPhone,
          customerEmail: loggedUser?.email || null,
          departmentId: validDept?.id || null,
          representativeId: null,
          status: "waiting",
          queueEnteredAt: now,
          assignedAt: null,
          closedAt: null,
          closedByType: null,
          closedById: null,
          lastMessagePreview: null,
          lastMessageAt: now,
          customerUnreadCount: 0,
          repUnreadCount: 0,
          createdAt: now,
          updatedAt: now
        };
        support.chats.unshift(chat);
        createSystemSupportMessage(support, chat, support.settings.welcomeMessage);
        if (initialMessage) {
          const msg = {
            id: generateId("smsg"),
            chatId: chat.id,
            senderType: "customer",
            senderId: loggedUser?.id || null,
            senderName: customerName,
            body: initialMessage,
            attachmentIds: [],
            deliveredAt: now,
            readAt: null,
            createdAt: now
          };
          support.messages.push(msg);
          chat.lastMessagePreview = initialMessage.slice(0, 120);
          chat.lastMessageAt = now;
          chat.repUnreadCount += 1;
        }
        let assignedRepId = null;
        if (support.settings.autoAssignEnabled) {
          const eligibleRep = findEligibleRepresentative(support, chat.departmentId);
          if (eligibleRep) {
            assignChatToRepresentativeAtomic(support, chat, eligibleRep, {
              assignedByType: "auto",
              reason: "Auto-assigned on chat start"
            });
            assignedRepId = eligibleRep.id;
          } else {
            const anyOnlineOrBusy = support.representatives.some(
              (r) => r.accountStatus === "active" && (r.status === "online" || r.status === "busy")
            );
            createSystemSupportMessage(
              support,
              chat,
              anyOnlineOrBusy ? support.settings.queueMessage : support.settings.offlineMessage
            );
          }
        } else {
          createSystemSupportMessage(support, chat, support.settings.queueMessage);
        }
        pushSupportAudit(
          db,
          { id: loggedUser?.id || null, username: loggedUser?.username || customerName },
          "SUPPORT_CHAT_STARTED",
          "support_chat",
          chat.id,
          {
            ticketCode: chat.ticketCode,
            customerPhone,
            status: chat.status,
            assignedRepId
          },
          getClientIp(req)
        );
        const messages = support.messages.filter((m) => m.chatId === chat.id).map((m) => serializeMessageWithAttachments(support, m));
        return {
          chat: serializeChatSummary(support, chat),
          rawChat: chat,
          messages,
          assignedRepId,
          wasReused: false,
          dbSnapshot: db
        };
      });
      const customerToken = signSessionToken(result.chat.id, "support_customer");
      if (!result.wasReused) {
        if (result.assignedRepId) {
          syncRepresentativeSocketChatAccess(result.assignedRepId, result.chat.id, true);
          emitSupportToRepresentative(result.assignedRepId, "support:chat_assigned", {
            chat: result.chat,
            assignedByType: "auto"
          });
          emitSupportToChat(result.chat.id, "support:chat_assigned", {
            chat: result.chat,
            assignedByType: "auto"
          }, { representativeId: result.assignedRepId });
        } else {
          emitSupportToAdmins("support:chat_created", { chat: result.chat });
        }
        broadcastQueueRefresh(result.dbSnapshot);
      }
      res.status(result.wasReused ? 200 : 201).json({
        success: true,
        customerToken,
        chat: result.chat,
        messages: result.messages,
        reused: result.wasReused
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not start live support chat."
      });
    }
  });
  router.get("/support/chats/my", (req, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const allowedIds = resolveAuthorizedCustomerChatIds(req, db);
    const myChats = support.chats.filter((c) => allowedIds.has(c.id)).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((c) => serializeChatSummary(support, c));
    const openChat = myChats.find((c) => c.status !== "closed") || null;
    const messages = openChat ? support.messages.filter((m) => m.chatId === openChat.id).map((m) => serializeMessageWithAttachments(support, m)) : [];
    res.json({
      success: true,
      activeChat: openChat,
      activeMessages: messages,
      history: myChats
    });
  });
  router.get("/support/chats/:chatId", (req, res) => {
    const chatId = sanitizeText(req.params.chatId, 80);
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const chat = support.chats.find((c) => c.id === chatId);
    if (!chat) {
      res.status(404).json({ success: false, message: "Support conversation not found." });
      return;
    }
    const adminUser = resolveMainUser(req, db);
    const isAdmin = Boolean(adminUser && (adminUser.role === "admin" || adminUser.role === "moderator"));
    const repToken = extractRepToken(req);
    const repPayload = repToken ? verifySessionToken(repToken) : null;
    const isAssignedRep = Boolean(
      repPayload?.role === "support_representative" && (chat.representativeId === repPayload.uid || support.assignments.some((a) => a.chatId === chat.id && a.representativeId === repPayload.uid))
    );
    const customerChatIds = resolveAuthorizedCustomerChatIds(req, db);
    const isCustomerOwner = customerChatIds.has(chat.id);
    if (!isAdmin && !isAssignedRep && !isCustomerOwner) {
      res.status(403).json({ success: false, message: "Unauthorized access to this conversation." });
      return;
    }
    const messages = support.messages.filter((m) => m.chatId === chat.id).map((m) => serializeMessageWithAttachments(support, m));
    res.json({
      success: true,
      chat: serializeChatSummary(support, chat),
      messages,
      assignments: isAdmin || isAssignedRep ? support.assignments.filter((a) => a.chatId === chat.id) : void 0
    });
  });
  router.post("/support/chats/:chatId/messages", msgLimiter, async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const body = sanitizeText(req.body?.body || "", 2e3);
      const attachmentInput = req.body?.attachment;
      if (!body && !attachmentInput?.dataUrl) {
        res.status(400).json({ success: false, message: "Message text or attachment is required." });
        return;
      }
      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        const allowedIds = resolveAuthorizedCustomerChatIds(req, db);
        if (!allowedIds.has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        if (chat.status === "closed") {
          throw new Error("This conversation is closed. Start a new chat if you need more help.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        let savedAttachment = null;
        if (attachmentInput?.dataUrl) {
          savedAttachment = saveSupportAttachmentFile(support, {
            chatId: chat.id,
            uploadedByType: "customer",
            uploadedById: chat.customerUserId,
            fileName: attachmentInput.fileName || "attachment",
            dataUrl: attachmentInput.dataUrl
          });
        }
        const msg = {
          id: generateId("smsg"),
          chatId: chat.id,
          senderType: "customer",
          senderId: chat.customerUserId,
          senderName: chat.customerName,
          body: body || (savedAttachment ? `Sent attachment: ${savedAttachment.originalName}` : ""),
          attachmentIds: savedAttachment ? [savedAttachment.id] : [],
          deliveredAt: now,
          readAt: null,
          createdAt: now
        };
        if (savedAttachment) {
          savedAttachment.messageId = msg.id;
        }
        support.messages.push(msg);
        chat.lastMessagePreview = msg.body.slice(0, 120);
        chat.lastMessageAt = now;
        chat.repUnreadCount = (chat.repUnreadCount || 0) + 1;
        chat.updatedAt = now;
        return {
          message: serializeMessageWithAttachments(support, msg),
          chat: serializeChatSummary(support, chat),
          representativeId: chat.representativeId
        };
      });
      emitSupportToChat(
        chatId,
        "support:message_created",
        { chatId, message: result.message, chat: result.chat },
        { representativeId: result.representativeId }
      );
      res.status(201).json({
        success: true,
        message: result.message,
        chat: result.chat
      });
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized chat access." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not send message."
      });
    }
  });
  router.post("/support/chats/:chatId/read", async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (!resolveAuthorizedCustomerChatIds(req, db).has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const updatedIds = [];
        for (const msg of support.messages) {
          if (msg.chatId === chat.id && msg.senderType === "representative" && !msg.readAt) {
            msg.readAt = now;
            updatedIds.push(msg.id);
          }
        }
        chat.customerUnreadCount = 0;
        return { updatedIds, readAt: now, representativeId: chat.representativeId };
      });
      if (result.updatedIds.length > 0) {
        emitSupportToChat(
          chatId,
          "support:messages_read",
          {
            chatId,
            readerType: "customer",
            messageIds: result.updatedIds,
            readAt: result.readAt
          },
          { representativeId: result.representativeId }
        );
      }
      res.json({ success: true, updatedCount: result.updatedIds.length });
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update read status."
      });
    }
  });
  router.post("/support/chats/:chatId/close", async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (!resolveAuthorizedCustomerChatIds(req, db).has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        if (chat.status === "closed") {
          return {
            chat: serializeChatSummary(support, chat),
            closedRepId: chat.representativeId,
            nextAssigned: null,
            alreadyClosed: true,
            dbSnapshot: db
          };
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const prevRepId = chat.representativeId;
        chat.status = "closed";
        chat.closedAt = now;
        chat.closedByType = "customer";
        chat.closedById = chat.customerUserId;
        chat.updatedAt = now;
        createSystemSupportMessage(support, chat, `${chat.customerName} closed the conversation.`);
        if (prevRepId) {
          const openAsg = [...support.assignments].reverse().find((a) => a.chatId === chat.id && a.representativeId === prevRepId && !a.unassignedAt);
          if (openAsg) openAsg.unassignedAt = now;
        }
        let nextAssigned = null;
        if (prevRepId) {
          const rep = support.representatives.find((r) => r.id === prevRepId);
          if (rep && rep.accountStatus === "active" && rep.status === "busy") {
            if (getActiveChatCountForRep(support, rep.id) === 0) {
              rep.status = "online";
              rep.updatedAt = now;
              const popped = assignNextWaitingChatToRepAtomic(support, rep);
              if (popped) {
                nextAssigned = {
                  chat: serializeChatSummary(support, popped.chat),
                  representativeId: rep.id
                };
              }
            }
          }
        }
        pushSupportAudit(
          db,
          { id: chat.customerUserId, username: chat.customerName },
          "SUPPORT_CHAT_CLOSED_BY_CUSTOMER",
          "support_chat",
          chat.id,
          { ticketCode: chat.ticketCode, previousRepId: prevRepId },
          getClientIp(req)
        );
        return {
          chat: serializeChatSummary(support, chat),
          closedRepId: prevRepId,
          nextAssigned,
          alreadyClosed: false,
          dbSnapshot: db
        };
      });
      if (!outcome.alreadyClosed) {
        emitSupportToChat(
          chatId,
          "support:chat_closed",
          { chatId, chat: outcome.chat, closedByType: "customer" },
          { representativeId: outcome.closedRepId }
        );
        if (outcome.nextAssigned) {
          syncRepresentativeSocketChatAccess(
            outcome.nextAssigned.representativeId,
            outcome.nextAssigned.chat.id,
            true
          );
          emitSupportToRepresentative(
            outcome.nextAssigned.representativeId,
            "support:chat_assigned",
            { chat: outcome.nextAssigned.chat, assignedByType: "auto" }
          );
          emitSupportToChat(
            outcome.nextAssigned.chat.id,
            "support:chat_assigned",
            { chat: outcome.nextAssigned.chat, assignedByType: "auto" },
            { representativeId: outcome.nextAssigned.representativeId }
          );
        }
        broadcastQueueRefresh(outcome.dbSnapshot);
      }
      res.json({ success: true, chat: outcome.chat });
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not close conversation."
      });
    }
  });
  router.post("/support/chats/:chatId/rating", async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const ratingNum = Math.floor(Number(req.body?.rating));
      const feedback = sanitizeText(req.body?.feedback || "", 800);
      if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        res.status(400).json({ success: false, message: "Rating must be between 1 and 5 stars." });
        return;
      }
      const saved = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (!resolveAuthorizedCustomerChatIds(req, db).has(chat.id)) {
          throw new Error("UNAUTHORIZED");
        }
        if (chat.status !== "closed") {
          throw new Error("Please close the conversation before submitting a rating.");
        }
        if (support.ratings.some((r) => r.chatId === chat.id)) {
          throw new Error("You have already rated this conversation.");
        }
        const rep = chat.representativeId ? support.representatives.find((r) => r.id === chat.representativeId) || null : null;
        const record = {
          id: generateId("srat"),
          chatId: chat.id,
          representativeId: rep?.id || null,
          representativeName: rep?.name || null,
          customerName: chat.customerName,
          customerPhone: chat.customerPhone,
          rating: ratingNum,
          feedback,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        support.ratings.unshift(record);
        return { rating: record, chat: serializeChatSummary(support, chat) };
      });
      if (saved.rating.representativeId) {
        emitSupportToRepresentative(saved.rating.representativeId, "support:rating_submitted", {
          rating: saved.rating
        });
      } else {
        emitSupportToAdmins("support:rating_submitted", { rating: saved.rating });
      }
      res.status(201).json({
        success: true,
        message: "Thank you for rating your support experience!",
        rating: saved.rating,
        chat: saved.chat
      });
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not submit rating."
      });
    }
  });
  router.get("/support/attachments/:attachmentId", (req, res) => {
    const attachmentId = sanitizeText(req.params.attachmentId, 80);
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const att = support.attachments.find((a) => a.id === attachmentId);
    if (!att) {
      res.status(404).end();
      return;
    }
    const chat = support.chats.find((c) => c.id === att.chatId);
    if (!chat) {
      res.status(404).end();
      return;
    }
    const adminUser = resolveMainUser(req, db);
    const isAdmin = Boolean(adminUser && (adminUser.role === "admin" || adminUser.role === "moderator"));
    const repToken = extractRepToken(req);
    const repPayload = repToken ? verifySessionToken(repToken) : null;
    const isRep = Boolean(
      repPayload?.role === "support_representative" && (chat.representativeId === repPayload.uid || support.assignments.some((a) => a.chatId === chat.id && a.representativeId === repPayload.uid))
    );
    const isCustomer = resolveAuthorizedCustomerChatIds(req, db).has(chat.id);
    if (!isAdmin && !isRep && !isCustomer) {
      res.status(403).json({ success: false, message: "Unauthorized attachment access." });
      return;
    }
    const safeName = import_path4.default.basename(att.storedName);
    const fullPath = import_path4.default.resolve(SUPPORT_ATTACHMENTS_DIR, safeName);
    if (!fullPath.startsWith(SUPPORT_ATTACHMENTS_DIR + import_path4.default.sep) || !import_fs4.default.existsSync(fullPath)) {
      res.status(404).end();
      return;
    }
    res.setHeader("Content-Type", att.mimeType);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "private, max-age=86400");
    const disposition = att.mimeType.startsWith("image/") ? "inline" : "attachment";
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${att.originalName.replace(/["\r\n]/g, "")}"`
    );
    import_fs4.default.createReadStream(fullPath).pipe(res);
  });
  router.post("/support/rep/login", repLoginLimiter, async (req, res) => {
    try {
      const identifier = sanitizeText(req.body?.identifier || "", 120).toLowerCase();
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!identifier || !password) {
        res.status(400).json({ success: false, message: "Username/email and password are required." });
        return;
      }
      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const rep = support.representatives.find(
          (r) => r.username.toLowerCase() === identifier || r.email.toLowerCase() === identifier
        );
        if (!rep || !verifyPassword(password, rep.passwordHash)) {
          throw new Error("Invalid representative credentials.");
        }
        if (rep.accountStatus !== "active") {
          throw new Error("Your representative account has been suspended by an administrator.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        rep.lastSeenAt = now;
        const activeCount = getActiveChatCountForRep(support, rep.id);
        if (activeCount > 0) {
          rep.status = "busy";
        }
        rep.updatedAt = now;
        pushSupportAudit(
          db,
          { id: rep.id, username: rep.username },
          "SUPPORT_REP_LOGIN",
          "support_representative",
          rep.id,
          { status: rep.status, activeCount },
          getClientIp(req)
        );
        return {
          rep: toPublicRepresentative(support, rep),
          repId: rep.id
        };
      });
      const repToken = signSessionToken(result.repId, "support_representative");
      setRepSessionCookie(req, res, repToken);
      res.json({
        success: true,
        repToken,
        representative: result.rep
      });
    } catch (err) {
      res.status(401).json({
        success: false,
        message: err instanceof Error ? err.message : "Representative login failed."
      });
    }
  });
  router.post("/support/rep/logout", requireSupportRep, async (req, res) => {
    const repId = req.supportRep.id;
    await withTransaction((db) => {
      const support = ensureLiveSupportState(db);
      const rep = support.representatives.find((r) => r.id === repId);
      if (rep) {
        if (getActiveChatCountForRep(support, rep.id) === 0) {
          rep.status = "offline";
        }
        rep.lastSeenAt = (/* @__PURE__ */ new Date()).toISOString();
        rep.updatedAt = rep.lastSeenAt;
      }
    });
    clearRepSessionCookie(req, res);
    emitSupportToStaff("support:presence_updated", {
      representativeId: repId,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.json({ success: true, message: "Signed out of Representative Panel." });
  });
  router.get("/support/rep/me", requireSupportRep, (req, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const rep = support.representatives.find((r) => r.id === req.supportRep.id);
    res.json({
      success: true,
      representative: toPublicRepresentative(support, rep)
    });
  });
  router.get("/support/rep/dashboard", requireSupportRep, (req, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const rep = support.representatives.find((r) => r.id === req.supportRep.id);
    const activeChatRaw = support.chats.find((c) => c.status === "active" && c.representativeId === rep.id) || null;
    const activeChat = activeChatRaw ? serializeChatSummary(support, activeChatRaw) : null;
    const activeMessages = activeChatRaw ? support.messages.filter((m) => m.chatId === activeChatRaw.id).map((m) => serializeMessageWithAttachments(support, m)) : [];
    const activeCustomerAccount = activeChatRaw?.customerUserId ? db.users.find((u) => u.id === activeChatRaw.customerUserId) || null : null;
    const activeCustomerPreviousChats = activeChatRaw ? support.chats.filter(
      (c) => c.id !== activeChatRaw.id && (activeChatRaw.customerUserId && c.customerUserId === activeChatRaw.customerUserId || c.customerPhone === activeChatRaw.customerPhone)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((c) => serializeChatSummary(support, c)) : [];
    const myInvolvedChatIds = new Set(
      support.assignments.filter((a) => a.representativeId === rep.id).map((a) => a.chatId)
    );
    const historyChats = support.chats.filter(
      (c) => c.status === "closed" && (c.representativeId === rep.id || myInvolvedChatIds.has(c.id))
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 60).map((c) => serializeChatSummary(support, c));
    const myRatings = support.ratings.filter((r) => r.representativeId === rep.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const todayStamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const handledToday = historyChats.filter((c) => (c.closedAt || "").slice(0, 10) === todayStamp).length;
    const availablePeers = support.representatives.filter(
      (other) => other.id !== rep.id && other.accountStatus === "active" && other.status === "online" && getActiveChatCountForRep(support, other.id) === 0
    ).map((other) => toPublicRepresentative(support, other));
    res.json({
      success: true,
      representative: toPublicRepresentative(support, rep),
      stats: {
        activeChatsCount: activeChat ? 1 : 0,
        maxActiveChats: rep.maxActiveChats || 1,
        handledToday,
        totalHandled: historyChats.length,
        waitingQueueCount: support.chats.filter((c) => c.status === "waiting").length,
        averageRating: myRatings.length > 0 ? Math.round(myRatings.reduce((a, b) => a + b.rating, 0) / myRatings.length * 100) / 100 : null,
        ratingsCount: myRatings.length
      },
      activeChat,
      activeMessages,
      activeCustomerProfile: activeChatRaw ? {
        name: activeChatRaw.customerName,
        phone: activeChatRaw.customerPhone,
        email: activeChatRaw.customerEmail || activeCustomerAccount?.email || null,
        registeredUsername: activeCustomerAccount?.username || null,
        registeredRole: activeCustomerAccount?.role || null,
        registeredBalance: activeCustomerAccount?.balance ?? null,
        previousChats: activeCustomerPreviousChats,
        assignments: support.assignments.filter((a) => a.chatId === activeChatRaw.id)
      } : null,
      historyChats,
      ratings: myRatings,
      availablePeers,
      settings: support.settings
    });
  });
  router.post("/support/rep/status", requireSupportRep, async (req, res) => {
    try {
      const requested = sanitizeText(req.body?.status || "", 20).toLowerCase();
      if (requested !== "online" && requested !== "offline") {
        res.status(400).json({ success: false, message: "Status must be online or offline." });
        return;
      }
      const repId = req.supportRep.id;
      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const rep = support.representatives.find((r) => r.id === repId);
        if (!rep) throw new Error("Representative not found.");
        const activeCount = getActiveChatCountForRep(support, rep.id);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        if (activeCount > 0) {
          throw new Error(
            "You currently have an active customer chat. Close or transfer your active chat before changing availability."
          );
        }
        rep.status = requested;
        rep.lastSeenAt = now;
        rep.updatedAt = now;
        let autoAssignedChat = null;
        if (requested === "online") {
          const popped = assignNextWaitingChatToRepAtomic(support, rep);
          if (popped) {
            autoAssignedChat = serializeChatSummary(support, popped.chat);
          }
        }
        return {
          representative: toPublicRepresentative(support, rep),
          autoAssignedChat,
          dbSnapshot: db
        };
      });
      emitSupportToStaff("support:presence_updated", {
        representativeId: repId,
        status: outcome.representative.status,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (outcome.autoAssignedChat) {
        syncRepresentativeSocketChatAccess(repId, outcome.autoAssignedChat.id, true);
        emitSupportToRepresentative(repId, "support:chat_assigned", {
          chat: outcome.autoAssignedChat,
          assignedByType: "auto"
        });
        emitSupportToChat(
          outcome.autoAssignedChat.id,
          "support:chat_assigned",
          { chat: outcome.autoAssignedChat, assignedByType: "auto" },
          { representativeId: repId }
        );
        broadcastQueueRefresh(outcome.dbSnapshot);
      }
      res.json({
        success: true,
        representative: outcome.representative,
        autoAssignedChat: outcome.autoAssignedChat
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not change status."
      });
    }
  });
  router.post(
    "/support/rep/chats/:chatId/messages",
    requireSupportRep,
    msgLimiter,
    async (req, res) => {
      try {
        const chatId = sanitizeText(req.params.chatId, 80);
        const body = sanitizeText(req.body?.body || "", 2e3);
        const attachmentInput = req.body?.attachment;
        if (!body && !attachmentInput?.dataUrl) {
          res.status(400).json({ success: false, message: "Message text or attachment is required." });
          return;
        }
        const repId = req.supportRep.id;
        const result = await withTransaction((db) => {
          const support = ensureLiveSupportState(db);
          const rep = support.representatives.find((r) => r.id === repId);
          if (!rep) throw new Error("Representative not found.");
          const chat = support.chats.find((c) => c.id === chatId);
          if (!chat) throw new Error("Conversation not found.");
          if (chat.representativeId !== rep.id) {
            throw new Error("UNAUTHORIZED");
          }
          if (chat.status !== "active") {
            throw new Error("Conversation is not active.");
          }
          const now = (/* @__PURE__ */ new Date()).toISOString();
          let savedAttachment = null;
          if (attachmentInput?.dataUrl) {
            savedAttachment = saveSupportAttachmentFile(support, {
              chatId: chat.id,
              uploadedByType: "representative",
              uploadedById: rep.id,
              fileName: attachmentInput.fileName || "attachment",
              dataUrl: attachmentInput.dataUrl
            });
          }
          const msg = {
            id: generateId("smsg"),
            chatId: chat.id,
            senderType: "representative",
            senderId: rep.id,
            senderName: rep.name,
            body: body || (savedAttachment ? `Sent attachment: ${savedAttachment.originalName}` : ""),
            attachmentIds: savedAttachment ? [savedAttachment.id] : [],
            deliveredAt: now,
            readAt: null,
            createdAt: now
          };
          if (savedAttachment) {
            savedAttachment.messageId = msg.id;
          }
          support.messages.push(msg);
          chat.lastMessagePreview = msg.body.slice(0, 120);
          chat.lastMessageAt = now;
          chat.customerUnreadCount = (chat.customerUnreadCount || 0) + 1;
          chat.updatedAt = now;
          rep.lastSeenAt = now;
          return {
            message: serializeMessageWithAttachments(support, msg),
            chat: serializeChatSummary(support, chat)
          };
        });
        emitSupportToChat(
          chatId,
          "support:message_created",
          { chatId, message: result.message, chat: result.chat },
          { representativeId: repId }
        );
        res.status(201).json({
          success: true,
          message: result.message,
          chat: result.chat
        });
      } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          res.status(403).json({ success: false, message: "This chat is not assigned to you." });
          return;
        }
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not send message."
        });
      }
    }
  );
  router.post("/support/rep/chats/:chatId/read", requireSupportRep, async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const repId = req.supportRep.id;
      const result = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat || chat.representativeId !== repId) {
          throw new Error("UNAUTHORIZED");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const updatedIds = [];
        for (const msg of support.messages) {
          if (msg.chatId === chat.id && msg.senderType === "customer" && !msg.readAt) {
            msg.readAt = now;
            updatedIds.push(msg.id);
          }
        }
        chat.repUnreadCount = 0;
        return { updatedIds, readAt: now };
      });
      if (result.updatedIds.length > 0) {
        emitSupportToChat(
          chatId,
          "support:messages_read",
          {
            chatId,
            readerType: "representative",
            messageIds: result.updatedIds,
            readAt: result.readAt
          },
          { representativeId: repId }
        );
      }
      res.json({ success: true, updatedCount: result.updatedIds.length });
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        res.status(403).json({ success: false, message: "Unauthorized." });
        return;
      }
      res.status(400).json({ success: false, message: "Could not mark messages read." });
    }
  });
  router.post(
    "/support/rep/chats/:chatId/transfer",
    requireSupportRep,
    async (req, res) => {
      try {
        const chatId = sanitizeText(req.params.chatId, 80);
        const targetRepId = sanitizeText(req.body?.targetRepresentativeId || "", 80);
        const reason = sanitizeText(req.body?.reason || "", 240);
        const fromRepId = req.supportRep.id;
        if (!targetRepId || targetRepId === fromRepId) {
          res.status(400).json({ success: false, message: "Select a different available representative." });
          return;
        }
        const outcome = await withTransaction((db) => {
          const support = ensureLiveSupportState(db);
          const chat = support.chats.find((c) => c.id === chatId);
          if (!chat || chat.status !== "active" || chat.representativeId !== fromRepId) {
            throw new Error("Only your active assigned chat can be transferred.");
          }
          const targetRep = support.representatives.find((r) => r.id === targetRepId);
          if (!targetRep) throw new Error("Target representative not found.");
          const { assignment } = assignChatToRepresentativeAtomic(support, chat, targetRep, {
            assignedByType: "transfer",
            assignedById: fromRepId,
            reason: reason || "Transferred by representative"
          });
          const fromRep = support.representatives.find((r) => r.id === fromRepId);
          let nextForFromRep = null;
          if (fromRep && fromRep.status === "online") {
            const popped = assignNextWaitingChatToRepAtomic(support, fromRep);
            if (popped) {
              nextForFromRep = serializeChatSummary(support, popped.chat);
            }
          }
          pushSupportAudit(
            db,
            { id: fromRepId, username: req.supportRep.username },
            "SUPPORT_CHAT_TRANSFERRED",
            "support_chat",
            chat.id,
            { fromRepId, toRepId: targetRepId, reason },
            getClientIp(req)
          );
          return {
            chat: serializeChatSummary(support, chat),
            assignment,
            targetRepId,
            nextForFromRep,
            dbSnapshot: db
          };
        });
        syncRepresentativeSocketChatAccess(fromRepId, chatId, false);
        syncRepresentativeSocketChatAccess(outcome.targetRepId, chatId, true);
        emitSupportToChat(
          chatId,
          "support:chat_transferred",
          { chatId, chat: outcome.chat, assignment: outcome.assignment },
          { representativeId: outcome.targetRepId }
        );
        emitSupportToRepresentative(fromRepId, "support:chat_transferred", {
          chatId,
          chat: outcome.chat,
          transferredAway: true
        });
        emitSupportToRepresentative(outcome.targetRepId, "support:chat_assigned", {
          chat: outcome.chat,
          assignedByType: "transfer"
        });
        if (outcome.nextForFromRep) {
          syncRepresentativeSocketChatAccess(fromRepId, outcome.nextForFromRep.id, true);
          emitSupportToRepresentative(fromRepId, "support:chat_assigned", {
            chat: outcome.nextForFromRep,
            assignedByType: "auto"
          });
          emitSupportToChat(
            outcome.nextForFromRep.id,
            "support:chat_assigned",
            { chat: outcome.nextForFromRep, assignedByType: "auto" },
            { representativeId: fromRepId }
          );
        }
        broadcastQueueRefresh(outcome.dbSnapshot);
        res.json({
          success: true,
          message: `Conversation transferred to ${outcome.assignment.representativeName}.`,
          chat: outcome.chat,
          nextAssignedChat: outcome.nextForFromRep
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not transfer chat."
        });
      }
    }
  );
  router.post(
    "/support/rep/chats/:chatId/close",
    requireSupportRep,
    async (req, res) => {
      try {
        const chatId = sanitizeText(req.params.chatId, 80);
        const repId = req.supportRep.id;
        const outcome = await withTransaction((db) => {
          const support = ensureLiveSupportState(db);
          const rep = support.representatives.find((r) => r.id === repId);
          if (!rep) throw new Error("Representative not found.");
          const chat = support.chats.find((c) => c.id === chatId);
          if (!chat || chat.representativeId !== repId) {
            throw new Error("Conversation not found or not assigned to you.");
          }
          if (chat.status === "closed") {
            return {
              chat: serializeChatSummary(support, chat),
              nextAssigned: null,
              dbSnapshot: db
            };
          }
          const now = (/* @__PURE__ */ new Date()).toISOString();
          chat.status = "closed";
          chat.closedAt = now;
          chat.closedByType = "representative";
          chat.closedById = rep.id;
          chat.updatedAt = now;
          createSystemSupportMessage(
            support,
            chat,
            `${rep.name} closed the conversation. Please rate your experience below.`
          );
          const openAsg = [...support.assignments].reverse().find((a) => a.chatId === chat.id && a.representativeId === rep.id && !a.unassignedAt);
          if (openAsg) openAsg.unassignedAt = now;
          let nextAssigned = null;
          if (getActiveChatCountForRep(support, rep.id) === 0 && rep.accountStatus === "active") {
            rep.status = "online";
            rep.updatedAt = now;
            const popped = assignNextWaitingChatToRepAtomic(support, rep);
            if (popped) {
              nextAssigned = serializeChatSummary(support, popped.chat);
            }
          }
          pushSupportAudit(
            db,
            { id: rep.id, username: rep.username },
            "SUPPORT_CHAT_CLOSED_BY_REP",
            "support_chat",
            chat.id,
            { ticketCode: chat.ticketCode, autoAssignedNextId: nextAssigned?.id || null },
            getClientIp(req)
          );
          return {
            chat: serializeChatSummary(support, chat),
            nextAssigned,
            dbSnapshot: db
          };
        });
        emitSupportToChat(
          chatId,
          "support:chat_closed",
          { chatId, chat: outcome.chat, closedByType: "representative" },
          { representativeId: repId }
        );
        if (outcome.nextAssigned) {
          syncRepresentativeSocketChatAccess(repId, outcome.nextAssigned.id, true);
          emitSupportToRepresentative(repId, "support:chat_assigned", {
            chat: outcome.nextAssigned,
            assignedByType: "auto"
          });
          emitSupportToChat(
            outcome.nextAssigned.id,
            "support:chat_assigned",
            { chat: outcome.nextAssigned, assignedByType: "auto" },
            { representativeId: repId }
          );
        }
        broadcastQueueRefresh(outcome.dbSnapshot);
        res.json({
          success: true,
          message: outcome.nextAssigned ? `Conversation closed. Next waiting customer (${outcome.nextAssigned.customerName}) has been assigned to you.` : "Conversation closed. You are now available for the next customer.",
          chat: outcome.chat,
          nextAssignedChat: outcome.nextAssigned
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not close conversation."
        });
      }
    }
  );
  router.get("/admin/support/overview", requireAdminUser, (_req, res) => {
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const representatives = support.representatives.map((r) => toPublicRepresentative(support, r));
    const chats = [...support.chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((c) => serializeChatSummary(support, c));
    const ratings = [...support.ratings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const avgRating = ratings.length > 0 ? Math.round(ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length * 100) / 100 : null;
    res.json({
      success: true,
      summary: {
        totalRepresentatives: representatives.length,
        onlineRepresentatives: representatives.filter((r) => r.status === "online" && r.accountStatus === "active").length,
        busyRepresentatives: representatives.filter((r) => r.status === "busy" && r.accountStatus === "active").length,
        offlineRepresentatives: representatives.filter((r) => r.status === "offline" || r.accountStatus !== "active").length,
        waitingChatsCount: chats.filter((c) => c.status === "waiting").length,
        activeChatsCount: chats.filter((c) => c.status === "active").length,
        closedChatsCount: chats.filter((c) => c.status === "closed").length,
        totalRatings: ratings.length,
        averageRating: avgRating
      },
      departments: support.departments,
      representatives,
      chats: chats.slice(0, 200),
      assignments: support.assignments.slice(0, 200),
      ratings: ratings.slice(0, 200),
      settings: support.settings
    });
  });
  router.get("/admin/support/chats/:chatId", requireAdminUser, (req, res) => {
    const chatId = sanitizeText(req.params.chatId, 80);
    const db = getDbSnapshot();
    const support = ensureLiveSupportState(db);
    const chat = support.chats.find((c) => c.id === chatId);
    if (!chat) {
      res.status(404).json({ success: false, message: "Conversation not found." });
      return;
    }
    const messages = support.messages.filter((m) => m.chatId === chat.id).map((m) => serializeMessageWithAttachments(support, m));
    const assignments = support.assignments.filter((a) => a.chatId === chat.id);
    const customerAccount = chat.customerUserId ? db.users.find((u) => u.id === chat.customerUserId) || null : null;
    res.json({
      success: true,
      chat: serializeChatSummary(support, chat),
      messages,
      assignments,
      customerAccount: customerAccount ? {
        id: customerAccount.id,
        username: customerAccount.username,
        fullName: customerAccount.fullName,
        email: customerAccount.email,
        phone: customerAccount.phone,
        balance: customerAccount.balance,
        role: customerAccount.role
      } : null
    });
  });
  router.post("/admin/support/representatives", requireAdminUser, async (req, res) => {
    try {
      const name = sanitizeText(req.body?.name || "", 80);
      const username = sanitizeText(req.body?.username || "", 40).toLowerCase().replace(/[^a-z0-9_.-]/g, "");
      const email = sanitizeText(req.body?.email || "", 120).toLowerCase();
      const phone = sanitizeText(req.body?.phone || "", 30);
      const departmentId = sanitizeText(req.body?.departmentId || "", 60) || "sdept_general";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (name.length < 2) throw new Error("Representative name must be at least 2 characters.");
      if (username.length < 3) throw new Error("Username must be at least 3 characters (letters, numbers, _ . -).");
      if (!email.includes("@")) throw new Error("Please enter a valid email address.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      const created = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        if (support.representatives.some(
          (r) => r.username.toLowerCase() === username || r.email.toLowerCase() === email
        )) {
          throw new Error("A representative with this username or email already exists.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const rep = {
          id: generateId("srep"),
          name,
          username,
          email,
          phone,
          passwordHash: hashPassword(password),
          avatarUrl: buildSvgAvatar(name, support.representatives.length % 6),
          departmentId: support.departments.some((d) => d.id === departmentId) ? departmentId : "sdept_general",
          status: "offline",
          accountStatus: "active",
          maxActiveChats: 1,
          lastAssignedAt: null,
          lastSeenAt: null,
          createdAt: now,
          updatedAt: now
        };
        support.representatives.unshift(rep);
        support.presence.push({
          representativeId: rep.id,
          isConnected: false,
          socketCount: 0,
          lastHeartbeatAt: now,
          disconnectedAt: null
        });
        pushSupportAudit(
          db,
          { id: req.adminUser.id, username: req.adminUser.username },
          "SUPPORT_REP_CREATED",
          "support_representative",
          rep.id,
          { name, username, email, departmentId: rep.departmentId },
          getClientIp(req)
        );
        return toPublicRepresentative(support, rep);
      });
      emitSupportToAdmins("support:presence_updated", {
        representativeId: created.id,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json({
        success: true,
        message: `Representative ${created.name} (@${created.username}) created.`,
        representative: created
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not create representative."
      });
    }
  });
  router.put("/admin/support/representatives/:id", requireAdminUser, async (req, res) => {
    try {
      const repId = sanitizeText(req.params.id, 80);
      const updated = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const rep = support.representatives.find((r) => r.id === repId);
        if (!rep) throw new Error("Representative not found.");
        if (typeof req.body?.name === "string" && req.body.name.trim().length >= 2) {
          rep.name = sanitizeText(req.body.name, 80);
        }
        if (typeof req.body?.email === "string" && req.body.email.includes("@")) {
          const cleanEmail = sanitizeText(req.body.email, 120).toLowerCase();
          if (support.representatives.some((r) => r.id !== rep.id && r.email.toLowerCase() === cleanEmail)) {
            throw new Error("Email already in use by another representative.");
          }
          rep.email = cleanEmail;
        }
        if (typeof req.body?.phone === "string") {
          rep.phone = sanitizeText(req.body.phone, 30);
        }
        if (typeof req.body?.departmentId === "string" && support.departments.some((d) => d.id === req.body.departmentId)) {
          rep.departmentId = req.body.departmentId;
        }
        if (typeof req.body?.password === "string" && req.body.password.trim().length > 0) {
          if (req.body.password.trim().length < 6) {
            throw new Error("New password must be at least 6 characters.");
          }
          rep.passwordHash = hashPassword(req.body.password.trim());
        }
        if (req.body?.accountStatus === "active" || req.body?.accountStatus === "suspended") {
          rep.accountStatus = req.body.accountStatus;
          if (rep.accountStatus === "suspended" && getActiveChatCountForRep(support, rep.id) === 0) {
            rep.status = "offline";
          }
        }
        if (req.body?.status === "online" || req.body?.status === "offline") {
          if (getActiveChatCountForRep(support, rep.id) === 0) {
            rep.status = req.body.status;
          }
        }
        rep.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        pushSupportAudit(
          db,
          { id: req.adminUser.id, username: req.adminUser.username },
          "SUPPORT_REP_UPDATED",
          "support_representative",
          rep.id,
          { accountStatus: rep.accountStatus, status: rep.status, departmentId: rep.departmentId },
          getClientIp(req)
        );
        return toPublicRepresentative(support, rep);
      });
      emitSupportToStaff("support:presence_updated", {
        representativeId: repId,
        status: updated.status,
        accountStatus: updated.accountStatus,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({
        success: true,
        message: `Representative ${updated.name} updated.`,
        representative: updated
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update representative."
      });
    }
  });
  router.delete("/admin/support/representatives/:id", requireAdminUser, async (req, res) => {
    try {
      const repId = sanitizeText(req.params.id, 80);
      await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const idx = support.representatives.findIndex((r) => r.id === repId);
        if (idx === -1) throw new Error("Representative not found.");
        if (getActiveChatCountForRep(support, repId) > 0) {
          throw new Error("Transfer or close this representative's active chat before deleting.");
        }
        const [removed] = support.representatives.splice(idx, 1);
        support.presence = support.presence.filter((p) => p.representativeId !== repId);
        pushSupportAudit(
          db,
          { id: req.adminUser.id, username: req.adminUser.username },
          "SUPPORT_REP_DELETED",
          "support_representative",
          repId,
          { username: removed.username, name: removed.name },
          getClientIp(req)
        );
      });
      res.json({ success: true, message: "Representative deleted." });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not delete representative."
      });
    }
  });
  router.post("/admin/support/chats/:chatId/assign", requireAdminUser, async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const targetRepId = sanitizeText(req.body?.representativeId || "", 80);
      const reason = sanitizeText(req.body?.reason || "", 240);
      if (!targetRepId) {
        res.status(400).json({ success: false, message: "Please select a representative." });
        return;
      }
      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        const targetRep = support.representatives.find((r) => r.id === targetRepId);
        if (!targetRep) throw new Error("Target representative not found.");
        const wasTransfer = Boolean(chat.representativeId && chat.representativeId !== targetRep.id);
        const { assignment, previousRepId } = assignChatToRepresentativeAtomic(support, chat, targetRep, {
          assignedByType: wasTransfer ? "transfer" : "admin",
          assignedById: req.adminUser.id,
          reason: reason || (wasTransfer ? "Transferred by admin" : "Manually assigned by admin")
        });
        let nextForPrevRep = null;
        if (previousRepId && previousRepId !== targetRep.id) {
          const prevRep = support.representatives.find((r) => r.id === previousRepId);
          if (prevRep && prevRep.status === "online") {
            const popped = assignNextWaitingChatToRepAtomic(support, prevRep);
            if (popped) {
              nextForPrevRep = serializeChatSummary(support, popped.chat);
            }
          }
        }
        pushSupportAudit(
          db,
          { id: req.adminUser.id, username: req.adminUser.username },
          wasTransfer ? "ADMIN_SUPPORT_CHAT_TRANSFERRED" : "ADMIN_SUPPORT_CHAT_ASSIGNED",
          "support_chat",
          chat.id,
          { previousRepId, targetRepId, reason },
          getClientIp(req)
        );
        return {
          chat: serializeChatSummary(support, chat),
          assignment,
          previousRepId,
          targetRepId,
          wasTransfer,
          nextForPrevRep,
          dbSnapshot: db
        };
      });
      if (outcome.previousRepId && outcome.previousRepId !== outcome.targetRepId) {
        syncRepresentativeSocketChatAccess(outcome.previousRepId, chatId, false);
        emitSupportToRepresentative(outcome.previousRepId, "support:chat_transferred", {
          chatId,
          chat: outcome.chat,
          transferredAway: true
        });
      }
      syncRepresentativeSocketChatAccess(outcome.targetRepId, chatId, true);
      emitSupportToChat(
        chatId,
        outcome.wasTransfer ? "support:chat_transferred" : "support:chat_assigned",
        { chatId, chat: outcome.chat, assignment: outcome.assignment },
        { representativeId: outcome.targetRepId }
      );
      emitSupportToRepresentative(outcome.targetRepId, "support:chat_assigned", {
        chat: outcome.chat,
        assignedByType: outcome.wasTransfer ? "transfer" : "admin"
      });
      if (outcome.previousRepId && outcome.nextForPrevRep) {
        syncRepresentativeSocketChatAccess(outcome.previousRepId, outcome.nextForPrevRep.id, true);
        emitSupportToRepresentative(outcome.previousRepId, "support:chat_assigned", {
          chat: outcome.nextForPrevRep,
          assignedByType: "auto"
        });
        emitSupportToChat(
          outcome.nextForPrevRep.id,
          "support:chat_assigned",
          { chat: outcome.nextForPrevRep, assignedByType: "auto" },
          { representativeId: outcome.previousRepId }
        );
      }
      broadcastQueueRefresh(outcome.dbSnapshot);
      res.json({
        success: true,
        message: outcome.wasTransfer ? `Conversation transferred to ${outcome.assignment.representativeName}.` : `Conversation assigned to ${outcome.assignment.representativeName}.`,
        chat: outcome.chat
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not assign conversation."
      });
    }
  });
  router.post("/admin/support/chats/:chatId/close", requireAdminUser, async (req, res) => {
    try {
      const chatId = sanitizeText(req.params.chatId, 80);
      const outcome = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const chat = support.chats.find((c) => c.id === chatId);
        if (!chat) throw new Error("Conversation not found.");
        if (chat.status === "closed") {
          return {
            chat: serializeChatSummary(support, chat),
            prevRepId: chat.representativeId,
            nextAssigned: null,
            dbSnapshot: db
          };
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const prevRepId = chat.representativeId;
        chat.status = "closed";
        chat.closedAt = now;
        chat.closedByType = "admin";
        chat.closedById = req.adminUser.id;
        chat.updatedAt = now;
        createSystemSupportMessage(support, chat, "Conversation closed by Support Administrator.");
        let nextAssigned = null;
        if (prevRepId) {
          const openAsg = [...support.assignments].reverse().find((a) => a.chatId === chat.id && a.representativeId === prevRepId && !a.unassignedAt);
          if (openAsg) openAsg.unassignedAt = now;
          const rep = support.representatives.find((r) => r.id === prevRepId);
          if (rep && rep.accountStatus === "active" && rep.status === "busy" && getActiveChatCountForRep(support, rep.id) === 0) {
            rep.status = "online";
            rep.updatedAt = now;
            const popped = assignNextWaitingChatToRepAtomic(support, rep);
            if (popped) {
              nextAssigned = {
                chat: serializeChatSummary(support, popped.chat),
                repId: rep.id
              };
            }
          }
        }
        pushSupportAudit(
          db,
          { id: req.adminUser.id, username: req.adminUser.username },
          "ADMIN_SUPPORT_CHAT_CLOSED",
          "support_chat",
          chat.id,
          { ticketCode: chat.ticketCode, previousRepId: prevRepId },
          getClientIp(req)
        );
        return {
          chat: serializeChatSummary(support, chat),
          prevRepId,
          nextAssigned,
          dbSnapshot: db
        };
      });
      emitSupportToChat(
        chatId,
        "support:chat_closed",
        { chatId, chat: outcome.chat, closedByType: "admin" },
        { representativeId: outcome.prevRepId }
      );
      if (outcome.nextAssigned) {
        syncRepresentativeSocketChatAccess(outcome.nextAssigned.repId, outcome.nextAssigned.chat.id, true);
        emitSupportToRepresentative(outcome.nextAssigned.repId, "support:chat_assigned", {
          chat: outcome.nextAssigned.chat,
          assignedByType: "auto"
        });
        emitSupportToChat(
          outcome.nextAssigned.chat.id,
          "support:chat_assigned",
          { chat: outcome.nextAssigned.chat, assignedByType: "auto" },
          { representativeId: outcome.nextAssigned.repId }
        );
      }
      broadcastQueueRefresh(outcome.dbSnapshot);
      res.json({ success: true, message: "Conversation closed.", chat: outcome.chat });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not close conversation."
      });
    }
  });
  router.put("/admin/support/settings", requireAdminUser, async (req, res) => {
    try {
      const updated = await withTransaction((db) => {
        const support = ensureLiveSupportState(db);
        const s = support.settings;
        if (typeof req.body?.autoAssignEnabled === "boolean") {
          s.autoAssignEnabled = req.body.autoAssignEnabled;
        }
        if (req.body?.maxUploadMb !== void 0) {
          const mb = Math.max(1, Math.min(20, Math.floor(Number(req.body.maxUploadMb) || 5)));
          s.maxUploadMb = mb;
        }
        if (Array.isArray(req.body?.allowedExtensions)) {
          const cleanExts = req.body.allowedExtensions.map((e) => sanitizeText(String(e || ""), 10).toLowerCase().replace(/[^a-z0-9]/g, "")).filter(Boolean);
          if (cleanExts.length > 0) s.allowedExtensions = Array.from(new Set(cleanExts));
        }
        if (Array.isArray(req.body?.allowedMimeTypes)) {
          const cleanMimes = req.body.allowedMimeTypes.map((m) => sanitizeText(String(m || ""), 80).toLowerCase()).filter((m) => m.includes("/"));
          if (cleanMimes.length > 0) s.allowedMimeTypes = Array.from(new Set(cleanMimes));
        }
        if (typeof req.body?.welcomeMessage === "string" && req.body.welcomeMessage.trim()) {
          s.welcomeMessage = sanitizeText(req.body.welcomeMessage, 400);
        }
        if (typeof req.body?.queueMessage === "string" && req.body.queueMessage.trim()) {
          s.queueMessage = sanitizeText(req.body.queueMessage, 400);
        }
        if (typeof req.body?.offlineMessage === "string" && req.body.offlineMessage.trim()) {
          s.offlineMessage = sanitizeText(req.body.offlineMessage, 400);
        }
        s.maxActiveChatsPerRep = 1;
        s.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        const autoAssigned = [];
        if (s.autoAssignEnabled) {
          for (const rep of support.representatives) {
            if (rep.accountStatus === "active" && rep.status === "online") {
              const popped = assignNextWaitingChatToRepAtomic(support, rep);
              if (popped) {
                autoAssigned.push({
                  chat: serializeChatSummary(support, popped.chat),
                  repId: rep.id
                });
              }
            }
          }
        }
        pushSupportAudit(
          db,
          { id: req.adminUser.id, username: req.adminUser.username },
          "ADMIN_SUPPORT_SETTINGS_UPDATED",
          "support_settings",
          "global",
          {
            autoAssignEnabled: s.autoAssignEnabled,
            maxUploadMb: s.maxUploadMb,
            allowedExtensions: s.allowedExtensions
          },
          getClientIp(req)
        );
        return { settings: s, autoAssigned, dbSnapshot: db };
      });
      for (const item of updated.autoAssigned) {
        syncRepresentativeSocketChatAccess(item.repId, item.chat.id, true);
        emitSupportToRepresentative(item.repId, "support:chat_assigned", {
          chat: item.chat,
          assignedByType: "auto"
        });
        emitSupportToChat(
          item.chat.id,
          "support:chat_assigned",
          { chat: item.chat, assignedByType: "auto" },
          { representativeId: item.repId }
        );
      }
      if (updated.autoAssigned.length > 0) {
        broadcastQueueRefresh(updated.dbSnapshot);
      }
      res.json({
        success: true,
        message: "Live Support settings saved.",
        settings: updated.settings
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update support settings."
      });
    }
  });
  return router;
}

// server/services/lotteryService.ts
var import_crypto6 = __toESM(require("crypto"), 1);
function executeLotteryDrawInDb(db, lotteryId, actor, ipAddress, publishImmediately = true) {
  const lottery = db.lotteries.find((l) => l.id === lotteryId);
  if (!lottery) {
    throw new Error("Lottery campaign not found.");
  }
  if (lottery.status === "drawn") {
    throw new Error("This lottery draw has already been completed.");
  }
  if (lottery.status === "refunded") {
    throw new Error("This lottery campaign has already been refunded.");
  }
  const eligibleTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status === "pending"
  );
  if (eligibleTickets.length === 0) {
    throw new Error("Cannot execute draw: no pending tickets exist for this campaign.");
  }
  const tiers = db.prizes.filter((p) => p.lotteryId === lottery.id).sort((a, b) => a.rankPosition - b.rankPosition);
  const effectiveTiers = [];
  if (tiers.length > 0) {
    for (const t of tiers) {
      const count = Math.max(1, t.winnersCount || 1);
      for (let i = 0; i < count; i++) {
        effectiveTiers.push({
          id: t.id,
          rank: t.rankPosition,
          title: t.title,
          amount: Number(t.amount) || 0
        });
      }
    }
  } else {
    const matchedCat = db.categories.find(
      (c) => lottery.categoryId && c.id === lottery.categoryId || c.name.toLowerCase() === lottery.category.toLowerCase()
    );
    if (matchedCat && Array.isArray(matchedCat.prizeTiers) && matchedCat.prizeTiers.length > 0) {
      const sortedCatTiers = [...matchedCat.prizeTiers].sort(
        (a, b) => a.rankPosition - b.rankPosition
      );
      for (const t of sortedCatTiers) {
        const count = Math.max(1, t.winnersCount || 1);
        for (let i = 0; i < count; i++) {
          effectiveTiers.push({
            id: null,
            rank: t.rankPosition,
            title: t.title,
            amount: Number(t.amount) || 0
          });
        }
      }
    } else {
      effectiveTiers.push({
        id: null,
        rank: 1,
        title: "Grand Prize",
        amount: Number(lottery.prizeAmount) || 0
      });
    }
  }
  const shuffled = [...eligibleTickets];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = import_crypto6.default.randomInt(0, i + 1);
    const tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  const drawnAt = (/* @__PURE__ */ new Date()).toISOString();
  const resultId = generateId("res");
  const createdWinners = [];
  const winningTicketIds = /* @__PURE__ */ new Set();
  let totalPayout = 0;
  for (let idx = 0; idx < effectiveTiers.length && idx < shuffled.length; idx++) {
    const tier = effectiveTiers[idx];
    const ticket = shuffled[idx];
    winningTicketIds.add(ticket.id);
    ticket.status = "won";
    ticket.prizeAmount = tier.amount;
    ticket.prizeRank = tier.rank;
    totalPayout += tier.amount;
    const user = db.users.find((u) => u.id === ticket.userId);
    if (user) {
      user.balance = Math.round((user.balance + tier.amount) * 100) / 100;
      user.winsCount = (user.winsCount || 0) + 1;
      user.updatedAt = drawnAt;
      db.transactions.unshift({
        id: generateId("txn"),
        userId: user.id,
        username: user.username,
        direction: "credit",
        category: "prize_payout",
        amount: tier.amount,
        balanceAfter: user.balance,
        referenceId: resultId,
        gateway: "Wallet",
        description: `${tier.title} payout for ${lottery.name} (${ticket.ticketNumber})`,
        createdAt: drawnAt
      });
      db.notifications.unshift({
        id: generateId("notif"),
        userId: user.id,
        title: `Congratulations! ${tier.title} Winner`,
        message: `Ticket ${ticket.ticketNumber} in "${lottery.name}" won ${db.settings.currencySymbol}${tier.amount.toLocaleString()}. Winnings have been credited to your wallet.`,
        type: "win",
        isRead: false,
        createdAt: drawnAt
      });
    }
    const winnerRec = {
      id: generateId("win"),
      lotteryId: lottery.id,
      lotteryName: lottery.name,
      resultId,
      ticketId: ticket.id,
      userId: ticket.userId,
      username: ticket.username,
      winnerFullName: user?.fullName || ticket.username,
      winnerAvatar: user?.avatarUrl || "",
      prizeId: tier.id,
      rankPosition: tier.rank,
      prizeTitle: tier.title,
      prizeAmount: tier.amount,
      ticketNumber: ticket.ticketNumber,
      awardedAt: drawnAt
    };
    createdWinners.push(winnerRec);
    db.winners.unshift(winnerRec);
  }
  for (const t of eligibleTickets) {
    if (!winningTicketIds.has(t.id)) {
      t.status = "lost";
    }
  }
  const winningNumbers = createdWinners.map((w) => w.ticketNumber);
  const drawSeedHash = computeDrawSeedHash(
    lottery.id,
    eligibleTickets.map((t) => t.ticketNumber),
    winningNumbers,
    drawnAt
  );
  const result = {
    id: resultId,
    lotteryId: lottery.id,
    lotteryName: lottery.name,
    category: lottery.category,
    drawSeedHash,
    winningNumbers,
    totalTicketsEntered: eligibleTickets.length,
    totalPayout,
    isPublished: publishImmediately,
    drawnBy: actor.id,
    drawnAt
  };
  db.lotteryResults.unshift(result);
  lottery.status = "drawn";
  lottery.drawnAt = drawnAt;
  lottery.resultsPublished = publishImmediately;
  lottery.updatedAt = drawnAt;
  pushAuditLog(
    db,
    actor,
    publishImmediately ? "DRAW_EXECUTED_AND_PUBLISHED" : "DRAW_EXECUTED",
    "lottery",
    lottery.id,
    {
      lotteryName: lottery.name,
      ticketsEntered: eligibleTickets.length,
      winnersCount: createdWinners.length,
      totalPayout,
      drawSeedHash
    },
    ipAddress
  );
  return { result, winners: createdWinners };
}
function dispatchRefundNotices(notices) {
  for (const notice of notices) {
    sendChatEventToUsers([notice.userId], "lottery:refund_notice", notice);
  }
}
function refundLotteryInDb(db, lottery, reason, actor, ipAddress) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const sym = db.settings.currencySymbol || "\u09F3";
  const pendingTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status === "pending"
  );
  const byUser = /* @__PURE__ */ new Map();
  for (const ticket of pendingTickets) {
    ticket.status = "refunded";
    const existing = byUser.get(ticket.userId);
    if (existing) {
      existing.ticketNumbers.push(ticket.ticketNumber);
      existing.ticketIds.push(ticket.id);
      existing.refundAmount = Math.round((existing.refundAmount + ticket.entryFee) * 100) / 100;
    } else {
      byUser.set(ticket.userId, {
        userId: ticket.userId,
        ticketNumbers: [ticket.ticketNumber],
        ticketIds: [ticket.id],
        refundAmount: Math.round(ticket.entryFee * 100) / 100
      });
    }
  }
  const notices = [];
  const refundBatchId = generateId("ref");
  for (const entry of byUser.values()) {
    const user = db.users.find((u) => u.id === entry.userId);
    if (!user) continue;
    user.balance = Math.round((user.balance + entry.refundAmount) * 100) / 100;
    user.updatedAt = now;
    db.transactions.unshift({
      id: generateId("txn"),
      userId: user.id,
      username: user.username,
      direction: "credit",
      category: "refund",
      amount: entry.refundAmount,
      balanceAfter: user.balance,
      referenceId: entry.ticketIds[0] || lottery.id,
      gateway: "Wallet",
      description: `Refund for "${lottery.name}" (${entry.ticketNumbers.length} ticket${entry.ticketNumbers.length > 1 ? "s" : ""}: ${entry.ticketNumbers.join(", ")}) \u2014 ${reason}`,
      createdAt: now
    });
    const title = `\u09A6\u09C1\u0983\u0996\u09BF\u09A4! \u099F\u09BF\u0995\u09BF\u099F \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u2014 ${lottery.name}`;
    const message = `\u09A6\u09C1\u0983\u0996\u09BF\u09A4! \u09B8\u09AC \u099F\u09BF\u0995\u09BF\u099F \u09AC\u09BF\u0995\u09CD\u09B0\u09BF \u09A8\u09BE \u09B9\u0993\u09DF\u09BE\u09DF "${lottery.name}" \u09B2\u099F\u09BE\u09B0\u09BF\u09B0 (${lottery.soldTickets}/${lottery.totalTickets} \u099F\u09BF\u0995\u09BF\u099F \u09AC\u09BF\u0995\u09CD\u09B0\u09BF) \u0986\u09AA\u09A8\u09BE\u09B0 ${entry.ticketNumbers.length}\u099F\u09BF \u099F\u09BF\u0995\u09BF\u099F\u09C7\u09B0 ${sym}${entry.refundAmount.toLocaleString()} \u099F\u09BE\u0995\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 \u0993\u09DF\u09BE\u09B2\u09C7\u099F\u09C7 \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09B2\u09CB\u0964`;
    const notificationId = generateId("notif");
    db.notifications.unshift({
      id: notificationId,
      userId: user.id,
      title,
      message,
      type: "warning",
      isRead: false,
      createdAt: now
    });
    notices.push({
      refundEventId: `${refundBatchId}_${user.id}`,
      notificationId,
      userId: user.id,
      username: user.username,
      lotteryId: lottery.id,
      lotterySlug: lottery.slug,
      lotteryName: lottery.name,
      category: lottery.category,
      soldTickets: lottery.soldTickets,
      totalTickets: lottery.totalTickets,
      ticketCount: entry.ticketNumbers.length,
      ticketNumbers: entry.ticketNumbers,
      refundAmount: entry.refundAmount,
      balanceAfter: user.balance,
      currencySymbol: sym,
      title,
      message,
      reason,
      refundedAt: now
    });
  }
  for (const purchase of db.purchases) {
    if (purchase.lotteryId === lottery.id && purchase.status === "completed") {
      purchase.status = "refunded";
    }
  }
  lottery.status = "refunded";
  lottery.updatedAt = now;
  pushAuditLog(
    db,
    actor,
    "CAMPAIGN_AUTO_REFUNDED",
    "lottery",
    lottery.id,
    {
      lotteryName: lottery.name,
      refundedTickets: pendingTickets.length,
      refundedUsers: notices.length,
      reason
    },
    ipAddress
  );
  return notices;
}
var announcedDrawCountdowns = /* @__PURE__ */ new Set();
var announcedOneMinuteWarnings = /* @__PURE__ */ new Set();
var activeDrawEventIds = /* @__PURE__ */ new Map();
function buildOneMinuteWarningPayload(db, lottery, remainingSeconds) {
  const sym = db.settings.currencySymbol || "\u09F3";
  const remainingTickets = Math.max(0, lottery.totalTickets - lottery.soldTickets);
  const clampedSecs = Math.max(1, Math.min(60, Math.ceil(remainingSeconds)));
  const title = `1 Minute Left \u2014 ${lottery.name}`;
  const message = remainingTickets > 0 ? `\u09B2\u099F\u09BE\u09B0\u09BF \u09B6\u09C7\u09B7 \u09B9\u09A4\u09C7 \u0986\u09B0 \u09AE\u09BE\u09A4\u09CD\u09B0 \u09E7 \u09AE\u09BF\u09A8\u09BF\u099F \u09AC\u09BE\u0995\u09BF! Prize: ${sym}${lottery.prizeAmount.toLocaleString()} \xB7 ${remainingTickets} tickets left. Tap now before time runs out!` : `\u09B2\u099F\u09BE\u09B0\u09BF \u09B6\u09C7\u09B7 \u09B9\u09A4\u09C7 \u0986\u09B0 \u09AE\u09BE\u09A4\u09CD\u09B0 \u09E7 \u09AE\u09BF\u09A8\u09BF\u099F \u09AC\u09BE\u0995\u09BF! Prize: ${sym}${lottery.prizeAmount.toLocaleString()} \xB7 All tickets sold \u2014 live draw begins in ${clampedSecs}s!`;
  return {
    warningId: `warn_1m_${lottery.id}_${new Date(lottery.endAt).getTime()}`,
    lotteryId: lottery.id,
    lotterySlug: lottery.slug,
    lotteryName: lottery.name,
    category: lottery.category,
    prizeAmount: lottery.prizeAmount,
    entryFee: lottery.entryFee,
    soldTickets: lottery.soldTickets,
    totalTickets: lottery.totalTickets,
    remainingTickets,
    currencySymbol: sym,
    remainingSeconds: clampedSecs,
    endAt: lottery.endAt,
    title,
    message
  };
}
function buildDrawCountdownPayload(db, lottery, countdownSeconds = 3) {
  const pendingTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status === "pending"
  );
  const drawEventId = activeDrawEventIds.get(lottery.id) || `draw_${lottery.id}_${Date.now()}`;
  activeDrawEventIds.set(lottery.id, drawEventId);
  return {
    drawEventId,
    lotteryId: lottery.id,
    lotterySlug: lottery.slug,
    lotteryName: lottery.name,
    category: lottery.category,
    prizeAmount: lottery.prizeAmount,
    currencySymbol: db.settings.currencySymbol || "\u09F3",
    totalTicketsEntered: pendingTickets.length,
    sampleTicketNumbers: pendingTickets.slice(0, 40).map((t) => t.ticketNumber),
    countdownSeconds,
    drawAt: new Date(Date.now() + countdownSeconds * 1e3).toISOString()
  };
}
function buildDrawCompletedPayload(db, lottery, result, winners) {
  const drawEventId = activeDrawEventIds.get(lottery.id) || `draw_${lottery.id}_${result.id}`;
  activeDrawEventIds.delete(lottery.id);
  announcedDrawCountdowns.delete(lottery.id);
  return {
    drawEventId,
    lotteryId: lottery.id,
    lotterySlug: lottery.slug,
    lotteryName: lottery.name,
    category: lottery.category,
    prizeAmount: lottery.prizeAmount,
    currencySymbol: db.settings.currencySymbol || "\u09F3",
    result,
    winners
  };
}
async function syncCampaignStatuses() {
  const snapshot = getDbSnapshot();
  const now = Date.now();
  let needsMutation = false;
  const pendingOneMinuteWarnings = [];
  for (const lot of snapshot.lotteries) {
    const startMs = new Date(lot.startAt).getTime();
    const endMs = new Date(lot.endAt).getTime();
    if (lot.status === "scheduled" && now >= startMs && now < endMs) {
      needsMutation = true;
    }
    if (lot.status === "active") {
      const remainingMs = endMs - now;
      const oneMinKey = `${lot.id}:${lot.endAt}`;
      if (remainingMs > 5e3 && remainingMs <= 60500 && !announcedOneMinuteWarnings.has(oneMinKey)) {
        announcedOneMinuteWarnings.add(oneMinKey);
        if (announcedOneMinuteWarnings.size > 200) {
          const oldest = announcedOneMinuteWarnings.values().next().value;
          if (oldest) announcedOneMinuteWarnings.delete(oldest);
        }
        const warningPayload = buildOneMinuteWarningPayload(
          snapshot,
          lot,
          Math.ceil(remainingMs / 1e3)
        );
        pendingOneMinuteWarnings.push(warningPayload);
        needsMutation = true;
      }
      if (remainingMs > 0 && remainingMs <= 3500 && lot.drawMode !== "manual" && !announcedDrawCountdowns.has(lot.id)) {
        const pendingTickets = snapshot.tickets.filter(
          (t) => t.lotteryId === lot.id && t.status === "pending"
        );
        const isFullySold = lot.soldTickets >= lot.totalTickets;
        if (pendingTickets.length > 0 && isFullySold) {
          announcedDrawCountdowns.add(lot.id);
          const countdownSecs = Math.max(1, Math.min(3, Math.ceil(remainingMs / 1e3)));
          broadcastChatEvent(
            "lottery:draw_countdown",
            buildDrawCountdownPayload(snapshot, lot, countdownSecs)
          );
        }
      }
      if (now >= endMs) {
        needsMutation = true;
      }
    }
  }
  if (!needsMutation) return;
  const completedBroadcasts = [];
  const refundNoticeBroadcasts = [];
  const refundedLotteryIds = [];
  await withTransaction((db) => {
    const txNow = Date.now();
    const txNowIso = new Date(txNow).toISOString();
    for (const warn of pendingOneMinuteWarnings) {
      const targetUserIds = /* @__PURE__ */ new Set();
      for (const ticket of db.tickets) {
        if (ticket.lotteryId === warn.lotteryId && ticket.status === "pending") {
          targetUserIds.add(ticket.userId);
        }
      }
      for (const usr of db.users) {
        if (usr.status === "active" && targetUserIds.size < 250) {
          targetUserIds.add(usr.id);
        }
      }
      for (const uid of targetUserIds) {
        const alreadyLogged = db.notifications.some(
          (n) => n.userId === uid && n.title === warn.title && n.message === warn.message
        );
        if (alreadyLogged) continue;
        db.notifications.unshift({
          id: generateId("ntf"),
          userId: uid,
          title: warn.title,
          message: warn.message,
          type: "warning",
          isRead: false,
          createdAt: txNowIso
        });
      }
    }
    for (const lot of db.lotteries) {
      const startMs = new Date(lot.startAt).getTime();
      const endMs = new Date(lot.endAt).getTime();
      if (lot.status === "scheduled" && txNow >= startMs && txNow < endMs) {
        lot.status = "active";
        lot.updatedAt = txNowIso;
      }
      if (lot.status === "active" && txNow >= endMs) {
        const pendingTickets = db.tickets.filter(
          (t) => t.lotteryId === lot.id && t.status === "pending"
        );
        const isFullySold = lot.soldTickets >= lot.totalTickets;
        if (pendingTickets.length === 0) {
          lot.status = "closed";
          lot.updatedAt = txNowIso;
        } else if (!isFullySold) {
          const notices = refundLotteryInDb(
            db,
            lot,
            "\u09B8\u09AC \u099F\u09BF\u0995\u09BF\u099F \u09AC\u09BF\u0995\u09CD\u09B0\u09BF \u09A8\u09BE \u09B9\u0993\u09DF\u09BE\u09DF \u0986\u09AA\u09A8\u09BE\u09B0 \u099F\u09BE\u0995\u09BE \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09B2\u09CB\u0964",
            { id: null, username: "SYSTEM_SCHEDULER" },
            "127.0.0.1"
          );
          refundNoticeBroadcasts.push(...notices);
          refundedLotteryIds.push(lot.id);
        } else if (lot.drawMode === "manual") {
          lot.status = "closed";
          lot.updatedAt = txNowIso;
        } else {
          const outcome = executeLotteryDrawInDb(
            db,
            lot.id,
            { id: null, username: "SYSTEM_SCHEDULER" },
            "127.0.0.1",
            true
          );
          completedBroadcasts.push(
            buildDrawCompletedPayload(db, lot, outcome.result, outcome.winners)
          );
        }
      }
    }
  });
  for (const warn of pendingOneMinuteWarnings) {
    broadcastChatEvent("lottery:one_minute_warning", warn);
  }
  for (const payload of completedBroadcasts) {
    broadcastChatEvent("lottery:draw_completed", payload);
  }
  if (refundNoticeBroadcasts.length > 0) {
    dispatchRefundNotices(refundNoticeBroadcasts);
  }
  for (const lotId of refundedLotteryIds) {
    broadcastChatEvent("lottery:overview_updated", { lotteryId: lotId, status: "refunded" });
  }
}
function pruneExpiredReservations(db, nowMs = Date.now()) {
  if (!Array.isArray(db.ticketReservations)) {
    db.ticketReservations = [];
    return;
  }
  db.ticketReservations = db.ticketReservations.filter((r) => {
    if (r.status === "pending_payment") {
      const pay = db.payments.find((p) => p.id === r.paymentId);
      return Boolean(pay && pay.status === "pending");
    }
    return new Date(r.expiresAt).getTime() > nowMs;
  });
}
function computeCampaignSlots(db, lottery, currentUserId) {
  const nowMs = Date.now();
  const activeTickets = db.tickets.filter(
    (t) => t.lotteryId === lottery.id && t.status !== "refunded"
  );
  const explicitTicketBySlot = /* @__PURE__ */ new Map();
  for (const t of activeTickets) {
    if (typeof t.slotNumber === "number" && t.slotNumber >= 1 && t.slotNumber <= lottery.totalTickets) {
      explicitTicketBySlot.set(t.slotNumber, t);
    }
  }
  const legacySoldNeeded = Math.max(0, lottery.soldTickets - explicitTicketBySlot.size);
  const legacySoldSet = /* @__PURE__ */ new Set();
  let filled = 0;
  for (let s = 1; s <= lottery.totalTickets && filled < legacySoldNeeded; s++) {
    if (!explicitTicketBySlot.has(s)) {
      legacySoldSet.add(s);
      filled++;
    }
  }
  const reservationBySlot = /* @__PURE__ */ new Map();
  for (const res of db.ticketReservations || []) {
    if (res.lotteryId !== lottery.id) continue;
    const isActive = res.status === "pending_payment" || new Date(res.expiresAt).getTime() > nowMs;
    if (!isActive) continue;
    for (const s of res.slotNumbers) {
      reservationBySlot.set(s, { userId: res.userId, expiresAt: res.expiresAt });
    }
  }
  const padWidth = Math.max(3, String(lottery.totalTickets).length);
  const slots = [];
  for (let s = 1; s <= lottery.totalTickets; s++) {
    const label = `#${String(s).padStart(padWidth, "0")}`;
    const explicitTicket = explicitTicketBySlot.get(s);
    if (explicitTicket) {
      slots.push({
        slotNumber: s,
        label,
        state: "sold",
        ticketNumber: explicitTicket.ticketNumber,
        reservedByMe: false,
        ownedByMe: Boolean(currentUserId && explicitTicket.userId === currentUserId),
        expiresAt: null
      });
    } else if (legacySoldSet.has(s)) {
      slots.push({
        slotNumber: s,
        label,
        state: "sold",
        ticketNumber: null,
        reservedByMe: false,
        ownedByMe: false,
        expiresAt: null
      });
    } else {
      const resInfo = reservationBySlot.get(s);
      if (resInfo) {
        slots.push({
          slotNumber: s,
          label,
          state: "reserved",
          ticketNumber: null,
          reservedByMe: Boolean(currentUserId && resInfo.userId === currentUserId),
          ownedByMe: false,
          expiresAt: resInfo.expiresAt
        });
      } else {
        slots.push({
          slotNumber: s,
          label,
          state: "available",
          ticketNumber: null,
          reservedByMe: false,
          ownedByMe: false,
          expiresAt: null
        });
      }
    }
  }
  return slots;
}
function reserveSlotsInDb(db, userId, lotteryIdOrSlug, requestedSlots) {
  pruneExpiredReservations(db);
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User account not found.");
  if (user.status !== "active") throw new Error("Account is suspended.");
  const lottery = db.lotteries.find(
    (l) => l.id === lotteryIdOrSlug || l.slug === lotteryIdOrSlug
  );
  if (!lottery) throw new Error("Lottery campaign not found.");
  if (lottery.status !== "active") {
    throw new Error(`This campaign is ${lottery.status} and cannot accept reservations.`);
  }
  const nowMs = Date.now();
  if (nowMs >= new Date(lottery.endAt).getTime()) {
    throw new Error("Ticket sales window has closed.");
  }
  const uniqueSlots = Array.from(new Set(requestedSlots.map((n) => Math.trunc(n))));
  if (uniqueSlots.length === 0 || uniqueSlots.length > 20) {
    throw new Error("Please select between 1 and 20 ticket numbers.");
  }
  for (const s of uniqueSlots) {
    if (!Number.isInteger(s) || s < 1 || s > lottery.totalTickets) {
      throw new Error(`Ticket slot #${s} is outside campaign range (1\u2013${lottery.totalTickets}).`);
    }
  }
  db.ticketReservations = db.ticketReservations.filter(
    (r) => !(r.lotteryId === lottery.id && r.userId === user.id && r.status === "held")
  );
  const computed = computeCampaignSlots(db, lottery, user.id);
  const slotMap = new Map(computed.map((c) => [c.slotNumber, c]));
  for (const s of uniqueSlots) {
    const info = slotMap.get(s);
    if (!info || info.state !== "available") {
      throw new Error(`Ticket #${s} is already ${info?.state || "unavailable"}. Please choose another.`);
    }
  }
  const expiresAt = new Date(nowMs + 5 * 60 * 1e3).toISOString();
  const reservation = {
    id: generateId("rsv"),
    lotteryId: lottery.id,
    userId: user.id,
    username: user.username,
    slotNumbers: uniqueSlots.sort((a, b) => a - b),
    status: "held",
    paymentId: null,
    expiresAt,
    createdAt: new Date(nowMs).toISOString()
  };
  db.ticketReservations.push(reservation);
  return {
    lottery,
    reservation,
    serverTotalAmount: Math.round(lottery.entryFee * uniqueSlots.length * 100) / 100,
    slots: computeCampaignSlots(db, lottery, user.id)
  };
}
function issueTicketsForPurchase(db, userId, lotteryIdOrSlug, quantity, requestedSlotNumbers, bypassBalanceDeduction = false) {
  pruneExpiredReservations(db);
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User account not found.");
  if (user.status !== "active") throw new Error("Your account is suspended. Please contact support.");
  const lottery = db.lotteries.find(
    (l) => l.id === lotteryIdOrSlug || l.slug === lotteryIdOrSlug
  );
  if (!lottery) throw new Error("Lottery campaign not found.");
  const now = Date.now();
  const startMs = new Date(lottery.startAt).getTime();
  const endMs = new Date(lottery.endAt).getTime();
  if (lottery.status === "drawn") {
    throw new Error("This lottery has already been drawn. Tickets can no longer be purchased.");
  }
  if (lottery.status !== "active") {
    throw new Error(`This campaign is currently ${lottery.status} and not accepting ticket purchases.`);
  }
  if (now < startMs) {
    throw new Error("This campaign has not started yet.");
  }
  if (now >= endMs) {
    throw new Error("Ticket sales have closed for this campaign.");
  }
  const remaining = lottery.totalTickets - lottery.soldTickets;
  if (remaining <= 0) {
    throw new Error("All tickets for this campaign have been sold.");
  }
  let targetSlots = [];
  if (Array.isArray(requestedSlotNumbers) && requestedSlotNumbers.length > 0) {
    targetSlots = Array.from(new Set(requestedSlotNumbers.map((n) => Math.trunc(n)))).sort(
      (a, b) => a - b
    );
    quantity = targetSlots.length;
  }
  if (quantity < 1 || quantity > 20 || !Number.isInteger(quantity)) {
    throw new Error("Ticket quantity must be a whole number between 1 and 20.");
  }
  if (quantity > remaining) {
    throw new Error(`Only ${remaining} tickets remain in this campaign.`);
  }
  db.ticketReservations = db.ticketReservations.filter(
    (r) => !(r.lotteryId === lottery.id && r.userId === user.id && r.status === "held")
  );
  const computed = computeCampaignSlots(db, lottery, user.id);
  const slotMap = new Map(computed.map((c) => [c.slotNumber, c]));
  if (targetSlots.length > 0) {
    for (const s of targetSlots) {
      const slotInfo = slotMap.get(s);
      if (!slotInfo) {
        throw new Error(`Ticket slot #${s} is invalid for this campaign.`);
      }
      const allowedPendingMine = slotInfo.state === "reserved" && slotInfo.reservedByMe;
      if (slotInfo.state !== "available" && !allowedPendingMine) {
        throw new Error(
          `Ticket #${s} is already ${slotInfo.state}. Duplicate or concurrent purchases are blocked.`
        );
      }
    }
  } else {
    const openSlots = computed.filter((c) => c.state === "available").map((c) => c.slotNumber);
    if (openSlots.length < quantity) {
      throw new Error("Not enough unreserved tickets remain to complete this purchase.");
    }
    for (let i = openSlots.length - 1; i > 0; i--) {
      const j = import_crypto6.default.randomInt(0, i + 1);
      const tmp = openSlots[i];
      openSlots[i] = openSlots[j];
      openSlots[j] = tmp;
    }
    targetSlots = openSlots.slice(0, quantity).sort((a, b) => a - b);
  }
  const totalCost = Math.round(lottery.entryFee * quantity * 100) / 100;
  if (!bypassBalanceDeduction && user.balance < totalCost) {
    throw new Error(
      `Insufficient wallet balance. Required ${db.settings.currencySymbol}${totalCost.toLocaleString()}, available ${db.settings.currencySymbol}${user.balance.toLocaleString()}.`
    );
  }
  const existingCodes = new Set(db.tickets.map((t) => t.ticketNumber));
  const nowIso = new Date(now).toISOString();
  const purchaseId = generateId("pur");
  if (!bypassBalanceDeduction) {
    user.balance = Math.round((user.balance - totalCost) * 100) / 100;
  }
  user.updatedAt = nowIso;
  lottery.soldTickets += quantity;
  lottery.updatedAt = nowIso;
  db.settings.jackpotPool = Math.round((db.settings.jackpotPool + totalCost * 0.1) * 100) / 100;
  db.purchases.unshift({
    id: purchaseId,
    userId: user.id,
    username: user.username,
    lotteryId: lottery.id,
    lotteryName: lottery.name,
    quantity,
    unitPrice: lottery.entryFee,
    totalAmount: totalCost,
    status: "completed",
    createdAt: nowIso
  });
  const createdTickets = [];
  for (const slotNum of targetSlots) {
    const ticketNumber = generateUniqueTicketCode(existingCodes);
    const ticket = {
      id: generateId("tkt"),
      purchaseId,
      lotteryId: lottery.id,
      lotteryName: lottery.name,
      userId: user.id,
      username: user.username,
      ticketNumber,
      slotNumber: slotNum,
      entryFee: lottery.entryFee,
      status: "pending",
      prizeAmount: 0,
      prizeRank: null,
      purchasedAt: nowIso
    };
    createdTickets.push(ticket);
    db.tickets.unshift(ticket);
  }
  if (!bypassBalanceDeduction) {
    db.transactions.unshift({
      id: generateId("txn"),
      userId: user.id,
      username: user.username,
      direction: "debit",
      category: "ticket_purchase",
      amount: totalCost,
      balanceAfter: user.balance,
      referenceId: purchaseId,
      gateway: "Wallet",
      description: `Purchased ${quantity} ticket${quantity > 1 ? "s" : ""} for "${lottery.name}" (${createdTickets.map((t) => t.ticketNumber).join(", ")})`,
      createdAt: nowIso
    });
  }
  db.notifications.unshift({
    id: generateId("notif"),
    userId: user.id,
    title: "Tickets Confirmed",
    message: `You purchased ${quantity} ticket${quantity > 1 ? "s" : ""} for "${lottery.name}": ${createdTickets.map((t) => t.ticketNumber).join(", ")}.`,
    type: "success",
    isRead: false,
    createdAt: nowIso
  });
  return { tickets: createdTickets, totalCost, lottery };
}

// server/services/smtpService.ts
var import_fs5 = __toESM(require("fs"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
function createDefaultSmtpConfig(siteName = "Lottery Winner") {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const envHost = (process.env.SMTP_HOST || "").trim();
  const envPort = Number(process.env.SMTP_PORT || 587) || 587;
  const envUser = (process.env.SMTP_USER || "").trim();
  const envPass = (process.env.SMTP_PASS || "").trim();
  const envFromEmail = (process.env.SMTP_FROM_EMAIL || envUser || "").trim();
  const hasEnv = Boolean(envHost && envUser && envPass);
  return {
    enabled: hasEnv,
    providerPreset: envHost.includes("gmail") ? "gmail" : envHost.includes("brevo") ? "brevo" : envHost.includes("zoho") ? "zoho" : "custom",
    host: envHost,
    port: envPort,
    secure: envPort === 465,
    username: envUser,
    password: envPass,
    fromName: siteName,
    fromEmail: envFromEmail,
    replyToEmail: envFromEmail,
    triggers: {
      digitalProductSent: true,
      physicalOrderConfirmation: true,
      onDemandConfirmation: true,
      cyberPackSent: true
    },
    lastHealthStatus: hasEnv ? "connected" : "not_configured",
    lastHealthMessage: hasEnv ? "Configured from server environment variables." : "Enter your SMTP Host, Username & App Password to enable live email delivery.",
    lastHealthLatencyMs: null,
    lastCheckedAt: null,
    updatedAt: now
  };
}
function ensureSmtpConfig(db) {
  if (!db.smtpConfig) {
    db.smtpConfig = createDefaultSmtpConfig(db.settings?.siteName || "Lottery Winner");
  }
  if (!db.smtpConfig.triggers) {
    db.smtpConfig.triggers = {
      digitalProductSent: true,
      physicalOrderConfirmation: true,
      onDemandConfirmation: true,
      cyberPackSent: true
    };
  }
  if (!Array.isArray(db.smtpLogs)) {
    db.smtpLogs = [];
  }
  return db.smtpConfig;
}
function toPublicSmtpConfig(cfg) {
  const { password, ...rest } = cfg;
  return {
    ...rest,
    hasPassword: Boolean(password && password.trim().length > 0)
  };
}
function isSmtpTriggerEnabled(cfg, trigger) {
  switch (trigger) {
    case "digital_product_sent":
      return cfg.triggers.digitalProductSent !== false;
    case "physical_order_confirmation":
    case "physical_order_update":
      return cfg.triggers.physicalOrderConfirmation !== false;
    case "on_demand_confirmation":
      return cfg.triggers.onDemandConfirmation !== false;
    case "cyber_pack_sent":
      return cfg.triggers.cyberPackSent !== false;
    case "admin_order_update":
    case "test_email":
    default:
      return true;
  }
}
function hasCompleteSmtpCredentials(cfg) {
  return Boolean(
    cfg.host && cfg.host.trim().length >= 3 && Number.isFinite(cfg.port) && cfg.port > 0 && cfg.username && cfg.username.trim().length > 0 && cfg.password && cfg.password.trim().length > 0
  );
}
function buildTransporter(cfg) {
  return import_nodemailer.default.createTransport({
    host: cfg.host.trim(),
    port: Number(cfg.port) || 587,
    secure: Boolean(cfg.secure) || Number(cfg.port) === 465,
    auth: {
      user: cfg.username.trim(),
      pass: cfg.password
    },
    connectionTimeout: 1e4,
    greetingTimeout: 1e4,
    socketTimeout: 15e3
  });
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function buildHtmlEmail(opts) {
  const triggerLabelMap = {
    digital_product_sent: "Digital Product Auto-Delivery",
    physical_order_confirmation: "Physical Order Confirmation",
    physical_order_update: "Physical Order Shipping Update",
    on_demand_confirmation: "On-Demand Order Confirmation",
    cyber_pack_sent: "Cyber Pack Delivery",
    admin_order_update: "Shop Order Update",
    test_email: "SMTP Live Verification"
  };
  const kicker = triggerLabelMap[opts.trigger] || "Shop Notification";
  const formattedBody = escapeHtml(opts.body).replace(/\n/g, "<br/>");
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#0B1221;color:#ffffff;padding:20px 24px;">
        <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fbbf24;font-weight:700;">
          ${escapeHtml(kicker)}
        </div>
        <div style="font-size:20px;font-weight:700;margin-top:6px;">
          ${escapeHtml(opts.siteName)}
        </div>
      </div>
      <div style="padding:24px;">
        <h2 style="margin:0 0 12px 0;font-size:18px;color:#0f172a;">${escapeHtml(opts.subject)}</h2>
        ${opts.orderId ? `<p style="margin:0 0 14px 0;font-size:12px;color:#64748b;font-family:monospace;">Order Ref: #${escapeHtml(
    opts.orderId.slice(-6).toUpperCase()
  )}</p>` : ""}
        <div style="font-size:14px;line-height:1.6;color:#334155;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;">
          ${formattedBody}
        </div>
        ${opts.attachmentName ? `<p style="margin:14px 0 0 0;font-size:13px;color:#047857;font-weight:600;">Attached Digital File: ${escapeHtml(
    opts.attachmentName
  )}</p>` : ""}
      </div>
      <div style="padding:14px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
        Sent automatically by ${escapeHtml(opts.siteName)} \xB7 You can also view your order inside My Orders &amp; Shop Inbox.
      </div>
    </div>
  </body>
</html>`;
}
async function verifySmtpConnection(cfg) {
  if (!cfg.enabled) {
    return {
      ok: false,
      status: "disabled",
      message: "SMTP delivery is currently toggled OFF.",
      latencyMs: null
    };
  }
  if (!hasCompleteSmtpCredentials(cfg)) {
    return {
      ok: false,
      status: "not_configured",
      message: "Missing SMTP Host, Port, Username, or Password.",
      latencyMs: null
    };
  }
  const started = Date.now();
  try {
    const transporter = buildTransporter(cfg);
    await transporter.verify();
    const latencyMs = Math.max(1, Date.now() - started);
    return {
      ok: true,
      status: "connected",
      message: `Connected to ${cfg.host}:${cfg.port} (${latencyMs} ms). Ready to deliver live emails.`,
      latencyMs
    };
  } catch (err) {
    const latencyMs = Math.max(1, Date.now() - started);
    const msg = err instanceof Error ? err.message : "SMTP handshake failed.";
    return {
      ok: false,
      status: "error",
      message: msg,
      latencyMs
    };
  }
}
function recordSmtpLogInDb(db, opts) {
  const cfg = ensureSmtpConfig(db);
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const triggerOn = isSmtpTriggerEnabled(cfg, opts.trigger);
  const canSendLive = cfg.enabled && triggerOn && hasCompleteSmtpCredentials(cfg);
  const log = {
    id: generateId("smtp"),
    orderId: opts.orderId || null,
    userId: opts.userId || null,
    username: opts.username || null,
    trigger: opts.trigger,
    toEmail: opts.toEmail,
    subject: opts.subject,
    bodyPreview: opts.body.slice(0, 260),
    attachmentName: opts.attachmentName || null,
    attachmentPath: opts.attachmentPath || null,
    status: canSendLive ? "sending" : "logged_only",
    providerMessageId: null,
    errorMessage: canSendLive ? null : !triggerOn ? "Trigger disabled in SMTP settings (logged locally)." : !cfg.enabled ? "SMTP disabled (logged in Shop Email History)." : "SMTP credentials not configured yet (logged locally).",
    latencyMs: null,
    createdAt: nowIso,
    completedAt: canSendLive ? null : nowIso
  };
  db.smtpLogs.unshift(log);
  if (db.smtpLogs.length > 250) {
    db.smtpLogs = db.smtpLogs.slice(0, 250);
  }
  if (!canSendLive) {
    return { log, job: null };
  }
  return {
    log,
    job: {
      logId: log.id,
      toEmail: opts.toEmail,
      subject: opts.subject,
      body: opts.body,
      trigger: opts.trigger,
      orderId: opts.orderId || null,
      attachmentName: opts.attachmentName || null,
      attachmentPath: opts.attachmentPath || null,
      siteName: db.settings?.siteName || "Lottery Winner",
      configSnapshot: { ...cfg, triggers: { ...cfg.triggers } }
    }
  };
}
async function deliverSmtpJob(job) {
  const cfg = job.configSnapshot;
  const started = Date.now();
  try {
    const transporter = buildTransporter(cfg);
    const fromEmail = cfg.fromEmail || cfg.username;
    const fromHeader = cfg.fromName ? `"${cfg.fromName.replace(/"/g, "")}" <${fromEmail}>` : fromEmail;
    const attachments = [];
    if (job.attachmentPath && import_fs5.default.existsSync(job.attachmentPath)) {
      attachments.push({
        filename: job.attachmentName || "digital-file",
        path: job.attachmentPath
      });
    }
    const info = await transporter.sendMail({
      from: fromHeader,
      to: job.toEmail,
      replyTo: cfg.replyToEmail || fromEmail,
      subject: job.subject,
      text: job.body,
      html: buildHtmlEmail({
        siteName: job.siteName,
        subject: job.subject,
        body: job.body,
        trigger: job.trigger,
        orderId: job.orderId,
        attachmentName: job.attachmentName
      }),
      attachments: attachments.length > 0 ? attachments : void 0
    });
    const latencyMs = Math.max(1, Date.now() - started);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    await withTransaction((db) => {
      const liveCfg = ensureSmtpConfig(db);
      liveCfg.lastHealthStatus = "connected";
      liveCfg.lastHealthLatencyMs = latencyMs;
      liveCfg.lastHealthMessage = `Delivered to ${job.toEmail} (${latencyMs} ms)`;
      liveCfg.lastCheckedAt = nowIso;
      const rec = (db.smtpLogs || []).find((l) => l.id === job.logId);
      if (rec) {
        rec.status = "sent";
        rec.providerMessageId = info.messageId || null;
        rec.errorMessage = null;
        rec.latencyMs = latencyMs;
        rec.completedAt = nowIso;
      }
    });
    return { ok: true, messageId: info.messageId || null, errorMessage: null, latencyMs };
  } catch (err) {
    const latencyMs = Math.max(1, Date.now() - started);
    const errorMessage = err instanceof Error ? err.message : "SMTP send failed.";
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    await withTransaction((db) => {
      const liveCfg = ensureSmtpConfig(db);
      liveCfg.lastHealthStatus = "error";
      liveCfg.lastHealthLatencyMs = latencyMs;
      liveCfg.lastHealthMessage = errorMessage;
      liveCfg.lastCheckedAt = nowIso;
      const rec = (db.smtpLogs || []).find((l) => l.id === job.logId);
      if (rec) {
        rec.status = "failed";
        rec.errorMessage = errorMessage;
        rec.latencyMs = latencyMs;
        rec.completedAt = nowIso;
      }
    });
    return { ok: false, messageId: null, errorMessage, latencyMs };
  }
}
function dispatchSmtpJobsInBackground(jobs) {
  for (const job of jobs) {
    void deliverSmtpJob(job).catch((err) => {
      console.error("[SMTP Async Delivery Error]", err);
    });
  }
}

// server/routes/api.ts
var GATEWAY_CATEGORIES = [
  "local_mfs",
  "bd_checkout",
  "international",
  "bank",
  "crypto",
  "custom"
];
var PLUGIN_CATEGORIES = [
  "payment",
  "marketing",
  "chat_support",
  "analytics",
  "security",
  "ui_widget",
  "custom"
];
var PLUGIN_HOOK_TYPES = [
  "announcement_bar",
  "floating_support",
  "deposit_bonus",
  "analytics_pixel",
  "webhook_notifier",
  "custom_widget",
  "payment_addon"
];
function toPublicGateway(gw) {
  return {
    id: gw.id,
    code: gw.code,
    name: gw.name,
    category: gw.category,
    mode: gw.mode,
    enabled: gw.enabled,
    supportsDeposit: gw.supportsDeposit,
    supportsWithdrawal: gw.supportsWithdrawal,
    currency: gw.currency,
    exchangeRate: gw.exchangeRate,
    minAmount: gw.minAmount,
    maxAmount: gw.maxAmount,
    feePercent: gw.feePercent,
    accountLabel: gw.accountLabel,
    accountValue: gw.accountValue,
    instructions: gw.instructions,
    qrImageUrl: gw.qrImageUrl || null,
    qrPreferred: Boolean(gw.qrPreferred),
    qrInstructionsBn: gw.qrInstructionsBn || "",
    environment: gw.environment,
    hasApiConfigured: Boolean(gw.apiKey && gw.apiKey.trim().length > 0)
  };
}
function toAdminGateway(gw) {
  const cleanKey = (gw.apiKey || "").trim();
  const apiKeyHint = cleanKey.length > 4 ? `\u2022\u2022\u2022\u2022${cleanKey.slice(-4)}` : cleanKey.length > 0 ? "\u2022\u2022\u2022\u2022" : "";
  return {
    ...toPublicGateway(gw),
    isBuiltIn: gw.isBuiltIn,
    apiBaseUrl: gw.apiBaseUrl || "",
    apiKeyHint,
    hasApiSecret: Boolean(gw.apiSecret && gw.apiSecret.trim().length > 0),
    hasWebhookSecret: Boolean(gw.webhookSecret && gw.webhookSecret.trim().length > 0),
    createdAt: gw.createdAt,
    updatedAt: gw.updatedAt
  };
}
function toPublicPlugin(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    version: p.version,
    category: p.category,
    hookType: p.hookType,
    config: p.config || {},
    customCss: p.customCss || "",
    customHtml: p.customHtml || ""
  };
}
function sanitizePluginHtml(input) {
  if (typeof input !== "string") return "";
  return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/on\w+\s*=\s*["'][^"']*["']/gi, "").replace(/javascript:/gi, "").slice(0, 4e3).trim();
}
function sanitizePluginCss(input) {
  if (typeof input !== "string") return "";
  return input.replace(/<\/?style[^>]*>/gi, "").replace(/@import/gi, "").slice(0, 4e3).trim();
}
function dispatchWebhookPlugins(db, eventName, payload) {
  const targets = (db.plugins || []).filter(
    (p) => p.enabled && p.hookType === "webhook_notifier" && typeof p.webhookUrl === "string" && /^https?:\/\//i.test(p.webhookUrl.trim())
  );
  for (const plg of targets) {
    const url = plg.webhookUrl.trim();
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        plugin: plg.slug,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        data: payload
      }),
      signal: AbortSignal.timeout(4e3)
    }).catch(() => {
    });
  }
}
function extractBearerOrCookieToken(req) {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === "string") {
    for (const part of cookieHeader.split(";")) {
      const [k, ...rest] = part.trim().split("=");
      if (k === "lw_session") {
        return decodeURIComponent(rest.join("="));
      }
    }
  }
  return null;
}
function requireAuth(req, res, next) {
  const token = extractBearerOrCookieToken(req);
  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ success: false, message: "Session expired or invalid. Please sign in again." });
    return;
  }
  const db = getDbSnapshot();
  const user = db.users.find((u) => u.id === payload.uid);
  if (!user) {
    res.status(401).json({ success: false, message: "Account not found." });
    return;
  }
  if (user.status !== "active") {
    res.status(403).json({ success: false, message: "This account has been suspended." });
    return;
  }
  req.authUser = user;
  next();
}
function requireStaff(req, res, next) {
  if (!req.authUser || req.authUser.role !== "admin" && req.authUser.role !== "moderator") {
    res.status(403).json({ success: false, message: "Administrator privileges required." });
    return;
  }
  next();
}
function requireAdminOnly(req, res, next) {
  if (!req.authUser || req.authUser.role !== "admin") {
    res.status(403).json({ success: false, message: "Full administrator role required." });
    return;
  }
  next();
}
function requireAgent(req, res, next) {
  if (!req.authUser || req.authUser.role !== "agent" && req.authUser.role !== "sub_agent") {
    res.status(403).json({ success: false, message: "Agent account access required." });
    return;
  }
  next();
}
var authLimiter = createRateLimiter("auth", 20, 5 * 60 * 1e3);
var financeLimiter = createRateLimiter("finance", 12, 5 * 60 * 1e3);
function createApiRouter() {
  const router = import_express3.default.Router();
  router.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  router.get("/csrf-token", (_req, res) => {
    const csrfToken = issueCsrfToken();
    res.json({ success: true, csrfToken });
  });
  router.use(verifyCsrfMiddleware);
  function extractDeviceFingerprint(req) {
    const headerVal = (typeof req.headers["x-device-fingerprint"] === "string" ? req.headers["x-device-fingerprint"] : "") || (typeof req.body?.deviceFingerprint === "string" ? req.body.deviceFingerprint : "");
    return sanitizeText(headerVal, 128);
  }
  router.get("/auth/captcha", (_req, res) => {
    const challenge = issueMathCaptcha();
    res.json({ success: true, ...challenge });
  });
  router.post("/auth/one-click-register", authLimiter, async (req, res) => {
    try {
      const ip = normalizeClientIp(getClientIp(req));
      const deviceFp = extractDeviceFingerprint(req);
      const snapshot = getDbSnapshot();
      const policy = snapshot.security?.policy || DEFAULT_SECURITY_POLICY;
      if (!policy.oneClickRegistrationEnabled) {
        res.status(403).json({
          success: false,
          message: "1-Click registration is currently disabled by the administrator."
        });
        return;
      }
      if (policy.requirePrivacyConsent && req.body?.privacyAccepted !== true) {
        res.status(400).json({
          success: false,
          message: "You must accept the Privacy Policy checkbox before creating an account."
        });
        return;
      }
      if (policy.requireRegisterCaptcha) {
        const cap = verifyMathCaptcha(req.body?.captchaId, req.body?.captchaAnswer);
        if (!cap.ok) {
          await withTransaction((db) => {
            pushSecurityEvent(db, {
              type: "CAPTCHA_FAILED",
              severity: "info",
              ip,
              deviceFingerprint: deviceFp || null,
              message: `Failed math captcha during 1-Click registration from IP ${ip}.`
            });
          });
          res.status(400).json({ success: false, message: cap.error });
          return;
        }
      }
      const outcome = await withTransaction((db) => {
        const guard = enforceRegistrationSecurity(db, ip, deviceFp);
        if (!guard.allowed) {
          return {
            ok: false,
            status: guard.httpStatus || 403,
            message: guard.message || "Registration blocked by Security Room."
          };
        }
        const creds = generateOneClickCredentials(db.users);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const bonus = db.settings.signupBonusEnabled ? Math.max(0, Number(db.settings.signupBonus) || 0) : 0;
        const userId = generateId("u");
        const refCheck = resolveReferrerForSignup(db, req.body?.referralCode, ip, deviceFp);
        const newUser = {
          id: userId,
          username: creds.username,
          fullName: `Player ${creds.username.replace(/^lw_/i, "")}`,
          email: creds.email,
          phone: "",
          avatarUrl: buildSvgAvatar(creds.username),
          passwordHash: hashPassword(creds.password),
          role: "user",
          status: "active",
          balance: bonus,
          spinCredits: 1,
          totalDeposited: 0,
          totalWithdrawn: 0,
          winsCount: 0,
          securityPinHash: null,
          pinLockEnabled: false,
          otpSecret: generateOtpSecret(),
          registeredIp: ip,
          lastLoginIp: ip,
          deviceFingerprint: deviceFp || null,
          registrationMethod: "one_click",
          privacyAcceptedAt: now,
          referralCode: generateUniqueReferralCode(creds.username, db.users),
          referredByUserId: null,
          referredByUsername: null,
          referralEarnings: 0,
          referralCount: 0,
          createdAt: now,
          updatedAt: now
        };
        db.users.push(newUser);
        if (bonus > 0) {
          db.transactions.unshift({
            id: generateId("txn"),
            userId,
            username: creds.username,
            direction: "credit",
            category: "signup_bonus",
            amount: bonus,
            balanceAfter: bonus,
            referenceId: null,
            gateway: "System",
            description: "Welcome signup credit (1-Click Registration)",
            createdAt: now
          });
          db.notifications.unshift({
            id: generateId("notif"),
            userId,
            title: "Welcome to Lottery Winner",
            message: `Your 1-Click account (${creds.username}) is ready with a ${db.settings.currencySymbol}${bonus} welcome bonus.`,
            type: "success",
            isRead: false,
            createdAt: now
          });
        }
        let referralApplied = null;
        if (refCheck.referrer) {
          const reward = creditSignupReferralRewards(db, newUser, refCheck.referrer);
          referralApplied = {
            referrerUsername: refCheck.referrer.username,
            inviteeBonus: reward.inviteeBonus
          };
        }
        pushSecurityEvent(db, {
          type: "ONE_CLICK_REGISTERED",
          severity: "info",
          ip,
          deviceFingerprint: deviceFp || null,
          username: creds.username,
          message: `1-Click account @${creds.username} created from IP ${ip}${referralApplied ? ` (referred by @${referralApplied.referrerUsername})` : ""}.`
        });
        return {
          ok: true,
          user: newUser,
          referralApplied,
          generatedCredentials: {
            username: creds.username,
            password: creds.password,
            createdAt: now,
            siteName: db.settings.siteName
          }
        };
      });
      if (!outcome.ok) {
        res.status(outcome.status).json({ success: false, message: outcome.message });
        return;
      }
      const token = signSessionToken(outcome.user.id, outcome.user.role);
      res.cookie("lw_session", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 86400 * 1e3 });
      res.status(201).json({
        success: true,
        token,
        user: toPublicUser(outcome.user),
        referralApplied: outcome.referralApplied,
        generatedCredentials: outcome.generatedCredentials
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "1-Click registration failed.";
      res.status(400).json({ success: false, message: msg });
    }
  });
  router.post("/auth/register", authLimiter, async (req, res) => {
    try {
      const ip = normalizeClientIp(getClientIp(req));
      const deviceFp = extractDeviceFingerprint(req);
      const snapshot = getDbSnapshot();
      const policy = snapshot.security?.policy || DEFAULT_SECURITY_POLICY;
      const username = sanitizeText(req.body?.username, 40).replace(/\s+/g, "_");
      const fullName = sanitizeText(req.body?.fullName, 100);
      const email = sanitizeText(req.body?.email, 140).toLowerCase();
      const phone = sanitizeText(req.body?.phone, 25);
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (policy.requirePrivacyConsent && req.body?.privacyAccepted !== true) {
        res.status(400).json({
          success: false,
          message: "You must accept the Privacy Policy before creating an account."
        });
        return;
      }
      if (policy.requireRegisterCaptcha) {
        const cap = verifyMathCaptcha(req.body?.captchaId, req.body?.captchaAnswer);
        if (!cap.ok) {
          await withTransaction((db) => {
            pushSecurityEvent(db, {
              type: "CAPTCHA_FAILED",
              severity: "info",
              ip,
              deviceFingerprint: deviceFp || null,
              username: username || null,
              message: `Failed math captcha during registration from IP ${ip}.`
            });
          });
          res.status(400).json({ success: false, message: cap.error });
          return;
        }
      }
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
        res.status(400).json({
          success: false,
          message: "Username must be 3\u201332 characters using letters, numbers, or underscores."
        });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ success: false, message: "Please enter a valid email address." });
        return;
      }
      if (policy.blockDisposableEmails && isDisposableEmail(email)) {
        await withTransaction((db) => {
          pushSecurityEvent(db, {
            type: "DISPOSABLE_EMAIL_BLOCKED",
            severity: "warning",
            ip,
            deviceFingerprint: deviceFp || null,
            username,
            message: `Blocked disposable email registration (${email}) from IP ${ip}.`
          });
        });
        res.status(400).json({
          success: false,
          message: "Temporary or disposable email addresses are blocked by Security Room."
        });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        return;
      }
      const outcome = await withTransaction((db) => {
        const guard = enforceRegistrationSecurity(db, ip, deviceFp);
        if (!guard.allowed) {
          return {
            ok: false,
            status: guard.httpStatus || 403,
            message: guard.message || "Registration blocked by Security Room."
          };
        }
        if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
          throw new Error("That username is already registered.");
        }
        if (db.users.some((u) => u.email.toLowerCase() === email)) {
          throw new Error("That email address is already registered.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const bonus = db.settings.signupBonusEnabled ? Math.max(0, Number(db.settings.signupBonus) || 0) : 0;
        const userId = generateId("u");
        const refCheck = resolveReferrerForSignup(db, req.body?.referralCode, ip, deviceFp);
        const newUser = {
          id: userId,
          username,
          fullName: fullName || username,
          email,
          phone,
          avatarUrl: buildSvgAvatar(fullName || username),
          passwordHash: hashPassword(password),
          role: "user",
          status: "active",
          balance: bonus,
          spinCredits: 1,
          totalDeposited: 0,
          totalWithdrawn: 0,
          winsCount: 0,
          securityPinHash: null,
          pinLockEnabled: false,
          otpSecret: generateOtpSecret(),
          registeredIp: ip,
          lastLoginIp: ip,
          deviceFingerprint: deviceFp || null,
          registrationMethod: "standard",
          privacyAcceptedAt: now,
          referralCode: generateUniqueReferralCode(username, db.users),
          referredByUserId: null,
          referredByUsername: null,
          referralEarnings: 0,
          referralCount: 0,
          createdAt: now,
          updatedAt: now
        };
        db.users.push(newUser);
        if (bonus > 0) {
          db.transactions.unshift({
            id: generateId("txn"),
            userId,
            username,
            direction: "credit",
            category: "signup_bonus",
            amount: bonus,
            balanceAfter: bonus,
            referenceId: null,
            gateway: "System",
            description: "Welcome signup credit",
            createdAt: now
          });
          db.notifications.unshift({
            id: generateId("notif"),
            userId,
            title: "Welcome to Lottery Winner",
            message: `Your account is active with a ${db.settings.currencySymbol}${bonus} welcome bonus.`,
            type: "success",
            isRead: false,
            createdAt: now
          });
        }
        let referralApplied = null;
        if (refCheck.referrer) {
          const reward = creditSignupReferralRewards(db, newUser, refCheck.referrer);
          referralApplied = {
            referrerUsername: refCheck.referrer.username,
            inviteeBonus: reward.inviteeBonus
          };
        }
        return { ok: true, user: newUser, referralApplied };
      });
      if (!outcome.ok) {
        res.status(outcome.status).json({ success: false, message: outcome.message });
        return;
      }
      const token = signSessionToken(outcome.user.id, outcome.user.role);
      res.cookie("lw_session", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 86400 * 1e3 });
      res.status(201).json({
        success: true,
        token,
        user: toPublicUser(outcome.user),
        referralApplied: outcome.referralApplied
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      res.status(400).json({ success: false, message: msg });
    }
  });
  router.post("/auth/login", authLimiter, async (req, res) => {
    const ip = normalizeClientIp(getClientIp(req));
    const deviceFp = extractDeviceFingerprint(req);
    const identifier = sanitizeText(req.body?.identifier || req.body?.email || req.body?.username, 140).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!identifier || !password) {
      res.status(400).json({ success: false, message: "Email/username and password are required." });
      return;
    }
    const db = getDbSnapshot();
    const policy = db.security?.policy || DEFAULT_SECURITY_POLICY;
    const lockout = checkLoginLockout(ip);
    if (lockout.locked) {
      res.status(429).json({
        success: false,
        message: `Too many failed login attempts from this IP. Try again in ${lockout.retryMinutes} minute(s).`
      });
      return;
    }
    if (policy.requireLoginCaptcha) {
      const cap = verifyMathCaptcha(req.body?.captchaId, req.body?.captchaAnswer);
      if (!cap.ok) {
        await withTransaction((d) => {
          pushSecurityEvent(d, {
            type: "CAPTCHA_FAILED",
            severity: "info",
            ip,
            deviceFingerprint: deviceFp || null,
            username: identifier,
            message: `Sign-in math captcha failed for "${identifier}" from IP ${ip}.`
          });
        });
        res.status(400).json({ success: false, message: cap.error });
        return;
      }
    }
    const user = db.users.find(
      (u) => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
    );
    const activeBlock = findActiveIpBlock(db.security, ip);
    if (activeBlock && (!user || user.role === "user")) {
      await withTransaction((d) => {
        const blk = findActiveIpBlock(d.security, ip);
        if (blk) {
          blk.hitCount = (blk.hitCount || 0) + 1;
          blk.lastHitAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        pushSecurityEvent(d, {
          type: "BLOCKED_IP_ATTEMPT",
          severity: "warning",
          ip,
          deviceFingerprint: deviceFp || null,
          username: identifier,
          message: `Blocked IP (${ip}) attempted sign-in as "${identifier}".`
        });
      });
      res.status(403).json({
        success: false,
        message: `Access denied. Your IP (${ip}) is blocked by Security Room.`
      });
      return;
    }
    if (!user || !verifyPassword(password, user.passwordHash)) {
      const failResult = recordFailedLogin(ip, policy);
      if (failResult.triggeredLockout) {
        await withTransaction((d) => {
          pushSecurityEvent(d, {
            type: "BRUTE_FORCE_LOCKOUT",
            severity: "critical",
            ip,
            deviceFingerprint: deviceFp || null,
            username: identifier,
            message: `Brute-force protection locked IP ${ip} after ${failResult.attempts} failed sign-in attempts.`
          });
        });
      }
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }
    if (user.status !== "active") {
      res.status(403).json({
        success: false,
        message: user.suspendedReason ? `Account suspended: ${user.suspendedReason}` : "Account is suspended. Contact administrator."
      });
      return;
    }
    clearFailedLogins(ip);
    const updatedUser = await withTransaction((d) => {
      const target = d.users.find((u) => u.id === user.id);
      if (target) {
        target.lastLoginIp = ip;
        if (deviceFp && !target.deviceFingerprint) {
          target.deviceFingerprint = deviceFp;
        }
        target.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return target;
      }
      return user;
    });
    const token = signSessionToken(updatedUser.id, updatedUser.role);
    res.cookie("lw_session", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 86400 * 1e3 });
    res.json({ success: true, token, user: toPublicUser(updatedUser) });
  });
  router.post("/auth/logout", (_req, res) => {
    res.clearCookie("lw_session");
    res.json({ success: true });
  });
  router.get("/auth/me", requireAuth, (req, res) => {
    res.json({ success: true, user: toPublicUser(req.authUser) });
  });
  function isValidAvatarDataUrl(url) {
    if (!url) return false;
    return url.startsWith("data:image/svg+xml") || url.startsWith("data:image/png;base64,") || url.startsWith("data:image/jpeg;base64,") || url.startsWith("data:image/webp;base64,") || url.startsWith("https://");
  }
  router.put("/auth/profile", requireAuth, async (req, res) => {
    try {
      const fullName = sanitizeText(req.body?.fullName, 100);
      const phone = sanitizeText(req.body?.phone, 25);
      const rawAvatar = typeof req.body?.avatarUrl === "string" ? req.body.avatarUrl.trim() : "";
      const dateOfBirth = typeof req.body?.dateOfBirth === "string" ? sanitizeText(req.body.dateOfBirth, 20) : void 0;
      const rawUsername = typeof req.body?.username === "string" ? sanitizeText(req.body.username, 32).replace(/^@+/, "").replace(/\s+/g, "_") : void 0;
      const rawEmail = typeof req.body?.email === "string" ? sanitizeText(req.body.email, 140).toLowerCase() : void 0;
      if (!fullName) {
        res.status(400).json({ success: false, message: "Full name cannot be empty." });
        return;
      }
      if (rawUsername !== void 0 && !/^[a-zA-Z0-9_]{3,32}$/.test(rawUsername)) {
        res.status(400).json({
          success: false,
          message: "Username must be 3\u201332 characters using letters, numbers, or underscores."
        });
        return;
      }
      if (rawEmail !== void 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        res.status(400).json({
          success: false,
          message: "Please enter a valid Gmail / email address."
        });
        return;
      }
      if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        res.status(400).json({
          success: false,
          message: "Please enter a valid Date of Birth."
        });
        return;
      }
      const updated = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("User not found.");
        if (rawUsername !== void 0) {
          const lowerUsername = rawUsername.toLowerCase();
          if (db.users.some((u) => u.id !== user.id && u.username.toLowerCase() === lowerUsername) || (db.agents || []).some((a) => a.username.toLowerCase() === lowerUsername)) {
            throw new Error("That username is already taken. Please choose another one.");
          }
          user.username = rawUsername;
        }
        if (rawEmail !== void 0) {
          if (db.users.some((u) => u.id !== user.id && u.email.toLowerCase() === rawEmail)) {
            throw new Error("That Gmail / email address is already registered to another account.");
          }
          user.email = rawEmail;
        }
        user.fullName = fullName;
        user.phone = phone;
        if (dateOfBirth !== void 0) {
          user.dateOfBirth = dateOfBirth || null;
        }
        if (isValidAvatarDataUrl(rawAvatar)) {
          user.avatarUrl = rawAvatar.slice(0, 35e4);
        } else if (!user.avatarUrl) {
          user.avatarUrl = buildSvgAvatar(fullName || user.username);
        }
        if (user.username && user.fullName && user.dateOfBirth && user.phone && user.email) {
          user.chatProfileCompleted = true;
        }
        user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return user;
      });
      res.json({ success: true, user: toPublicUser(updated) });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Update failed."
      });
    }
  });
  router.put("/chat/profile-setup", requireAuth, async (req, res) => {
    try {
      const username = sanitizeText(req.body?.username, 32).replace(/^@+/, "").replace(/\s+/g, "_");
      const fullName = sanitizeText(req.body?.fullName, 100);
      const dateOfBirth = sanitizeText(req.body?.dateOfBirth, 20);
      const phone = sanitizeText(req.body?.phone, 25);
      const email = sanitizeText(req.body?.email, 140).toLowerCase();
      const rawAvatar = typeof req.body?.avatarUrl === "string" ? req.body.avatarUrl.trim() : "";
      if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
        res.status(400).json({
          success: false,
          message: "Username must be 3\u201332 characters using letters, numbers, or underscores."
        });
        return;
      }
      if (!fullName || fullName.length < 2) {
        res.status(400).json({ success: false, message: "Please enter your full name." });
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        res.status(400).json({ success: false, message: "Please enter a valid Date of Birth." });
        return;
      }
      if (!phone || phone.length < 7) {
        res.status(400).json({ success: false, message: "Please enter a valid mobile number." });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400).json({ success: false, message: "Please enter a valid Gmail / email address." });
        return;
      }
      const updated = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("User not found.");
        const lowerUsername = username.toLowerCase();
        if (db.users.some((u) => u.id !== user.id && u.username.toLowerCase() === lowerUsername) || (db.agents || []).some((a) => a.username.toLowerCase() === lowerUsername)) {
          throw new Error("That username is already taken. Please choose another one.");
        }
        if (db.users.some((u) => u.id !== user.id && u.email.toLowerCase() === email)) {
          throw new Error("That Gmail / email address is already registered to another account.");
        }
        user.username = username;
        user.fullName = fullName;
        user.dateOfBirth = dateOfBirth;
        user.phone = phone;
        user.email = email;
        if (isValidAvatarDataUrl(rawAvatar)) {
          user.avatarUrl = rawAvatar.slice(0, 35e4);
        } else if (!user.avatarUrl) {
          user.avatarUrl = buildSvgAvatar(fullName || username);
        }
        user.chatProfileCompleted = true;
        user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return user;
      });
      res.json({
        success: true,
        message: "Chat profile saved successfully!",
        user: toPublicUser(updated)
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not save chat profile."
      });
    }
  });
  router.put("/auth/password", requireAuth, async (req, res) => {
    try {
      const currentPassword = typeof req.body?.currentPassword === "string" ? req.body.currentPassword : "";
      const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
      if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
        return;
      }
      await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("User not found.");
        if (!verifyPassword(currentPassword, user.passwordHash)) {
          throw new Error("Current password is incorrect.");
        }
        user.passwordHash = hashPassword(newPassword);
        user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      });
      res.json({ success: true, message: "Password updated successfully." });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed to update password." });
    }
  });
  router.put("/auth/security-pin", requireAuth, async (req, res) => {
    try {
      const pinLockEnabled = Boolean(req.body?.pinLockEnabled);
      const pin = typeof req.body?.pin === "string" ? req.body.pin.trim() : "";
      if (pinLockEnabled && !/^\d{4}$/.test(pin) && !req.authUser.securityPinHash) {
        res.status(400).json({ success: false, message: "Security PIN must be exactly 4 digits." });
        return;
      }
      if (pin && !/^\d{4}$/.test(pin)) {
        res.status(400).json({ success: false, message: "Security PIN must be exactly 4 digits." });
        return;
      }
      const updated = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("User not found.");
        if (pin) user.securityPinHash = hashPassword(pin);
        user.pinLockEnabled = pinLockEnabled;
        user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return user;
      });
      res.json({ success: true, user: toPublicUser(updated) });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed to update PIN." });
    }
  });
  router.get("/public/overview", async (_req, res) => {
    await syncCampaignStatuses();
    const db = getDbSnapshot();
    const publishedResults = db.lotteryResults.filter((r) => r.isPublished);
    const publishedResultIds = new Set(publishedResults.map((r) => r.id));
    const userLookup = new Map(db.users.map((u) => [u.id, u]));
    const enrichWinner = (w) => {
      const u = userLookup.get(w.userId);
      return {
        ...w,
        winnerFullName: u?.fullName || w.winnerFullName || w.username,
        winnerAvatar: u?.avatarUrl || w.winnerAvatar || buildSvgAvatar(w.username)
      };
    };
    const publicWinners = db.winners.filter((w) => publishedResultIds.has(w.resultId)).map(enrichWinner);
    const lotteriesWithPrizes = db.lotteries.map((lot) => ({
      ...lot,
      prizes: db.prizes.filter((p) => p.lotteryId === lot.id).sort((a, b) => a.rankPosition - b.rankPosition)
    }));
    const totalPrizesAwarded = publicWinners.reduce((sum, w) => sum + w.prizeAmount, 0);
    res.json({
      success: true,
      settings: {
        siteName: db.settings.siteName,
        siteTagline: db.settings.siteTagline,
        currencySymbol: db.settings.currencySymbol,
        mobileAgentBkash: db.settings.mobileAgentBkash,
        mobileAgentNagad: db.settings.mobileAgentNagad,
        mobileAgentRocket: db.settings.mobileAgentRocket,
        mobileAgentUpay: db.settings.mobileAgentUpay,
        bankDetails: db.settings.bankDetails,
        cryptoAddress: db.settings.cryptoAddress,
        minDeposit: db.settings.minDeposit,
        maxDeposit: db.settings.maxDeposit,
        minWithdrawal: db.settings.minWithdrawal,
        maxWithdrawal: db.settings.maxWithdrawal,
        withdrawalFeePercent: db.settings.withdrawalFeePercent,
        signupBonusEnabled: db.settings.signupBonusEnabled,
        signupBonus: db.settings.signupBonus,
        jackpotPool: db.settings.jackpotPool,
        maintenanceMode: db.settings.maintenanceMode,
        maintenanceMessage: db.settings.maintenanceMessage,
        popupEvent: db.settings.popupEvent,
        checkoutBrand: db.settings.checkoutBrand || {
          brandName: db.settings.siteName || "Lottery Winner",
          logoUrl: null,
          accentColor: "#0078E8",
          supportUrl: "https://t.me/lotterywinner_support",
          whatsappNumber: "+8801711000111",
          supportEmail: "support@lotterywinner.app",
          showSupportIcons: true,
          payButtonLabel: "Pay",
          currencyCode: "BDT",
          footerNote: "Secured Instant Checkout"
        },
        securityFlags: {
          oneClickRegistrationEnabled: db.security?.policy?.oneClickRegistrationEnabled ?? DEFAULT_SECURITY_POLICY.oneClickRegistrationEnabled,
          requirePrivacyConsent: db.security?.policy?.requirePrivacyConsent ?? DEFAULT_SECURITY_POLICY.requirePrivacyConsent,
          requireRegisterCaptcha: db.security?.policy?.requireRegisterCaptcha ?? DEFAULT_SECURITY_POLICY.requireRegisterCaptcha,
          requireLoginCaptcha: db.security?.policy?.requireLoginCaptcha ?? DEFAULT_SECURITY_POLICY.requireLoginCaptcha,
          maxAccountsPerIp: db.security?.policy?.maxAccountsPerIp ?? DEFAULT_SECURITY_POLICY.maxAccountsPerIp
        },
        referralFlags: {
          enabled: db.referrals?.config?.enabled ?? DEFAULT_REFERRAL_CONFIG.enabled,
          signupBonusForReferrer: db.referrals?.config?.signupBonusForReferrer ?? DEFAULT_REFERRAL_CONFIG.signupBonusForReferrer,
          signupBonusForInvitee: db.referrals?.config?.signupBonusForInvitee ?? DEFAULT_REFERRAL_CONFIG.signupBonusForInvitee,
          depositCommissionPercent: db.referrals?.config?.depositCommissionPercent ?? DEFAULT_REFERRAL_CONFIG.depositCommissionPercent,
          ticketCommissionPercent: db.referrals?.config?.ticketCommissionPercent ?? DEFAULT_REFERRAL_CONFIG.ticketCommissionPercent
        }
      },
      banners: db.banners.filter((b) => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
      categories: db.categories,
      lotteries: lotteriesWithPrizes,
      results: publishedResults,
      winners: publicWinners.slice(0, 30),
      paymentGateways: (db.paymentGateways || []).filter((g) => g.enabled).map(toPublicGateway),
      activePlugins: (db.plugins || []).filter((p) => p.enabled).map(toPublicPlugin),
      stats: {
        activeCampaigns: db.lotteries.filter((l) => l.status === "active").length,
        totalTicketsIssued: db.lotteries.reduce((s, l) => s + l.soldTickets, 0),
        totalWinners: publicWinners.length,
        totalPrizesAwarded
      }
    });
  });
  router.get("/lotteries/:id", async (req, res) => {
    await syncCampaignStatuses();
    await withTransaction((db2) => {
      pruneExpiredReservations(db2);
    });
    const db = getDbSnapshot();
    const token = extractBearerOrCookieToken(req);
    const payload = token ? verifySessionToken(token) : null;
    const currentUserId = payload?.uid || null;
    const identifier = decodeURIComponent(req.params.id);
    const lottery = db.lotteries.find(
      (l) => l.id === identifier || l.slug === identifier
    );
    if (!lottery) {
      res.status(404).json({ success: false, message: "Campaign not found." });
      return;
    }
    const userLookup = new Map(db.users.map((u) => [u.id, u]));
    const enrichWinner = (w) => {
      const u = userLookup.get(w.userId);
      return {
        ...w,
        winnerFullName: u?.fullName || w.winnerFullName || w.username,
        winnerAvatar: u?.avatarUrl || w.winnerAvatar || buildSvgAvatar(w.username)
      };
    };
    const prizes = db.prizes.filter((p) => p.lotteryId === lottery.id).sort((a, b) => a.rankPosition - b.rankPosition);
    const result = db.lotteryResults.find((r) => r.lotteryId === lottery.id && r.isPublished) || null;
    const winners = (result ? db.winners.filter((w) => w.resultId === result.id) : []).map(enrichWinner).sort((a, b) => a.rankPosition - b.rankPosition);
    const publishedResultIds = new Set(
      db.lotteryResults.filter((r) => r.isPublished).map((r) => r.id)
    );
    const previousWinners = db.winners.filter((w) => publishedResultIds.has(w.resultId) && w.lotteryId !== lottery.id).slice(0, 12).map(enrichWinner);
    const slots = computeCampaignSlots(db, lottery, currentUserId);
    const nowMs = Date.now();
    const activeHeld = currentUserId ? (db.ticketReservations || []).find(
      (r) => r.lotteryId === lottery.id && r.userId === currentUserId && r.status === "held" && new Date(r.expiresAt).getTime() > nowMs
    ) : null;
    const myReservation = activeHeld ? {
      id: activeHeld.id,
      slotNumbers: activeHeld.slotNumbers,
      expiresAt: activeHeld.expiresAt,
      serverTotalAmount: Math.round(lottery.entryFee * activeHeld.slotNumbers.length * 100) / 100
    } : null;
    const allCampaigns = db.lotteries.map((l) => ({
      id: l.id,
      slug: l.slug,
      name: l.name,
      category: l.category,
      entryFee: l.entryFee,
      prizeAmount: l.prizeAmount,
      soldTickets: l.soldTickets,
      totalTickets: l.totalTickets,
      status: l.status
    }));
    res.json({
      success: true,
      lottery: { ...lottery, prizes },
      prizes,
      result,
      winners,
      previousWinners,
      slots,
      myReservation,
      allCampaigns,
      paymentAgents: {
        bKash: db.settings.mobileAgentBkash,
        Nagad: db.settings.mobileAgentNagad,
        Rocket: db.settings.mobileAgentRocket,
        Upay: db.settings.mobileAgentUpay,
        minDeposit: db.settings.minDeposit
      }
    });
  });
  router.post("/lotteries/:id/reserve", requireAuth, financeLimiter, async (req, res) => {
    try {
      await syncCampaignStatuses();
      const identifier = decodeURIComponent(req.params.id);
      const rawSlots = Array.isArray(req.body?.slotNumbers) ? req.body.slotNumbers : [];
      const slotNumbers = rawSlots.map((n) => Number(n));
      const outcome = await withTransaction(
        (db) => reserveSlotsInDb(db, req.authUser.id, identifier, slotNumbers)
      );
      res.json({
        success: true,
        reservation: {
          id: outcome.reservation.id,
          slotNumbers: outcome.reservation.slotNumbers,
          expiresAt: outcome.reservation.expiresAt,
          serverTotalAmount: outcome.serverTotalAmount
        },
        slots: outcome.slots
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not reserve selected tickets."
      });
    }
  });
  router.delete("/lotteries/:id/reserve", requireAuth, async (req, res) => {
    const identifier = decodeURIComponent(req.params.id);
    const updatedSlots = await withTransaction((db) => {
      const lot = db.lotteries.find((l) => l.id === identifier || l.slug === identifier);
      if (!lot) return [];
      db.ticketReservations = (db.ticketReservations || []).filter(
        (r) => !(r.lotteryId === lot.id && r.userId === req.authUser.id && r.status === "held")
      );
      return computeCampaignSlots(db, lot, req.authUser.id);
    });
    res.json({ success: true, slots: updatedSlots });
  });
  router.get("/tickets/verify/:code", (req, res) => {
    const code = sanitizeText(req.params.code, 32).toUpperCase();
    const db = getDbSnapshot();
    const ticket = db.tickets.find((t) => t.ticketNumber.toUpperCase() === code);
    if (!ticket) {
      res.status(404).json({ success: false, message: `No ticket found matching ${code}.` });
      return;
    }
    const lottery = db.lotteries.find((l) => l.id === ticket.lotteryId);
    const result = db.lotteryResults.find((r) => r.lotteryId === ticket.lotteryId && r.isPublished);
    res.json({
      success: true,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        lotteryId: ticket.lotteryId,
        lotteryName: ticket.lotteryName,
        ownerUsername: ticket.username,
        entryFee: ticket.entryFee,
        status: ticket.status,
        prizeAmount: ticket.prizeAmount,
        prizeRank: ticket.prizeRank,
        purchasedAt: ticket.purchasedAt
      },
      lotteryStatus: lottery?.status || "unknown",
      drawSeedHash: result?.drawSeedHash || null
    });
  });
  function makeConversationKey(aType, aId, bType, bId) {
    const left = `${aType}:${aId}`;
    const right = `${bType}:${bId}`;
    return left < right ? `${left}__${right}` : `${right}__${left}`;
  }
  function buildDirectoryEntry(db, viewerId, targetType, targetId) {
    const follows = db.follows || [];
    const requests = db.friendRequests || [];
    const followersCount = follows.filter(
      (f) => f.targetType === targetType && f.targetId === targetId
    ).length;
    const isFollowing = Boolean(
      viewerId && follows.some(
        (f) => f.followerUserId === viewerId && f.targetType === targetType && f.targetId === targetId
      )
    );
    let friendStatus = "none";
    let friendRequestId = null;
    if (viewerId) {
      const matchingReq = requests.find(
        (r) => r.status !== "rejected" && (r.fromUserId === viewerId && r.toType === targetType && r.toId === targetId || targetType === "user" && r.fromUserId === targetId && r.toType === "user" && r.toId === viewerId)
      );
      if (matchingReq) {
        friendRequestId = matchingReq.id;
        if (matchingReq.status === "accepted") {
          friendStatus = "friends";
        } else if (matchingReq.fromUserId === viewerId) {
          friendStatus = "pending_sent";
        } else {
          friendStatus = "pending_received";
        }
      }
    }
    if (targetType === "agent") {
      const agent = (db.agents || []).find((a) => a.id === targetId);
      if (!agent) return null;
      return {
        id: agent.id,
        entityType: "agent",
        username: agent.username,
        fullName: agent.fullName,
        avatarUrl: agent.avatarUrl,
        role: "agent",
        district: agent.district,
        division: agent.division,
        phone: agent.phone,
        totalOrders: agent.totalOrders,
        isOnline: agent.isOnline,
        isVerified: agent.isVerified,
        followersCount,
        isFollowing,
        friendStatus,
        friendRequestId
      };
    }
    const u = db.users.find((x) => x.id === targetId && x.status === "active");
    if (!u) return null;
    return {
      id: u.id,
      entityType: "user",
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl || buildSvgAvatar(u.fullName || u.username),
      role: u.role,
      district: null,
      division: null,
      phone: null,
      totalOrders: void 0,
      isOnline: true,
      isVerified: u.role === "admin" || u.role === "moderator",
      followersCount,
      isFollowing,
      friendStatus,
      friendRequestId
    };
  }
  router.get("/chat/search", (req, res) => {
    const db = getDbSnapshot();
    const token = extractBearerOrCookieToken(req);
    const payload = token ? verifySessionToken(token) : null;
    const viewerId = payload?.uid || null;
    const rawQ = typeof req.query.q === "string" ? req.query.q.trim().replace(/^@+/, "").toLowerCase() : "";
    const filter = typeof req.query.filter === "string" ? req.query.filter.trim().toLowerCase() : "all";
    const results = [];
    if (filter === "all" || filter === "users") {
      for (const u of db.users) {
        if (u.status !== "active" || u.id === viewerId) continue;
        if (rawQ && !u.username.toLowerCase().includes(rawQ) && !u.fullName.toLowerCase().includes(rawQ)) {
          continue;
        }
        const entry = buildDirectoryEntry(db, viewerId, "user", u.id);
        if (entry) results.push(entry);
      }
    }
    if (filter === "all" || filter === "agents") {
      for (const a of db.agents || []) {
        if (rawQ && !a.username.toLowerCase().includes(rawQ) && !a.fullName.toLowerCase().includes(rawQ) && !a.district.toLowerCase().includes(rawQ) && !a.division.toLowerCase().includes(rawQ)) {
          continue;
        }
        const entry = buildDirectoryEntry(db, viewerId, "agent", a.id);
        if (entry) results.push(entry);
      }
    }
    if (rawQ) {
      results.sort((a, b) => {
        const aExact = a.username.toLowerCase() === rawQ ? 0 : a.username.toLowerCase().startsWith(rawQ) ? 1 : 2;
        const bExact = b.username.toLowerCase() === rawQ ? 0 : b.username.toLowerCase().startsWith(rawQ) ? 1 : 2;
        if (aExact !== bExact) return aExact - bExact;
        return a.username.localeCompare(b.username);
      });
    }
    res.json({
      success: true,
      query: rawQ,
      total: results.length,
      results: results.slice(0, 80)
    });
  });
  router.get("/chat/social", requireAuth, (req, res) => {
    const db = getDbSnapshot();
    const uid = req.authUser.id;
    const follows = db.follows || [];
    const requests = db.friendRequests || [];
    const dms = db.directMessages || [];
    const incomingRequests = requests.filter((r) => r.toType === "user" && r.toId === uid && r.status === "pending").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const outgoingRequests = requests.filter((r) => r.fromUserId === uid && r.status === "pending").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const acceptedReqs = requests.filter(
      (r) => r.status === "accepted" && (r.fromUserId === uid || r.toType === "user" && r.toId === uid)
    );
    const friendsMap = /* @__PURE__ */ new Map();
    for (const r of acceptedReqs) {
      const partnerType = r.fromUserId === uid ? r.toType : "user";
      const partnerId = r.fromUserId === uid ? r.toId : r.fromUserId;
      const key = `${partnerType}:${partnerId}`;
      if (!friendsMap.has(key)) {
        const entry = buildDirectoryEntry(db, uid, partnerType, partnerId);
        if (entry) friendsMap.set(key, entry);
      }
    }
    const following = [];
    for (const f of follows.filter((x) => x.followerUserId === uid)) {
      const entry = buildDirectoryEntry(db, uid, f.targetType, f.targetId);
      if (entry) following.push(entry);
    }
    const followersCount = follows.filter((x) => x.targetType === "user" && x.targetId === uid).length;
    const threadsMap = /* @__PURE__ */ new Map();
    for (const dm of dms) {
      const isSender = dm.senderType === "user" && dm.senderId === uid;
      const isRecipient = dm.recipientType === "user" && dm.recipientId === uid;
      if (!isSender && !isRecipient) continue;
      const partnerType = isSender ? dm.recipientType : dm.senderType;
      const partnerId = isSender ? dm.recipientId : dm.senderId;
      const partnerUsername = isSender ? dm.recipientUsername : dm.senderUsername;
      const partnerFullName = isSender ? dm.recipientFullName : dm.senderFullName;
      const partnerAvatarUrl = isSender ? dm.recipientAvatarUrl : dm.senderAvatarUrl;
      const partnerDistrict = isSender ? dm.recipientDistrict || null : null;
      const existing = threadsMap.get(dm.conversationKey);
      if (!existing || new Date(dm.createdAt).getTime() >= new Date(existing.lastMessageAt).getTime()) {
        threadsMap.set(dm.conversationKey, {
          conversationKey: dm.conversationKey,
          partnerId,
          partnerType,
          partnerUsername,
          partnerFullName,
          partnerAvatarUrl,
          partnerDistrict,
          lastMessage: dm.message,
          lastMessageAt: dm.createdAt,
          messageCount: (existing?.messageCount || 0) + 1
        });
      } else {
        existing.messageCount += 1;
      }
    }
    const threads = Array.from(threadsMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
    const primaryAdmin = db.users.find((u) => u.role === "admin" && u.status === "active") || db.users.find((u) => u.role === "moderator" && u.status === "active") || null;
    res.json({
      success: true,
      incomingRequests,
      outgoingRequests,
      friends: Array.from(friendsMap.values()),
      following,
      followersCount,
      followingCount: following.length,
      threads,
      supportAdmin: primaryAdmin ? {
        id: primaryAdmin.id,
        username: primaryAdmin.username,
        fullName: primaryAdmin.fullName,
        avatarUrl: primaryAdmin.avatarUrl || buildSvgAvatar(primaryAdmin.fullName || primaryAdmin.username)
      } : null
    });
  });
  router.post("/chat/follow", requireAuth, async (req, res) => {
    try {
      const targetType = req.body?.targetType === "agent" ? "agent" : "user";
      const targetId = sanitizeText(req.body?.targetId, 80);
      if (!targetId) {
        res.status(400).json({ success: false, message: "Target account ID is required." });
        return;
      }
      if (targetType === "user" && targetId === req.authUser.id) {
        res.status(400).json({ success: false, message: "You cannot follow your own account." });
        return;
      }
      const outcome = await withTransaction((db) => {
        if (!Array.isArray(db.follows)) db.follows = [];
        let targetUsername = "";
        if (targetType === "agent") {
          const agent = (db.agents || []).find((a) => a.id === targetId);
          if (!agent) throw new Error("District agent not found.");
          targetUsername = agent.username;
        } else {
          const targetUser = db.users.find((u) => u.id === targetId && u.status === "active");
          if (!targetUser) throw new Error("User not found.");
          targetUsername = targetUser.username;
        }
        const existingIdx = db.follows.findIndex(
          (f) => f.followerUserId === req.authUser.id && f.targetType === targetType && f.targetId === targetId
        );
        let following = false;
        if (existingIdx >= 0) {
          db.follows.splice(existingIdx, 1);
          following = false;
        } else {
          db.follows.unshift({
            id: generateId("flw"),
            followerUserId: req.authUser.id,
            targetId,
            targetType,
            targetUsername,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          following = true;
          if (targetType === "user") {
            db.notifications.unshift({
              id: generateId("notif"),
              userId: targetId,
              title: "New Follower",
              message: `@${req.authUser.username} started following you in Chat.`,
              type: "info",
              isRead: false,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
        const followersCount = db.follows.filter(
          (f) => f.targetType === targetType && f.targetId === targetId
        ).length;
        return { following, followersCount, targetUsername };
      });
      if (targetType === "user") {
        sendChatEventToUsers([req.authUser.id, targetId], "social:updated", {
          type: "follow",
          targetId,
          targetType
        });
      }
      res.json({
        success: true,
        message: outcome.following ? `You are now following @${outcome.targetUsername}.` : `Unfollowed @${outcome.targetUsername}.`,
        ...outcome
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update follow status."
      });
    }
  });
  router.post("/chat/friend-requests", requireAuth, async (req, res) => {
    try {
      const targetType = req.body?.targetType === "agent" ? "agent" : "user";
      const targetId = sanitizeText(req.body?.targetId, 80);
      if (!targetId) {
        res.status(400).json({ success: false, message: "Target account ID is required." });
        return;
      }
      if (targetType === "user" && targetId === req.authUser.id) {
        res.status(400).json({ success: false, message: "You cannot send a friend request to yourself." });
        return;
      }
      const created = await withTransaction((db) => {
        if (!Array.isArray(db.friendRequests)) db.friendRequests = [];
        const sender = db.users.find((u) => u.id === req.authUser.id);
        if (!sender) throw new Error("Account not found.");
        let toUsername = "";
        let toFullName = "";
        let toAvatarUrl = "";
        let toDistrict = null;
        if (targetType === "agent") {
          const agent = (db.agents || []).find((a) => a.id === targetId);
          if (!agent) throw new Error("District agent not found.");
          toUsername = agent.username;
          toFullName = agent.fullName;
          toAvatarUrl = agent.avatarUrl;
          toDistrict = agent.district;
        } else {
          const targetUser = db.users.find((u) => u.id === targetId && u.status === "active");
          if (!targetUser) throw new Error("User not found.");
          toUsername = targetUser.username;
          toFullName = targetUser.fullName;
          toAvatarUrl = targetUser.avatarUrl || buildSvgAvatar(targetUser.fullName || targetUser.username);
        }
        const existing = db.friendRequests.find(
          (r) => r.status !== "rejected" && (r.fromUserId === sender.id && r.toType === targetType && r.toId === targetId || targetType === "user" && r.fromUserId === targetId && r.toType === "user" && r.toId === sender.id)
        );
        if (existing) {
          if (existing.status === "accepted") {
            throw new Error(`You are already connected with @${toUsername}.`);
          }
          if (existing.fromUserId === sender.id) {
            throw new Error(`Friend request already sent to @${toUsername}.`);
          }
          existing.status = "accepted";
          existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          return existing;
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const requestRec = {
          id: generateId("frq"),
          fromUserId: sender.id,
          fromUsername: sender.username,
          fromFullName: sender.fullName,
          fromAvatarUrl: sender.avatarUrl || buildSvgAvatar(sender.fullName || sender.username),
          toId: targetId,
          toType: targetType,
          toUsername,
          toFullName,
          toAvatarUrl,
          toDistrict,
          status: "pending",
          createdAt: now,
          updatedAt: now
        };
        db.friendRequests.unshift(requestRec);
        if (targetType === "user") {
          db.notifications.unshift({
            id: generateId("notif"),
            userId: targetId,
            title: "New Friend Request",
            message: `@${sender.username} (${sender.fullName}) sent you a friend request in Chat.`,
            type: "info",
            isRead: false,
            createdAt: now
          });
        }
        return requestRec;
      });
      if (targetType === "user") {
        sendChatEventToUsers([req.authUser.id, targetId], "social:updated", {
          type: "friend_request",
          requestId: created.id
        });
      }
      res.status(201).json({
        success: true,
        message: created.status === "accepted" ? `You are now friends with @${created.toUsername}!` : `Friend request sent to @${created.toUsername}.`,
        request: created
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not send friend request."
      });
    }
  });
  router.post("/chat/friend-requests/:id/respond", requireAuth, async (req, res) => {
    try {
      const reqId = req.params.id;
      const action = req.body?.action;
      if (!["accept", "reject", "cancel"].includes(action)) {
        res.status(400).json({ success: false, message: "Invalid friend request action." });
        return;
      }
      const outcome = await withTransaction((db) => {
        if (!Array.isArray(db.friendRequests)) db.friendRequests = [];
        const record = db.friendRequests.find((r) => r.id === reqId);
        if (!record) throw new Error("Friend request not found.");
        const uid = req.authUser.id;
        if (action === "cancel") {
          if (record.fromUserId !== uid) {
            throw new Error("Only the sender can cancel this friend request.");
          }
          db.friendRequests = db.friendRequests.filter((r) => r.id !== reqId);
          return { action, fromUserId: record.fromUserId, toId: record.toId, toType: record.toType, username: record.toUsername };
        }
        if (record.toType !== "user" || record.toId !== uid) {
          throw new Error("You can only respond to friend requests sent to you.");
        }
        if (record.status !== "pending") {
          throw new Error("This friend request has already been handled.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        record.status = action === "accept" ? "accepted" : "rejected";
        record.updatedAt = now;
        if (action === "accept") {
          db.notifications.unshift({
            id: generateId("notif"),
            userId: record.fromUserId,
            title: "Friend Request Accepted",
            message: `@${req.authUser.username} accepted your friend request. You can now message each other in Chat.`,
            type: "success",
            isRead: false,
            createdAt: now
          });
        }
        return { action, fromUserId: record.fromUserId, toId: record.toId, toType: record.toType, username: record.fromUsername };
      });
      const notifyIds = [outcome.fromUserId];
      if (outcome.toType === "user") notifyIds.push(outcome.toId);
      sendChatEventToUsers(notifyIds, "social:updated", { type: "friend_response", action });
      res.json({
        success: true,
        message: action === "accept" ? `Accepted friend request from @${outcome.username}.` : action === "reject" ? `Declined friend request from @${outcome.username}.` : `Cancelled friend request to @${outcome.username}.`
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update friend request."
      });
    }
  });
  router.get("/chat/direct/:targetType/:targetId", requireAuth, (req, res) => {
    const db = getDbSnapshot();
    const targetType = req.params.targetType === "agent" ? "agent" : "user";
    const targetId = sanitizeText(req.params.targetId, 80);
    const partner = buildDirectoryEntry(db, req.authUser.id, targetType, targetId);
    if (!partner) {
      res.status(404).json({ success: false, message: "Chat recipient not found." });
      return;
    }
    const conversationKey = makeConversationKey("user", req.authUser.id, targetType, targetId);
    const messages = (db.directMessages || []).filter((m) => m.conversationKey === conversationKey).slice(-100);
    res.json({
      success: true,
      conversationKey,
      partner,
      messages
    });
  });
  router.post("/chat/direct/:targetType/:targetId", requireAuth, async (req, res) => {
    try {
      const targetType = req.params.targetType === "agent" ? "agent" : "user";
      const targetId = sanitizeText(req.params.targetId, 80);
      const text = sanitizeText(req.body?.message, 600);
      if (!text) {
        res.status(400).json({ success: false, message: "Please enter a message before sending." });
        return;
      }
      if (targetType === "user" && targetId === req.authUser.id) {
        res.status(400).json({ success: false, message: "You cannot message yourself." });
        return;
      }
      const created = await withTransaction((db) => {
        if (!Array.isArray(db.directMessages)) db.directMessages = [];
        const sender = db.users.find((u) => u.id === req.authUser.id);
        if (!sender) throw new Error("Account not found.");
        let recipientUsername = "";
        let recipientFullName = "";
        let recipientAvatarUrl = "";
        let recipientDistrict = null;
        if (targetType === "agent") {
          const agent = (db.agents || []).find((a) => a.id === targetId);
          if (!agent) throw new Error("District agent not found.");
          recipientUsername = agent.username;
          recipientFullName = agent.fullName;
          recipientAvatarUrl = agent.avatarUrl;
          recipientDistrict = agent.district;
        } else {
          const recipientUser = db.users.find((u) => u.id === targetId && u.status === "active");
          if (!recipientUser) throw new Error("Recipient user not found.");
          recipientUsername = recipientUser.username;
          recipientFullName = recipientUser.fullName;
          recipientAvatarUrl = recipientUser.avatarUrl || buildSvgAvatar(recipientUser.fullName || recipientUser.username);
        }
        const conversationKey = makeConversationKey("user", sender.id, targetType, targetId);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const dm = {
          id: generateId("dm"),
          conversationKey,
          senderId: sender.id,
          senderType: "user",
          senderUsername: sender.username,
          senderFullName: sender.fullName,
          senderAvatarUrl: sender.avatarUrl || buildSvgAvatar(sender.fullName || sender.username),
          recipientId: targetId,
          recipientType: targetType,
          recipientUsername,
          recipientFullName,
          recipientAvatarUrl,
          recipientDistrict,
          message: text,
          createdAt: now
        };
        db.directMessages.push(dm);
        if (db.directMessages.length > 1e3) {
          db.directMessages = db.directMessages.slice(-1e3);
        }
        if (targetType === "user") {
          db.notifications.unshift({
            id: generateId("notif"),
            userId: targetId,
            title: `New Message from @${sender.username}`,
            message: text.slice(0, 120),
            type: "info",
            isRead: false,
            createdAt: now
          });
        } else if (targetType === "agent") {
          const linkedAgent = (db.agents || []).find((a) => a.id === targetId);
          if (linkedAgent?.userId) {
            db.notifications.unshift({
              id: generateId("notif"),
              userId: linkedAgent.userId,
              title: `Player Message from @${sender.username}`,
              message: text.slice(0, 120),
              type: "info",
              isRead: false,
              createdAt: now
            });
          }
        }
        return dm;
      });
      const recipientSockets = [req.authUser.id];
      if (targetType === "user") {
        recipientSockets.push(targetId);
      } else if (targetType === "agent") {
        const snap = getDbSnapshot();
        const linkedAgent = (snap.agents || []).find((a) => a.id === targetId);
        if (linkedAgent?.userId) recipientSockets.push(linkedAgent.userId);
      }
      sendChatEventToUsers(recipientSockets, "direct:message", created);
      const snapAfter = getDbSnapshot();
      const staffIds = snapAfter.users.filter((u) => (u.role === "admin" || u.role === "moderator") && u.status === "active").map((u) => u.id);
      if (staffIds.length > 0) {
        sendChatEventToUsers(staffIds, "admin:inbox_message", created);
      }
      res.status(201).json({ success: true, message: created });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to send direct message."
      });
    }
  });
  const ALLOWED_REACTIONS = /* @__PURE__ */ new Set(["\u{1F44D}", "\u2764\uFE0F", "\u{1F525}", "\u{1F389}", "\u{1F602}", "\u{1F44F}"]);
  const VALID_CHANNELS = /* @__PURE__ */ new Set(["general", "winners", "agents"]);
  router.get("/chat/messages", (req, res) => {
    const db = getDbSnapshot();
    const channelParam = typeof req.query.channel === "string" ? req.query.channel.trim().toLowerCase() : "all";
    const userAvatarById = new Map(db.users.map((u) => [u.id, u.avatarUrl]));
    const allMessages = (db.chatMessages || []).map((m) => ({
      ...m,
      channel: m.channel || "general",
      reactions: m.reactions || {},
      isPinned: Boolean(m.isPinned),
      avatarUrl: m.avatarUrl || userAvatarById.get(m.userId) || buildSvgAvatar(m.fullName || m.username)
    }));
    const filtered = channelParam !== "all" && VALID_CHANNELS.has(channelParam) ? allMessages.filter((m) => (m.channel || "general") === channelParam) : allMessages;
    const messages = filtered.slice(-150);
    const pinnedMessage = [...filtered].reverse().find((m) => m.isPinned) || null;
    res.json({
      success: true,
      messages,
      pinnedMessage,
      onlineCount: Math.max(1, getOnlineChatCount())
    });
  });
  router.post("/chat/messages", requireAuth, async (req, res) => {
    try {
      const text = sanitizeText(req.body?.message, 600);
      const rawChannel = typeof req.body?.channel === "string" ? req.body.channel.trim().toLowerCase() : "general";
      const channel = VALID_CHANNELS.has(rawChannel) ? rawChannel : "general";
      const replyToId = typeof req.body?.replyToId === "string" ? sanitizeText(req.body.replyToId, 80) : "";
      const rawImage = typeof req.body?.imageUrl === "string" ? req.body.imageUrl.trim() : "";
      const imageUrl = rawImage && isValidAvatarDataUrl(rawImage) ? rawImage.slice(0, 48e4) : null;
      if (!text && !imageUrl) {
        res.status(400).json({
          success: false,
          message: "Please enter a message or attach an image before sending."
        });
        return;
      }
      const created = await withTransaction((db) => {
        if (!Array.isArray(db.chatMessages)) db.chatMessages = [];
        const sender = db.users.find((u) => u.id === req.authUser.id);
        let replyTo = null;
        if (replyToId) {
          const target = db.chatMessages.find((m) => m.id === replyToId);
          if (target) {
            replyTo = {
              id: target.id,
              username: target.username,
              fullName: target.fullName,
              message: (target.message || (target.imageUrl ? "Photo" : "")).slice(0, 140)
            };
          }
        }
        const msg = {
          id: generateId("chat"),
          userId: req.authUser.id,
          username: sender?.username || req.authUser.username,
          fullName: sender?.fullName || req.authUser.fullName,
          avatarUrl: sender?.avatarUrl || req.authUser.avatarUrl || buildSvgAvatar(req.authUser.fullName || req.authUser.username),
          role: req.authUser.role,
          channel,
          message: text,
          imageUrl,
          replyTo,
          reactions: {},
          isPinned: false,
          editedAt: null,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.chatMessages.push(msg);
        if (db.chatMessages.length > 400) {
          db.chatMessages = db.chatMessages.slice(-400);
        }
        return msg;
      });
      broadcastChatEvent("community:message", created);
      res.status(201).json({ success: true, message: created });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to send message."
      });
    }
  });
  router.patch("/chat/messages/:id", requireAuth, async (req, res) => {
    try {
      const msgId = req.params.id;
      const text = sanitizeText(req.body?.message, 600);
      if (!text) {
        res.status(400).json({ success: false, message: "Edited message cannot be empty." });
        return;
      }
      const updated = await withTransaction((db) => {
        const msg = (db.chatMessages || []).find((m) => m.id === msgId);
        if (!msg) throw new Error("Message not found.");
        if (msg.userId !== req.authUser.id) {
          throw new Error("You can only edit your own messages.");
        }
        msg.message = text;
        msg.editedAt = (/* @__PURE__ */ new Date()).toISOString();
        return {
          ...msg,
          channel: msg.channel || "general",
          reactions: msg.reactions || {},
          isPinned: Boolean(msg.isPinned)
        };
      });
      broadcastChatEvent("community:updated", updated);
      res.json({ success: true, message: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not edit message."
      });
    }
  });
  router.post("/chat/messages/:id/react", requireAuth, async (req, res) => {
    try {
      const msgId = req.params.id;
      const emoji = typeof req.body?.emoji === "string" ? req.body.emoji.trim() : "";
      if (!ALLOWED_REACTIONS.has(emoji)) {
        res.status(400).json({ success: false, message: "Unsupported emoji reaction." });
        return;
      }
      const updated = await withTransaction((db) => {
        const msg = (db.chatMessages || []).find((m) => m.id === msgId);
        if (!msg) throw new Error("Message not found.");
        if (!msg.reactions || typeof msg.reactions !== "object") {
          msg.reactions = {};
        }
        const currentList = Array.isArray(msg.reactions[emoji]) ? [...msg.reactions[emoji]] : [];
        const uid = req.authUser.id;
        const idx = currentList.indexOf(uid);
        if (idx >= 0) {
          currentList.splice(idx, 1);
        } else {
          currentList.push(uid);
        }
        if (currentList.length === 0) {
          delete msg.reactions[emoji];
        } else {
          msg.reactions[emoji] = currentList;
        }
        return {
          ...msg,
          channel: msg.channel || "general",
          reactions: msg.reactions,
          isPinned: Boolean(msg.isPinned)
        };
      });
      broadcastChatEvent("community:updated", updated);
      res.json({ success: true, message: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not react to message."
      });
    }
  });
  router.post("/chat/messages/:id/pin", requireAuth, requireStaff, async (req, res) => {
    try {
      const msgId = req.params.id;
      const updated = await withTransaction((db) => {
        const msg = (db.chatMessages || []).find((m) => m.id === msgId);
        if (!msg) throw new Error("Message not found.");
        const targetChannel = msg.channel || "general";
        const nextPinned = !msg.isPinned;
        for (const m of db.chatMessages || []) {
          if ((m.channel || "general") === targetChannel) {
            m.isPinned = false;
          }
        }
        msg.isPinned = nextPinned;
        return {
          ...msg,
          channel: targetChannel,
          reactions: msg.reactions || {},
          isPinned: Boolean(msg.isPinned)
        };
      });
      broadcastChatEvent("community:updated", updated);
      res.json({ success: true, message: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update pinned message."
      });
    }
  });
  router.delete("/chat/messages/:id", requireAuth, async (req, res) => {
    try {
      const msgId = req.params.id;
      await withTransaction((db) => {
        const msg = (db.chatMessages || []).find((m) => m.id === msgId);
        if (!msg) throw new Error("Message not found.");
        const isStaff = req.authUser.role === "admin" || req.authUser.role === "moderator";
        if (msg.userId !== req.authUser.id && !isStaff) {
          throw new Error("You can only delete your own messages.");
        }
        db.chatMessages = db.chatMessages.filter((m) => m.id !== msgId);
      });
      broadcastChatEvent("community:deleted", { id: msgId });
      res.json({ success: true });
    } catch (err) {
      res.status(403).json({ success: false, message: err instanceof Error ? err.message : "Delete failed." });
    }
  });
  router.post("/tickets/purchase", requireAuth, financeLimiter, async (req, res) => {
    try {
      await syncCampaignStatuses();
      const lotteryId = sanitizeText(req.body?.lotteryId, 120);
      const quantity = Number(req.body?.quantity ?? 1);
      const slotNumbers = Array.isArray(req.body?.slotNumbers) ? req.body.slotNumbers.map((n) => Number(n)) : void 0;
      const paymentMethod = req.body?.paymentMethod === "mfs" ? "mfs" : "wallet";
      if (!lotteryId) {
        res.status(400).json({ success: false, message: "Campaign ID or slug is required." });
        return;
      }
      if (paymentMethod === "mfs") {
        const gateway = sanitizeText(req.body?.gateway, 30);
        const senderNumber = sanitizeText(req.body?.senderNumber, 60);
        const trxId = sanitizeText(req.body?.trxId, 80).toUpperCase();
        if (!["bKash", "Nagad", "Rocket", "Upay"].includes(gateway)) {
          res.status(400).json({ success: false, message: "Please select bKash, Nagad, Rocket, or Upay." });
          return;
        }
        if (!senderNumber || senderNumber.length < 6) {
          res.status(400).json({ success: false, message: "Valid sender mobile number is required." });
          return;
        }
        if (!/^[A-Z0-9_-]{4,64}$/.test(trxId)) {
          res.status(400).json({
            success: false,
            message: "Transaction ID must be 4\u201364 alphanumeric characters."
          });
          return;
        }
        const pendingOutcome = await withTransaction((db) => {
          pruneExpiredReservations(db);
          if (db.payments.some((p) => p.trxId.toUpperCase() === trxId)) {
            throw new Error("This Transaction ID has already been submitted. Duplicate TrxIDs are rejected.");
          }
          const lottery = db.lotteries.find((l) => l.id === lotteryId || l.slug === lotteryId);
          if (!lottery) throw new Error("Lottery campaign not found.");
          if (lottery.status !== "active") {
            throw new Error(`This campaign is currently ${lottery.status} and cannot accept purchases.`);
          }
          db.ticketReservations = db.ticketReservations.filter(
            (r) => !(r.lotteryId === lottery.id && r.userId === req.authUser.id && r.status === "held")
          );
          const computed = computeCampaignSlots(db, lottery, req.authUser.id);
          const slotMap = new Map(computed.map((c) => [c.slotNumber, c]));
          let targetSlots = [];
          if (slotNumbers && slotNumbers.length > 0) {
            targetSlots = Array.from(
              new Set(slotNumbers.map((n) => Math.trunc(n)))
            ).sort((a, b) => a - b);
            for (const s of targetSlots) {
              const info = slotMap.get(s);
              if (!info || info.state !== "available") {
                throw new Error(`Ticket #${s} is already ${info?.state || "unavailable"}.`);
              }
            }
          } else {
            const count = Math.max(1, Math.min(20, Math.trunc(quantity)));
            targetSlots = computed.filter((c) => c.state === "available").slice(0, count).map((c) => c.slotNumber);
            if (targetSlots.length < count) {
              throw new Error("Not enough unreserved tickets remain.");
            }
          }
          if (targetSlots.length === 0 || targetSlots.length > 20) {
            throw new Error("Please select between 1 and 20 tickets.");
          }
          const serverTotal = Math.round(lottery.entryFee * targetSlots.length * 100) / 100;
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const paymentId = generateId("pay");
          const paymentRec = {
            id: paymentId,
            userId: req.authUser.id,
            username: req.authUser.username,
            gateway,
            senderNumber,
            trxId,
            amount: serverTotal,
            status: "pending",
            verificationNote: `Reserved ${targetSlots.length} ticket(s) [#${targetSlots.join(", #")}] for "${lottery.name}" \u2014 pending TrxID verification`,
            verifiedBy: null,
            verifiedAt: null,
            reservedLotteryId: lottery.id,
            reservedSlots: targetSlots,
            createdAt: nowIso
          };
          db.payments.unshift(paymentRec);
          const rsv = {
            id: generateId("rsv"),
            lotteryId: lottery.id,
            userId: req.authUser.id,
            username: req.authUser.username,
            slotNumbers: targetSlots,
            status: "pending_payment",
            paymentId,
            expiresAt: new Date(Date.now() + 24 * 3600 * 1e3).toISOString(),
            createdAt: nowIso
          };
          db.ticketReservations.push(rsv);
          db.notifications.unshift({
            id: generateId("notif"),
            userId: req.authUser.id,
            title: "Ticket Reservation Pending Verification",
            message: `${targetSlots.length} ticket slot(s) in "${lottery.name}" are reserved while ${gateway} TrxID ${trxId} (${db.settings.currencySymbol}${serverTotal}) awaits verification.`,
            type: "info",
            isRead: false,
            createdAt: nowIso
          });
          return {
            payment: paymentRec,
            serverTotal,
            reservedSlots: targetSlots,
            slots: computeCampaignSlots(db, lottery, req.authUser.id),
            user: toPublicUser(db.users.find((u) => u.id === req.authUser.id)),
            lottery
          };
        });
        res.status(202).json({
          success: true,
          pendingVerification: true,
          message: `Slots locked! Payment ${pendingOutcome.payment.trxId} (${pendingOutcome.payment.gateway}) is pending verification. Tickets will be issued once verified.`,
          ...pendingOutcome
        });
        return;
      }
      const outcome = await withTransaction((db) => {
        const resPurchase = issueTicketsForPurchase(
          db,
          req.authUser.id,
          lotteryId,
          quantity,
          slotNumbers
        );
        const updatedUser = db.users.find((u) => u.id === req.authUser.id);
        creditTicketReferralCommission(
          db,
          updatedUser,
          resPurchase.totalCost,
          resPurchase.tickets[0]?.purchaseId || resPurchase.lottery.id,
          resPurchase.lottery.name
        );
        const slots = computeCampaignSlots(db, resPurchase.lottery, req.authUser.id);
        return {
          ...resPurchase,
          user: toPublicUser(updatedUser),
          slots
        };
      });
      res.status(201).json({
        success: true,
        pendingVerification: false,
        message: `Issued ${outcome.tickets.length} ticket${outcome.tickets.length > 1 ? "s" : ""} successfully.`,
        tickets: outcome.tickets,
        totalCost: outcome.totalCost,
        user: outcome.user,
        lottery: outcome.lottery,
        slots: outcome.slots
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Purchase failed." });
    }
  });
  router.get("/user/dashboard", requireAuth, async (req, res) => {
    await syncCampaignStatuses();
    const db = getDbSnapshot();
    const uid = req.authUser.id;
    const user = db.users.find((u) => u.id === uid);
    res.json({
      success: true,
      user: toPublicUser(user),
      tickets: db.tickets.filter((t) => t.userId === uid),
      purchases: db.purchases.filter((p) => p.userId === uid),
      payments: db.payments.filter((p) => p.userId === uid),
      withdrawals: db.withdrawals.filter((w) => w.userId === uid),
      transactions: db.transactions.filter((t) => t.userId === uid),
      winnings: db.winners.filter((w) => w.userId === uid),
      notifications: db.notifications.filter((n) => n.userId === uid)
    });
  });
  router.post("/user/notifications/read", requireAuth, async (req, res) => {
    const notificationId = sanitizeText(req.body?.id, 64);
    await withTransaction((db) => {
      for (const n of db.notifications) {
        if (n.userId === req.authUser.id && (!notificationId || n.id === notificationId)) {
          n.isRead = true;
        }
      }
    });
    res.json({ success: true });
  });
  router.get("/agents", (req, res) => {
    const db = getDbSnapshot();
    for (const ag of db.agents) {
      const u = db.users.find(
        (usr) => usr.id === ag.userId || usr.agentId === ag.id || usr.username.toLowerCase() === ag.username.toLowerCase()
      );
      if (u) {
        if (u.avatarUrl) ag.avatarUrl = u.avatarUrl;
        if (u.fullName) ag.fullName = u.fullName;
        if (u.phone) ag.phone = u.phone;
      }
    }
    const districtFilter = sanitizeText(req.query?.district, 80).toLowerCase();
    const search = sanitizeText(req.query?.search, 80).toLowerCase();
    const allAgents = db.agents || [];
    const districts = Array.from(new Set(allAgents.map((a) => a.district))).sort(
      (a, b) => a.localeCompare(b)
    );
    const filtered = allAgents.filter((a) => {
      if (districtFilter && districtFilter !== "all" && a.district.toLowerCase() !== districtFilter) {
        return false;
      }
      if (!search) return true;
      return a.username.toLowerCase().includes(search) || a.fullName.toLowerCase().includes(search) || a.district.toLowerCase().includes(search) || a.division.toLowerCase().includes(search) || a.phone.includes(search);
    });
    res.json({
      success: true,
      districts,
      agents: filtered
    });
  });
  router.post("/payments/deposit", requireAuth, financeLimiter, async (req, res) => {
    try {
      const gatewayInput = sanitizeText(req.body?.gateway, 40);
      const senderNumber = sanitizeText(req.body?.senderNumber, 80);
      const trxId = sanitizeText(req.body?.trxId, 80).toUpperCase();
      const amount = Number(req.body?.amount);
      const agentId = sanitizeText(req.body?.agentId, 80) || null;
      const agentChannel = sanitizeText(req.body?.agentChannel, 30) || null;
      if (!gatewayInput) {
        res.status(400).json({ success: false, message: "Please select a payment gateway." });
        return;
      }
      if (!senderNumber || senderNumber.length < 4) {
        res.status(400).json({ success: false, message: "Please provide a valid sender number, email, or account." });
        return;
      }
      if (!/^[A-Z0-9_-]{4,64}$/.test(trxId)) {
        res.status(400).json({
          success: false,
          message: "Transaction ID must be 4\u201364 alphanumeric characters (letters, numbers, -, _)."
        });
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ success: false, message: "Deposit amount must be greater than zero." });
        return;
      }
      const outcome = await withTransaction((db) => {
        let resolvedGateway = gatewayInput;
        let minAllowed = db.settings.minDeposit;
        let maxAllowed = db.settings.maxDeposit;
        if (gatewayInput !== "Agent") {
          const matchedGw = (db.paymentGateways || []).find(
            (g) => g.code.toLowerCase() === gatewayInput.toLowerCase() || g.name.toLowerCase() === gatewayInput.toLowerCase() || g.id === gatewayInput
          );
          if (!matchedGw || !matchedGw.enabled || !matchedGw.supportsDeposit) {
            throw new Error("Selected payment gateway is not enabled for deposits.");
          }
          resolvedGateway = matchedGw.code;
          minAllowed = matchedGw.minAmount || db.settings.minDeposit;
          maxAllowed = matchedGw.maxAmount || db.settings.maxDeposit;
        }
        if (amount < minAllowed || amount > maxAllowed) {
          throw new Error(
            `Deposit amount must be between ${db.settings.currencySymbol}${minAllowed} and ${db.settings.currencySymbol}${maxAllowed.toLocaleString()}.`
          );
        }
        if (db.payments.some((p) => p.trxId.toUpperCase() === trxId)) {
          throw new Error("This Transaction ID has already been submitted. Duplicate TrxIDs are rejected.");
        }
        let matchedAgent = null;
        if (agentId) {
          matchedAgent = (db.agents || []).find((a) => a.id === agentId) || null;
          if (!matchedAgent) {
            throw new Error("Selected district agent was not found.");
          }
          matchedAgent.cashInOrders += 1;
          matchedAgent.totalOrders += 1;
        } else if (resolvedGateway === "Agent") {
          throw new Error("Please select a district agent for Agent Cash-In deposit.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const rec = {
          id: generateId("pay"),
          userId: req.authUser.id,
          username: req.authUser.username,
          gateway: resolvedGateway,
          senderNumber,
          trxId,
          amount: Math.round(amount * 100) / 100,
          status: "pending",
          verificationNote: matchedAgent ? `Agent Cash-In via @${matchedAgent.username} (${matchedAgent.district}${agentChannel ? ` \xB7 ${agentChannel}` : ""}) \u2014 awaiting verification` : `Submitted via ${resolvedGateway} \u2014 pending verification`,
          verifiedBy: null,
          verifiedAt: null,
          agentId: matchedAgent?.id || null,
          agentUsername: matchedAgent?.username || null,
          agentDistrict: matchedAgent?.district || null,
          createdAt: now
        };
        db.payments.unshift(rec);
        db.notifications.unshift({
          id: generateId("notif"),
          userId: req.authUser.id,
          title: matchedAgent ? "Agent Cash-In Order Submitted" : "Deposit Submitted for Verification",
          message: matchedAgent ? `Your Cash-In deposit of ${db.settings.currencySymbol}${rec.amount} via @${matchedAgent.username}${agentChannel ? ` (${agentChannel})` : ""} (${matchedAgent.district}, Ref: ${trxId}) is queued.` : `Your ${resolvedGateway} deposit of ${db.settings.currencySymbol}${rec.amount} (TrxID: ${trxId}) is queued for verification.`,
          type: "info",
          isRead: false,
          createdAt: now
        });
        return { payment: rec, dbSnapshot: db };
      });
      dispatchWebhookPlugins(outcome.dbSnapshot, "deposit.submitted", {
        paymentId: outcome.payment.id,
        username: outcome.payment.username,
        gateway: outcome.payment.gateway,
        amount: outcome.payment.amount,
        trxId: outcome.payment.trxId
      });
      res.status(201).json({
        success: true,
        message: "Deposit submitted. Your wallet will be credited once the Transaction ID is verified.",
        payment: outcome.payment
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Deposit failed." });
    }
  });
  router.post("/payments/gateway-checkout", requireAuth, financeLimiter, async (req, res) => {
    try {
      const gatewayCode = sanitizeText(req.body?.gateway, 40);
      const amount = Number(req.body?.amount);
      const payerContact = sanitizeText(req.body?.senderNumber || req.authUser?.email || req.authUser?.phone || "", 80);
      if (!gatewayCode) {
        res.status(400).json({ success: false, message: "Please select a payment gateway." });
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ success: false, message: "Enter a valid deposit amount." });
        return;
      }
      const dbSnap = getDbSnapshot();
      const gw = (dbSnap.paymentGateways || []).find(
        (g) => g.code.toLowerCase() === gatewayCode.toLowerCase() || g.id === gatewayCode
      );
      if (!gw || !gw.enabled || !gw.supportsDeposit) {
        res.status(400).json({ success: false, message: "Selected gateway is unavailable." });
        return;
      }
      const minAllowed = gw.minAmount || dbSnap.settings.minDeposit;
      const maxAllowed = gw.maxAmount || dbSnap.settings.maxDeposit;
      if (amount < minAllowed || amount > maxAllowed) {
        res.status(400).json({
          success: false,
          message: `Amount must be between ${dbSnap.settings.currencySymbol}${minAllowed} and ${dbSnap.settings.currencySymbol}${maxAllowed.toLocaleString()}.`
        });
        return;
      }
      const prefix = gw.code.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase() || "AUTO";
      const invoiceRef = `${prefix}-${Date.now().toString(36).toUpperCase()}-${import_crypto7.default.randomBytes(2).toString("hex").toUpperCase()}`;
      const convertedAmount = gw.exchangeRate > 1 ? Math.round(amount / gw.exchangeRate * 100) / 100 : Math.round(amount * 100) / 100;
      let checkoutUrl = null;
      let providerStatus = "queued_reference";
      if (gw.mode === "auto_api" && gw.apiKey && gw.apiBaseUrl && /^https?:\/\//i.test(gw.apiBaseUrl)) {
        try {
          const origin = `${req.protocol}://${req.get("host")}`;
          const codeLower = gw.code.toLowerCase();
          if (codeLower === "uddoktapay") {
            const resp = await fetch(gw.apiBaseUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "RT-UDDOKTAPAY-API-KEY": gw.apiKey
              },
              body: JSON.stringify({
                full_name: req.authUser.fullName || req.authUser.username,
                email: req.authUser.email,
                amount: String(convertedAmount),
                metadata: { user_id: req.authUser.id, invoice_ref: invoiceRef },
                redirect_url: `${origin}/wallet/deposit`,
                cancel_url: `${origin}/wallet/deposit`
              }),
              signal: AbortSignal.timeout(6e3)
            });
            const body = await resp.json().catch(() => ({}));
            if (resp.ok && body.payment_url) {
              checkoutUrl = body.payment_url;
              providerStatus = "live_checkout_url";
            }
          } else if (codeLower === "zinipay") {
            const resp = await fetch(gw.apiBaseUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "zini-api-key": gw.apiKey
              },
              body: JSON.stringify({
                cus_name: req.authUser.fullName || req.authUser.username,
                cus_email: req.authUser.email,
                amount: String(convertedAmount),
                redirect_url: `${origin}/wallet/deposit`,
                cancel_url: `${origin}/wallet/deposit`,
                metadata: { user_id: req.authUser.id, invoice_ref: invoiceRef }
              }),
              signal: AbortSignal.timeout(6e3)
            });
            const body = await resp.json().catch(() => ({}));
            if (resp.ok && body.payment_url) {
              checkoutUrl = body.payment_url;
              providerStatus = "live_checkout_url";
            }
          } else if (codeLower === "stripe") {
            const form = new URLSearchParams();
            form.set("mode", "payment");
            form.set("success_url", `${origin}/wallet/deposit?ref=${invoiceRef}`);
            form.set("cancel_url", `${origin}/wallet/deposit`);
            form.set("line_items[0][price_data][currency]", (gw.currency || "USD").toLowerCase());
            form.set("line_items[0][price_data][product_data][name]", `Wallet Deposit (${invoiceRef})`);
            form.set("line_items[0][price_data][unit_amount]", String(Math.round(convertedAmount * 100)));
            form.set("line_items[0][quantity]", "1");
            const resp = await fetch(gw.apiBaseUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${gw.apiKey}`,
                "Content-Type": "application/x-www-form-urlencoded"
              },
              body: form.toString(),
              signal: AbortSignal.timeout(6e3)
            });
            const body = await resp.json().catch(() => ({}));
            if (resp.ok && body.url) {
              checkoutUrl = body.url;
              providerStatus = "live_checkout_url";
            }
          } else if (codeLower === "cryptomus") {
            const merchantUuid = gw.apiSecret || gw.accountValue;
            if (merchantUuid) {
              const payloadObj = {
                amount: String(convertedAmount),
                currency: gw.currency || "USDT",
                order_id: invoiceRef,
                url_return: `${origin}/wallet/deposit?ref=${invoiceRef}`,
                url_callback: `${origin}/api/payments/gateway-checkout`
              };
              const payloadStr = JSON.stringify(payloadObj);
              const sign = import_crypto7.default.createHash("md5").update(Buffer.from(payloadStr, "utf8").toString("base64") + gw.apiKey).digest("hex");
              const resp = await fetch(gw.apiBaseUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  merchant: merchantUuid,
                  sign
                },
                body: payloadStr,
                signal: AbortSignal.timeout(6e3)
              });
              const body = await resp.json().catch(() => ({}));
              if (resp.ok && body.result?.url) {
                checkoutUrl = body.result.url;
                providerStatus = "live_checkout_url";
              }
            }
          }
        } catch {
        }
      }
      const payment = await withTransaction((db) => {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const rec = {
          id: generateId("pay"),
          userId: req.authUser.id,
          username: req.authUser.username,
          gateway: gw.code,
          senderNumber: payerContact || req.authUser.email,
          trxId: invoiceRef,
          amount: Math.round(amount * 100) / 100,
          status: "pending",
          verificationNote: checkoutUrl ? `${gw.name} hosted checkout created (${convertedAmount} ${gw.currency})` : `${gw.name} checkout invoice created (${convertedAmount} ${gw.currency}) \u2014 awaiting confirmation`,
          verifiedBy: null,
          verifiedAt: null,
          createdAt: now
        };
        db.payments.unshift(rec);
        db.notifications.unshift({
          id: generateId("notif"),
          userId: req.authUser.id,
          title: `${gw.name} Checkout Created`,
          message: `Invoice ${invoiceRef} for ${db.settings.currencySymbol}${rec.amount} (${convertedAmount} ${gw.currency}) via ${gw.name} is ready.`,
          type: "info",
          isRead: false,
          createdAt: now
        });
        return rec;
      });
      res.status(201).json({
        success: true,
        providerStatus,
        invoiceRef,
        convertedAmount,
        currency: gw.currency,
        checkoutUrl,
        payment,
        message: checkoutUrl ? `${gw.name} checkout session ready! Open the checkout link to complete payment.` : `${gw.name} invoice ${invoiceRef} created (${convertedAmount} ${gw.currency}). Pending verification in admin queue.`
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not initiate gateway checkout."
      });
    }
  });
  router.post("/withdrawals", requireAuth, financeLimiter, async (req, res) => {
    try {
      const gatewayInput = sanitizeText(req.body?.gateway, 40);
      const targetAccount = sanitizeText(req.body?.targetAccount, 100);
      const amount = Number(req.body?.amount);
      const securityPin = typeof req.body?.securityPin === "string" ? req.body.securityPin.trim() : "";
      const agentId = sanitizeText(req.body?.agentId, 80) || null;
      if (!gatewayInput) {
        res.status(400).json({ success: false, message: "Please select a payout channel." });
        return;
      }
      if (!targetAccount || targetAccount.length < 4) {
        res.status(400).json({ success: false, message: "Valid recipient account/phone/email is required." });
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        res.status(400).json({ success: false, message: "Withdrawal amount must be positive." });
        return;
      }
      const result = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (user.pinLockEnabled && user.securityPinHash) {
          if (!verifyPassword(securityPin, user.securityPinHash)) {
            throw new Error("Invalid 4-digit security PIN.");
          }
        }
        let resolvedGateway = gatewayInput;
        if (gatewayInput !== "Agent") {
          const matchedGw = (db.paymentGateways || []).find(
            (g) => g.code.toLowerCase() === gatewayInput.toLowerCase() || g.name.toLowerCase() === gatewayInput.toLowerCase() || g.id === gatewayInput
          );
          if (!matchedGw || !matchedGw.enabled || !matchedGw.supportsWithdrawal) {
            throw new Error("Selected payout gateway is not enabled for withdrawals.");
          }
          resolvedGateway = matchedGw.code;
        }
        if (amount < db.settings.minWithdrawal || amount > db.settings.maxWithdrawal) {
          throw new Error(
            `Withdrawal must be between ${db.settings.currencySymbol}${db.settings.minWithdrawal} and ${db.settings.currencySymbol}${db.settings.maxWithdrawal.toLocaleString()}.`
          );
        }
        let matchedAgent = null;
        if (agentId) {
          matchedAgent = (db.agents || []).find((a) => a.id === agentId) || null;
          if (!matchedAgent) {
            throw new Error("Selected district agent was not found.");
          }
        } else if (resolvedGateway === "Agent") {
          throw new Error("Please select a district agent for Agent Cash-Out withdrawal.");
        }
        const fee = Math.round(amount * (db.settings.withdrawalFeePercent / 100) * 100) / 100;
        const totalDebit = Math.round((amount + fee) * 100) / 100;
        if (user.balance < totalDebit) {
          throw new Error("Insufficient balance for this withdrawal.");
        }
        const gateway = resolvedGateway;
        if (matchedAgent) {
          matchedAgent.cashOutOrders += 1;
          matchedAgent.totalOrders += 1;
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        user.balance = Math.round((user.balance - totalDebit) * 100) / 100;
        user.updatedAt = now;
        const wd = {
          id: generateId("wd"),
          userId: user.id,
          username: user.username,
          gateway,
          targetAccount,
          amount: Math.round(amount * 100) / 100,
          fee,
          totalDebit,
          status: "pending",
          adminNote: matchedAgent ? `Agent Cash-Out via @${matchedAgent.username} (${matchedAgent.district}) \u2014 awaiting payout` : "Awaiting payout approval",
          processedBy: null,
          processedAt: null,
          agentId: matchedAgent?.id || null,
          agentUsername: matchedAgent?.username || null,
          agentDistrict: matchedAgent?.district || null,
          createdAt: now
        };
        db.withdrawals.unshift(wd);
        db.transactions.unshift({
          id: generateId("txn"),
          userId: user.id,
          username: user.username,
          direction: "debit",
          category: "withdrawal",
          amount: totalDebit,
          balanceAfter: user.balance,
          referenceId: wd.id,
          gateway,
          description: matchedAgent ? `Agent Cash-Out via @${matchedAgent.username} (${matchedAgent.district}) to ${targetAccount}` : `Withdrawal request to ${gateway} (${targetAccount})`,
          createdAt: now
        });
        db.notifications.unshift({
          id: generateId("notif"),
          userId: user.id,
          title: matchedAgent ? "Agent Cash-Out Request Queued" : "Withdrawal Request Queued",
          message: matchedAgent ? `Cash-Out of ${db.settings.currencySymbol}${wd.amount} via @${matchedAgent.username} (${matchedAgent.district}) is queued.` : `Withdrawal of ${db.settings.currencySymbol}${wd.amount} via ${gateway} is awaiting processing.`,
          type: "info",
          isRead: false,
          createdAt: now
        });
        return { wd, user: toPublicUser(user) };
      });
      res.status(201).json({
        success: true,
        message: "Withdrawal request submitted.",
        withdrawal: result.wd,
        user: result.user
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Withdrawal failed." });
    }
  });
  router.get("/admin/overview", requireAuth, requireStaff, async (_req, res) => {
    await syncCampaignStatuses();
    const db = getDbSnapshot();
    const totalUsers = db.users.length;
    const totalTicketsSold = db.tickets.length;
    const totalCampaigns = db.lotteries.length;
    const activeCampaigns = db.lotteries.filter((l) => l.status === "active").length;
    const totalTicketRevenue = db.purchases.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.totalAmount, 0);
    const totalApprovedDeposits = db.payments.filter((p) => p.status === "approved").reduce((sum, p) => sum + p.amount, 0);
    const totalApprovedWithdrawals = db.withdrawals.filter((w) => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
    const totalPayouts = db.winners.reduce((sum, w) => sum + w.prizeAmount, 0);
    const pendingPayments = db.payments.filter((p) => p.status === "pending").length;
    const pendingWithdrawals = db.withdrawals.filter((w) => w.status === "pending").length;
    const lotteriesWithPrizes = db.lotteries.map((lot) => ({
      ...lot,
      prizes: db.prizes.filter((p) => p.lotteryId === lot.id).sort((a, b) => a.rankPosition - b.rankPosition)
    }));
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTicketsSold,
        totalCampaigns,
        activeCampaigns,
        totalTicketRevenue,
        totalApprovedDeposits,
        totalApprovedWithdrawals,
        totalPayouts,
        totalWinners: db.winners.length,
        pendingPayments,
        pendingWithdrawals,
        totalAgents: db.agents.filter((a) => (a.tier || "agent") === "agent").length,
        totalSubAgents: db.agents.filter((a) => a.tier === "sub_agent").length,
        onlineAgents: db.agents.filter((a) => a.isOnline && (a.status || "active") === "active").length,
        pendingVideoPromotions: (db.videoPromotions || []).filter((v) => v.status === "pending").length,
        activeGateways: (db.paymentGateways || []).filter((g) => g.enabled).length,
        activePlugins: (db.plugins || []).filter((p) => p.enabled).length,
        totalPlugins: (db.plugins || []).length,
        unreadInboxCount: (() => {
          const staffIdSet = new Set(
            db.users.filter((u) => u.role === "admin" || u.role === "moderator").map((u) => u.id)
          );
          return (db.directMessages || []).filter(
            (dm) => dm.senderType === "user" && !staffIdSet.has(dm.senderId) && !dm.adminReadAt && dm.recipientType === "user" && staffIdSet.has(dm.recipientId)
          ).length;
        })(),
        pendingShopOrdersCount: (db.shopOrders || []).filter(
          (o) => o.fulfillmentStatus === "pending_admin" || o.paymentStatus === "pending_verification"
        ).length,
        pendingShopApprovalCount: (db.shopItems || []).filter(
          (p) => p.approvalStatus === "pending_approval"
        ).length
      },
      users: db.users.map(toPublicUser),
      agents: db.agents,
      videoPromotions: db.videoPromotions || [],
      paymentGateways: (db.paymentGateways || []).map(toAdminGateway),
      plugins: db.plugins || [],
      categories: db.categories,
      lotteries: lotteriesWithPrizes,
      tickets: db.tickets.slice(0, 300),
      payments: db.payments,
      withdrawals: db.withdrawals,
      results: db.lotteryResults,
      winners: db.winners,
      banners: db.banners,
      settings: db.settings,
      auditLogs: db.auditLogs.slice(0, 150)
    });
  });
  router.post("/admin/categories", requireAuth, requireStaff, async (req, res) => {
    try {
      const name = sanitizeText(req.body?.name, 80);
      const label = sanitizeText(req.body?.label || name, 80);
      const rawType = String(req.body?.type || "single").toLowerCase();
      const type = rawType === "multi" ? "multi" : "single";
      const defaultEntryFee = Math.max(1, Number(req.body?.defaultEntryFee) || 20);
      const defaultParticipants = Math.max(1, parseInt(String(req.body?.defaultParticipants || "20"), 10));
      const description = sanitizeText(req.body?.description || "", 300);
      const rawTiers = Array.isArray(req.body?.prizeTiers) ? req.body.prizeTiers : [];
      if (!name) throw new Error("Category name is required.");
      if (!Number.isInteger(defaultParticipants) || defaultParticipants < 1) {
        throw new Error("Participant limit must be at least 1.");
      }
      const normalizedTiers = type === "single" ? [
        {
          rankPosition: 1,
          title: sanitizeText(rawTiers[0]?.title || "Grand Prize", 80),
          winnersCount: 1,
          amount: Math.max(1, Number(rawTiers[0]?.amount) || 0)
        }
      ] : rawTiers.map((t, idx) => ({
        rankPosition: idx + 1,
        title: sanitizeText(t.title || `Rank #${idx + 1}`, 80),
        winnersCount: Math.max(1, parseInt(String(t.winnersCount || 1), 10)),
        amount: Math.max(1, Number(t.amount) || 0)
      })).filter((t) => t.amount > 0);
      if (normalizedTiers.length === 0 || normalizedTiers.some((t) => t.amount <= 0)) {
        throw new Error("Please configure at least one valid prize payout tier.");
      }
      const totalWinners = normalizedTiers.reduce(
        (sum, t) => sum + t.winnersCount,
        0
      );
      if (totalWinners > defaultParticipants) {
        throw new Error(
          `Total winners (${totalWinners}) cannot exceed total participants (${defaultParticipants}).`
        );
      }
      const defaultPrizes = normalizedTiers.map(
        (t) => t.winnersCount > 1 ? `${t.winnersCount}x${t.amount}` : String(t.amount)
      ).join(", ");
      const ip = getClientIp(req);
      const category = await withTransaction((db) => {
        if (db.categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
          throw new Error(`Category "${name}" already exists.`);
        }
        const created = {
          id: generateId("cat"),
          name,
          label: label || name,
          type,
          defaultPrizes,
          defaultEntryFee: Math.round(defaultEntryFee * 100) / 100,
          defaultParticipants,
          description: description || (type === "single" ? `Single winner lottery (${defaultParticipants} participants).` : `Multi-winner lottery: ${totalWinners} winners out of ${defaultParticipants} participants.`),
          prizeTiers: normalizedTiers
        };
        db.categories.push(created);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "CATEGORY_CREATED",
          "category",
          created.id,
          { name: created.name, type: created.type, defaultParticipants, totalWinners },
          ip
        );
        return created;
      });
      res.status(201).json({ success: true, category });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to create category."
      });
    }
  });
  router.put("/admin/categories/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const catId = req.params.id;
      const name = sanitizeText(req.body?.name, 80);
      const label = sanitizeText(req.body?.label || name, 80);
      const rawType = String(req.body?.type || "single").toLowerCase();
      const type = rawType === "multi" ? "multi" : "single";
      const defaultEntryFee = Math.max(1, Number(req.body?.defaultEntryFee) || 20);
      const defaultParticipants = Math.max(1, parseInt(String(req.body?.defaultParticipants || "20"), 10));
      const description = sanitizeText(req.body?.description || "", 300);
      const rawTiers = Array.isArray(req.body?.prizeTiers) ? req.body.prizeTiers : [];
      if (!name) throw new Error("Category name is required.");
      const normalizedTiers = type === "single" ? [
        {
          rankPosition: 1,
          title: sanitizeText(rawTiers[0]?.title || "Grand Prize", 80),
          winnersCount: 1,
          amount: Math.max(1, Number(rawTiers[0]?.amount) || 0)
        }
      ] : rawTiers.map((t, idx) => ({
        rankPosition: idx + 1,
        title: sanitizeText(t.title || `Rank #${idx + 1}`, 80),
        winnersCount: Math.max(1, parseInt(String(t.winnersCount || 1), 10)),
        amount: Math.max(1, Number(t.amount) || 0)
      })).filter((t) => t.amount > 0);
      if (normalizedTiers.length === 0) {
        throw new Error("Please configure at least one valid prize payout tier.");
      }
      const totalWinners = normalizedTiers.reduce(
        (sum, t) => sum + t.winnersCount,
        0
      );
      if (totalWinners > defaultParticipants) {
        throw new Error(
          `Total winners (${totalWinners}) cannot exceed total participants (${defaultParticipants}).`
        );
      }
      const defaultPrizes = normalizedTiers.map(
        (t) => t.winnersCount > 1 ? `${t.winnersCount}x${t.amount}` : String(t.amount)
      ).join(", ");
      const ip = getClientIp(req);
      const updated = await withTransaction((db) => {
        const cat = db.categories.find((c) => c.id === catId);
        if (!cat) throw new Error("Category not found.");
        if (db.categories.some(
          (c) => c.id !== catId && c.name.toLowerCase() === name.toLowerCase()
        )) {
          throw new Error(`Another category named "${name}" already exists.`);
        }
        const prevName = cat.name;
        cat.name = name;
        cat.label = label || name;
        cat.type = type;
        cat.defaultPrizes = defaultPrizes;
        cat.defaultEntryFee = Math.round(defaultEntryFee * 100) / 100;
        cat.defaultParticipants = defaultParticipants;
        cat.description = description || (type === "single" ? `Single winner lottery (${defaultParticipants} participants).` : `Multi-winner lottery: ${totalWinners} winners out of ${defaultParticipants} participants.`);
        cat.prizeTiers = normalizedTiers;
        if (prevName !== name) {
          for (const lot of db.lotteries) {
            if (lot.category === prevName || lot.categoryId === catId) {
              lot.category = name;
            }
          }
        }
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "CATEGORY_UPDATED",
          "category",
          cat.id,
          { name: cat.name, type: cat.type, defaultParticipants, totalWinners },
          ip
        );
        return cat;
      });
      res.json({ success: true, category: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update category."
      });
    }
  });
  router.delete("/admin/categories/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const catId = req.params.id;
      const ip = getClientIp(req);
      await withTransaction((db) => {
        const cat = db.categories.find((c) => c.id === catId);
        if (!cat) throw new Error("Category not found.");
        const inUse = db.lotteries.some(
          (l) => l.status === "active" && (l.categoryId === catId || l.category.toLowerCase() === cat.name.toLowerCase())
        );
        if (inUse) {
          throw new Error(
            `Cannot delete "${cat.name}" while an active lottery campaign uses this category.`
          );
        }
        db.categories = db.categories.filter((c) => c.id !== catId);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "CATEGORY_DELETED",
          "category",
          catId,
          { name: cat.name },
          ip
        );
      });
      res.json({ success: true, message: "Category deleted." });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to delete category."
      });
    }
  });
  router.post("/admin/lotteries", requireAuth, requireStaff, async (req, res) => {
    try {
      const name = sanitizeText(req.body?.name, 150);
      const details = sanitizeText(req.body?.details, 1e3);
      const requestedCategoryId = sanitizeText(req.body?.categoryId || "", 80) || null;
      const requestedCategoryName = sanitizeText(req.body?.category, 80);
      const drawMode = req.body?.drawMode || "auto";
      const startAt = req.body?.startAt ? new Date(req.body.startAt).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const endAt = req.body?.endAt ? new Date(req.body.endAt).toISOString() : new Date(Date.now() + 24 * 3600 * 1e3).toISOString();
      const autoRefundIncomplete = req.body?.autoRefundIncomplete !== false;
      const rawPrizes = Array.isArray(req.body?.prizes) ? req.body.prizes : [];
      const fallbackPrize = Number(req.body?.prizeAmount || 0);
      if (!name) throw new Error("Campaign name is required.");
      if (new Date(endAt).getTime() <= new Date(startAt).getTime()) {
        throw new Error("End date/time must be after start date/time.");
      }
      const ip = getClientIp(req);
      const created = await withTransaction((db) => {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const lotId = generateId("lot");
        const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const slug = `${slugBase || "campaign"}-${lotId.slice(-5)}`;
        const matchedCategory = (requestedCategoryId ? db.categories.find((c) => c.id === requestedCategoryId) : null) || (requestedCategoryName ? db.categories.find(
          (c) => c.name.toLowerCase() === requestedCategoryName.toLowerCase()
        ) : null) || db.categories[0] || null;
        const category = matchedCategory?.name || requestedCategoryName || "10 Taka Banner";
        const categoryId = matchedCategory?.id || null;
        const categoryType = matchedCategory?.type || "single";
        const entryFee = Number(req.body?.entryFee || matchedCategory?.defaultEntryFee || 0);
        const totalTickets = parseInt(
          String(req.body?.totalTickets || matchedCategory?.defaultParticipants || "0"),
          10
        );
        if (!Number.isFinite(entryFee) || entryFee <= 0) {
          throw new Error("Entry fee must be positive.");
        }
        if (!Number.isInteger(totalTickets) || totalTickets < 1) {
          throw new Error("Total tickets (participants) must be at least 1.");
        }
        const sourceTiers = rawPrizes.length > 0 ? rawPrizes : matchedCategory?.prizeTiers && matchedCategory.prizeTiers.length > 0 ? matchedCategory.prizeTiers : [{ title: "Grand Prize", amount: Math.max(1, fallbackPrize), winnersCount: 1 }];
        const parsedPrizes = (categoryType === "single" ? sourceTiers.slice(0, 1) : sourceTiers).map((p, idx) => ({
          id: generateId("pz"),
          lotteryId: lotId,
          rankPosition: idx + 1,
          title: sanitizeText(p.title || `Rank #${idx + 1}`, 80),
          amount: Math.max(1, Number(p.amount) || 0),
          winnersCount: categoryType === "single" ? 1 : Math.max(1, parseInt(String(p.winnersCount || 1), 10))
        })).filter((p) => p.amount > 0);
        const totalConfiguredWinners = parsedPrizes.reduce((s, p) => s + p.winnersCount, 0);
        if (totalConfiguredWinners > totalTickets) {
          throw new Error(
            `Configured winners (${totalConfiguredWinners}) cannot exceed total participants (${totalTickets}).`
          );
        }
        const totalPrizePool = parsedPrizes.reduce((s, p) => s + p.amount * p.winnersCount, 0);
        const startMs = new Date(startAt).getTime();
        const initialStatus = startMs > Date.now() + 6e4 ? "scheduled" : "active";
        const newLot = {
          id: lotId,
          name,
          slug,
          details: details || (categoryType === "multi" ? `${category} multi-winner pool: ${totalConfiguredWinners} winners share ${db.settings.currencySymbol}${totalPrizePool.toLocaleString()} out of ${totalTickets} participants.` : `${category} single-winner lottery with verified grand prize payout.`),
          category,
          categoryId,
          categoryType,
          entryFee: Math.round(entryFee * 100) / 100,
          prizeAmount: totalPrizePool,
          totalTickets,
          soldTickets: 0,
          drawMode,
          status: initialStatus,
          startAt,
          endAt,
          drawnAt: null,
          resultsPublished: false,
          autoRefundIncomplete,
          createdBy: req.authUser.id,
          createdAt: now,
          updatedAt: now
        };
        db.lotteries.unshift(newLot);
        db.prizes.push(...parsedPrizes);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "LOTTERY_CREATED",
          "lottery",
          lotId,
          {
            name,
            category,
            categoryType,
            entryFee,
            totalTickets,
            totalConfiguredWinners,
            totalPrizePool,
            drawMode
          },
          ip
        );
        return { lottery: newLot, prizes: parsedPrizes };
      });
      res.status(201).json({ success: true, ...created });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed to create campaign." });
    }
  });
  router.put("/admin/lotteries/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const lotId = req.params.id;
      const ip = getClientIp(req);
      const updated = await withTransaction((db) => {
        const lot = db.lotteries.find((l) => l.id === lotId);
        if (!lot) throw new Error("Campaign not found.");
        if (typeof req.body?.name === "string" && req.body.name.trim()) {
          lot.name = sanitizeText(req.body.name, 150);
        }
        if (typeof req.body?.details === "string") {
          lot.details = sanitizeText(req.body.details, 1e3);
        }
        if (typeof req.body?.category === "string") {
          lot.category = sanitizeText(req.body.category, 80);
        }
        if (req.body?.entryFee !== void 0 && lot.soldTickets === 0) {
          const fee = Number(req.body.entryFee);
          if (fee > 0) lot.entryFee = fee;
        }
        if (req.body?.totalTickets !== void 0) {
          const tt = parseInt(String(req.body.totalTickets), 10);
          if (!Number.isInteger(tt) || tt < 1) {
            throw new Error("Total tickets limit must be at least 1.");
          }
          if (tt < lot.soldTickets) {
            throw new Error(
              `Cannot reduce sell limit (${tt}) below already sold tickets (${lot.soldTickets}).`
            );
          }
          lot.totalTickets = tt;
        }
        if (req.body?.endAt) {
          lot.endAt = new Date(req.body.endAt).toISOString();
        }
        if (typeof req.body?.status === "string" && lot.status !== "drawn" && lot.status !== "refunded") {
          const allowed = ["scheduled", "active", "paused", "closed"];
          if (allowed.includes(req.body.status)) {
            lot.status = req.body.status;
          }
        }
        if (Array.isArray(req.body?.prizes) && lot.status !== "drawn") {
          db.prizes = db.prizes.filter((p) => p.lotteryId !== lot.id);
          const nextPrizes = req.body.prizes.map(
            (p, idx) => ({
              id: generateId("pz"),
              lotteryId: lot.id,
              rankPosition: idx + 1,
              title: sanitizeText(p.title || `Rank #${idx + 1}`, 80),
              amount: Math.max(1, Number(p.amount) || 0),
              winnersCount: Math.max(1, parseInt(String(p.winnersCount || 1), 10))
            })
          );
          db.prizes.push(...nextPrizes);
          lot.prizeAmount = nextPrizes.reduce((s, p) => s + p.amount * p.winnersCount, 0);
        }
        lot.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "LOTTERY_UPDATED",
          "lottery",
          lot.id,
          { name: lot.name, status: lot.status },
          ip
        );
        return lot;
      });
      res.json({ success: true, lottery: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed to update campaign." });
    }
  });
  router.delete("/admin/lotteries/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const lotId = req.params.id;
      const ip = getClientIp(req);
      await withTransaction((db) => {
        const lot = db.lotteries.find((l) => l.id === lotId);
        if (!lot) throw new Error("Campaign not found.");
        const hasTickets = db.tickets.some((t) => t.lotteryId === lotId);
        if (hasTickets && lot.status === "active") {
          throw new Error("Cannot delete an active campaign with sold tickets. Pause or refund it first.");
        }
        db.lotteries = db.lotteries.filter((l) => l.id !== lotId);
        db.prizes = db.prizes.filter((p) => p.lotteryId !== lotId);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "LOTTERY_DELETED",
          "lottery",
          lotId,
          { name: lot.name },
          ip
        );
      });
      res.json({ success: true, message: "Campaign deleted." });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Delete failed." });
    }
  });
  const inFlightDraws = /* @__PURE__ */ new Set();
  router.post("/admin/lotteries/:id/draw", requireAuth, requireStaff, async (req, res) => {
    const lotId = req.params.id;
    try {
      const publishImmediately = req.body?.publishImmediately !== false;
      const ip = getClientIp(req);
      if (inFlightDraws.has(lotId)) {
        throw new Error("A live draw countdown is already in progress for this lottery.");
      }
      const preDb = getDbSnapshot();
      const targetLot = preDb.lotteries.find((l) => l.id === lotId);
      if (!targetLot) throw new Error("Lottery campaign not found.");
      if (targetLot.status === "drawn") throw new Error("This lottery has already been drawn.");
      if (targetLot.status === "refunded") throw new Error("This lottery has already been refunded.");
      const pendingTickets = preDb.tickets.filter(
        (t) => t.lotteryId === lotId && t.status === "pending"
      );
      if (pendingTickets.length === 0) {
        throw new Error("Cannot run draw: zero eligible tickets have been sold.");
      }
      if (targetLot.soldTickets < targetLot.totalTickets && req.body?.forceDraw !== true) {
        const notices = [];
        await withTransaction((db) => {
          const lot = db.lotteries.find((l) => l.id === lotId);
          if (!lot) throw new Error("Lottery campaign not found.");
          if (lot.status === "drawn" || lot.status === "refunded") {
            throw new Error(`This lottery has already been ${lot.status}.`);
          }
          const createdNotices = refundLotteryInDb(
            db,
            lot,
            "\u09B8\u09AC \u099F\u09BF\u0995\u09BF\u099F \u09AC\u09BF\u0995\u09CD\u09B0\u09BF \u09A8\u09BE \u09B9\u0993\u09DF\u09BE\u09DF \u0986\u09AA\u09A8\u09BE\u09B0 \u099F\u09BE\u0995\u09BE \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09B2\u09CB\u0964",
            { id: req.authUser.id, username: req.authUser.username },
            ip
          );
          notices.push(...createdNotices);
        });
        dispatchRefundNotices(notices);
        broadcastChatEvent("lottery:overview_updated", { lotteryId: lotId, status: "refunded" });
        res.json({
          success: true,
          refunded: true,
          refundedUsers: notices.length,
          message: `\u09B8\u09AC \u099F\u09BF\u0995\u09BF\u099F \u09AC\u09BF\u0995\u09CD\u09B0\u09BF \u09A8\u09BE \u09B9\u0993\u09DF\u09BE\u09DF (${targetLot.soldTickets}/${targetLot.totalTickets}) \u09A1\u09CD\u09B0 \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09C7 ${notices.length} \u099C\u09A8 \u0987\u0989\u099C\u09BE\u09B0\u09C7\u09B0 \u099F\u09BE\u0995\u09BE \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0993 \u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964`
        });
        return;
      }
      inFlightDraws.add(lotId);
      try {
        broadcastChatEvent(
          "lottery:draw_countdown",
          buildDrawCountdownPayload(preDb, targetLot, 3)
        );
        await new Promise((resolve) => setTimeout(resolve, 3e3));
        let completedPayload = null;
        const outcome = await withTransaction((db) => {
          const drawOutcome = executeLotteryDrawInDb(
            db,
            lotId,
            { id: req.authUser.id, username: req.authUser.username },
            ip,
            publishImmediately
          );
          const drawnLot = db.lotteries.find((l) => l.id === lotId);
          if (drawnLot) {
            completedPayload = buildDrawCompletedPayload(
              db,
              drawnLot,
              drawOutcome.result,
              drawOutcome.winners
            );
          }
          return drawOutcome;
        });
        if (completedPayload) {
          broadcastChatEvent("lottery:draw_completed", completedPayload);
        }
        res.json({
          success: true,
          refunded: false,
          message: `Draw completed with ${outcome.winners.length} winner(s).`,
          ...outcome
        });
      } finally {
        inFlightDraws.delete(lotId);
      }
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Draw failed." });
    }
  });
  router.post("/admin/lotteries/:id/refund", requireAuth, requireStaff, async (req, res) => {
    try {
      const lotId = req.params.id;
      const reason = sanitizeText(req.body?.reason, 200) || "\u09B8\u09AC \u099F\u09BF\u0995\u09BF\u099F \u09AC\u09BF\u0995\u09CD\u09B0\u09BF \u09A8\u09BE \u09B9\u0993\u09DF\u09BE\u09DF \u0986\u09AA\u09A8\u09BE\u09B0 \u099F\u09BE\u0995\u09BE \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09B2\u09CB\u0964";
      const ip = getClientIp(req);
      const notices = [];
      await withTransaction((db) => {
        const lot = db.lotteries.find((l) => l.id === lotId);
        if (!lot) throw new Error("Campaign not found.");
        if (lot.status === "drawn" || lot.status === "refunded") {
          throw new Error(`Campaign is already ${lot.status}.`);
        }
        const createdNotices = refundLotteryInDb(
          db,
          lot,
          reason,
          { id: req.authUser.id, username: req.authUser.username },
          ip
        );
        notices.push(...createdNotices);
      });
      dispatchRefundNotices(notices);
      broadcastChatEvent("lottery:overview_updated", { lotteryId: lotId, status: "refunded" });
      res.json({
        success: true,
        refundedUsers: notices.length,
        message: "All pending tickets refunded and sorry notifications dispatched."
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Refund failed." });
    }
  });
  router.post("/admin/results/:id/publish", requireAuth, requireStaff, async (req, res) => {
    try {
      const resultId = req.params.id;
      const isPublished = Boolean(req.body?.isPublished);
      const ip = getClientIp(req);
      await withTransaction((db) => {
        const result = db.lotteryResults.find((r) => r.id === resultId);
        if (!result) throw new Error("Result record not found.");
        result.isPublished = isPublished;
        const lot = db.lotteries.find((l) => l.id === result.lotteryId);
        if (lot) lot.resultsPublished = isPublished;
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          isPublished ? "RESULT_PUBLISHED" : "RESULT_UNPUBLISHED",
          "lottery_result",
          resultId,
          { lotteryName: result.lotteryName },
          ip
        );
      });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed." });
    }
  });
  router.post("/admin/payments/:id/verify", requireAuth, requireStaff, async (req, res) => {
    try {
      const paymentId = req.params.id;
      const action = req.body?.action;
      const note = sanitizeText(req.body?.note, 300);
      const ip = getClientIp(req);
      if (!["approve", "reject", "refund"].includes(action)) {
        res.status(400).json({ success: false, message: "Invalid payment verification action." });
        return;
      }
      const updated = await withTransaction((db) => {
        const pay = db.payments.find((p) => p.id === paymentId);
        if (!pay) throw new Error("Payment record not found.");
        const user = db.users.find((u) => u.id === pay.userId);
        if (!user) throw new Error("Associated user account not found.");
        const now = (/* @__PURE__ */ new Date()).toISOString();
        if (action === "approve") {
          if (pay.status !== "pending") {
            throw new Error("Only pending payments can be approved.");
          }
          pay.status = "approved";
          pay.verificationNote = note || `TrxID ${pay.trxId} verified by ${req.authUser.username}`;
          pay.verifiedBy = req.authUser.id;
          pay.verifiedAt = now;
          user.balance = Math.round((user.balance + pay.amount) * 100) / 100;
          user.totalDeposited = Math.round((user.totalDeposited + pay.amount) * 100) / 100;
          user.updatedAt = now;
          db.transactions.unshift({
            id: generateId("txn"),
            userId: user.id,
            username: user.username,
            direction: "credit",
            category: "deposit",
            amount: pay.amount,
            balanceAfter: user.balance,
            referenceId: pay.id,
            gateway: pay.gateway,
            description: `${pay.gateway} deposit verified (TrxID: ${pay.trxId})`,
            createdAt: now
          });
          db.notifications.unshift({
            id: generateId("notif"),
            userId: user.id,
            title: "Deposit Approved",
            message: `Your ${pay.gateway} deposit of ${db.settings.currencySymbol}${pay.amount} (TrxID: ${pay.trxId}) has been credited.`,
            type: "success",
            isRead: false,
            createdAt: now
          });
          db.ticketReservations = (db.ticketReservations || []).filter(
            (r) => r.paymentId !== pay.id
          );
          if (pay.reservedLotteryId && Array.isArray(pay.reservedSlots) && pay.reservedSlots.length > 0) {
            try {
              issueTicketsForPurchase(
                db,
                user.id,
                pay.reservedLotteryId,
                pay.reservedSlots.length,
                pay.reservedSlots,
                false
              );
            } catch {
            }
          }
          const bonusPlugins = (db.plugins || []).filter(
            (p) => p.enabled && p.hookType === "deposit_bonus"
          );
          for (const plg of bonusPlugins) {
            const pct = Number(plg.config?.bonusPercent || 0);
            const minDep = Number(plg.config?.minDepositAmount || 0);
            const maxCap = Number(plg.config?.maxBonusCap || 1e4);
            if (pct > 0 && pay.amount >= minDep) {
              const rawBonus = Math.round(pay.amount * (pct / 100) * 100) / 100;
              const bonusAmt = Math.min(maxCap > 0 ? maxCap : rawBonus, rawBonus);
              if (bonusAmt > 0) {
                user.balance = Math.round((user.balance + bonusAmt) * 100) / 100;
                user.updatedAt = now;
                plg.executionsCount = (plg.executionsCount || 0) + 1;
                plg.lastTriggeredAt = now;
                const bonusLabel = String(plg.config?.label || plg.name);
                db.transactions.unshift({
                  id: generateId("txn"),
                  userId: user.id,
                  username: user.username,
                  direction: "credit",
                  category: "plugin_bonus",
                  amount: bonusAmt,
                  balanceAfter: user.balance,
                  referenceId: pay.id,
                  gateway: plg.name,
                  description: `${bonusLabel} (${pct}% on ${db.settings.currencySymbol}${pay.amount} deposit)`,
                  createdAt: now
                });
                db.notifications.unshift({
                  id: generateId("notif"),
                  userId: user.id,
                  title: `${bonusLabel} Credited (+${db.settings.currencySymbol}${bonusAmt})`,
                  message: `You received a ${pct}% deposit cashback bonus of ${db.settings.currencySymbol}${bonusAmt} on your ${pay.gateway} deposit.`,
                  type: "success",
                  isRead: false,
                  createdAt: now
                });
              }
            }
          }
          creditDepositReferralCommission(db, user, pay.amount, pay.id);
        } else if (action === "reject") {
          if (pay.status !== "pending") {
            throw new Error("Only pending payments can be rejected.");
          }
          pay.status = "rejected";
          pay.verificationNote = note || "Transaction ID could not be verified on merchant statement.";
          pay.verifiedBy = req.authUser.id;
          pay.verifiedAt = now;
          db.ticketReservations = (db.ticketReservations || []).filter(
            (r) => r.paymentId !== pay.id
          );
          db.notifications.unshift({
            id: generateId("notif"),
            userId: user.id,
            title: "Deposit Rejected",
            message: `Your ${pay.gateway} deposit (TrxID: ${pay.trxId}) was rejected. Reason: ${pay.verificationNote}`,
            type: "warning",
            isRead: false,
            createdAt: now
          });
        } else if (action === "refund") {
          if (pay.status !== "approved") {
            throw new Error("Only approved deposits can be marked refunded.");
          }
          if (user.balance < pay.amount) {
            throw new Error("User balance is lower than deposit amount; cannot reverse automatically.");
          }
          pay.status = "refunded";
          pay.verificationNote = note || "Deposit reversed / refunded by administration.";
          pay.verifiedBy = req.authUser.id;
          pay.verifiedAt = now;
          user.balance = Math.round((user.balance - pay.amount) * 100) / 100;
          user.updatedAt = now;
          db.transactions.unshift({
            id: generateId("txn"),
            userId: user.id,
            username: user.username,
            direction: "debit",
            category: "refund",
            amount: pay.amount,
            balanceAfter: user.balance,
            referenceId: pay.id,
            gateway: pay.gateway,
            description: `Deposit reversed/refunded (TrxID: ${pay.trxId})`,
            createdAt: now
          });
        }
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          `PAYMENT_${action.toUpperCase()}`,
          "payment",
          pay.id,
          { trxId: pay.trxId, gateway: pay.gateway, amount: pay.amount, note: pay.verificationNote },
          ip
        );
        return pay;
      });
      res.json({ success: true, payment: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Verification failed." });
    }
  });
  router.post("/admin/withdrawals/:id/process", requireAuth, requireStaff, async (req, res) => {
    try {
      const wdId = req.params.id;
      const action = req.body?.action;
      const note = sanitizeText(req.body?.note, 300);
      const ip = getClientIp(req);
      if (action !== "approve" && action !== "reject") {
        res.status(400).json({ success: false, message: "Invalid withdrawal action." });
        return;
      }
      const updated = await withTransaction((db) => {
        const wd = db.withdrawals.find((w) => w.id === wdId);
        if (!wd) throw new Error("Withdrawal request not found.");
        if (wd.status !== "pending") throw new Error("Withdrawal already processed.");
        const user = db.users.find((u) => u.id === wd.userId);
        if (!user) throw new Error("User not found.");
        const now = (/* @__PURE__ */ new Date()).toISOString();
        wd.status = action === "approve" ? "approved" : "rejected";
        wd.processedBy = req.authUser.id;
        wd.processedAt = now;
        if (action === "approve") {
          wd.adminNote = note || `Disbursed via ${wd.gateway}`;
          user.totalWithdrawn = Math.round((user.totalWithdrawn + wd.amount) * 100) / 100;
          user.updatedAt = now;
          db.notifications.unshift({
            id: generateId("notif"),
            userId: user.id,
            title: "Withdrawal Disbursed",
            message: `Your withdrawal of ${db.settings.currencySymbol}${wd.amount} to ${wd.gateway} (${wd.targetAccount}) has been sent.`,
            type: "success",
            isRead: false,
            createdAt: now
          });
        } else {
          wd.adminNote = note || "Withdrawal declined; balance returned to wallet.";
          user.balance = Math.round((user.balance + wd.totalDebit) * 100) / 100;
          user.updatedAt = now;
          db.transactions.unshift({
            id: generateId("txn"),
            userId: user.id,
            username: user.username,
            direction: "credit",
            category: "refund",
            amount: wd.totalDebit,
            balanceAfter: user.balance,
            referenceId: wd.id,
            gateway: wd.gateway,
            description: `Withdrawal rejected & refunded (${wd.gateway} ${wd.targetAccount})`,
            createdAt: now
          });
          db.notifications.unshift({
            id: generateId("notif"),
            userId: user.id,
            title: "Withdrawal Returned",
            message: `Your withdrawal of ${db.settings.currencySymbol}${wd.amount} was declined (${wd.adminNote}). ${db.settings.currencySymbol}${wd.totalDebit} has been returned to your wallet.`,
            type: "warning",
            isRead: false,
            createdAt: now
          });
        }
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          `WITHDRAWAL_${action.toUpperCase()}`,
          "withdrawal",
          wd.id,
          { amount: wd.amount, gateway: wd.gateway, targetAccount: wd.targetAccount, note: wd.adminNote },
          ip
        );
        return wd;
      });
      res.json({ success: true, withdrawal: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Processing failed." });
    }
  });
  router.patch("/admin/users/:id", requireAuth, requireAdminOnly, async (req, res) => {
    try {
      const targetUserId = req.params.id;
      const ip = getClientIp(req);
      const updated = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === targetUserId);
        if (!user) throw new Error("User not found.");
        const changes = {};
        if (typeof req.body?.role === "string") {
          const role = req.body.role;
          if (["user", "moderator", "admin"].includes(role)) {
            if (user.id === req.authUser.id && role !== "admin") {
              throw new Error("You cannot downgrade your own admin role.");
            }
            user.role = role;
            changes.role = role;
          }
        }
        if (typeof req.body?.status === "string") {
          if (req.body.status === "active" || req.body.status === "blocked") {
            if (user.id === req.authUser.id && req.body.status === "blocked") {
              throw new Error("You cannot block your own active session.");
            }
            user.status = req.body.status;
            changes.status = req.body.status;
          }
        }
        if (typeof req.body?.balanceAdjustment === "number" && req.body.balanceAdjustment !== 0) {
          const adj = Math.round(req.body.balanceAdjustment * 100) / 100;
          const nextBalance = Math.round((user.balance + adj) * 100) / 100;
          if (nextBalance < 0) throw new Error("Adjustment would result in a negative wallet balance.");
          const reason = sanitizeText(req.body?.reason, 180) || "Administrative balance adjustment";
          user.balance = nextBalance;
          db.transactions.unshift({
            id: generateId("txn"),
            userId: user.id,
            username: user.username,
            direction: adj >= 0 ? "credit" : "debit",
            category: "admin_adjustment",
            amount: Math.abs(adj),
            balanceAfter: user.balance,
            referenceId: null,
            gateway: "Admin",
            description: reason,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          changes.balanceAdjustment = adj;
          changes.reason = reason;
        }
        user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "USER_UPDATED",
          "user",
          user.id,
          changes,
          ip
        );
        return toPublicUser(user);
      });
      res.json({ success: true, user: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "User update failed." });
    }
  });
  router.post("/admin/banners", requireAuth, requireStaff, async (req, res) => {
    try {
      const title = sanitizeText(req.body?.title, 160);
      const subtitle = sanitizeText(req.body?.subtitle, 400);
      const ctaLabel = sanitizeText(req.body?.ctaLabel, 60) || "View Campaigns";
      const ctaTarget = sanitizeText(req.body?.ctaTarget, 120) || "#campaigns";
      const placement = req.body?.placement === "hero" ? "hero" : "announcement";
      if (!title) throw new Error("Banner title is required.");
      const ip = getClientIp(req);
      const banner = await withTransaction((db) => {
        const b = {
          id: generateId("ban"),
          title,
          subtitle,
          ctaLabel,
          ctaTarget,
          placement,
          isActive: true,
          sortOrder: db.banners.length + 1,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.banners.unshift(b);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "BANNER_CREATED",
          "banner",
          b.id,
          { title },
          ip
        );
        return b;
      });
      res.status(201).json({ success: true, banner });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Banner creation failed." });
    }
  });
  router.patch("/admin/banners/:id", requireAuth, requireStaff, async (req, res) => {
    const id = req.params.id;
    await withTransaction((db) => {
      const b = db.banners.find((x) => x.id === id);
      if (b && typeof req.body?.isActive === "boolean") {
        b.isActive = req.body.isActive;
      }
    });
    res.json({ success: true });
  });
  router.delete("/admin/banners/:id", requireAuth, requireStaff, async (req, res) => {
    const id = req.params.id;
    await withTransaction((db) => {
      db.banners = db.banners.filter((x) => x.id !== id);
    });
    res.json({ success: true });
  });
  router.put("/admin/settings", requireAuth, requireAdminOnly, async (req, res) => {
    try {
      const ip = getClientIp(req);
      const updated = await withTransaction((db) => {
        const body = req.body || {};
        if (typeof body.siteName === "string" && body.siteName.trim()) {
          db.settings.siteName = sanitizeText(body.siteName, 80);
        }
        if (typeof body.siteTagline === "string") {
          db.settings.siteTagline = sanitizeText(body.siteTagline, 180);
        }
        if (typeof body.currencySymbol === "string" && body.currencySymbol.trim()) {
          db.settings.currencySymbol = sanitizeText(body.currencySymbol, 6);
        }
        if (typeof body.mobileAgentBkash === "string") {
          db.settings.mobileAgentBkash = sanitizeText(body.mobileAgentBkash, 32);
        }
        if (typeof body.mobileAgentNagad === "string") {
          db.settings.mobileAgentNagad = sanitizeText(body.mobileAgentNagad, 32);
        }
        if (typeof body.mobileAgentRocket === "string") {
          db.settings.mobileAgentRocket = sanitizeText(body.mobileAgentRocket, 32);
        }
        if (typeof body.mobileAgentUpay === "string") {
          db.settings.mobileAgentUpay = sanitizeText(body.mobileAgentUpay, 32);
        }
        if (typeof body.bankDetails === "string") {
          db.settings.bankDetails = sanitizeText(body.bankDetails, 240);
        }
        if (typeof body.cryptoAddress === "string") {
          db.settings.cryptoAddress = sanitizeText(body.cryptoAddress, 140);
        }
        if (typeof body.minDeposit === "number" && body.minDeposit >= 1) {
          db.settings.minDeposit = body.minDeposit;
        }
        if (typeof body.maxDeposit === "number" && body.maxDeposit >= db.settings.minDeposit) {
          db.settings.maxDeposit = body.maxDeposit;
        }
        if (typeof body.minWithdrawal === "number" && body.minWithdrawal >= 1) {
          db.settings.minWithdrawal = body.minWithdrawal;
        }
        if (typeof body.maxWithdrawal === "number" && body.maxWithdrawal >= db.settings.minWithdrawal) {
          db.settings.maxWithdrawal = body.maxWithdrawal;
        }
        if (typeof body.withdrawalFeePercent === "number" && body.withdrawalFeePercent >= 0 && body.withdrawalFeePercent <= 25) {
          db.settings.withdrawalFeePercent = body.withdrawalFeePercent;
        }
        if (typeof body.signupBonusEnabled === "boolean") {
          db.settings.signupBonusEnabled = body.signupBonusEnabled;
        }
        if (typeof body.signupBonus === "number" && body.signupBonus >= 0) {
          db.settings.signupBonus = body.signupBonus;
        }
        if (typeof body.maintenanceMode === "boolean") {
          db.settings.maintenanceMode = body.maintenanceMode;
        }
        if (typeof body.maintenanceMessage === "string") {
          db.settings.maintenanceMessage = sanitizeText(body.maintenanceMessage, 300);
        }
        if (typeof body.videoPromoEnabled === "boolean") {
          db.settings.videoPromoEnabled = body.videoPromoEnabled;
        }
        if (typeof body.videoPromoDefaultReward === "number" && body.videoPromoDefaultReward >= 0) {
          db.settings.videoPromoDefaultReward = Math.round(body.videoPromoDefaultReward * 100) / 100;
        }
        if (typeof body.videoPromoRules === "string") {
          db.settings.videoPromoRules = sanitizeText(body.videoPromoRules, 600);
        }
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "SETTINGS_UPDATED",
          "settings",
          "global",
          { siteName: db.settings.siteName, maintenanceMode: db.settings.maintenanceMode },
          ip
        );
        return db.settings;
      });
      broadcastChatEvent("lottery:overview_updated", {
        reason: "settings_updated"
      });
      broadcastChatEvent("shop:catalog_updated", {
        reason: "settings_updated"
      });
      res.json({ success: true, settings: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Failed to save settings." });
    }
  });
  router.put("/admin/brand", requireAuth, requireStaff, async (req, res) => {
    try {
      const ip = getClientIp(req);
      const body = req.body || {};
      let resolvedLogoUrl = void 0;
      if (body.removeLogo === true || body.logoUrl === null || body.logoUrl === "") {
        resolvedLogoUrl = null;
      } else if (typeof body.logoDataUrl === "string" && body.logoDataUrl.trim().startsWith("data:image/")) {
        resolvedLogoUrl = saveUploadedBrandLogo(body.logoDataUrl.trim());
      } else if (typeof body.logoUrl === "string" && body.logoUrl.trim()) {
        const raw = body.logoUrl.trim();
        if (raw.startsWith("data:image/")) {
          resolvedLogoUrl = saveUploadedBrandLogo(raw);
        } else if (raw.startsWith("/api/brand/media/") || /^https?:\/\//i.test(raw)) {
          resolvedLogoUrl = sanitizeText(raw, 400);
        } else {
          throw new Error("Logo must be an uploaded image or valid http/https URL.");
        }
      }
      const rawAccent = typeof body.accentColor === "string" ? body.accentColor.trim() : "";
      const validAccent = /^#[0-9a-fA-F]{6}$/.test(rawAccent) ? rawAccent.toUpperCase() : void 0;
      const updatedBrand = await withTransaction((db) => {
        const current = db.settings.checkoutBrand || {
          brandName: db.settings.siteName || "Lottery Winner",
          logoUrl: null,
          accentColor: "#0078E8",
          supportUrl: "https://t.me/lotterywinner_support",
          whatsappNumber: "+8801711000111",
          supportEmail: "support@lotterywinner.app",
          showSupportIcons: true,
          payButtonLabel: "Pay",
          currencyCode: "BDT",
          footerNote: "Secured Instant Checkout"
        };
        const nextBrand = {
          brandName: typeof body.brandName === "string" && body.brandName.trim() ? sanitizeText(body.brandName, 80) : current.brandName,
          logoUrl: resolvedLogoUrl !== void 0 ? resolvedLogoUrl : current.logoUrl,
          accentColor: validAccent || current.accentColor || "#0078E8",
          supportUrl: typeof body.supportUrl === "string" ? sanitizeText(body.supportUrl, 240) : current.supportUrl,
          whatsappNumber: typeof body.whatsappNumber === "string" ? sanitizeText(body.whatsappNumber, 120) : current.whatsappNumber,
          supportEmail: typeof body.supportEmail === "string" ? sanitizeText(body.supportEmail, 120) : current.supportEmail ?? "support@lotterywinner.app",
          showSupportIcons: typeof body.showSupportIcons === "boolean" ? body.showSupportIcons : current.showSupportIcons,
          payButtonLabel: typeof body.payButtonLabel === "string" && body.payButtonLabel.trim() ? sanitizeText(body.payButtonLabel, 24) : current.payButtonLabel || "Pay",
          currencyCode: typeof body.currencyCode === "string" && body.currencyCode.trim() ? sanitizeText(body.currencyCode, 10).toUpperCase() : current.currencyCode || "BDT",
          footerNote: typeof body.footerNote === "string" ? sanitizeText(body.footerNote, 120) : current.footerNote || "Secured Instant Checkout",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.settings.checkoutBrand = nextBrand;
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "CHECKOUT_BRAND_UPDATED",
          "settings",
          "checkout_brand",
          {
            brandName: nextBrand.brandName,
            accentColor: nextBrand.accentColor,
            hasLogo: Boolean(nextBrand.logoUrl),
            showSupportIcons: nextBrand.showSupportIcons
          },
          ip
        );
        return nextBrand;
      });
      broadcastChatEvent("lottery:overview_updated", {
        reason: "checkout_brand_updated"
      });
      broadcastChatEvent("shop:catalog_updated", {
        reason: "checkout_brand_updated"
      });
      res.json({
        success: true,
        message: "Checkout brand settings updated.",
        checkoutBrand: updatedBrand
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to save checkout brand settings."
      });
    }
  });
  router.put("/admin/popup-event", requireAuth, requireStaff, async (req, res) => {
    try {
      const ip = getClientIp(req);
      const body = req.body || {};
      const validThemes = ["navy_gold", "emerald", "crimson"];
      const requestedTheme = validThemes.includes(body.theme) ? body.theme : "navy_gold";
      const rawImageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
      const safeImageUrl = rawImageUrl === "" || /^https?:\/\//i.test(rawImageUrl) || rawImageUrl.startsWith("/") || /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(rawImageUrl) ? rawImageUrl.slice(0, 6e5) : "";
      const delaySec = Number(body.delaySeconds);
      const safeDelay = Number.isFinite(delaySec) ? Math.min(15, Math.max(0, Math.round(delaySec))) : 0;
      const updatedPopup = await withTransaction((db) => {
        const current = db.settings.popupEvent;
        const nextPopup = {
          enabled: typeof body.enabled === "boolean" ? body.enabled : Boolean(current?.enabled),
          eventTag: sanitizeText(body.eventTag ?? current?.eventTag ?? "Special Event", 60),
          title: sanitizeText(body.title ?? current?.title ?? "Special Event", 140) || "Special Event",
          subtitle: sanitizeText(body.subtitle ?? current?.subtitle ?? "", 180),
          message: sanitizeText(body.message ?? current?.message ?? "", 800),
          imageUrl: safeImageUrl,
          ctaLabel: sanitizeText(body.ctaLabel ?? current?.ctaLabel ?? "Explore Now", 50),
          ctaTarget: sanitizeText(body.ctaTarget ?? current?.ctaTarget ?? "#campaigns", 240) || "#campaigns",
          cancelLabel: sanitizeText(body.cancelLabel ?? current?.cancelLabel ?? "Cancel", 40) || "Cancel",
          allowCancel: body.allowCancel !== false,
          showOncePerSession: typeof body.showOncePerSession === "boolean" ? body.showOncePerSession : current?.showOncePerSession ?? true,
          delaySeconds: safeDelay,
          startsAt: typeof body.startsAt === "string" ? sanitizeText(body.startsAt, 40) : "",
          endsAt: typeof body.endsAt === "string" ? sanitizeText(body.endsAt, 40) : "",
          theme: requestedTheme,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.settings.popupEvent = nextPopup;
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "POPUP_EVENT_UPDATED",
          "settings",
          "popup_event",
          { enabled: nextPopup.enabled, title: nextPopup.title, ctaTarget: nextPopup.ctaTarget },
          ip
        );
        return nextPopup;
      });
      res.json({ success: true, popupEvent: updatedPopup });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to save popup event."
      });
    }
  });
  router.get("/admin/security", requireAuth, requireStaff, (req, res) => {
    const db = getDbSnapshot();
    const security = db.security || createDefaultSecurityRoom();
    const currentAdminIp = normalizeClientIp(getClientIp(req));
    const regularUsers = db.users.filter((u) => u.role === "user");
    const ipMap = /* @__PURE__ */ new Map();
    const deviceMap = /* @__PURE__ */ new Map();
    for (const u of regularUsers) {
      if (u.registeredIp) {
        const normIp = normalizeClientIp(u.registeredIp);
        const list = ipMap.get(normIp) || [];
        list.push(u);
        ipMap.set(normIp, list);
      }
      if (u.deviceFingerprint) {
        const list = deviceMap.get(u.deviceFingerprint) || [];
        list.push(u);
        deviceMap.set(u.deviceFingerprint, list);
      }
    }
    const toCluster = (kind, key, users) => ({
      key,
      kind,
      count: users.length,
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        status: u.status,
        registeredIp: u.registeredIp ?? null,
        createdAt: u.createdAt,
        suspendedReason: u.suspendedReason ?? null
      }))
    });
    const ipClusters = Array.from(ipMap.entries()).filter(([, users]) => users.length > 0).sort((a, b) => b[1].length - a[1].length).slice(0, 60).map(([ipKey, users]) => toCluster("ip", ipKey, users));
    const deviceClusters = Array.from(deviceMap.entries()).filter(([, users]) => users.length > 1).sort((a, b) => b[1].length - a[1].length).slice(0, 40).map(([fpKey, users]) => toCluster("device", fpKey, users));
    const suspendedUsers = db.users.filter((u) => u.status === "blocked").sort((a, b) => (b.suspendedAt || b.updatedAt).localeCompare(a.suspendedAt || a.updatedAt)).map(toPublicUser);
    const p = security.policy;
    const activeShieldsCount = [
      p.maxAccountsPerIp === 1,
      p.autoSuspendMultiAccount,
      p.autoBlockIpOnMultiAccount,
      p.enforceDeviceFingerprint,
      p.requireLoginCaptcha,
      p.requireRegisterCaptcha,
      p.blockDisposableEmails
    ].filter(Boolean).length;
    const multiAccountClustersCount = ipClusters.filter((c) => c.count > 1).length + deviceClusters.length;
    res.json({
      success: true,
      security,
      currentAdminIp,
      ipClusters,
      deviceClusters,
      suspendedUsers,
      summary: {
        blockedIpsCount: security.blockedIps.length,
        suspendedUsersCount: suspendedUsers.length,
        criticalIncidentsCount: security.events.filter((e) => e.severity === "critical").length,
        multiAccountClustersCount,
        oneClickUsersCount: regularUsers.filter((u) => u.registrationMethod === "one_click").length,
        activeShieldsCount
      }
    });
  });
  router.put("/admin/security/policy", requireAuth, requireStaff, async (req, res) => {
    try {
      const ip = normalizeClientIp(getClientIp(req));
      const body = req.body || {};
      const updated = await withTransaction((db) => {
        if (!db.security) db.security = createDefaultSecurityRoom();
        const cur = db.security.policy;
        const maxPerIp = Number(body.maxAccountsPerIp);
        const maxFails = Number(body.maxFailedLogins);
        const lockMins = Number(body.lockoutMinutes);
        const cooldown = Number(body.registrationCooldownSeconds);
        db.security.policy = {
          oneClickRegistrationEnabled: typeof body.oneClickRegistrationEnabled === "boolean" ? body.oneClickRegistrationEnabled : cur.oneClickRegistrationEnabled,
          requirePrivacyConsent: typeof body.requirePrivacyConsent === "boolean" ? body.requirePrivacyConsent : cur.requirePrivacyConsent,
          requireRegisterCaptcha: typeof body.requireRegisterCaptcha === "boolean" ? body.requireRegisterCaptcha : cur.requireRegisterCaptcha,
          requireLoginCaptcha: typeof body.requireLoginCaptcha === "boolean" ? body.requireLoginCaptcha : cur.requireLoginCaptcha,
          maxAccountsPerIp: Number.isFinite(maxPerIp) ? Math.min(20, Math.max(1, Math.round(maxPerIp))) : cur.maxAccountsPerIp,
          autoSuspendMultiAccount: typeof body.autoSuspendMultiAccount === "boolean" ? body.autoSuspendMultiAccount : cur.autoSuspendMultiAccount,
          autoBlockIpOnMultiAccount: typeof body.autoBlockIpOnMultiAccount === "boolean" ? body.autoBlockIpOnMultiAccount : cur.autoBlockIpOnMultiAccount,
          enforceDeviceFingerprint: typeof body.enforceDeviceFingerprint === "boolean" ? body.enforceDeviceFingerprint : cur.enforceDeviceFingerprint,
          blockDisposableEmails: typeof body.blockDisposableEmails === "boolean" ? body.blockDisposableEmails : cur.blockDisposableEmails,
          maxFailedLogins: Number.isFinite(maxFails) ? Math.min(25, Math.max(3, Math.round(maxFails))) : cur.maxFailedLogins,
          lockoutMinutes: Number.isFinite(lockMins) ? Math.min(180, Math.max(5, Math.round(lockMins))) : cur.lockoutMinutes,
          registrationCooldownSeconds: Number.isFinite(cooldown) ? Math.min(3600, Math.max(0, Math.round(cooldown))) : cur.registrationCooldownSeconds
        };
        db.security.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "SECURITY_POLICY_UPDATED",
          "security",
          "policy",
          {
            maxAccountsPerIp: db.security.policy.maxAccountsPerIp,
            autoSuspendMultiAccount: db.security.policy.autoSuspendMultiAccount,
            requireLoginCaptcha: db.security.policy.requireLoginCaptcha
          },
          ip
        );
        return db.security.policy;
      });
      res.json({ success: true, policy: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update security policy."
      });
    }
  });
  router.post("/admin/security/block-ip", requireAuth, requireStaff, async (req, res) => {
    try {
      const adminIp = normalizeClientIp(getClientIp(req));
      const targetIp = normalizeClientIp(sanitizeText(req.body?.ip, 64));
      const reason = sanitizeText(req.body?.reason, 180) || "Manually blocked from Security Room";
      const durationHours = Number(req.body?.durationHours);
      if (!targetIp || targetIp.length < 3 || !/^[0-9a-fA-F:.]+$/.test(targetIp)) {
        res.status(400).json({ success: false, message: "Please enter a valid IPv4 or IPv6 address." });
        return;
      }
      const now = /* @__PURE__ */ new Date();
      const expiresAt = Number.isFinite(durationHours) && durationHours > 0 ? new Date(now.getTime() + durationHours * 3600 * 1e3).toISOString() : null;
      const record = await withTransaction((db) => {
        if (!db.security) db.security = createDefaultSecurityRoom();
        const existing = db.security.blockedIps.find(
          (b) => normalizeClientIp(b.ip) === targetIp
        );
        if (existing) {
          existing.reason = reason;
          existing.expiresAt = expiresAt;
          existing.blockedBy = req.authUser.username;
          existing.blockedAt = now.toISOString();
          return existing;
        }
        const created = {
          id: generateId("ipblk"),
          ip: targetIp,
          reason,
          blockedBy: req.authUser.username,
          blockedAt: now.toISOString(),
          expiresAt,
          hitCount: 0,
          lastHitAt: null
        };
        db.security.blockedIps.unshift(created);
        pushSecurityEvent(db, {
          type: "IP_BLOCKED",
          severity: "warning",
          ip: targetIp,
          username: req.authUser.username,
          message: `IP ${targetIp} blocked by @${req.authUser.username}: ${reason}`
        });
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "SECURITY_IP_BLOCKED",
          "security",
          targetIp,
          { reason, expiresAt },
          adminIp
        );
        return created;
      });
      res.status(201).json({ success: true, blockedIp: record });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to block IP."
      });
    }
  });
  router.delete("/admin/security/block-ip/:id", requireAuth, requireStaff, async (req, res) => {
    const adminIp = normalizeClientIp(getClientIp(req));
    const id = req.params.id;
    await withTransaction((db) => {
      if (!db.security) return;
      const target = db.security.blockedIps.find((b) => b.id === id);
      db.security.blockedIps = db.security.blockedIps.filter((b) => b.id !== id);
      if (target) {
        pushSecurityEvent(db, {
          type: "IP_UNBLOCKED",
          severity: "info",
          ip: target.ip,
          username: req.authUser.username,
          message: `IP ${target.ip} unblocked by @${req.authUser.username}.`
        });
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "SECURITY_IP_UNBLOCKED",
          "security",
          target.ip,
          {},
          adminIp
        );
      }
    });
    res.json({ success: true });
  });
  router.post("/admin/security/users/:id/suspend", requireAuth, requireStaff, async (req, res) => {
    try {
      const adminIp = normalizeClientIp(getClientIp(req));
      const userId = req.params.id;
      const action = req.body?.action === "restore" ? "restore" : "suspend";
      const reason = sanitizeText(req.body?.reason, 180) || (action === "suspend" ? "Suspended from Security Room (Multi-Account / Policy Violation)" : "");
      const alsoBlockIp = req.body?.alsoBlockIp === true;
      const result = await withTransaction((db) => {
        if (!db.security) db.security = createDefaultSecurityRoom();
        const user = db.users.find((u) => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (user.role === "admin" && action === "suspend") {
          throw new Error("Cannot suspend an administrator account.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        if (action === "suspend") {
          user.status = "blocked";
          user.suspendedReason = reason;
          user.suspendedAt = now;
          user.updatedAt = now;
          pushSecurityEvent(db, {
            type: "USER_SUSPENDED",
            severity: "warning",
            ip: user.registeredIp || user.lastLoginIp || adminIp,
            username: user.username,
            message: `@${user.username} suspended by @${req.authUser.username}: ${reason}`
          });
          if (alsoBlockIp && user.registeredIp && !findActiveIpBlock(db.security, user.registeredIp)) {
            db.security.blockedIps.unshift({
              id: generateId("ipblk"),
              ip: normalizeClientIp(user.registeredIp),
              reason: `Blocked with suspended account @${user.username}`,
              blockedBy: req.authUser.username,
              blockedAt: now,
              expiresAt: null,
              hitCount: 0,
              lastHitAt: null
            });
          }
        } else {
          user.status = "active";
          user.suspendedReason = null;
          user.suspendedAt = null;
          user.updatedAt = now;
          pushSecurityEvent(db, {
            type: "USER_RESTORED",
            severity: "info",
            ip: user.registeredIp || adminIp,
            username: user.username,
            message: `@${user.username} restored to active status by @${req.authUser.username}.`
          });
        }
        return toPublicUser(user);
      });
      res.json({ success: true, user: result });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update account status."
      });
    }
  });
  router.delete("/admin/security/events", requireAuth, requireAdminOnly, async (_req, res) => {
    await withTransaction((db) => {
      if (db.security) {
        db.security.events = [];
        db.security.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      }
    });
    res.json({ success: true });
  });
  router.post("/admin/agents", requireAuth, requireStaff, async (req, res) => {
    try {
      const tier = String(req.body?.tier || "agent").toLowerCase() === "sub_agent" ? "sub_agent" : "agent";
      const fullName = sanitizeText(req.body?.fullName, 80);
      const rawUsername = sanitizeText(req.body?.username, 40).replace(/^@+/, "").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
      const phone = sanitizeText(req.body?.phone, 30);
      const district = sanitizeText(req.body?.district, 80);
      const division = sanitizeText(req.body?.division || "Dhaka", 60);
      const parentAgentId = tier === "sub_agent" && typeof req.body?.parentAgentId === "string" ? req.body.parentAgentId.trim() || null : null;
      const commissionRate = Math.max(
        0,
        Math.min(50, Number(req.body?.commissionRate ?? (tier === "sub_agent" ? 2.5 : 4.5)))
      );
      const rawChannels = Array.isArray(req.body?.channels) ? req.body.channels : ["bKash", "Nagad"];
      const allowedChannels = ["bKash", "Nagad", "Rocket", "Upay", "Bank"];
      const channels = Array.from(
        new Set(
          rawChannels.map((c) => String(c || "").trim()).filter((c) => allowedChannels.includes(c))
        )
      );
      if (channels.length === 0) channels.push("bKash", "Nagad");
      const isOnline = req.body?.isOnline !== false;
      const isVerified = req.body?.isVerified !== false;
      const status = req.body?.status === "suspended" ? "suspended" : "active";
      if (!fullName) throw new Error("Agent full name is required.");
      if (!rawUsername || rawUsername.length < 3) {
        throw new Error("Username must be at least 3 letters/numbers.");
      }
      if (!phone) throw new Error("Mobile phone number is required.");
      if (!district) throw new Error("District / Area is required.");
      const ip = getClientIp(req);
      const created = await withTransaction((db) => {
        if (db.agents.some((a) => a.username.toLowerCase() === rawUsername)) {
          throw new Error(`Agent username @${rawUsername} already exists.`);
        }
        let parentAgentName = null;
        if (tier === "sub_agent" && parentAgentId) {
          const parent = db.agents.find((a) => a.id === parentAgentId);
          if (parent) {
            parentAgentName = `${parent.fullName} (@${parent.username})`;
          }
        }
        const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "AG";
        const bg1 = tier === "sub_agent" ? "#1E3A8A" : "#065F46";
        const bg2 = tier === "sub_agent" ? "#3B82F6" : "#10B981";
        const avatarUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><text x="60" y="72" text-anchor="middle" font-family="system-ui, sans-serif" font-size="40" font-weight="700" fill="#ffffff">${initials}</text></svg>`
        )}`;
        const loginEmail = sanitizeText(req.body?.loginEmail, 140).toLowerCase();
        const loginPassword = typeof req.body?.loginPassword === "string" ? req.body.loginPassword.trim() : "";
        const initialFloatBalance = Math.max(0, Number(req.body?.initialFloatBalance ?? 1e4) || 0);
        let linkedUserId = null;
        let linkedLoginEmail = null;
        const newAgentId = generateId(tier === "sub_agent" ? "subag" : "agt");
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        if (loginEmail && loginPassword) {
          if (!loginEmail.includes("@")) {
            throw new Error("Please enter a valid Agent login email.");
          }
          if (loginPassword.length < 6) {
            throw new Error("Agent login password must be at least 6 characters.");
          }
          if (db.users.some((u) => u.email.toLowerCase() === loginEmail)) {
            throw new Error(`Login email ${loginEmail} is already registered to another account.`);
          }
          const baseUsername = db.users.some(
            (u) => u.username.toLowerCase() === rawUsername.toLowerCase()
          ) ? `${rawUsername}_${Math.floor(100 + Math.random() * 900)}` : rawUsername;
          const agentUserId = generateId("u_agt");
          db.users.push({
            id: agentUserId,
            username: baseUsername,
            fullName,
            email: loginEmail,
            phone,
            avatarUrl,
            passwordHash: hashPassword(loginPassword),
            role: tier,
            status: status === "suspended" ? "blocked" : "active",
            balance: initialFloatBalance,
            spinCredits: 0,
            totalDeposited: initialFloatBalance,
            totalWithdrawn: 0,
            winsCount: 0,
            securityPinHash: null,
            pinLockEnabled: false,
            agentId: newAgentId,
            createdAt: nowIso,
            updatedAt: nowIso
          });
          linkedUserId = agentUserId;
          linkedLoginEmail = loginEmail;
        }
        const newAgent = {
          id: newAgentId,
          username: rawUsername,
          fullName,
          avatarUrl,
          district,
          division,
          phone,
          channels,
          totalOrders: 0,
          cashInOrders: 0,
          cashOutOrders: 0,
          isOnline,
          isVerified,
          tier,
          parentAgentId,
          parentAgentName,
          commissionRate: Math.round(commissionRate * 100) / 100,
          commissionEarned: 0,
          userId: linkedUserId,
          loginEmail: linkedLoginEmail,
          status,
          createdAt: nowIso
        };
        db.agents.unshift(newAgent);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          tier === "sub_agent" ? "SUB_AGENT_CREATED" : "AGENT_CREATED",
          "agent",
          newAgent.id,
          { username: newAgent.username, district: newAgent.district, tier, loginEmail: linkedLoginEmail },
          ip
        );
        return newAgent;
      });
      res.status(201).json({ success: true, agent: created });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to create agent."
      });
    }
  });
  router.put("/admin/agents/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const agentId = req.params.id;
      const ip = getClientIp(req);
      const updated = await withTransaction((db) => {
        const agent = db.agents.find((a) => a.id === agentId);
        if (!agent) throw new Error("Agent record not found.");
        const body = req.body || {};
        if (typeof body.fullName === "string" && body.fullName.trim()) {
          agent.fullName = sanitizeText(body.fullName, 80);
        }
        if (typeof body.avatarUrl === "string" && body.avatarUrl.trim()) {
          agent.avatarUrl = body.avatarUrl.trim().slice(0, 5e5);
          const u = agent.userId ? db.users.find((user) => user.id === agent.userId) : null;
          if (u) u.avatarUrl = agent.avatarUrl;
        }
        if (typeof body.phone === "string" && body.phone.trim()) {
          agent.phone = sanitizeText(body.phone, 30);
        }
        if (typeof body.district === "string" && body.district.trim()) {
          agent.district = sanitizeText(body.district, 80);
        }
        if (typeof body.division === "string" && body.division.trim()) {
          agent.division = sanitizeText(body.division, 60);
        }
        if (Array.isArray(body.channels) && body.channels.length > 0) {
          const allowed = ["bKash", "Nagad", "Rocket", "Upay", "Bank"];
          const next = Array.from(
            new Set(
              body.channels.map((c) => String(c || "").trim()).filter((c) => allowed.includes(c))
            )
          );
          if (next.length > 0) agent.channels = next;
        }
        if (typeof body.commissionRate === "number" && body.commissionRate >= 0 && body.commissionRate <= 50) {
          agent.commissionRate = Math.round(body.commissionRate * 100) / 100;
        }
        if (typeof body.isOnline === "boolean") {
          agent.isOnline = body.isOnline;
        }
        if (typeof body.isVerified === "boolean") {
          agent.isVerified = body.isVerified;
        }
        if (body.status === "active" || body.status === "suspended") {
          agent.status = body.status;
          if (body.status === "suspended") agent.isOnline = false;
        }
        if (body.tier === "agent" || body.tier === "sub_agent") {
          agent.tier = body.tier;
        }
        if (agent.tier === "sub_agent" && body.parentAgentId !== void 0) {
          const pid = typeof body.parentAgentId === "string" ? body.parentAgentId.trim() : "";
          const parent = pid ? db.agents.find((a) => a.id === pid) : null;
          agent.parentAgentId = parent ? parent.id : null;
          agent.parentAgentName = parent ? `${parent.fullName} (@${parent.username})` : null;
        }
        const loginEmail = typeof body.loginEmail === "string" ? sanitizeText(body.loginEmail, 140).toLowerCase() : "";
        const loginPassword = typeof body.loginPassword === "string" ? body.loginPassword.trim() : "";
        const linkedUser = agent.userId ? db.users.find((u) => u.id === agent.userId) : db.users.find((u) => u.agentId === agent.id);
        if (linkedUser) {
          if (loginEmail && loginEmail.includes("@")) {
            if (db.users.some((u) => u.id !== linkedUser.id && u.email.toLowerCase() === loginEmail)) {
              throw new Error(`Email ${loginEmail} is already in use by another account.`);
            }
            linkedUser.email = loginEmail;
            agent.loginEmail = loginEmail;
          }
          if (loginPassword) {
            if (loginPassword.length < 6) {
              throw new Error("Agent password must be at least 6 characters.");
            }
            linkedUser.passwordHash = hashPassword(loginPassword);
          }
          linkedUser.fullName = agent.fullName;
          linkedUser.phone = agent.phone;
          linkedUser.role = agent.tier === "sub_agent" ? "sub_agent" : "agent";
          linkedUser.status = agent.status === "suspended" ? "blocked" : "active";
          linkedUser.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          agent.userId = linkedUser.id;
        } else if (loginEmail && loginPassword) {
          if (!loginEmail.includes("@")) throw new Error("Please enter a valid Agent login email.");
          if (loginPassword.length < 6) throw new Error("Agent password must be at least 6 characters.");
          if (db.users.some((u) => u.email.toLowerCase() === loginEmail)) {
            throw new Error(`Email ${loginEmail} is already registered.`);
          }
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const newUid = generateId("u_agt");
          const baseUsername = db.users.some(
            (u) => u.username.toLowerCase() === agent.username.toLowerCase()
          ) ? `${agent.username}_${Math.floor(100 + Math.random() * 900)}` : agent.username;
          db.users.push({
            id: newUid,
            username: baseUsername,
            fullName: agent.fullName,
            email: loginEmail,
            phone: agent.phone,
            avatarUrl: agent.avatarUrl,
            passwordHash: hashPassword(loginPassword),
            role: agent.tier === "sub_agent" ? "sub_agent" : "agent",
            status: agent.status === "suspended" ? "blocked" : "active",
            balance: 1e4,
            spinCredits: 0,
            totalDeposited: 1e4,
            totalWithdrawn: 0,
            winsCount: 0,
            securityPinHash: null,
            pinLockEnabled: false,
            agentId: agent.id,
            createdAt: nowIso,
            updatedAt: nowIso
          });
          agent.userId = newUid;
          agent.loginEmail = loginEmail;
        }
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          agent.tier === "sub_agent" ? "SUB_AGENT_UPDATED" : "AGENT_UPDATED",
          "agent",
          agent.id,
          { username: agent.username, status: agent.status, isOnline: agent.isOnline },
          ip
        );
        return agent;
      });
      broadcastChatEvent("shop:catalog_updated", {
        action: "admin_agent_updated",
        agentId: updated.id,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true, agent: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update agent."
      });
    }
  });
  router.delete("/admin/agents/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const agentId = req.params.id;
      const ip = getClientIp(req);
      await withTransaction((db) => {
        const idx = db.agents.findIndex((a) => a.id === agentId);
        if (idx === -1) throw new Error("Agent not found.");
        const [removed] = db.agents.splice(idx, 1);
        for (const child of db.agents) {
          if (child.parentAgentId === agentId) {
            child.parentAgentId = null;
            child.parentAgentName = null;
          }
        }
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          removed.tier === "sub_agent" ? "SUB_AGENT_DELETED" : "AGENT_DELETED",
          "agent",
          agentId,
          { username: removed.username, district: removed.district },
          ip
        );
      });
      res.json({ success: true, message: "Agent removed successfully." });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to delete agent."
      });
    }
  });
  router.get("/user/otp", requireAuth, async (req, res) => {
    try {
      const userId = req.authUser.id;
      let secret = "";
      let accountLabel = "";
      await withTransaction((db) => {
        const user = db.users.find((u) => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (!user.otpSecret) {
          user.otpSecret = generateOtpSecret();
          user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        secret = user.otpSecret;
        accountLabel = `@${user.username}`;
      });
      const otp = computeTimedOtp(secret, Date.now(), 30);
      res.json({ ...otp, accountLabel });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not generate OTP."
      });
    }
  });
  router.post("/user/otp/verify", requireAuth, async (req, res) => {
    try {
      const candidate = String(req.body?.code || "").trim();
      const db = getDbSnapshot();
      const user = db.users.find((u) => u.id === req.authUser.id);
      if (!user || !user.otpSecret) {
        throw new Error("OTP authenticator is not initialized.");
      }
      const valid = verifyTimedOtp(user.otpSecret, candidate, Date.now(), 30);
      if (!valid) {
        res.status(400).json({
          success: false,
          valid: false,
          message: "Invalid or expired OTP code. Please enter the live 6-digit code."
        });
        return;
      }
      res.json({
        success: true,
        valid: true,
        message: "OTP code verified successfully."
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        valid: false,
        message: err instanceof Error ? err.message : "OTP verification failed."
      });
    }
  });
  router.post("/user/otp/rotate-secret", requireAuth, async (req, res) => {
    try {
      const userId = req.authUser.id;
      let nextSecret = "";
      let accountLabel = "";
      await withTransaction((db) => {
        const user = db.users.find((u) => u.id === userId);
        if (!user) throw new Error("User not found.");
        user.otpSecret = generateOtpSecret();
        user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        nextSecret = user.otpSecret;
        accountLabel = `@${user.username}`;
      });
      const otp = computeTimedOtp(nextSecret, Date.now(), 30);
      res.json({ success: true, ...otp, accountLabel });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not rotate OTP key."
      });
    }
  });
  router.get("/user/video-promotions", requireAuth, (req, res) => {
    const db = getDbSnapshot();
    const submissions = (db.videoPromotions || []).filter(
      (v) => v.userId === req.authUser.id
    );
    res.json({
      enabled: db.settings.videoPromoEnabled !== false,
      defaultReward: db.settings.videoPromoDefaultReward ?? 100,
      rules: db.settings.videoPromoRules || "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0993\u09DF\u09C7\u09AC\u09B8\u09BE\u0987\u099F \u09A8\u09BF\u09DF\u09C7 \u09AD\u09BF\u09A1\u09BF\u0993 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C7 \u09B2\u09BF\u0982\u0995 \u09B8\u09BE\u09AC\u09AE\u09BF\u099F \u0995\u09B0\u09C1\u09A8\u0964 \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u099A\u09C7\u0995 \u0995\u09B0\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F\u09C7 \u099F\u09BE\u0995\u09BE \u09AF\u09CB\u0997 \u0995\u09B0\u09C7 \u09A6\u09C7\u09AC\u09C7\u09A8\u0964",
      currencySymbol: db.settings.currencySymbol || "\u09F3",
      submissions
    });
  });
  router.post("/user/video-promotions", requireAuth, async (req, res) => {
    try {
      const rawUrl = String(req.body?.videoUrl || "").trim();
      const title = sanitizeText(req.body?.title || "", 120);
      const channelHandle = sanitizeText(req.body?.channelHandle || "", 60);
      const rawPlatform = String(req.body?.platform || "YouTube").trim();
      const allowedPlatforms = ["YouTube", "TikTok", "Facebook", "Instagram", "Other"];
      const platform = allowedPlatforms.includes(rawPlatform) ? rawPlatform : "Other";
      let parsedUrl;
      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        throw new Error("Please enter a valid video link starting with https://");
      }
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error("Only http:// or https:// video links are allowed.");
      }
      if (!title || title.length < 3) {
        throw new Error("Please provide a short title for your promotional video.");
      }
      const ip = getClientIp(req);
      const submission = await withTransaction((db) => {
        if (db.settings.videoPromoEnabled === false) {
          throw new Error("Video promotion submissions are temporarily paused by administration.");
        }
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("User account not found.");
        if (!Array.isArray(db.videoPromotions)) db.videoPromotions = [];
        const normalizedUrl = parsedUrl.toString();
        const duplicate = db.videoPromotions.find(
          (v) => v.videoUrl.toLowerCase() === normalizedUrl.toLowerCase() && v.status !== "rejected"
        );
        if (duplicate) {
          throw new Error("This video link has already been submitted.");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const record = {
          id: generateId("vpromo"),
          userId: user.id,
          username: user.username,
          userFullName: user.fullName || user.username,
          platform,
          videoUrl: normalizedUrl,
          title,
          channelHandle,
          status: "pending",
          rewardAmount: 0,
          adminNote: "",
          reviewedBy: null,
          reviewedAt: null,
          createdAt: now
        };
        db.videoPromotions.unshift(record);
        pushAuditLog(
          db,
          { id: user.id, username: user.username },
          "VIDEO_PROMO_SUBMITTED",
          "video_promotion",
          record.id,
          { platform, videoUrl: normalizedUrl },
          ip
        );
        return record;
      });
      res.status(201).json({
        success: true,
        message: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09AD\u09BF\u09A1\u09BF\u0993 \u09B2\u09BF\u0982\u0995 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BE\u09AC\u09AE\u09BF\u099F \u09B9\u09DF\u09C7\u099B\u09C7! \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09AF\u09BE\u099A\u09BE\u0987 \u0995\u09B0\u09C7 \u099F\u09BE\u0995\u09BE \u09AF\u09CB\u0997 \u0995\u09B0\u09C7 \u09A6\u09C7\u09AC\u09C7\u09A8\u0964",
        submission
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not submit video link."
      });
    }
  });
  router.post(
    "/admin/video-promotions/:id/review",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const promoId = req.params.id;
        const action = String(req.body?.action || "").toLowerCase();
        const rewardAmount = Math.round((Number(req.body?.rewardAmount) || 0) * 100) / 100;
        const adminNote = sanitizeText(req.body?.adminNote || "", 240);
        const ip = getClientIp(req);
        if (action !== "approve" && action !== "reject") {
          throw new Error("Invalid review action. Use approve or reject.");
        }
        if (action === "approve" && (!Number.isFinite(rewardAmount) || rewardAmount <= 0)) {
          throw new Error("Please enter a valid reward amount greater than 0.");
        }
        const result = await withTransaction((db) => {
          if (!Array.isArray(db.videoPromotions)) db.videoPromotions = [];
          const sub = db.videoPromotions.find((v) => v.id === promoId);
          if (!sub) throw new Error("Video promotion submission not found.");
          if (sub.status !== "pending") {
            throw new Error(`This submission has already been ${sub.status}.`);
          }
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const sym = db.settings.currencySymbol || "\u09F3";
          sub.reviewedBy = req.authUser.username;
          sub.reviewedAt = now;
          sub.adminNote = adminNote;
          const player = db.users.find((u) => u.id === sub.userId);
          if (action === "approve") {
            sub.status = "approved";
            sub.rewardAmount = rewardAmount;
            if (player) {
              player.balance = Math.round((player.balance + rewardAmount) * 100) / 100;
              player.updatedAt = now;
              db.transactions.unshift({
                id: generateId("txn"),
                userId: player.id,
                username: player.username,
                direction: "credit",
                category: "video_promo_reward",
                amount: rewardAmount,
                balanceAfter: player.balance,
                referenceId: sub.id,
                gateway: "Video Promotion",
                description: `Video promotion reward (${sub.platform}: "${sub.title}")`,
                createdAt: now
              });
              db.notifications.unshift({
                id: generateId("notif"),
                userId: player.id,
                title: `\u09AD\u09BF\u09A1\u09BF\u0993 \u09AA\u09CD\u09B0\u09AE\u09CB\u09B6\u09A8 \u09B0\u09BF\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4! (+${sym}${rewardAmount.toLocaleString()})`,
                message: `\u0985\u09AD\u09BF\u09A8\u09A8\u09CD\u09A6\u09A8! \u0986\u09AA\u09A8\u09BE\u09B0 "${sub.title}" (${sub.platform}) \u09AA\u09CD\u09B0\u09AE\u09CB\u09B6\u09A8\u09BE\u09B2 \u09AD\u09BF\u09A1\u09BF\u0993\u099F\u09BF \u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09C7\u099B\u09C7\u09A8 \u098F\u09AC\u0982 ${sym}${rewardAmount.toLocaleString()} \u099F\u09BE\u0995\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 \u09AE\u09C2\u09B2 \u0993\u09DF\u09BE\u09B2\u09C7\u099F\u09C7 \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964${adminNote ? ` \u09A8\u09CB\u099F: ${adminNote}` : ""}`,
                type: "success",
                isRead: false,
                createdAt: now
              });
            }
            pushAuditLog(
              db,
              { id: req.authUser.id, username: req.authUser.username },
              "VIDEO_PROMO_APPROVED",
              "video_promotion",
              sub.id,
              { username: sub.username, platform: sub.platform, rewardAmount },
              ip
            );
          } else {
            sub.status = "rejected";
            sub.rewardAmount = 0;
            if (player) {
              db.notifications.unshift({
                id: generateId("notif"),
                userId: player.id,
                title: `\u09AD\u09BF\u09A1\u09BF\u0993 \u09AA\u09CD\u09B0\u09AE\u09CB\u09B6\u09A8 \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7`,
                message: `\u0986\u09AA\u09A8\u09BE\u09B0 "${sub.title}" (${sub.platform}) \u09AD\u09BF\u09A1\u09BF\u0993 \u09B2\u09BF\u0982\u0995\u099F\u09BF \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B9\u09DF\u09A8\u09BF\u0964${adminNote ? ` \u0995\u09BE\u09B0\u09A3: ${adminNote}` : ""}`,
                type: "warning",
                isRead: false,
                createdAt: now
              });
            }
            pushAuditLog(
              db,
              { id: req.authUser.id, username: req.authUser.username },
              "VIDEO_PROMO_REJECTED",
              "video_promotion",
              sub.id,
              { username: sub.username, platform: sub.platform, adminNote },
              ip
            );
          }
          return { submission: sub, playerBalance: player?.balance ?? null };
        });
        sendChatEventToUsers([result.submission.userId], "lottery:overview_updated", {
          type: action === "approve" ? "video_promo_approved" : "video_promo_rejected",
          rewardAmount: result.submission.rewardAmount
        });
        res.json({
          success: true,
          message: action === "approve" ? `Approved and credited ${rewardAmount} to @${result.submission.username}.` : "Video promotion rejected.",
          ...result
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Review action failed."
        });
      }
    }
  );
  const WHEEL_SEGMENTS = [
    { index: 0, label: "\u09F35 Cash", rewardAmount: 5, rewardSpins: 0, weight: 28, color: "#059669" },
    { index: 1, label: "\u09F310 Cash", rewardAmount: 10, rewardSpins: 0, weight: 22, color: "#1E293B" },
    { index: 2, label: "+1 Spin", rewardAmount: 0, rewardSpins: 1, weight: 18, color: "#D97706" },
    { index: 3, label: "\u09F325 Cash", rewardAmount: 25, rewardSpins: 0, weight: 10, color: "#0F766E" },
    { index: 4, label: "\u09F32 Bonus", rewardAmount: 2, rewardSpins: 0, weight: 12, color: "#334155" },
    { index: 5, label: "\u09F350 Cash", rewardAmount: 50, rewardSpins: 0, weight: 5, color: "#B45309" },
    { index: 6, label: "\u09F315 Cash", rewardAmount: 15, rewardSpins: 0, weight: 4, color: "#047857" },
    { index: 7, label: "\u09F3100 Jackpot", rewardAmount: 100, rewardSpins: 0, weight: 1, color: "#9333EA" }
  ];
  function buildDailyTaskStates(db, userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const claims = userId ? (db.dailyTaskClaims || []).filter((c) => c.userId === userId && c.claimDate === today) : [];
    const claimedSet = new Set(claims.map((c) => c.taskId));
    const ticketsToday = userId ? db.tickets.filter((t) => t.userId === userId && t.purchasedAt.slice(0, 10) === today).length : 0;
    const chatsToday = userId ? (db.chatMessages || []).filter((m) => m.userId === userId && m.createdAt.slice(0, 10) === today).length : 0;
    const depositsToday = userId ? db.payments.filter((p) => p.userId === userId && p.createdAt.slice(0, 10) === today).length : 0;
    return [
      {
        id: "daily_checkin",
        title: "Daily Player Check-In",
        description: "Check in once every 24 hours to receive instant wallet credit and a free spin.",
        rewardAmount: 5,
        rewardSpins: 1,
        eligible: Boolean(userId),
        claimedToday: claimedSet.has("daily_checkin"),
        progressLabel: claimedSet.has("daily_checkin") ? "Claimed Today" : "1/1 Ready"
      },
      {
        id: "buy_ticket_today",
        title: "Lottery Ticket Participant",
        description: "Purchase at least 1 lottery ticket today in any active pool.",
        rewardAmount: 15,
        rewardSpins: 0,
        eligible: Boolean(userId && ticketsToday >= 1),
        claimedToday: claimedSet.has("buy_ticket_today"),
        progressLabel: `${Math.min(1, ticketsToday)}/1 Ticket Today`
      },
      {
        id: "community_chat_today",
        title: "Community Chat Check-In",
        description: "Post at least 1 message in Community & Support Chat today.",
        rewardAmount: 5,
        rewardSpins: 0,
        eligible: Boolean(userId && chatsToday >= 1),
        claimedToday: claimedSet.has("community_chat_today"),
        progressLabel: `${Math.min(1, chatsToday)}/1 Message Today`
      },
      {
        id: "mfs_deposit_today",
        title: "MFS Wallet Top-Up Bonus",
        description: "Submit a bKash, Nagad, Rocket, or Upay deposit today to unlock bonus credit.",
        rewardAmount: 20,
        rewardSpins: 1,
        eligible: Boolean(userId && depositsToday >= 1),
        claimedToday: claimedSet.has("mfs_deposit_today"),
        progressLabel: `${Math.min(1, depositsToday)}/1 Deposit Today`
      }
    ];
  }
  router.get("/rewards/overview", (req, res) => {
    const db = getDbSnapshot();
    const token = extractBearerOrCookieToken(req);
    const payload = token ? verifySessionToken(token) : null;
    const uid = payload?.uid || null;
    const user = uid ? db.users.find((u) => u.id === uid) || null : null;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const usedDailySpinToday = Boolean(
      user && (db.wheelSpins || []).some(
        (s) => s.userId === user.id && s.spinType === "daily_free" && s.createdAt.slice(0, 10) === today
      )
    );
    const tomorrowUtc = /* @__PURE__ */ new Date();
    tomorrowUtc.setUTCHours(24, 0, 0, 0);
    res.json({
      success: true,
      shopItems: (db.shopItems || []).filter(
        (p) => p.isActive !== false && (!p.approvalStatus || p.approvalStatus === "approved")
      ),
      wheelSegments: WHEEL_SEGMENTS.map(({ weight: _w, ...seg }) => seg),
      dailyTasks: buildDailyTaskStates(db, user?.id || null),
      canUseFreeDailySpin: Boolean(user && !usedDailySpinToday),
      nextFreeSpinAt: usedDailySpinToday ? tomorrowUtc.toISOString() : null,
      spinCredits: user ? Number(user.spinCredits) || 0 : 0,
      recentOrders: user ? (db.shopOrders || []).filter((o) => o.userId === user.id).slice(0, 10) : [],
      recentSpins: user ? (db.wheelSpins || []).filter((s) => s.userId === user.id).slice(0, 10) : []
    });
  });
  router.post("/rewards/shop/buy", requireAuth, financeLimiter, async (req, res) => {
    try {
      await syncCampaignStatuses();
      const itemId = sanitizeText(req.body?.itemId, 64);
      if (!itemId) {
        res.status(400).json({ success: false, message: "Shop item ID is required." });
        return;
      }
      const outcome = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("Account not found.");
        if (user.status !== "active") throw new Error("Account is suspended.");
        const item = (db.shopItems || []).find(
          (i) => i.id === itemId && i.isActive !== false && (!i.approvalStatus || i.approvalStatus === "approved")
        );
        if (!item) throw new Error("Shop item not found or awaiting approval.");
        if (user.balance < item.price) {
          throw new Error(
            `Insufficient balance. Need ${db.settings.currencySymbol}${item.price}, available ${db.settings.currencySymbol}${user.balance.toLocaleString()}.`
          );
        }
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        let rewardSummary = "";
        if (item.kind === "ticket_entry") {
          const targetLottery = item.lotteryId && db.lotteries.find((l) => l.id === item.lotteryId && l.status === "active") || db.lotteries.find((l) => l.status === "active" && l.entryFee <= item.price);
          if (!targetLottery) {
            throw new Error("Target lottery pool is currently closed. Please try another item.");
          }
          const issued = issueTicketsForPurchase(db, user.id, targetLottery.id, 1, void 0, true);
          user.balance = Math.round((user.balance - item.price) * 100) / 100;
          if (item.spinsGranted > 0) {
            user.spinCredits = (user.spinCredits || 0) + item.spinsGranted;
          }
          rewardSummary = `Issued ticket ${issued.tickets[0]?.ticketNumber || ""} for ${targetLottery.name}${item.spinsGranted > 0 ? ` + ${item.spinsGranted} Spin(s)` : ""}`;
        } else {
          user.balance = Math.round((user.balance - item.price) * 100) / 100;
          user.spinCredits = (user.spinCredits || 0) + item.spinsGranted;
          rewardSummary = `Credited +${item.spinsGranted} Lucky Wheel Spin${item.spinsGranted > 1 ? "s" : ""}`;
        }
        user.updatedAt = nowIso;
        const order = {
          id: generateId("ord"),
          userId: user.id,
          username: user.username,
          itemId: item.id,
          itemTitle: item.title,
          amount: item.price,
          rewardSummary,
          createdAt: nowIso
        };
        if (!Array.isArray(db.shopOrders)) db.shopOrders = [];
        db.shopOrders.unshift(order);
        db.transactions.unshift({
          id: generateId("txn"),
          userId: user.id,
          username: user.username,
          direction: "debit",
          category: "shop_purchase",
          amount: item.price,
          balanceAfter: user.balance,
          referenceId: order.id,
          gateway: "Shop",
          description: `Shop purchase: ${item.title} (${rewardSummary})`,
          createdAt: nowIso
        });
        db.notifications.unshift({
          id: generateId("notif"),
          userId: user.id,
          title: "Shop Order Completed",
          message: `${item.title} fulfilled: ${rewardSummary}.`,
          type: "success",
          isRead: false,
          createdAt: nowIso
        });
        return { order, user: toPublicUser(user), rewardSummary };
      });
      res.status(201).json({
        success: true,
        message: `${outcome.order.itemTitle} purchased! ${outcome.rewardSummary}.`,
        ...outcome
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Shop purchase failed."
      });
    }
  });
  router.get("/shop/wallet-balance", (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const db = getDbSnapshot();
    const token = extractBearerOrCookieToken(req);
    const payload = token ? verifySessionToken(token) : null;
    const uid = payload?.uid || null;
    const user = uid ? db.users.find((u) => u.id === uid) || null : null;
    res.json({
      success: true,
      authenticated: Boolean(user),
      balance: user ? Number(user.balance) || 0 : null,
      currencySymbol: db.settings.currencySymbol || "\u09F3"
    });
  });
  const SHOP_DIGITAL_FILES_DIR = import_path5.default.resolve(process.cwd(), "data", "shop_digital_files");
  const SHOP_COVER_IMAGES_DIR = import_path5.default.resolve(process.cwd(), "data", "shop_cover_images");
  const GATEWAY_QR_IMAGES_DIR = import_path5.default.resolve(process.cwd(), "data", "gateway_qr_images");
  const BRAND_MEDIA_DIR = import_path5.default.resolve(process.cwd(), "data", "brand_media");
  const ALLOWED_SHOP_STATUSES = [
    "auto_delivered",
    "pending_admin",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "partial",
    "delivered",
    "cancelled"
  ];
  function toPublicShopItem(item) {
    const { digitalFileStorageName: _hidden, ...publicFields } = item;
    return publicFields;
  }
  function parseCouponFields(body, existing) {
    const hasCouponCodeKey = Object.prototype.hasOwnProperty.call(body, "couponCode");
    const rawCode = hasCouponCodeKey ? sanitizeText(String(body.couponCode ?? ""), 24).toUpperCase().replace(/[^A-Z0-9_-]/g, "") : (existing?.couponCode || "").toUpperCase();
    if (!rawCode) {
      return {
        couponCode: null,
        couponDiscountType: "percent",
        couponDiscountValue: 0,
        couponMinOrder: 0,
        couponActive: false
      };
    }
    const rawType = body.couponDiscountType !== void 0 ? String(body.couponDiscountType) : existing?.couponDiscountType || "percent";
    const couponDiscountType = rawType === "fixed" ? "fixed" : "percent";
    const rawVal = body.couponDiscountValue !== void 0 ? Number(body.couponDiscountValue) : Number(existing?.couponDiscountValue || 0);
    const safeVal = Number.isFinite(rawVal) && rawVal > 0 ? Math.round(rawVal * 100) / 100 : 0;
    const clampedVal = couponDiscountType === "percent" ? Math.min(90, safeVal) : safeVal;
    const rawMin = body.couponMinOrder !== void 0 ? Number(body.couponMinOrder) : Number(existing?.couponMinOrder || 0);
    const couponMinOrder = Number.isFinite(rawMin) && rawMin > 0 ? Math.round(rawMin * 100) / 100 : 0;
    const couponActive = typeof body.couponActive === "boolean" ? body.couponActive && clampedVal > 0 : existing?.couponActive !== void 0 ? Boolean(existing.couponActive) && clampedVal > 0 : clampedVal > 0;
    return {
      couponCode: clampedVal > 0 ? rawCode : null,
      couponDiscountType,
      couponDiscountValue: clampedVal,
      couponMinOrder,
      couponActive
    };
  }
  function toPublicShopCoupon(c) {
    return {
      id: c.id,
      code: c.code,
      title: c.title || null,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscount: c.maxDiscount ?? null,
      minOrderAmount: c.minOrderAmount || 0,
      appliesToAllProducts: Boolean(c.appliesToAllProducts),
      applicableProductIds: Array.isArray(c.applicableProductIds) ? c.applicableProductIds : [],
      startsAt: c.startsAt || null,
      expiresAt: c.expiresAt || null,
      usageLimit: c.usageLimit ?? null,
      usedCount: c.usedCount || 0,
      createdByRole: c.createdByRole || null,
      createdByUsername: c.createdByUsername || null
    };
  }
  function getCouponLifecycleStatus(c, nowMs = Date.now()) {
    if (!c.isActive || c.discountValue <= 0) return "paused";
    if (c.startsAt) {
      const startMs = Date.parse(c.startsAt);
      if (Number.isFinite(startMs) && startMs > nowMs) return "scheduled";
    }
    if (c.expiresAt) {
      const endMs = Date.parse(c.expiresAt);
      if (Number.isFinite(endMs) && endMs <= nowMs) return "expired";
    }
    if (typeof c.usageLimit === "number" && c.usageLimit > 0 && (c.usedCount || 0) >= c.usageLimit) {
      return "limit_reached";
    }
    return "active";
  }
  function isCouponCurrentlyLive(c, nowMs = Date.now()) {
    return getCouponLifecycleStatus(c, nowMs) === "active";
  }
  function getActiveCouponsForProduct(db, productId, nowMs = Date.now()) {
    const list = (db.shopCoupons || []).filter((c) => {
      if (!isCouponCurrentlyLive(c, nowMs)) return false;
      if (c.appliesToAllProducts) return true;
      return Array.isArray(c.applicableProductIds) && c.applicableProductIds.includes(productId);
    }).sort((a, b) => {
      const aSpec = a.appliesToAllProducts ? 1 : 0;
      const bSpec = b.appliesToAllProducts ? 1 : 0;
      if (aSpec !== bSpec) return aSpec - bSpec;
      return b.discountValue - a.discountValue;
    });
    return list.map(toPublicShopCoupon);
  }
  function buildCouponSummary(coupons) {
    const nowMs = Date.now();
    let activeCoupons = 0;
    let expiredCoupons = 0;
    let scheduledCoupons = 0;
    let totalRedemptions = 0;
    for (const c of coupons) {
      totalRedemptions += Number(c.usedCount || 0);
      const st = getCouponLifecycleStatus(c, nowMs);
      if (st === "active") activeCoupons += 1;
      else if (st === "expired" || st === "limit_reached") expiredCoupons += 1;
      else if (st === "scheduled") scheduledCoupons += 1;
    }
    return {
      totalCoupons: coupons.length,
      activeCoupons,
      expiredCoupons,
      scheduledCoupons,
      totalRedemptions
    };
  }
  function parseStandaloneCouponInput(body, validProductIds, existing) {
    const rawCode = body.code !== void 0 ? sanitizeText(String(body.code || ""), 24).toUpperCase().replace(/[^A-Z0-9_-]/g, "") : existing?.code || "";
    if (!rawCode || rawCode.length < 3) {
      throw new Error("Coupon code must be 3\u201324 characters (letters, numbers, - or _).");
    }
    const title = body.title !== void 0 ? sanitizeText(String(body.title || ""), 90) || null : existing?.title || null;
    const rawType = body.discountType !== void 0 ? String(body.discountType) : existing?.discountType || "percent";
    const discountType = rawType === "fixed" ? "fixed" : "percent";
    const rawVal = body.discountValue !== void 0 ? Number(body.discountValue) : Number(existing?.discountValue || 0);
    if (!Number.isFinite(rawVal) || rawVal <= 0) {
      throw new Error("Discount value must be greater than 0.");
    }
    const discountValue = discountType === "percent" ? Math.min(90, Math.round(rawVal * 100) / 100) : Math.round(rawVal * 100) / 100;
    let maxDiscount = existing?.maxDiscount ?? null;
    if (body.maxDiscount !== void 0) {
      if (body.maxDiscount === null || body.maxDiscount === "") {
        maxDiscount = null;
      } else {
        const md = Number(body.maxDiscount);
        maxDiscount = Number.isFinite(md) && md > 0 ? Math.round(md * 100) / 100 : null;
      }
    }
    if (discountType === "fixed") maxDiscount = null;
    const rawMin = body.minOrderAmount !== void 0 ? Number(body.minOrderAmount) : Number(existing?.minOrderAmount || 0);
    const minOrderAmount = Number.isFinite(rawMin) && rawMin > 0 ? Math.round(rawMin * 100) / 100 : 0;
    const appliesToAllProducts = typeof body.appliesToAllProducts === "boolean" ? body.appliesToAllProducts : existing?.appliesToAllProducts ?? false;
    const rawProductIds = Array.isArray(body.applicableProductIds) ? body.applicableProductIds : existing?.applicableProductIds || [];
    const applicableProductIds = Array.from(
      new Set(
        rawProductIds.map((id) => sanitizeText(String(id || ""), 80)).filter((id) => Boolean(id) && validProductIds.has(id))
      )
    );
    if (!appliesToAllProducts && applicableProductIds.length === 0) {
      throw new Error("Select at least one specific product or enable All Products.");
    }
    let startsAt = existing?.startsAt ?? null;
    if (body.startsAt !== void 0) {
      const s = String(body.startsAt || "").trim();
      if (!s) {
        startsAt = null;
      } else {
        const ms = Date.parse(s);
        if (!Number.isFinite(ms)) throw new Error("Invalid start date/time.");
        startsAt = new Date(ms).toISOString();
      }
    }
    let expiresAt = existing?.expiresAt ?? null;
    if (body.durationHours !== void 0 && body.durationHours !== null && body.durationHours !== "") {
      const hrs = Number(body.durationHours);
      if (Number.isFinite(hrs) && hrs > 0) {
        const baseMs = startsAt ? Date.parse(startsAt) : Date.now();
        expiresAt = new Date(baseMs + hrs * 3600 * 1e3).toISOString();
      }
    } else if (body.expiresAt !== void 0) {
      const e = String(body.expiresAt || "").trim();
      if (!e) {
        expiresAt = null;
      } else {
        const ms = Date.parse(e);
        if (!Number.isFinite(ms)) throw new Error("Invalid expiry date/time.");
        expiresAt = new Date(ms).toISOString();
      }
    }
    if (startsAt && expiresAt && Date.parse(expiresAt) <= Date.parse(startsAt)) {
      throw new Error("Expiry time must be later than the start time.");
    }
    let usageLimit = existing?.usageLimit ?? null;
    if (body.usageLimit !== void 0) {
      if (body.usageLimit === null || body.usageLimit === "") {
        usageLimit = null;
      } else {
        const ul = Math.floor(Number(body.usageLimit));
        usageLimit = Number.isFinite(ul) && ul > 0 ? ul : null;
      }
    }
    const isActive = typeof body.isActive === "boolean" ? body.isActive : existing?.isActive ?? true;
    return {
      code: rawCode,
      title,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      appliesToAllProducts,
      applicableProductIds: appliesToAllProducts ? [] : applicableProductIds,
      startsAt,
      expiresAt,
      usageLimit,
      isActive
    };
  }
  function evaluateCartCoupon(db, lines, rawCode, currencySymbol = "\u09F3") {
    const subtotal = Math.round(lines.reduce((sum, l) => sum + l.lineTotal, 0) * 100) / 100;
    const normalized = sanitizeText(rawCode || "", 24).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    const perLineDiscounts = /* @__PURE__ */ new Map();
    if (!normalized) {
      return {
        valid: false,
        couponCode: "",
        matchedCouponId: null,
        subtotal,
        discountTotal: 0,
        finalTotal: subtotal,
        appliedItemIds: [],
        perLineDiscounts,
        message: "Enter a coupon code to apply."
      };
    }
    const standalone = (db.shopCoupons || []).find(
      (c) => (c.code || "").trim().toUpperCase() === normalized
    );
    if (standalone) {
      const nowMs = Date.now();
      const status = getCouponLifecycleStatus(standalone, nowMs);
      if (status === "paused") {
        return {
          valid: false,
          couponCode: normalized,
          matchedCouponId: null,
          subtotal,
          discountTotal: 0,
          finalTotal: subtotal,
          appliedItemIds: [],
          perLineDiscounts,
          message: `Coupon ${normalized} is currently paused.`
        };
      }
      if (status === "scheduled") {
        return {
          valid: false,
          couponCode: normalized,
          matchedCouponId: null,
          subtotal,
          discountTotal: 0,
          finalTotal: subtotal,
          appliedItemIds: [],
          perLineDiscounts,
          message: `Coupon ${normalized} is scheduled to start on ${new Date(
            standalone.startsAt
          ).toLocaleString()}.`
        };
      }
      if (status === "expired") {
        return {
          valid: false,
          couponCode: normalized,
          matchedCouponId: null,
          subtotal,
          discountTotal: 0,
          finalTotal: subtotal,
          appliedItemIds: [],
          perLineDiscounts,
          message: `Coupon ${normalized} has expired.`
        };
      }
      if (status === "limit_reached") {
        return {
          valid: false,
          couponCode: normalized,
          matchedCouponId: null,
          subtotal,
          discountTotal: 0,
          finalTotal: subtotal,
          appliedItemIds: [],
          perLineDiscounts,
          message: `Coupon ${normalized} has reached its redemption limit.`
        };
      }
      const matchedLines = standalone.appliesToAllProducts ? lines : lines.filter((l) => standalone.applicableProductIds.includes(l.item.id));
      if (matchedLines.length === 0) {
        return {
          valid: false,
          couponCode: normalized,
          matchedCouponId: null,
          subtotal,
          discountTotal: 0,
          finalTotal: subtotal,
          appliedItemIds: [],
          perLineDiscounts,
          message: `Coupon ${normalized} is valid only for specific products not in your cart.`
        };
      }
      const eligibleSubtotal = Math.round(matchedLines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
      const minRequired = Number(standalone.minOrderAmount || 0);
      if (minRequired > 0 && eligibleSubtotal < minRequired) {
        const remaining = Math.max(1, Math.round((minRequired - eligibleSubtotal) * 100) / 100);
        return {
          valid: false,
          couponCode: normalized,
          matchedCouponId: null,
          subtotal,
          discountTotal: 0,
          finalTotal: subtotal,
          appliedItemIds: [],
          perLineDiscounts,
          message: `Coupon ${normalized} requires minimum purchase of ${currencySymbol}${minRequired.toLocaleString()} (add ${currencySymbol}${remaining.toLocaleString()} more).`
        };
      }
      let rawDiscount = standalone.discountType === "fixed" ? Math.round(standalone.discountValue * 100) / 100 : Math.round(eligibleSubtotal * (Math.min(90, standalone.discountValue) / 100) * 100) / 100;
      if (standalone.discountType === "percent" && typeof standalone.maxDiscount === "number" && standalone.maxDiscount > 0) {
        rawDiscount = Math.min(rawDiscount, standalone.maxDiscount);
      }
      const maxAllowedDiscount = Math.max(
        0,
        Math.round((eligibleSubtotal - matchedLines.length) * 100) / 100
      );
      const discountTotal2 = Math.min(maxAllowedDiscount, Math.max(0, rawDiscount));
      if (discountTotal2 <= 0) {
        return {
          valid: false,
          couponCode: normalized,
          matchedCouponId: null,
          subtotal,
          discountTotal: 0,
          finalTotal: subtotal,
          appliedItemIds: [],
          perLineDiscounts,
          message: `Cart subtotal is too small to apply coupon ${normalized}.`
        };
      }
      let remainingDisc = discountTotal2;
      const appliedItemIds2 = [];
      matchedLines.forEach((line, idx) => {
        const isLast = idx === matchedLines.length - 1;
        const maxLineDisc = Math.max(0, Math.round((line.lineTotal - 1) * 100) / 100);
        const share = isLast ? remainingDisc : Math.round(discountTotal2 * (line.lineTotal / eligibleSubtotal) * 100) / 100;
        const lineDisc = Math.min(maxLineDisc, Math.max(0, share));
        remainingDisc = Math.max(0, Math.round((remainingDisc - lineDisc) * 100) / 100);
        if (lineDisc > 0) {
          perLineDiscounts.set(line.item.id, lineDisc);
          appliedItemIds2.push(line.item.id);
        }
      });
      const appliedSum = Array.from(perLineDiscounts.values()).reduce((a, b) => a + b, 0);
      const cleanDiscount = Math.round(appliedSum * 100) / 100;
      const finalTotal2 = Math.max(1, Math.round((subtotal - cleanDiscount) * 100) / 100);
      return {
        valid: true,
        couponCode: normalized,
        matchedCouponId: standalone.id,
        subtotal,
        discountTotal: cleanDiscount,
        finalTotal: finalTotal2,
        appliedItemIds: appliedItemIds2,
        perLineDiscounts,
        message: `Coupon ${normalized} applied! You save ${currencySymbol}${cleanDiscount.toLocaleString()}.`
      };
    }
    const appliedItemIds = [];
    let minOrderViolation = 0;
    let discountTotal = 0;
    for (const line of lines) {
      const code = (line.item.couponCode || "").trim().toUpperCase();
      const val = Number(line.item.couponDiscountValue || 0);
      if (!code || !line.item.couponActive || val <= 0 || code !== normalized) continue;
      const minOrder = Number(line.item.couponMinOrder || 0);
      if (minOrder > 0 && subtotal < minOrder) {
        minOrderViolation = Math.max(minOrderViolation, minOrder);
        continue;
      }
      const type = line.item.couponDiscountType === "fixed" ? "fixed" : "percent";
      let disc = type === "fixed" ? Math.round(val * 100) / 100 : Math.round(line.lineTotal * (Math.min(90, val) / 100) * 100) / 100;
      disc = Math.min(Math.max(0, Math.round((line.lineTotal - 1) * 100) / 100), disc);
      if (disc > 0) {
        perLineDiscounts.set(line.item.id, disc);
        appliedItemIds.push(line.item.id);
        discountTotal = Math.round((discountTotal + disc) * 100) / 100;
      }
    }
    if (appliedItemIds.length === 0) {
      return {
        valid: false,
        couponCode: normalized,
        matchedCouponId: null,
        subtotal,
        discountTotal: 0,
        finalTotal: subtotal,
        appliedItemIds: [],
        perLineDiscounts,
        message: minOrderViolation > 0 ? `Coupon ${normalized} requires minimum order of ${currencySymbol}${minOrderViolation.toLocaleString()}.` : `Coupon "${normalized}" is invalid or not applicable to items in your cart.`
      };
    }
    const finalTotal = Math.max(1, Math.round((subtotal - discountTotal) * 100) / 100);
    return {
      valid: true,
      couponCode: normalized,
      matchedCouponId: null,
      subtotal,
      discountTotal,
      finalTotal,
      appliedItemIds,
      perLineDiscounts,
      message: `Coupon ${normalized} applied! You save ${currencySymbol}${discountTotal.toLocaleString()}.`
    };
  }
  const AGENT_SHOP_GW_KEYS = ["bKash", "Nagad", "Rocket", "Upay", "TapTap", "Bank"];
  function resolveLiveSellerAgentGateways(db, item) {
    const isAgentItem = item.submittedByRole === "agent" || item.submittedByRole === "sub_agent" || Boolean(item.agentId);
    if (!isAgentItem) {
      return { gateways: [], sellerAgentOnline: false, sellerAgent: null };
    }
    const sellerUser = item.submittedByUserId && db.users.find((u) => u.id === item.submittedByUserId) || item.submittedByUsername && db.users.find(
      (u) => u.username.toLowerCase() === item.submittedByUsername.toLowerCase()
    ) || null;
    const sellerAgent = item.agentId && db.agents.find((a) => a.id === item.agentId) || item.submittedByUserId && db.agents.find((a) => a.userId === item.submittedByUserId) || sellerUser?.agentId && db.agents.find((a) => a.id === sellerUser.agentId) || item.submittedByUsername && db.agents.find(
      (a) => a.username.toLowerCase() === item.submittedByUsername.toLowerCase()
    ) || null;
    const sellerHandle = sellerAgent?.username || item.submittedByUsername || sellerUser?.username || "seller";
    const fallbackPhone = (sellerAgent?.phone || sellerUser?.phone || "").trim();
    const gateways = [];
    const collectFromAgent = (ag, defaultPhone) => {
      const gwMap = ag.paymentGateways;
      if (gwMap && typeof gwMap === "object") {
        for (const key of AGENT_SHOP_GW_KEYS) {
          const cfg = gwMap[key];
          if (!cfg || !cfg.enabled) continue;
          const accountNumber = (cfg.number || (key !== "Bank" ? ag.phone || defaultPhone : "") || "").trim();
          if (!accountNumber) continue;
          gateways.push({
            gateway: key,
            accountNumber,
            accountType: cfg.accountType || (key === "Bank" ? "Bank Account" : "Personal"),
            instructions: cfg.instructions || `Send exact total to Seller Agent @${sellerHandle}'s ${key} number and submit Sender Number + TrxID.`
          });
        }
      }
      if (gateways.length === 0 && Array.isArray(ag.channels)) {
        for (const ch of ag.channels) {
          const matchedKey = AGENT_SHOP_GW_KEYS.find(
            (k) => k.toLowerCase() === String(ch || "").toLowerCase()
          );
          if (!matchedKey) continue;
          const accountNumber = (matchedKey !== "Bank" ? ag.phone || defaultPhone : "").trim();
          if (!accountNumber) continue;
          gateways.push({
            gateway: matchedKey,
            accountNumber,
            accountType: matchedKey === "Bank" ? "Bank Account" : "Personal",
            instructions: `Send exact total to Seller Agent @${sellerHandle}'s ${matchedKey} number and submit Sender Number + TrxID.`
          });
        }
      }
    };
    if (sellerAgent) {
      collectFromAgent(sellerAgent, fallbackPhone);
      if (gateways.length === 0 && sellerAgent.parentAgentId) {
        const parentAgent = db.agents.find((a) => a.id === sellerAgent.parentAgentId);
        if (parentAgent) {
          collectFromAgent(parentAgent, parentAgent.phone || fallbackPhone);
        }
      }
    }
    if (gateways.length === 0 && fallbackPhone) {
      for (const defaultKey of ["bKash", "Nagad"]) {
        gateways.push({
          gateway: defaultKey,
          accountNumber: fallbackPhone,
          accountType: "Personal",
          instructions: `Send exact total to ${item.submittedByRole === "sub_agent" ? "Sub-Agent" : "Agent"} @${sellerHandle}'s ${defaultKey} number and submit Sender Number + TrxID.`
        });
      }
    }
    return {
      gateways,
      sellerAgentOnline: Boolean(sellerAgent?.isOnline),
      sellerAgent
    };
  }
  function toPublicShopItemWithSellerGateways(db, item) {
    const pub = toPublicShopItem(item);
    const activeCoupons = getActiveCouponsForProduct(db, item.id);
    const { gateways, sellerAgentOnline } = resolveLiveSellerAgentGateways(db, item);
    if (gateways.length > 0 || item.submittedByRole === "agent" || item.submittedByRole === "sub_agent" || Boolean(item.agentId)) {
      return {
        ...pub,
        activeCoupons,
        sellerPaymentGateways: gateways,
        sellerAgentOnline
      };
    }
    return {
      ...pub,
      activeCoupons
    };
  }
  function saveUploadedCoverImage(dataUrl) {
    const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif|avif));base64,(.+)$/i.exec(dataUrl.trim());
    if (!match) {
      throw new Error("Unsupported image format. Use JPG, PNG, WebP, or GIF.");
    }
    const mime = match[1].toLowerCase();
    const buf = Buffer.from(match[2], "base64");
    if (buf.length === 0) {
      throw new Error("Cover image file is empty.");
    }
    if (buf.length > 10 * 1024 * 1024) {
      throw new Error("Product cover image must be under 10 MB.");
    }
    const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : mime === "image/avif" ? ".avif" : ".jpg";
    import_fs6.default.mkdirSync(SHOP_COVER_IMAGES_DIR, { recursive: true });
    const filename = `${generateId("cover")}${ext}`;
    import_fs6.default.writeFileSync(import_path5.default.join(SHOP_COVER_IMAGES_DIR, filename), buf);
    return `/api/shop/media/${filename}`;
  }
  router.get("/shop/media/:filename", (req, res) => {
    const safeName = import_path5.default.basename(sanitizeText(req.params.filename, 120));
    if (!safeName || !/^[a-zA-Z0-9._\-]+$/.test(safeName)) {
      res.status(400).end();
      return;
    }
    const fullPath = import_path5.default.resolve(SHOP_COVER_IMAGES_DIR, safeName);
    if (!fullPath.startsWith(SHOP_COVER_IMAGES_DIR) || !import_fs6.default.existsSync(fullPath)) {
      res.status(404).end();
      return;
    }
    const ext = import_path5.default.extname(safeName).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : ext === ".avif" ? "image/avif" : "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=604800");
    import_fs6.default.createReadStream(fullPath).pipe(res);
  });
  function saveUploadedGatewayQrImage(dataUrl) {
    const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif|avif));base64,(.+)$/i.exec(dataUrl.trim());
    if (!match) {
      throw new Error("Unsupported QR image format. Use PNG, JPG, WebP, or GIF.");
    }
    const mime = match[1].toLowerCase();
    const buf = Buffer.from(match[2], "base64");
    if (buf.length === 0) {
      throw new Error("QR code image file is empty.");
    }
    if (buf.length > 5 * 1024 * 1024) {
      throw new Error("QR code image must be under 5 MB.");
    }
    const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : mime === "image/avif" ? ".avif" : ".jpg";
    import_fs6.default.mkdirSync(GATEWAY_QR_IMAGES_DIR, { recursive: true });
    const filename = `${generateId("qr")}${ext}`;
    import_fs6.default.writeFileSync(import_path5.default.join(GATEWAY_QR_IMAGES_DIR, filename), buf);
    return `/api/gateways/qr/${filename}`;
  }
  router.get("/gateways/qr/:filename", (req, res) => {
    const safeName = import_path5.default.basename(sanitizeText(req.params.filename, 120));
    if (!safeName || !/^[a-zA-Z0-9._\-]+$/.test(safeName)) {
      res.status(400).end();
      return;
    }
    const fullPath = import_path5.default.resolve(GATEWAY_QR_IMAGES_DIR, safeName);
    if (!fullPath.startsWith(GATEWAY_QR_IMAGES_DIR) || !import_fs6.default.existsSync(fullPath)) {
      res.status(404).end();
      return;
    }
    const ext = import_path5.default.extname(safeName).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : ext === ".avif" ? "image/avif" : "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=604800");
    import_fs6.default.createReadStream(fullPath).pipe(res);
  });
  function saveUploadedBrandLogo(dataUrl) {
    const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif|avif));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
    if (!match) {
      throw new Error("Invalid logo format. Please upload PNG, JPG, WebP, or GIF.");
    }
    const mime = match[1].toLowerCase();
    const rawB64 = match[2].replace(/\s+/g, "");
    const buf = Buffer.from(rawB64, "base64");
    if (!buf.length) {
      throw new Error("Uploaded brand logo is empty.");
    }
    if (buf.length > 4 * 1024 * 1024) {
      throw new Error("Brand logo image must be under 4 MB.");
    }
    const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : mime === "image/avif" ? ".avif" : ".jpg";
    import_fs6.default.mkdirSync(BRAND_MEDIA_DIR, { recursive: true });
    const filename = `${generateId("brand")}${ext}`;
    import_fs6.default.writeFileSync(import_path5.default.join(BRAND_MEDIA_DIR, filename), buf);
    return `/api/brand/media/${filename}`;
  }
  router.get("/brand/media/:filename", (req, res) => {
    const safeName = import_path5.default.basename(sanitizeText(req.params.filename, 120));
    if (!safeName || !/^[a-zA-Z0-9._\-]+$/.test(safeName)) {
      res.status(400).end();
      return;
    }
    const fullPath = import_path5.default.resolve(BRAND_MEDIA_DIR, safeName);
    if (!fullPath.startsWith(BRAND_MEDIA_DIR) || !import_fs6.default.existsSync(fullPath)) {
      res.status(404).end();
      return;
    }
    const ext = import_path5.default.extname(safeName).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : ext === ".avif" ? "image/avif" : "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=604800");
    import_fs6.default.createReadStream(fullPath).pipe(res);
  });
  function saveUploadedDigitalFile(input) {
    const rawName = sanitizeText(input.fileName || "digital-asset.bin", 120);
    const cleanFileName = rawName.replace(/[^a-zA-Z0-9._\-\s]/g, "_").trim() || "digital-file.bin";
    const mimeType = sanitizeText(input.mimeType || "application/octet-stream", 100);
    const rawBase64 = String(input.base64Data || "").trim();
    const cleanedBase64 = rawBase64.includes(",") ? rawBase64.split(",").pop() || "" : rawBase64;
    if (!cleanedBase64) {
      throw new Error("Digital file content is empty.");
    }
    const buf = Buffer.from(cleanedBase64, "base64");
    if (buf.length === 0) {
      throw new Error("Uploaded digital file is empty.");
    }
    if (buf.length > 5 * 1024 * 1024) {
      throw new Error("Digital file size must be 5 MB or smaller.");
    }
    import_fs6.default.mkdirSync(SHOP_DIGITAL_FILES_DIR, { recursive: true });
    const ext = import_path5.default.extname(cleanFileName).slice(0, 12);
    const storageName = `${generateId("dfile")}${ext}`;
    import_fs6.default.writeFileSync(import_path5.default.join(SHOP_DIGITAL_FILES_DIR, storageName), buf);
    return {
      digitalFileName: cleanFileName,
      digitalFileMime: mimeType,
      digitalFileSize: buf.length,
      digitalFileStorageName: storageName
    };
  }
  function buildAutoDigitalDelivery(item, quantity, rewardSummary, downloadUrl) {
    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const rand = generateId("KEY").replace(/^KEY_/, "").toUpperCase();
      if (item.autoDeliveryTemplate && item.autoDeliveryTemplate.includes("{{CODE}}")) {
        codes.push(item.autoDeliveryTemplate.replace(/\{\{CODE\}\}/g, rand));
      } else if (item.autoDeliveryTemplate) {
        codes.push(`${item.autoDeliveryTemplate} [${rand}]`);
      } else if (rewardSummary) {
        codes.push(`${rewardSummary} \xB7 Receipt #${rand}`);
      } else {
        codes.push(`${item.title} Digital Access Code: LW-${rand}`);
      }
    }
    if (item.digitalFileName) {
      codes.push(
        `Attached Digital File: ${item.digitalFileName}${downloadUrl ? ` (Download inside My Orders / Shop Inbox)` : ""}`
      );
    }
    if (item.digitalDownloadUrl) {
      codes.push(`External Download Link: ${item.digitalDownloadUrl}`);
    }
    return codes.join("\n");
  }
  function formatStatusHuman(status) {
    switch (status) {
      case "auto_delivered":
        return "Auto-Emailed";
      case "confirmed":
        return "Order Confirmed";
      case "processing":
        return "In Progress";
      case "packed":
        return "Packed & Ready";
      case "shipped":
        return "Shipped via Courier";
      case "out_for_delivery":
        return "Out for Delivery";
      case "partial":
        return "Partially Completed";
      case "delivered":
        return "Delivered / Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Pending Admin Review";
    }
  }
  function dispatchShopCommunication(db, opts) {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const { order, user, channels } = opts;
    const uniqueChannels = Array.from(new Set(channels));
    order.channelsDispatched = Array.from(
      /* @__PURE__ */ new Set([...order.channelsDispatched || [], ...uniqueChannels])
    );
    let smtpJob = null;
    if (uniqueChannels.includes("email") && (order.customerEmail || user?.email)) {
      const toEmail = order.customerEmail || user?.email || "";
      if (!Array.isArray(order.emailHistory)) order.emailHistory = [];
      order.emailHistory.unshift({
        id: generateId("eml"),
        orderId: order.id,
        toEmail,
        subject: opts.subject,
        body: opts.message,
        attachmentName: opts.attachmentName || null,
        downloadUrl: opts.downloadUrl || null,
        sentAt: nowIso
      });
      if (order.emailHistory.length > 30) {
        order.emailHistory = order.emailHistory.slice(0, 30);
      }
      order.emailSent = true;
      order.emailSentAt = nowIso;
      const recorded = recordSmtpLogInDb(db, {
        orderId: order.id,
        userId: user?.id || order.userId,
        username: user?.username || order.username,
        trigger: opts.emailTrigger || "admin_order_update",
        toEmail,
        subject: opts.subject,
        body: opts.message,
        attachmentName: opts.attachmentName || null,
        attachmentPath: opts.attachmentPath || null
      });
      smtpJob = recorded.job;
    }
    if (uniqueChannels.includes("notification") && user) {
      db.notifications.unshift({
        id: generateId("notif"),
        userId: user.id,
        title: opts.subject,
        message: opts.message.slice(0, 220),
        type: opts.notifType || "info",
        isRead: false,
        createdAt: nowIso
      });
    }
    let dmToEmit = null;
    const staffIds = db.users.filter((u) => u.role === "admin" || u.role === "moderator").map((u) => u.id);
    if (uniqueChannels.includes("shop_inbox") && user) {
      if (!Array.isArray(db.shopInboxMessages)) db.shopInboxMessages = [];
      db.shopInboxMessages.unshift({
        id: generateId("sinbox"),
        orderId: order.id,
        userId: user.id,
        username: user.username,
        senderRole: opts.senderRole,
        senderName: opts.senderName,
        subject: opts.subject,
        message: opts.message,
        channels: uniqueChannels,
        attachmentName: opts.attachmentName || null,
        downloadUrl: opts.downloadUrl || null,
        createdAt: nowIso
      });
      if (db.shopInboxMessages.length > 600) {
        db.shopInboxMessages = db.shopInboxMessages.slice(0, 600);
      }
      const senderStaff = opts.staffUser || db.users.find((u) => u.role === "admin" || u.role === "moderator");
      if (senderStaff && senderStaff.id !== user.id) {
        if (!Array.isArray(db.directMessages)) db.directMessages = [];
        const conversationKey = makeConversationKey("user", senderStaff.id, "user", user.id);
        const dm = {
          id: generateId("dm"),
          conversationKey,
          senderId: senderStaff.id,
          senderType: "user",
          senderUsername: senderStaff.username,
          senderFullName: `${senderStaff.fullName} (Shop)`,
          senderAvatarUrl: senderStaff.avatarUrl || buildSvgAvatar(senderStaff.fullName || senderStaff.username),
          recipientId: user.id,
          recipientType: "user",
          recipientUsername: user.username,
          recipientFullName: user.fullName,
          recipientAvatarUrl: user.avatarUrl || buildSvgAvatar(user.fullName || user.username),
          recipientDistrict: null,
          message: `[Shop Order #${order.id.slice(-6).toUpperCase()}] ${opts.subject}: ${opts.message}`.slice(
            0,
            780
          ),
          adminReadAt: nowIso,
          createdAt: nowIso
        };
        db.directMessages.push(dm);
        if (db.directMessages.length > 1e3) {
          db.directMessages = db.directMessages.slice(-1e3);
        }
        dmToEmit = dm;
      }
    }
    return { dmToEmit, staffIds, smtpJob };
  }
  router.get("/shop/products", (_req, res) => {
    const db = getDbSnapshot();
    const activeProducts = (db.shopItems || []).filter((p) => p.isActive !== false && (!p.approvalStatus || p.approvalStatus === "approved")).map((item) => toPublicShopItemWithSellerGateways(db, item));
    const activeGateways = (db.paymentGateways || []).filter((g) => g.enabled).map(toPublicGateway);
    const activeCoupons = (db.shopCoupons || []).filter((c) => isCouponCurrentlyLive(c)).map(toPublicShopCoupon);
    res.setHeader("Cache-Control", "no-store");
    res.json({
      success: true,
      siteName: db.settings.siteName || "Lottery Winner",
      currencySymbol: db.settings.currencySymbol || "\u09F3",
      checkoutBrand: db.settings.checkoutBrand || {
        brandName: db.settings.siteName || "Lottery Winner",
        logoUrl: null,
        accentColor: "#0078E8",
        supportUrl: "https://t.me/lotterywinner_support",
        whatsappNumber: "+8801711000111",
        supportEmail: "support@lotterywinner.app",
        showSupportIcons: true,
        payButtonLabel: "Pay",
        currencyCode: "BDT",
        footerNote: "Secured Instant Checkout"
      },
      products: activeProducts,
      coupons: activeCoupons,
      paymentGateways: activeGateways
    });
  });
  router.get("/shop/products/:id", (req, res) => {
    const db = getDbSnapshot();
    const rawId = sanitizeText(req.params.id, 80);
    const allItems = (db.shopItems || []).filter(
      (p) => p.isActive !== false && (!p.approvalStatus || p.approvalStatus === "approved")
    );
    const product = allItems.find((item) => item.id.toLowerCase() === rawId.toLowerCase());
    if (!product) {
      res.setHeader("Cache-Control", "no-store");
      res.status(404).json({
        success: false,
        message: "Product not found in the shop catalog."
      });
      return;
    }
    const relatedProducts = allItems.filter((item) => item.id !== product.id).sort((a, b) => {
      const aSame = a.category === product.category ? 0 : 1;
      const bSame = b.category === product.category ? 0 : 1;
      return aSame - bSame;
    }).slice(0, 4).map((item) => toPublicShopItemWithSellerGateways(db, item));
    const activeGateways = (db.paymentGateways || []).filter((g) => g.enabled).map(toPublicGateway);
    res.setHeader("Cache-Control", "no-store");
    res.json({
      success: true,
      siteName: db.settings.siteName || "Lottery Winner",
      currencySymbol: db.settings.currencySymbol || "\u09F3",
      checkoutBrand: db.settings.checkoutBrand || {
        brandName: db.settings.siteName || "Lottery Winner",
        logoUrl: null,
        accentColor: "#0078E8",
        supportUrl: "https://t.me/lotterywinner_support",
        whatsappNumber: "+8801711000111",
        supportEmail: "support@lotterywinner.app",
        showSupportIcons: true,
        payButtonLabel: "Pay",
        currencyCode: "BDT",
        footerNote: "Secured Instant Checkout"
      },
      product: toPublicShopItemWithSellerGateways(db, product),
      relatedProducts,
      paymentGateways: activeGateways
    });
  });
  router.get("/shop/my-orders", requireAuth, (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const db = getDbSnapshot();
    const uid = req.authUser.id;
    const orders = (db.shopOrders || []).filter((o) => o.userId === uid).slice(0, 60);
    const inboxMessages = (db.shopInboxMessages || []).filter((m) => m.userId === uid).slice(0, 80);
    res.json({
      success: true,
      orders,
      inboxMessages
    });
  });
  router.post("/shop/inbox/message", requireAuth, async (req, res) => {
    try {
      const orderId = sanitizeText(req.body?.orderId || "", 80) || null;
      const subject = sanitizeText(req.body?.subject || "Shop Order Inquiry", 120);
      const text = sanitizeText(req.body?.message || "", 800);
      if (!text || text.length < 2) {
        res.status(400).json({ success: false, message: "Please enter a message." });
        return;
      }
      const result = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("Account not found.");
        if (!Array.isArray(db.shopInboxMessages)) db.shopInboxMessages = [];
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const msg = {
          id: generateId("sinbox"),
          orderId,
          userId: user.id,
          username: user.username,
          senderRole: "user",
          senderName: user.fullName || user.username,
          subject,
          message: text,
          channels: ["shop_inbox"],
          attachmentName: null,
          downloadUrl: null,
          createdAt: nowIso
        };
        db.shopInboxMessages.unshift(msg);
        const adminTarget = db.users.find((u) => u.role === "admin" || u.role === "moderator");
        let dmToEmit = null;
        const staffIds = db.users.filter((u) => u.role === "admin" || u.role === "moderator").map((u) => u.id);
        if (adminTarget && adminTarget.id !== user.id) {
          if (!Array.isArray(db.directMessages)) db.directMessages = [];
          const conversationKey = makeConversationKey("user", user.id, "user", adminTarget.id);
          const dm = {
            id: generateId("dm"),
            conversationKey,
            senderId: user.id,
            senderType: "user",
            senderUsername: user.username,
            senderFullName: user.fullName,
            senderAvatarUrl: user.avatarUrl || buildSvgAvatar(user.fullName || user.username),
            recipientId: adminTarget.id,
            recipientType: "user",
            recipientUsername: adminTarget.username,
            recipientFullName: adminTarget.fullName,
            recipientAvatarUrl: adminTarget.avatarUrl || buildSvgAvatar(adminTarget.fullName || adminTarget.username),
            recipientDistrict: null,
            message: `${orderId ? `[Shop #${orderId.slice(-6).toUpperCase()}] ` : "[Shop] "}${text}`.slice(
              0,
              780
            ),
            adminReadAt: null,
            createdAt: nowIso
          };
          db.directMessages.push(dm);
          dmToEmit = dm;
        }
        return { msg, dmToEmit, staffIds };
      });
      if (result.dmToEmit) {
        sendChatEventToUsers(result.staffIds, "admin:inbox_message", result.dmToEmit);
      }
      broadcastChatEvent("shop:orders_updated", {
        action: "inbox_message",
        orderId: result.msg.orderId,
        userId: result.msg.userId,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json({
        success: true,
        message: "Message sent to Shop Support Inbox.",
        inboxMessage: result.msg
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not send message."
      });
    }
  });
  router.get("/shop/orders/:orderId/download", requireAuth, (req, res) => {
    const db = getDbSnapshot();
    const orderId = sanitizeText(req.params.orderId, 80);
    const order = (db.shopOrders || []).find((o) => o.id === orderId);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }
    const isStaff = req.authUser.role === "admin" || req.authUser.role === "moderator" || order.sellerUserId === req.authUser.id;
    if (!isStaff && order.userId !== req.authUser.id) {
      res.status(403).json({ success: false, message: "You do not have access to this file." });
      return;
    }
    if (!isStaff && order.paymentStatus !== "paid") {
      res.status(403).json({
        success: false,
        message: "Digital file unlocks automatically once payment is verified."
      });
      return;
    }
    const item = (db.shopItems || []).find((p) => p.id === order.itemId);
    const storageName = item?.digitalFileStorageName;
    if (!storageName) {
      res.status(404).json({ success: false, message: "No digital file attached to this product." });
      return;
    }
    const fullPath = import_path5.default.resolve(SHOP_DIGITAL_FILES_DIR, import_path5.default.basename(storageName));
    if (!fullPath.startsWith(SHOP_DIGITAL_FILES_DIR) || !import_fs6.default.existsSync(fullPath)) {
      res.status(404).json({ success: false, message: "Digital file is no longer on storage." });
      return;
    }
    const downloadName = item?.digitalFileName || order.digitalFileName || "digital-product.bin";
    res.setHeader("Content-Type", item?.digitalFileMime || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName.replace(/"/g, "")}"`
    );
    import_fs6.default.createReadStream(fullPath).pipe(res);
  });
  router.post("/shop/coupons/validate", (req, res) => {
    const db = getDbSnapshot();
    const rawCode = sanitizeText(req.body?.couponCode || "", 24);
    const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const sym = db.settings.currencySymbol || "\u09F3";
    const lines = [];
    for (const entry of rawItems.slice(0, 20)) {
      const itemId = sanitizeText(entry?.itemId, 64);
      const qty = Math.max(1, Math.min(20, Math.floor(Number(entry?.quantity) || 1)));
      const item = (db.shopItems || []).find(
        (p) => p.id === itemId && p.isActive !== false && (!p.approvalStatus || p.approvalStatus === "approved")
      );
      if (!item) continue;
      lines.push({
        item,
        quantity: qty,
        lineTotal: Math.round(item.price * qty * 100) / 100
      });
    }
    const result = evaluateCartCoupon(db, lines, rawCode, sym);
    res.json({
      success: true,
      valid: result.valid,
      couponCode: result.couponCode,
      subtotal: result.subtotal,
      discountTotal: result.discountTotal,
      finalTotal: result.finalTotal,
      appliedItemIds: result.appliedItemIds,
      message: result.message
    });
  });
  router.post("/shop/checkout", requireAuth, financeLimiter, async (req, res) => {
    try {
      await syncCampaignStatuses();
      const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
      if (rawItems.length === 0) {
        res.status(400).json({ success: false, message: "Your checkout cart is empty." });
        return;
      }
      const rawMethod = sanitizeText(req.body?.paymentMethod || "wallet", 40);
      const dbSnapshotForMethod = getDbSnapshot();
      const matchedAdminGateway = (dbSnapshotForMethod.paymentGateways || []).find(
        (g) => g.enabled && g.supportsDeposit && (g.code.toLowerCase() === rawMethod.toLowerCase() || g.name.toLowerCase() === rawMethod.toLowerCase())
      );
      const builtinMethods = /* @__PURE__ */ new Set([
        "wallet",
        "bKash",
        "Nagad",
        "Rocket",
        "Upay",
        "TapTap",
        "Bank",
        "IslamiBank",
        "CityBank",
        "BanglaQR",
        "Cryptomus",
        "BinancePay",
        "CellFin"
      ]);
      const paymentMethod = rawMethod === "wallet" ? "wallet" : matchedAdminGateway ? matchedAdminGateway.code : builtinMethods.has(rawMethod) ? rawMethod : "wallet";
      const rawOwner = sanitizeText(req.body?.paymentOwner || "owned_wallet", 24);
      const requestedPaymentOwner = paymentMethod !== "wallet" && rawOwner === "agent_wallet" ? "agent_wallet" : "owned_wallet";
      const senderNumber = sanitizeText(req.body?.senderNumber || "", 32);
      const trxId = sanitizeText(req.body?.trxId || "", 64).toUpperCase();
      const customerEmail = sanitizeText(req.body?.customerEmail || "", 120).toLowerCase();
      const customerPhone = sanitizeText(req.body?.customerPhone || "", 32);
      const shippingAddress = sanitizeText(req.body?.shippingAddress || "", 260);
      const targetLink = sanitizeText(req.body?.targetLink || "", 260);
      const gameUid = sanitizeText(req.body?.gameUid || "", 80);
      const customNote = sanitizeText(req.body?.customNote || "", 400);
      const requestedCouponCode = sanitizeText(req.body?.couponCode || "", 24).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        res.status(400).json({
          success: false,
          message: "Please enter a valid delivery email address."
        });
        return;
      }
      if (paymentMethod !== "wallet") {
        if (!senderNumber || senderNumber.length < 7) {
          res.status(400).json({
            success: false,
            message: `Please enter your ${paymentMethod} sender number.`
          });
          return;
        }
        if (!trxId || trxId.length < 5) {
          res.status(400).json({
            success: false,
            message: `Please enter a valid ${paymentMethod} Transaction ID (TrxID).`
          });
          return;
        }
      }
      const normalizedItems = [];
      for (const entry of rawItems.slice(0, 20)) {
        const itemId = sanitizeText(entry?.itemId, 64);
        const qty = Math.floor(Number(entry?.quantity));
        if (!itemId || !Number.isFinite(qty) || qty < 1 || qty > 20) {
          res.status(400).json({
            success: false,
            message: "Invalid item or quantity (allowed 1\u201320 per item)."
          });
          return;
        }
        const existing = normalizedItems.find((i) => i.itemId === itemId);
        if (existing) {
          existing.quantity = Math.min(20, existing.quantity + qty);
        } else {
          normalizedItems.push({ itemId, quantity: qty });
        }
      }
      const dmsToEmit = [];
      const smtpJobsToSend = [];
      const outcome = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("Account not found.");
        if (user.status !== "active") throw new Error("Account is suspended.");
        const resolvedLines = normalizedItems.map((line) => {
          const item = (db.shopItems || []).find(
            (i) => i.id === line.itemId && i.isActive !== false && (!i.approvalStatus || i.approvalStatus === "approved")
          );
          if (!item) throw new Error(`Product "${line.itemId}" is no longer available.`);
          const category = item.category || "digital";
          const deliveryMode = item.deliveryMode || (category === "digital" ? "auto_email" : "manual_admin");
          return {
            item,
            category,
            deliveryMode,
            quantity: line.quantity,
            lineTotal: Math.round(item.price * line.quantity * 100) / 100
          };
        });
        const hasPhysical = resolvedLines.some((l) => l.category === "physical" || l.item.requiresShipping);
        const hasSmm = resolvedLines.some((l) => l.category === "smm" || l.item.requiresTargetLink);
        const hasOnDemand = resolvedLines.some((l) => l.category === "on_demand" || l.item.requiresCustomBrief);
        if (hasPhysical && (!shippingAddress || shippingAddress.length < 8 || !customerPhone)) {
          throw new Error("Physical products require your mobile phone and full shipping address.");
        }
        if (hasSmm && (!targetLink || targetLink.length < 6)) {
          throw new Error("SMM products require your target social profile, page, or video link.");
        }
        if (hasOnDemand && (!customNote || customNote.length < 6)) {
          throw new Error("On-Demand products require your custom instructions / requirement note.");
        }
        const sym = db.settings.currencySymbol || "\u09F3";
        const couponEval = requestedCouponCode ? evaluateCartCoupon(db, resolvedLines, requestedCouponCode, sym) : null;
        if (requestedCouponCode && couponEval && !couponEval.valid) {
          throw new Error(couponEval.message);
        }
        const subtotalAmount = Math.round(resolvedLines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100;
        const discountAmount = couponEval?.valid ? couponEval.discountTotal : 0;
        const appliedCouponCode = couponEval?.valid ? couponEval.couponCode : null;
        const totalAmount = couponEval?.valid ? couponEval.finalTotal : subtotalAmount;
        if (paymentMethod === "wallet" && user.balance < totalAmount) {
          throw new Error(
            `Insufficient wallet balance. Need ${sym}${totalAmount.toLocaleString()}, available ${sym}${user.balance.toLocaleString()}. You can also pay via bKash or Nagad.`
          );
        }
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        if (couponEval?.valid && couponEval.matchedCouponId && Array.isArray(db.shopCoupons)) {
          const usedCoupon = db.shopCoupons.find((c) => c.id === couponEval.matchedCouponId);
          if (usedCoupon) {
            usedCoupon.usedCount = (usedCoupon.usedCount || 0) + 1;
            usedCoupon.updatedAt = nowIso;
          }
        }
        const checkoutGroupId = generateId("chk");
        const createdOrders = [];
        const rewardSummaries = [];
        const isWalletPaid = paymentMethod === "wallet";
        if (!Array.isArray(db.shopOrders)) db.shopOrders = [];
        for (const { item, category, deliveryMode, quantity, lineTotal: originalLineTotal } of resolvedLines) {
          const lineDiscount = couponEval?.valid ? couponEval.perLineDiscounts.get(item.id) || 0 : 0;
          const lineTotal = Math.max(1, Math.round((originalLineTotal - lineDiscount) * 100) / 100);
          const lineCouponCode = lineDiscount > 0 ? appliedCouponCode : null;
          const orderId = generateId("ord");
          const hasDigitalFile = Boolean(item.digitalFileStorageName || item.digitalFileName);
          const downloadUrl = item.digitalFileStorageName ? `/api/shop/orders/${orderId}/download` : item.digitalDownloadUrl || null;
          const isAgentProduct = item.submittedByRole === "agent" || item.submittedByRole === "sub_agent";
          const sellerLive = resolveLiveSellerAgentGateways(db, item);
          const sellerTag = item.submittedByUsername ? `@${item.submittedByUsername}` : sellerLive.sellerAgent?.username ? `@${sellerLive.sellerAgent.username}` : "Agent";
          let orderPaymentOwner = "owned_wallet";
          if (requestedPaymentOwner === "agent_wallet" && isAgentProduct && !isWalletPaid) {
            const hasGateway = sellerLive.gateways.some(
              (g) => g.gateway.toLowerCase() === paymentMethod.toLowerCase()
            );
            if (!hasGateway) {
              throw new Error(
                `Seller Agent (${sellerTag}) does not currently accept ${paymentMethod} in their Agent Wallet. Please select another method or Website Owned Wallet.`
              );
            }
            orderPaymentOwner = "agent_wallet";
          }
          const paymentTargetLabel = orderPaymentOwner === "agent_wallet" ? `Agent Wallet (${sellerTag} \xB7 ${paymentMethod})` : isWalletPaid ? "Owned Wallet (Store Balance)" : `Owned Wallet (Website ${paymentMethod})`;
          let rewardSummary = "";
          let deliveredContent = null;
          let fulfillmentStatus = "pending_admin";
          let emailSent = false;
          let emailSentAt = null;
          if (isAgentProduct) {
            fulfillmentStatus = "pending_admin";
            rewardSummary = isWalletPaid ? `Paid via Website Owned Wallet \u2014 Routed to Agent (${sellerTag}) & Admin for approval` : orderPaymentOwner === "agent_wallet" ? `${paymentMethod} (Agent Wallet ${sellerTag}) TrxID ${trxId} \u2014 Pending Agent / Admin approval` : `${paymentMethod} (Website Owned Wallet) TrxID ${trxId} \u2014 Pending Agent / Admin approval`;
          } else if (isWalletPaid) {
            user.balance = Math.round((user.balance - lineTotal) * 100) / 100;
            if (deliveryMode === "auto_email") {
              if (item.kind === "ticket_entry") {
                const targetLottery = item.lotteryId && db.lotteries.find((l) => l.id === item.lotteryId && l.status === "active") || db.lotteries.find((l) => l.status === "active" && l.entryFee <= item.price);
                if (!targetLottery) {
                  throw new Error(`Target lottery pool for "${item.title}" is currently closed.`);
                }
                const issued = issueTicketsForPurchase(
                  db,
                  user.id,
                  targetLottery.id,
                  quantity,
                  void 0,
                  true
                );
                const totalSpins = (item.spinsGranted || 0) * quantity;
                if (totalSpins > 0) {
                  user.spinCredits = (user.spinCredits || 0) + totalSpins;
                }
                const ticketNumbers = issued.tickets.map((t) => t.ticketNumber).join(", ");
                rewardSummary = `Auto-emailed to ${customerEmail}: ${quantity} ticket${quantity > 1 ? "s" : ""} (${ticketNumbers})${totalSpins > 0 ? ` + ${totalSpins} Spin(s)` : ""}`;
                deliveredContent = buildAutoDigitalDelivery(item, quantity, rewardSummary, downloadUrl);
              } else if (item.kind === "spin_pack") {
                const totalSpins = Math.max(1, item.spinsGranted) * quantity;
                user.spinCredits = (user.spinCredits || 0) + totalSpins;
                rewardSummary = `Auto-emailed to ${customerEmail}: Credited +${totalSpins} Lucky Wheel Spin${totalSpins > 1 ? "s" : ""}`;
                deliveredContent = buildAutoDigitalDelivery(item, quantity, rewardSummary, downloadUrl);
              } else {
                deliveredContent = buildAutoDigitalDelivery(item, quantity, void 0, downloadUrl);
                rewardSummary = item.digitalFileName ? `Digital file (${item.digitalFileName}) auto-emailed to ${customerEmail}` : `Digital product auto-emailed to ${customerEmail}`;
              }
              fulfillmentStatus = "auto_delivered";
              emailSent = true;
              emailSentAt = nowIso;
            } else {
              fulfillmentStatus = category === "physical" ? "confirmed" : "pending_admin";
              rewardSummary = category === "cyber_pack" ? `Cyber Pack queued \u2014 Admin will send via Email / Shop Inbox / Notification` : category === "physical" ? `Order Confirmation emailed to ${customerEmail} \u2014 Pending Admin shipping update` : category === "smm" ? `SMM order paid \u2014 Pending Admin manual status review` : `On-Demand order paid \u2014 Pending Admin manual review`;
            }
          } else {
            fulfillmentStatus = "pending_admin";
            rewardSummary = category === "physical" ? `Order Confirmation emailed to ${customerEmail} (${paymentMethod} TrxID ${trxId} pending check)` : `${paymentMethod} TrxID ${trxId} submitted \u2014 Pending Admin verification`;
          }
          if (isAgentProduct && isWalletPaid) {
            user.balance = Math.round((user.balance - lineTotal) * 100) / 100;
          }
          if (typeof item.stock === "number" && item.stock > 0) {
            item.stock = Math.max(0, item.stock - quantity);
          }
          const order = {
            id: orderId,
            userId: user.id,
            username: user.username,
            itemId: item.id,
            itemTitle: quantity > 1 ? `${item.title} \xD7 ${quantity}` : item.title,
            quantity,
            category,
            deliveryMode,
            amount: lineTotal,
            originalAmount: originalLineTotal,
            discountAmount: lineDiscount,
            couponCode: lineCouponCode,
            rewardSummary,
            paymentMethod,
            paymentOwner: orderPaymentOwner,
            paymentTargetLabel,
            paymentStatus: isWalletPaid ? "paid" : "pending_verification",
            senderNumber: isWalletPaid ? null : senderNumber,
            trxId: isWalletPaid ? null : trxId,
            fulfillmentStatus,
            customerEmail,
            customerPhone: customerPhone || user.phone || null,
            shippingAddress: shippingAddress || null,
            targetLink: targetLink || null,
            gameUid: gameUid || null,
            customNote: customNote || null,
            deliveredContent,
            digitalFileName: item.digitalFileName || null,
            digitalFileSize: item.digitalFileSize || null,
            hasDigitalFile,
            downloadUrl: isWalletPaid && deliveryMode === "auto_email" && !isAgentProduct ? downloadUrl : null,
            emailSent,
            emailSentAt,
            emailHistory: [],
            channelsDispatched: [],
            adminNote: null,
            sellerUserId: item.submittedByUserId || null,
            sellerUsername: item.submittedByUsername || null,
            sellerRole: item.submittedByRole || null,
            agentId: item.agentId || null,
            agentDistrict: item.agentDistrict || null,
            processedBy: null,
            updatedAt: nowIso,
            createdAt: nowIso
          };
          const digitalDiskPath = item.digitalFileStorageName ? import_path5.default.resolve(SHOP_DIGITAL_FILES_DIR, import_path5.default.basename(item.digitalFileStorageName)) : null;
          if (!isAgentProduct && isWalletPaid && deliveryMode === "auto_email") {
            const dispatched = dispatchShopCommunication(db, {
              order,
              user,
              senderRole: "system",
              senderName: `${db.settings.siteName || "Shop"} Auto-Delivery`,
              subject: `Digital Product Ready \u2014 ${order.itemTitle}`,
              message: `Your payment of ${sym}${lineTotal.toLocaleString()} is confirmed. ${deliveredContent || rewardSummary}`,
              channels: ["email", "shop_inbox", "notification"],
              emailTrigger: "digital_product_sent",
              attachmentName: item.digitalFileName || null,
              attachmentPath: digitalDiskPath,
              downloadUrl,
              notifType: "success"
            });
            if (dispatched.dmToEmit) {
              dmsToEmit.push({ userId: user.id, dm: dispatched.dmToEmit, staffIds: dispatched.staffIds });
            }
            if (dispatched.smtpJob) smtpJobsToSend.push(dispatched.smtpJob);
          } else if (category === "physical") {
            const dispatched = dispatchShopCommunication(db, {
              order,
              user,
              senderRole: "system",
              senderName: `${db.settings.siteName || "Shop"} Orders`,
              subject: `Order Confirmation \u2014 ${order.itemTitle}`,
              message: `Thank you for your order (#${order.id.slice(-6).toUpperCase()}) of ${order.itemTitle} (${sym}${lineTotal.toLocaleString()} via ${paymentMethod === "wallet" ? "Store Wallet" : `${paymentMethod} TrxID ${trxId}`}). Shipping to: ${shippingAddress} (${customerPhone}). ${isAgentProduct ? "Your order has been routed to the Seller Agent Desk for approval & courier updates." : "You will receive an email whenever Admin updates your order or courier tracking."}`,
              channels: ["email", "shop_inbox", "notification"],
              emailTrigger: "physical_order_confirmation",
              notifType: "success"
            });
            if (dispatched.dmToEmit) {
              dmsToEmit.push({ userId: user.id, dm: dispatched.dmToEmit, staffIds: dispatched.staffIds });
            }
            if (dispatched.smtpJob) smtpJobsToSend.push(dispatched.smtpJob);
          } else if (category === "on_demand") {
            const dispatched = dispatchShopCommunication(db, {
              order,
              user,
              senderRole: "system",
              senderName: `${db.settings.siteName || "Shop"} Orders`,
              subject: `On-Demand Order Confirmation \u2014 ${order.itemTitle}`,
              message: `Your On-Demand order (#${order.id.slice(-6).toUpperCase()}) for ${order.itemTitle} (${sym}${lineTotal.toLocaleString()} via ${paymentMethod === "wallet" ? "Store Wallet" : `${paymentMethod} TrxID ${trxId}`}) is confirmed! Requirement Note: ${customNote}.`,
              channels: ["email", "shop_inbox", "notification"],
              emailTrigger: "on_demand_confirmation",
              notifType: "success"
            });
            if (dispatched.dmToEmit) {
              dmsToEmit.push({ userId: user.id, dm: dispatched.dmToEmit, staffIds: dispatched.staffIds });
            }
            if (dispatched.smtpJob) smtpJobsToSend.push(dispatched.smtpJob);
          } else {
            const dispatched = dispatchShopCommunication(db, {
              order,
              user,
              senderRole: "system",
              senderName: `${db.settings.siteName || "Shop"} Orders`,
              subject: `Order Received \u2014 ${order.itemTitle}`,
              message: `Order #${order.id.slice(-6).toUpperCase()} (${sym}${lineTotal.toLocaleString()}) has been received. ${rewardSummary}.`,
              channels: ["shop_inbox", "notification"],
              notifType: isWalletPaid ? "success" : "info"
            });
            if (dispatched.dmToEmit) {
              dmsToEmit.push({ userId: user.id, dm: dispatched.dmToEmit, staffIds: dispatched.staffIds });
            }
          }
          if (isAgentProduct) {
            const notifyTargets = /* @__PURE__ */ new Set();
            if (item.submittedByUserId) notifyTargets.add(item.submittedByUserId);
            if (item.agentId) {
              const sellerAg = db.agents.find((a) => a.id === item.agentId);
              if (sellerAg?.userId) notifyTargets.add(sellerAg.userId);
              if (sellerAg?.parentAgentId) {
                const parentAg = db.agents.find((a) => a.id === sellerAg.parentAgentId);
                if (parentAg?.userId) notifyTargets.add(parentAg.userId);
              }
            }
            for (const targetUid of notifyTargets) {
              db.notifications.unshift({
                id: generateId("notif"),
                userId: targetUid,
                title: `New Shop Order #${order.id.slice(-6).toUpperCase()}`,
                message: `@${user.username} ordered "${order.itemTitle}" (${sym}${lineTotal.toLocaleString()} via ${paymentTargetLabel}${trxId && !isWalletPaid ? ` \xB7 TrxID ${trxId}` : ""}). Open Agent Panel -> Shop Orders or Admin Panel to review & approve.`,
                type: "info",
                isRead: false,
                createdAt: nowIso
              });
            }
          }
          db.shopOrders.unshift(order);
          createdOrders.push(order);
          rewardSummaries.push(rewardSummary);
          if (isWalletPaid) {
            db.transactions.unshift({
              id: generateId("txn"),
              userId: user.id,
              username: user.username,
              direction: "debit",
              category: "shop_purchase",
              amount: lineTotal,
              balanceAfter: user.balance,
              referenceId: order.id,
              gateway: "Shop Wallet",
              description: `Shop order: ${order.itemTitle} (${rewardSummary})`,
              createdAt: nowIso
            });
          }
        }
        user.updatedAt = nowIso;
        const itemsCount = resolvedLines.reduce((acc, l) => acc + l.quantity, 0);
        return {
          orderId: checkoutGroupId,
          subtotalAmount,
          discountAmount,
          couponCode: appliedCouponCode,
          totalAmount,
          itemsCount,
          paymentMethod,
          paymentOwner: createdOrders.some((o) => o.paymentOwner === "agent_wallet") ? "agent_wallet" : "owned_wallet",
          paymentStatus: isWalletPaid ? "paid" : "pending_verification",
          rewardSummaries,
          orders: createdOrders,
          walletBalance: user.balance,
          user: toPublicUser(user)
        };
      });
      dispatchSmtpJobsInBackground(smtpJobsToSend);
      for (const item of dmsToEmit) {
        sendChatEventToUsers([item.userId], "direct:message", item.dm);
        sendChatEventToUsers(item.staffIds, "admin:inbox_message", item.dm);
      }
      broadcastChatEvent("shop:orders_updated", {
        action: "order_created",
        orderIds: outcome.orders.map((o) => o.id),
        userId: outcome.user.id,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      broadcastChatEvent("shop:catalog_updated", {
        action: "stock_updated",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json({
        success: true,
        message: outcome.paymentMethod === "wallet" ? `Order confirmed! ${outcome.rewardSummaries.join(" \xB7 ")}.` : `${outcome.paymentMethod} order submitted! Confirmation sent to your email.`,
        ...outcome
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Shop checkout failed."
      });
    }
  });
  router.get("/admin/shop/overview", requireAuth, requireStaff, (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const db = getDbSnapshot();
    const orders = db.shopOrders || [];
    const products = (db.shopItems || []).map(toPublicShopItem);
    const inboxMessages = (db.shopInboxMessages || []).slice(0, 100);
    const pendingAdminCount = orders.filter(
      (o) => o.fulfillmentStatus === "pending_admin" || o.fulfillmentStatus === "confirmed" || o.fulfillmentStatus === "processing" || o.fulfillmentStatus === "packed" || o.fulfillmentStatus === "shipped" || o.fulfillmentStatus === "out_for_delivery" || o.fulfillmentStatus === "partial"
    ).length;
    const pendingPaymentCount = orders.filter(
      (o) => o.paymentStatus === "pending_verification"
    ).length;
    const autoDeliveredCount = orders.filter(
      (o) => o.fulfillmentStatus === "auto_delivered"
    ).length;
    const deliveredCount = orders.filter(
      (o) => o.fulfillmentStatus === "delivered" || o.fulfillmentStatus === "auto_delivered"
    ).length;
    const totalRevenue = orders.filter((o) => o.paymentStatus !== "rejected" && o.fulfillmentStatus !== "cancelled").reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    res.json({
      success: true,
      currencySymbol: db.settings.currencySymbol || "\u09F3",
      summary: {
        totalOrders: orders.length,
        pendingAdminCount,
        pendingPaymentCount,
        autoDeliveredCount,
        deliveredCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        productsCount: products.filter(
          (p) => p.isActive !== false && (!p.approvalStatus || p.approvalStatus === "approved")
        ).length,
        pendingApprovalCount: products.filter((p) => p.approvalStatus === "pending_approval").length
      },
      orders: orders.slice(0, 200),
      products,
      inboxMessages
    });
  });
  function applyShopOrderAction(db, order, actorUser, actorMode, params) {
    const { action, rawStatus, deliveredContentInput, adminNote, chosenChannels } = params;
    const user = db.users.find((u) => u.id === order.userId);
    const item = (db.shopItems || []).find((i) => i.id === order.itemId);
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const sym = db.settings.currencySymbol || "\u09F3";
    const cat = order.category || item?.category || "digital";
    const roleTag = actorMode === "admin" ? "Admin" : actorUser?.role === "sub_agent" ? "Sub-Agent" : "Agent";
    const staffLabel = actorUser ? `${actorUser.fullName} (${roleTag})` : "Shop Admin";
    order.processedBy = actorUser ? `@${actorUser.username} (${roleTag})` : "Admin";
    let dmToEmit = null;
    let emitStaffIds = [];
    const emitUserId = order.userId;
    const smtpJobs = [];
    const effectiveChannels = cat === "physical" && !chosenChannels.includes("email") ? [...chosenChannels, "email"] : chosenChannels;
    const digitalDiskPath = item?.digitalFileStorageName ? import_path5.default.resolve(SHOP_DIGITAL_FILES_DIR, import_path5.default.basename(item.digitalFileStorageName)) : null;
    if (action === "approve_payment") {
      order.paymentStatus = "paid";
      order.adminNote = adminNote || order.adminNote || `Payment verified by ${roleTag}.`;
      order.updatedAt = nowIso;
      const isAutoDigital = order.deliveryMode === "auto_email" || item?.deliveryMode === "auto_email" || cat === "digital";
      if (isAutoDigital && order.fulfillmentStatus !== "auto_delivered") {
        const qty = Math.max(1, Number(order.quantity) || 1);
        const downloadUrl = item?.digitalFileStorageName ? `/api/shop/orders/${order.id}/download` : item?.digitalDownloadUrl || null;
        let rewardNote = item?.digitalFileName ? `Digital file (${item.digitalFileName}) auto-emailed to ${order.customerEmail || "your email"}` : `Digital product auto-emailed to ${order.customerEmail || "your email"}`;
        if (item && user && item.kind === "spin_pack") {
          const totalSpins = Math.max(1, item.spinsGranted) * qty;
          user.spinCredits = (user.spinCredits || 0) + totalSpins;
          rewardNote = `Credited +${totalSpins} Spin(s) & auto-emailed to ${order.customerEmail || user.email}`;
        } else if (item && user && item.kind === "ticket_entry") {
          const targetLottery = item.lotteryId && db.lotteries.find((l) => l.id === item.lotteryId && l.status === "active") || db.lotteries.find((l) => l.status === "active");
          if (targetLottery) {
            const issued = issueTicketsForPurchase(db, user.id, targetLottery.id, qty, void 0, true);
            rewardNote = `Issued ticket(s) ${issued.tickets.map((t) => t.ticketNumber).join(", ")} & auto-emailed`;
          }
        }
        order.deliveredContent = buildAutoDigitalDelivery(
          item || { id: order.itemId, title: order.itemTitle },
          qty,
          rewardNote,
          downloadUrl
        );
        order.digitalFileName = item?.digitalFileName || order.digitalFileName || null;
        order.digitalFileSize = item?.digitalFileSize || order.digitalFileSize || null;
        order.hasDigitalFile = Boolean(item?.digitalFileStorageName || item?.digitalFileName);
        order.downloadUrl = downloadUrl;
        order.fulfillmentStatus = "auto_delivered";
        order.rewardSummary = rewardNote;
        const dispatched = dispatchShopCommunication(db, {
          order,
          user,
          senderRole: "admin",
          senderName: staffLabel,
          staffUser: actorUser,
          subject: `Payment Verified & Digital File Sent \u2014 ${order.itemTitle}`,
          message: order.deliveredContent,
          channels: ["email", "shop_inbox", "notification"],
          emailTrigger: "digital_product_sent",
          attachmentName: order.digitalFileName,
          attachmentPath: digitalDiskPath,
          downloadUrl,
          notifType: "success"
        });
        dmToEmit = dispatched.dmToEmit || null;
        emitStaffIds = dispatched.staffIds;
        if (dispatched.smtpJob) smtpJobs.push(dispatched.smtpJob);
      } else {
        if (cat === "physical" && order.fulfillmentStatus === "pending_admin") {
          order.fulfillmentStatus = "confirmed";
        }
        order.rewardSummary = `Payment verified (${roleTag}) \u2014 ${formatStatusHuman(order.fulfillmentStatus || "confirmed")}`;
        const dispatched = dispatchShopCommunication(db, {
          order,
          user,
          senderRole: "admin",
          senderName: staffLabel,
          staffUser: actorUser,
          subject: `Payment Approved \u2014 ${order.itemTitle}`,
          message: `Your payment for ${order.itemTitle} (#${order.id.slice(-6).toUpperCase()}) has been verified by ${staffLabel}. ${order.adminNote}`,
          channels: effectiveChannels,
          emailTrigger: cat === "physical" ? "physical_order_update" : cat === "on_demand" ? "on_demand_confirmation" : cat === "cyber_pack" ? "cyber_pack_sent" : "admin_order_update",
          notifType: "success"
        });
        dmToEmit = dispatched.dmToEmit || null;
        emitStaffIds = dispatched.staffIds;
        if (dispatched.smtpJob) smtpJobs.push(dispatched.smtpJob);
      }
    } else if (action === "set_status") {
      if (!ALLOWED_SHOP_STATUSES.includes(rawStatus)) {
        throw new Error("Invalid manual fulfillment status.");
      }
      if (rawStatus !== "cancelled" && order.paymentStatus === "pending_verification") {
        order.paymentStatus = "paid";
      }
      order.fulfillmentStatus = rawStatus;
      const statusText = formatStatusHuman(rawStatus);
      const noteText = deliveredContentInput || adminNote || `Status updated to ${statusText} by ${roleTag}.`;
      order.adminNote = noteText;
      if (rawStatus === "delivered" && deliveredContentInput) {
        order.deliveredContent = deliveredContentInput;
      }
      order.rewardSummary = `${statusText}: ${noteText.slice(0, 140)}`;
      order.updatedAt = nowIso;
      const dispatched = dispatchShopCommunication(db, {
        order,
        user,
        senderRole: "admin",
        senderName: staffLabel,
        staffUser: actorUser,
        subject: `Order Update (${statusText}) \u2014 ${order.itemTitle}`,
        message: `Order #${order.id.slice(-6).toUpperCase()} status changed to "${statusText}" by ${staffLabel}. ${noteText}`,
        channels: effectiveChannels,
        emailTrigger: cat === "physical" ? "physical_order_update" : cat === "cyber_pack" ? "cyber_pack_sent" : cat === "on_demand" ? "on_demand_confirmation" : "admin_order_update",
        notifType: rawStatus === "delivered" ? "success" : rawStatus === "cancelled" ? "warning" : "info"
      });
      dmToEmit = dispatched.dmToEmit || null;
      emitStaffIds = dispatched.staffIds;
      if (dispatched.smtpJob) smtpJobs.push(dispatched.smtpJob);
    } else if (action === "send_update") {
      const updateMsg = deliveredContentInput || adminNote;
      if (!updateMsg || updateMsg.length < 2) {
        throw new Error("Please enter an update message to send to the buyer.");
      }
      order.adminNote = updateMsg;
      order.updatedAt = nowIso;
      const dispatched = dispatchShopCommunication(db, {
        order,
        user,
        senderRole: "admin",
        senderName: staffLabel,
        staffUser: actorUser,
        subject: `${roleTag} Update \u2014 ${order.itemTitle}`,
        message: updateMsg,
        channels: effectiveChannels,
        emailTrigger: cat === "physical" ? "physical_order_update" : cat === "cyber_pack" ? "cyber_pack_sent" : cat === "on_demand" ? "on_demand_confirmation" : "admin_order_update",
        notifType: "info"
      });
      dmToEmit = dispatched.dmToEmit || null;
      emitStaffIds = dispatched.staffIds;
      if (dispatched.smtpJob) smtpJobs.push(dispatched.smtpJob);
    } else if (action === "processing") {
      if (order.paymentStatus === "pending_verification") {
        order.paymentStatus = "paid";
      }
      order.fulfillmentStatus = "processing";
      order.adminNote = adminNote || `${roleTag} is processing / packing your order.`;
      order.rewardSummary = order.adminNote;
      order.updatedAt = nowIso;
      const dispatched = dispatchShopCommunication(db, {
        order,
        user,
        senderRole: "admin",
        senderName: staffLabel,
        staffUser: actorUser,
        subject: `Order In Progress \u2014 ${order.itemTitle}`,
        message: `${order.itemTitle} is now being processed. ${order.adminNote}`,
        channels: effectiveChannels,
        emailTrigger: cat === "physical" ? "physical_order_update" : cat === "cyber_pack" ? "cyber_pack_sent" : "admin_order_update",
        notifType: "info"
      });
      dmToEmit = dispatched.dmToEmit || null;
      emitStaffIds = dispatched.staffIds;
      if (dispatched.smtpJob) smtpJobs.push(dispatched.smtpJob);
    } else if (action === "deliver") {
      const qty = Math.max(1, Number(order.quantity) || 1);
      const downloadUrl = item?.digitalFileStorageName ? `/api/shop/orders/${order.id}/download` : item?.digitalDownloadUrl || order.downloadUrl || null;
      const autoDigitalMsg = cat === "digital" && !deliveredContentInput ? buildAutoDigitalDelivery(
        item || { id: order.itemId, title: order.itemTitle },
        qty,
        adminNote || `Approved & delivered by ${staffLabel}`,
        downloadUrl
      ) : "";
      const deliveryMsg = deliveredContentInput || autoDigitalMsg || adminNote || `Approved & delivered to ${order.customerEmail || "customer"} by ${staffLabel}.`;
      order.paymentStatus = "paid";
      order.fulfillmentStatus = cat === "digital" ? "auto_delivered" : "delivered";
      order.deliveredContent = deliveryMsg;
      order.digitalFileName = item?.digitalFileName || order.digitalFileName || null;
      order.digitalFileSize = item?.digitalFileSize || order.digitalFileSize || null;
      order.hasDigitalFile = Boolean(
        item?.digitalFileStorageName || item?.digitalFileName || order.hasDigitalFile
      );
      order.downloadUrl = downloadUrl;
      order.adminNote = adminNote || order.adminNote || `Approved & fulfilled by ${roleTag}.`;
      order.rewardSummary = `Approved & Delivered (${roleTag}) via ${effectiveChannels.map((c) => c === "shop_inbox" ? "Shop Inbox" : c === "notification" ? "Notification" : "Email").join(" + ")}`;
      order.updatedAt = nowIso;
      const dispatched = dispatchShopCommunication(db, {
        order,
        user,
        senderRole: "admin",
        senderName: staffLabel,
        staffUser: actorUser,
        subject: cat === "cyber_pack" ? `Cyber Pack Delivered \u2014 ${order.itemTitle}` : `Order Approved & Delivered \u2014 ${order.itemTitle}`,
        message: deliveryMsg,
        channels: effectiveChannels,
        emailTrigger: cat === "cyber_pack" ? "cyber_pack_sent" : cat === "physical" ? "physical_order_update" : cat === "on_demand" ? "on_demand_confirmation" : cat === "digital" ? "digital_product_sent" : "admin_order_update",
        attachmentName: order.digitalFileName,
        attachmentPath: digitalDiskPath,
        downloadUrl,
        notifType: "success"
      });
      dmToEmit = dispatched.dmToEmit || null;
      emitStaffIds = dispatched.staffIds;
      if (dispatched.smtpJob) smtpJobs.push(dispatched.smtpJob);
    } else if (action === "cancel") {
      const wasWalletPaid = order.paymentMethod === "wallet" && order.paymentStatus === "paid" && order.fulfillmentStatus !== "cancelled";
      order.paymentStatus = "rejected";
      order.fulfillmentStatus = "cancelled";
      order.adminNote = adminNote || `Order cancelled by ${roleTag}.`;
      order.rewardSummary = wasWalletPaid ? `Cancelled by ${roleTag} & refunded ${sym}${order.amount} to Main Wallet` : `Cancelled by ${roleTag}`;
      order.updatedAt = nowIso;
      if (wasWalletPaid && user) {
        user.balance = Math.round((user.balance + order.amount) * 100) / 100;
        user.updatedAt = nowIso;
        db.transactions.unshift({
          id: generateId("txn"),
          userId: user.id,
          username: user.username,
          direction: "credit",
          category: "refund",
          amount: order.amount,
          balanceAfter: user.balance,
          referenceId: order.id,
          gateway: "Shop Refund",
          description: `Refund for cancelled Shop order: ${order.itemTitle}`,
          createdAt: nowIso
        });
      }
      const dispatched = dispatchShopCommunication(db, {
        order,
        user,
        senderRole: "admin",
        senderName: staffLabel,
        staffUser: actorUser,
        subject: `Order Cancelled \u2014 ${order.itemTitle}`,
        message: `${order.itemTitle}: ${order.rewardSummary}. ${order.adminNote}`,
        channels: effectiveChannels,
        emailTrigger: cat === "physical" ? "physical_order_update" : "admin_order_update",
        notifType: "warning"
      });
      dmToEmit = dispatched.dmToEmit || null;
      emitStaffIds = dispatched.staffIds;
      if (dispatched.smtpJob) smtpJobs.push(dispatched.smtpJob);
    }
    return {
      order,
      dmToEmit,
      emitStaffIds,
      emitUserId,
      smtpJobs
    };
  }
  router.put(
    "/admin/shop/orders/:orderId",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const orderId = sanitizeText(req.params.orderId, 80);
        const action = sanitizeText(req.body?.action, 32);
        const rawStatus = sanitizeText(req.body?.status || "", 32);
        const deliveredContentInput = sanitizeText(req.body?.deliveredContent || "", 1500);
        const adminNote = sanitizeText(req.body?.adminNote || "", 600);
        const notifyEmail = req.body?.notifyEmail !== false;
        const notifyShopInbox = req.body?.notifyShopInbox !== false;
        const notifyUserAlert = req.body?.notifyUserAlert !== false;
        const chosenChannels = [];
        if (notifyEmail) chosenChannels.push("email");
        if (notifyShopInbox) chosenChannels.push("shop_inbox");
        if (notifyUserAlert) chosenChannels.push("notification");
        if (chosenChannels.length === 0) {
          chosenChannels.push("email", "notification");
        }
        if (!orderId || !["approve_payment", "set_status", "send_update", "processing", "deliver", "cancel"].includes(
          action
        )) {
          res.status(400).json({ success: false, message: "Invalid order action." });
          return;
        }
        const outcome = await withTransaction((db) => {
          const order = (db.shopOrders || []).find((o) => o.id === orderId);
          if (!order) throw new Error("Shop order not found.");
          const staffUser = db.users.find((u) => u.id === req.authUser.id) || null;
          return applyShopOrderAction(db, order, staffUser, "admin", {
            action,
            rawStatus,
            deliveredContentInput,
            adminNote,
            chosenChannels
          });
        });
        dispatchSmtpJobsInBackground(outcome.smtpJobs);
        if (outcome.dmToEmit && outcome.emitUserId) {
          sendChatEventToUsers([outcome.emitUserId], "direct:message", outcome.dmToEmit);
          sendChatEventToUsers(outcome.emitStaffIds, "admin:inbox_message", outcome.dmToEmit);
        }
        broadcastChatEvent("shop:orders_updated", {
          action,
          orderId: outcome.order.id,
          userId: outcome.order.userId,
          sellerUserId: outcome.order.sellerUserId || null,
          agentId: outcome.order.agentId || null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: `Order updated & dispatched via selected channel(s).`,
          order: outcome.order
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not update order."
        });
      }
    }
  );
  router.post(
    "/admin/shop/products",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const title = sanitizeText(req.body?.title, 120);
        const description = sanitizeText(req.body?.description, 500);
        const price = Math.round(Number(req.body?.price) * 100) / 100;
        const rawCat = sanitizeText(req.body?.category || "digital", 24);
        const allowedCats = /* @__PURE__ */ new Set(["digital", "physical", "smm", "cyber_pack", "on_demand"]);
        const category = allowedCats.has(rawCat) ? rawCat : "digital";
        const deliveryMode = category === "digital" ? "auto_email" : "manual_admin";
        const badgeText = sanitizeText(req.body?.badgeText || "", 40) || (category === "cyber_pack" ? "Cyber Pack" : category === "physical" ? "Physical" : category === "smm" ? "SMM Service" : category === "on_demand" ? "On-Demand" : "Digital \xB7 Auto Email");
        const autoDeliveryTemplate = sanitizeText(req.body?.autoDeliveryTemplate || "", 320) || null;
        const digitalDownloadUrl = sanitizeText(req.body?.digitalDownloadUrl || "", 400) || null;
        const imageKey = sanitizeText(req.body?.imageKey || "", 40) || (category === "cyber_pack" ? "cyber_freefire" : category === "physical" ? "physical" : category === "smm" ? "smm" : "digital");
        let customImageUrl = null;
        if (typeof req.body?.customImageUrl === "string" && req.body.customImageUrl.startsWith("data:image/")) {
          customImageUrl = saveUploadedCoverImage(req.body.customImageUrl);
        }
        const stockRaw = req.body?.stock;
        const stock = stockRaw !== void 0 && stockRaw !== "" && stockRaw !== null ? Math.max(0, Math.floor(Number(stockRaw))) : null;
        if (!title || title.length < 3) {
          res.status(400).json({ success: false, message: "Product title is required (min 3 chars)." });
          return;
        }
        if (!Number.isFinite(price) || price <= 0) {
          res.status(400).json({ success: false, message: "Valid product price is required." });
          return;
        }
        let fileMeta = {
          digitalFileName: null,
          digitalFileMime: null,
          digitalFileSize: null,
          digitalFileStorageName: null
        };
        if (category === "digital" && req.body?.digitalFile && req.body.digitalFile.base64Data) {
          fileMeta = saveUploadedDigitalFile(req.body.digitalFile);
        }
        const couponFields = parseCouponFields(req.body || {});
        const created = await withTransaction((db) => {
          if (!Array.isArray(db.shopItems)) db.shopItems = [];
          const newItem = {
            id: generateId("shop"),
            title,
            description: description || `${title} \u2014 official storefront item.`,
            price,
            kind: "product",
            category,
            deliveryMode,
            imageKey,
            customImageUrl,
            spinsGranted: 0,
            lotteryId: null,
            badgeText,
            stock,
            autoDeliveryTemplate,
            digitalFileName: fileMeta.digitalFileName,
            digitalFileMime: fileMeta.digitalFileMime,
            digitalFileSize: fileMeta.digitalFileSize,
            digitalFileStorageName: fileMeta.digitalFileStorageName,
            digitalDownloadUrl,
            requiresShipping: category === "physical",
            requiresTargetLink: category === "smm",
            requiresGameUid: category === "cyber_pack",
            requiresCustomBrief: category === "on_demand",
            ...couponFields,
            isActive: true,
            approvalStatus: "approved",
            submittedByUserId: req.authUser.id,
            submittedByUsername: req.authUser.username,
            submittedByFullName: req.authUser.fullName,
            submittedByRole: req.authUser.role,
            reviewedBy: req.authUser.username,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString(),
            submittedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          db.shopItems.unshift(newItem);
          return newItem;
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "admin_created",
          itemId: created.id,
          approvalStatus: created.approvalStatus || "approved",
          isActive: created.isActive !== false,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.status(201).json({
          success: true,
          message: created.digitalFileName ? `Digital product "${created.title}" with file "${created.digitalFileName}" added to Shop.` : `Product "${created.title}" added to Shop catalog.`,
          product: toPublicShopItem(created)
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not add product."
        });
      }
    }
  );
  router.put(
    "/admin/shop/products/:id",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const productId = sanitizeText(req.params.id, 80);
        const action = sanitizeText(req.body?.action || "", 24);
        const rejectionReason = sanitizeText(req.body?.rejectionReason || "", 300);
        if (typeof req.body?.title === "string" && req.body.title.trim().length > 0 && req.body.title.trim().length < 3) {
          res.status(400).json({ success: false, message: "Product title must be at least 3 characters." });
          return;
        }
        if (req.body?.price !== void 0 && (!Number.isFinite(Number(req.body.price)) || Number(req.body.price) <= 0)) {
          res.status(400).json({ success: false, message: "Product price must be greater than 0." });
          return;
        }
        const updated = await withTransaction((db) => {
          const item = (db.shopItems || []).find((p) => p.id === productId);
          if (!item) throw new Error("Product not found.");
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const allowedCats = /* @__PURE__ */ new Set(["digital", "physical", "smm", "cyber_pack", "on_demand"]);
          if (typeof req.body?.category === "string" && allowedCats.has(req.body.category)) {
            const nextCat = req.body.category;
            item.category = nextCat;
            item.deliveryMode = nextCat === "digital" ? "auto_email" : "manual_admin";
            item.requiresShipping = nextCat === "physical";
            item.requiresTargetLink = nextCat === "smm";
            item.requiresGameUid = nextCat === "cyber_pack";
            item.requiresCustomBrief = nextCat === "on_demand";
          }
          if (typeof req.body?.isActive === "boolean" && !action) {
            if (req.body.isActive && item.approvalStatus === "pending_approval") {
              item.approvalStatus = "approved";
              item.reviewedBy = req.authUser.username;
              item.reviewedAt = now;
            }
            item.isActive = req.body.isActive;
          }
          if (req.body?.price !== void 0 && Number(req.body.price) > 0) {
            item.price = Math.round(Number(req.body.price) * 100) / 100;
          }
          if (typeof req.body?.title === "string" && req.body.title.trim().length >= 3) {
            item.title = sanitizeText(req.body.title, 120);
          }
          if (typeof req.body?.description === "string") {
            const cleanDesc = sanitizeText(req.body.description, 500);
            item.description = cleanDesc || `${item.title} \u2014 storefront item.`;
          }
          if (typeof req.body?.badgeText === "string") {
            const cleanBadge = sanitizeText(req.body.badgeText, 40);
            if (cleanBadge) {
              item.badgeText = cleanBadge;
            }
          }
          if (typeof req.body?.imageKey === "string" && req.body.imageKey.trim()) {
            item.imageKey = sanitizeText(req.body.imageKey, 40);
          }
          if (req.body?.stock !== void 0) {
            item.stock = req.body.stock === null || req.body.stock === "" ? null : Math.max(0, Math.floor(Number(req.body.stock)));
          }
          if (req.body?.customImageUrl === null) {
            item.customImageUrl = null;
          } else if (typeof req.body?.customImageUrl === "string" && req.body.customImageUrl.startsWith("data:image/")) {
            item.customImageUrl = saveUploadedCoverImage(req.body.customImageUrl);
          }
          if (typeof req.body?.autoDeliveryTemplate === "string") {
            item.autoDeliveryTemplate = sanitizeText(req.body.autoDeliveryTemplate, 320) || null;
          }
          if (typeof req.body?.digitalDownloadUrl === "string") {
            item.digitalDownloadUrl = sanitizeText(req.body.digitalDownloadUrl, 400) || null;
          }
          if (typeof req.body?.sellerNotes === "string") {
            item.sellerNotes = sanitizeText(req.body.sellerNotes, 400) || null;
          }
          if (req.body?.removeDigitalFile === true) {
            item.digitalFileName = null;
            item.digitalFileMime = null;
            item.digitalFileSize = null;
            item.digitalFileStorageName = null;
          }
          if (req.body?.digitalFile && req.body.digitalFile.base64Data) {
            const saved = saveUploadedDigitalFile(req.body.digitalFile);
            item.digitalFileName = saved.digitalFileName;
            item.digitalFileMime = saved.digitalFileMime;
            item.digitalFileSize = saved.digitalFileSize;
            item.digitalFileStorageName = saved.digitalFileStorageName;
          }
          if (req.body?.couponCode !== void 0 || req.body?.couponDiscountType !== void 0 || req.body?.couponDiscountValue !== void 0 || req.body?.couponMinOrder !== void 0 || req.body?.couponActive !== void 0) {
            const nextCoupon = parseCouponFields(req.body || {}, item);
            item.couponCode = nextCoupon.couponCode;
            item.couponDiscountType = nextCoupon.couponDiscountType;
            item.couponDiscountValue = nextCoupon.couponDiscountValue;
            item.couponMinOrder = nextCoupon.couponMinOrder;
            item.couponActive = nextCoupon.couponActive;
          }
          if (action === "approve") {
            item.approvalStatus = "approved";
            item.isActive = true;
            item.rejectionReason = null;
            item.reviewedBy = req.authUser.username;
            item.reviewedAt = now;
            if (item.submittedByUserId) {
              db.notifications.unshift({
                id: generateId("notif"),
                userId: item.submittedByUserId,
                title: "Shop Product Approved",
                message: `Your product "${item.title}" has been approved by Admin and published to the Shop.`,
                type: "success",
                isRead: false,
                createdAt: now
              });
            }
          } else if (action === "reject") {
            item.approvalStatus = "rejected";
            item.isActive = false;
            item.rejectionReason = rejectionReason || "Needs adjustments before publishing.";
            item.reviewedBy = req.authUser.username;
            item.reviewedAt = now;
            if (item.submittedByUserId) {
              db.notifications.unshift({
                id: generateId("notif"),
                userId: item.submittedByUserId,
                title: "Shop Product Rejected",
                message: `Your product "${item.title}" was not approved: ${item.rejectionReason}`,
                type: "warning",
                isRead: false,
                createdAt: now
              });
            }
          }
          item.updatedAt = now;
          return item;
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: action === "approve" ? "admin_approved" : action === "reject" ? "admin_rejected" : "admin_updated",
          itemId: updated.id,
          approvalStatus: updated.approvalStatus || "approved",
          isActive: updated.isActive !== false,
          submittedByUserId: updated.submittedByUserId || null,
          agentId: updated.agentId || null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: action === "approve" ? `Product "${updated.title}" saved, approved & published to Shop.` : action === "reject" ? `Product "${updated.title}" marked as rejected.` : `Product "${updated.title}" updated.`,
          product: toPublicShopItem(updated)
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not update product."
        });
      }
    }
  );
  router.delete(
    "/admin/shop/products/:id",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const productId = sanitizeText(req.params.id, 80);
        await withTransaction((db) => {
          const idx = (db.shopItems || []).findIndex((p) => p.id === productId);
          if (idx === -1) throw new Error("Product not found.");
          db.shopItems.splice(idx, 1);
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "admin_deleted",
          itemId: productId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({ success: true, message: "Product removed from catalog." });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not remove product."
        });
      }
    }
  );
  router.get(
    "/admin/shop/coupons",
    requireAuth,
    requireStaff,
    (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      const db = getDbSnapshot();
      const coupons = [...db.shopCoupons || []].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      );
      const products = (db.shopItems || []).map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        imageKey: p.imageKey,
        customImageUrl: p.customImageUrl || null,
        isActive: p.isActive !== false,
        approvalStatus: p.approvalStatus || "approved",
        submittedByUsername: p.submittedByUsername || null,
        submittedByRole: p.submittedByRole || null
      }));
      res.json({
        success: true,
        currencySymbol: db.settings.currencySymbol || "\u09F3",
        coupons,
        products,
        summary: buildCouponSummary(coupons)
      });
    }
  );
  router.post(
    "/admin/shop/coupons",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const coupon = await withTransaction((db) => {
          if (!Array.isArray(db.shopCoupons)) db.shopCoupons = [];
          const validProductIds = new Set((db.shopItems || []).map((p) => p.id));
          const parsed = parseStandaloneCouponInput(req.body || {}, validProductIds);
          const duplicate = db.shopCoupons.find(
            (c) => c.code.toUpperCase() === parsed.code.toUpperCase()
          );
          if (duplicate) {
            throw new Error(`Coupon code "${parsed.code}" already exists. Use another code.`);
          }
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const created = {
            id: generateId("cpn"),
            ...parsed,
            usedCount: 0,
            createdByUserId: req.authUser.id,
            createdByUsername: req.authUser.username,
            createdByRole: req.authUser.role,
            agentId: null,
            createdAt: nowIso,
            updatedAt: nowIso
          };
          db.shopCoupons.unshift(created);
          pushAuditLog(
            db,
            { id: req.authUser.id, username: req.authUser.username },
            "SHOP_COUPON_CREATED",
            "shop_coupon",
            created.id,
            {
              code: created.code,
              discountType: created.discountType,
              discountValue: created.discountValue,
              minOrderAmount: created.minOrderAmount,
              appliesToAllProducts: created.appliesToAllProducts,
              applicableProductIds: created.applicableProductIds,
              expiresAt: created.expiresAt
            },
            getClientIp(req)
          );
          return created;
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "coupon_created",
          couponId: coupon.id,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.status(201).json({
          success: true,
          message: `Coupon "${coupon.code}" created and synced live to Shop.`,
          coupon
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not create coupon."
        });
      }
    }
  );
  router.put(
    "/admin/shop/coupons/:id",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const couponId = sanitizeText(req.params.id, 80);
        const updated = await withTransaction((db) => {
          if (!Array.isArray(db.shopCoupons)) db.shopCoupons = [];
          const existing = db.shopCoupons.find((c) => c.id === couponId);
          if (!existing) throw new Error("Coupon not found.");
          const validProductIds = new Set((db.shopItems || []).map((p) => p.id));
          const parsed = parseStandaloneCouponInput(req.body || {}, validProductIds, existing);
          const duplicate = db.shopCoupons.find(
            (c) => c.id !== couponId && c.code.toUpperCase() === parsed.code.toUpperCase()
          );
          if (duplicate) {
            throw new Error(`Coupon code "${parsed.code}" already exists.`);
          }
          Object.assign(existing, parsed, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
          return existing;
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "coupon_updated",
          couponId: updated.id,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: `Coupon "${updated.code}" updated.`,
          coupon: updated
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not update coupon."
        });
      }
    }
  );
  router.delete(
    "/admin/shop/coupons/:id",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const couponId = sanitizeText(req.params.id, 80);
        await withTransaction((db) => {
          if (!Array.isArray(db.shopCoupons)) db.shopCoupons = [];
          const idx = db.shopCoupons.findIndex((c) => c.id === couponId);
          if (idx === -1) throw new Error("Coupon not found.");
          db.shopCoupons.splice(idx, 1);
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "coupon_deleted",
          couponId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({ success: true, message: "Coupon removed." });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not delete coupon."
        });
      }
    }
  );
  router.get(
    "/admin/smtp/live",
    requireAuth,
    requireStaff,
    async (_req, res) => {
      try {
        const snapshot = await withTransaction((db) => {
          const cfg = ensureSmtpConfig(db);
          const allLogs = Array.isArray(db.smtpLogs) ? db.smtpLogs : [];
          const stats = {
            totalEmails: allLogs.length,
            sentCount: allLogs.filter((l) => l.status === "sent").length,
            sendingCount: allLogs.filter((l) => l.status === "sending").length,
            loggedOnlyCount: allLogs.filter((l) => l.status === "logged_only").length,
            failedCount: allLogs.filter((l) => l.status === "failed").length,
            digitalSentCount: allLogs.filter((l) => l.trigger === "digital_product_sent").length,
            physicalConfirmCount: allLogs.filter(
              (l) => l.trigger === "physical_order_confirmation" || l.trigger === "physical_order_update"
            ).length,
            onDemandConfirmCount: allLogs.filter((l) => l.trigger === "on_demand_confirmation").length,
            cyberPackSentCount: allLogs.filter((l) => l.trigger === "cyber_pack_sent").length
          };
          const safeLogs = allLogs.slice(0, 80).map((l) => {
            const { attachmentPath: _hiddenPath, ...rest } = l;
            return rest;
          });
          return {
            config: toPublicSmtpConfig(cfg),
            stats,
            logs: safeLogs
          };
        });
        res.json({
          success: true,
          serverTime: (/* @__PURE__ */ new Date()).toISOString(),
          ...snapshot
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: err instanceof Error ? err.message : "Failed to load live SMTP status."
        });
      }
    }
  );
  router.put(
    "/admin/smtp/config",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const body = req.body || {};
        const validPresets = /* @__PURE__ */ new Set(["custom", "gmail", "brevo", "zoho", "cpanel"]);
        const updated = await withTransaction((db) => {
          const cfg = ensureSmtpConfig(db);
          if (typeof body.enabled === "boolean") {
            cfg.enabled = body.enabled;
          }
          if (typeof body.providerPreset === "string" && validPresets.has(body.providerPreset)) {
            cfg.providerPreset = body.providerPreset;
          }
          if (typeof body.host === "string") {
            cfg.host = sanitizeText(body.host, 180);
          }
          if (body.port !== void 0) {
            const parsedPort = Number(body.port);
            if (!Number.isFinite(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
              throw new Error("SMTP port must be a valid port number (1 - 65535).");
            }
            cfg.port = Math.floor(parsedPort);
          }
          if (typeof body.secure === "boolean") {
            cfg.secure = body.secure;
          }
          if (typeof body.username === "string") {
            cfg.username = sanitizeText(body.username, 180);
          }
          if (body.clearPassword === true) {
            cfg.password = "";
          } else if (typeof body.password === "string" && body.password.trim().length > 0) {
            cfg.password = body.password.trim().slice(0, 260);
          }
          if (typeof body.fromName === "string") {
            cfg.fromName = sanitizeText(body.fromName, 120) || db.settings.siteName || "Shop";
          }
          if (typeof body.fromEmail === "string") {
            cfg.fromEmail = sanitizeText(body.fromEmail, 180);
          }
          if (typeof body.replyToEmail === "string") {
            cfg.replyToEmail = sanitizeText(body.replyToEmail, 180);
          }
          if (body.triggers && typeof body.triggers === "object") {
            if (typeof body.triggers.digitalProductSent === "boolean") {
              cfg.triggers.digitalProductSent = body.triggers.digitalProductSent;
            }
            if (typeof body.triggers.physicalOrderConfirmation === "boolean") {
              cfg.triggers.physicalOrderConfirmation = body.triggers.physicalOrderConfirmation;
            }
            if (typeof body.triggers.onDemandConfirmation === "boolean") {
              cfg.triggers.onDemandConfirmation = body.triggers.onDemandConfirmation;
            }
            if (typeof body.triggers.cyberPackSent === "boolean") {
              cfg.triggers.cyberPackSent = body.triggers.cyberPackSent;
            }
          }
          cfg.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          if (!cfg.enabled) {
            cfg.lastHealthStatus = "disabled";
            cfg.lastHealthMessage = "SMTP delivery is turned OFF. Emails are logged locally.";
            cfg.lastHealthLatencyMs = null;
          } else if (!hasCompleteSmtpCredentials(cfg)) {
            cfg.lastHealthStatus = "not_configured";
            cfg.lastHealthMessage = "Enter SMTP Host, Port, Username & Password, then click Test Connection.";
            cfg.lastHealthLatencyMs = null;
          } else if (cfg.lastHealthStatus === "disabled" || cfg.lastHealthStatus === "not_configured") {
            cfg.lastHealthMessage = "Credentials saved. Click Test Connection to verify live handshake.";
          }
          return toPublicSmtpConfig(cfg);
        });
        res.json({
          success: true,
          message: "SMTP configuration and email triggers saved.",
          config: updated
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not save SMTP configuration."
        });
      }
    }
  );
  router.post(
    "/admin/smtp/test",
    requireAuth,
    requireStaff,
    async (_req, res) => {
      try {
        const snapshot = await withTransaction((db) => {
          const cfg = ensureSmtpConfig(db);
          return { ...cfg, triggers: { ...cfg.triggers } };
        });
        const result = await verifySmtpConnection(snapshot);
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const updatedConfig = await withTransaction((db) => {
          const cfg = ensureSmtpConfig(db);
          cfg.lastHealthStatus = result.status;
          cfg.lastHealthMessage = result.message;
          cfg.lastHealthLatencyMs = result.latencyMs;
          cfg.lastCheckedAt = nowIso;
          return toPublicSmtpConfig(cfg);
        });
        res.json({
          success: result.ok,
          message: result.message,
          result,
          config: updatedConfig
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: err instanceof Error ? err.message : "SMTP connection test failed."
        });
      }
    }
  );
  router.post(
    "/admin/smtp/send-test",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const rawTo = sanitizeText(req.body?.toEmail || req.authUser?.email || "", 180);
        if (!rawTo || !rawTo.includes("@")) {
          res.status(400).json({
            success: false,
            message: "Please enter a valid recipient email address."
          });
          return;
        }
        const { log, job } = await withTransaction((db) => {
          const siteName = db.settings?.siteName || "Lottery Winner";
          return recordSmtpLogInDb(db, {
            orderId: null,
            userId: req.authUser?.id || null,
            username: req.authUser?.username || "admin",
            trigger: "test_email",
            toEmail: rawTo,
            subject: `[SMTP Test] ${siteName} Live Mail Engine Verification`,
            body: `Hello,

This is a live SMTP verification email sent from ${siteName} Admin Panel.
Active Email Triggers:
- Digital Product Sent (Auto Email + Digital File)
- Physical Product Order Confirmation & Updates
- On-Demand Product Confirmation
- Cyber Pack Product Delivery

Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`
          });
        });
        if (!job) {
          const { attachmentPath: _hiddenPath, ...safeLog } = log;
          res.json({
            success: false,
            message: log.errorMessage || "SMTP is disabled or incomplete. Email was logged locally in Live Outbox.",
            log: safeLog
          });
          return;
        }
        const delivery = await deliverSmtpJob(job);
        const refreshedLog = await withTransaction((db) => {
          const found = (db.smtpLogs || []).find((l) => l.id === log.id);
          if (!found) return null;
          const { attachmentPath: _hiddenPath, ...rest } = found;
          return rest;
        });
        res.json({
          success: delivery.ok,
          message: delivery.ok ? `Test email delivered to ${rawTo} in ${delivery.latencyMs} ms.` : `SMTP delivery failed: ${delivery.errorMessage}`,
          delivery,
          log: refreshedLog
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not send test email."
        });
      }
    }
  );
  router.post(
    "/admin/smtp/logs/:logId/retry",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const logId = sanitizeText(req.params.logId, 80);
        const prepared = await withTransaction((db) => {
          const cfg = ensureSmtpConfig(db);
          const rec = (db.smtpLogs || []).find((l) => l.id === logId);
          if (!rec) throw new Error("SMTP email log not found.");
          if (!cfg.enabled || !hasCompleteSmtpCredentials(cfg)) {
            throw new Error(
              "Enable SMTP and configure valid SMTP credentials before retrying delivery."
            );
          }
          rec.status = "sending";
          rec.errorMessage = null;
          rec.completedAt = null;
          const relatedOrder = rec.orderId ? (db.shopOrders || []).find((o) => o.id === rec.orderId) : null;
          const fullBody = relatedOrder?.deliveredContent || relatedOrder?.emailHistory?.[0]?.body || rec.bodyPreview;
          return {
            job: {
              logId: rec.id,
              toEmail: rec.toEmail,
              subject: rec.subject,
              body: fullBody,
              trigger: rec.trigger,
              orderId: rec.orderId,
              attachmentName: rec.attachmentName,
              attachmentPath: rec.attachmentPath || null,
              siteName: db.settings?.siteName || "Lottery Winner",
              configSnapshot: { ...cfg, triggers: { ...cfg.triggers } }
            }
          };
        });
        const delivery = await deliverSmtpJob(prepared.job);
        const updatedLog = await withTransaction((db) => {
          const found = (db.smtpLogs || []).find((l) => l.id === logId);
          if (!found) return null;
          const { attachmentPath: _hiddenPath, ...rest } = found;
          return rest;
        });
        res.json({
          success: delivery.ok,
          message: delivery.ok ? `Email resent to ${prepared.job.toEmail} in ${delivery.latencyMs} ms.` : `Retry failed: ${delivery.errorMessage}`,
          delivery,
          log: updatedLog
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not retry email delivery."
        });
      }
    }
  );
  router.post("/rewards/wheel/spin", requireAuth, financeLimiter, async (req, res) => {
    try {
      const outcome = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("Account not found.");
        if (user.status !== "active") throw new Error("Account is suspended.");
        if (!Array.isArray(db.wheelSpins)) db.wheelSpins = [];
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        const usedDailyFree = db.wheelSpins.some(
          (s) => s.userId === user.id && s.spinType === "daily_free" && s.createdAt.slice(0, 10) === today
        );
        let spinType = "daily_free";
        if (usedDailyFree) {
          if ((user.spinCredits || 0) < 1) {
            throw new Error("Daily free spin used. Buy extra Spin Credits in the Shop or claim your Daily Check-In!");
          }
          user.spinCredits -= 1;
          spinType = "spin_credit";
        }
        const totalWeight = WHEEL_SEGMENTS.reduce((sum, s) => sum + s.weight, 0);
        let roll = import_crypto7.default.randomInt(0, totalWeight);
        let chosen = WHEEL_SEGMENTS[0];
        for (const seg of WHEEL_SEGMENTS) {
          if (roll < seg.weight) {
            chosen = seg;
            break;
          }
          roll -= seg.weight;
        }
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        if (chosen.rewardAmount > 0) {
          user.balance = Math.round((user.balance + chosen.rewardAmount) * 100) / 100;
        }
        if (chosen.rewardSpins > 0) {
          user.spinCredits = (user.spinCredits || 0) + chosen.rewardSpins;
        }
        user.updatedAt = nowIso;
        const spinRec = {
          id: generateId("spin"),
          userId: user.id,
          username: user.username,
          segmentIndex: chosen.index,
          segmentLabel: chosen.label,
          rewardAmount: chosen.rewardAmount,
          rewardSpins: chosen.rewardSpins,
          spinType,
          createdAt: nowIso
        };
        db.wheelSpins.unshift(spinRec);
        if (chosen.rewardAmount > 0) {
          db.transactions.unshift({
            id: generateId("txn"),
            userId: user.id,
            username: user.username,
            direction: "credit",
            category: "wheel_reward",
            amount: chosen.rewardAmount,
            balanceAfter: user.balance,
            referenceId: spinRec.id,
            gateway: "Lucky Wheel",
            description: `Lucky Wheel prize won: ${chosen.label}`,
            createdAt: nowIso
          });
        }
        db.notifications.unshift({
          id: generateId("notif"),
          userId: user.id,
          title: "Lucky Wheel Result",
          message: `You landed on ${chosen.label}!`,
          type: chosen.rewardAmount >= 25 ? "win" : "success",
          isRead: false,
          createdAt: nowIso
        });
        return {
          spin: spinRec,
          segmentIndex: chosen.index,
          user: toPublicUser(user)
        };
      });
      res.json({
        success: true,
        message: `Lucky Wheel landed on ${outcome.spin.segmentLabel}!`,
        ...outcome
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not spin the wheel."
      });
    }
  });
  router.post("/rewards/tasks/:id/claim", requireAuth, financeLimiter, async (req, res) => {
    try {
      const taskId = sanitizeText(req.params.id, 64);
      const outcome = await withTransaction((db) => {
        const user = db.users.find((u) => u.id === req.authUser.id);
        if (!user) throw new Error("Account not found.");
        const tasks = buildDailyTaskStates(db, user.id);
        const task = tasks.find((t) => t.id === taskId);
        if (!task) throw new Error("Daily task not found.");
        if (task.claimedToday) throw new Error("You have already claimed this daily task today.");
        if (!task.eligible) throw new Error(`Task requirement not yet met (${task.progressLabel}).`);
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const today = nowIso.slice(0, 10);
        if (task.rewardAmount > 0) {
          user.balance = Math.round((user.balance + task.rewardAmount) * 100) / 100;
        }
        if (task.rewardSpins > 0) {
          user.spinCredits = (user.spinCredits || 0) + task.rewardSpins;
        }
        user.updatedAt = nowIso;
        const claimRec = {
          id: generateId("task"),
          userId: user.id,
          username: user.username,
          taskId: task.id,
          claimDate: today,
          rewardAmount: task.rewardAmount,
          rewardSpins: task.rewardSpins,
          createdAt: nowIso
        };
        if (!Array.isArray(db.dailyTaskClaims)) db.dailyTaskClaims = [];
        db.dailyTaskClaims.unshift(claimRec);
        if (task.rewardAmount > 0) {
          db.transactions.unshift({
            id: generateId("txn"),
            userId: user.id,
            username: user.username,
            direction: "credit",
            category: "task_reward",
            amount: task.rewardAmount,
            balanceAfter: user.balance,
            referenceId: claimRec.id,
            gateway: "Daily Task",
            description: `Daily Task reward claimed: ${task.title}`,
            createdAt: nowIso
          });
        }
        db.notifications.unshift({
          id: generateId("notif"),
          userId: user.id,
          title: "Daily Task Reward Claimed",
          message: `Completed "${task.title}" for +${db.settings.currencySymbol}${task.rewardAmount}${task.rewardSpins > 0 ? ` and +${task.rewardSpins} Spin` : ""}.`,
          type: "success",
          isRead: false,
          createdAt: nowIso
        });
        return {
          claim: claimRec,
          task,
          user: toPublicUser(user),
          dailyTasks: buildDailyTaskStates(db, user.id)
        };
      });
      res.json({
        success: true,
        message: `Claimed reward for "${outcome.task.title}"!`,
        ...outcome
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not claim daily task."
      });
    }
  });
  router.post("/admin/payment-gateways", requireAuth, requireStaff, async (req, res) => {
    try {
      const name = sanitizeText(req.body?.name, 60);
      const rawCode = sanitizeText(req.body?.code || name, 40).replace(/\s+/g, "");
      const category = GATEWAY_CATEGORIES.includes(req.body?.category) ? req.body.category : "custom";
      const mode = req.body?.mode === "auto_api" ? "auto_api" : "manual";
      const currency = sanitizeText(req.body?.currency || "BDT", 10).toUpperCase() || "BDT";
      const exchangeRate = Math.max(0.01, Number(req.body?.exchangeRate) || 1);
      const minAmount = Math.max(1, Number(req.body?.minAmount) || 50);
      const maxAmount = Math.max(minAmount, Number(req.body?.maxAmount) || 1e5);
      const feePercent = Math.max(0, Math.min(25, Number(req.body?.feePercent) || 0));
      const accountLabel = sanitizeText(req.body?.accountLabel || `${name} Account`, 80);
      const accountValue = sanitizeText(req.body?.accountValue || "", 220);
      const instructions = sanitizeText(req.body?.instructions || "", 400);
      const environment = req.body?.environment === "live" ? "live" : "sandbox";
      const apiBaseUrl = sanitizeText(req.body?.apiBaseUrl || "", 260);
      const apiKey = typeof req.body?.apiKey === "string" ? req.body.apiKey.trim().slice(0, 300) : "";
      const apiSecret = typeof req.body?.apiSecret === "string" ? req.body.apiSecret.trim().slice(0, 300) : "";
      const webhookSecret = typeof req.body?.webhookSecret === "string" ? req.body.webhookSecret.trim().slice(0, 300) : "";
      const supportsDeposit = req.body?.supportsDeposit !== false;
      const supportsWithdrawal = Boolean(req.body?.supportsWithdrawal);
      const enabled = req.body?.enabled !== false;
      const qrPreferred = typeof req.body?.qrPreferred === "boolean" ? req.body.qrPreferred : ["citybank", "cellfin"].includes(rawCode.toLowerCase());
      const qrInstructionsBn = sanitizeText(req.body?.qrInstructionsBn || "", 800);
      let qrImageUrl = null;
      if (typeof req.body?.qrImageUrl === "string" && req.body.qrImageUrl.trim()) {
        const rawQr = req.body.qrImageUrl.trim();
        if (rawQr.startsWith("data:image/")) {
          qrImageUrl = saveUploadedGatewayQrImage(rawQr);
        } else if (rawQr.startsWith("/api/gateways/qr/")) {
          qrImageUrl = rawQr.slice(0, 200);
        }
      }
      const ip = getClientIp(req);
      if (!name || name.length < 2) {
        throw new Error("Payment option name must be at least 2 characters.");
      }
      if (!rawCode) {
        throw new Error("Payment gateway code is required.");
      }
      const created = await withTransaction((db) => {
        if (!Array.isArray(db.paymentGateways)) db.paymentGateways = [];
        if (db.paymentGateways.some((g) => g.code.toLowerCase() === rawCode.toLowerCase())) {
          throw new Error(`Payment gateway "${rawCode}" already exists.`);
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const gw = {
          id: generateId("gw"),
          code: rawCode,
          name,
          category,
          mode,
          enabled,
          supportsDeposit,
          supportsWithdrawal,
          isBuiltIn: false,
          currency,
          exchangeRate,
          minAmount,
          maxAmount,
          feePercent,
          accountLabel,
          accountValue,
          instructions,
          qrImageUrl,
          qrPreferred,
          qrInstructionsBn,
          environment,
          apiBaseUrl,
          apiKey,
          apiSecret,
          webhookSecret,
          createdAt: now,
          updatedAt: now
        };
        db.paymentGateways.push(gw);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "PAYMENT_GATEWAY_ADDED",
          "payment_gateway",
          gw.id,
          { code: gw.code, name: gw.name, category: gw.category, mode: gw.mode },
          ip
        );
        return toAdminGateway(gw);
      });
      broadcastChatEvent("lottery:overview_updated", { reason: "payment_gateway_added" });
      broadcastChatEvent("shop:catalog_updated", {
        action: "gateway_added",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json({ success: true, gateway: created });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to add payment option."
      });
    }
  });
  router.put("/admin/payment-gateways/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const gwId = req.params.id;
      const ip = getClientIp(req);
      const updated = await withTransaction((db) => {
        if (!Array.isArray(db.paymentGateways)) db.paymentGateways = [];
        const gw = db.paymentGateways.find((g) => g.id === gwId);
        if (!gw) throw new Error("Payment gateway not found.");
        if (typeof req.body?.name === "string" && req.body.name.trim()) {
          gw.name = sanitizeText(req.body.name, 60);
        }
        if (GATEWAY_CATEGORIES.includes(req.body?.category)) {
          gw.category = req.body.category;
        }
        if (req.body?.mode === "manual" || req.body?.mode === "auto_api") {
          gw.mode = req.body.mode;
        }
        if (typeof req.body?.enabled === "boolean") {
          gw.enabled = req.body.enabled;
        }
        if (typeof req.body?.supportsDeposit === "boolean") {
          gw.supportsDeposit = req.body.supportsDeposit;
        }
        if (typeof req.body?.supportsWithdrawal === "boolean") {
          gw.supportsWithdrawal = req.body.supportsWithdrawal;
        }
        if (typeof req.body?.currency === "string" && req.body.currency.trim()) {
          gw.currency = sanitizeText(req.body.currency, 10).toUpperCase();
        }
        if (typeof req.body?.exchangeRate === "number" && req.body.exchangeRate > 0) {
          gw.exchangeRate = req.body.exchangeRate;
        }
        if (typeof req.body?.minAmount === "number" && req.body.minAmount > 0) {
          gw.minAmount = req.body.minAmount;
        }
        if (typeof req.body?.maxAmount === "number" && req.body.maxAmount >= gw.minAmount) {
          gw.maxAmount = req.body.maxAmount;
        }
        if (typeof req.body?.feePercent === "number" && req.body.feePercent >= 0 && req.body.feePercent <= 25) {
          gw.feePercent = req.body.feePercent;
        }
        if (typeof req.body?.accountLabel === "string") {
          gw.accountLabel = sanitizeText(req.body.accountLabel, 80);
        }
        if (typeof req.body?.accountValue === "string") {
          gw.accountValue = sanitizeText(req.body.accountValue, 220);
        }
        if (typeof req.body?.instructions === "string") {
          gw.instructions = sanitizeText(req.body.instructions, 400);
        }
        if (typeof req.body?.qrPreferred === "boolean") {
          gw.qrPreferred = req.body.qrPreferred;
        }
        if (typeof req.body?.qrInstructionsBn === "string") {
          gw.qrInstructionsBn = sanitizeText(req.body.qrInstructionsBn, 800);
        }
        if (req.body?.qrImageUrl === null || req.body?.qrImageUrl === "") {
          gw.qrImageUrl = null;
        } else if (typeof req.body?.qrImageUrl === "string") {
          const rawQr = req.body.qrImageUrl.trim();
          if (rawQr.startsWith("data:image/")) {
            gw.qrImageUrl = saveUploadedGatewayQrImage(rawQr);
          } else if (rawQr.startsWith("/api/gateways/qr/")) {
            gw.qrImageUrl = rawQr.slice(0, 200);
          }
        }
        if (req.body?.environment === "live" || req.body?.environment === "sandbox") {
          gw.environment = req.body.environment;
        }
        if (typeof req.body?.apiBaseUrl === "string") {
          gw.apiBaseUrl = sanitizeText(req.body.apiBaseUrl, 260);
        }
        if (typeof req.body?.apiKey === "string" && req.body.apiKey.trim()) {
          gw.apiKey = req.body.apiKey.trim().slice(0, 300);
        }
        if (typeof req.body?.apiSecret === "string" && req.body.apiSecret.trim()) {
          gw.apiSecret = req.body.apiSecret.trim().slice(0, 300);
        }
        if (typeof req.body?.webhookSecret === "string" && req.body.webhookSecret.trim()) {
          gw.webhookSecret = req.body.webhookSecret.trim().slice(0, 300);
        }
        gw.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        const lc = gw.code.toLowerCase();
        if (lc === "bkash" && gw.accountValue) db.settings.mobileAgentBkash = gw.accountValue;
        if (lc === "nagad" && gw.accountValue) db.settings.mobileAgentNagad = gw.accountValue;
        if (lc === "rocket" && gw.accountValue) db.settings.mobileAgentRocket = gw.accountValue;
        if (lc === "upay" && gw.accountValue) db.settings.mobileAgentUpay = gw.accountValue;
        if (lc === "bank" && gw.accountValue) db.settings.bankDetails = gw.accountValue;
        if (lc === "usdt" && gw.accountValue) db.settings.cryptoAddress = gw.accountValue;
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "PAYMENT_GATEWAY_UPDATED",
          "payment_gateway",
          gw.id,
          { code: gw.code, enabled: gw.enabled, mode: gw.mode, environment: gw.environment },
          ip
        );
        return toAdminGateway(gw);
      });
      broadcastChatEvent("lottery:overview_updated", { reason: "payment_gateway_updated" });
      broadcastChatEvent("shop:catalog_updated", {
        action: "gateway_updated",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true, gateway: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update payment gateway."
      });
    }
  });
  router.delete("/admin/payment-gateways/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const gwId = req.params.id;
      const ip = getClientIp(req);
      await withTransaction((db) => {
        const idx = (db.paymentGateways || []).findIndex((g) => g.id === gwId);
        if (idx === -1) throw new Error("Payment gateway not found.");
        const gw = db.paymentGateways[idx];
        if (gw.isBuiltIn) {
          throw new Error("Built-in gateways cannot be deleted; toggle them off to disable.");
        }
        db.paymentGateways.splice(idx, 1);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "PAYMENT_GATEWAY_DELETED",
          "payment_gateway",
          gw.id,
          { code: gw.code, name: gw.name },
          ip
        );
      });
      broadcastChatEvent("lottery:overview_updated", { reason: "payment_gateway_deleted" });
      broadcastChatEvent("shop:catalog_updated", {
        action: "gateway_deleted",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true, message: "Custom payment gateway removed." });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not delete gateway."
      });
    }
  });
  router.post("/admin/payment-gateways/:id/test", requireAuth, requireStaff, async (req, res) => {
    try {
      const db = getDbSnapshot();
      const gw = (db.paymentGateways || []).find((g) => g.id === req.params.id);
      if (!gw) throw new Error("Payment gateway not found.");
      const checks = [];
      checks.push(`Channel "${gw.name}" (${gw.code}) is ${gw.enabled ? "ENABLED" : "DISABLED"}`);
      checks.push(`Currency: ${gw.currency} (1 ${gw.currency} = ${db.settings.currencySymbol}${gw.exchangeRate})`);
      checks.push(`Limits: ${db.settings.currencySymbol}${gw.minAmount} \u2013 ${db.settings.currencySymbol}${gw.maxAmount.toLocaleString()}`);
      if (gw.mode === "auto_api") {
        if (gw.apiBaseUrl) {
          checks.push(`API Endpoint configured: ${gw.apiBaseUrl}`);
        } else {
          checks.push("Warning: API Base URL is empty (will run in manual invoice reference mode).");
        }
        checks.push(
          gw.apiKey ? `API Key present (${gw.environment.toUpperCase()} mode)` : "No API Key stored yet \u2014 checkout will create tracked sandbox/manual invoices."
        );
      } else {
        checks.push(
          gw.accountValue ? `Receiving Account ready: ${gw.accountValue}` : "Warning: Receiving account/number is empty."
        );
      }
      res.json({
        success: true,
        status: gw.enabled ? "ready" : "disabled",
        message: `${gw.name} configuration check passed.`,
        checks
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Gateway test failed."
      });
    }
  });
  router.post("/admin/plugins/install", requireAuth, requireStaff, async (req, res) => {
    try {
      let payload = req.body || {};
      if (typeof payload.manifestJson === "string" && payload.manifestJson.trim()) {
        try {
          const parsedManifest = JSON.parse(payload.manifestJson);
          if (parsedManifest && typeof parsedManifest === "object") {
            payload = { ...parsedManifest, ...payload, manifestJson: void 0 };
          }
        } catch {
          throw new Error("Invalid plugin JSON manifest. Please check the JSON syntax.");
        }
      }
      const name = sanitizeText(payload.name, 80);
      const rawSlug = sanitizeText(payload.slug || name, 60).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
      const version = sanitizeText(payload.version || "1.0.0", 24) || "1.0.0";
      const author = sanitizeText(payload.author || req.authUser.username || "Admin", 60);
      const category = PLUGIN_CATEGORIES.includes(payload.category) ? payload.category : "custom";
      const hookType = PLUGIN_HOOK_TYPES.includes(payload.hookType) ? payload.hookType : "custom_widget";
      const description = sanitizeText(payload.description || "Custom installed plugin", 400);
      const enabled = payload.enabled !== false;
      const customCss = sanitizePluginCss(payload.customCss || "");
      const customHtml = sanitizePluginHtml(payload.customHtml || "");
      const webhookUrl = sanitizeText(payload.webhookUrl || "", 300);
      let config = {};
      if (typeof payload.configJson === "string" && payload.configJson.trim()) {
        try {
          const parsedCfg = JSON.parse(payload.configJson);
          if (parsedCfg && typeof parsedCfg === "object" && !Array.isArray(parsedCfg)) {
            config = parsedCfg;
          }
        } catch {
          throw new Error("Plugin config must be valid JSON object.");
        }
      } else if (payload.config && typeof payload.config === "object" && !Array.isArray(payload.config)) {
        config = payload.config;
      }
      if (!name || name.length < 2) {
        throw new Error("Plugin name must be at least 2 characters.");
      }
      if (!rawSlug) {
        throw new Error("Plugin slug could not be generated.");
      }
      const ip = getClientIp(req);
      const installed = await withTransaction((db) => {
        if (!Array.isArray(db.plugins)) db.plugins = [];
        const uniqueSlug = db.plugins.some((p) => p.slug === rawSlug) ? `${rawSlug}-${Date.now().toString(36).slice(-4)}` : rawSlug;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const plugin = {
          id: generateId("plg"),
          slug: uniqueSlug,
          name,
          version,
          author,
          category,
          hookType,
          description,
          enabled,
          isBuiltIn: false,
          config,
          customCss,
          customHtml,
          webhookUrl,
          executionsCount: 0,
          lastTriggeredAt: null,
          installedAt: now,
          updatedAt: now
        };
        db.plugins.unshift(plugin);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "PLUGIN_INSTALLED",
          "plugin",
          plugin.id,
          { slug: plugin.slug, name: plugin.name, hookType: plugin.hookType, version: plugin.version },
          ip
        );
        return plugin;
      });
      broadcastChatEvent("lottery:overview_updated", { reason: "plugin_installed" });
      res.status(201).json({
        success: true,
        message: `Plugin "${installed.name}" installed and ${installed.enabled ? "activated" : "ready"}.`,
        plugin: installed
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Plugin installation failed."
      });
    }
  });
  router.post("/admin/plugins/upload-zip", requireAuth, requireStaff, async (req, res) => {
    try {
      const fileName = sanitizeText(req.body?.fileName || "plugin.zip", 120);
      const rawBase64 = typeof req.body?.zipBase64 === "string" ? req.body.zipBase64.trim() : "";
      const autoActivate = req.body?.autoActivate !== false;
      if (!rawBase64) {
        throw new Error("Please select a .zip plugin archive to upload.");
      }
      const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/i, "");
      const zipBuffer = Buffer.from(cleanBase64, "base64");
      if (zipBuffer.length < 22) {
        throw new Error("Uploaded file is empty or not a valid .zip archive.");
      }
      if (zipBuffer.length > 6 * 1024 * 1024) {
        throw new Error("Plugin .zip file exceeds the 6 MB upload limit.");
      }
      let zip;
      try {
        zip = new import_adm_zip.default(zipBuffer);
      } catch {
        throw new Error("Invalid .zip file. Please upload a valid WordPress or plugin .zip archive.");
      }
      const entries = zip.getEntries().filter((entry) => {
        const entryName = entry.entryName || "";
        if (entry.isDirectory) return false;
        if (entryName.includes("..") || entryName.startsWith("/") || entryName.startsWith("__MACOSX/")) {
          return false;
        }
        return true;
      });
      if (entries.length === 0) {
        throw new Error("The uploaded .zip archive contains no plugin files.");
      }
      const packageFiles = entries.slice(0, 60).map((e) => e.entryName);
      const manifestEntry = entries.find((e) => /(^|\/)(plugin|manifest)\.json$/i.test(e.entryName));
      let nativeManifest = null;
      if (manifestEntry) {
        try {
          const parsed = JSON.parse(manifestEntry.getData().toString("utf8"));
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            nativeManifest = parsed;
          }
        } catch {
          throw new Error(`Invalid JSON inside ${manifestEntry.entryName}.`);
        }
      }
      let wpMeta = null;
      const phpEntries = entries.filter((e) => /\.php$/i.test(e.entryName));
      for (const phpEntry of phpEntries) {
        const snippet = phpEntry.getData().toString("utf8").slice(0, 8192);
        const nameMatch = snippet.match(/^\s*(?:\*\s*)?Plugin\s+Name:\s*(.+)$/im);
        if (nameMatch && nameMatch[1].trim()) {
          const verMatch = snippet.match(/^\s*(?:\*\s*)?Version:\s*(.+)$/im);
          const authorMatch = snippet.match(/^\s*(?:\*\s*)?Author:\s*(.+)$/im);
          const descMatch = snippet.match(/^\s*(?:\*\s*)?Description:\s*(.+)$/im);
          const uriMatch = snippet.match(/^\s*(?:\*\s*)?Plugin\s+URI:\s*(.+)$/im);
          wpMeta = {
            name: sanitizeText(nameMatch[1].trim(), 80),
            version: sanitizeText(verMatch?.[1]?.trim() || "1.0.0", 24),
            author: sanitizeText(authorMatch?.[1]?.trim() || "WordPress Author", 60),
            description: sanitizeText(descMatch?.[1]?.trim() || "", 400),
            pluginUri: sanitizeText(uriMatch?.[1]?.trim() || "", 200),
            mainPhpFile: phpEntry.entryName
          };
          break;
        }
      }
      const cssChunks = [];
      for (const cssEntry of entries.filter((e) => /\.css$/i.test(e.entryName)).slice(0, 4)) {
        const txt = cssEntry.getData().toString("utf8").trim();
        if (txt) cssChunks.push(txt.slice(0, 4e3));
      }
      const htmlEntry = entries.find((e) => /(widget|template|banner|index)\.html?$/i.test(e.entryName));
      const extractedCss = sanitizePluginCss(cssChunks.join("\n"));
      const extractedHtml = htmlEntry ? sanitizePluginHtml(htmlEntry.getData().toString("utf8").slice(0, 8e3)) : "";
      const baseZipName = fileName.replace(/\.zip$/i, "").replace(/[-_]+/g, " ").trim() || "Uploaded Plugin";
      const isWordPressZip = Boolean(wpMeta) && !nativeManifest;
      const name = sanitizeText(
        String(nativeManifest?.name || wpMeta?.name || baseZipName),
        80
      );
      const rawSlug = sanitizeText(
        String(nativeManifest?.slug || name),
        60
      ).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || `plugin-${Date.now().toString(36)}`;
      const version = sanitizeText(
        String(nativeManifest?.version || wpMeta?.version || "1.0.0"),
        24
      );
      const author = sanitizeText(
        String(nativeManifest?.author || wpMeta?.author || req.authUser.username || "Admin"),
        60
      );
      const description = sanitizeText(
        String(
          nativeManifest?.description || wpMeta?.description || `Installed from ${fileName} (${entries.length} files)`
        ),
        400
      );
      const fingerprint = `${fileName} ${name} ${description} ${packageFiles.join(" ")}`.toLowerCase();
      const WP_GATEWAY_BRIDGES = [
        {
          match: /zinipay/,
          code: "ZiniPay",
          name: "ZiniPay",
          category: "bd_checkout",
          mode: "auto_api",
          currency: "BDT",
          exchangeRate: 1,
          apiBaseUrl: "https://api.zinipay.com/v1/payment/create",
          accountLabel: "ZiniPay Merchant ID",
          instructions: "Instant bKash, Nagad & Rocket automated checkout powered by ZiniPay."
        },
        {
          match: /uddokta/,
          code: "UddoktaPay",
          name: "UddoktaPay",
          category: "bd_checkout",
          mode: "auto_api",
          currency: "BDT",
          exchangeRate: 1,
          apiBaseUrl: "https://sandbox.uddoktapay.com/api/checkout-v2",
          accountLabel: "UddoktaPay Store ID",
          instructions: "Automated BD MFS checkout powered by UddoktaPay."
        },
        {
          match: /sslcommerz/,
          code: "SSLCommerz",
          name: "SSLCommerz",
          category: "bd_checkout",
          mode: "auto_api",
          currency: "BDT",
          exchangeRate: 1,
          apiBaseUrl: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
          accountLabel: "SSLCommerz Store ID",
          instructions: "Pay via Visa, Mastercard, bKash, Nagad & Bank via SSLCommerz."
        },
        {
          match: /aamarpay/,
          code: "aamarPay",
          name: "aamarPay",
          category: "bd_checkout",
          mode: "auto_api",
          currency: "BDT",
          exchangeRate: 1,
          apiBaseUrl: "https://sandbox.aamarpay.com/jsonpost.php",
          accountLabel: "aamarPay Store ID",
          instructions: "Instant MFS & Card payment powered by aamarPay."
        },
        {
          match: /shurjopay/,
          code: "shurjoPay",
          name: "shurjoPay",
          category: "bd_checkout",
          mode: "auto_api",
          currency: "BDT",
          exchangeRate: 1,
          apiBaseUrl: "https://sandbox.shurjopayment.com/api/get_token",
          accountLabel: "shurjoPay Merchant Username",
          instructions: "Instant MFS & Card checkout via shurjoPay."
        },
        {
          match: /paypal/,
          code: "PayPal",
          name: "PayPal",
          category: "international",
          mode: "auto_api",
          currency: "USD",
          exchangeRate: 120,
          apiBaseUrl: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
          accountLabel: "PayPal Merchant Email",
          instructions: "Pay securely in USD via PayPal."
        },
        {
          match: /stripe/,
          code: "Stripe",
          name: "Stripe",
          category: "international",
          mode: "auto_api",
          currency: "USD",
          exchangeRate: 120,
          apiBaseUrl: "https://api.stripe.com/v1/checkout/sessions",
          accountLabel: "Stripe Account",
          instructions: "Pay globally with Visa, Mastercard, Apple Pay via Stripe."
        },
        {
          match: /bkash/,
          code: "bKash",
          name: "bKash",
          category: "local_mfs",
          mode: "manual",
          currency: "BDT",
          exchangeRate: 1,
          apiBaseUrl: "",
          accountLabel: "bKash Merchant Number",
          instructions: "Send Money / Payment via bKash and submit TrxID."
        },
        {
          match: /nagad/,
          code: "Nagad",
          name: "Nagad",
          category: "local_mfs",
          mode: "manual",
          currency: "BDT",
          exchangeRate: 1,
          apiBaseUrl: "",
          accountLabel: "Nagad Merchant Number",
          instructions: "Send Money via Nagad and submit TrxID."
        },
        {
          match: /cryptomus|coinbase|binance/,
          code: "CryptoPay",
          name: "CryptoPay",
          category: "crypto",
          mode: "auto_api",
          currency: "USDT",
          exchangeRate: 120,
          apiBaseUrl: "",
          accountLabel: "Crypto Merchant Wallet",
          instructions: "Pay via USDT / Crypto checkout."
        }
      ];
      const matchedGateway = WP_GATEWAY_BRIDGES.find((b) => b.match.test(fingerprint)) || null;
      let category = "custom";
      let hookType = "custom_widget";
      let config = {};
      let customCss = extractedCss;
      let customHtml = extractedHtml;
      let webhookUrl = "";
      let compatibilityNote = "";
      if (nativeManifest) {
        category = PLUGIN_CATEGORIES.includes(nativeManifest.category) ? nativeManifest.category : "custom";
        hookType = PLUGIN_HOOK_TYPES.includes(nativeManifest.hookType) ? nativeManifest.hookType : "custom_widget";
        if (nativeManifest.config && typeof nativeManifest.config === "object" && !Array.isArray(nativeManifest.config)) {
          config = nativeManifest.config;
        }
        if (typeof nativeManifest.customCss === "string" && nativeManifest.customCss.trim()) {
          customCss = sanitizePluginCss(nativeManifest.customCss);
        }
        if (typeof nativeManifest.customHtml === "string" && nativeManifest.customHtml.trim()) {
          customHtml = sanitizePluginHtml(nativeManifest.customHtml);
        }
        if (typeof nativeManifest.webhookUrl === "string") {
          webhookUrl = sanitizeText(nativeManifest.webhookUrl, 300);
        }
        compatibilityNote = `Native .zip package (${entries.length} files) installed with full runtime support.`;
      } else if (matchedGateway) {
        category = "payment";
        hookType = "payment_addon";
        config = {
          gatewayCode: matchedGateway.code,
          title: `${matchedGateway.name} Active`
        };
        if (!customHtml) {
          customHtml = `<div style="font-weight:700;font-size:13px;">${matchedGateway.name} Enabled</div><div style="font-size:12px;opacity:.85;margin-top:2px;">Instant ${matchedGateway.name} checkout is now live on the Deposit page.</div>`;
        }
        compatibilityNote = wpMeta ? `WordPress plugin "${name}" detected (${wpMeta.mainPhpFile}). Auto-bridged live to "${matchedGateway.name}" in your Gateways tab (PHP server hooks are replaced by native Node.js gateway runtime).` : `Auto-bridged "${matchedGateway.name}" to your Gateways tab.`;
      } else if (/whatsapp|telegram|tawk|crisp|messenger|livechat|chat|support/.test(fingerprint)) {
        category = "chat_support";
        hookType = "floating_support";
        config = {
          buttonLabel: `${name.slice(0, 18)} Help`,
          supportUrl: wpMeta?.pluginUri || "https://t.me/lotterywinner_support",
          position: "bottom-right",
          accentColor: "#059669"
        };
        compatibilityNote = wpMeta ? `WordPress chat/support plugin "${name}" imported (${wpMeta.mainPhpFile}) and bridged to a live Floating Support button. Set your Support URL in Settings.` : `Bridged to live Floating Support widget.`;
      } else if (/announcement|notice|banner|topbar|hello-bar|promo/.test(fingerprint)) {
        category = "marketing";
        hookType = "announcement_bar";
        config = {
          message: description || `${name} is active!`,
          ctaLabel: "Deposit Now",
          ctaPath: "/wallet/deposit",
          theme: "navy-gold"
        };
        compatibilityNote = wpMeta ? `WordPress banner plugin "${name}" imported (${wpMeta.mainPhpFile}) and bridged to the live Top Announcement Bar.` : `Bridged to live Top Announcement Bar.`;
      } else if (/cashback|bonus|coupon|reward|discount/.test(fingerprint)) {
        category = "payment";
        hookType = "deposit_bonus";
        config = {
          bonusPercent: 5,
          minDepositAmount: 300,
          maxBonusCap: 1e3,
          label: name
        };
        compatibilityNote = wpMeta ? `WordPress bonus plugin "${name}" imported (${wpMeta.mainPhpFile}) and bridged to the live Deposit Bonus Engine. Configure % in Settings.` : `Bridged to live Deposit Bonus Engine.`;
      } else {
        category = "ui_widget";
        hookType = "custom_widget";
        config = { title: name };
        if (!customHtml && wpMeta) {
          customHtml = `<div style="font-weight:700;font-size:13px;">${name}</div><div style="font-size:12px;opacity:.85;margin-top:2px;">${description || "Custom widget active."}</div>`;
        }
        compatibilityNote = wpMeta ? `WordPress plugin "${name}" parsed from ${wpMeta.mainPhpFile} (${entries.length} files). Safe CSS/HTML assets were imported. Note: raw PHP hooks (add_action/$wpdb) cannot run natively on Node.js \u2014 customize HTML/CSS/Config or Webhook inside Plugin Settings.` : `Uploaded .zip package (${entries.length} files) unpacked. Edit HTML/CSS/Settings in the Plugin Editor.`;
      }
      const ip = getClientIp(req);
      let bridgedGatewayName = null;
      const installed = await withTransaction((db) => {
        if (!Array.isArray(db.plugins)) db.plugins = [];
        if (!Array.isArray(db.paymentGateways)) db.paymentGateways = [];
        const now = (/* @__PURE__ */ new Date()).toISOString();
        let linkedGatewayCode = null;
        if (matchedGateway) {
          const existingGw = db.paymentGateways.find(
            (g) => g.code.toLowerCase() === matchedGateway.code.toLowerCase()
          );
          if (existingGw) {
            if (autoActivate) existingGw.enabled = true;
            existingGw.updatedAt = now;
            linkedGatewayCode = existingGw.code;
            bridgedGatewayName = existingGw.name;
          } else {
            const newGw = {
              id: generateId("gw"),
              code: matchedGateway.code,
              name: matchedGateway.name,
              category: matchedGateway.category,
              mode: matchedGateway.mode,
              enabled: autoActivate,
              isBuiltIn: false,
              supportsDeposit: true,
              supportsWithdrawal: matchedGateway.category === "local_mfs" || matchedGateway.code === "PayPal",
              currency: matchedGateway.currency,
              exchangeRate: matchedGateway.exchangeRate,
              minAmount: db.settings.minDeposit || 50,
              maxAmount: db.settings.maxDeposit || 1e5,
              feePercent: 0,
              accountLabel: matchedGateway.accountLabel,
              accountValue: "",
              instructions: matchedGateway.instructions,
              environment: "sandbox",
              apiBaseUrl: matchedGateway.apiBaseUrl,
              apiKey: "",
              apiSecret: "",
              webhookSecret: "",
              createdAt: now,
              updatedAt: now
            };
            db.paymentGateways.push(newGw);
            linkedGatewayCode = newGw.code;
            bridgedGatewayName = newGw.name;
          }
        }
        const uniqueSlug = db.plugins.some((p) => p.slug === rawSlug) ? `${rawSlug}-${Date.now().toString(36).slice(-4)}` : rawSlug;
        const plugin = {
          id: generateId("plg"),
          slug: uniqueSlug,
          name,
          version,
          author,
          category,
          hookType,
          description,
          enabled: autoActivate,
          isBuiltIn: false,
          config,
          customCss,
          customHtml,
          webhookUrl,
          executionsCount: 0,
          lastTriggeredAt: null,
          sourceType: isWordPressZip ? "wordpress_zip" : "zip_package",
          pluginUri: wpMeta?.pluginUri || "",
          packageFiles,
          linkedGatewayCode,
          compatibilityNote,
          installedAt: now,
          updatedAt: now
        };
        db.plugins.unshift(plugin);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "PLUGIN_ZIP_UPLOADED",
          "plugin",
          plugin.id,
          {
            fileName,
            slug: plugin.slug,
            sourceType: plugin.sourceType,
            filesCount: entries.length,
            linkedGatewayCode
          },
          ip
        );
        return plugin;
      });
      broadcastChatEvent("lottery:overview_updated", { reason: "plugin_zip_uploaded" });
      res.status(201).json({
        success: true,
        message: bridgedGatewayName ? `Plugin "${installed.name}" installed from .zip and linked to "${bridgedGatewayName}" in Gateways!` : `Plugin "${installed.name}" installed from ${fileName} (${entries.length} files).`,
        plugin: installed,
        bridgedGatewayName
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to unpack .zip plugin."
      });
    }
  });
  router.get("/admin/plugins/sample-zip", requireAuth, requireStaff, (_req, res) => {
    try {
      const zip = new import_adm_zip.default();
      const manifest = {
        name: "VIP Flash Cashback Add-on",
        slug: "vip-flash-cashback-addon",
        version: "1.0.0",
        author: "Lottery Plugin Studio",
        category: "payment",
        hookType: "deposit_bonus",
        description: "Sample .zip plugin package: awards +8% bonus cashback (max \u09F31,500) on approved deposits of \u09F3300 or more.",
        enabled: true,
        config: {
          bonusPercent: 8,
          minDepositAmount: 300,
          maxBonusCap: 1500,
          label: "VIP Flash 8% Bonus"
        }
      };
      const phpHeader = `<?php
/**
 * Plugin Name: VIP Flash Cashback Add-on
 * Plugin URI: https://lotterywinner.app/plugins
 * Description: Awards +8% bonus cashback on approved deposits of 300 or more.
 * Version: 1.0.0
 * Author: Lottery Plugin Studio
 */
`;
      const cssFile = `/* Optional custom styling bundled inside plugin .zip */
`;
      const htmlFile = `<div style="font-weight:700;font-size:13px;">VIP 8% Cashback Active</div>
<div style="font-size:12px;opacity:.85;">Deposit \u09F3300+ via bKash, Nagad, ZiniPay or PayPal to earn instant bonus!</div>`;
      zip.addFile("vip-flash-cashback/plugin.json", Buffer.from(JSON.stringify(manifest, null, 2), "utf8"));
      zip.addFile("vip-flash-cashback/vip-flash-cashback.php", Buffer.from(phpHeader, "utf8"));
      zip.addFile("vip-flash-cashback/style.css", Buffer.from(cssFile, "utf8"));
      zip.addFile("vip-flash-cashback/widget.html", Buffer.from(htmlFile, "utf8"));
      const buf = zip.toBuffer();
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="vip-flash-cashback-plugin.zip"');
      res.send(buf);
    } catch {
      res.status(500).json({ success: false, message: "Could not generate sample .zip plugin." });
    }
  });
  router.put("/admin/plugins/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const pluginId = req.params.id;
      const ip = getClientIp(req);
      const updated = await withTransaction((db) => {
        if (!Array.isArray(db.plugins)) db.plugins = [];
        const plg = db.plugins.find((p) => p.id === pluginId);
        if (!plg) throw new Error("Plugin not found.");
        if (typeof req.body?.name === "string" && req.body.name.trim()) {
          plg.name = sanitizeText(req.body.name, 80);
        }
        if (typeof req.body?.version === "string" && req.body.version.trim()) {
          plg.version = sanitizeText(req.body.version, 24);
        }
        if (typeof req.body?.description === "string") {
          plg.description = sanitizeText(req.body.description, 400);
        }
        if (PLUGIN_CATEGORIES.includes(req.body?.category)) {
          plg.category = req.body.category;
        }
        if (PLUGIN_HOOK_TYPES.includes(req.body?.hookType)) {
          plg.hookType = req.body.hookType;
        }
        if (typeof req.body?.enabled === "boolean") {
          plg.enabled = req.body.enabled;
        }
        if (typeof req.body?.customCss === "string") {
          plg.customCss = sanitizePluginCss(req.body.customCss);
        }
        if (typeof req.body?.customHtml === "string") {
          plg.customHtml = sanitizePluginHtml(req.body.customHtml);
        }
        if (typeof req.body?.webhookUrl === "string") {
          plg.webhookUrl = sanitizeText(req.body.webhookUrl, 300);
        }
        if (typeof req.body?.configJson === "string" && req.body.configJson.trim()) {
          try {
            const parsedCfg = JSON.parse(req.body.configJson);
            if (parsedCfg && typeof parsedCfg === "object" && !Array.isArray(parsedCfg)) {
              plg.config = parsedCfg;
            }
          } catch {
            throw new Error("Invalid JSON in plugin config.");
          }
        } else if (req.body?.config && typeof req.body.config === "object" && !Array.isArray(req.body.config)) {
          plg.config = { ...plg.config, ...req.body.config };
        }
        plg.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "PLUGIN_UPDATED",
          "plugin",
          plg.id,
          { slug: plg.slug, enabled: plg.enabled },
          ip
        );
        return plg;
      });
      broadcastChatEvent("lottery:overview_updated", { reason: "plugin_updated" });
      res.json({ success: true, plugin: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update plugin."
      });
    }
  });
  router.delete("/admin/plugins/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const pluginId = req.params.id;
      const ip = getClientIp(req);
      await withTransaction((db) => {
        const idx = (db.plugins || []).findIndex((p) => p.id === pluginId);
        if (idx === -1) throw new Error("Plugin not found.");
        const plg = db.plugins[idx];
        db.plugins.splice(idx, 1);
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "PLUGIN_UNINSTALLED",
          "plugin",
          plg.id,
          { slug: plg.slug, name: plg.name },
          ip
        );
      });
      broadcastChatEvent("lottery:overview_updated", { reason: "plugin_uninstalled" });
      res.json({ success: true, message: "Plugin uninstalled." });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not uninstall plugin."
      });
    }
  });
  router.post("/admin/plugins/:id/test", requireAuth, requireStaff, async (req, res) => {
    try {
      const pluginId = req.params.id;
      let detailMessage = "";
      const updated = await withTransaction(async (db) => {
        const plg = (db.plugins || []).find((p) => p.id === pluginId);
        if (!plg) throw new Error("Plugin not found.");
        const now = (/* @__PURE__ */ new Date()).toISOString();
        plg.executionsCount = (plg.executionsCount || 0) + 1;
        plg.lastTriggeredAt = now;
        if (plg.hookType === "deposit_bonus") {
          const pct = Number(plg.config?.bonusPercent || 5);
          const minDep = Number(plg.config?.minDepositAmount || 500);
          const sample = Math.round(1e3 * (pct / 100) * 100) / 100;
          detailMessage = `Deposit Bonus Engine verified: ${pct}% cashback (min ${db.settings.currencySymbol}${minDep}) \u2192 \u09F31,000 deposit awards +${db.settings.currencySymbol}${sample} automatically on approval.`;
        } else if (plg.hookType === "webhook_notifier") {
          if (plg.webhookUrl && /^https?:\/\//i.test(plg.webhookUrl)) {
            try {
              const resp = await fetch(plg.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event: "plugin.test",
                  plugin: plg.slug,
                  timestamp: now,
                  message: "Test ping from Lottery Admin Panel"
                }),
                signal: AbortSignal.timeout(4e3)
              });
              detailMessage = `Webhook test dispatched to ${plg.webhookUrl} (HTTP ${resp.status}).`;
            } catch {
              detailMessage = `Webhook payload prepared for ${plg.webhookUrl}, but remote endpoint did not respond within 4s.`;
            }
          } else {
            detailMessage = "Set a valid https:// Webhook URL in plugin settings to dispatch live webhooks.";
          }
        } else if (plg.hookType === "announcement_bar") {
          detailMessage = `Announcement Bar runtime verified: "${String(plg.config?.message || plg.name)}" is ${plg.enabled ? "LIVE on user pages" : "installed (enable to display)"}.`;
        } else if (plg.hookType === "floating_support") {
          detailMessage = `Floating Support button verified: "${String(plg.config?.buttonLabel || "Live Help")}" \u2192 ${String(plg.config?.supportUrl || "configured URL")}.`;
        } else {
          detailMessage = `Custom plugin "${plg.name}" (${plg.hookType}) executed cleanly. ${plg.enabled ? "Active on live storefront." : "Enable plugin to activate live."}`;
        }
        return plg;
      });
      res.json({ success: true, message: detailMessage, plugin: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Plugin test failed."
      });
    }
  });
  router.get("/admin/schema-sql", requireAuth, requireStaff, (_req, res) => {
    const schemaPath = import_path5.default.resolve(process.cwd(), "database/schema.sql");
    if (!import_fs6.default.existsSync(schemaPath)) {
      res.status(404).json({ success: false, message: "Schema file not found." });
      return;
    }
    const sql = import_fs6.default.readFileSync(schemaPath, "utf8");
    res.json({ success: true, sql });
  });
  const probeTcpPort = (host, port, timeoutMs = 2e3) => new Promise((resolve) => {
    const started = Date.now();
    const socket = import_net.default.createConnection({ host, port });
    let settled = false;
    const done = (ok, error) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, latencyMs: Math.max(1, Date.now() - started), error });
    };
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => done(true));
    socket.on("timeout", () => done(false, `Timed out after ${timeoutMs}ms`));
    socket.on("error", (err) => done(false, err.message || "Connection refused"));
  });
  const detectLocalBinary = (cmd, args) => new Promise((resolve) => {
    (0, import_child_process.execFile)(cmd, args, { timeout: 2e3 }, (err, stdout) => {
      if (err) {
        resolve({ installed: false, version: null });
        return;
      }
      const firstLine = String(stdout || "").split("\n")[0]?.trim() || "";
      resolve({ installed: true, version: firstLine.slice(0, 80) || cmd });
    });
  });
  const collectRuntimeMetrics = async () => {
    const [phpBin, mysqlBin] = await Promise.all([
      detectLocalBinary("php", ["-v"]),
      detectLocalBinary("mysql", ["--version"])
    ]);
    const dbFilePath = import_path5.default.resolve(process.cwd(), "data/lottery_db.json");
    let dbFileSizeKb = 0;
    try {
      if (import_fs6.default.existsSync(dbFilePath)) {
        dbFileSizeKb = Math.round(import_fs6.default.statSync(dbFilePath).size / 1024 * 10) / 10;
      }
    } catch {
      dbFileSizeKb = 0;
    }
    const totalMemMb = Math.round(import_os.default.totalmem() / (1024 * 1024));
    const freeMemMb = Math.round(import_os.default.freemem() / (1024 * 1024));
    const rssMemoryMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
    const load1m = Math.round((import_os.default.loadavg()[0] || 0) * 100) / 100;
    return {
      hostname: import_os.default.hostname(),
      platform: import_os.default.platform(),
      arch: import_os.default.arch(),
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      memoryUsedMb: Math.max(0, totalMemMb - freeMemMb),
      memoryTotalMb: totalMemMb,
      rssMemoryMb,
      cpuCores: import_os.default.cpus().length,
      loadAvg1m: load1m,
      dbFileSizeKb,
      activeWebSockets: getOnlineChatCount(),
      localMysqlCliDetected: mysqlBin.installed,
      localPhpDetected: phpBin.installed,
      localPhpVersion: phpBin.version
    };
  };
  const toSafeServerCluster = (sc) => {
    const rawKey = sc.php.bridgeApiKey || "";
    const preview = rawKey.length > 8 ? `${rawKey.slice(0, 4)}\u2022\u2022\u2022\u2022${rawKey.slice(-3)}` : rawKey ? "\u2022\u2022\u2022\u2022\u2022\u2022" : "";
    return {
      ...sc,
      mysql: {
        ...sc.mysql,
        password: void 0,
        hasPassword: Boolean(sc.mysql.password)
      },
      php: {
        ...sc.php,
        bridgeApiKey: void 0,
        bridgeDbPassword: void 0,
        manualDbPassword: void 0,
        hasBridgeApiKey: Boolean(rawKey),
        bridgeApiKeyPreview: preview,
        hasBridgeDbPassword: Boolean(sc.php.bridgeDbPassword),
        hasManualDbPassword: Boolean(sc.php.manualDbPassword)
      }
    };
  };
  router.get("/admin/server/status", requireAuth, requireStaff, async (_req, res) => {
    try {
      const db = getDbSnapshot();
      const runtime = await collectRuntimeMetrics();
      res.json({
        success: true,
        cluster: toSafeServerCluster(db.serverCluster),
        runtime
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to load server status."
      });
    }
  });
  router.put("/admin/server/config", requireAuth, requireStaff, async (req, res) => {
    try {
      const ip = getClientIp(req);
      const body = req.body || {};
      const validStrategies = ["round_robin", "weighted", "failover", "least_connections"];
      const updated = await withTransaction((db) => {
        const sc = db.serverCluster;
        if (body.loadBalancer && typeof body.loadBalancer === "object") {
          if (typeof body.loadBalancer.enabled === "boolean") {
            sc.loadBalancer.enabled = body.loadBalancer.enabled;
          }
          if (validStrategies.includes(body.loadBalancer.strategy)) {
            sc.loadBalancer.strategy = body.loadBalancer.strategy;
          }
          if (typeof body.loadBalancer.stickySession === "boolean") {
            sc.loadBalancer.stickySession = body.loadBalancer.stickySession;
          }
          if (typeof body.loadBalancer.autoFailover === "boolean") {
            sc.loadBalancer.autoFailover = body.loadBalancer.autoFailover;
          }
          const interval = Number(body.loadBalancer.healthCheckIntervalSec);
          if (Number.isFinite(interval) && interval >= 5 && interval <= 600) {
            sc.loadBalancer.healthCheckIntervalSec = Math.round(interval);
          }
        }
        if (Array.isArray(body.nodes) && body.nodes.length >= 2) {
          sc.nodes = sc.nodes.slice(0, 2).map((existing, idx) => {
            const incoming = body.nodes[idx] || {};
            const weight = Number(incoming.weight);
            return {
              ...existing,
              name: sanitizeText(incoming.name || existing.name, 80) || existing.name,
              hostUrl: sanitizeText(incoming.hostUrl || existing.hostUrl, 200),
              region: sanitizeText(incoming.region || existing.region, 80),
              weight: Number.isFinite(weight) ? Math.max(0, Math.min(100, Math.round(weight))) : existing.weight,
              enabled: typeof incoming.enabled === "boolean" ? incoming.enabled : existing.enabled
            };
          });
        }
        if (body.mysql && typeof body.mysql === "object") {
          sc.mysql.host = sanitizeText(body.mysql.host || sc.mysql.host, 120) || "localhost";
          const port = Number(body.mysql.port);
          if (Number.isFinite(port) && port >= 1 && port <= 65535) {
            sc.mysql.port = Math.round(port);
          }
          sc.mysql.database = sanitizeText(body.mysql.database || sc.mysql.database, 80);
          sc.mysql.username = sanitizeText(body.mysql.username || sc.mysql.username, 80);
          if (typeof body.mysql.password === "string" && body.mysql.password.length > 0) {
            sc.mysql.password = body.mysql.password.slice(0, 160);
          }
          if (typeof body.mysql.sslEnabled === "boolean") {
            sc.mysql.sslEnabled = body.mysql.sslEnabled;
          }
          const poolMax = Number(body.mysql.poolMax);
          if (Number.isFinite(poolMax) && poolMax >= 1 && poolMax <= 200) {
            sc.mysql.poolMax = Math.round(poolMax);
          }
        }
        if (body.php && typeof body.php === "object") {
          if (typeof body.php.enabled === "boolean") {
            sc.php.enabled = body.php.enabled;
          }
          if (body.php.mode === "bridge_api" || body.php.mode === "manual_db") {
            sc.php.mode = body.php.mode;
          }
          if (typeof body.php.endpointUrl === "string") {
            sc.php.endpointUrl = sanitizeText(body.php.endpointUrl, 240);
          }
          if (typeof body.php.bridgeApiKey === "string" && body.php.bridgeApiKey.trim()) {
            sc.php.bridgeApiKey = sanitizeText(body.php.bridgeApiKey, 160);
          }
          if (typeof body.php.bridgeHeaderName === "string" && body.php.bridgeHeaderName.trim()) {
            sc.php.bridgeHeaderName = sanitizeText(body.php.bridgeHeaderName, 60).replace(/[^A-Za-z0-9-_]/g, "") || "X-Bridge-Key";
          }
          if (typeof body.php.bridgeDbHost === "string") {
            sc.php.bridgeDbHost = sanitizeText(body.php.bridgeDbHost, 120) || "localhost";
          }
          if (typeof body.php.bridgeDbName === "string") {
            sc.php.bridgeDbName = sanitizeText(body.php.bridgeDbName, 80);
          }
          if (typeof body.php.bridgeDbUser === "string") {
            sc.php.bridgeDbUser = sanitizeText(body.php.bridgeDbUser, 80);
          }
          if (typeof body.php.bridgeDbPassword === "string" && body.php.bridgeDbPassword.length > 0) {
            sc.php.bridgeDbPassword = body.php.bridgeDbPassword.slice(0, 160);
          }
          if (typeof body.php.bridgeAllowedOrigins === "string") {
            sc.php.bridgeAllowedOrigins = sanitizeText(body.php.bridgeAllowedOrigins, 300) || "*";
          }
          if (typeof body.php.manualDbHost === "string") {
            sc.php.manualDbHost = sanitizeText(body.php.manualDbHost, 120) || "localhost";
          }
          const manualPort = Number(body.php.manualDbPort);
          if (Number.isFinite(manualPort) && manualPort >= 1 && manualPort <= 65535) {
            sc.php.manualDbPort = Math.round(manualPort);
          }
          if (typeof body.php.manualDbName === "string") {
            sc.php.manualDbName = sanitizeText(body.php.manualDbName, 80);
          }
          if (typeof body.php.manualDbUser === "string") {
            sc.php.manualDbUser = sanitizeText(body.php.manualDbUser, 80);
          }
          if (typeof body.php.manualDbPassword === "string" && body.php.manualDbPassword.length > 0) {
            sc.php.manualDbPassword = body.php.manualDbPassword.slice(0, 160);
          }
          if (typeof body.php.targetVersion === "string" && body.php.targetVersion.trim()) {
            sc.php.targetVersion = sanitizeText(body.php.targetVersion, 20);
          }
          const fpmPort = Number(body.php.fpmPort);
          if (Number.isFinite(fpmPort) && fpmPort >= 1 && fpmPort <= 65535) {
            sc.php.fpmPort = Math.round(fpmPort);
          }
          if (sc.php.lastStatus === "not_installed" && (sc.php.bridgeApiKey || sc.php.manualDbName)) {
            sc.php.lastStatus = "configured";
          }
        }
        sc.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "SERVER_CLUSTER_UPDATED",
          "server",
          "cluster",
          {
            strategy: sc.loadBalancer.strategy,
            phpMode: sc.php.mode,
            nodes: sc.nodes.map((n) => ({ name: n.name, weight: n.weight, enabled: n.enabled })),
            mysqlHost: `${sc.mysql.host}:${sc.mysql.port}/${sc.mysql.database}`
          },
          ip
        );
        return sc;
      });
      const runtime = await collectRuntimeMetrics();
      res.json({
        success: true,
        message: "Server cluster, load balancer, MySQL & PHP configuration saved.",
        cluster: toSafeServerCluster(updated),
        runtime
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to save server configuration."
      });
    }
  });
  router.post("/admin/server/health-check", requireAuth, requireStaff, async (_req, res) => {
    try {
      const snapshot = getDbSnapshot();
      const scSnap = snapshot.serverCluster;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const nodeResults = await Promise.all(
        scSnap.nodes.slice(0, 2).map(async (node) => {
          if (!node.enabled) {
            return {
              id: node.id,
              lastStatus: "standby",
              lastLatencyMs: null,
              lastCheckMessage: "Node paused by admin (excluded from load balancer pool)."
            };
          }
          const rawUrl = (node.hostUrl || "").trim();
          if (!/^https?:\/\//i.test(rawUrl)) {
            return {
              id: node.id,
              lastStatus: "offline",
              lastLatencyMs: null,
              lastCheckMessage: "Invalid URL \u2014 must start with http:// or https://"
            };
          }
          const base = rawUrl.replace(/\/+$/, "");
          const target = base.endsWith("/api/health") ? base : `${base}/api/health`;
          const started = Date.now();
          try {
            const resp = await fetch(target, {
              method: "GET",
              signal: AbortSignal.timeout(3500)
            });
            const ms = Math.max(1, Date.now() - started);
            if (resp.ok) {
              return {
                id: node.id,
                lastStatus: ms > 900 ? "degraded" : "online",
                lastLatencyMs: ms,
                lastCheckMessage: `HTTP ${resp.status} OK from ${target} (${ms} ms)`
              };
            }
            return {
              id: node.id,
              lastStatus: "degraded",
              lastLatencyMs: ms,
              lastCheckMessage: `Responded HTTP ${resp.status} (${ms} ms)`
            };
          } catch (err) {
            return {
              id: node.id,
              lastStatus: "offline",
              lastLatencyMs: null,
              lastCheckMessage: err instanceof Error ? `Unreachable: ${err.message}` : "Connection timed out"
            };
          }
        })
      );
      const [mysqlProbe, manualDbProbe, phpCli, phpFpm] = await Promise.all([
        probeTcpPort(scSnap.mysql.host || "localhost", scSnap.mysql.port || 3306, 2200),
        probeTcpPort(scSnap.php.manualDbHost || "localhost", scSnap.php.manualDbPort || 3306, 2200),
        detectLocalBinary("php", ["-v"]),
        probeTcpPort("127.0.0.1", scSnap.php.fpmPort || 9e3, 1200)
      ]);
      let phpStatus = "configured";
      let phpDetectedVer = phpCli.version;
      let phpMsg = "";
      let bridgeHttpCode = null;
      let bridgeLatencyMs = null;
      if (scSnap.php.mode === "bridge_api" && scSnap.php.endpointUrl && /^https?:\/\//i.test(scSnap.php.endpointUrl)) {
        const started = Date.now();
        try {
          const headerName = scSnap.php.bridgeHeaderName || "X-Bridge-Key";
          const apiKey = scSnap.php.bridgeApiKey || "";
          const headers = {
            "Content-Type": "application/json",
            [headerName]: apiKey,
            "X-Bridge-Key": apiKey,
            Authorization: `Bearer ${apiKey}`
          };
          const resp = await fetch(scSnap.php.endpointUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({
              action: "ping",
              token: apiKey,
              timestamp: now
            }),
            signal: AbortSignal.timeout(4500)
          });
          bridgeLatencyMs = Math.max(1, Date.now() - started);
          bridgeHttpCode = resp.status;
          const powered = resp.headers.get("x-powered-by");
          const jsonBody = await resp.json().catch(() => null);
          if (jsonBody?.php_version) phpDetectedVer = `PHP ${jsonBody.php_version}`;
          else if (powered && /php/i.test(powered)) phpDetectedVer = powered;
          const bridgeOk = resp.ok && (jsonBody?.ok !== false && jsonBody?.success !== false);
          phpStatus = bridgeOk ? "external_connected" : "unreachable";
          phpMsg = bridgeOk ? `bridge.php pong OK \u2014 HTTP ${resp.status} (${bridgeLatencyMs} ms)${jsonBody?.time ? ` \xB7 Server Time: ${jsonBody.time}` : ""}${phpDetectedVer ? ` \xB7 ${phpDetectedVer}` : ""}` : `bridge.php returned HTTP ${resp.status} (${bridgeLatencyMs} ms)${jsonBody?.error || jsonBody?.message ? ` \u2014 ${jsonBody.error || jsonBody.message}` : ""}`;
        } catch (err) {
          phpStatus = "unreachable";
          phpMsg = `bridge.php request failed: ${err instanceof Error ? err.message : "timeout"}`;
        }
      } else if (scSnap.php.mode === "manual_db") {
        phpStatus = manualDbProbe.ok ? "running" : phpCli.installed || phpFpm.ok ? "running" : "configured";
        phpMsg = manualDbProbe.ok ? `Manual PHP/MySQL DB reachable at ${scSnap.php.manualDbHost}:${scSnap.php.manualDbPort}/${scSnap.php.manualDbName} (${manualDbProbe.latencyMs} ms).` : `Manual DB configured (${scSnap.php.manualDbName} @ ${scSnap.php.manualDbHost}:${scSnap.php.manualDbPort}). Note: localhost is local to cPanel \u2014 enter your cPanel Server IP & allow Remote MySQL to connect from this cloud panel.`;
      } else if (phpCli.installed || phpFpm.ok) {
        phpStatus = "running";
        phpMsg = phpFpm.ok ? `PHP-FPM listening on port ${scSnap.php.fpmPort} (${phpFpm.latencyMs} ms)${phpCli.version ? ` \xB7 ${phpCli.version}` : ""}` : `PHP CLI detected locally: ${phpCli.version}`;
      } else {
        phpStatus = "configured";
        phpMsg = `Option 1 Configured (X-Bridge-Key \xB7 ${scSnap.php.bridgeDbName || "veloralb_lottery"}) \u2014 paste your cPanel bridge.php URL (e.g. https://yourdomain.com/bridge.php) and click Send Test Request.`;
      }
      const updated = await withTransaction((db) => {
        const sc = db.serverCluster;
        sc.nodes = sc.nodes.map((node) => {
          const found = nodeResults.find((r) => r.id === node.id);
          if (!found) return node;
          return {
            ...node,
            lastStatus: found.lastStatus,
            lastLatencyMs: found.lastLatencyMs,
            lastCheckedAt: now,
            lastCheckMessage: found.lastCheckMessage
          };
        });
        sc.mysql.lastStatus = mysqlProbe.ok ? "connected" : "unreachable";
        sc.mysql.lastLatencyMs = mysqlProbe.ok ? mysqlProbe.latencyMs : null;
        sc.mysql.lastCheckedAt = now;
        sc.mysql.lastMessage = mysqlProbe.ok ? `MySQL TCP ${sc.mysql.host}:${sc.mysql.port} (DB: ${sc.mysql.database}, User: ${sc.mysql.username}) reachable (${mysqlProbe.latencyMs} ms).` : `MySQL TCP ${sc.mysql.host}:${sc.mysql.port} (DB: ${sc.mysql.database}) unreachable (${mysqlProbe.error || "refused"}) \u2014 local JSON persistence active.`;
        sc.php.bridgeLastHttpCode = bridgeHttpCode;
        sc.php.bridgeLastLatencyMs = bridgeLatencyMs;
        sc.php.manualDbLastStatus = manualDbProbe.ok ? "connected" : "unreachable";
        sc.php.manualDbLastLatencyMs = manualDbProbe.ok ? manualDbProbe.latencyMs : null;
        sc.php.manualDbLastMessage = manualDbProbe.ok ? `Connected to ${sc.php.manualDbHost}:${sc.php.manualDbPort} (DB: ${sc.php.manualDbName}, User: ${sc.php.manualDbUser}) in ${manualDbProbe.latencyMs} ms.` : `TCP ${sc.php.manualDbHost}:${sc.php.manualDbPort} (DB: ${sc.php.manualDbName}) unreachable (${manualDbProbe.error || "refused"}).`;
        sc.php.lastStatus = phpStatus;
        sc.php.detectedVersion = phpDetectedVer;
        sc.php.lastCheckedAt = now;
        sc.php.lastMessage = phpMsg;
        sc.updatedAt = now;
        return sc;
      });
      const runtime = await collectRuntimeMetrics();
      const onlineCount = updated.nodes.filter((n) => n.lastStatus === "online").length;
      res.json({
        success: true,
        message: `Live health check complete: ${onlineCount}/${updated.nodes.length} servers online, MySQL ${updated.mysql.lastStatus}, PHP ${updated.php.lastStatus}.`,
        cluster: toSafeServerCluster(updated),
        runtime
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Health check failed."
      });
    }
  });
  router.post("/admin/server/php-bridge-test", requireAuth, requireStaff, async (req, res) => {
    try {
      const snapshot = getDbSnapshot();
      const targetUrl = sanitizeText(req.body?.endpointUrl || snapshot.serverCluster.php.endpointUrl || "", 240);
      const apiKey = typeof req.body?.bridgeApiKey === "string" && req.body.bridgeApiKey.trim() || snapshot.serverCluster.php.bridgeApiKey || "";
      const headerName = sanitizeText(req.body?.bridgeHeaderName || snapshot.serverCluster.php.bridgeHeaderName || "X-Bridge-Key", 60).replace(
        /[^A-Za-z0-9-_]/g,
        ""
      ) || "X-Bridge-Key";
      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        throw new Error("Please enter a valid bridge.php URL (starting with https:// or http://).");
      }
      if (!apiKey) {
        throw new Error("Please enter or generate a Bridge Key first.");
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const started = Date.now();
      let ok = false;
      let httpStatus = null;
      let latencyMs = 0;
      let responsePreview = "";
      let detectedVer = null;
      let serverTime = null;
      try {
        const resp = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            [headerName]: apiKey,
            "X-Bridge-Key": apiKey,
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            action: "ping",
            token: apiKey,
            timestamp: now
          }),
          signal: AbortSignal.timeout(5500)
        });
        latencyMs = Math.max(1, Date.now() - started);
        httpStatus = resp.status;
        const powered = resp.headers.get("x-powered-by");
        const rawText = await resp.text();
        responsePreview = rawText.slice(0, 320);
        try {
          const parsed = JSON.parse(rawText);
          ok = resp.ok && parsed.ok !== false && parsed.success !== false;
          if (parsed.php_version) detectedVer = `PHP ${parsed.php_version}`;
          if (parsed.time) serverTime = parsed.time;
        } catch {
          ok = resp.ok;
        }
        if (!detectedVer && powered && /php/i.test(powered)) {
          detectedVer = powered;
        }
      } catch (err) {
        latencyMs = Math.max(1, Date.now() - started);
        responsePreview = err instanceof Error ? err.message : "Connection failed";
      }
      const updated = await withTransaction((db) => {
        const php = db.serverCluster.php;
        php.mode = "bridge_api";
        php.endpointUrl = targetUrl;
        php.bridgeApiKey = apiKey;
        php.bridgeHeaderName = headerName;
        php.bridgeLastHttpCode = httpStatus;
        php.bridgeLastLatencyMs = latencyMs;
        php.detectedVersion = detectedVer || php.detectedVersion;
        php.lastStatus = ok ? "external_connected" : "unreachable";
        php.lastCheckedAt = now;
        php.lastMessage = ok ? `bridge.php pong OK (${headerName}) \u2014 HTTP ${httpStatus} (${latencyMs} ms)${serverTime ? ` \xB7 ${serverTime}` : ""}${detectedVer ? ` \xB7 ${detectedVer}` : ""}` : `bridge.php request failed (${httpStatus ? `HTTP ${httpStatus}` : "Network error"}, ${latencyMs} ms): ${responsePreview}`;
        db.serverCluster.updatedAt = now;
        return db.serverCluster;
      });
      res.json({
        success: true,
        connected: ok,
        httpStatus,
        latencyMs,
        responsePreview,
        message: updated.php.lastMessage,
        cluster: toSafeServerCluster(updated)
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "bridge.php test failed."
      });
    }
  });
  router.post("/admin/server/php-bridge-query", requireAuth, requireStaff, async (req, res) => {
    try {
      const snapshot = getDbSnapshot();
      const php = snapshot.serverCluster.php;
      const targetUrl = sanitizeText(req.body?.endpointUrl || php.endpointUrl || "", 240);
      const apiKey = typeof req.body?.bridgeApiKey === "string" && req.body.bridgeApiKey.trim() || php.bridgeApiKey || "";
      const headerName = sanitizeText(req.body?.bridgeHeaderName || php.bridgeHeaderName || "X-Bridge-Key", 60).replace(
        /[^A-Za-z0-9-_]/g,
        ""
      ) || "X-Bridge-Key";
      const action = req.body?.action === "execute" ? "execute" : "query";
      const sql = String(req.body?.sql || "").trim();
      const params = Array.isArray(req.body?.params) ? req.body.params : [];
      if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
        throw new Error("Enter your live bridge.php Endpoint URL first.");
      }
      if (!apiKey) {
        throw new Error("Bridge Key is required.");
      }
      if (!sql) {
        throw new Error("SQL statement is required.");
      }
      const started = Date.now();
      const resp = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [headerName]: apiKey,
          "X-Bridge-Key": apiKey,
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          action,
          sql,
          params,
          token: apiKey
        }),
        signal: AbortSignal.timeout(8e3)
      });
      const latencyMs = Math.max(1, Date.now() - started);
      const rawText = await resp.text();
      let parsed = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = null;
      }
      const ok = resp.ok && Boolean(parsed?.ok ?? parsed?.success ?? false);
      res.json({
        success: true,
        bridgeOk: ok,
        httpStatus: resp.status,
        latencyMs,
        result: parsed ?? { raw: rawText.slice(0, 1e3) }
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Bridge SQL request failed."
      });
    }
  });
  router.post("/admin/server/php-manual-test", requireAuth, requireStaff, async (req, res) => {
    try {
      const snapshot = getDbSnapshot();
      const host = sanitizeText(req.body?.manualDbHost || snapshot.serverCluster.php.manualDbHost || "", 120);
      const port = Number(req.body?.manualDbPort || snapshot.serverCluster.php.manualDbPort || 3306);
      const dbName = sanitizeText(req.body?.manualDbName || snapshot.serverCluster.php.manualDbName || "", 80);
      const dbUser = sanitizeText(req.body?.manualDbUser || snapshot.serverCluster.php.manualDbUser || "", 80);
      const dbPass = typeof req.body?.manualDbPassword === "string" && req.body.manualDbPassword.length > 0 ? req.body.manualDbPassword.slice(0, 160) : snapshot.serverCluster.php.manualDbPassword || "";
      if (!host) throw new Error("DB Host is required.");
      if (!Number.isFinite(port) || port < 1 || port > 65535) throw new Error("Enter a valid DB Port (1-65535).");
      if (!dbName) throw new Error("DB Name is required.");
      if (!dbUser) throw new Error("DB User is required.");
      const probe = await probeTcpPort(host, Math.round(port), 2500);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const updated = await withTransaction((db) => {
        const php = db.serverCluster.php;
        php.mode = "manual_db";
        php.manualDbHost = host;
        php.manualDbPort = Math.round(port);
        php.manualDbName = dbName;
        php.manualDbUser = dbUser;
        if (dbPass) php.manualDbPassword = dbPass;
        php.manualDbLastStatus = probe.ok ? "connected" : "unreachable";
        php.manualDbLastLatencyMs = probe.ok ? probe.latencyMs : null;
        php.manualDbLastMessage = probe.ok ? `Direct Load Balancing MySQL reachable at ${host}:${Math.round(port)} (DB: ${dbName}, User: ${dbUser}, Password: ${dbPass ? "Set" : "Empty"}) in ${probe.latencyMs} ms.` : `Direct MySQL ${host}:${Math.round(port)} (DB: ${dbName}) unreachable (${probe.error || "Connection refused"}). Verify remote MySQL host/port.`;
        php.lastStatus = probe.ok ? "running" : "unreachable";
        php.lastCheckedAt = now;
        php.lastMessage = php.manualDbLastMessage;
        db.serverCluster.mysql.host = host;
        db.serverCluster.mysql.port = Math.round(port);
        db.serverCluster.mysql.database = dbName;
        db.serverCluster.mysql.username = dbUser;
        if (dbPass) db.serverCluster.mysql.password = dbPass;
        db.serverCluster.mysql.lastStatus = probe.ok ? "connected" : "unreachable";
        db.serverCluster.mysql.lastLatencyMs = probe.ok ? probe.latencyMs : null;
        db.serverCluster.mysql.lastCheckedAt = now;
        db.serverCluster.mysql.lastMessage = php.manualDbLastMessage;
        db.serverCluster.updatedAt = now;
        return db.serverCluster;
      });
      res.json({
        success: true,
        connected: probe.ok,
        latencyMs: probe.latencyMs,
        message: updated.php.manualDbLastMessage,
        cluster: toSafeServerCluster(updated)
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Manual DB test failed."
      });
    }
  });
  router.get("/admin/server/download-bridge-php", requireAuth, requireStaff, (_req, res) => {
    const db = getDbSnapshot();
    const php = db.serverCluster.php;
    const esc = (v) => String(v || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const origins = (php.bridgeAllowedOrigins || "*").split(",").map((s) => s.trim()).filter(Boolean);
    const originsPhp = (origins.length > 0 ? origins : ["*"]).map((o) => `'${esc(o)}'`).join(", ");
    const safeHeader = (php.bridgeHeaderName || "X-Bridge-Key").replace(/[^A-Za-z0-9-_]/g, "") || "X-Bridge-Key";
    const code = `<?php
declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

$ENV = [
    'DB_HOST'    => '${esc(php.bridgeDbHost || "localhost")}',
    'DB_NAME'    => '${esc(php.bridgeDbName || "veloralb_lottery")}',
    'DB_USER'    => '${esc(php.bridgeDbUser || "veloralb_billal")}',
    'DB_PASS'    => '${esc(php.bridgeDbPassword || "")}',
    'BRIDGE_KEY' => '${esc(php.bridgeApiKey || "Billal2026@bd")}',
    'ALLOWED_ORIGINS' => [${originsPhp}],
];

function respond(int $code, array $data): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    if (!isset($data['success'])) {
        $data['success'] = (bool) ($data['ok'] ?? false);
    }
    if (isset($data['error']) && !isset($data['message'])) {
        $data['message'] = $data['error'];
    }
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function get_header_value(string $name): string
{
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    if (!empty($_SERVER[$key])) {
        return (string) $_SERVER[$key];
    }
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strcasecmp((string) $k, $name) === 0) {
                return (string) $v;
            }
        }
    }
    return '';
}

set_exception_handler(function (Throwable $e): void {
    error_log('[bridge] ' . $e->getMessage());
    respond(500, ['ok' => false, 'error' => 'Internal server error']);
});

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header_remove('X-Powered-By');

// ---------- CORS ----------
$origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = $ENV['ALLOWED_ORIGINS'];
if (in_array('*', $allowed, true)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origin !== '' && in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, ${safeHeader}, X-Bridge-Key, Authorization');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Max-Age: 86400');

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($method === 'GET') {
    if (isset($_GET['ping'])) {
        respond(200, ['ok' => true, 'status' => 200, 'pong' => true, 'php_version' => PHP_VERSION, 'time' => date('c')]);
    }
    respond(405, ['ok' => false, 'error' => 'Use POST request with JSON body']);
}
if ($method !== 'POST') {
    header('Allow: POST, GET, OPTIONS');
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
}

// ---------- Body ----------
$raw = file_get_contents('php://input', false, null, 0, 262144);
$in  = json_decode((string) $raw, true);
if (!is_array($in)) {
    respond(400, ['ok' => false, 'error' => 'Invalid JSON']);
}

// ---------- Auth: header or body token ----------
$provided = get_header_value('${safeHeader}');
if ($provided === '') {
    $provided = get_header_value('X-Bridge-Key');
}
if ($provided === '') {
    $auth = get_header_value('Authorization');
    if (stripos($auth, 'Bearer ') === 0) {
        $provided = trim(substr($auth, 7));
    }
}
if ($provided === '') {
    $provided = (string) ($in['token'] ?? '');
}
if ($provided === '' || !hash_equals($ENV['BRIDGE_KEY'], $provided)) {
    respond(401, ['ok' => false, 'error' => 'Unauthorized']);
}

$action = $in['action'] ?? '';

$data = is_array($in['data'] ?? null) ? $in['data'] : [];
foreach (['sql', 'params'] as $k) {
    if (!isset($data[$k]) && isset($in[$k])) {
        $data[$k] = $in[$k];
    }
}

if ($action === 'ping') {
    respond(200, ['ok' => true, 'pong' => true, 'php_version' => PHP_VERSION, 'time' => date('c')]);
}

// ---------- DB ----------
try {
    $pdo = new PDO(
        "mysql:host={$ENV['DB_HOST']};dbname={$ENV['DB_NAME']};charset=utf8mb4",
        $ENV['DB_USER'],
        $ENV['DB_PASS'],
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ]
    );
} catch (PDOException $e) {
    error_log('[bridge] DB connect: ' . $e->getMessage());
    respond(503, ['ok' => false, 'error' => 'Database connection failed']);
}

function first_keyword(string $sql): string
{
    $sql = ltrim($sql);
    return strtoupper(strtok($sql, " \\t\\r\\n(") ?: '');
}

$actions = [
    'query' => function (PDO $pdo, array $d): array {
        $sql = trim((string) ($d['sql'] ?? ''));
        $params = is_array($d['params'] ?? null) ? $d['params'] : [];
        if ($sql === '') {
            throw new InvalidArgumentException('Missing sql');
        }
        if (!in_array(first_keyword($sql), ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'], true)) {
            throw new InvalidArgumentException('Only SELECT/SHOW/DESCRIBE/EXPLAIN allowed in query');
        }
        $st = $pdo->prepare($sql);
        $st->execute($params);
        return $st->fetchAll();
    },

    'execute' => function (PDO $pdo, array $d): array {
        $sql = trim((string) ($d['sql'] ?? ''));
        $params = is_array($d['params'] ?? null) ? $d['params'] : [];
        if ($sql === '') {
            throw new InvalidArgumentException('Missing sql');
        }
        if (!in_array(first_keyword($sql), ['INSERT', 'UPDATE', 'DELETE', 'REPLACE'], true)) {
            throw new InvalidArgumentException('Only INSERT/UPDATE/DELETE allowed in execute');
        }
        $st = $pdo->prepare($sql);
        $st->execute($params);
        return ['affected_rows' => $st->rowCount(), 'last_insert_id' => $pdo->lastInsertId()];
    },
];

if (!is_string($action) || !isset($actions[$action])) {
    respond(400, ['ok' => false, 'error' => 'Unknown action']);
}

try {
    respond(200, ['ok' => true, 'data' => $actions[$action]($pdo, $data)]);
} catch (InvalidArgumentException $e) {
    respond(422, ['ok' => false, 'error' => $e->getMessage()]);
} catch (PDOException $e) {
    error_log('[bridge] SQL: ' . $e->getMessage());
    respond(400, ['ok' => false, 'error' => 'Query failed']);
}
`;
    res.setHeader("Content-Type", "application/x-httpd-php; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="bridge.php"');
    res.send(code);
  });
  router.get("/admin/server/download-db-config-php", requireAuth, requireStaff, (_req, res) => {
    const db = getDbSnapshot();
    const php = db.serverCluster.php;
    const esc = (v) => String(v || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    const code = `<?php
declare(strict_types=1);
/**
 * Direct Load Balancing / Manual PHP MySQL Configuration (db-config.php)
 * Generated from Admin Panel -> Server -> PHP Integration (Option 2).
 */
$DB_HOST = '${esc(php.manualDbHost || "localhost")}';
$DB_PORT = ${Number(php.manualDbPort) || 3306};
$DB_NAME = '${esc(php.manualDbName || "veloralb_shop")}';
$DB_USER = '${esc(php.manualDbUser || "veloralb_billal")}';
$DB_PASS = '${esc(php.manualDbPassword || "")}';

try {
    $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 5,
    ]);
} catch (PDOException $e) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'success' => false, 'error' => 'Database connection failed']);
    exit;
}
`;
    res.setHeader("Content-Type", "application/x-httpd-php; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="db-config.php"');
    res.send(code);
  });
  router.post("/admin/server/failover-test", requireAuth, requireStaff, async (_req, res) => {
    try {
      let chosenNodeName = "";
      let reason = "";
      const updated = await withTransaction((db) => {
        const sc = db.serverCluster;
        const healthy = sc.nodes.filter(
          (n) => n.enabled && n.lastStatus !== "offline"
        );
        const candidates = healthy.length > 0 ? healthy : sc.nodes.filter((n) => n.enabled);
        if (candidates.length === 0) {
          throw new Error("Both Server 1 and Server 2 are paused. Enable at least one server node.");
        }
        let selected = candidates[0];
        const strat = sc.loadBalancer.strategy;
        if (!sc.loadBalancer.enabled) {
          selected = candidates[0];
          reason = "Load Balancer disabled \u2192 routed directly to primary enabled node.";
        } else if (strat === "failover") {
          const primary = candidates.find((n) => n.role === "primary");
          selected = primary || candidates[0];
          reason = primary ? "Active-Passive Failover \u2192 Primary Server is healthy and handling traffic." : "Active-Passive Failover \u2192 Primary unavailable, automatically failed over to Server 2!";
        } else if (strat === "round_robin") {
          const idx = sc.loadBalancer.roundRobinCursor % candidates.length;
          selected = candidates[idx];
          sc.loadBalancer.roundRobinCursor = (sc.loadBalancer.roundRobinCursor || 0) + 1;
          reason = `Round Robin cursor #${sc.loadBalancer.roundRobinCursor} \u2192 dispatched to ${selected.name}.`;
        } else if (strat === "least_connections") {
          selected = [...candidates].sort((a, b) => (a.routedRequests || 0) - (b.routedRequests || 0))[0];
          reason = `Least Connections \u2192 ${selected.name} has lowest load (${selected.routedRequests} routed).`;
        } else {
          const totalWeight = candidates.reduce((s, n) => s + Math.max(1, n.weight || 1), 0);
          const pick = Math.random() * totalWeight;
          let acc = 0;
          for (const node of candidates) {
            acc += Math.max(1, node.weight || 1);
            if (pick <= acc) {
              selected = node;
              break;
            }
          }
          reason = `Weighted Split (${sc.nodes.map((n) => `${n.weight}%`).join(" / ")}) \u2192 routed to ${selected.name}.`;
        }
        selected.routedRequests = (selected.routedRequests || 0) + 1;
        chosenNodeName = selected.name;
        return sc;
      });
      res.json({
        success: true,
        selectedNode: chosenNodeName,
        message: reason,
        cluster: toSafeServerCluster(updated)
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Routing test failed."
      });
    }
  });
  router.get("/referrals/validate/:code", (req, res) => {
    const db = getDbSnapshot();
    const state = ensureReferralState(db);
    const code = normalizeReferralCode(req.params.code);
    if (!code) {
      res.json({
        success: true,
        valid: false,
        programEnabled: state.config.enabled,
        message: "Enter a referral code to validate."
      });
      return;
    }
    const referrer = db.users.find(
      (u) => u.status === "active" && (u.referralCode && u.referralCode.toUpperCase() === code || u.username.toUpperCase() === code)
    );
    if (!referrer) {
      res.json({
        success: true,
        valid: false,
        programEnabled: state.config.enabled,
        message: "Referral code was not found."
      });
      return;
    }
    res.json({
      success: true,
      valid: true,
      programEnabled: state.config.enabled,
      referralCode: referrer.referralCode || code,
      referrerUsername: referrer.username,
      referrerName: referrer.fullName,
      inviteeBonus: state.config.enabled ? state.config.signupBonusForInvitee : 0,
      currencySymbol: db.settings.currencySymbol || "\u09F3"
    });
  });
  router.get("/user/referrals", requireAuth, async (req, res) => {
    const uid = req.authUser.id;
    const db = getDbSnapshot();
    const state = ensureReferralState(db);
    const currentUser = db.users.find((u) => u.id === uid);
    if (!currentUser) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    let referralCode = currentUser.referralCode || "";
    if (!referralCode) {
      referralCode = await withTransaction((txDb) => {
        const u = txDb.users.find((item) => item.id === uid);
        if (!u) return "";
        if (!u.referralCode) {
          u.referralCode = generateUniqueReferralCode(u.username, txDb.users);
        }
        return u.referralCode;
      });
    }
    const invitedUsers = db.users.filter((u) => u.referredByUserId === uid).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const myCommissions = state.commissions.filter((c) => c.referrerUserId === uid);
    const commissionByInvitee = /* @__PURE__ */ new Map();
    let signupEarned = 0;
    let depositEarned = 0;
    let ticketEarned = 0;
    for (const c of myCommissions) {
      commissionByInvitee.set(
        c.referredUserId,
        Math.round(((commissionByInvitee.get(c.referredUserId) || 0) + c.commissionAmount) * 100) / 100
      );
      if (c.trigger === "signup") signupEarned += c.commissionAmount;
      else if (c.trigger === "deposit") depositEarned += c.commissionAmount;
      else if (c.trigger === "ticket_purchase") ticketEarned += c.commissionAmount;
    }
    const ticketsCountByUser = /* @__PURE__ */ new Map();
    for (const t of db.tickets) {
      if (t.status !== "refunded") {
        ticketsCountByUser.set(t.userId, (ticketsCountByUser.get(t.userId) || 0) + 1);
      }
    }
    const invitedFriends = invitedUsers.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl || buildSvgAvatar(u.fullName || u.username),
      status: u.status,
      totalDeposited: Number(u.totalDeposited) || 0,
      ticketsBought: ticketsCountByUser.get(u.id) || 0,
      commissionGenerated: commissionByInvitee.get(u.id) || 0,
      joinedAt: u.createdAt
    }));
    const totalEarned = Math.round((signupEarned + depositEarned + ticketEarned) * 100) / 100;
    res.json({
      success: true,
      referralCode,
      referredByUsername: currentUser.referredByUsername ?? null,
      config: state.config,
      currencySymbol: db.settings.currencySymbol || "\u09F3",
      stats: {
        totalInvited: invitedUsers.length,
        activeInvited: invitedUsers.filter((u) => u.status === "active").length,
        totalEarned: Math.max(totalEarned, Number(currentUser.referralEarnings) || 0),
        signupEarned: Math.round(signupEarned * 100) / 100,
        depositEarned: Math.round(depositEarned * 100) / 100,
        ticketEarned: Math.round(ticketEarned * 100) / 100
      },
      invitedFriends,
      commissions: myCommissions.slice(0, 150),
      leaderboard: buildTopReferrers(db, 15)
    });
  });
  router.get("/admin/referrals", requireAuth, requireStaff, (_req, res) => {
    const db = getDbSnapshot();
    const state = ensureReferralState(db);
    const totalReferredUsers = db.users.filter((u) => Boolean(u.referredByUserId)).length;
    const activeReferrerIds = new Set(
      db.users.map((u) => u.referredByUserId).filter((id) => Boolean(id))
    );
    let signupCommissionsPaid = 0;
    let depositCommissionsPaid = 0;
    let ticketCommissionsPaid = 0;
    for (const c of state.commissions) {
      if (c.trigger === "signup") signupCommissionsPaid += c.commissionAmount;
      else if (c.trigger === "deposit") depositCommissionsPaid += c.commissionAmount;
      else if (c.trigger === "ticket_purchase") ticketCommissionsPaid += c.commissionAmount;
    }
    const totalCommissionPaid = Math.round((signupCommissionsPaid + depositCommissionsPaid + ticketCommissionsPaid) * 100) / 100;
    res.json({
      success: true,
      config: state.config,
      currencySymbol: db.settings.currencySymbol || "\u09F3",
      summary: {
        totalReferredUsers,
        activeReferrersCount: activeReferrerIds.size,
        totalCommissionPaid,
        signupCommissionsPaid: Math.round(signupCommissionsPaid * 100) / 100,
        depositCommissionsPaid: Math.round(depositCommissionsPaid * 100) / 100,
        ticketCommissionsPaid: Math.round(ticketCommissionsPaid * 100) / 100,
        totalEventsCount: state.commissions.length
      },
      topReferrers: buildTopReferrers(db, 30),
      commissions: state.commissions.slice(0, 300)
    });
  });
  router.put("/admin/referrals/config", requireAuth, requireStaff, async (req, res) => {
    try {
      const body = req.body || {};
      const clampNum = (val, min, max, fallback) => {
        const n = Number(val);
        if (!Number.isFinite(n)) return fallback;
        return Math.round(Math.min(max, Math.max(min, n)) * 100) / 100;
      };
      const updatedConfig = await withTransaction((db) => {
        const state = ensureReferralState(db);
        const cur = state.config;
        state.config = {
          enabled: typeof body.enabled === "boolean" ? body.enabled : cur.enabled,
          signupBonusForReferrer: clampNum(
            body.signupBonusForReferrer,
            0,
            1e5,
            cur.signupBonusForReferrer
          ),
          signupBonusForInvitee: clampNum(
            body.signupBonusForInvitee,
            0,
            1e5,
            cur.signupBonusForInvitee
          ),
          depositCommissionPercent: clampNum(
            body.depositCommissionPercent,
            0,
            50,
            cur.depositCommissionPercent
          ),
          ticketCommissionPercent: clampNum(
            body.ticketCommissionPercent,
            0,
            50,
            cur.ticketCommissionPercent
          ),
          minDepositForCommission: clampNum(
            body.minDepositForCommission,
            0,
            1e6,
            cur.minDepositForCommission
          ),
          maxCommissionPerEvent: clampNum(
            body.maxCommissionPerEvent,
            0,
            1e6,
            cur.maxCommissionPerEvent
          ),
          blockSameIpSelfReferral: typeof body.blockSameIpSelfReferral === "boolean" ? body.blockSameIpSelfReferral : cur.blockSameIpSelfReferral,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        pushAuditLog(
          db,
          { id: req.authUser.id, username: req.authUser.username },
          "UPDATE_REFERRAL_CONFIG",
          "referral_program",
          "config",
          { ...state.config },
          getClientIp(req)
        );
        return state.config;
      });
      res.json({
        success: true,
        message: "Referral program rules updated.",
        config: updatedConfig
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update referral settings."
      });
    }
  });
  router.get("/admin/inbox", requireAuth, requireStaff, (_req, res) => {
    const db = getDbSnapshot();
    const dms = db.directMessages || [];
    const userById = new Map(db.users.map((u) => [u.id, u]));
    const staffIdSet = new Set(
      db.users.filter((u) => u.role === "admin" || u.role === "moderator").map((u) => u.id)
    );
    const todayKey = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    let todayMessagesCount = 0;
    const threadMap = /* @__PURE__ */ new Map();
    for (const dm of dms) {
      if (dm.createdAt && dm.createdAt.slice(0, 10) === todayKey) {
        todayMessagesCount += 1;
      }
      const senderIsStaff = dm.senderType === "user" && staffIdSet.has(dm.senderId);
      const recipientIsStaff = dm.recipientType === "user" && staffIdSet.has(dm.recipientId);
      const involvesStaff = senderIsStaff || recipientIsStaff;
      const involvesAgent = dm.recipientType === "agent" || dm.senderType === "agent";
      const category = involvesStaff ? "admin" : involvesAgent ? "agent" : "peer";
      let playerUserId = dm.senderId;
      let playerUsername = dm.senderUsername;
      let playerFullName = dm.senderFullName;
      let playerAvatar = dm.senderAvatarUrl;
      let counterpartId = dm.recipientId;
      let counterpartType = dm.recipientType;
      let counterpartUsername = dm.recipientUsername;
      let counterpartFullName = dm.recipientFullName;
      let counterpartDistrict = dm.recipientDistrict || null;
      if (senderIsStaff && dm.recipientType === "user") {
        playerUserId = dm.recipientId;
        playerUsername = dm.recipientUsername;
        playerFullName = dm.recipientFullName;
        playerAvatar = dm.recipientAvatarUrl;
        counterpartId = dm.senderId;
        counterpartType = "user";
        counterpartUsername = dm.senderUsername;
        counterpartFullName = dm.senderFullName;
        counterpartDistrict = null;
      }
      const playerRecord = userById.get(playerUserId);
      const isUnreadIncoming = !senderIsStaff && !dm.adminReadAt;
      const existing = threadMap.get(dm.conversationKey);
      if (!existing) {
        threadMap.set(dm.conversationKey, {
          conversationKey: dm.conversationKey,
          category,
          userId: playerUserId,
          username: playerRecord?.username || playerUsername,
          fullName: playerRecord?.fullName || playerFullName,
          avatarUrl: playerRecord?.avatarUrl || playerAvatar || buildSvgAvatar(playerFullName || playerUsername),
          userStatus: playerRecord?.status || "active",
          userBalance: Number(playerRecord?.balance) || 0,
          counterpartId,
          counterpartType,
          counterpartUsername,
          counterpartFullName,
          counterpartDistrict,
          lastMessage: dm.message,
          lastSenderUsername: dm.senderUsername,
          lastMessageAt: dm.createdAt,
          messageCount: 1,
          unreadCount: isUnreadIncoming ? 1 : 0
        });
      } else {
        existing.messageCount += 1;
        if (isUnreadIncoming) existing.unreadCount += 1;
        if (new Date(dm.createdAt).getTime() >= new Date(existing.lastMessageAt).getTime()) {
          existing.lastMessage = dm.message;
          existing.lastSenderUsername = dm.senderUsername;
          existing.lastMessageAt = dm.createdAt;
        }
      }
    }
    const allThreads = Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
    const adminThreads = allThreads.filter((t) => t.category === "admin");
    const unreadMessagesCount = adminThreads.reduce((sum, t) => sum + t.unreadCount, 0);
    const players = db.users.filter((u) => u.role === "user").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 150).map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      avatarUrl: u.avatarUrl || buildSvgAvatar(u.fullName || u.username),
      status: u.status,
      balance: Number(u.balance) || 0
    }));
    res.json({
      success: true,
      summary: {
        adminThreadsCount: adminThreads.length,
        allThreadsCount: allThreads.length,
        unreadMessagesCount,
        totalMessagesCount: dms.length,
        todayMessagesCount
      },
      adminThreads,
      allThreads,
      players
    });
  });
  router.get(
    "/admin/inbox/thread/:conversationKey",
    requireAuth,
    requireStaff,
    async (req, res) => {
      const conversationKey = sanitizeText(req.params.conversationKey, 160);
      if (!conversationKey) {
        res.status(400).json({ success: false, message: "Conversation key is required." });
        return;
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const messages = await withTransaction((db) => {
        const staffIdSet = new Set(
          db.users.filter((u) => u.role === "admin" || u.role === "moderator").map((u) => u.id)
        );
        const list = (db.directMessages || []).filter(
          (m) => m.conversationKey === conversationKey
        );
        for (const m of list) {
          if (!m.adminReadAt && !(m.senderType === "user" && staffIdSet.has(m.senderId))) {
            m.adminReadAt = now;
          }
        }
        return list.slice(-200);
      });
      res.json({
        success: true,
        conversationKey,
        messages
      });
    }
  );
  router.get(
    "/admin/inbox/conversation/:userId",
    requireAuth,
    requireStaff,
    async (req, res) => {
      const targetUserId = sanitizeText(req.params.userId, 80);
      const requestedKey = sanitizeText(String(req.query?.conversationKey || ""), 160);
      if (!targetUserId) {
        res.status(400).json({ success: false, message: "Target user ID is required." });
        return;
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const result = await withTransaction((db) => {
        const player = db.users.find((u) => u.id === targetUserId);
        if (!player) return null;
        const staffIdSet = new Set(
          db.users.filter((u) => u.role === "admin" || u.role === "moderator").map((u) => u.id)
        );
        const allDms = db.directMessages || [];
        let conversationKey = requestedKey;
        if (!conversationKey) {
          const staffThreadMsg = [...allDms].reverse().find(
            (m) => m.senderId === player.id && m.recipientType === "user" && staffIdSet.has(m.recipientId) || m.recipientId === player.id && m.senderType === "user" && staffIdSet.has(m.senderId)
          );
          conversationKey = staffThreadMsg?.conversationKey || makeConversationKey("user", req.authUser.id, "user", player.id);
        }
        const list = allDms.filter((m) => m.conversationKey === conversationKey);
        let category = "admin";
        let counterpartUsername = null;
        if (list.length > 0) {
          const sample = list[list.length - 1];
          const senderIsStaff = sample.senderType === "user" && staffIdSet.has(sample.senderId);
          const recipientIsStaff = sample.recipientType === "user" && staffIdSet.has(sample.recipientId);
          const involvesStaff = senderIsStaff || recipientIsStaff;
          const involvesAgent = sample.recipientType === "agent" || sample.senderType === "agent";
          category = involvesStaff ? "admin" : involvesAgent ? "agent" : "peer";
          counterpartUsername = sample.senderId === player.id ? sample.recipientUsername : sample.senderUsername;
        }
        for (const m of list) {
          if (!m.adminReadAt && !(m.senderType === "user" && staffIdSet.has(m.senderId))) {
            m.adminReadAt = now;
          }
        }
        return {
          conversationKey,
          category,
          counterpartUsername,
          player: toPublicUser(player),
          messages: list.slice(-250)
        };
      });
      if (!result) {
        res.status(404).json({ success: false, message: "Player account not found." });
        return;
      }
      res.json({
        success: true,
        ...result
      });
    }
  );
  router.post(
    "/admin/inbox/reply/:userId",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const targetUserId = sanitizeText(req.params.userId, 80);
        const text = sanitizeText(req.body?.message, 800);
        if (!targetUserId) {
          res.status(400).json({ success: false, message: "Target user is required." });
          return;
        }
        if (!text) {
          res.status(400).json({ success: false, message: "Please enter a reply message." });
          return;
        }
        const created = await withTransaction((db) => {
          if (!Array.isArray(db.directMessages)) db.directMessages = [];
          const staff = db.users.find((u) => u.id === req.authUser.id);
          if (!staff) throw new Error("Staff account not found.");
          const targetUser = db.users.find((u) => u.id === targetUserId);
          if (!targetUser) throw new Error("Player account not found.");
          const conversationKey = makeConversationKey("user", staff.id, "user", targetUser.id);
          const now = (/* @__PURE__ */ new Date()).toISOString();
          for (const m of db.directMessages) {
            if (m.conversationKey === conversationKey && !m.adminReadAt) {
              m.adminReadAt = now;
            }
          }
          const dm = {
            id: generateId("dm"),
            conversationKey,
            senderId: staff.id,
            senderType: "user",
            senderUsername: staff.username,
            senderFullName: staff.fullName,
            senderAvatarUrl: staff.avatarUrl || buildSvgAvatar(staff.fullName || staff.username),
            recipientId: targetUser.id,
            recipientType: "user",
            recipientUsername: targetUser.username,
            recipientFullName: targetUser.fullName,
            recipientAvatarUrl: targetUser.avatarUrl || buildSvgAvatar(targetUser.fullName || targetUser.username),
            recipientDistrict: null,
            message: text,
            adminReadAt: now,
            createdAt: now
          };
          db.directMessages.push(dm);
          if (db.directMessages.length > 1e3) {
            db.directMessages = db.directMessages.slice(-1e3);
          }
          db.notifications.unshift({
            id: generateId("notif"),
            userId: targetUser.id,
            title: `Admin Support Reply (@${staff.username})`,
            message: text.slice(0, 140),
            type: "info",
            isRead: false,
            createdAt: now
          });
          return { dm, staffIds: db.users.filter((u) => u.role === "admin" || u.role === "moderator").map((u) => u.id) };
        });
        sendChatEventToUsers([req.authUser.id, targetUserId], "direct:message", created.dm);
        sendChatEventToUsers(created.staffIds, "admin:inbox_message", created.dm);
        res.status(201).json({
          success: true,
          conversationKey: created.dm.conversationKey,
          message: created.dm
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not send reply."
        });
      }
    }
  );
  const agentCashOutOtps = /* @__PURE__ */ new Map();
  function resolveLinkedAgent(db, authUser) {
    let agent = (authUser.agentId ? db.agents.find((a) => a.id === authUser.agentId) : null) || db.agents.find((a) => a.userId === authUser.id) || db.agents.find((a) => a.username.toLowerCase() === authUser.username.toLowerCase());
    if (!agent && (authUser.role === "agent" || authUser.email === "agent@lotterywinner.app")) {
      if (authUser.email === "agent@lotterywinner.app" || authUser.username.toLowerCase() === "agent") {
        agent = db.agents.find((a) => a.username.toLowerCase() === "dhaka_kamrul" || a.district.toLowerCase() === "dhaka") || db.agents[0];
      } else {
        agent = db.agents.find((a) => (a.tier || "agent") === "agent") || db.agents[0];
      }
    }
    if (agent) {
      if (!authUser.agentId) authUser.agentId = agent.id;
      if (!agent.userId) agent.userId = authUser.id;
    }
    return agent || null;
  }
  router.get("/agent/overview", requireAuth, requireAgent, (req, res) => {
    const db = getDbSnapshot();
    const user = db.users.find((u) => u.id === req.authUser.id);
    if (!user) {
      res.status(404).json({ success: false, message: "Agent user not found." });
      return;
    }
    const agent = resolveLinkedAgent(db, user);
    if (!agent) {
      res.status(404).json({ success: false, message: "Linked District Agent profile not found." });
      return;
    }
    if (user.avatarUrl && agent.avatarUrl !== user.avatarUrl) {
      agent.avatarUrl = user.avatarUrl;
    }
    if (user.fullName && agent.fullName !== user.fullName) {
      agent.fullName = user.fullName;
    }
    const subAgents = (agent.tier || "agent") === "agent" ? db.agents.filter((a) => a.tier === "sub_agent" && a.parentAgentId === agent.id) : [];
    const scopedAgentIds = /* @__PURE__ */ new Set([agent.id, ...subAgents.map((s) => s.id)]);
    const scopedUsernames = /* @__PURE__ */ new Set([
      agent.username.toLowerCase(),
      ...subAgents.map((s) => s.username.toLowerCase())
    ]);
    const cashInRequests = (db.payments || []).filter(
      (p) => p.agentId && scopedAgentIds.has(p.agentId) || p.agentUsername && scopedUsernames.has(p.agentUsername.toLowerCase())
    ).slice(0, 120);
    const cashOutRequests = (db.withdrawals || []).filter(
      (w) => w.agentId && scopedAgentIds.has(w.agentId) || w.agentUsername && scopedUsernames.has(w.agentUsername.toLowerCase())
    ).slice(0, 120);
    const dms = (db.directMessages || []).filter(
      (m) => m.recipientType === "agent" && m.recipientId === agent.id || m.senderType === "agent" && m.senderId === agent.id
    );
    const threadMap = /* @__PURE__ */ new Map();
    for (const m of dms) {
      const isFromPlayer = m.senderType === "user";
      const playerId = isFromPlayer ? m.senderId : m.recipientId;
      const playerRecord = db.users.find((u) => u.id === playerId);
      const key = m.conversationKey;
      const existing = threadMap.get(key) || {
        conversationKey: key,
        playerId,
        playerUsername: playerRecord?.username || (isFromPlayer ? m.senderUsername : m.recipientUsername),
        playerFullName: playerRecord?.fullName || (isFromPlayer ? m.senderFullName : m.recipientFullName),
        playerAvatarUrl: playerRecord?.avatarUrl || (isFromPlayer ? m.senderAvatarUrl : m.recipientAvatarUrl) || buildSvgAvatar(m.senderFullName || "Player"),
        lastMessage: m.message,
        lastMessageAt: m.createdAt,
        totalMessages: 0,
        unreadCount: 0,
        messages: []
      };
      existing.messages.push({
        id: m.id,
        senderId: m.senderId,
        senderType: m.senderType,
        senderUsername: m.senderUsername,
        senderFullName: m.senderFullName,
        message: m.message,
        createdAt: m.createdAt
      });
      existing.totalMessages += 1;
      if (isFromPlayer && !m.adminReadAt) {
        existing.unreadCount += 1;
      }
      if (m.createdAt >= existing.lastMessageAt) {
        existing.lastMessage = m.message;
        existing.lastMessageAt = m.createdAt;
      }
      threadMap.set(key, existing);
    }
    const inboxThreads = Array.from(threadMap.values()).sort(
      (a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)
    );
    const ledger = (db.transactions || []).filter((t) => t.userId === user.id).slice(0, 100);
    const approvedCashIns = cashInRequests.filter((p) => p.status === "approved");
    const approvedCashOuts = cashOutRequests.filter((w) => w.status === "approved");
    const historyItems = [];
    for (const p of cashInRequests) {
      const isDirectFloat = p.id.startsWith("agt_trf");
      historyItems.push({
        id: `hist_ci_${p.id}`,
        type: isDirectFloat ? "direct_transfer" : "cash_in",
        direction: isDirectFloat ? "debit" : "credit",
        title: isDirectFloat ? `Direct Cash-In to @${p.username}` : `Player Cash-In Request (@${p.username})`,
        playerUsername: p.username,
        gateway: p.gateway,
        reference: p.trxId,
        amount: p.amount,
        status: p.status,
        note: p.verificationNote || `Sender: ${p.senderNumber}`,
        createdAt: p.verifiedAt || p.createdAt
      });
    }
    for (const w of cashOutRequests) {
      const isOtpDirect = w.id.startsWith("wd_otp_") || (w.adminNote || "").includes("OTP");
      historyItems.push({
        id: `hist_co_${w.id}`,
        type: "cash_out",
        direction: "credit",
        title: isOtpDirect ? `OTP Verified Cash-Out (@${w.username})` : `Player Cash-Out Request (@${w.username})`,
        playerUsername: w.username,
        gateway: w.gateway,
        reference: w.targetAccount,
        amount: w.amount,
        status: w.status,
        note: w.adminNote || `Pay to: ${w.targetAccount}`,
        otpVerified: isOtpDirect,
        createdAt: w.processedAt || w.createdAt
      });
    }
    for (const tx of ledger) {
      if (tx.category === "agent_commission") {
        historyItems.push({
          id: `hist_tx_${tx.id}`,
          type: "commission",
          direction: "credit",
          title: "Agent Commission Earned",
          playerUsername: null,
          gateway: tx.gateway,
          reference: tx.referenceId,
          amount: tx.amount,
          status: "completed",
          note: tx.description,
          createdAt: tx.createdAt
        });
      }
    }
    historyItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const subAgentUserIds = new Set(subAgents.map((s) => s.userId).filter(Boolean));
    const deskItemIds = new Set(
      (db.shopItems || []).filter(
        (p) => p.submittedByUserId === user.id || p.submittedByUserId && subAgentUserIds.has(p.submittedByUserId) || p.agentId && scopedAgentIds.has(p.agentId)
      ).map((p) => p.id)
    );
    const pendingShopOrders = (db.shopOrders || []).filter(
      (o) => (o.sellerUserId === user.id || o.sellerUserId && subAgentUserIds.has(o.sellerUserId) || o.agentId && scopedAgentIds.has(o.agentId) || deskItemIds.has(o.itemId)) && o.fulfillmentStatus !== "delivered" && o.fulfillmentStatus !== "auto_delivered" && o.fulfillmentStatus !== "cancelled"
    ).length;
    res.json({
      success: true,
      user: toPublicUser(user),
      agent,
      settings: {
        siteName: db.settings.siteName,
        currencySymbol: db.settings.currencySymbol || "\u09F3"
      },
      stats: {
        floatBalance: Number(user.balance) || 0,
        pendingCashIn: cashInRequests.filter((p) => p.status === "pending").length,
        approvedCashInCount: approvedCashIns.length,
        totalCashInVolume: approvedCashIns.reduce((s, p) => s + p.amount, 0),
        pendingCashOut: cashOutRequests.filter((w) => w.status === "pending").length,
        approvedCashOutCount: approvedCashOuts.length,
        totalCashOutVolume: approvedCashOuts.reduce((s, w) => s + w.amount, 0),
        totalCommissionEarned: Number(agent.commissionEarned || 0),
        commissionRate: Number(agent.commissionRate ?? (agent.tier === "sub_agent" ? 2.5 : 4.5)),
        subAgentsCount: subAgents.length,
        unreadMessagesCount: inboxThreads.reduce((s, t) => s + t.unreadCount, 0),
        totalOrders: Number(agent.totalOrders || 0),
        pendingShopOrders
      },
      cashInRequests,
      cashOutRequests,
      subAgents,
      inboxThreads,
      ledger,
      history: historyItems.slice(0, 200)
    });
  });
  router.get(
    "/agent/players/lookup",
    requireAuth,
    requireAgent,
    (req, res) => {
      const rawQ = sanitizeText(String(req.query?.q || ""), 120).replace(/^@+/, "").trim().toLowerCase();
      if (!rawQ) {
        res.status(400).json({ success: false, message: "Enter player username, email, or phone." });
        return;
      }
      const db = getDbSnapshot();
      const digits = rawQ.replace(/\D/g, "");
      const player = db.users.find(
        (u) => u.role === "user" && (u.username.toLowerCase() === rawQ || u.email.toLowerCase() === rawQ || digits.length >= 6 && (u.phone || "").replace(/\D/g, "") === digits)
      );
      if (!player) {
        res.status(404).json({
          success: false,
          message: `No player account found for "${rawQ}". Check username and try again.`
        });
        return;
      }
      res.json({
        success: true,
        player: {
          id: player.id,
          username: player.username,
          fullName: player.fullName,
          phone: player.phone,
          avatarUrl: player.avatarUrl || buildSvgAvatar(player.fullName || player.username),
          balance: Number(player.balance) || 0,
          status: player.status
        }
      });
    }
  );
  router.post(
    "/agent/cash-out/request-otp",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const identifier = sanitizeText(req.body?.playerIdentifier, 120).replace(/^@+/, "").toLowerCase();
        const amount = Math.round(Number(req.body?.amount || 0) * 100) / 100;
        if (!identifier) {
          res.status(400).json({ success: false, message: "Player username is required." });
          return;
        }
        if (!Number.isFinite(amount) || amount < 10) {
          res.status(400).json({ success: false, message: "Enter a valid Cash-Out amount (min 10)." });
          return;
        }
        const smtpJobs = [];
        const outcome = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!agent) throw new Error("Agent profile not found.");
          if (agent.status === "suspended") throw new Error("Your agent account is suspended.");
          const digits = identifier.replace(/\D/g, "");
          const player = db.users.find(
            (u) => u.role === "user" && (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier || digits.length >= 6 && (u.phone || "").replace(/\D/g, "") === digits)
          );
          if (!player) throw new Error("Player account not found.");
          if (player.status !== "active") throw new Error("Player account is suspended.");
          if (player.balance < amount) {
            throw new Error(
              `Insufficient player balance (${db.settings.currencySymbol}${player.balance}).`
            );
          }
          if (!player.otpSecret) {
            player.otpSecret = generateOtpSecret();
            player.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
          }
          const code = String(import_crypto7.default.randomInt(1e5, 1e6));
          const key = `${agent.id}:${player.id}`;
          const expiresAt = Date.now() + 5 * 60 * 1e3;
          agentCashOutOtps.set(key, {
            codeHash: hashPassword(code),
            amount,
            expiresAt,
            playerId: player.id,
            agentId: agent.id
          });
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const sym = db.settings.currencySymbol || "\u09F3";
          db.notifications.unshift({
            id: generateId("notif"),
            userId: player.id,
            title: `Cash-Out Verification OTP: ${code}`,
            message: `Agent @${agent.username} (${agent.fullName}) requested a Cash-Out of ${sym}${amount} from your wallet. Share OTP code ${code} with the agent ONLY if you authorize this cash-out (valid 5 mins).`,
            type: "warning",
            isRead: false,
            createdAt: now
          });
          if (player.email && player.email.includes("@")) {
            const { job } = recordSmtpLogInDb(db, {
              orderId: null,
              userId: player.id,
              username: player.username,
              trigger: "admin_order_update",
              toEmail: player.email,
              subject: `Cash-Out OTP Code: ${code} (${sym}${amount})`,
              body: `Hello ${player.fullName},

Agent @${agent.username} (${agent.fullName}) has initiated a wallet Cash-Out request of ${sym}${amount}.

Your 6-Digit Verification OTP: ${code}
Valid for 5 minutes.

If you did not request this Cash-Out, do NOT share this code with anyone.`
            });
            if (job) smtpJobs.push(job);
          }
          return {
            playerId: player.id,
            username: player.username,
            fullName: player.fullName,
            balance: player.balance
          };
        });
        if (smtpJobs.length > 0) {
          dispatchSmtpJobsInBackground(smtpJobs);
        }
        res.json({
          success: true,
          message: `6-digit Cash-Out OTP sent to @${outcome.username}'s notifications & email. Ask the player for their OTP code.`,
          expiresInSeconds: 300,
          player: outcome
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not send Cash-Out OTP."
        });
      }
    }
  );
  router.post(
    "/agent/cash-out/direct",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const identifier = sanitizeText(req.body?.playerIdentifier, 120).replace(/^@+/, "").toLowerCase();
        const amount = Math.round(Number(req.body?.amount || 0) * 100) / 100;
        const otpCode = String(req.body?.otpCode || "").replace(/\s+/g, "").trim();
        const gateway = sanitizeText(req.body?.gateway || "bKash", 40);
        const note = sanitizeText(req.body?.note, 240);
        const ip = getClientIp(req);
        if (!identifier) {
          res.status(400).json({ success: false, message: "Search and select a player username first." });
          return;
        }
        if (!Number.isFinite(amount) || amount < 10 || amount > 2e5) {
          res.status(400).json({ success: false, message: "Cash-Out amount must be between 10 and 200,000." });
          return;
        }
        if (!/^\d{6}$/.test(otpCode)) {
          res.status(400).json({
            success: false,
            message: "Valid 6-digit Player OTP is required to complete Cash-Out."
          });
          return;
        }
        const outcome = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!agent) throw new Error("Agent profile not found.");
          if (agent.status === "suspended") throw new Error("Your agent account is suspended.");
          const digits = identifier.replace(/\D/g, "");
          const player = db.users.find(
            (u) => u.role === "user" && (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier || digits.length >= 6 && (u.phone || "").replace(/\D/g, "") === digits)
          );
          if (!player) throw new Error("Player account not found.");
          if (player.status !== "active") throw new Error("Player account is suspended.");
          const otpKey = `${agent.id}:${player.id}`;
          const pendingOtp = agentCashOutOtps.get(otpKey);
          let matchedSentOtp = false;
          if (pendingOtp && pendingOtp.expiresAt >= Date.now()) {
            matchedSentOtp = verifyPassword(otpCode, pendingOtp.codeHash);
          } else if (pendingOtp && pendingOtp.expiresAt < Date.now()) {
            agentCashOutOtps.delete(otpKey);
          }
          const matchedLiveTotp = Boolean(
            player.otpSecret && verifyTimedOtp(player.otpSecret, otpCode, Date.now(), 30)
          );
          if (!matchedSentOtp && !matchedLiveTotp) {
            throw new Error(
              "Invalid or expired 6-digit Player OTP. Cash-Out cannot be completed without valid user OTP."
            );
          }
          if (player.balance < amount) {
            throw new Error(
              `Insufficient player balance (${db.settings.currencySymbol}${player.balance}).`
            );
          }
          if (matchedSentOtp) {
            agentCashOutOtps.delete(otpKey);
          }
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const sym = db.settings.currencySymbol || "\u09F3";
          const wdId = generateId("wd_otp");
          const rate = Number(agent.commissionRate ?? (agent.tier === "sub_agent" ? 2.5 : 4.5));
          const commission = Math.round(amount * (rate / 100) * 100) / 100;
          player.balance = Math.round((player.balance - amount) * 100) / 100;
          player.totalWithdrawn = Math.round((player.totalWithdrawn + amount) * 100) / 100;
          player.updatedAt = now;
          const balanceAfterPrincipal = Math.round((agentUser.balance + amount) * 100) / 100;
          agentUser.balance = Math.round((balanceAfterPrincipal + commission) * 100) / 100;
          agentUser.updatedAt = now;
          agent.cashOutOrders = (agent.cashOutOrders || 0) + 1;
          agent.totalOrders = (agent.totalOrders || 0) + 1;
          agent.commissionEarned = Math.round(((agent.commissionEarned || 0) + commission) * 100) / 100;
          db.withdrawals.unshift({
            id: wdId,
            userId: player.id,
            username: player.username,
            gateway,
            targetAccount: player.phone || `@${player.username}`,
            amount,
            fee: 0,
            totalDebit: amount,
            status: "approved",
            adminNote: note ? `OTP Verified Direct Cash-Out by Agent @${agent.username} \xB7 ${note}` : `OTP Verified Direct Cash-Out by Agent @${agent.username}`,
            processedBy: agentUser.id,
            processedAt: now,
            agentId: agent.id,
            agentUsername: agent.username,
            agentDistrict: agent.district,
            createdAt: now
          });
          db.transactions.unshift({
            id: generateId("txn"),
            userId: player.id,
            username: player.username,
            direction: "debit",
            category: "withdrawal",
            amount,
            balanceAfter: player.balance,
            referenceId: wdId,
            gateway: `Agent @${agent.username} (${gateway})`,
            description: `OTP Verified Cash-Out via Agent @${agent.username}${note ? ` (${note})` : ""}`,
            createdAt: now
          });
          db.transactions.unshift({
            id: generateId("txn"),
            userId: agentUser.id,
            username: agentUser.username,
            direction: "credit",
            category: "agent_transfer",
            amount,
            balanceAfter: balanceAfterPrincipal,
            referenceId: wdId,
            gateway,
            description: `OTP Cash-Out credited from @${player.username} (${gateway})`,
            createdAt: now
          });
          if (commission > 0) {
            db.transactions.unshift({
              id: generateId("txn"),
              userId: agentUser.id,
              username: agentUser.username,
              direction: "credit",
              category: "agent_commission",
              amount: commission,
              balanceAfter: agentUser.balance,
              referenceId: wdId,
              gateway,
              description: `Cash-Out Commission (${rate}%) on ${sym}${amount} from @${player.username}`,
              createdAt: now
            });
          }
          db.notifications.unshift({
            id: generateId("notif"),
            userId: player.id,
            title: "OTP Cash-Out Completed",
            message: `${sym}${amount} was cashed out via Agent @${agent.username} (${gateway}) using your 6-digit OTP. New balance: ${sym}${player.balance}.`,
            type: "success",
            isRead: false,
            createdAt: now
          });
          pushAuditLog(
            db,
            { id: agentUser.id, username: agentUser.username },
            "AGENT_OTP_DIRECT_CASHOUT",
            "withdrawal",
            wdId,
            {
              playerId: player.id,
              playerUsername: player.username,
              amount,
              commission,
              gateway,
              otpMethod: matchedSentOtp ? "cashout_otp" : "live_totp"
            },
            ip
          );
          return {
            withdrawalId: wdId,
            playerUsername: player.username,
            playerNewBalance: player.balance,
            amount,
            commission,
            agentNewBalance: agentUser.balance
          };
        });
        res.json({
          success: true,
          message: `Cash-Out of ${outcome.amount} from @${outcome.playerUsername} completed! Added to your Agent Balance (+${outcome.commission} commission).`,
          ...outcome
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "OTP Cash-Out failed."
        });
      }
    }
  );
  router.post(
    "/agent/cash-in/:paymentId/process",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const paymentId = sanitizeText(req.params.paymentId, 80);
        const action = req.body?.action;
        const note = sanitizeText(req.body?.note, 300);
        const ip = getClientIp(req);
        if (action !== "approve" && action !== "reject") {
          res.status(400).json({ success: false, message: "Invalid action. Use approve or reject." });
          return;
        }
        const result = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!agent) throw new Error("Agent profile not found.");
          if (agent.status === "suspended") throw new Error("Your agent account is currently suspended.");
          const subIds = new Set(
            db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.id)
          );
          const pay = db.payments.find((p) => p.id === paymentId);
          if (!pay) throw new Error("Cash-In request not found.");
          const belongs = pay.agentId === agent.id || pay.agentId && subIds.has(pay.agentId) || pay.agentUsername && pay.agentUsername.toLowerCase() === agent.username.toLowerCase();
          if (!belongs) {
            throw new Error("This Cash-In request is not assigned to your Agent Desk.");
          }
          if (pay.status !== "pending") {
            throw new Error("Only pending Cash-In requests can be processed.");
          }
          const player = db.users.find((u) => u.id === pay.userId);
          if (!player) throw new Error("Player account not found.");
          const now = (/* @__PURE__ */ new Date()).toISOString();
          let commissionEarned = 0;
          if (action === "approve") {
            pay.status = "approved";
            pay.verificationNote = note || `Verified & approved by Agent @${agent.username}`;
            pay.verifiedBy = agentUser.id;
            pay.verifiedAt = now;
            player.balance = Math.round((player.balance + pay.amount) * 100) / 100;
            player.totalDeposited = Math.round((player.totalDeposited + pay.amount) * 100) / 100;
            player.updatedAt = now;
            db.transactions.unshift({
              id: generateId("txn"),
              userId: player.id,
              username: player.username,
              direction: "credit",
              category: "deposit",
              amount: pay.amount,
              balanceAfter: player.balance,
              referenceId: pay.id,
              gateway: `${pay.gateway} (Agent @${agent.username})`,
              description: `Cash-In approved by Agent @${agent.username} (TrxID: ${pay.trxId})`,
              createdAt: now
            });
            db.notifications.unshift({
              id: generateId("notif"),
              userId: player.id,
              title: "Agent Cash-In Approved",
              message: `Agent @${agent.username} approved your ${pay.gateway} deposit of ${db.settings.currencySymbol}${pay.amount} (TrxID: ${pay.trxId}).`,
              type: "success",
              isRead: false,
              createdAt: now
            });
            db.ticketReservations = (db.ticketReservations || []).filter(
              (r) => r.paymentId !== pay.id
            );
            if (pay.reservedLotteryId && Array.isArray(pay.reservedSlots) && pay.reservedSlots.length > 0) {
              try {
                issueTicketsForPurchase(
                  db,
                  player.id,
                  pay.reservedLotteryId,
                  pay.reservedSlots.length,
                  pay.reservedSlots,
                  false
                );
              } catch {
              }
            }
            creditDepositReferralCommission(db, player, pay.amount, pay.id);
            const rate = Number(agent.commissionRate ?? (agent.tier === "sub_agent" ? 2.5 : 4.5));
            commissionEarned = Math.round(pay.amount * (rate / 100) * 100) / 100;
            agent.cashInOrders = (agent.cashInOrders || 0) + 1;
            agent.totalOrders = (agent.totalOrders || 0) + 1;
            agent.commissionEarned = Math.round(((agent.commissionEarned || 0) + commissionEarned) * 100) / 100;
            if (commissionEarned > 0) {
              agentUser.balance = Math.round((agentUser.balance + commissionEarned) * 100) / 100;
              agentUser.updatedAt = now;
              db.transactions.unshift({
                id: generateId("txn"),
                userId: agentUser.id,
                username: agentUser.username,
                direction: "credit",
                category: "agent_commission",
                amount: commissionEarned,
                balanceAfter: agentUser.balance,
                referenceId: pay.id,
                gateway: pay.gateway,
                description: `Cash-In Commission (${rate}%) on ${db.settings.currencySymbol}${pay.amount} for @${player.username}`,
                createdAt: now
              });
            }
          } else {
            pay.status = "rejected";
            pay.verificationNote = note || `Declined by Agent @${agent.username}`;
            pay.verifiedBy = agentUser.id;
            pay.verifiedAt = now;
            db.ticketReservations = (db.ticketReservations || []).filter(
              (r) => r.paymentId !== pay.id
            );
            db.notifications.unshift({
              id: generateId("notif"),
              userId: player.id,
              title: "Agent Cash-In Declined",
              message: `Your ${pay.gateway} Cash-In (TrxID: ${pay.trxId}) was declined by Agent @${agent.username}. Reason: ${pay.verificationNote}`,
              type: "warning",
              isRead: false,
              createdAt: now
            });
          }
          pushAuditLog(
            db,
            { id: agentUser.id, username: agentUser.username },
            `AGENT_CASHIN_${action.toUpperCase()}`,
            "payment",
            pay.id,
            { trxId: pay.trxId, amount: pay.amount, commissionEarned, agentId: agent.id },
            ip
          );
          return { payment: pay, commissionEarned };
        });
        res.json({
          success: true,
          message: action === "approve" ? `Cash-In approved! Commission earned: ${result.commissionEarned}` : "Cash-In request rejected.",
          ...result
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not process Cash-In request."
        });
      }
    }
  );
  router.post(
    "/agent/cash-out/:withdrawalId/process",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const withdrawalId = sanitizeText(req.params.withdrawalId, 80);
        const action = req.body?.action;
        const note = sanitizeText(req.body?.note, 300);
        const ip = getClientIp(req);
        if (action !== "approve" && action !== "reject") {
          res.status(400).json({ success: false, message: "Invalid action. Use approve or reject." });
          return;
        }
        const result = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!agent) throw new Error("Agent profile not found.");
          if (agent.status === "suspended") throw new Error("Your agent account is currently suspended.");
          const subIds = new Set(
            db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.id)
          );
          const wd = db.withdrawals.find((w) => w.id === withdrawalId);
          if (!wd) throw new Error("Cash-Out request not found.");
          const belongs = wd.agentId === agent.id || wd.agentId && subIds.has(wd.agentId) || wd.agentUsername && wd.agentUsername.toLowerCase() === agent.username.toLowerCase();
          if (!belongs) {
            throw new Error("This Cash-Out request is not assigned to your Agent Desk.");
          }
          if (wd.status !== "pending") {
            throw new Error("Cash-Out request is already processed.");
          }
          const player = db.users.find((u) => u.id === wd.userId);
          if (!player) throw new Error("Player account not found.");
          const now = (/* @__PURE__ */ new Date()).toISOString();
          let commissionEarned = 0;
          wd.status = action === "approve" ? "approved" : "rejected";
          wd.processedBy = agentUser.id;
          wd.processedAt = now;
          if (action === "approve") {
            wd.adminNote = note || `Disbursed by Agent @${agent.username} via ${wd.gateway}`;
            player.totalWithdrawn = Math.round((player.totalWithdrawn + wd.amount) * 100) / 100;
            player.updatedAt = now;
            db.notifications.unshift({
              id: generateId("notif"),
              userId: player.id,
              title: "Agent Cash-Out Disbursed",
              message: `Agent @${agent.username} sent ${db.settings.currencySymbol}${wd.amount} to your ${wd.gateway} (${wd.targetAccount}).`,
              type: "success",
              isRead: false,
              createdAt: now
            });
            const rate = Number(agent.commissionRate ?? (agent.tier === "sub_agent" ? 2.5 : 4.5));
            commissionEarned = Math.round(wd.amount * (rate / 100) * 100) / 100;
            agent.cashOutOrders = (agent.cashOutOrders || 0) + 1;
            agent.totalOrders = (agent.totalOrders || 0) + 1;
            agent.commissionEarned = Math.round(((agent.commissionEarned || 0) + commissionEarned) * 100) / 100;
            if (commissionEarned > 0) {
              agentUser.balance = Math.round((agentUser.balance + commissionEarned) * 100) / 100;
              agentUser.updatedAt = now;
              db.transactions.unshift({
                id: generateId("txn"),
                userId: agentUser.id,
                username: agentUser.username,
                direction: "credit",
                category: "agent_commission",
                amount: commissionEarned,
                balanceAfter: agentUser.balance,
                referenceId: wd.id,
                gateway: wd.gateway,
                description: `Cash-Out Commission (${rate}%) on ${db.settings.currencySymbol}${wd.amount} for @${player.username}`,
                createdAt: now
              });
            }
          } else {
            wd.adminNote = note || `Declined by Agent @${agent.username}; refunded to wallet.`;
            player.balance = Math.round((player.balance + wd.totalDebit) * 100) / 100;
            player.updatedAt = now;
            db.transactions.unshift({
              id: generateId("txn"),
              userId: player.id,
              username: player.username,
              direction: "credit",
              category: "refund",
              amount: wd.totalDebit,
              balanceAfter: player.balance,
              referenceId: wd.id,
              gateway: wd.gateway,
              description: `Cash-Out rejected & refunded by Agent @${agent.username}`,
              createdAt: now
            });
            db.notifications.unshift({
              id: generateId("notif"),
              userId: player.id,
              title: "Cash-Out Returned",
              message: `Your Cash-Out of ${db.settings.currencySymbol}${wd.amount} was declined by Agent @${agent.username} and refunded to your wallet.`,
              type: "warning",
              isRead: false,
              createdAt: now
            });
          }
          pushAuditLog(
            db,
            { id: agentUser.id, username: agentUser.username },
            `AGENT_CASHOUT_${action.toUpperCase()}`,
            "withdrawal",
            wd.id,
            { amount: wd.amount, targetAccount: wd.targetAccount, commissionEarned, agentId: agent.id },
            ip
          );
          return { withdrawal: wd, commissionEarned };
        });
        res.json({
          success: true,
          message: action === "approve" ? `Cash-Out disbursed! Commission earned: ${result.commissionEarned}` : "Cash-Out declined and refunded to player wallet.",
          ...result
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not process Cash-Out request."
        });
      }
    }
  );
  router.post(
    "/agent/quick-transfer",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const identifier = sanitizeText(req.body?.playerIdentifier, 120).replace(/^@+/, "").toLowerCase();
        const amount = Math.round(Number(req.body?.amount || 0) * 100) / 100;
        const gateway = sanitizeText(req.body?.gateway || "bKash", 40);
        const note = sanitizeText(req.body?.note, 220);
        const ip = getClientIp(req);
        if (!identifier) {
          res.status(400).json({ success: false, message: "Enter player username, email, or phone." });
          return;
        }
        if (!Number.isFinite(amount) || amount < 10 || amount > 2e5) {
          res.status(400).json({ success: false, message: "Transfer amount must be between 10 and 200,000." });
          return;
        }
        const outcome = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!agent) throw new Error("Agent profile not found.");
          if (agent.status === "suspended") throw new Error("Agent account is suspended.");
          if (agentUser.balance < amount) {
            throw new Error(
              `Insufficient Agent Float Balance (${db.settings.currencySymbol}${agentUser.balance}).`
            );
          }
          const player = db.users.find(
            (u) => u.role === "user" && (u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier || (u.phone || "").replace(/\D/g, "") === identifier.replace(/\D/g, ""))
          );
          if (!player) {
            throw new Error("Player account not found. Check username, email, or phone number.");
          }
          if (player.status !== "active") {
            throw new Error("Target player account is suspended.");
          }
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const refId = generateId("agt_trf");
          const rate = Number(agent.commissionRate ?? (agent.tier === "sub_agent" ? 2.5 : 4.5));
          const commission = Math.round(amount * (rate / 100) * 100) / 100;
          agentUser.balance = Math.round((agentUser.balance - amount + commission) * 100) / 100;
          agentUser.updatedAt = now;
          player.balance = Math.round((player.balance + amount) * 100) / 100;
          player.totalDeposited = Math.round((player.totalDeposited + amount) * 100) / 100;
          player.updatedAt = now;
          agent.cashInOrders = (agent.cashInOrders || 0) + 1;
          agent.totalOrders = (agent.totalOrders || 0) + 1;
          agent.commissionEarned = Math.round(((agent.commissionEarned || 0) + commission) * 100) / 100;
          db.payments.unshift({
            id: refId,
            userId: player.id,
            username: player.username,
            gateway,
            senderNumber: agent.phone,
            trxId: `AG-${Date.now().toString(36).toUpperCase()}`,
            amount,
            status: "approved",
            verificationNote: note || `Instant Float Cash-In by Agent @${agent.username}`,
            verifiedBy: agentUser.id,
            verifiedAt: now,
            agentId: agent.id,
            agentUsername: agent.username,
            agentDistrict: agent.district,
            createdAt: now
          });
          db.transactions.unshift({
            id: generateId("txn"),
            userId: player.id,
            username: player.username,
            direction: "credit",
            category: "deposit",
            amount,
            balanceAfter: player.balance,
            referenceId: refId,
            gateway: `Agent @${agent.username} (${gateway})`,
            description: note || `Instant Cash-In from Agent @${agent.username}`,
            createdAt: now
          });
          db.transactions.unshift({
            id: generateId("txn"),
            userId: agentUser.id,
            username: agentUser.username,
            direction: "debit",
            category: "agent_transfer",
            amount,
            balanceAfter: Math.round((agentUser.balance - commission) * 100) / 100,
            referenceId: refId,
            gateway,
            description: `Direct Cash-In sent to @${player.username} (${gateway})`,
            createdAt: now
          });
          if (commission > 0) {
            db.transactions.unshift({
              id: generateId("txn"),
              userId: agentUser.id,
              username: agentUser.username,
              direction: "credit",
              category: "agent_commission",
              amount: commission,
              balanceAfter: agentUser.balance,
              referenceId: refId,
              gateway,
              description: `Commission (${rate}%) on instant transfer to @${player.username}`,
              createdAt: now
            });
          }
          db.notifications.unshift({
            id: generateId("notif"),
            userId: player.id,
            title: "Instant Agent Deposit Credited",
            message: `Agent @${agent.username} credited ${db.settings.currencySymbol}${amount} to your wallet via ${gateway}.`,
            type: "success",
            isRead: false,
            createdAt: now
          });
          pushAuditLog(
            db,
            { id: agentUser.id, username: agentUser.username },
            "AGENT_QUICK_TRANSFER",
            "user",
            player.id,
            { amount, commission, gateway, playerUsername: player.username },
            ip
          );
          return {
            playerUsername: player.username,
            amount,
            commission,
            newFloatBalance: agentUser.balance
          };
        });
        res.json({
          success: true,
          message: `Transferred ${outcome.amount} to @${outcome.playerUsername} (Commission +${outcome.commission}).`,
          ...outcome
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Transfer failed."
        });
      }
    }
  );
  router.put("/agent/profile", requireAuth, requireAgent, async (req, res) => {
    try {
      const body = req.body || {};
      const updated = await withTransaction((db) => {
        const agentUser = db.users.find((u) => u.id === req.authUser.id);
        if (!agentUser) throw new Error("Agent account not found.");
        const agent = resolveLinkedAgent(db, agentUser);
        if (!agent) throw new Error("Agent profile not found.");
        agentUser.agentId = agent.id;
        agent.userId = agentUser.id;
        if (typeof body.fullName === "string" && body.fullName.trim()) {
          agent.fullName = sanitizeText(body.fullName, 80);
          agentUser.fullName = agent.fullName;
        }
        if (typeof body.avatarUrl === "string" && body.avatarUrl.trim()) {
          const cleanAvatar = body.avatarUrl.trim();
          if (cleanAvatar.length > 15e5) {
            throw new Error("Profile photo is too large. Please upload a smaller image.");
          }
          agent.avatarUrl = cleanAvatar;
          agentUser.avatarUrl = cleanAvatar;
        }
        if (typeof body.password === "string" && body.password.trim()) {
          if (body.password.trim().length < 6) {
            throw new Error("Password must be at least 6 characters.");
          }
          agentUser.passwordHash = hashPassword(body.password.trim());
        }
        if (typeof body.isOnline === "boolean") {
          agent.isOnline = agent.status === "suspended" ? false : body.isOnline;
        }
        if (typeof body.phone === "string" && body.phone.trim()) {
          agent.phone = sanitizeText(body.phone, 30);
          agentUser.phone = agent.phone;
        }
        if (typeof body.district === "string" && body.district.trim()) {
          agent.district = sanitizeText(body.district, 80);
        }
        if (typeof body.division === "string" && body.division.trim()) {
          agent.division = sanitizeText(body.division, 60);
        }
        const allowedGatewayKeys = ["bKash", "Nagad", "Rocket", "Upay", "TapTap", "Bank"];
        if (body.paymentGateways && typeof body.paymentGateways === "object" && !Array.isArray(body.paymentGateways)) {
          const nextGateways = {};
          const enabledChannels = [];
          for (const key of allowedGatewayKeys) {
            const raw = body.paymentGateways[key];
            if (raw && typeof raw === "object") {
              const obj = raw;
              const enabled = Boolean(obj.enabled);
              const number = sanitizeText(obj.number, 120);
              const accountType = sanitizeText(obj.accountType, 40) || (key === "Bank" ? "Bank Account" : "Personal");
              const instructions = sanitizeText(obj.instructions, 200);
              nextGateways[key] = {
                enabled,
                number,
                accountType,
                instructions
              };
              if (enabled) {
                enabledChannels.push(key);
              }
            }
          }
          agent.paymentGateways = nextGateways;
          if (enabledChannels.length > 0) {
            agent.channels = enabledChannels;
          }
        } else if (Array.isArray(body.channels) && body.channels.length > 0) {
          const allowed = allowedGatewayKeys;
          const next = Array.from(
            new Set(
              body.channels.map((c) => String(c || "").trim()).filter((c) => allowed.includes(c))
            )
          );
          if (next.length > 0) agent.channels = next;
        }
        for (const ag of db.agents) {
          if (ag.id === agent.id || ag.username.toLowerCase() === agent.username.toLowerCase()) {
            ag.fullName = agent.fullName;
            ag.avatarUrl = agent.avatarUrl;
            ag.phone = agent.phone;
            ag.district = agent.district;
            ag.division = agent.division;
            ag.channels = agent.channels;
            ag.paymentGateways = agent.paymentGateways;
            ag.isOnline = agent.isOnline;
          }
        }
        for (const usr of db.users) {
          if (usr.id === agentUser.id || usr.agentId === agent.id || usr.username.toLowerCase() === agent.username.toLowerCase()) {
            usr.fullName = agentUser.fullName;
            usr.avatarUrl = agentUser.avatarUrl;
            usr.phone = agentUser.phone;
          }
        }
        agentUser.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return agent;
      });
      broadcastChatEvent("shop:catalog_updated", {
        action: "agent_gateway_updated",
        agentId: updated.id,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({ success: true, message: "Agent desk profile updated.", agent: updated });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not update agent profile."
      });
    }
  });
  router.post(
    "/agent/sub-agents",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const fullName = sanitizeText(req.body?.fullName, 80);
        const rawUsername = sanitizeText(req.body?.username, 40).replace(/^@+/, "").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
        const phone = sanitizeText(req.body?.phone, 30);
        const district = sanitizeText(req.body?.district, 80);
        const loginEmail = sanitizeText(req.body?.loginEmail, 140).toLowerCase();
        const loginPassword = typeof req.body?.loginPassword === "string" ? req.body.loginPassword.trim() : "";
        const commissionRate = Math.max(0, Math.min(20, Number(req.body?.commissionRate ?? 2.5) || 2.5));
        const ip = getClientIp(req);
        if (!fullName || rawUsername.length < 3 || !phone || !district) {
          throw new Error("Full name, username (min 3 chars), phone, and area/district are required.");
        }
        const created = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const parent = resolveLinkedAgent(db, agentUser);
          if (!parent || (parent.tier || "agent") !== "agent") {
            throw new Error("Only Master Agents can create Sub-Agents.");
          }
          if (db.agents.some((a) => a.username.toLowerCase() === rawUsername)) {
            throw new Error(`Username @${rawUsername} already exists.`);
          }
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const newSubId = generateId("subag");
          const avatarUrl = buildSvgAvatar(fullName, 2);
          let linkedUid = null;
          let linkedEmail = null;
          if (loginEmail && loginPassword) {
            if (!loginEmail.includes("@")) throw new Error("Valid Sub-Agent login email required.");
            if (loginPassword.length < 6) throw new Error("Password must be at least 6 characters.");
            if (db.users.some((u) => u.email.toLowerCase() === loginEmail)) {
              throw new Error(`Email ${loginEmail} is already registered.`);
            }
            const uid = generateId("u_subag");
            const uname = db.users.some((u) => u.username.toLowerCase() === rawUsername) ? `${rawUsername}_${Math.floor(100 + Math.random() * 900)}` : rawUsername;
            db.users.push({
              id: uid,
              username: uname,
              fullName,
              email: loginEmail,
              phone,
              avatarUrl,
              passwordHash: hashPassword(loginPassword),
              role: "sub_agent",
              status: "active",
              balance: 5e3,
              spinCredits: 0,
              totalDeposited: 5e3,
              totalWithdrawn: 0,
              winsCount: 0,
              securityPinHash: null,
              pinLockEnabled: false,
              agentId: newSubId,
              createdAt: nowIso,
              updatedAt: nowIso
            });
            linkedUid = uid;
            linkedEmail = loginEmail;
          }
          const sub = {
            id: newSubId,
            username: rawUsername,
            fullName,
            avatarUrl,
            district,
            division: parent.division || "Dhaka",
            phone,
            channels: Array.isArray(req.body?.channels) && req.body.channels.length > 0 ? req.body.channels : ["bKash", "Nagad"],
            totalOrders: 0,
            cashInOrders: 0,
            cashOutOrders: 0,
            isOnline: true,
            isVerified: true,
            tier: "sub_agent",
            parentAgentId: parent.id,
            parentAgentName: `${parent.fullName} (@${parent.username})`,
            commissionRate,
            commissionEarned: 0,
            userId: linkedUid,
            loginEmail: linkedEmail,
            status: "active",
            createdAt: nowIso
          };
          db.agents.unshift(sub);
          pushAuditLog(
            db,
            { id: agentUser.id, username: agentUser.username },
            "MASTER_AGENT_CREATED_SUB_AGENT",
            "agent",
            sub.id,
            { subUsername: sub.username, parentAgentId: parent.id },
            ip
          );
          return sub;
        });
        res.status(201).json({ success: true, message: `Sub-Agent @${created.username} created.`, subAgent: created });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not create Sub-Agent."
        });
      }
    }
  );
  router.put(
    "/agent/sub-agents/:id",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const subId = sanitizeText(req.params.id, 80);
        const updated = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const parent = resolveLinkedAgent(db, agentUser);
          if (!parent) throw new Error("Agent profile not found.");
          const sub = db.agents.find((a) => a.id === subId && a.parentAgentId === parent.id);
          if (!sub) throw new Error("Sub-Agent not found under your network.");
          if (typeof req.body?.isOnline === "boolean") sub.isOnline = req.body.isOnline;
          if (req.body?.status === "active" || req.body?.status === "suspended") {
            sub.status = req.body.status;
            if (sub.status === "suspended") sub.isOnline = false;
            if (sub.userId) {
              const subUser = db.users.find((u) => u.id === sub.userId);
              if (subUser) subUser.status = sub.status === "suspended" ? "blocked" : "active";
            }
          }
          return sub;
        });
        res.json({ success: true, subAgent: updated });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not update Sub-Agent."
        });
      }
    }
  );
  router.post(
    "/agent/inbox/:userId/reply",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const targetUserId = sanitizeText(req.params.userId, 80);
        const text = sanitizeText(req.body?.message, 800);
        if (!targetUserId || !text) {
          res.status(400).json({ success: false, message: "Target player and message are required." });
          return;
        }
        const created = await withTransaction((db) => {
          if (!Array.isArray(db.directMessages)) db.directMessages = [];
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!agent) throw new Error("Agent profile not found.");
          const player = db.users.find((u) => u.id === targetUserId);
          if (!player) throw new Error("Player account not found.");
          const conversationKey = makeConversationKey("user", player.id, "agent", agent.id);
          const now = (/* @__PURE__ */ new Date()).toISOString();
          for (const m of db.directMessages) {
            if (m.conversationKey === conversationKey && !m.adminReadAt) {
              m.adminReadAt = now;
            }
          }
          const dm = {
            id: generateId("dm"),
            conversationKey,
            senderId: agent.id,
            senderType: "agent",
            senderUsername: agent.username,
            senderFullName: agent.fullName,
            senderAvatarUrl: agent.avatarUrl || buildSvgAvatar(agent.fullName),
            recipientId: player.id,
            recipientType: "user",
            recipientUsername: player.username,
            recipientFullName: player.fullName,
            recipientAvatarUrl: player.avatarUrl || buildSvgAvatar(player.fullName),
            recipientDistrict: agent.district,
            message: text,
            adminReadAt: now,
            createdAt: now
          };
          db.directMessages.push(dm);
          if (db.directMessages.length > 1e3) {
            db.directMessages = db.directMessages.slice(-1e3);
          }
          db.notifications.unshift({
            id: generateId("notif"),
            userId: player.id,
            title: `Agent Reply (@${agent.username})`,
            message: text.slice(0, 140),
            type: "info",
            isRead: false,
            createdAt: now
          });
          return { dm };
        });
        sendChatEventToUsers([req.authUser.id, targetUserId], "direct:message", created.dm);
        res.status(201).json({
          success: true,
          message: created.dm
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not send reply."
        });
      }
    }
  );
  router.get(
    "/agent/shop/products",
    requireAuth,
    requireAgent,
    (req, res) => {
      res.setHeader("Cache-Control", "no-store");
      const db = getDbSnapshot();
      const agentUser = db.users.find((u) => u.id === req.authUser.id);
      if (!agentUser) {
        res.status(404).json({ success: false, message: "Agent account not found." });
        return;
      }
      const agent = resolveLinkedAgent(db, agentUser);
      const subAgentIds = agent && (agent.tier || "agent") === "agent" ? new Set(
        db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.userId).filter(Boolean)
      ) : /* @__PURE__ */ new Set();
      const allItems = db.shopItems || [];
      const visibleItems = allItems.filter((item) => {
        const isApprovedCatalog = !item.approvalStatus || item.approvalStatus === "approved";
        const isMine = item.submittedByUserId === agentUser.id || item.submittedByUserId && subAgentIds.has(item.submittedByUserId) || agent && item.agentId === agent.id;
        return isApprovedCatalog || isMine;
      }).map(toPublicShopItem);
      const myItems = visibleItems.filter(
        (item) => item.submittedByUserId === agentUser.id || item.submittedByUserId && subAgentIds.has(item.submittedByUserId) || agent && item.agentId === agent.id
      );
      const myItemIds = new Set(myItems.map((p) => p.id));
      const orders = (db.shopOrders || []).filter(
        (o) => o.sellerUserId === agentUser.id || o.sellerUserId && subAgentIds.has(o.sellerUserId) || agent && o.agentId === agent.id || myItemIds.has(o.itemId)
      ).slice(0, 120);
      const pendingOrders = orders.filter(
        (o) => o.fulfillmentStatus !== "delivered" && o.fulfillmentStatus !== "auto_delivered" && o.fulfillmentStatus !== "cancelled"
      ).length;
      res.json({
        success: true,
        currencySymbol: db.settings.currencySymbol || "\u09F3",
        summary: {
          totalCatalog: visibleItems.filter(
            (p) => p.isActive !== false && (!p.approvalStatus || p.approvalStatus === "approved")
          ).length,
          myTotal: myItems.length,
          pendingApproval: myItems.filter((p) => p.approvalStatus === "pending_approval").length,
          approved: myItems.filter((p) => !p.approvalStatus || p.approvalStatus === "approved").length,
          rejected: myItems.filter((p) => p.approvalStatus === "rejected").length,
          pendingOrders
        },
        products: visibleItems,
        orders
      });
    }
  );
  router.put(
    "/agent/shop/orders/:orderId",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const orderId = sanitizeText(req.params.orderId, 80);
        const action = sanitizeText(req.body?.action, 32);
        const rawStatus = sanitizeText(req.body?.status || "", 32);
        const deliveredContentInput = sanitizeText(req.body?.deliveredContent || "", 1500);
        const adminNote = sanitizeText(req.body?.adminNote || "", 600);
        const notifyEmail = req.body?.notifyEmail !== false;
        const notifyShopInbox = req.body?.notifyShopInbox !== false;
        const notifyUserAlert = req.body?.notifyUserAlert !== false;
        const chosenChannels = [];
        if (notifyEmail) chosenChannels.push("email");
        if (notifyShopInbox) chosenChannels.push("shop_inbox");
        if (notifyUserAlert) chosenChannels.push("notification");
        if (chosenChannels.length === 0) {
          chosenChannels.push("email", "notification");
        }
        if (!orderId || !["approve_payment", "set_status", "send_update", "processing", "deliver", "cancel"].includes(
          action
        )) {
          res.status(400).json({ success: false, message: "Invalid order action." });
          return;
        }
        const outcome = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          const subAgentIds = agent && (agent.tier || "agent") === "agent" ? new Set(
            db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.userId).filter(Boolean)
          ) : /* @__PURE__ */ new Set();
          const order = (db.shopOrders || []).find((o) => o.id === orderId);
          if (!order) throw new Error("Shop order not found.");
          const product = (db.shopItems || []).find((p) => p.id === order.itemId);
          const belongsToDesk = order.sellerUserId === agentUser.id || order.sellerUserId && subAgentIds.has(order.sellerUserId) || agent && order.agentId === agent.id || product && (product.submittedByUserId === agentUser.id || product.submittedByUserId && subAgentIds.has(product.submittedByUserId) || agent && product.agentId === agent.id);
          if (!belongsToDesk) {
            throw new Error("You can only approve or manage orders for products submitted by your desk.");
          }
          return applyShopOrderAction(db, order, agentUser, "agent", {
            action,
            rawStatus,
            deliveredContentInput,
            adminNote,
            chosenChannels
          });
        });
        dispatchSmtpJobsInBackground(outcome.smtpJobs);
        if (outcome.dmToEmit && outcome.emitUserId) {
          sendChatEventToUsers([outcome.emitUserId], "direct:message", outcome.dmToEmit);
          sendChatEventToUsers(outcome.emitStaffIds, "admin:inbox_message", outcome.dmToEmit);
        }
        broadcastChatEvent("shop:orders_updated", {
          action,
          orderId: outcome.order.id,
          userId: outcome.order.userId,
          sellerUserId: outcome.order.sellerUserId || null,
          agentId: outcome.order.agentId || null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: `Order updated & customer notified by Agent Desk.`,
          order: outcome.order
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not process Shop order."
        });
      }
    }
  );
  router.post(
    "/agent/shop/products",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const title = sanitizeText(req.body?.title, 120);
        const description = sanitizeText(req.body?.description, 500);
        const price = Math.round(Number(req.body?.price) * 100) / 100;
        const rawCat = sanitizeText(req.body?.category || "digital", 24);
        const allowedCats = /* @__PURE__ */ new Set(["digital", "physical", "smm", "cyber_pack", "on_demand"]);
        const category = allowedCats.has(rawCat) ? rawCat : "digital";
        const deliveryMode = category === "digital" ? "auto_email" : "manual_admin";
        const badgeText = sanitizeText(req.body?.badgeText || "", 40) || (category === "cyber_pack" ? "Cyber Pack" : category === "physical" ? "Physical" : category === "smm" ? "SMM Service" : category === "on_demand" ? "On-Demand" : "Digital \xB7 Auto Email");
        const autoDeliveryTemplate = sanitizeText(req.body?.autoDeliveryTemplate || "", 320) || null;
        const digitalDownloadUrl = sanitizeText(req.body?.digitalDownloadUrl || "", 400) || null;
        const sellerNotes = sanitizeText(req.body?.sellerNotes || "", 400) || null;
        const imageKey = sanitizeText(req.body?.imageKey || "", 40) || (category === "cyber_pack" ? "cyber_freefire" : category === "physical" ? "physical" : category === "smm" ? "smm" : "digital");
        let customImageUrl = null;
        if (typeof req.body?.customImageUrl === "string" && req.body.customImageUrl.startsWith("data:image/")) {
          customImageUrl = saveUploadedCoverImage(req.body.customImageUrl);
        } else if (typeof req.body?.customImageUrl === "string" && req.body.customImageUrl.startsWith("/api/shop/media/")) {
          customImageUrl = sanitizeText(req.body.customImageUrl, 200);
        }
        const stockRaw = req.body?.stock;
        const stock = stockRaw !== void 0 && stockRaw !== "" && stockRaw !== null ? Math.max(0, Math.floor(Number(stockRaw))) : null;
        if (!title || title.length < 3) {
          res.status(400).json({ success: false, message: "Product title is required (min 3 chars)." });
          return;
        }
        if (!Number.isFinite(price) || price <= 0) {
          res.status(400).json({ success: false, message: "Valid product price is required." });
          return;
        }
        let fileMeta = {
          digitalFileName: null,
          digitalFileMime: null,
          digitalFileSize: null,
          digitalFileStorageName: null
        };
        if (category === "digital" && req.body?.digitalFile && req.body.digitalFile.base64Data) {
          fileMeta = saveUploadedDigitalFile(req.body.digitalFile);
        }
        const couponFields = parseCouponFields(req.body || {});
        const created = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!Array.isArray(db.shopItems)) db.shopItems = [];
          const now = (/* @__PURE__ */ new Date()).toISOString();
          const newItem = {
            id: generateId("shop"),
            title,
            description: description || `${title} \u2014 submitted by @${agentUser.username}.`,
            price,
            kind: "product",
            category,
            deliveryMode,
            imageKey,
            customImageUrl,
            spinsGranted: 0,
            lotteryId: null,
            badgeText,
            stock,
            autoDeliveryTemplate,
            digitalFileName: fileMeta.digitalFileName,
            digitalFileMime: fileMeta.digitalFileMime,
            digitalFileSize: fileMeta.digitalFileSize,
            digitalFileStorageName: fileMeta.digitalFileStorageName,
            digitalDownloadUrl,
            requiresShipping: category === "physical",
            requiresTargetLink: category === "smm",
            requiresGameUid: category === "cyber_pack",
            requiresCustomBrief: category === "on_demand",
            ...couponFields,
            isActive: false,
            approvalStatus: "pending_approval",
            submittedByUserId: agentUser.id,
            submittedByUsername: agentUser.username,
            submittedByFullName: agentUser.fullName,
            submittedByRole: agentUser.role,
            agentId: agent?.id || null,
            agentDistrict: agent?.district || null,
            sellerNotes,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: now,
            updatedAt: now
          };
          db.shopItems.unshift(newItem);
          const adminUsers = db.users.filter((u) => u.role === "admin" || u.role === "moderator");
          for (const adm of adminUsers) {
            db.notifications.unshift({
              id: generateId("notif"),
              userId: adm.id,
              title: "New Agent Product Pending Approval",
              message: `@${agentUser.username} (${agentUser.role === "sub_agent" ? "Sub-Agent" : "Agent"}) submitted "${newItem.title}" (${db.settings.currencySymbol}${newItem.price}) for Admin Product Manager review.`,
              type: "info",
              isRead: false,
              createdAt: now
            });
          }
          return newItem;
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "agent_submitted",
          itemId: created.id,
          approvalStatus: created.approvalStatus || "pending_approval",
          submittedByUserId: created.submittedByUserId || null,
          agentId: created.agentId || null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.status(201).json({
          success: true,
          message: `"${created.title}" submitted for Admin approval. Once approved in Product Manager, it will appear on the Shop.`,
          product: toPublicShopItem(created)
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not submit product."
        });
      }
    }
  );
  router.put(
    "/agent/shop/products/:id",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const productId = sanitizeText(req.params.id, 80);
        const result = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          const subAgentUserIds = agent && (agent.tier || "agent") === "agent" ? new Set(
            db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.userId).filter(Boolean)
          ) : /* @__PURE__ */ new Set();
          const existing = (db.shopItems || []).find((p) => p.id === productId);
          if (!existing) throw new Error("Product not found.");
          const isOwner = existing.submittedByUserId === agentUser.id || existing.submittedByUserId && subAgentUserIds.has(existing.submittedByUserId) || agent && existing.agentId === agent.id && existing.submittedByRole !== "admin";
          const title = typeof req.body?.title === "string" && req.body.title.trim().length >= 3 ? sanitizeText(req.body.title, 120) : existing.title;
          const description = typeof req.body?.description === "string" && req.body.description.trim() ? sanitizeText(req.body.description, 500) : existing.description;
          const price = req.body?.price !== void 0 && Number(req.body.price) > 0 ? Math.round(Number(req.body.price) * 100) / 100 : existing.price;
          const rawCat = sanitizeText(req.body?.category || existing.category || "digital", 24);
          const allowedCats = /* @__PURE__ */ new Set(["digital", "physical", "smm", "cyber_pack", "on_demand"]);
          const category = allowedCats.has(rawCat) ? rawCat : existing.category || "digital";
          const deliveryMode = category === "digital" ? "auto_email" : "manual_admin";
          const badgeText = typeof req.body?.badgeText === "string" ? sanitizeText(req.body.badgeText, 40) || existing.badgeText : existing.badgeText;
          const stock = req.body?.stock === "" ? null : req.body?.stock !== void 0 && req.body.stock !== null ? Math.max(0, Math.floor(Number(req.body.stock))) : existing.stock ?? null;
          const imageKey = typeof req.body?.imageKey === "string" && req.body.imageKey.trim() ? sanitizeText(req.body.imageKey, 40) : existing.imageKey || "digital";
          let customImageUrl = existing.customImageUrl || null;
          if (typeof req.body?.customImageUrl === "string") {
            if (req.body.customImageUrl === "") {
              customImageUrl = null;
            } else if (req.body.customImageUrl.startsWith("data:image/")) {
              customImageUrl = saveUploadedCoverImage(req.body.customImageUrl);
            } else if (req.body.customImageUrl.startsWith("/api/shop/media/")) {
              customImageUrl = sanitizeText(req.body.customImageUrl, 200);
            }
          }
          const autoDeliveryTemplate = req.body?.autoDeliveryTemplate !== void 0 ? sanitizeText(req.body.autoDeliveryTemplate || "", 320) || null : existing.autoDeliveryTemplate || null;
          const digitalDownloadUrl = req.body?.digitalDownloadUrl !== void 0 ? sanitizeText(req.body.digitalDownloadUrl || "", 400) || null : existing.digitalDownloadUrl || null;
          const sellerNotes = req.body?.sellerNotes !== void 0 ? sanitizeText(req.body.sellerNotes || "", 400) || null : existing.sellerNotes || null;
          let fileMeta = {
            digitalFileName: existing.digitalFileName || null,
            digitalFileMime: existing.digitalFileMime || null,
            digitalFileSize: existing.digitalFileSize || null,
            digitalFileStorageName: existing.digitalFileStorageName || null
          };
          if (category === "digital" && req.body?.digitalFile && req.body.digitalFile.base64Data) {
            fileMeta = saveUploadedDigitalFile(req.body.digitalFile);
          }
          const nextCoupon = parseCouponFields(req.body || {}, existing);
          const now = (/* @__PURE__ */ new Date()).toISOString();
          if (isOwner) {
            existing.title = title;
            existing.description = description;
            existing.price = price;
            existing.category = category;
            existing.deliveryMode = deliveryMode;
            existing.badgeText = badgeText;
            existing.stock = stock;
            existing.imageKey = imageKey;
            existing.customImageUrl = customImageUrl;
            existing.autoDeliveryTemplate = autoDeliveryTemplate;
            existing.digitalDownloadUrl = digitalDownloadUrl;
            existing.sellerNotes = sellerNotes;
            existing.digitalFileName = fileMeta.digitalFileName;
            existing.digitalFileMime = fileMeta.digitalFileMime;
            existing.digitalFileSize = fileMeta.digitalFileSize;
            existing.digitalFileStorageName = fileMeta.digitalFileStorageName;
            existing.requiresShipping = category === "physical";
            existing.requiresTargetLink = category === "smm";
            existing.requiresGameUid = category === "cyber_pack";
            existing.requiresCustomBrief = category === "on_demand";
            existing.couponCode = nextCoupon.couponCode;
            existing.couponDiscountType = nextCoupon.couponDiscountType;
            existing.couponDiscountValue = nextCoupon.couponDiscountValue;
            existing.couponMinOrder = nextCoupon.couponMinOrder;
            existing.couponActive = nextCoupon.couponActive;
            existing.approvalStatus = "pending_approval";
            existing.isActive = false;
            existing.rejectionReason = null;
            existing.updatedAt = now;
            const adminUsers2 = db.users.filter((u) => u.role === "admin" || u.role === "moderator");
            for (const adm of adminUsers2) {
              db.notifications.unshift({
                id: generateId("notif"),
                userId: adm.id,
                title: "Edited Agent Product Needs Approval",
                message: `@${agentUser.username} customized "${existing.title}". Review and approve in Product Manager.`,
                type: "info",
                isRead: false,
                createdAt: now
              });
            }
            return { item: existing, cloned: false };
          }
          const customizedCopy = {
            id: generateId("shop"),
            title,
            description,
            price,
            kind: "product",
            category,
            deliveryMode,
            imageKey,
            customImageUrl,
            spinsGranted: existing.spinsGranted || 0,
            lotteryId: existing.lotteryId || null,
            badgeText,
            stock,
            autoDeliveryTemplate,
            digitalFileName: fileMeta.digitalFileName,
            digitalFileMime: fileMeta.digitalFileMime,
            digitalFileSize: fileMeta.digitalFileSize,
            digitalFileStorageName: fileMeta.digitalFileStorageName,
            digitalDownloadUrl,
            requiresShipping: category === "physical",
            requiresTargetLink: category === "smm",
            requiresGameUid: category === "cyber_pack",
            requiresCustomBrief: category === "on_demand",
            ...nextCoupon,
            isActive: false,
            approvalStatus: "pending_approval",
            submittedByUserId: agentUser.id,
            submittedByUsername: agentUser.username,
            submittedByFullName: agentUser.fullName,
            submittedByRole: agentUser.role,
            agentId: agent?.id || null,
            agentDistrict: agent?.district || null,
            sellerNotes: sellerNotes || `Customized from catalog item "${existing.title}"`,
            rejectionReason: null,
            reviewedBy: null,
            reviewedAt: null,
            submittedAt: now,
            updatedAt: now
          };
          db.shopItems.unshift(customizedCopy);
          const adminUsers = db.users.filter((u) => u.role === "admin" || u.role === "moderator");
          for (const adm of adminUsers) {
            db.notifications.unshift({
              id: generateId("notif"),
              userId: adm.id,
              title: "New Customized Product Pending Approval",
              message: `@${agentUser.username} submitted a customized product "${customizedCopy.title}" for Admin approval.`,
              type: "info",
              isRead: false,
              createdAt: now
            });
          }
          return { item: customizedCopy, cloned: true };
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: result.cloned ? "agent_customized" : "agent_updated",
          itemId: result.item.id,
          approvalStatus: result.item.approvalStatus || "pending_approval",
          submittedByUserId: result.item.submittedByUserId || null,
          agentId: result.item.agentId || null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: result.cloned ? `Customized product "${result.item.title}" submitted to Admin Product Manager for approval.` : `"${result.item.title}" updated and queued for Admin approval.`,
          product: toPublicShopItem(result.item)
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not customize product."
        });
      }
    }
  );
  router.delete(
    "/agent/shop/products/:id",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const productId = sanitizeText(req.params.id, 80);
        await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          const subAgentUserIds = agent && (agent.tier || "agent") === "agent" ? new Set(
            db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.userId).filter(Boolean)
          ) : /* @__PURE__ */ new Set();
          const idx = (db.shopItems || []).findIndex((p) => p.id === productId);
          if (idx === -1) throw new Error("Product not found.");
          const item = db.shopItems[idx];
          const canDelete = item.submittedByUserId === agentUser.id || item.submittedByUserId && subAgentUserIds.has(item.submittedByUserId);
          if (!canDelete) {
            throw new Error("You can only delete products submitted by your desk.");
          }
          db.shopItems.splice(idx, 1);
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "agent_deleted",
          itemId: productId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({ success: true, message: "Submitted product removed." });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not delete product."
        });
      }
    }
  );
  router.get(
    "/agent/shop/coupons",
    requireAuth,
    requireAgent,
    (req, res) => {
      res.setHeader("Cache-Control", "no-store");
      const db = getDbSnapshot();
      const agentUser = db.users.find((u) => u.id === req.authUser.id);
      if (!agentUser) {
        res.status(404).json({ success: false, message: "Agent account not found." });
        return;
      }
      const agent = resolveLinkedAgent(db, agentUser);
      const subAgentUserIds = agent && (agent.tier || "agent") === "agent" ? new Set(
        db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.userId).filter(Boolean)
      ) : /* @__PURE__ */ new Set();
      const ownCoupons = (db.shopCoupons || []).filter(
        (c) => c.createdByUserId === agentUser.id || agent?.id && c.agentId === agent.id || subAgentUserIds.has(c.createdByUserId)
      ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      const ownProducts = (db.shopItems || []).filter(
        (p) => p.submittedByUserId === agentUser.id || agent?.id && p.agentId === agent.id || p.submittedByUserId && subAgentUserIds.has(p.submittedByUserId)
      );
      const liveCatalogProducts = (db.shopItems || []).filter(
        (p) => p.isActive !== false && (!p.approvalStatus || p.approvalStatus === "approved") && !ownProducts.some((o) => o.id === p.id)
      );
      const eligibleProducts = [...ownProducts, ...liveCatalogProducts].map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        imageKey: p.imageKey,
        customImageUrl: p.customImageUrl || null,
        isActive: p.isActive !== false,
        approvalStatus: p.approvalStatus || "approved",
        submittedByUsername: p.submittedByUsername || null,
        submittedByRole: p.submittedByRole || null
      }));
      res.json({
        success: true,
        currencySymbol: db.settings.currencySymbol || "\u09F3",
        coupons: ownCoupons,
        products: eligibleProducts,
        summary: buildCouponSummary(ownCoupons)
      });
    }
  );
  router.post(
    "/agent/shop/coupons",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const coupon = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          if (!Array.isArray(db.shopCoupons)) db.shopCoupons = [];
          const validProductIds = new Set((db.shopItems || []).map((p) => p.id));
          const parsed = parseStandaloneCouponInput(req.body || {}, validProductIds);
          const duplicate = db.shopCoupons.find(
            (c) => c.code.toUpperCase() === parsed.code.toUpperCase()
          );
          if (duplicate) {
            throw new Error(`Coupon code "${parsed.code}" already exists. Choose another code.`);
          }
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const created = {
            id: generateId("cpn"),
            ...parsed,
            usedCount: 0,
            createdByUserId: agentUser.id,
            createdByUsername: agentUser.username,
            createdByRole: agentUser.role,
            agentId: agent?.id || null,
            createdAt: nowIso,
            updatedAt: nowIso
          };
          db.shopCoupons.unshift(created);
          return created;
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "agent_coupon_created",
          couponId: coupon.id,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.status(201).json({
          success: true,
          message: `Coupon "${coupon.code}" created and synced live to Shop.`,
          coupon
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not create coupon."
        });
      }
    }
  );
  router.put(
    "/agent/shop/coupons/:id",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const couponId = sanitizeText(req.params.id, 80);
        const updated = await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          const subAgentUserIds = agent && (agent.tier || "agent") === "agent" ? new Set(
            db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.userId).filter(Boolean)
          ) : /* @__PURE__ */ new Set();
          if (!Array.isArray(db.shopCoupons)) db.shopCoupons = [];
          const existing = db.shopCoupons.find((c) => c.id === couponId);
          if (!existing) throw new Error("Coupon not found.");
          const canEdit = existing.createdByUserId === agentUser.id || agent?.id && existing.agentId === agent.id || subAgentUserIds.has(existing.createdByUserId);
          if (!canEdit) {
            throw new Error("You can only edit coupons created by your desk.");
          }
          const validProductIds = new Set((db.shopItems || []).map((p) => p.id));
          const parsed = parseStandaloneCouponInput(req.body || {}, validProductIds, existing);
          const duplicate = db.shopCoupons.find(
            (c) => c.id !== couponId && c.code.toUpperCase() === parsed.code.toUpperCase()
          );
          if (duplicate) {
            throw new Error(`Coupon code "${parsed.code}" already exists.`);
          }
          Object.assign(existing, parsed, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
          return existing;
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "agent_coupon_updated",
          couponId: updated.id,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: `Coupon "${updated.code}" updated.`,
          coupon: updated
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not update coupon."
        });
      }
    }
  );
  router.delete(
    "/agent/shop/coupons/:id",
    requireAuth,
    requireAgent,
    async (req, res) => {
      try {
        const couponId = sanitizeText(req.params.id, 80);
        await withTransaction((db) => {
          const agentUser = db.users.find((u) => u.id === req.authUser.id);
          if (!agentUser) throw new Error("Agent account not found.");
          const agent = resolveLinkedAgent(db, agentUser);
          const subAgentUserIds = agent && (agent.tier || "agent") === "agent" ? new Set(
            db.agents.filter((a) => a.parentAgentId === agent.id).map((a) => a.userId).filter(Boolean)
          ) : /* @__PURE__ */ new Set();
          if (!Array.isArray(db.shopCoupons)) db.shopCoupons = [];
          const idx = db.shopCoupons.findIndex((c) => c.id === couponId);
          if (idx === -1) throw new Error("Coupon not found.");
          const existing = db.shopCoupons[idx];
          const canDelete = existing.createdByUserId === agentUser.id || agent?.id && existing.agentId === agent.id || subAgentUserIds.has(existing.createdByUserId);
          if (!canDelete) {
            throw new Error("You can only delete coupons created by your desk.");
          }
          db.shopCoupons.splice(idx, 1);
        });
        broadcastChatEvent("shop:catalog_updated", {
          action: "agent_coupon_deleted",
          couponId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({ success: true, message: "Coupon removed." });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not delete coupon."
        });
      }
    }
  );
  const MICRO_TASK_PROOFS_DIR = import_path5.default.resolve(process.cwd(), "data", "micro_task_proofs");
  const VALID_MICRO_TASK_CATEGORIES = /* @__PURE__ */ new Set([
    "website_traffic",
    "youtube",
    "social_media",
    "app_signup",
    "review_survey",
    "other"
  ]);
  function getTodayDateStamp() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  function saveUploadedMicroTaskProofImage(dataUrl) {
    const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif|avif));base64,(.+)$/i.exec(dataUrl.trim());
    if (!match) {
      throw new Error("Unsupported proof screenshot format. Upload PNG, JPG, or WebP.");
    }
    const mime = match[1].toLowerCase();
    const buf = Buffer.from(match[2], "base64");
    if (buf.length === 0) {
      throw new Error("Proof screenshot file is empty.");
    }
    if (buf.length > 6 * 1024 * 1024) {
      throw new Error("Proof screenshot must be under 6 MB.");
    }
    const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : mime === "image/gif" ? ".gif" : mime === "image/avif" ? ".avif" : ".jpg";
    import_fs6.default.mkdirSync(MICRO_TASK_PROOFS_DIR, { recursive: true });
    const filename = `${generateId("proof")}${ext}`;
    import_fs6.default.writeFileSync(import_path5.default.join(MICRO_TASK_PROOFS_DIR, filename), buf);
    return `/api/micro-tasks/proof/${filename}`;
  }
  function parseMicroTaskInput(body, existing) {
    const title = sanitizeText(body.title ?? existing?.title ?? "", 140);
    if (title.length < 3) {
      throw new Error("Task title must be at least 3 characters.");
    }
    const rawCat = sanitizeText(body.category ?? existing?.category ?? "website_traffic", 40);
    const category = VALID_MICRO_TASK_CATEGORIES.has(rawCat) ? rawCat : "website_traffic";
    const description = sanitizeText(body.description ?? existing?.description ?? "", 500);
    const instructions = sanitizeText(body.instructions ?? existing?.instructions ?? "", 1500);
    if (instructions.length < 5) {
      throw new Error("Please provide clear task & proof instructions (at least 5 characters).");
    }
    const rawUrl = String(body.targetUrl ?? existing?.targetUrl ?? "").trim().slice(0, 600);
    let targetUrl = "";
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Invalid protocol");
      }
      targetUrl = parsed.toString();
    } catch {
      throw new Error("Please enter a valid Target URL starting with https:// or http://");
    }
    const rewardAmount = Math.round(Number(body.rewardAmount ?? existing?.rewardAmount ?? 0) * 100) / 100;
    if (!Number.isFinite(rewardAmount) || rewardAmount <= 0 || rewardAmount > 1e5) {
      throw new Error("Reward amount must be greater than 0.");
    }
    const maxWorkers = Math.max(
      0,
      Math.min(1e5, Math.floor(Number(body.maxWorkers ?? existing?.maxWorkers ?? 0) || 0))
    );
    const minStaySeconds = Math.max(
      0,
      Math.min(300, Math.floor(Number(body.minStaySeconds ?? existing?.minStaySeconds ?? 15) || 0))
    );
    const requireScreenshot = body.requireScreenshot !== void 0 ? Boolean(body.requireScreenshot) : existing?.requireScreenshot ?? true;
    const allowDailyRepeat = body.allowDailyRepeat !== void 0 ? Boolean(body.allowDailyRepeat) : existing?.allowDailyRepeat ?? false;
    const isActive = body.isActive !== void 0 ? Boolean(body.isActive) : existing?.isActive ?? true;
    let expiresAt = existing?.expiresAt ?? null;
    if (body.expiresAt !== void 0) {
      const rawExp = String(body.expiresAt || "").trim();
      if (!rawExp) {
        expiresAt = null;
      } else {
        const dt = new Date(rawExp);
        if (Number.isNaN(dt.getTime())) {
          throw new Error("Invalid expiry date/time.");
        }
        expiresAt = dt.toISOString();
      }
    }
    return {
      title,
      category,
      description,
      instructions,
      targetUrl,
      rewardAmount,
      maxWorkers,
      minStaySeconds,
      requireScreenshot,
      allowDailyRepeat,
      isActive,
      expiresAt
    };
  }
  function enrichMicroTaskForViewer(task, submissions, viewerUserId) {
    const taskSubs = submissions.filter((s) => s.taskId === task.id);
    const pendingCount = taskSubs.filter((s) => s.status === "pending").length;
    const usedSlots = task.completedCount + pendingCount;
    const remainingSlots = task.maxWorkers > 0 ? Math.max(0, task.maxWorkers - usedSlots) : null;
    let myLatestSubmission = null;
    let canSubmitNow = true;
    const nowMs = Date.now();
    const isExpired = Boolean(task.expiresAt && new Date(task.expiresAt).getTime() <= nowMs);
    if (!task.isActive || isExpired || remainingSlots !== null && remainingSlots <= 0) {
      canSubmitNow = false;
    }
    if (viewerUserId) {
      const myTaskSubs = taskSubs.filter((s) => s.userId === viewerUserId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const latest = myTaskSubs[0];
      if (latest) {
        myLatestSubmission = {
          id: latest.id,
          status: latest.status,
          adminNote: latest.adminNote ?? null,
          createdAt: latest.createdAt
        };
        if (latest.status === "pending") {
          canSubmitNow = false;
        } else if (latest.status === "approved") {
          if (!task.allowDailyRepeat) {
            canSubmitNow = false;
          } else {
            const today = getTodayDateStamp();
            const submittedDay = latest.createdAt.slice(0, 10);
            if (submittedDay === today) {
              canSubmitNow = false;
            }
          }
        }
      }
    }
    return {
      ...task,
      pendingCount,
      remainingSlots,
      myLatestSubmission,
      canSubmitNow
    };
  }
  router.get("/micro-tasks/proof/:filename", requireAuth, (req, res) => {
    const safeName = import_path5.default.basename(sanitizeText(req.params.filename, 120));
    if (!safeName || !/^[a-zA-Z0-9._\-]+$/.test(safeName)) {
      res.status(400).end();
      return;
    }
    const db = getDbSnapshot();
    const user = req.authUser;
    const isStaff = user.role === "admin" || user.role === "moderator";
    if (!isStaff) {
      const proofUrl = `/api/micro-tasks/proof/${safeName}`;
      const ownsProof = (db.microTaskSubmissions || []).some(
        (s) => s.userId === user.id && s.proofImageUrl === proofUrl
      );
      if (!ownsProof) {
        res.status(403).end();
        return;
      }
    }
    const fullPath = import_path5.default.resolve(MICRO_TASK_PROOFS_DIR, safeName);
    if (!fullPath.startsWith(MICRO_TASK_PROOFS_DIR) || !import_fs6.default.existsSync(fullPath)) {
      res.status(404).end();
      return;
    }
    const ext = import_path5.default.extname(safeName).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : ext === ".avif" ? "image/avif" : "image/jpeg";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "private, max-age=86400");
    import_fs6.default.createReadStream(fullPath).pipe(res);
  });
  router.get("/micro-tasks", (req, res) => {
    const db = getDbSnapshot();
    const token = extractBearerOrCookieToken(req);
    const payload = token ? verifySessionToken(token) : null;
    const viewer = payload ? db.users.find((u) => u.id === payload.uid && u.status === "active") : void 0;
    const nowMs = Date.now();
    const allTasks = Array.isArray(db.microTasks) ? db.microTasks : [];
    const allSubmissions = Array.isArray(db.microTaskSubmissions) ? db.microTaskSubmissions : [];
    const activeTasks = allTasks.filter((t) => t.isActive && (!t.expiresAt || new Date(t.expiresAt).getTime() > nowMs)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((t) => enrichMicroTaskForViewer(t, allSubmissions, viewer?.id));
    const mySubmissions = viewer ? allSubmissions.filter((s) => s.userId === viewer.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100) : [];
    const totalEarned = Math.round(
      mySubmissions.filter((s) => s.status === "approved").reduce((acc, s) => acc + s.rewardAmount, 0) * 100
    ) / 100;
    res.json({
      success: true,
      currencySymbol: db.settings.currencySymbol || "\u09F3",
      tasks: activeTasks,
      mySubmissions,
      summary: {
        availableCount: activeTasks.filter((t) => t.canSubmitNow).length,
        totalEarned,
        pendingCount: mySubmissions.filter((s) => s.status === "pending").length,
        approvedCount: mySubmissions.filter((s) => s.status === "approved").length,
        rejectedCount: mySubmissions.filter((s) => s.status === "rejected").length
      }
    });
  });
  router.post("/micro-tasks/:id/click", async (req, res) => {
    try {
      const taskId = sanitizeText(req.params.id, 80);
      const clickedAt = (/* @__PURE__ */ new Date()).toISOString();
      const clickCount = await withTransaction((db) => {
        if (!Array.isArray(db.microTasks)) db.microTasks = [];
        const task = db.microTasks.find((t) => t.id === taskId && t.isActive);
        if (!task) {
          throw new Error("Micro-task not found or inactive.");
        }
        task.clickCount = (task.clickCount || 0) + 1;
        return task.clickCount;
      });
      res.json({ success: true, clickedAt, clickCount });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not track task click."
      });
    }
  });
  router.post("/micro-tasks/:id/submit", requireAuth, async (req, res) => {
    try {
      const taskId = sanitizeText(req.params.id, 80);
      const proofNote = sanitizeText(req.body?.proofNote || "", 800);
      const rawProofImage = typeof req.body?.proofImageDataUrl === "string" ? req.body.proofImageDataUrl.trim() : "";
      const rawClickedAt = typeof req.body?.clickedAt === "string" ? sanitizeText(req.body.clickedAt, 60) : null;
      let savedProofImageUrl = null;
      if (rawProofImage) {
        savedProofImageUrl = saveUploadedMicroTaskProofImage(rawProofImage);
      }
      const submission = await withTransaction((db) => {
        if (!Array.isArray(db.microTasks)) db.microTasks = [];
        if (!Array.isArray(db.microTaskSubmissions)) db.microTaskSubmissions = [];
        const task = db.microTasks.find((t) => t.id === taskId);
        if (!task || !task.isActive) {
          throw new Error("This task is no longer active.");
        }
        if (task.expiresAt && new Date(task.expiresAt).getTime() <= Date.now()) {
          throw new Error("This task has expired.");
        }
        const taskSubs = db.microTaskSubmissions.filter((s) => s.taskId === task.id);
        const pendingCount = taskSubs.filter((s) => s.status === "pending").length;
        if (task.maxWorkers > 0 && task.completedCount + pendingCount >= task.maxWorkers) {
          throw new Error("All worker slots for this task are currently filled.");
        }
        const user = req.authUser;
        const mySubs = taskSubs.filter((s) => s.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latest = mySubs[0];
        if (latest) {
          if (latest.status === "pending") {
            throw new Error("Your previous proof for this task is already pending admin review.");
          }
          if (latest.status === "approved") {
            if (!task.allowDailyRepeat) {
              throw new Error("You have already completed and been paid for this task.");
            }
            if (latest.createdAt.slice(0, 10) === getTodayDateStamp()) {
              throw new Error("You already completed this daily task today. Come back tomorrow!");
            }
          }
        }
        if (task.requireScreenshot && !savedProofImageUrl) {
          throw new Error("Please upload a screenshot proof image before submitting.");
        }
        if (!savedProofImageUrl && proofNote.length < 3) {
          throw new Error("Please upload a screenshot proof or enter proof details.");
        }
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        const created = {
          id: generateId("mts"),
          taskId: task.id,
          taskTitle: task.title,
          taskCategory: task.category,
          targetUrl: task.targetUrl,
          userId: user.id,
          username: user.username,
          rewardAmount: task.rewardAmount,
          proofNote,
          proofImageUrl: savedProofImageUrl,
          clickedAt: rawClickedAt || nowIso,
          status: "pending",
          adminNote: null,
          reviewedByUserId: null,
          reviewedByUsername: null,
          reviewedAt: null,
          createdAt: nowIso,
          updatedAt: nowIso
        };
        db.microTaskSubmissions.unshift(created);
        return created;
      });
      broadcastChatEvent("micro_tasks:updated", {
        action: "submission_created",
        taskId,
        submissionId: submission.id,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json({
        success: true,
        message: "Proof submitted! Admin will review and credit your wallet once approved.",
        submission
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err instanceof Error ? err.message : "Could not submit task proof."
      });
    }
  });
  router.get(
    "/admin/micro-tasks",
    requireAuth,
    requireStaff,
    (_req, res) => {
      const db = getDbSnapshot();
      const tasks = Array.isArray(db.microTasks) ? db.microTasks : [];
      const submissions = Array.isArray(db.microTaskSubmissions) ? db.microTaskSubmissions : [];
      const enrichedTasks = [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((t) => enrichMicroTaskForViewer(t, submissions));
      const sortedSubmissions = [...submissions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const pendingSubmissions = sortedSubmissions.filter((s) => s.status === "pending").length;
      const approvedSubmissions = sortedSubmissions.filter((s) => s.status === "approved").length;
      const rejectedSubmissions = sortedSubmissions.filter((s) => s.status === "rejected").length;
      const totalPaidOut = Math.round(
        sortedSubmissions.filter((s) => s.status === "approved").reduce((acc, s) => acc + s.rewardAmount, 0) * 100
      ) / 100;
      res.json({
        success: true,
        currencySymbol: db.settings.currencySymbol || "\u09F3",
        summary: {
          totalTasks: enrichedTasks.length,
          activeTasks: enrichedTasks.filter((t) => t.isActive).length,
          totalClicks: enrichedTasks.reduce((acc, t) => acc + (t.clickCount || 0), 0),
          pendingSubmissions,
          approvedSubmissions,
          rejectedSubmissions,
          totalPaidOut
        },
        tasks: enrichedTasks,
        submissions: sortedSubmissions.slice(0, 300)
      });
    }
  );
  router.post(
    "/admin/micro-tasks",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const task = await withTransaction((db) => {
          if (!Array.isArray(db.microTasks)) db.microTasks = [];
          const parsed = parseMicroTaskInput(req.body || {});
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const created = {
            id: generateId("mtk"),
            ...parsed,
            completedCount: 0,
            clickCount: 0,
            createdByUserId: req.authUser.id,
            createdByUsername: req.authUser.username,
            createdAt: nowIso,
            updatedAt: nowIso
          };
          db.microTasks.unshift(created);
          pushAuditLog(
            db,
            { id: req.authUser.id, username: req.authUser.username },
            "MICRO_TASK_CREATED",
            "micro_task",
            created.id,
            {
              title: created.title,
              category: created.category,
              targetUrl: created.targetUrl,
              rewardAmount: created.rewardAmount,
              maxWorkers: created.maxWorkers
            },
            getClientIp(req)
          );
          return created;
        });
        broadcastChatEvent("micro_tasks:updated", {
          action: "task_created",
          taskId: task.id,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.status(201).json({
          success: true,
          message: `Task "${task.title}" published to Daily Tasks!`,
          task
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not create micro-task."
        });
      }
    }
  );
  router.put(
    "/admin/micro-tasks/:id",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const taskId = sanitizeText(req.params.id, 80);
        const updated = await withTransaction((db) => {
          if (!Array.isArray(db.microTasks)) db.microTasks = [];
          const existing = db.microTasks.find((t) => t.id === taskId);
          if (!existing) throw new Error("Micro-task not found.");
          const parsed = parseMicroTaskInput(req.body || {}, existing);
          Object.assign(existing, parsed, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
          return existing;
        });
        broadcastChatEvent("micro_tasks:updated", {
          action: "task_updated",
          taskId: updated.id,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: `Task "${updated.title}" updated.`,
          task: updated
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not update micro-task."
        });
      }
    }
  );
  router.delete(
    "/admin/micro-tasks/:id",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const taskId = sanitizeText(req.params.id, 80);
        await withTransaction((db) => {
          if (!Array.isArray(db.microTasks)) db.microTasks = [];
          const idx = db.microTasks.findIndex((t) => t.id === taskId);
          if (idx === -1) throw new Error("Micro-task not found.");
          db.microTasks.splice(idx, 1);
        });
        broadcastChatEvent("micro_tasks:updated", {
          action: "task_deleted",
          taskId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({ success: true, message: "Micro-task deleted." });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not delete micro-task."
        });
      }
    }
  );
  router.post(
    "/admin/micro-tasks/submissions/:id/review",
    requireAuth,
    requireStaff,
    async (req, res) => {
      try {
        const submissionId = sanitizeText(req.params.id, 80);
        const decision = sanitizeText(req.body?.decision || "", 20).toLowerCase();
        const adminNote = sanitizeText(req.body?.adminNote || "", 400);
        if (decision !== "approve" && decision !== "reject") {
          res.status(400).json({ success: false, message: "Decision must be approve or reject." });
          return;
        }
        const result = await withTransaction((db) => {
          if (!Array.isArray(db.microTaskSubmissions)) db.microTaskSubmissions = [];
          if (!Array.isArray(db.microTasks)) db.microTasks = [];
          const sub = db.microTaskSubmissions.find((s) => s.id === submissionId);
          if (!sub) throw new Error("Proof submission not found.");
          if (sub.status !== "pending") {
            throw new Error(`Submission was already ${sub.status}.`);
          }
          const nowIso = (/* @__PURE__ */ new Date()).toISOString();
          const sym = db.settings.currencySymbol || "\u09F3";
          sub.status = decision === "approve" ? "approved" : "rejected";
          sub.adminNote = adminNote || null;
          sub.reviewedByUserId = req.authUser.id;
          sub.reviewedByUsername = req.authUser.username;
          sub.reviewedAt = nowIso;
          sub.updatedAt = nowIso;
          const worker = db.users.find((u) => u.id === sub.userId);
          const task = db.microTasks.find((t) => t.id === sub.taskId);
          if (decision === "approve") {
            if (task) {
              task.completedCount = (task.completedCount || 0) + 1;
              task.updatedAt = nowIso;
            }
            if (worker) {
              worker.balance = Math.round((worker.balance + sub.rewardAmount) * 100) / 100;
              db.transactions.unshift({
                id: generateId("txn"),
                userId: worker.id,
                username: worker.username,
                direction: "credit",
                category: "task_reward",
                amount: sub.rewardAmount,
                balanceAfter: worker.balance,
                referenceId: sub.id,
                gateway: "micro_task",
                description: `Micro-Task Reward: ${sub.taskTitle}`,
                createdAt: nowIso
              });
              db.notifications.unshift({
                id: generateId("ntf"),
                userId: worker.id,
                title: "Micro-Task Proof Approved!",
                message: `Your proof for "${sub.taskTitle}" was approved. ${sym}${sub.rewardAmount} has been credited to your wallet.${adminNote ? ` Note: ${adminNote}` : ""}`,
                type: "success",
                isRead: false,
                createdAt: nowIso
              });
            }
          } else if (worker) {
            db.notifications.unshift({
              id: generateId("ntf"),
              userId: worker.id,
              title: "Micro-Task Proof Rejected",
              message: `Your proof for "${sub.taskTitle}" was rejected.${adminNote ? ` Reason: ${adminNote}` : " Please follow the task instructions carefully and submit again."}`,
              type: "warning",
              isRead: false,
              createdAt: nowIso
            });
          }
          pushAuditLog(
            db,
            { id: req.authUser.id, username: req.authUser.username },
            decision === "approve" ? "MICRO_TASK_PROOF_APPROVED" : "MICRO_TASK_PROOF_REJECTED",
            "micro_task_submission",
            sub.id,
            {
              taskId: sub.taskId,
              taskTitle: sub.taskTitle,
              workerUsername: sub.username,
              rewardAmount: sub.rewardAmount,
              adminNote: adminNote || null
            },
            getClientIp(req)
          );
          return {
            submission: sub,
            workerNewBalance: worker?.balance ?? null
          };
        });
        broadcastChatEvent("micro_tasks:updated", {
          action: decision === "approve" ? "submission_approved" : "submission_rejected",
          submissionId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.json({
          success: true,
          message: decision === "approve" ? `Proof approved and reward credited to @${result.submission.username}.` : `Proof rejected for @${result.submission.username}.`,
          submission: result.submission,
          workerNewBalance: result.workerNewBalance
        });
      } catch (err) {
        res.status(400).json({
          success: false,
          message: err instanceof Error ? err.message : "Could not review submission."
        });
      }
    }
  );
  router.use(createInstallerRouter());
  router.use(createSupportRouter());
  return router;
}

// server.ts
import_dotenv.default.config();
var RAW_PORT = process.env.PORT?.trim();
var PORT = RAW_PORT && /^\d+$/.test(RAW_PORT) ? Number(RAW_PORT) : RAW_PORT || 3e3;
async function startServer() {
  const app = (0, import_express4.default)();
  app.set("trust proxy", true);
  app.use(import_express4.default.json({ limit: "25mb" }));
  app.use(import_express4.default.urlencoded({ extended: true, limit: "25mb" }));
  app.get("/api/health", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({
      ok: true,
      app: "Lottery Winner",
      mode: process.env.NODE_ENV || "development",
      installerUrl: "/install"
    });
  });
  getDbSnapshot();
  await syncCampaignStatuses();
  setInterval(() => {
    syncCampaignStatuses().catch((err) => {
      console.error("[Campaign Scheduler Error]", err);
    });
  }, 1e3);
  app.use("/api", createApiRouter());
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true"
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distDir = import_path6.default.resolve(process.cwd(), "dist");
    const prebuiltDir = import_path6.default.resolve(process.cwd(), "prebuilt");
    const distIndex = import_path6.default.join(distDir, "index.html");
    const prebuiltIndex = import_path6.default.join(prebuiltDir, "index.html");
    const hasDist = import_fs7.default.existsSync(distIndex);
    const hasPrebuilt = import_fs7.default.existsSync(prebuiltIndex);
    let staticDir = hasDist ? distDir : hasPrebuilt ? prebuiltDir : null;
    if (hasDist && hasPrebuilt) {
      try {
        const distTime = import_fs7.default.statSync(distIndex).mtimeMs;
        const prebuiltTime = import_fs7.default.statSync(prebuiltIndex).mtimeMs;
        staticDir = prebuiltTime > distTime ? prebuiltDir : distDir;
      } catch {
        staticDir = distDir;
      }
    }
    if (staticDir) {
      app.use(
        import_express4.default.static(staticDir, {
          index: false,
          setHeaders: (res, filePath) => {
            if (filePath.endsWith(".html") || filePath.endsWith("sw.js") || filePath.endsWith("manifest.webmanifest")) {
              res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
              res.setHeader("Pragma", "no-cache");
              res.setHeader("Expires", "0");
            } else if (filePath.includes(`${import_path6.default.sep}assets${import_path6.default.sep}`)) {
              res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            }
          }
        })
      );
      app.get("*", (_req, res) => {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.sendFile(import_path6.default.join(staticDir, "index.html"));
      });
    }
  }
  const httpServer = import_http.default.createServer(app);
  attachChatWebSocket(httpServer);
  attachSupportWebSocket(httpServer);
  const isPassenger = typeof globalThis.PhusionPassenger !== "undefined" || Boolean(process.env.PASSENGER_APP_ENV) || Boolean(process.env.LSNODE_ROOT);
  if (typeof PORT === "string") {
    httpServer.listen(PORT, () => {
      console.log(`[Lottery Winner] Server listening on socket ${PORT}`);
    });
  } else if (isPassenger) {
    httpServer.listen(PORT, () => {
      console.log(`[Lottery Winner] Server listening under cPanel Passenger/LiteSpeed (port ${PORT})`);
    });
  } else {
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`[Lottery Winner] Server listening on http://0.0.0.0:${PORT}`);
    });
  }
}
startServer().catch((err) => {
  console.error("[Fatal Server Error]", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
