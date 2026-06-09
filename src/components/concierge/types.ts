import type { MutableRefObject } from "react";

export interface ConciergeMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ConciergeConfig {
  title?: string;
  placeholder?: string;
  pillLabel?: string;
  pillHoverLabel?: string;
  initialMessage?: string;
  /** Optional ref to open the chat from outside (e.g. "Start with a quiz" button). */
  openRef?: MutableRefObject<{ open: () => void } | null>;
}
