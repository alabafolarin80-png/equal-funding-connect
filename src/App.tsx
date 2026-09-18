import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import LandingPage from "@/components/LandingPage";
import Directory from "@/components/Directory";
import Dashboard, { PostOpportunityDialog } from "@/components/Dashboard";
import MessageCenter from "@/components/MessageCenter";
import OnboardingModal from "@/components/OnboardingModal";
import {
  SEED, loadState, saveState, newId,
  type AppState, type OnboardingData, type Store, type View, type Listing,
} from "@/data";

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const active = useMemo(
    () => state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0],
    [state.profiles, state.activeProfileId]
  );

  const setView = useCallback((view: View) => setState((s) => ({ ...s, view })), []);
  const setActiveProfile = useCallback((id: string) => setState((s) => ({ ...s, activeProfileId: id })), []);
  const toggleBookmark = useCallback((id: string) =>
    setState((s) => ({ ...s, bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id] })), []);

  const addListing = useCallback((l: Omit<Listing, "id" | "createdAt">) =>
    setState((s) => ({ ...s, listings: [{ ...l, id: newId("l"), createdAt: new Date().toISOString() }, ...s.listings] })), []);

  const sendRequest = useCallback((toProfileId: string, listingId: string | undefined, message: string) => {
    setState((s) => {
      const id = newId("r");
      const to = s.profiles.find((p) => p.id === toProfileId);
      return {
        ...s,
        requests: [{ id, fromProfileId: s.activeProfileId, toProfileId, listingId, status: "pending", message, createdAt: new Date().toISOString() }, ...s.requests],
        notifications: [{ id: newId("n"), userId: toProfileId, body: `${active.org} requested a connection.`, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
      };
    });
    void toProfileId; void listingId;
  }, [active.org]);

  const respondRequest = useCallback((id: string, status: "accepted" | "declined") => {
    setState((s) => {
      const req = s.requests.find((r) => r.id === id);
      if (!req) return s;
      const requests = s.requests.map((r) => (r.id === id ? { ...r, status } : r));
      let threads = s.threads;
      let notifications = s.notifications;
      if (status === "accepted" && !s.threads.some((t) => t.connectionId === id)) {
        const listing = req.listingId ? s.listings.find((l) => l.id === req.listingId) : null;
        const subject = listing ? listing.title : "New connection";
        threads = [{ id: newId("t"), participantIds: [req.fromProfileId, req.toProfileId], connectionId: id, subject }, ...s.threads];
        notifications = [
          { id: newId("n"), userId: req.fromProfileId, body: `Connection accepted. Messaging unlocked.`, read: false, createdAt: new Date().toISOString() },
          ...s.notifications,
        ];
      }
      return { ...s, requests, threads, notifications };
    });
  }, []);

  const sendMessage = useCallback((threadId: string, body: string, attachment?: string) => {
    setState((s) => {
      const thread = s.threads.find((t) => t.id === threadId);
      const recipient = thread?.participantIds.find((id) => id !== s.activeProfileId);
      const messages = [...s.messages, { id: newId("m"), threadId, senderId: s.activeProfileId, body, createdAt: new Date().toISOString(), attachment }];
      const notifications = recipient
        ? [{ id: newId("n"), userId: recipient, body: `${active.org} sent you a message.`, read: false, createdAt: new Date().toISOString() }, ...s.notifications]
        : s.notifications;
      return { ...s, messages, notifications };
    });
  }, [active.org]);

  const completeOnboarding = useCallback((d: OnboardingData) => {
    setState((s) => {
      const id = newId("p");
      const profile = {
        id, name: d.name || d.org, org: d.org, role: d.role, location: d.location, verified: false,
        bio: d.bio, website: d.website || undefined, fundingTypes: d.fundingTypes, industries: d.industries,
        amountMin: d.amountMin, amountMax: d.amountMax, apr: d.apr || undefined, equity: d.equity || undefined,
        stage: d.stage, collateral: d.collateral || undefined, cause: d.cause || undefined,
      };
      return { ...s, profiles: [...s.profiles, profile], activeProfileId: id, onboarded: true, view: "dashboard" };
    });
  }, []);

  const markNotificationsRead = useCallback(() =>
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.userId === s.activeProfileId ? { ...n, read: true } : n)) })), []);

  const resetDemo = useCallback(() => { setState({ ...SEED }); toast("Demo data reset."); }, []);

  const store: Store = {
    state, active, setView, setActiveProfile, toggleBookmark, addListing, sendRequest,
    respondRequest, sendMessage, completeOnboarding, markNotificationsRead, resetDemo,
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar store={store} onPost={() => setPostOpen(true)} />
      <main>
        {state.view === "landing" && <LandingPage store={store} onOnboard={() => setOnboardOpen(true)} />}
        {state.view === "directory" && <Directory store={store} />}
        {state.view === "dashboard" && <Dashboard store={store} onPost={() => setPostOpen(true)} />}
        {state.view === "messages" && <MessageCenter store={store} />}
      </main>
      <OnboardingModal open={onboardOpen} onClose={() => setOnboardOpen(false)} store={store} />
      <PostOpportunityDialog open={postOpen} onClose={() => setPostOpen(false)} store={store} />
    </div>
  );
}
