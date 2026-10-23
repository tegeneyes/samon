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
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://samon-tege.vercel.app/" },
      { property: "og:title", content: "Samon Zemas — ሣሞን ዜማስ | A Fan Journey Through the Music" },
      { property: "og:description", content: "An immersive fan experience through Samon Zemas's music videos — Nigerwat, Tizita, Yezemen Milleket, Arada and more." },
      { property: "og:image", content: "https://image.thum.io/get/width/1200/https://samon-tege.vercel.app/" },
      { property: "og:image:alt", content: "SAMON fan tribute website preview" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Samon Zemas — ሣሞን ዜማስ | A Fan Journey Through the Music" },
      { name: "twitter:description", content: "An immersive fan experience through Samon Zemas's music videos — Nigerwat, Tizita, Yezemen Milleket, Arada and more." },
      { name: "twitter:image", content: "https://image.thum.io/get/width/1200/https://samon-tege.vercel.app/" },
      { name: "twitter:image:alt", content: "SAMON fan tribute website preview" },
    ],
  }),
  component: () => (
    <PlayerProvider>
      <Page />
    </PlayerProvider>
  ),
});
