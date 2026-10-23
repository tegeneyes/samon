import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Play, Search, Youtube, Heart } from "lucide-react";
import { PlayerProvider, usePlayer } from "@/lib/player-store";
import { TRACKS, thumb, CHANNEL_URL, type Track } from "@/lib/tracks";
import { ArtCard, DetailModal, EmbedModal, MiniPlayer, Nav, ScrollProgress } from "@/components/samon/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samon Zemas — ሣሞን ዜማስ | A Fan Journey Through the Music" },
      { name: "description", content: "An immersive fan experience through Samon Zemas's music videos — Nigerwat, Tizita, Yezemen Milleket, Arada and more." },
      { property: "og:title", content: "Samon Zemas — ሣሞን ዜማስ" },
      { property: "og:description", content: "Scroll through the music of Ethiopian artist Samon Zemas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: thumb("P2jNtY4Vrg4", "max") },
      { name: "twitter:image", content: thumb("P2jNtY4Vrg4", "max") },
    ],
  }),
  component: () => (
    <PlayerProvider>
      <Page />
    </PlayerProvider>
  ),
});

const T = (id: string) => TRACKS.find((t) => t.id === id)!;

function Page() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero parallax layers
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        gsap.to(el, {
          yPercent: -Number(el.dataset["speed"]) * 60,
          rotate: Number(el.dataset["rot"] ?? 0) * 2,
          ease: "none",
          scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true },
        });
      });
      gsap.to("[data-hero-title]", { scale: 1.3, opacity: 0, filter: "blur(12px)", ease: "none", scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true } });
      gsap.from("[data-hero-char]", { yPercent: 110, stagger: 0.05, duration: 1.2, ease: "expo.out", delay: 0.2 });
      gsap.from("[data-speed]", { opacity: 0, scale: 0.6, stagger: 0.06, duration: 1.4, ease: "expo.out", delay: 0.3 });

      // Featured: pinned image expands then insets
      const ft = gsap.timeline({ scrollTrigger: { trigger: "#videos", start: "top top", end: "+=150%", scrub: 1, pin: true } });
      ft.fromTo("[data-feat-img]", { clipPath: "inset(30% 35% 30% 35% round 4px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" })
        .fromTo("[data-feat-img] img", { scale: 1.6 }, { scale: 1.15, ease: "none" }, 0)
        .from("[data-feat-text] > *", { y: 80, opacity: 0, stagger: 0.1 }, 0.5);

      // Collage: big image dissolves into artwork collage
      const ct = gsap.timeline({ scrollTrigger: { trigger: "#collage", start: "top top", end: "+=200%", scrub: 1, pin: true } });
      ct.to("[data-collage-big]", { scale: 0.32, rotate: -4, borderRadius: 4, ease: "power2.inOut" })
        .from("[data-collage-piece]", {
          x: (i) => (i % 2 ? 1 : -1) * (window.innerWidth * 0.7),
          y: (i) => (i % 3 - 1) * 200,
          rotate: (i) => (i % 2 ? 25 : -25),
          scale: 1.6, opacity: 0, filter: "blur(10px)", stagger: 0.08, ease: "power3.out",
        }, 0.1)
        .from("[data-collage-word]", { opacity: 0, letterSpacing: "1em", ease: "power2.out" }, 0.4);

      // Horizontal gallery
      const track = document.querySelector<HTMLElement>("[data-htrack]");
      if (track) {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: { trigger: "#music", start: "top top", end: () => `+=${track.scrollWidth}`, scrub: 1, pin: true, invalidateOnRefresh: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-hcard]").forEach((c, i) => {
          gsap.fromTo(c.querySelector("img"), { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: "#music", start: "top top", end: () => `+=${track.scrollWidth}`, scrub: true } });
          gsap.set(c, { rotate: i % 2 ? 2 : -2 });
        });
      }

      // Line reveals
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        onEnter: (els) => gsap.fromTo(els, { y: 60, opacity: 0, filter: "blur(6px)" }, { y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.1, duration: 1, ease: "expo.out" }),
      });
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) => {
        gsap.fromTo(el, { y: 120 * Number(el.dataset["drift"]) }, { y: -120 * Number(el.dataset["drift"]), ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.fromTo("[data-finale-title]", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: "#finale", start: "top 80%", end: "center center", scrub: true } });
    });

    // Cursor-follow on hero art (desktop, fine pointer)
    const hero = document.getElementById("top");
    let off = () => {};
    if (hero && window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
      const layer = hero.querySelector<HTMLElement>("[data-mouse]");
      if (layer) {
        const xTo = gsap.quickTo(layer, "x", { duration: 1.2, ease: "power3" });
        const yTo = gsap.quickTo(layer, "y", { duration: 1.2, ease: "power3" });
        const mv = (e: PointerEvent) => { xTo((e.clientX / innerWidth - 0.5) * -40); yTo((e.clientY / innerHeight - 0.5) * -30); };
        hero.addEventListener("pointermove", mv);
        off = () => hero.removeEventListener("pointermove", mv);
      }
    }
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => { mm.revert(); off(); clearTimeout(t); };
  }, []);

  return (
    <div ref={root} className="grain relative overflow-x-clip">
      <Nav />
      <ScrollProgress />
      <Hero />
      <Featured />
      <Collage />
      <HGallery />
      <Wall />
      <Favorites />
      <Finale />
      <MiniPlayer />
      <DetailModal />
      <EmbedModal />
    </div>
  );
}

