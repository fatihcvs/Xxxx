import { cookies } from "next/headers";

/**
 * One-shot feedback line ("flash") shown at the top of the next rendered page.
 * Server actions store an i18n key + params in a short-lived cookie; the game
 * layout reads it and renders the translated line. The cookie expires on its
 * own, so nothing needs to clear it.
 */

const COOKIE = "fw_flash";
const TTL_SECONDS = 8;

export interface FlashMessage {
  key: string;
  params?: Record<string, string | number>;
}

/** Set the feedback line for the next page render (call from server actions). */
export async function setFlash(key: string, params?: Record<string, string | number>): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify({ key, params } satisfies FlashMessage), {
    maxAge: TTL_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

/** Read the pending feedback line, if any (call from the layout). */
export async function readFlash(): Promise<FlashMessage | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as FlashMessage;
    return typeof parsed.key === "string" ? parsed : null;
  } catch {
    return null;
  }
}
