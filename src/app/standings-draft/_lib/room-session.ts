const SESSION_KEY = "standings-draft-current";

export interface SavedRoomSession {
  roomId: string;
  playerId: string;
  playerName: string;
}

export function saveRoomSession(
  roomId: string,
  playerId: string,
  playerName: string
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ roomId, playerId, playerName })
    );
  } catch {
    // ignore
  }
}

export function getRoomSession(): SavedRoomSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedRoomSession;
    if (!data.roomId || !data.playerId || !data.playerName) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearRoomSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
