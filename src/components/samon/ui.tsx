import { useEffect, useState } from "react";
import { Heart, Play, SkipBack, SkipForward, X, ExternalLink, Youtube } from "lucide-react";
import { usePlayer } from "@/lib/player-store";
import { thumb, watchUrl, CHANNEL_URL, type Track } from "@/lib/tracks";
import { cn } from "@/lib/utils";

export function ArtCard({ t, className, size = "hq", showMeta = true }: { t: Track; className?: string; size?: "hq" | "max" | "mq"; showMeta?: boolean }) {
  const { openDetail, favorites, toggleFav } = usePlayer();
  const fav = favorites.includes(t.id);
  return (
    <div className={cn("group relative overflow-hidden rounded-sm bg-card shadow-art", className)}>
      <button
        onClick={() => openDetail(t.id)}
        aria-label={`Open ${t.en}`}
        className="absolute inset-0 z-10 block h-full w-full focus-visible:outline-offset-[-4px]"
      >
        <img
          src={thumb(t.id, size)}
          alt={`${t.en} – thumbnail`}
          loading="lazy"
          decoding="async"
          className="h-full w-full scale-[1.35] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.45]"
        />
        <span className="absolute inset-0 fade-b opacity-80 transition-opacity group-hover:opacity-100" />
        <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
          <Play className="ml-0.5 size-6 fill-current" />
        </span>
        {showMeta && (
          <span className="absolute inset-x-0 bottom-0 p-3 text-left">
            <span className="block font-ethi text-xs text-gold">{t.am}</span>
            <span className="block font-display text-lg uppercase leading-none tracking-wide">{t.en}</span>
          </span>
        )}
      </button>
      <button
        onClick={() => toggleFav(t.id)}
        aria-label={fav ? `Remove ${t.en} from favorites` : `Add ${t.en} to favorites`}
        aria-pressed={fav}
        className="absolute right-2 top-2 z-20 grid size-8 place-items-center rounded-full bg-background/60 backdrop-blur transition hover:scale-110"
      >
        <Heart className={cn("size-4", fav ? "fill-gold text-gold" : "text-foreground")} />
      </button>
    </div>
  );
}

