import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInitialState } from "./seed";
import type { AppState } from "./types";

const DATA_PATH = join(process.cwd(), "data", "app-state.json");

function ensureDir() {
  mkdirSync(dirname(DATA_PATH), { recursive: true });
}

export function loadState(): AppState {
  ensureDir();
  if (!existsSync(DATA_PATH)) {
    const fresh = createInitialState(Number(process.env.PAPER_CASH_USD || 1000));
    writeFileSync(DATA_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  const parsed = JSON.parse(readFileSync(DATA_PATH, "utf8")) as AppState;
  return parsed;
}

export function saveState(state: AppState): AppState {
  ensureDir();
  writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
  return state;
}

export function updateState(mutator: (state: AppState) => AppState): AppState {
  const next = mutator(loadState());
  return saveState(next);
}

export function resetState(): AppState {
  const fresh = createInitialState(Number(process.env.PAPER_CASH_USD || 1000));
  return saveState(fresh);
}
