import { useMemo, useState } from "react";
import { Bookmark, Filter, MapPin, Search, Send, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FUNDING_META, INDUSTRIES, REGIONS, ROLE_META, fmtRange, timeAgo,
  type FundingType, type Listing, type Store,
} from "@/data";

/* ---------- Shared listing card ---------- */
export function ListingCard({ store, listing, onRequest }: { store: Store; listing: Listing; onRequest: (l: Listing) => void }) {
  const fm = FUNDING_META[listing.fundingType];
  const Icon = fm.icon;
  const owner = store.state.profiles.find((p) => p.id === listing.ownerId);
  const saved = store.state.bookmarks.includes(listing.id);
  const isMine = listing.ownerId === store.active.id;
  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25, ease: "easeOut" }}>
      <Card className="flex h-full flex-col overflow-hidden border-slate-200 transition-shadow hover:shadow-lg">
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <Badge className={cn("gap-1 ring-1", fm.badge)}><Icon className="h-3.5 w-3.5" /> {fm.label}</Badge>
            <button onClick={() => { store.toggleBookmark(listing.id); toast.success(saved ? "Removed from saved" : "Saved to your list"); }}
              className={cn("rounded-lg p-1.5 transition-colors", saved ? "text-emerald-600" : "text-slate-300 hover:text-slate-500")}>
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </button>
          </div>
          <h3 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">{listing.title}</h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            {owner && <span className={cn("font-medium", ROLE_META[owner.role].accent)}>{owner.org}</span>}
            {owner?.verified && <span className="text-emerald-600">· Verified</span>}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{listing.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{listing.industry}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"><MapPin className="h-3 w-3" /> {listing.region}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{listing.stage}</span>
          </div>
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-emerald-700">{fmtRange(listing.amountMin, listing.amountMax)}</span>
              <span className="text-[11px] text-slate-400">{timeAgo(listing.createdAt)}</span>
            </div>
            {listing.terms && <p className="text-[11px] text-slate-500">{listing.terms}</p>}
            {isMine ? (
              <Button disabled variant="outline" className="mt-3 w-full text-xs">Your listing</Button>
            ) : (
              <Button onClick={() => onRequest(listing)} className="mt-3 w-full gap-1.5 bg-emerald-600 text-sm hover:bg-emerald-700">
                <Send className="h-4 w-4" /> Request Connection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ---------- Shared request dialog ---------- */
export function RequestConnectionDialog({ store, listing, targetId, onClose }: { store: Store; listing: Listing | null; targetId: string | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const target = store.state.profiles.find((p) => p.id === targetId);
  const open = !!target;
  const submit = () => {
    if (!target) return;
    if (msg.trim().length < 10) { toast.error("Please write a short message (10+ characters)."); return; }
    store.sendRequest(target.id, listing?.id, msg.trim());
    toast.success(`Connection request sent to ${target.org}.`);
    setMsg(""); onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a connection</DialogTitle>
          <DialogDescription>
            {target ? <>Introduce yourself to {target.org}. Messaging unlocks once they accept.</> : ""}
          </DialogDescription>
        </DialogHeader>
        {listing && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Regarding</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">{listing.title}</p>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="req-msg">Your message</Label>
          <Textarea id="req-msg" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)}
            placeholder="Share who you are, your fit for the criteria, and what you hope to discuss." />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Send className="h-4 w-4" /> Send request</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Directory page ---------- */
export default function Directory({ store }: { store: Store }) {
  const [q, setQ] = useState("");
  const [funding, setFunding] = useState<FundingType | "all">("all");
  const [industry, setIndustry] = useState("all");
  const [region, setRegion] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [reqListing, setReqListing] = useState<Listing | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.state.listings
      .filter((l) => l.ownerId !== store.active.id)
      .filter((l) => funding === "all" || l.fundingType === funding)
      .filter((l) => industry === "all" || l.industry === industry)
      .filter((l) => region === "all" || l.region === region)
      .filter((l) => !term || (l.title + l.description + l.industry).toLowerCase().includes(term))
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [store.state.listings, store.active.id, q, funding, industry, region]);

  const clear = () => { setQ(""); setFunding("all"); setIndustry("all"); setRegion("all"); };
  const activeFilters = [funding !== "all", industry !== "all", region !== "all", q !== ""].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Opportunity Directory</h1>
          <p className="mt-1 text-sm text-slate-600">{results.length} live listings matched to your {ROLE_META[store.active.role].label.toLowerCase()} criteria.</p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)} className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilters > 0 && <Badge className="bg-emerald-600">{activeFilters}</Badge>}
        </Button>
      </div>

      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search opportunities, needs, sectors..." className="pl-9" />
        {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="mt-4 border-slate-200">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
                <FilterSelect label="Funding type" value={funding} onChange={(v) => setFunding(v as FundingType | "all")}
                  options={[["all", "All types"], ["grant", "Grant"], ["loan", "Loan"], ["equity", "Equity"], ["donation", "Donation"]]} />
                <FilterSelect label="Sector" value={industry} onChange={setIndustry} options={[["all", "All sectors"], ...INDUSTRIES.map((i) => [i, i] as [string, string])]} />
                <FilterSelect label="Region" value={region} onChange={setRegion} options={[["all", "All regions"], ...REGIONS.map((r) => [r, r] as [string, string])]} />
                <div className="sm:col-span-3 flex items-center gap-2 text-xs text-slate-500">
                  <Filter className="h-3.5 w-3.5" />
                  {activeFilters > 0 ? <button onClick={clear} className="font-medium text-emerald-700 hover:underline">Clear all filters</button> : <span>Tip: combine filters to narrow matches.</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Separator className="my-6" />

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">No listings match those filters</p>
          <p className="mt-1 text-sm text-slate-500">Try clearing filters or broadening your search.</p>
          <Button variant="outline" onClick={clear} className="mt-4">Reset filters</Button>
        </div>
      ) : (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => <ListingCard key={l.id} store={store} listing={l} onRequest={setReqListing} />)}
        </motion.div>
      )}

      <RequestConnectionDialog store={store} listing={reqListing} targetId={reqListing?.ownerId ?? null} onClose={() => setReqListing(null)} />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(([v, lbl]) => <SelectItem key={v} value={v}>{lbl}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