function useEsc(fn: () => void, on: boolean) {
  useEffect(() => {
    if (!on) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && fn();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [fn, on]);
}

export function DetailModal() {
  const { detail, closeDetail, openEmbed, favorites, toggleFav } = usePlayer();
  useEsc(closeDetail, !!detail);
  if (!detail) return null;
  const t = detail;
  const fav = favorites.includes(t.id);
  return (
    <div role="dialog" aria-modal="true" aria-label={t.en} className="fixed inset-0 z-[70] grid place-items-center p-4 animate-in fade-in duration-300">
      <button aria-label="Close" onClick={closeDetail} className="absolute inset-0 bg-background/85 backdrop-blur-md" />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-sm border bg-card shadow-art animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="relative aspect-video overflow-hidden">
          <img src={thumb(t.id, "max")} onError={(e) => (e.currentTarget.src = thumb(t.id))} alt={t.en} className="h-full w-full object-cover" />
          <div className="absolute inset-0 fade-b" />
          <button onClick={closeDetail} aria-label="Close" autoFocus className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-background/70"><X className="size-5" /></button>
        </div>
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-ethi text-2xl text-gold">{t.am}</p>
            <h3 className="font-display text-5xl uppercase leading-none">{t.en}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.feat ? `feat. ${t.feat} · ` : ""}{t.note}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { closeDetail(); openEmbed(t.id); }} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"><Play className="size-4 fill-current" /> Play here</button>
            <a href={watchUrl(t.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-gold hover:text-gold"><Youtube className="size-4" /> Watch on YouTube</a>
            <button onClick={() => toggleFav(t.id)} aria-pressed={fav} className="grid size-12 place-items-center rounded-full border transition hover:border-gold" aria-label="Toggle favorite"><Heart className={cn("size-4", fav && "fill-gold text-gold")} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmbedModal() {
  const { embed, closeEmbed } = usePlayer();
  useEsc(closeEmbed, !!embed);
  if (!embed) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`Video: ${embed.en}`} className="fixed inset-0 z-[75] grid place-items-center p-4 animate-in fade-in">
      <button aria-label="Close video" onClick={closeEmbed} className="absolute inset-0 bg-background/95" />
      <div className="relative w-full max-w-5xl">
        <button onClick={closeEmbed} autoFocus aria-label="Close video" className="absolute -top-12 right-0 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"><X className="size-5" /> Close</button>
        <div className="aspect-video w-full overflow-hidden rounded-sm shadow-art">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${embed.id}?autoplay=1&rel=0`}
            title={embed.en}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export function MiniPlayer() {
  const { current, next, prev, favorites, toggleFav, openEmbed, openDetail } = usePlayer();
  if (!current) return null;
  const fav = favorites.includes(current.id);
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-3 rounded-full border bg-popover/85 p-2 pr-3 shadow-art backdrop-blur-xl">
        <button onClick={() => openDetail(current.id)} className="size-12 shrink-0 overflow-hidden rounded-full" aria-label="Show details">
          <img key={current.id} src={thumb(current.id, "mq")} alt="" className="h-full w-full scale-150 object-cover animate-in fade-in zoom-in-110" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base uppercase leading-tight tracking-wide">{current.en}</p>
          <p className="truncate font-ethi text-xs text-gold">{current.am}<span className="ml-2 font-sans text-muted-foreground">Selected · not playing</span></p>
        </div>
        <button onClick={prev} aria-label="Previous song" className="grid size-9 place-items-center rounded-full hover:text-gold"><SkipBack className="size-4" /></button>
        <button onClick={() => openEmbed(current.id)} aria-label={`Play ${current.en}`} className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-105"><Play className="ml-0.5 size-5 fill-current" /></button>
        <button onClick={next} aria-label="Next song" className="grid size-9 place-items-center rounded-full hover:text-gold"><SkipForward className="size-4" /></button>
        <button onClick={() => toggleFav(current.id)} aria-pressed={fav} aria-label="Toggle favorite" className="hidden size-9 place-items-center rounded-full sm:grid"><Heart className={cn("size-4", fav && "fill-gold text-gold")} /></button>
        <a href={watchUrl(current.id)} target="_blank" rel="noreferrer" className="hidden items-center gap-1 rounded-full border px-3 py-2 text-xs font-semibold hover:border-gold hover:text-gold md:inline-flex">YouTube <ExternalLink className="size-3" /></a>
      </div>
    </div>
  );
}

export function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const h = () => setSolid(window.scrollY > 40);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [["Music", "#music"], ["Videos", "#videos"], ["Explore", "#explore"]] as const;
  return (
    <nav className={cn("fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 transition-all duration-500 md:px-10", solid && "bg-background/70 py-3 backdrop-blur-lg")}>
      <a href="#top" className="font-display text-xl tracking-widest">SAMON<span className="text-gold">.</span></a>
      <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.2em] md:gap-8">
        {links.map(([l, h]) => <a key={l} href={h} className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all hover:text-gold hover:after:w-full">{l}</a>)}
        <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold"><Youtube className="size-4" /><span className="hidden sm:inline">YouTube</span></a>
      </div>
    </nav>
  );
}

export function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const h = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const d = document.documentElement;
        setP(d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight));
      });
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const chapters = ["Intro", "Feature", "Collage", "Gallery", "Wall", "Favorites", "Finale"];
  return (
    <div aria-hidden className="fixed right-4 top-1/2 z-40 hidden h-64 -translate-y-1/2 lg:block">
      <div className="relative h-full w-px bg-border">
        <div className="absolute left-0 top-0 w-px bg-gold" style={{ height: `${p * 100}%` }} />
        {chapters.map((c, i) => {
          const at = i / (chapters.length - 1);
          return (
            <span key={c} className="absolute -left-1 flex items-center" style={{ top: `${at * 100}%` }}>
              <span className={cn("size-2 rounded-full border transition-colors", p >= at - 0.02 ? "border-gold bg-gold" : "bg-background")} />
              <span className={cn("absolute right-4 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] transition-opacity", Math.abs(p - at) < 0.08 ? "text-gold opacity-100" : "opacity-0")}>{c}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
