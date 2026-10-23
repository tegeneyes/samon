import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TRACKS, type Track } from "./tracks";

interface Ctx {
  current: Track | null;
  select: (id: string) => void;
  next: () => void;
  prev: () => void;
  favorites: string[];
  toggleFav: (id: string) => void;
  detail: Track | null;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  embed: Track | null;
  openEmbed: (id: string) => void;
  closeEmbed: () => void;
}
const PlayerCtx = createContext<Ctx | null>(null);
const KEY = "samon-favorites";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [idx, setIdx] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [detail, setDetail] = useState<Track | null>(null);
  const [embed, setEmbed] = useState<Track | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavorites((f) => {
      const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
      return n;
    });
  }, []);

  const select = useCallback((id: string) => setIdx(TRACKS.findIndex((t) => t.id === id)), []);
  const next = useCallback(() => setIdx((i) => ((i ?? -1) + 1) % TRACKS.length), []);
  const prev = useCallback(() => setIdx((i) => ((i ?? 0) - 1 + TRACKS.length) % TRACKS.length), []);

  const value = useMemo<Ctx>(() => ({
    current: idx === null ? null : (TRACKS[idx] ?? null),
    select, next, prev, favorites, toggleFav,
    detail,
    openDetail: (id) => { setDetail(TRACKS.find((t) => t.id === id) ?? null); select(id); },
    closeDetail: () => setDetail(null),
    embed,
    openEmbed: (id) => { setEmbed(TRACKS.find((t) => t.id === id) ?? null); select(id); },
    closeEmbed: () => setEmbed(null),
  }), [idx, favorites, detail, embed, select, next, prev, toggleFav]);

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

export function usePlayer() {
  const c = useContext(PlayerCtx);
  if (!c) throw new Error("usePlayer outside provider");
  return c;
}
