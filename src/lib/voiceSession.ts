import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface VoiceSessionData {
  unlockedTokens?: string[];
}

export const voiceSessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "anikalsin_voice_session",
  ttl: 60 * 60 * 24 * 30,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export async function getVoiceSession() {
  return getIronSession<VoiceSessionData>(await cookies(), voiceSessionOptions);
}
