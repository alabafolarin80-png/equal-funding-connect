import { useState } from "react";
import { Bell, ChevronDown, Landmark, Menu, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PERSONAS, ROLE_META, timeAgo, type Store, type View } from "@/data";

const NAV: { key: View; label: string }[] = [
  { key: "landing", label: "Home" },
  { key: "directory", label: "Directory" },
  { key: "dashboard", label: "Dashboard" },
  { key: "messages", label: "Messages" },
];

export default function Navbar({ store, onPost }: { store: Store; onPost: () => void }) {
  const { state, active } = store;
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = state.notifications.filter((n) => n.userId === active.id && !n.read).length;
  const go = (v: View) => { store.setView(v); setMobileOpen(false); };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button onClick={() => go("landing")} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
            <Landmark className="h-5 w-5" />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">Equal Access</span>
          <Badge className="hidden bg-emerald-50 text-emerald-700 ring-emerald-600/20 sm:inline-flex">Capital OS</Badge>
        </button>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => go(n.key)}
              className={cn("relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                state.view === n.key ? "text-emerald-700" : "text-slate-600 hover:text-slate-900")}>
              {n.label}
              {state.view === n.key && (
                <motion.span layoutId="nav-pill" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-600" />
              )}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={onPost} className="hidden gap-1.5 bg-emerald-600 hover:bg-emerald-700 sm:inline-flex">
            <Sparkles className="h-4 w-4" /> Post Opportunity
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Notifications</div>
              <div className="max-h-80 overflow-y-auto">
                {state.notifications.filter((n) => n.userId === active.id).length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">You are all caught up.</p>
                )}
                {state.notifications.filter((n) => n.userId === active.id).map((n) => (
                  <div key={n.id} className={cn("border-b border-slate-50 px-4 py-3 text-sm", !n.read && "bg-emerald-50/40")}>
                    <p className="text-slate-700">{n.body}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 hover:bg-slate-50">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-slate-900 text-xs text-white">{active.org.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">{ROLE_META[active.role].label}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs text-slate-500">Switch persona (demo)</DropdownMenuLabel>
              {PERSONAS.map((pid) => {
                const p = state.profiles.find((x) => x.id === pid);
                if (!p) return null;
                const Icon = ROLE_META[p.role].icon;
                return (
                  <DropdownMenuItem key={pid} onClick={() => store.setActiveProfile(pid)}
                    className={cn("gap-2", pid === active.id && "bg-emerald-50")}>
                    <Icon className={cn("h-4 w-4", ROLE_META[p.role].accent)} />
                    <span className="flex-1 truncate">{p.org}</span>
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">{ROLE_META[p.role].side}</span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={store.resetDemo} className="text-rose-600 focus:text-rose-600">Reset demo data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden">
            <div className="space-y-1 px-4 py-3">
              {NAV.map((n) => (
                <button key={n.key} onClick={() => go(n.key)}
                  className={cn("block w-full rounded-lg px-3 py-2 text-left text-sm font-medium",
                    state.view === n.key ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50")}>
                  {n.label}
                </button>
              ))}
              <Button size="sm" onClick={() => { onPost(); setMobileOpen(false); }} className="mt-2 w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                <Sparkles className="h-4 w-4" /> Post Opportunity
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
