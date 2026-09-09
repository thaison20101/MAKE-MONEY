import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ETHEREUM_LESSONS } from "./seed";

const DOCS = join(process.cwd(), "docs");

export function readLesson(id: string): { id: string; title: string; markdown: string } | null {
  const meta = ETHEREUM_LESSONS.find((l) => l.id === id);
  if (!meta) return null;
  const path = join(DOCS, "hoc-ethereum", meta.file);
  if (!existsSync(path)) return null;
  return { id: meta.id, title: meta.title, markdown: readFileSync(path, "utf8") };
}

export function readGuide(name: string): string | null {
  const allowed = new Set([
    "README.md",
    "bat-dau-tu-dau.md",
    "vi-va-mang.md",
    "san-va-api.md",
    "may-24h-thu-dong.md",
    "airdrop-va-game.md",
    "meme-va-rui-ro.md",
    "meme-luot-song.md",
    "ranh-gioi-bot.md",
    "hoc-ethereum/README.md"
  ]);
  if (!allowed.has(name)) return null;
  const path = join(DOCS, name);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf8");
}

export { ETHEREUM_LESSONS };
