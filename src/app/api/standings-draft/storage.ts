import type { StandingsDraftRoom } from "@/app/standings-draft/_lib/types";

/**
 * Room storage: in-memory (dev) or Upstash Redis (production).
 * For Vercel production, add Redis from Vercel Marketplace (Upstash Redis)
 * and set env: KV_REST_API_URL, KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN).
 */
const KEY_PREFIX = "sdraft:room:";

const globalForStore = globalThis as unknown as {
  standingsDraftRooms?: Map<string, StandingsDraftRoom>;
};
const memory = globalForStore.standingsDraftRooms ?? new Map<string, StandingsDraftRoom>();
if (!globalForStore.standingsDraftRooms) {
  globalForStore.standingsDraftRooms = memory;
}

let redis: { get: (key: string) => Promise<string | null>; set: (key: string, value: string) => Promise<unknown> } | null = null;

function getRedis(): typeof redis {
  if (redis !== null) return redis;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis");
    redis = new Redis({ url, token }) as typeof redis;
    return redis;
  } catch {
    return null;
  }
}

function roomKey(roomId: string): string {
  return KEY_PREFIX + roomId;
}

export async function storageGet(roomId: string): Promise<StandingsDraftRoom | null> {
  const r = getRedis();
  if (r) {
    const raw = await r.get(roomKey(roomId));
    if (raw == null) return null;
    try {
      if (typeof raw === "string") {
        return JSON.parse(raw) as StandingsDraftRoom;
      }
      return raw as StandingsDraftRoom;
    } catch {
      return null;
    }
  }
  return memory.get(roomId) ?? null;
}

export async function storageSet(room: StandingsDraftRoom): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(roomKey(room.roomId), JSON.stringify(room));
    return;
  }
  memory.set(room.roomId, room);
}
