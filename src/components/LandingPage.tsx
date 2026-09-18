import { useEffect, useState } from "react";
import {
  ArrowRight, BadgeCheck, Globe2, Quote, ShieldCheck, Sparkles, TrendingUp, Wallet,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FUNDING_META, ROLE_META, fmtRange, type Store, type UserRole } from "@/data";

const HERO_IMG = "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/d6b256ed-f733-45ee-b4bc-5a95d654e90f/hero-capital-f5a7f88e-1789722712319.webp";
const IMPACT_IMG = "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/generated-images/d6b256ed-f733-45ee-b4bc-5a95d654e90f/impact-community-5cebb713-1789722713100.webp";

const ROLES: UserRole[] = ["business", "individual", "bank", "ngo", "donor", "investor"];

const STATS = [
  { v: "$142M+", l: "Capital Matched", icon: Wallet },
  { v: "4,800+", l: "Verified Projects", icon: BadgeCheck },
  { v: "62", l: "Countries Reached", icon: Globe2 },
  { v: "0%", l: "Gatekeeping Fees", icon: ShieldCheck },
];

const VALUES = [
  { t: "Equal opportunity by design", d: "Every listing publishes transparent criteria. No hidden networks, no gatekeepers deciding who gets funded.", icon: ShieldCheck },
  { t: "Transparent match criteria", d: "See ticket size, APR, equity stake, and eligibility before you ever connect. Match scores are computed, not negotiated.", icon: TrendingUp },
  { t: "Non-predatory direct lines", d: "Connect straight to the decision-maker. Messaging unlocks only after a mutual accepted connection.", icon: Sparkles },
];

export default function LandingPage({ store, onOnboard }: { store: Store; onOnboard: (r?: UserRole) => void }) {
  const reduce = useReducedMotion();
  const featured = store.state.listings.filter((l) => l.featured).slice(0, 4);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <Badge className="gap-1 bg-emerald-50 text-emerald-700 ring-emerald-600/20">
              <Sparkles className="h-3.5 w-3.5" /> The equal-opportunity capital network
            </Badge>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tighter text-slate-900 sm:text-5xl lg:text-6xl">
              Capital should find <span className="text-emerald-600">every</span> worthy idea.
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-slate-600">
              Equal Access routes businesses, NGOs, banks, donors, investors, and individuals into tailored dashboards to search listings, request connections, and talk securely.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => onOnboard()} className="gap-2 bg-emerald-600 text-base hover:bg-emerald-700">
                Get started free <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => store.setView("directory")} className="text-base">
                Browse the directory
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-bold tracking-tight text-slate-900">{s.v}</div>
                  <div className="text-xs font-medium text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <motion.div initial={reduce ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative">
            <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10">
              <img src={HERO_IMG} alt="Network of capital flowing between people and opportunities" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:block">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Match found</div>
              <p className="mt-1 text-xs text-slate-500">GreenHarvest Foods ↔ Meridian Microbank · 94%</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALUE BENTO */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="max-w-[20ch] text-3xl font-bold tracking-tight text-slate-900">A fairer way to fund and be funded.</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div key={v.t} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                  className={cn("rounded-2xl border border-slate-200 bg-white p-6", i === 0 && "lg:col-span-1")}>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-600 text-white"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{v.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.d}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROLE ENTRY MATRIX */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Choose your path</h2>
            <p className="mx-auto mt-2 max-w-[48ch] text-slate-600">Six roles, each with a purpose-built onboarding and dashboard. Pick yours to start in seconds.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r, i) => {
              const m = ROLE_META[r]; const Icon = m.icon;
              return (
                <motion.button key={r} onClick={() => onOnboard(r)} initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
                  className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-600/5">
                  <div className="flex w-full items-center justify-between">
                    <span className={cn("grid h-12 w-12 place-items-center rounded-xl bg-slate-100 transition-colors group-hover:bg-emerald-600 group-hover:text-white", m.accent)}><Icon className="h-6 w-6" /></span>
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{m.side}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{m.label}</h3>
                  <p className="mt-1 flex-1 text-sm text-slate-600">{m.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Enter as {m.label.replace(/s$/, "")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured opportunities</h2>
              <p className="mt-2 text-slate-600">Live listings from verified capital providers and seekers.</p>
            </div>
            <Button variant="outline" onClick={() => store.setView("directory")} className="hidden gap-1 sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((l) => {
              const fm = FUNDING_META[l.fundingType]; const Icon = fm.icon;
              const owner = store.state.profiles.find((p) => p.id === l.ownerId);
              return (
                <button key={l.id} onClick={() => store.setView("directory")}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg">
                  <Badge className={cn("w-fit gap-1 ring-1", fm.badge)}><Icon className="h-3.5 w-3.5" /> {fm.label}</Badge>
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">{l.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{owner?.org}</p>
                  <div className="mt-auto pt-4 text-sm font-bold text-emerald-700">{fmtRange(l.amountMin, l.amountMax)}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* IMPACT / CTA */}
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-xl">
            <img src={IMPACT_IMG} alt="Entrepreneurs and community members collaborating" className="h-full w-full object-cover" />
          </div>
          <div>
            <Quote className="h-9 w-9 text-emerald-600" />
            <blockquote className="mt-4 text-2xl font-medium leading-snug tracking-tight text-slate-900">
              "We raised our cold-chain round in nine days. For the first time the criteria were on the page, not behind a handshake."
            </blockquote>
            <p className="mt-4 text-sm font-semibold text-slate-700">Amina Yusuf · GreenHarvest Foods</p>
            <div className="mt-8 rounded-2xl bg-slate-900 p-6 text-white">
              <h3 className="text-lg font-semibold">Ready to close the gap?</h3>
              <p className="mt-1 text-sm text-slate-300">Join the ecosystem where funding access is an equal right.</p>
              <Button onClick={() => onOnboard()} className="mt-4 gap-2 bg-emerald-500 text-white hover:bg-emerald-400">
                Create your profile <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Footer() {
  const [year] = useState(() => new Date().getFullYear());
  useEffect(() => {}, []);
  return (
    <footer className="border-t border-slate-100 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white"><Wallet className="h-4 w-4" /></span>
          <span className="font-bold text-slate-900">Equal Access</span>
        </div>
        <p className="text-sm text-slate-500">© {year} Equal Opportunity Capital · Funding access for everyone.</p>
      </div>
    </footer>
  );
}
