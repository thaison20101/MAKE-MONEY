import { afterEach, describe, expect, it } from "vitest";
import { capOrderUsdt, isLiveConfigured, toUsdtMarket } from "./live-config";

afterEach(() => {
  delete process.env.TRADING_MODE;
  delete process.env.I_ACCEPT_LIVE_TRADING;
  delete process.env.CEX_API_KEY;
  delete process.env.CEX_API_SECRET;
});

describe("live config", () => {
  it("map symbol sang cặp USDT", () => {
    expect(toUsdtMarket("pepe")).toBe("PEPE/USDT");
    expect(toUsdtMarket("WIF/USDT")).toBe("WIF/USDT");
  });

  it("không live khi thiếu env", () => {
    delete process.env.TRADING_MODE;
    delete process.env.I_ACCEPT_LIVE_TRADING;
    delete process.env.CEX_API_KEY;
    expect(isLiveConfigured()).toBe(false);
  });

  it("live chỉ khi mode + accept + key", () => {
    process.env.TRADING_MODE = "live";
    process.env.I_ACCEPT_LIVE_TRADING = "yes";
    process.env.CEX_API_KEY = "k";
    process.env.CEX_API_SECRET = "s";
    expect(isLiveConfigured()).toBe(true);
    process.env.TRADING_MODE = "paper";
    expect(isLiveConfigured()).toBe(false);
  });

  it("trần lệnh và min notional", () => {
    expect(capOrderUsdt(100, { maxOrder: 12, minOrder: 6, cash: 40 })).toBe(12);
    expect(capOrderUsdt(3, { maxOrder: 12, minOrder: 6, cash: 40 })).toBe(0);
    expect(capOrderUsdt(10, { maxOrder: 12, minOrder: 6, cash: 4 })).toBe(0);
  });
});
