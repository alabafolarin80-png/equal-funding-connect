import { useEffect, useMemo, useRef, useState } from "react";
import { Lock, Paperclip, Search, Send, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_META, timeAgo, type Store, type Thread } from "@/data";

export default function MessageCenter({ store }: { store: Store }) {
  const { active } = store;
  const myThreads = useMemo(
    () => store.state.threads.filter((t) => t.participantIds.includes(active.id)),
    [store.state.threads, active.id]
  );
  const [selected, setSelected] = useState<string | null>(myThreads[0]?.id ?? null);
  const [q, setQ] = useState("");
  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const thread = myThreads.find((t) => t.id === selected) ?? null;
  const other = thread ? store.state.profiles.find((p) => p.id === thread.participantIds.find((id) => id !== active.id)) : null;
  const msgs = useMemo(
    () => store.state.messages.filter((m) => m.threadId === selected).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [store.state.messages, selected]
  );

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs.length, selected]);

  const filtered = myThreads.filter((t) => {
    const o = store.state.profiles.find((p) => p.id === t.participantIds.find((id) => id !== active.id));
    return !q || (o?.org ?? "").toLowerCase().includes(q.toLowerCase()) || t.subject.toLowerCase().includes(q.toLowerCase());
  });

  const send = () => {
    if (!thread || body.trim().length === 0) return;
    store.sendMessage(thread.id, body.trim());
    setBody("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Secure Messages</h1>
        <Badge className="gap-1 bg-emerald-50 text-emerald-700 ring-emerald-600/20"><ShieldCheck className="h-3.5 w-3.5" /> Connection-gated</Badge>
      </div>
      <p className="mb-5 max-w-[70ch] text-sm text-slate-500">Threads open only after a mutual connection is accepted. Your conversations stay on-platform and private.</p>

      <div className="grid h-[68vh] grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        {/* Thread list */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="pl-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No conversations yet. Accept a connection request to start messaging.</p>}
            {filtered.map((t) => <ThreadRow key={t.id} store={store} thread={t} activeId={active.id} selected={t.id === selected} onClick={() => setSelected(t.id)} />)}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {!thread || !other ? (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <Lock className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-700">Select a conversation</p>
                <p className="mt-1 text-sm text-slate-500">Or request a connection from the Directory to unlock secure messaging.</p>
                <Button onClick={() => store.setView("directory")} className="mt-4 bg-emerald-600 hover:bg-emerald-700">Browse Directory</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-slate-900 text-white">{other.org.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{other.org}</p>
                  <p className="truncate text-xs text-slate-500">{thread.subject}</p>
                </div>
                <Badge variant="secondary" className={cn("ml-auto", ROLE_META[other.role].accent)}>{ROLE_META[other.role].label}</Badge>
              </div>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/50 p-4">
                {msgs.map((m) => {
                  const mine = m.senderId === active.id;
                  return (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm", mine ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-800")}>
                        <p className="leading-relaxed">{m.body}</p>
                        {m.attachment && (
                          <div className={cn("mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs", mine ? "bg-emerald-700/60" : "bg-slate-100")}>
                            <Paperclip className="h-3 w-3" /> {m.attachment}
                          </div>
                        )}
                        <p className={cn("mt-1 text-[10px]", mine ? "text-emerald-100" : "text-slate-400")}>{timeAgo(m.createdAt)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 p-3">
                <Input value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} placeholder="Write a secure message..." />
                <Button onClick={send} disabled={!body.trim()} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"><Send className="h-4 w-4" /> Send</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadRow({ store, thread, activeId, selected, onClick }: { store: Store; thread: Thread; activeId: string; selected: boolean; onClick: () => void }) {
  const other = store.state.profiles.find((p) => p.id === thread.participantIds.find((id) => id !== activeId));
  const last = store.state.messages.filter((m) => m.threadId === thread.id).slice(-1)[0];
  if (!other) return null;
  return (
    <button onClick={onClick} className={cn("flex w-full items-center gap-3 border-b border-slate-50 p-3 text-left transition-colors hover:bg-slate-50", selected && "bg-emerald-50/60 hover:bg-emerald-50/60")}>
      <Avatar className="h-9 w-9"><AvatarFallback className="bg-slate-900 text-white">{other.org.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-900">{other.org}</p>{last && <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(last.createdAt)}</span>}</div>
        <p className="truncate text-xs text-slate-500">{last ? last.body : thread.subject}</p>
      </div>
    </button>
  );
}
