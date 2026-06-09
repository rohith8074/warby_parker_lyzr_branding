import type { ConciergeMessage } from "./types";

/** Lyzr chat API – called from the client (ConciergeChat). */
export const LYZR_CHAT_URL =
  "https://agent-prod.studio.lyzr.ai/v3/inference/chat/";
export const LYZR_AGENT_ID = "69958a5d52ed9064d46e1e84";
export const LYZR_SESSION_ID = "69958a5d52ed9064d46e1e84-f2vc66jxkha";
export const LYZR_USER_ID = "mudit@lyzr.ai";

export const DEFAULT_INITIAL_MESSAGE: ConciergeMessage = {
  id: "1",
  role: "assistant",
  content:
    "Hello! Welcome to the Concierge. How can I help you plan your event today?",
};

export const DEFAULT_MESSAGES: ConciergeMessage[] = [DEFAULT_INITIAL_MESSAGE];
