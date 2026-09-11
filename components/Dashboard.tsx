"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ETHEREUM_LESSONS } from "@/lib/seed";
import type { AppState } from "@/lib/types";

const TABS = [
  ["hoc", "Học Ethereum"],
  ["batdau", "Bắt đầu"],
  ["may", "Máy 24/7"],
  ["sogom", "Sổ gom"],
  ["meme", "Meme / Radar"],
  ["vi", "Ví"],
  ["airdrop", "Airdrop"],
  ["defi", "DeFi"],
  ["cex", "CEX"],
  ["game", "Game"],
  ["research", "Nghiên cứu"]
] as const;

type Tab = (typeof TABS)[number][0];

async function post(body: unknown): Promise<AppState> {
  const res = await fetch("/api/state", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

export function Dashboard() {
  const [tab, setTab] = useState<Tab>("hoc");
  const [state, setState] = useState<AppState | null>(null);
  const [lessonId, setLessonId] = useState("01");
  const [lessonMd, setLessonMd] = useState("");
  const [err, setErr] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/state", { cache: "no-store" });
    setState(await res.json());
  }, []);

  useEffect(() => {
    refresh().catch((e: Error) => setErr(e.message));
  }, [refresh]);

  useEffect(() => {
    fetch(`/api/lesson?id=${lessonId}`)
      .then((r) => r.json())
      .then((j) => setLessonMd(j.markdown || ""))
      .catch(() => setLessonMd("Không đọc được bài."));
  }, [lessonId]);

  const understoodCount = useMemo(
    () => state?.lessons.filter((l) => l.understood).length ?? 0,
    [state]
  );

  if (err) return <main className="main">Lỗi: {err}</main>;
  if (!state) return <main className="main">Đang tải…</main>;

  const equity =
    state.paper.cashUsd +
    state.paper.positions.reduce((s, p) => s + (state.prices[p.symbol] ?? p.entryPrice) * p.remainingQty, 0);
  const earnedUsd = state.earnings.reduce((s, e) => s + e.usdEstimate, 0);

  return (
    <div className="app">
      <aside className="side">
        <h1 className="brand">Máy thu đông</h1>
        <p className="tag">Học Ethereum · paper 24/7 · không phải lời khuyên đầu tư</p>
        <nav className="nav">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <p className="tag" style={{ marginTop: 24 }}>
          Mode: <strong className="ok">{state.tradingMode}</strong>
          <br />
          Bài đã hiểu: {understoodCount}/15
        </p>
      </aside>
      <main className="main">
        {tab === "hoc" && (
          <section>
            <div className="hero">
              <h1>Học Ethereum từ gốc</h1>
              <p>Đọc lần lượt. Nên xong bài 01–05 trước khi tạo ví thật.</p>
            </div>
            <div className="row" style={{ marginBottom: 16 }}>
              <label className="field">
                Bài
                <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
                  {ETHEREUM_LESSONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.id}. {l.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="check" style={{ border: "none" }}>
                <input
                  type="checkbox"
                  checked={!!state.lessons.find((l) => l.id === lessonId)?.understood}
                  onChange={async (e) => setState(await post({ type: "lesson", id: lessonId, understood: e.target.checked }))}
                />
                Đã hiểu bài này
              </label>
            </div>
            <article className="card lesson">
              <ReactMarkdown>{lessonMd}</ReactMarkdown>
            </article>
          </section>
        )}

        {tab === "batdau" && (
          <section>
            <div className="hero">
              <h1>Bắt đầu từ số 0</h1>
              <p>Tải app, tạo đúng một bộ tài khoản, rồi mới treo máy. Chi tiết trong docs/bat-dau-tu-dau.md</p>
            </div>
            <div className="banner">
              Tải: Rabby/MetaMask, Telegram Desktop, Node.js LTS. Tạo: 1 ví (seed chỉ bạn), 1 sàn KYC, bot qua @BotFather.
              Không gửi seed cho tool này. Windows: đừng chạy lệnh trong C:\Windows\system32 — xem docs/chay-tren-windows.md
            </div>
            <div className="banner warn">
              Bây giờ: học bài 01–05 + paper trên app. Tải ví/Telegram sau khi hiểu seed. Nạp tiền thật chỉ khi đã chốt/cắt được trên paper, số nhỏ có thể mất hết.
            </div>
            <div className="card">
              {state.onboarding.map((s) => (
                <label className="check" key={s.id}>
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={async (e) => setState(await post({ type: "onboarding", id: s.id, done: e.target.checked }))}
                  />
                  <span>{s.title}</span>
                </label>
              ))}
            </div>
            <p className="muted" style={{ marginTop: 12 }}>
              Chạy máy: <code>npm run dev</code> và <code>npm run worker</code>
            </p>
          </section>
        )}

        {tab === "may" && (
          <section>
            <div className="hero">
              <h1>Máy 24/7 — nhiều kênh, một danh tính</h1>
              <p>Bật module. Nhân bản tác vụ, không clone ví. Bấm “Chạy 1 tick” để mô phỏng worker.</p>
            </div>
            <div className="row" style={{ marginBottom: 14 }}>
              <button className="btn" onClick={async () => setState(await post({ type: "tick" }))}>
                Chạy 1 tick
              </button>
              <button className="btn ghost" onClick={async () => setState(await post({ type: "reset" }))}>
                Reset dữ liệu local
              </button>
            </div>
            <div className="grid two">
              {state.modules.map((m) => (
                <div className="card" key={m.id}>
                  <h3>{m.name}</h3>
                  <p>
                    Kiểu: {m.kind} · {m.enabled ? <span className="ok">bật</span> : "tắt"}
                  </p>
                  <p>{m.lastNote || "Chưa chạy"}</p>
                  <label className="check" style={{ border: "none" }}>
                    <input
                      type="checkbox"
                      checked={m.enabled}
                      onChange={async (e) => setState(await post({ type: "module", id: m.id, enabled: e.target.checked }))}
                    />
                    Bật module
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "sogom" && (
          <section>
            <div className="hero">
              <h1>Sổ gom</h1>
              <p>Điểm, lãi paper, phần thưởng ước lượng — không phải lời hứa.</p>
            </div>
            <div className="grid three">
              <div className="card">
                <h3>Ước USD sổ</h3>
                <div className="stat">${earnedUsd.toFixed(2)}</div>
              </div>
              <div className="card">
                <h3>Paper equity</h3>
                <div className="stat">${equity.toFixed(2)}</div>
              </div>
              <div className="card">
                <h3>PnL ngày</h3>
                <div className={state.paper.dailyPnl >= 0 ? "stat" : "stat bad"}>${state.paper.dailyPnl.toFixed(2)}</div>
                {state.paper.paused && <p className="bad">Circuit breaker đang pause</p>}
              </div>
            </div>
            <div className="card" style={{ marginTop: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Kênh</th>
                    <th>Mô tả</th>
                    <th>USD ước</th>
                  </tr>
                </thead>
                <tbody>
                  {state.earnings.slice(0, 30).map((e) => (
                    <tr key={e.id}>
                      <td>{e.channel}</td>
                      <td>{e.label}</td>
                      <td>${e.usdEstimate.toFixed(2)}</td>
                    </tr>
                  ))}
                  {!state.earnings.length && (
                    <tr>
                      <td colSpan={3}>Chưa có — chạy tick trên Máy 24/7</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "meme" && (
          <section>
            <div className="hero">
              <h1>Radar + lướt meme (chốt sớm)</h1>
              <p>Follow coin CEX đang nổi. DEX-only chỉ cảnh báo. TP mặc định 5% — không gồng chờ đỉnh.</p>
            </div>
            <div className="banner warn">
              Phí và spread có thể ăn hết mục tiêu 5–10%. Paper trước. Không săn launch DEX vài phút tuổi.
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <h3>Thông số</h3>
              <div className="grid three">
                {(
                  [
                    ["takeProfitPct", "Chốt sớm %"],
                    ["stopLossPct", "Cắt lỗ %"],
                    ["autoFollowTopN", "Follow top N"],
                    ["maxOpenMemes", "Số lệnh tối đa"],
                    ["dipBuyPct", "Bắt đáy khi giảm %"],
                    ["maxSpreadPct", "Bỏ nếu spread > %"]
                  ] as const
                ).map(([key, label]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <input
                      type="number"
                      value={state.meme[key]}
                      onChange={async (e) =>
                        setState(await post({ type: "meme", settings: { [key]: Number(e.target.value) } }))
                      }
                    />
                  </label>
                ))}
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn" onClick={async () => setState(await post({ type: "tick" }))}>
                  Tick giá / follow
                </button>
                <button
                  className="btn ghost"
                  onClick={async () => setState(await post({ type: "demoShock", symbol: "TREND", factor: 1.06 }))}
                >
                  Giả TREND +6% (test TP)
                </button>
                <button
                  className="btn ghost"
                  onClick={async () => setState(await post({ type: "demoShock", symbol: "TREND", factor: 0.84 }))}
                >
                  Giả TREND −16% (test SL)
                </button>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 14 }}>
              <h3>Radar xu hướng</h3>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Coin</th>
                    <th>Score</th>
                    <th>Sàn</th>
                    <th>24h</th>
                    <th>Spread</th>
                    <th>Tuổi (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {state.radar.map((c) => (
                    <tr key={c.id}>
                      <td>{c.rank}</td>
                      <td>
                        {c.symbol} <span className="muted">{c.name}</span>
                      </td>
                      <td>{c.trendScore}</td>
                      <td>{c.listedOnCex ? <span className="ok">CEX</span> : <span className="warn">DEX-only</span>}</td>
                      <td className={c.change24h >= 0 ? "ok" : "bad"}>{c.change24h}%</td>
                      <td>{c.spreadPct}%</td>
                      <td>{Math.round(c.ageHours)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid two">
              <div className="card">
                <h3>Vị thế paper</h3>
                {!state.paper.positions.length && <p>Chưa mở lệnh — tick khi TREND/PEPE lọt lọc.</p>}
                {state.paper.positions.map((p) => (
                  <p key={p.id}>
                    {p.symbol} {p.source} @ {p.entryPrice} · qty {p.remainingQty.toPrecision(4)}
                  </p>
                ))}
              </div>
              <div className="card">
                <h3>Nhật ký lệnh</h3>
                {state.paper.events.slice(0, 8).map((e, i) => (
                  <p key={`${e.at}-${i}`}>
                    {e.kind} {e.symbol} {e.note}
                    {e.pnlUsd != null ? ` (${e.pnlUsd})` : ""}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "vi" && (
          <section>
            <div className="hero">
              <h1>Ví</h1>
              <p>Chỉ địa chỉ public. Seed không bao giờ dán vào đây.</p>
            </div>
            <div className="card">
              <label className="field">
                Địa chỉ EVM (0x…)
                <input
                  value={state.walletAddress}
                  placeholder="0xabc…"
                  onChange={(e) => setState({ ...state, walletAddress: e.target.value })}
                  onBlur={async (e) => setState(await post({ type: "wallet", address: e.target.value }))}
                />
              </label>
              <p className="muted">App không ký giao dịch. Claim on-chain: bạn ký trên Rabby/MetaMask.</p>
            </div>
          </section>
        )}

        {tab === "airdrop" && (
          <section>
            <div className="hero">
              <h1>Airdrop / points</h1>
              <p>Curated. Claim: bạn tự mở site chính thức.</p>
            </div>
            {state.airdrops.map((a) => (
              <div className="card" key={a.id} style={{ marginBottom: 10 }}>
                <h3>{a.name}</h3>
                <p>
                  {a.chain} · trạng thái <strong>{a.status}</strong>
                </p>
                <p>{a.note}</p>
              </div>
            ))}
          </section>
        )}

        {tab === "defi" && (
          <section>
            <div className="hero">
              <h1>DeFi watch</h1>
              <p>Theo dõi những gì bạn đã tự nạp. Bot không approve contract lạ.</p>
            </div>
            {state.defiWatches.map((d) => (
              <div className="card" key={d.id}>
                <h3>{d.protocol}</h3>
                <p>APY tham khảo {d.apy}%</p>
                <p>{d.note}</p>
              </div>
            ))}
          </section>
        )}

        {tab === "cex" && <CexPanel state={state} />}

        {tab === "game" && (
          <section>
            <div className="hero">
              <h1>Game nhận thưởng</h1>
              <p>Bạn chọn. Auto chỉ khi có API official + daily cap.</p>
            </div>
            {state.games.map((g) => (
              <div className="card" key={g.id} style={{ marginBottom: 12 }}>
                <h3>{g.name}</h3>
                <p>
                  Rủi ro {g.risk} · {g.hasOfficialApi ? <span className="ok">có API</span> : <span className="warn">không API — checklist</span>}{" "}
                  · hôm nay {g.actionsToday}/{g.dailyCap}
                </p>
                <p>{g.summary}</p>
                <ol>
                  {g.playbook.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <label className="check" style={{ border: "none" }}>
                  <input
                    type="checkbox"
                    checked={g.selected}
                    onChange={async (e) => setState(await post({ type: "game", id: g.id, selected: e.target.checked }))}
                  />
                  Chọn game này
                </label>
              </div>
            ))}
          </section>
        )}

        {tab === "research" && (
          <section>
            <div className="hero">
              <h1>Nghiên cứu công khai</h1>
              <p>Tóm tắt allowlist. Không copy-trade video.</p>
            </div>
            {state.research.map((r) => (
              <div className="card" key={r.id} style={{ marginBottom: 10 }}>
                <h3>{r.title}</h3>
                <p>
                  {r.source} · {r.strategy} {r.fomo && <span className="fomo">· FOMO</span>}
                </p>
                <p>{r.summary}</p>
                <a href={r.url} target="_blank" rel="noreferrer">
                  Nguồn
                </a>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

type LiveStatus = {
  liveConfigured: boolean;
  envMode: string;
  accepted: boolean;
  hasKeys: boolean;
  exchange: string;
  maxUsdt: number;
  maxOrderUsdt: number;
};

function CexPanel({ state }: { state: AppState }) {
  const [live, setLive] = useState<LiveStatus | null>(null);
  useEffect(() => {
    fetch("/api/live-status")
      .then((r) => r.json())
      .then(setLive)
      .catch(() => setLive(null));
  }, []);

  return (
    <section>
      <div className="hero">
        <h1>CEX</h1>
        <p>Nút trên web không đặt lệnh thật. Lệnh thật chỉ khi .env live + npm run worker. Xem docs/tien-that-hom-nay.md</p>
      </div>
      <div className="banner warn">
        Tải ví + sàn từ link chính thức, nạp số nhỏ, API tắt Withdraw. Không gửi key/seed cho chat.
      </div>
      <div className="card">
        <h3>Live trên máy này</h3>
        {!live && <p>Đang đọc .env…</p>}
        {live && (
          <p>
            {live.liveConfigured ? (
              <span className="ok">Live thật: đã cấu hình ({live.exchange}, trần lệnh ${live.maxOrderUsdt})</span>
            ) : (
              <span className="warn">
                Chưa live — mode={live.envMode}, accept={live.accepted ? "yes" : "no"}, key={live.hasKeys ? "có" : "chưa"}
              </span>
            )}
          </p>
        )}
        <p className="muted">Cash sổ paper: ${state.paper.cashUsd.toFixed(2)}</p>
        <a href="https://rabby.io" target="_blank" rel="noreferrer">
          Tải Rabby
        </a>
        {" · "}
        <a href="https://www.binance.com" target="_blank" rel="noreferrer">
          Binance
        </a>
        {" · "}
        <a href="https://www.bybit.com" target="_blank" rel="noreferrer">
          Bybit
        </a>
      </div>
    </section>
  );
}
