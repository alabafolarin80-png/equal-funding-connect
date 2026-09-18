import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FUNDING_META, INDUSTRIES, ROLE_META, STAGES,
  type FundingType, type OnboardingData, type Store, type UserRole,
} from "@/data";

const ROLES: UserRole[] = ["business", "individual", "bank", "ngo", "donor", "investor"];
const FUNDINGS: FundingType[] = ["grant", "loan", "equity", "donation"];
const STEPS = ["Choose your role", "Tailored criteria", "Finish profile"];

const empty: OnboardingData = {
  role: "business", name: "", org: "", location: "East Africa", bio: "", website: "",
  fundingTypes: [], industries: [], amountMin: 10000, amountMax: 250000,
  apr: "", equity: "", stage: "Seed", collateral: "", cause: "",
};

export default function OnboardingModal({ open, onClose, store }: { open: boolean; onClose: () => void; store: Store }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<OnboardingData>(empty);
  function set<K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) { setD((p) => ({ ...p, [k]: v })); }
  const meta = ROLE_META[d.role];
  const isProvider = meta.side === "provider";

  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    if (!d.org.trim()) { toast.error("Organization name is required"); return; }
    store.completeOnboarding(d);
    toast.success(`Welcome aboard, ${d.org}! Your ${meta.label} dashboard is ready.`);
    setStep(0); setD(empty); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-4 text-left">
          <DialogTitle className="text-base font-bold text-slate-900">Smart Onboarding</DialogTitle>
          <div className="mt-3 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                  i <= step ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400")}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={cn("hidden text-xs font-medium sm:inline", i <= step ? "text-slate-900" : "text-slate-400")}>{s}</span>
                {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < step ? "bg-emerald-500" : "bg-slate-200")} />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}>

              {step === 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {ROLES.map((r) => {
                    const m = ROLE_META[r]; const Icon = m.icon; const sel = d.role === r;
                    return (
                      <button key={r} onClick={() => set("role", r)}
                        className={cn("group flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                          sel ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/30" : "border-slate-200 bg-white hover:border-slate-300")}>
                        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", sel ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600")}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{m.label}</span>
                          <span className="block text-xs text-slate-500">{m.blurb}</span>
                          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">{m.side}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <Field label="What are you offering or seeking?">
                    <div className="flex flex-wrap gap-2">
                      {FUNDINGS.map((f) => {
                        const m = FUNDING_META[f]; const Icon = m.icon; const sel = d.fundingTypes.includes(f);
                        return (
                          <button key={f} onClick={() => set("fundingTypes", toggle(d.fundingTypes, f))}
                            className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                              sel ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
                            <Icon className="h-4 w-4" /> {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="Focus sectors">
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map((ind) => { const sel = d.industries.includes(ind);
                        return (
                          <button key={ind} onClick={() => set("industries", toggle(d.industries, ind))}
                            className={cn("rounded-full border px-3 py-1 text-sm transition-colors",
                              sel ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{ind}</button>
                        );
                      })}
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label={isProvider ? "Minimum ticket" : "Minimum needed"}>
                      <Input type="number" value={d.amountMin} onChange={(e) => set("amountMin", +e.target.value)} />
                    </Field>
                    <Field label={isProvider ? "Maximum ticket" : "Maximum needed"}>
                      <Input type="number" value={d.amountMax} onChange={(e) => set("amountMax", +e.target.value)} />
                    </Field>
                  </div>

                  {d.role === "bank" && (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="APR range"><Input placeholder="e.g. 9 - 14%" value={d.apr} onChange={(e) => set("apr", e.target.value)} /></Field>
                      <Field label="Collateral"><Input placeholder="e.g. Partial" value={d.collateral} onChange={(e) => set("collateral", e.target.value)} /></Field>
                    </div>
                  )}
                  {d.role === "investor" && (
                    <Field label="Target equity stake"><Input placeholder="e.g. 5 - 15%" value={d.equity} onChange={(e) => set("equity", e.target.value)} /></Field>
                  )}
                  {(d.role === "ngo" || d.role === "donor") && (
                    <Field label="Cause area"><Input placeholder="e.g. Education equity" value={d.cause} onChange={(e) => set("cause", e.target.value)} /></Field>
                  )}
                  <Field label="Stage focus">
                    <div className="flex flex-wrap gap-2">
                      {STAGES.map((s) => { const sel = d.stage === s;
                                                 return <button key={s} onClick={() => set("stage", s)} className={cn("rounded-lg border px-3 py-1.5 text-sm", sel ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>{s}</button>; })}
                    </div>
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Contact name"><Input value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" /></Field>
                    <Field label="Organization"><Input value={d.org} onChange={(e) => set("org", e.target.value)} placeholder="Acme Ltd" /></Field>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Region"><Input value={d.location} onChange={(e) => set("location", e.target.value)} /></Field>
                    <Field label="Website"><Input value={d.website} onChange={(e) => set("website", e.target.value)} placeholder="acme.co" /></Field>
                  </div>
                  <Field label="Short bio / mission"><Textarea rows={3} value={d.bio} onChange={(e) => set("bio", e.target.value)} placeholder="One or two sentences about who you are and what you fund or need." /></Field>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={next} className="gap-1 bg-emerald-600 hover:bg-emerald-700">Continue <ChevronRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={finish} className="gap-1 bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4" /> Activate {meta.label} profile</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</Label>
      {children}
    </div>
  );
}