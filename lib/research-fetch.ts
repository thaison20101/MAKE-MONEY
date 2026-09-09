import type { ResearchItem } from "./types";

const ALLOWLIST = [
  {
    source: "Ethereum.org blog RSS",
    url: "https://blog.ethereum.org/feed.xml",
    strategy: "giao-duc"
  }
];

export async function fetchAllowlistResearch(): Promise<ResearchItem[]> {
  const items: ResearchItem[] = [];
  for (const feed of ALLOWLIST) {
    try {
      const res = await fetch(feed.url, { headers: { accept: "application/rss+xml, application/xml" } });
      if (!res.ok) continue;
      const xml = await res.text();
      const titles = [...xml.matchAll(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/g)].slice(1, 6);
      const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].slice(1, 6);
      titles.forEach((t, i) => {
        const title = t[1].trim();
        items.push({
          id: `rss-${feed.source}-${i}-${title.slice(0, 20)}`,
          title,
          source: feed.source,
          summary: "Tóm tắt nguồn allowlist — không phải lệnh mua/bán.",
          strategy: feed.strategy,
          fomo: /100x|pump|guaranteed|tối đa/i.test(title),
          url: links[i]?.[1] || feed.url,
          at: Date.now()
        });
      });
    } catch {
      /* bỏ qua feed lỗi */
    }
  }
  return items;
}
