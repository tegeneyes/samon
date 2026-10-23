// All entries verified via YouTube oEmbed against the official "Samon Zemas" channel.
export type Kind = "video" | "song" | "film";
export interface Track {
  id: string; // YouTube video ID
  en: string;
  am: string;
  feat?: string;
  kind: Kind;
  note: string;
}

export const CHANNEL_URL = "https://www.youtube.com/@samonzemas";

export const TRACKS: Track[] = [
  { id: "P2jNtY4Vrg4", en: "Nigerwat", am: "ንገሯት", kind: "video", note: "Official music video." },
  { id: "bQARUbJTaTg", en: "Tizita", am: "ትዝታ", kind: "video", note: "Official music video." },
  { id: "8jBLiqOGaBs", en: "Yezemen Milleket", am: "የዘመን ምልክት", kind: "video", note: "Official music video." },
  { id: "tVUwOxtijPI", en: "KanchiGa New", am: "ካንቺጋ ነው", feat: "Aman", kind: "video", note: "Official music video." },
  { id: "ItsQl_KsoXo", en: "Arada", am: "አራዳ", kind: "song", note: "Released on the official channel." },
  { id: "4x6MrYeOcHE", en: "Hilm Alen", am: "ህልም አለን", kind: "song", note: "Released on the official channel." },
  { id: "ufPrr3BN0wI", en: "Anchenekm", am: "አንጨነቅም", feat: "Alula Mampa", kind: "song", note: "Released on the official channel." },
  { id: "_dN3wx9V_K4", en: "Ayalew", am: "አያለው", feat: "Liya", kind: "song", note: "Released on the official channel." },
  { id: "lL2VBAuMLJQ", en: "Ayzon", am: "አይዞን", feat: "Fortuna Gebresellassie", kind: "song", note: "Released on the official channel." },
  { id: "K1QL7-ji9pA", en: "Gash Afro Tinishu", am: "ጋሽ አፍሮ ቲኒሹ", kind: "song", note: "Released on the official channel." },
  { id: "-a-6g8mUMI0", en: "Kal Alegn", am: "ቃል አለኝ", kind: "song", note: "Released on the official channel." },
  { id: "7e2LZssnHlk", en: "Seded", am: "ሰደድ", kind: "song", note: "Released on the official channel." },
  { id: "9ZmMCiB0O2g", en: "Shurube", am: "ሹሩቤ", kind: "song", note: "Released on the official channel." },
  { id: "P9gMBIEG7x4", en: "Lidres", am: "ልድረስ", kind: "song", note: "Released on the official channel." },
  { id: "ZCW5JS8V9Mk", en: "The Last Session", am: "ዶክመንተሪ", kind: "film", note: "Documentary on the official channel." },
];

export const thumb = (id: string, q: "hq" | "max" | "mq" = "hq") =>
  `https://i.ytimg.com/vi/${id}/${q === "max" ? "maxresdefault" : q === "mq" ? "mqdefault" : "hqdefault"}.jpg`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