/* ---------------- HERO ---------------- */
const HERO_LAYOUT: { id: string; cls: string; speed: number; rot: number }[] = [
  { id: "P2jNtY4Vrg4", cls: "left-[4%] top-[14%] w-[30vw] md:w-[22vw]", speed: 1.4, rot: -6 },
  { id: "bQARUbJTaTg", cls: "right-[6%] top-[10%] w-[34vw] md:w-[24vw]", speed: 0.8, rot: 5 },
  { id: "8jBLiqOGaBs", cls: "left-[18%] bottom-[10%] w-[28vw] md:w-[18vw]", speed: 2, rot: 4 },
  { id: "ItsQl_KsoXo", cls: "right-[14%] bottom-[14%] w-[30vw] md:w-[20vw]", speed: 1.1, rot: -4 },
  { id: "tVUwOxtijPI", cls: "left-[42%] top-[6%] w-[22vw] md:w-[13vw]", speed: 2.4, rot: 8 },
  { id: "9ZmMCiB0O2g", cls: "left-[-3%] top-[52%] w-[20vw] md:w-[14vw]", speed: 0.6, rot: 10 },
  { id: "4x6MrYeOcHE", cls: "right-[-2%] top-[46%] w-[22vw] md:w-[15vw]", speed: 1.8, rot: -9 },
  { id: "7e2LZssnHlk", cls: "left-[48%] bottom-[4%] w-[20vw] md:w-[12vw]", speed: 1.5, rot: -3 },
];

