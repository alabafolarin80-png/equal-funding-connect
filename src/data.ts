import {
  Building2, User, Landmark, HeartHandshake, Gift, TrendingUp,
  Sprout, HandCoins, type LucideIcon,
} from "lucide-react";

/* ============================ TYPES ============================ */
export type UserRole = "business" | "individual" | "bank" | "ngo" | "donor" | "investor";
export type FundingType = "grant" | "loan" | "equity" | "donation";
export type Side = "seeker" | "provider";
export type View = "landing" | "directory" | "dashboard" | "messages";
export type ReqStatus = "pending" | "accepted" | "declined";

export interface Profile {
  id: string;
  name: string;
  org: string;
  role: UserRole;
  location: string;
  verified: boolean;
  bio: string;
  website?: string;
  fundingTypes: FundingType[];
  industries: string[];
  amountMin: number;
  amountMax: number;
  apr?: string;
  equity?: string;
  stage?: string;
  collateral?: string;
  cause?: string;
}

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  fundingType: FundingType;
  industry: string;
  region: string;
  amountMin: number;
  amountMax: number;
  terms?: string;
  stage: string;
  description: string;
  eligibility: string[];
  featured: boolean;
  createdAt: string;
}

export interface ConnectionRequest {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  listingId?: string;
  status: ReqStatus;
  message: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  participantIds: [string, string];
  connectionId: string;
  subject: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  attachment?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AppState {
  profiles: Profile[];
  listings: Listing[];
  requests: ConnectionRequest[];
  threads: Thread[];
  messages: Message[];
  notifications: AppNotification[];
  bookmarks: string[];
  activeProfileId: string;
  view: View;
  onboarded: boolean;
}

export interface OnboardingData {
  role: UserRole;
  name: string;
  org: string;
  location: string;
  bio: string;
  website: string;
  fundingTypes: FundingType[];
  industries: string[];
  amountMin: number;
  amountMax: number;
  apr: string;
  equity: string;
  stage: string;
  collateral: string;
  cause: string;
}

export interface Store {
  state: AppState;
  active: Profile;
  setView(v: View): void;
  setActiveProfile(id: string): void;
  toggleBookmark(id: string): void;
  addListing(l: Omit<Listing, "id" | "createdAt">): void;
  sendRequest(toProfileId: string, listingId: string | undefined, message: string): void;
  respondRequest(id: string, status: "accepted" | "declined"): void;
  sendMessage(threadId: string, body: string, attachment?: string): void;
  completeOnboarding(d: OnboardingData): void;
  markNotificationsRead(): void;
  resetDemo(): void;
}

/* ============================ META ============================ */
export const ROLE_META: Record<UserRole, { label: string; blurb: string; side: Side; icon: LucideIcon; accent: string }> = {
  business: { label: "Businesses", blurb: "Raise growth capital for your venture.", side: "seeker", icon: Building2, accent: "text-emerald-600" },
  individual: { label: "Individuals", blurb: "Find micro-grants and personal loans.", side: "seeker", icon: User, accent: "text-emerald-600" },
  bank: { label: "Banks", blurb: "Deploy SME lending at scale.", side: "provider", icon: Landmark, accent: "text-slate-700" },
  ngo: { label: "NGOs", blurb: "Fund community impact programs.", side: "provider", icon: HeartHandshake, accent: "text-slate-700" },
  donor: { label: "Donors", blurb: "Direct grants to vetted causes.", side: "provider", icon: Gift, accent: "text-slate-700" },
  investor: { label: "Investors", blurb: "Back high-growth equity deals.", side: "provider", icon: TrendingUp, accent: "text-slate-700" },
};

export const FUNDING_META: Record<FundingType, { label: string; icon: LucideIcon; badge: string }> = {
  grant: { label: "Grant", icon: Sprout, badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  loan: { label: "Loan", icon: Landmark, badge: "bg-sky-50 text-sky-700 ring-sky-600/20" },
  equity: { label: "Equity", icon: TrendingUp, badge: "bg-violet-50 text-violet-700 ring-violet-600/20" },
  donation: { label: "Donation", icon: HandCoins, badge: "bg-amber-50 text-amber-700 ring-amber-600/20" },
};

export const INDUSTRIES = ["CleanTech", "Agriculture", "Healthcare", "Retail", "Education", "SaaS", "Civic"];
export const REGIONS = ["East Africa", "West Africa", "Global", "South Asia", "Latin America", "North America"];
export const STAGES = ["Pre-seed", "Seed", "Series A", "Growth", "Community", "Emergency"];

export const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${n}`;
export const fmtRange = (a: number, b: number) => `${fmtMoney(a)} - ${fmtMoney(b)}`;
export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 9)}`;
const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

/* ============================ SEED ============================ */
const profiles: Profile[] = [
  { id: "p_biz", name: "Amina Yusuf", org: "GreenHarvest Foods", role: "business", location: "East Africa", verified: true, bio: "Agri-processing SME scaling cold-chain logistics for 400+ smallholder farmers.", fundingTypes: ["loan", "equity", "grant"], industries: ["Agriculture", "CleanTech"], amountMin: 50_000, amountMax: 500_000, stage: "Seed", website: "greenharvest.co" },
  { id: "p_ind", name: "Diego Ramirez", org: "Independent Founder", role: "individual", location: "Latin America", verified: true, bio: "Solo developer building civic fintech tools for local cooperatives.", fundingTypes: ["grant", "loan"], industries: ["SaaS", "Civic"], amountMin: 5_000, amountMax: 60_000, stage: "Pre-seed", website: "diegobuilds.dev" },
  { id: "p_bank", name: "Meridian Microbank", org: "Meridian Microbank", role: "bank", location: "West Africa", verified: true, bio: "Licensed microfinance lender focused on women-led SMEs and working capital.", fundingTypes: ["loan"], industries: ["Retail", "Agriculture", "Healthcare"], amountMin: 10_000, amountMax: 250_000, apr: "9 - 14%", collateral: "Partial, negotiable", stage: "Growth" },
  { id: "p_ngo", name: "Horizon Relief", org: "Horizon Relief Intl", role: "ngo", location: "Global", verified: true, bio: "Field NGO channeling disaster-relief and resilience grants to community groups.", fundingTypes: ["grant", "donation"], industries: ["Civic", "Healthcare", "Education"], amountMin: 2_000, amountMax: 120_000, cause: "Disaster relief & resilience", stage: "Community" },
  { id: "p_donor", name: "Bright Futures Fund", org: "Bright Futures Fund", role: "donor", location: "North America", verified: true, bio: "Private family foundation funding education and girls-in-tech initiatives.", fundingTypes: ["grant"], industries: ["Education", "Civic"], amountMin: 10_000, amountMax: 300_000, cause: "Education equity", stage: "Community" },
  { id: "p_inv", name: "Northstar Ventures", org: "Northstar Ventures", role: "investor", location: "Global", verified: true, bio: "Impact-first seed fund writing equity checks into climate and health startups.", fundingTypes: ["equity"], industries: ["CleanTech", "Healthcare", "SaaS"], amountMin: 100_000, amountMax: 2_000_000, equity: "5 - 15%", stage: "Seed" },
  { id: "p_biz2", name: "Lumen Health", org: "Lumen Health Labs", role: "business", location: "South Asia", verified: true, bio: "Diagnostics startup bringing low-cost lab-on-chip testing to rural clinics.", fundingTypes: ["equity", "grant"], industries: ["Healthcare"], amountMin: 200_000, amountMax: 1_500_000, stage: "Series A", website: "lumenhealth.io" },
  { id: "p_biz3", name: "CivicPay", org: "CivicPay", role: "business", location: "East Africa", verified: false, bio: "Payments rails for county governments and public services.", fundingTypes: ["equity", "loan"], industries: ["SaaS", "Civic"], amountMin: 80_000, amountMax: 600_000, stage: "Seed" },
  { id: "p_inv2", name: "Terra Capital", org: "Terra Capital", role: "investor", location: "Global", verified: true, bio: "Climate-focused fund deploying equity into regenerative agriculture.", fundingTypes: ["equity"], industries: ["Agriculture", "CleanTech"], amountMin: 250_000, amountMax: 3_000_000, equity: "8 - 20%", stage: "Growth" },
  { id: "p_donor2", name: "Open Doors Trust", org: "Open Doors Trust", role: "donor", location: "Latin America", verified: true, bio: "Donor-advised fund backing grassroots retail and market-women cooperatives.", fundingTypes: ["grant", "donation"], industries: ["Retail", "Civic"], amountMin: 3_000, amountMax: 90_000, cause: "Livelihoods", stage: "Community" },
];

const listings: Listing[] = [
  { id: "l1", ownerId: "p_bank", title: "Women-Led SME Working Capital Facility", fundingType: "loan", industry: "Retail", region: "West Africa", amountMin: 10_000, amountMax: 150_000, terms: "9-12% APR, 24mo", stage: "Growth", description: "Fast-turnaround working capital for women-owned retail and agri businesses with clean repayment history.", eligibility: ["51%+ women ownership", "12mo trading history", "Registered business"], featured: true, createdAt: ago(2) },
  { id: "l2", ownerId: "p_inv", title: "Climate & Health Seed Equity Round", fundingType: "equity", industry: "CleanTech", region: "Global", amountMin: 100_000, amountMax: 750_000, terms: "5-15% equity", stage: "Seed", description: "Pre-product to early-revenue startups tackling emissions or health access. Hands-on operator support.", eligibility: ["Scalable model", "Founding team in place", "Impact thesis"], featured: true, createdAt: ago(1) },
  { id: "l3", ownerId: "p_ngo", title: "Community Disaster Relief Micro-Grants", fundingType: "grant", industry: "Civic", region: "Global", amountMin: 2_000, amountMax: 25_000, stage: "Community", description: "Rapid-response grants for grassroots groups hit by floods, drought, or displacement.", eligibility: ["Community-embedded", "No-cost recovery plan", "Local partner letter"], featured: false, createdAt: ago(4) },
  { id: "l4", ownerId: "p_donor", title: "Girls-in-Tech Education Grants", fundingType: "grant", industry: "Education", region: "North America", amountMin: 10_000, amountMax: 100_000, stage: "Community", description: "Funding for programs putting girls from under-resourced schools into software and hardware tracks.", eligibility: ["50%+ girls enrolled", "Measurable outcomes", "Nonprofit or school"], featured: true, createdAt: ago(3) },
  { id: "l5", ownerId: "p_biz", title: "Seeking: Cold-Chain Expansion Capital", fundingType: "loan", industry: "Agriculture", region: "East Africa", amountMin: 50_000, amountMax: 500_000, stage: "Seed", description: "Agri-processing SME raising to add 3 solar cold rooms and cut post-harvest loss by 40%.", eligibility: ["Revenue-generating", "Farmer co-op partnerships"], featured: false, createdAt: ago(1) },
  { id: "l6", ownerId: "p_inv2", title: "Regenerative Agriculture Growth Equity", fundingType: "equity", industry: "Agriculture", region: "Global", amountMin: 250_000, amountMax: 1_500_000, terms: "8-18% equity", stage: "Growth", description: "Series-scale checks into farm-tech and soil-carbon ventures with proven unit economics.", eligibility: ["$250K+ ARR", "Impact metrics", "Exit path"], featured: false, createdAt: ago(6) },
  { id: "l7", ownerId: "p_ngo", title: "Rural Clinic Resilience Fund", fundingType: "donation", industry: "Healthcare", region: "South Asia", amountMin: 5_000, amountMax: 120_000, stage: "Community", description: "Donation pool restoring flood-damaged primary clinics and stocking essential medicines.", eligibility: ["Registered clinic", "Community governance"], featured: false, createdAt: ago(5) },
  { id: "l8", ownerId: "p_donor2", title: "Market-Women Livelihood Grants", fundingType: "grant", industry: "Retail", region: "Latin America", amountMin: 3_000, amountMax: 40_000, stage: "Community", description: "Small unrestricted grants helping informal market vendors recover and grow inventory.", eligibility: ["Informal or co-op", "Local endorsement"], featured: true, createdAt: ago(2) },
  { id: "l9", ownerId: "p_biz2", title: "Seeking: Series A for Lab-on-Chip", fundingType: "equity", industry: "Healthcare", region: "South Asia", amountMin: 200_000, amountMax: 1_500_000, stage: "Series A", description: "Raising to scale diagnostics to 200 clinics. Regulatory clearance secured, 60 paying sites live.", eligibility: ["Impact-aligned LPs", "Board seat"], featured: false, createdAt: ago(3) },
  { id: "l10", ownerId: "p_bank", title: "Green Equipment Financing Line", fundingType: "loan", industry: "CleanTech", region: "West Africa", amountMin: 20_000, amountMax: 250_000, terms: "10-13% APR, 36mo", stage: "Growth", description: "Asset-backed financing for solar, efficient cookstoves, and e-mobility equipment.", eligibility: ["Equipment invoice", "Trade history"], featured: false, createdAt: ago(7) },
  { id: "l11", ownerId: "p_ind", title: "Seeking: Civic Fintech Build Grant", fundingType: "grant", industry: "Civic", region: "Latin America", amountMin: 5_000, amountMax: 60_000, stage: "Pre-seed", description: "Looking for a no-dilution grant to finish an open-source savings tool for cooperatives.", eligibility: ["Open-source output", "Co-op pilot"], featured: false, createdAt: ago(1) },
  { id: "l12", ownerId: "p_donor", title: "STEM Teacher Fellowship Grants", fundingType: "grant", industry: "Education", region: "Global", amountMin: 15_000, amountMax: 300_000, stage: "Community", description: "Multi-year stipends recruiting and retaining STEM teachers in underserved districts.", eligibility: ["District partnership", "Retention tracking"], featured: false, createdAt: ago(8) },
  { id: "l13", ownerId: "p_biz3", title: "Seeking: GovTech Seed Round", fundingType: "equity", industry: "SaaS", region: "East Africa", amountMin: 80_000, amountMax: 600_000, stage: "Seed", description: "Payments rails live with 4 counties. Raising seed to expand to 20 more and grow the team.", eligibility: ["Public-sector traction"], featured: false, createdAt: ago(2) },
];

const requests: ConnectionRequest[] = [
  { id: "r1", fromProfileId: "p_biz", toProfileId: "p_bank", listingId: "l1", status: "pending", message: "We fit the women-led SME criteria and would love to discuss a working capital line.", createdAt: ago(1) },
  { id: "r2", fromProfileId: "p_inv", toProfileId: "p_biz2", listingId: "l9", status: "accepted", message: "Your lab-on-chip traction is compelling. Open to a Series A conversation.", createdAt: ago(3) },
  { id: "r3", fromProfileId: "p_donor", toProfileId: "p_ngo", status: "accepted", message: "We would like to co-fund the rural clinic resilience pool.", createdAt: ago(4) },
  { id: "r4", fromProfileId: "p_biz", toProfileId: "p_inv", listingId: "l2", status: "pending", message: "GreenHarvest is raising for cold-chain expansion. Would you take a look?", createdAt: ago(2) },
  { id: "r5", fromProfileId: "p_ind", toProfileId: "p_ngo", listingId: "l3", status: "declined", message: "Requesting relief micro-grant for a co-op pilot.", createdAt: ago(6) },
];

const threads: Thread[] = [
  { id: "t1", participantIds: ["p_inv", "p_biz2"], connectionId: "r2", subject: "Lumen Health Series A" },
  { id: "t2", participantIds: ["p_donor", "p_ngo"], connectionId: "r3", subject: "Co-funding Rural Clinics" },
];

const messages: Message[] = [
  { id: "m1", threadId: "t1", senderId: "p_inv", body: "Congrats on clearing regulatory! Can you share the latest cohort metrics?", createdAt: ago(3) },
  { id: "m2", threadId: "t1", senderId: "p_biz2", body: "Absolutely - 60 paying sites, 22% MoM growth. Pitch deck attached.", createdAt: ago(3), attachment: "Lumen_SeriesA_Deck.pdf" },
  { id: "m3", threadId: "t1", senderId: "p_inv", body: "Great. We can move to term sheets this week.", createdAt: ago(2) },
  { id: "m4", threadId: "t2", senderId: "p_donor", body: "We can match your clinic fund up to $60K. What reporting do you need?", createdAt: ago(4) },
  { id: "m5", threadId: "t2", senderId: "p_ngo", body: "Quarterly outcome reports work. Sending the template now.", createdAt: ago(4), attachment: "Reporting_Template.docx" },
];

const notifications: AppNotification[] = [
  { id: "n1", userId: "p_bank", body: "Amina Yusuf (GreenHarvest Foods) requested a connection.", read: false, createdAt: ago(1) },
  { id: "n2", userId: "p_biz", body: "Northstar Ventures viewed your need listing.", read: false, createdAt: ago(1) },
  { id: "n3", userId: "p_inv", body: "Connection with Lumen Health accepted. Messaging unlocked.", read: true, createdAt: ago(3) },
  { id: "n4", userId: "p_biz", body: "New match: Women-Led SME Working Capital Facility (94%).", read: false, createdAt: ago(2) },
  { id: "n5", userId: "p_donor", body: "Horizon Relief replied in your thread.", read: false, createdAt: ago(4) },
];

export const SEED: AppState = {
  profiles, listings, requests, threads, messages, notifications,
  bookmarks: ["l2", "l4"], activeProfileId: "p_biz", view: "landing", onboarded: true,
};

export const PERSONAS = ["p_biz", "p_ind", "p_bank", "p_ngo", "p_donor", "p_inv"];

/* ============================ PERSISTENCE ============================ */
const KEY = "equalaccess_state_v1";
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...SEED, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return SEED;
}
export function saveState(s: AppState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
export const newId = uid;
