import { useMemo, useState } from "react";
import {
  ArrowRight, Check, Inbox, LayoutDashboard, PlusCircle, Sparkles, Star, TrendingUp, Users, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FUNDING_META, INDUSTRIES, REGIONS, ROLE_META, STAGES, fmtRange, timeAgo,
  type FundingType, type Listing, type Profile, type Store,
} from "@/data";
import { ListingCard, RequestConnectionDialog } from "@/components/Directory";

function matchScore(l: Listing, p: Profile): number {
  let s = 40;
  if (p.fundingTypes.includes(l.fundingType)) s += 15; else s -= 15;
  if (p.industries.length === 0 || p.industries.includes(l.industry)) s += 20; else s -= 10;
  if (l.region === p.location || l.region === "Global" || p.location === "Global") s += 15;
  const overlap = l.amountMin <= p.amountMax && l.amountMax >= p.amountMin;
  if (overlap) s += 10;
  return Math.max(5, Math.min(99, s));
}

export default function Dashboard({ store, onPost }: { store: Store; onPost: () => void }) {
  const { active } = store;
  const meta = ROLE_META[active.role];
  const Icon = meta.icon;

  const incoming = store.state.requests.filter((r) => r.toProfileId === active.id && r.status === "pending");
  const outgoing = store.state.requests.filter((r) => r.fromProfileId === active.id);
  const myListings = store.state.listings.filter((l) => l.ownerId === active.id);

  const matches = useMemo(() => {
    return store.state.listings
      .filter((l) => l.ownerId !== active.id)
      .map((l) => ({ l, score: matchScore(l, active) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [store.state.listings, active]);

  const [reqListing, setReqListing] = useState<Listing | null>(null);

  const stats = [
    { label: "Match score avg", value: `${Math.round(matches.reduce((a, m) => a + m.score, 0) / (matches.length || 1))}%`, icon: TrendingUp },
    { label: "Pending requests", value: String(incoming.length), icon: Inbox },
    { label: "My listings", value: String(myListings.length), icon: LayoutDashboard },
    { label: "Saved", value: String(store.state.bookmarks.length), icon: Star },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("grid h-12 w-12 place-items-center rounded-xl bg-emerald-600 text-white")}><Icon className="h-6 w-6" /></span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{active.org}</h1>
            <p className="text-sm text-slate-500">{meta.label} dashboard · {active.location}</p>
          </div>
        </div>
        <Button onClick={onPost} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><PlusCircle className="h-4 w-4" /> Post {meta.side === "provider" ? "Opportunity" : "Need"}</Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => { const Ic = s.icon; return (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600"><Ic className="h-5 w-5" /></span>
              <div><div className="text-xl font-bold text-slate-900">{s.value}</div><div className="text-xs text-slate-500">{s.label}</div></div>
            </CardContent>
          </Card>
        ); })}
      </div>

      <Tabs defaultValue="matches" className="mt-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="matches" className="gap-1.5"><Sparkles className="h-4 w-4" /> Matches</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5"><Users className="h-4 w-4" /> Requests{incoming.length > 0 && <Badge className="ml-1 bg-rose-500 text-white">{incoming.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map(({ l, score }) => (
              <div key={l.id} className="relative">
                <div className="absolute -right-1 -top-1 z-10">
                  <Badge className={cn("gap-1 shadow", score >= 75 ? "bg-emerald-600 text-white" : score >= 55 ? "bg-sky-600 text-white" : "bg-slate-500 text-white")}>
                    <TrendingUp className="h-3 w-3" /> {score}%
                  </Badge>
                </div>
                <ListingCard store={store} listing={l} onRequest={setReqListing} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Inbox className="h-4 w-4" /> Incoming requests</h2>
              <div className="mt-3 space-y-3">
                {incoming.length === 0 && <EmptyRow text="No pending connection requests." />}
                {incoming.map((r) => {
                  const from = store.state.profiles.find((p) => p.id === r.fromProfileId);
                  const listing = r.listingId ? store.state.listings.find((l) => l.id === r.listingId) : null;
                  return (
                    <Card key={r.id} className="border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{from?.org}</span>
                          <span className="text-[11px] text-slate-400">{timeAgo(r.createdAt)}</span>
                        </div>
                        {from && <p className="text-xs text-slate-500">{ROLE_META[from.role].label} · {from.location}</p>}
                        {listing && <p className="mt-2 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">Re: {listing.title}</p>}
                        <p className="mt-2 text-sm text-slate-600">{r.message}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => { store.respondRequest(r.id, "accepted"); toast.success("Connection accepted. Messaging unlocked."); }} className="gap-1 bg-emerald-600 hover:bg-emerald-700"><Check className="h-4 w-4" /> Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => { store.respondRequest(r.id, "declined"); toast("Request declined."); }} className="gap-1"><X className="h-4 w-4" /> Decline</Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ArrowRight className="h-4 w-4" /> Sent by you</h2>
              <div className="mt-3 space-y-3">
                {outgoing.length === 0 && <EmptyRow text="You have not requested any connections yet." />}
                {outgoing.map((r) => {
                  const to = store.state.profiles.find((p) => p.id === r.toProfileId);
                  return (
                    <Card key={r.id} className="border-slate-200">
                      <CardContent className="flex items-center justify-between p-4">
                        <div><span className="font-semibold text-slate-900">{to?.org}</span><p className="text-xs text-slate-500">{timeAgo(r.createdAt)}</p></div>
                        <ReqBadge status={r.status} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Listings you control</h2>
            <Button size="sm" variant="outline" onClick={onPost} className="gap-1.5"><PlusCircle className="h-4 w-4" /> New listing</Button>
          </div>
          <div className="mt-3 space-y-3">
            {myListings.length === 0 && <EmptyRow text="You have no active listings. Post one to get discovered." />}
            {myListings.map((l) => { const fm = FUNDING_META[l.fundingType]; return (
              <Card key={l.id} className="border-slate-200">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2"><Badge className={cn("ring-1", fm.badge)}>{fm.label}</Badge><span className="font-semibold text-slate-900">{l.title}</span></div>
                    <p className="mt-1 text-xs text-slate-500">{fmtRange(l.amountMin, l.amountMax)} · {l.region} · {timeAgo(l.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Active</span>
                </CardContent>
              </Card>
            ); })}
          </div>
        </TabsContent>
      </Tabs>

      <RequestConnectionDialog store={store} listing={reqListing} targetId={reqListing?.ownerId ?? null} onClose={() => setReqListing(null)} />
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{text}</div>;
}
function ReqBadge({ status }: { status: "pending" | "accepted" | "declined" }) {
  const map = { pending: "bg-amber-50 text-amber-700", accepted: "bg-emerald-50 text-emerald-700", declined: "bg-rose-50 text-rose-700" };
  return <Badge className={cn("capitalize ring-1", map[status])}>{status}</Badge>;
}

/* ---------- Post Opportunity / Need dialog (exported for App) ---------- */
export function PostOpportunityDialog({ open, onClose, store }: { open: boolean; onClose: () => void; store: Store }) {
  const active = store.active;
  const isProvider = ROLE_META[active.role].side === "provider";
  const [form, setForm] = useState({
    title: "", fundingType: (active.fundingTypes[0] ?? "grant") as FundingType, industry: active.industries[0] ?? INDUSTRIES[0],
    region: active.location === "Global" ? "Global" : (REGIONS.find((r) => r === active.location) ?? REGIONS[0]),
    amountMin: active.amountMin, amountMax: active.amountMax, terms: "", stage: active.stage ?? STAGES[0], description: "", eligibility: "",
  });
  const upd = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (form.title.trim().length < 5) { toast.error("Add a clear title (5+ characters)."); return; }
    if (form.description.trim().length < 15) { toast.error("Add a short description (15+ characters)."); return; }
    store.addListing({
      ownerId: active.id, title: form.title.trim(), fundingType: form.fundingType, industry: form.industry,
      region: form.region, amountMin: Number(form.amountMin), amountMax: Number(form.amountMax),
      terms: form.terms.trim() || undefined, stage: form.stage, description: form.description.trim(),
      eligibility: form.eligibility.split(",").map((s) => s.trim()).filter(Boolean), featured: false,
    });
    toast.success("Listing published to the directory.");
    setForm((f) => ({ ...f, title: "", description: "", eligibility: "", terms: "" }));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isProvider ? "Post an opportunity" : "Post a funding need"}</DialogTitle>
          <DialogDescription>Publish to the directory so matched {isProvider ? "seekers" : "providers"} can request a connection.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder={isProvider ? "e.g. Women-Led SME Working Capital Facility" : "e.g. Seeking: Cold-Chain Expansion Capital"} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Funding type</Label>
              <Select value={form.fundingType} onValueChange={(v) => upd("fundingType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(FUNDING_META) as FundingType[]).map((f) => <SelectItem key={f} value={f}>{FUNDING_META[f].label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => upd("stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Sector</Label>
              <Select value={form.industry} onValueChange={(v) => upd("industry", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Region</Label>
              <Select value={form.region} onValueChange={(v) => upd("region", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Amount min (USD)</Label><Input type="number" value={form.amountMin} onChange={(e) => upd("amountMin", +e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Amount max (USD)</Label><Input type="number" value={form.amountMax} onChange={(e) => upd("amountMax", +e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Terms (optional)</Label><Input value={form.terms} onChange={(e) => upd("terms", e.target.value)} placeholder="e.g. 9-12% APR, 24mo · 5-15% equity" /></div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => upd("description", e.target.value)} placeholder="What is this and who is it for?" /></div>
          <div className="space-y-1.5"><Label>Eligibility (comma-separated)</Label><Textarea rows={2} value={form.eligibility} onChange={(e) => upd("eligibility", e.target.value)} placeholder="e.g. 51%+ women ownership, 12mo trading history" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><PlusCircle className="h-4 w-4" /> Publish listing</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}