function Hero() {
  const { openDetail } = usePlayer();
  return (
    <section id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <div className="pointer-events-none absolute left-1/4 top-1/4 size-[60vw] rounded-full glow-gold blur-3xl animate-drift" />
      <div className="pointer-events-none absolute bottom-0 right-0 size-[50vw] rounded-full glow-ember blur-3xl animate-drift [animation-delay:-6s]" />
      <div data-mouse className="absolute inset-0">
        {HERO_LAYOUT.map((h) => (
          <button
            key={h.id}
            data-speed={h.speed}
            data-rot={h.rot}
            onClick={() => openDetail(h.id)}
            aria-label={`Open ${T(h.id).en}`}
            style={{ rotate: `${h.rot}deg` }}
            className={cn("absolute aspect-video overflow-hidden rounded-sm opacity-70 shadow-art grayscale-[40%] transition-[filter,opacity] duration-500 hover:opacity-100 hover:grayscale-0", h.cls)}
          >
            <img src={thumb(h.id)} alt="" className="h-full w-full scale-[1.35] object-cover" fetchPriority="high" />
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 vignette" />
      <div data-hero-title className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center text-center">
        <p className="mb-4 font-ethi text-xl tracking-[0.4em] text-gold md:text-3xl">ሣሞን ዜማስ</p>
        <h1 className="font-display text-[22vw] uppercase leading-[0.8] tracking-tight md:text-[17vw]">
          {["SAMON", "ZEMAS"].map((w, wi) => (
            <span key={w} className={cn("block overflow-hidden", wi === 1 && "text-outline")}>
              {w.split("").map((c, i) => <span key={i} data-hero-char className="inline-block">{c}</span>)}
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-md px-6 font-serif text-xl italic text-muted-foreground">A fan-made journey through the songs and videos of an Ethiopian voice.</p>
      </div>
      <a href="#videos" className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-gold">
        Scroll to discover
        <ArrowDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}

/* ---------------- FEATURED ---------------- */
function Featured() {
  const t = T("P2jNtY4Vrg4");
  const { openEmbed, openDetail } = usePlayer();
  return (
    <section id="videos" className="relative h-[100svh] overflow-hidden">
      <div data-feat-img className="absolute inset-0">
        <img src={thumb(t.id, "max")} alt="Nigerwat music video still" className="h-full w-full object-cover" />
        <div className="absolute inset-0 fade-b" />
        <div className="absolute inset-0 bg-background/30" />
      </div>
      <div data-feat-text className="relative z-10 flex h-full flex-col justify-end gap-4 p-6 pb-28 md:p-16 md:pb-24">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">Featured music video</p>
        <p className="font-ethi text-5xl md:text-7xl">{t.am}</p>
        <h2 className="font-display text-7xl uppercase leading-[0.85] md:text-[11rem]">{t.en}</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => openEmbed(t.id)} className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground">
            <span className="grid size-8 place-items-center rounded-full bg-primary-foreground text-primary transition-transform group-hover:scale-110"><Play className="ml-0.5 size-4 fill-current" /></span>
            Watch the video
          </button>
          <button onClick={() => openDetail(t.id)} className="rounded-full border px-6 py-4 text-sm font-semibold uppercase tracking-widest hover:border-gold hover:text-gold">Details</button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- COLLAGE ---------------- */
const PIECES = [
  { id: "8jBLiqOGaBs", cls: "left-[3%] top-[10%] w-[34vw] md:w-[24vw]" },
  { id: "ItsQl_KsoXo", cls: "right-[4%] top-[8%] w-[30vw] md:w-[20vw]" },
  { id: "tVUwOxtijPI", cls: "left-[8%] bottom-[12%] w-[30vw] md:w-[19vw]" },
  { id: "K1QL7-ji9pA", cls: "right-[8%] bottom-[10%] w-[34vw] md:w-[23vw]" },
  { id: "-a-6g8mUMI0", cls: "left-[30%] top-[4%] w-[24vw] md:w-[15vw]" },
  { id: "_dN3wx9V_K4", cls: "right-[30%] bottom-[4%] w-[24vw] md:w-[15vw]" },
  { id: "lL2VBAuMLJQ", cls: "left-[-2%] top-[42%] w-[22vw] md:w-[14vw]" },
  { id: "ufPrr3BN0wI", cls: "right-[-2%] top-[40%] w-[22vw] md:w-[14vw]" },
];

function Collage() {
  const big = T("bQARUbJTaTg");
  const { openDetail } = usePlayer();
  return (
    <section id="collage" className="relative h-[100svh] overflow-hidden bg-secondary">
      <div className="absolute inset-0 grid place-items-center">
        <button data-collage-big onClick={() => openDetail(big.id)} aria-label="Open Tizita" className="relative z-10 h-full w-full overflow-hidden">
          <img src={thumb(big.id, "max")} alt="Tizita music video still" className="h-full w-full scale-110 object-cover" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-8 text-left">
            <span className="block font-ethi text-4xl text-gold">ትዝታ</span>
            <span className="block font-display text-6xl uppercase">Tizita</span>
          </span>
        </button>
      </div>
      {PIECES.map((p, i) => (
        <div key={p.id} data-collage-piece className={cn("absolute aspect-video", p.cls)} style={{ rotate: `${(i % 2 ? 1 : -1) * (2 + (i % 3) * 2)}deg` }}>
          <ArtCard t={T(p.id)} className="h-full w-full" />
        </div>
      ))}
      <p data-collage-word className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 text-center font-display text-[14vw] uppercase leading-none text-outline opacity-60">Memory</p>
    </section>
  );
}

/* ---------------- HORIZONTAL GALLERY ---------------- */
function HGallery() {
  const { openDetail, openEmbed } = usePlayer();
  return (
    <section id="music" className="relative h-[100svh] overflow-hidden">
      <div className="absolute left-6 top-20 z-10 md:left-16">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">The collection</p>
        <h2 className="font-display text-5xl uppercase md:text-7xl">Every song, <span className="font-serif italic normal-case text-gold">one reel</span></h2>
      </div>
      <div data-htrack className="flex h-full w-max items-center gap-10 pl-[8vw] pr-[20vw] pt-24 md:gap-16">
        {TRACKS.map((t, i) => (
          <article key={t.id} data-hcard className={cn("group relative w-[78vw] shrink-0 md:w-[38vw]", i % 2 ? "mt-24" : "-mt-24")}>
            <button onClick={() => openDetail(t.id)} className="relative block aspect-[4/3] w-full overflow-hidden rounded-sm shadow-art" aria-label={`Open ${t.en}`}>
              <img src={thumb(t.id)} alt={`${t.en} thumbnail`} loading="lazy" className="h-full w-full scale-[1.4] object-cover transition-transform duration-700 group-hover:scale-[1.5]" />
              <span className="absolute inset-0 fade-b" />
            </button>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <span className="font-serif text-sm italic text-muted-foreground">{String(i + 1).padStart(2, "0")} — {t.kind === "video" ? "Music video" : t.kind === "film" ? "Documentary" : "Song"}</span>
                <h3 className="font-display text-4xl uppercase leading-none">{t.en}</h3>
                <p className="font-ethi text-gold">{t.am}{t.feat && <span className="ml-2 font-sans text-xs text-muted-foreground">feat. {t.feat}</span>}</p>
              </div>
              <button onClick={() => openEmbed(t.id)} aria-label={`Play ${t.en}`} className="grid size-14 shrink-0 place-items-center rounded-full border border-gold text-gold transition hover:bg-primary hover:text-primary-foreground"><Play className="ml-0.5 size-5 fill-current" /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- WALL ---------------- */
type Filter = "all" | "video" | "song" | "fav";
const SHAPES = ["aspect-video", "aspect-square", "aspect-[3/4]", "aspect-video", "aspect-[4/5]", "aspect-[16/10]"];

function Wall() {
  const { favorites } = usePlayer();
  const [f, setF] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => TRACKS.filter((t) => {
    if (f === "video" && t.kind === "song") return false;
    if (f === "song" && t.kind !== "song") return false;
    if (f === "fav" && !favorites.includes(t.id)) return false;
    const s = q.trim().toLowerCase();
    return !s || t.en.toLowerCase().includes(s) || t.am.includes(q.trim()) || (t.feat ?? "").toLowerCase().includes(s);
  }), [f, q, favorites]);
  const filters: [Filter, string][] = [["all", "All"], ["video", "Music videos"], ["song", "Songs"], ["fav", `Favorites (${favorites.length})`]];

  return (
    <section id="explore" className="relative px-5 py-32 md:px-16">
      <div className="pointer-events-none absolute right-0 top-0 size-[40vw] glow-ember blur-3xl" />
      <div className="relative mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p data-reveal className="text-xs uppercase tracking-[0.4em] text-gold">Explore · ያስሱ</p>
          <h2 data-reveal className="font-display text-6xl uppercase leading-[0.85] md:text-8xl">The album wall</h2>
          <p data-reveal className="mt-4 max-w-md font-serif text-xl italic text-muted-foreground">Every frame from the official channel. Tap any one to open it.</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <label className="relative block w-full md:w-72">
            <span className="sr-only">Search songs</span>
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search songs, ፊደል…" className="w-full rounded-full border bg-card/60 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gold" />
          </label>
          <div role="tablist" className="flex flex-wrap gap-2">
            {filters.map(([k, l]) => (
              <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)} className={cn("rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition", f === k ? "border-gold bg-primary text-primary-foreground" : "hover:border-gold hover:text-gold")}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="py-24 text-center font-serif text-2xl italic text-muted-foreground">{f === "fav" ? "No favorites yet — tap a heart on any artwork." : "Nothing matches that search."}</p>
      ) : (
        <div key={f + q} className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {list.map((t, i) => (
            <div key={t.id} className="mb-4 break-inside-avoid animate-in fade-in zoom-in-95 slide-in-from-bottom-6 fill-mode-both duration-700" style={{ animationDelay: `${i * 50}ms`, rotate: `${((i * 7) % 5) - 2}deg` }}>
              <ArtCard t={t} className={cn("w-full", SHAPES[i % SHAPES.length])} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- FAVORITES ---------------- */
function Favorites() {
  const { favorites, openDetail, select } = usePlayer();
  const favs = favorites.map((id) => TRACKS.find((t) => t.id === id)).filter(Boolean) as Track[];
  const items = favs.length ? favs : TRACKS.filter((t) => t.kind === "video");
  return (
    <section className="relative overflow-hidden px-5 py-32 md:px-16">
      <div className="mb-16 text-center">
        <p data-reveal className="text-xs uppercase tracking-[0.4em] text-gold">{favs.length ? "Your favorites" : "Fan-favorite tracks"}</p>
        <h2 data-reveal className="font-display text-6xl uppercase md:text-8xl">{favs.length ? "Kept close" : "Official music videos"}</h2>
        {!favs.length && <p data-reveal className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">Tap <Heart className="size-4" /> on any song to save your own list here.</p>}
      </div>
      <ol className="mx-auto max-w-5xl divide-y border-y">
        {items.map((t, i) => (
          <li key={t.id} data-reveal>
            <button onClick={() => { select(t.id); openDetail(t.id); }} className="group grid w-full grid-cols-[3rem_1fr_auto] items-center gap-4 py-5 text-left md:grid-cols-[4rem_1fr_auto_9rem]">
              <span className="font-serif text-2xl italic text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="block font-display text-3xl uppercase leading-none transition-colors group-hover:text-gold md:text-5xl">{t.en}</span>
                <span className="font-ethi text-sm text-gold">{t.am}</span>
              </span>
              <span className="hidden text-xs uppercase tracking-widest text-muted-foreground md:block">{t.feat ? `feat. ${t.feat}` : ""}</span>
              <span className="relative aspect-video w-24 overflow-hidden rounded-sm transition-all duration-500 group-hover:w-36 md:w-28">
                <img src={thumb(t.id, "mq")} alt="" loading="lazy" className="h-full w-full scale-125 object-cover" />
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div data-drift="1" className="pointer-events-none absolute -left-10 top-40 hidden w-56 rotate-[-8deg] opacity-40 md:block"><img src={thumb("K1QL7-ji9pA")} alt="" loading="lazy" className="aspect-video w-full object-cover" /></div>
      <div data-drift="-1" className="pointer-events-none absolute -right-10 bottom-40 hidden w-56 rotate-[6deg] opacity-40 md:block"><img src={thumb("P9gMBIEG7x4")} alt="" loading="lazy" className="aspect-video w-full object-cover" /></div>
    </section>
  );
}

/* ---------------- FINALE ---------------- */
function Finale() {
  const doc = T("ZCW5JS8V9Mk");
  const { openEmbed } = usePlayer();
  const row = [...TRACKS, ...TRACKS];
  return (
    <section id="finale" className="relative overflow-hidden pb-40 pt-24">
      <div className="mb-20 overflow-hidden opacity-50">
        <div className="flex w-max gap-4 animate-marquee">
          {row.map((t, i) => <img key={i} src={thumb(t.id, "mq")} alt="" loading="lazy" className="aspect-video w-56 object-cover grayscale" />)}
        </div>
      </div>
      <div className="relative px-6 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 size-[70vw] -translate-x-1/2 -translate-y-1/2 glow-gold blur-3xl" />
        <p data-reveal className="relative font-ethi text-3xl text-gold">ዜማው ይቀጥላል</p>
        <h2 data-finale-title className="relative font-display text-[16vw] uppercase leading-[0.85]">The music<br /><span className="text-outline">continues</span></h2>
        <div className="relative mt-10 flex flex-wrap justify-center gap-3">
          <a href={CHANNEL_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-5 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition hover:scale-105"><Youtube className="size-5" /> Visit the official channel</a>
          <button onClick={() => openEmbed(doc.id)} className="inline-flex items-center gap-3 rounded-full border px-8 py-5 text-sm font-semibold uppercase tracking-widest hover:border-gold hover:text-gold"><Play className="size-4 fill-current" /> Watch “{doc.en}”</button>
        </div>
        <p className="relative mt-24 text-xs text-muted-foreground">An unofficial fan tribute. All videos and artwork belong to Samon Zemas and are served from YouTube.</p>
      </div>
    </section>
  );
}
