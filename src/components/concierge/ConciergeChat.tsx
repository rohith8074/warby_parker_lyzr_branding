"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Glasses,
  X,
  Minus,
  ArrowUp,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  LayoutGrid,
  Sparkles,
  CheckCircle2,
  Ruler,
  Wallet,
} from "lucide-react";
import { DEFAULT_MESSAGES, LYZR_CHAT_URL, LYZR_AGENT_ID, LYZR_USER_ID } from "./constants";
import type { ConciergeConfig, ConciergeMessage } from "./types";

const LYZR_API_KEY =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_LYZR_API_KEY : undefined;

import { PaymentForm } from "./PaymentForm";
import { ShippingForm } from "./ShippingForm";
import "./concierge.css";

function AnimatedDots() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c + 1) % 3), 400);
    return () => clearInterval(id);
  }, []);
  return <span className="concierge-loading-dots">{".".repeat(count + 1)}</span>;
}

const defaultConfig: Omit<Required<ConciergeConfig>, "openRef"> & { openRef?: ConciergeConfig["openRef"] } = {
  title: "Style Advisor",
  placeholder: "Ask about frames, fit, prescriptions...",
  pillLabel: "Style Advisor",
  pillHoverLabel: "Find your perfect pair",
  initialMessage:
    "Welcome to Lyzr eye store. I'm your personal Style Advisor — here to help you find the perfect frames. Tell me about your face shape, lifestyle, or what you're looking for.",
};

interface CatalogItem {
  sku: string;
  product_id: string;
  product_name: string;
  frame_width: string;
  tags: string[];
  unit_price: number;
  image_url: string;
  gallery_images: string[];
  qty: number;
  total_price: number;
  in_stock: boolean;
  product_page: string;
}

interface CatalogOption {
  id: string;
  name: string;
  description: string;
  why_this: string;
  fit_watchout: string;
  total_estimated_cost: number;
  items: CatalogItem[];
}

interface CatalogMeta {
  use_case: string;
  fit_focus: string;
  budget_max: number;
  currency: string;
}

interface ProductCatalogPayload {
  meta: CatalogMeta;
  options: CatalogOption[];
}

interface CatalogRecord {
  id: string;
  label: string;
  data: ProductCatalogPayload;
}

interface SendTextMessageOptions {
  visibleUserText?: string;
  hideUserMessage?: boolean;
}

interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

interface SelectedPackage {
  id: string;
  title: string;
  subtitle: string;
  total: number;
}

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const TRIGGER_TAG = "*[trigger_product_ui]*";
const TRIGGER_SHIPPING_UI = "*[trigger_shipping_ui]*";
const TRIGGER_PAYMENT_UI = "*[trigger_payment_ui]*";

function extractCatalogJson(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const jsonFenceMatch = content.match(/```json\s*([\s\S]*?)```/i);
  if (jsonFenceMatch?.[1]) return jsonFenceMatch[1].trim();

  const triggerEscaped = TRIGGER_TAG.replace(/\*/g, "\\*").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
  const betweenTriggers = content.match(
    new RegExp(`${triggerEscaped}\\s*([\\s\\S]*?)\\s*${triggerEscaped}`, "i")
  );
  if (betweenTriggers?.[1]) {
    const block = betweenTriggers[1].trim();
    const firstBrace = block.indexOf("{");
    if (firstBrace === -1) return null;
    let depth = 0;
    let end = -1;
    for (let i = firstBrace; i < block.length; i++) {
      if (block[i] === "{") depth++;
      else if (block[i] === "}") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    return end >= 0 ? block.slice(firstBrace, end + 1) : null;
  }

  if (!content.includes(TRIGGER_TAG)) return null;
  const afterTrigger = content.split(TRIGGER_TAG).pop()?.trim();
  if (!afterTrigger) return null;
  const firstBrace = afterTrigger.indexOf("{");
  if (firstBrace === -1) return null;
  let depth = 0;
  let end = -1;
  for (let i = firstBrace; i < afterTrigger.length; i++) {
    if (afterTrigger[i] === "{") depth++;
    else if (afterTrigger[i] === "}") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  return end >= 0 ? afterTrigger.slice(firstBrace, end + 1) : null;
}

const parseCatalogPayload = (content: string): ProductCatalogPayload | null => {
  const candidate = extractCatalogJson(content);
  if (!candidate) return null;

  try {
    const parsed = JSON.parse(candidate);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("meta" in parsed) ||
      !("options" in parsed) ||
      !Array.isArray(parsed.options)
    ) return null;

    const rawMeta = parsed.meta as Record<string, unknown>;
    if (!rawMeta || typeof rawMeta !== "object") return null;

    const meta: CatalogMeta = {
      use_case:
        typeof rawMeta.use_case === "string"
          ? rawMeta.use_case
          : typeof rawMeta.occasion === "string"
            ? rawMeta.occasion
            : "Everyday",
      fit_focus: typeof rawMeta.fit_focus === "string" ? rawMeta.fit_focus : "Curated frame mix",
      budget_max: toNumber(rawMeta.budget_max),
      currency: typeof rawMeta.currency === "string" ? rawMeta.currency : "USD",
    };

    const rawOptions = parsed.options as unknown[];
    const normalizedOptions: CatalogOption[] = rawOptions
      .map((rawOption: unknown, index: number) => {
        if (!rawOption || typeof rawOption !== "object") return null;
        const optionObj = rawOption as Record<string, unknown>;

        const rawItems = Array.isArray(optionObj.items)
          ? optionObj.items
          : Array.isArray(optionObj.line_items)
            ? optionObj.line_items
            : [];

        const items: CatalogItem[] = (rawItems as unknown[])
          .map((rawItem: unknown) => {
            if (!rawItem || typeof rawItem !== "object") return null;
            const itemObj = rawItem as Record<string, unknown>;
            const productName = typeof itemObj.product_name === "string" ? itemObj.product_name : "";
            if (!productName) return null;
            return {
              sku:
                typeof itemObj.sku === "string"
                  ? itemObj.sku
                  : typeof itemObj.product_id === "string"
                    ? itemObj.product_id
                    : `${productName}-${index}`,
              product_id: typeof itemObj.product_id === "string" ? itemObj.product_id : "",
              product_name: productName,
              frame_width: typeof itemObj.frame_width === "string" ? itemObj.frame_width : "",
              tags: Array.isArray(itemObj.tags)
                ? itemObj.tags.filter((tag): tag is string => typeof tag === "string")
                : [],
              unit_price: toNumber(itemObj.unit_price),
              image_url:
                typeof itemObj.image_url === "string"
                  ? itemObj.image_url
                  : itemObj.images &&
                      typeof itemObj.images === "object" &&
                      "primary" in itemObj.images &&
                      typeof (itemObj.images as { primary?: unknown }).primary === "string"
                    ? ((itemObj.images as { primary: string }).primary ?? "")
                    : "",
              gallery_images: (() => {
                const images: string[] = [];
                const directImage = typeof itemObj.image_url === "string" ? itemObj.image_url : "";
                if (directImage) images.push(directImage);
                if (itemObj.images && typeof itemObj.images === "object") {
                  const imageObj = itemObj.images as {
                    primary?: unknown;
                    secondary?: unknown;
                    thumbnail?: unknown;
                    tertiary?: unknown;
                  };
                  const candidates = [imageObj.primary, imageObj.secondary, imageObj.thumbnail, imageObj.tertiary];
                  for (const candidate of candidates) {
                    if (typeof candidate === "string" && candidate.trim()) images.push(candidate);
                  }
                }
                return images;
              })(),
              qty: toNumber(itemObj.qty ?? itemObj.quantity) || 1,
              total_price:
                toNumber(itemObj.total_price) ||
                toNumber(itemObj.unit_price) * (toNumber(itemObj.qty ?? itemObj.quantity) || 1),
              in_stock:
                typeof itemObj.in_stock === "boolean"
                  ? itemObj.in_stock
                  : typeof itemObj.in_stock === "string"
                    ? itemObj.in_stock.toLowerCase() !== "false"
                    : true,
              product_page: typeof itemObj.product_page === "string" ? itemObj.product_page : "",
            };
          })
          .filter((item): item is CatalogItem => Boolean(item));

        if (!items.length) return null;

        const optionName =
          typeof optionObj.name === "string"
            ? optionObj.name
            : items[0]?.product_name || `Option ${index + 1}`;
        const fallbackTotal = items.reduce((sum, item) => sum + item.total_price, 0);
        const whyThis = typeof optionObj.why_this === "string" ? optionObj.why_this : "";
        const fitWatchout = typeof optionObj.fit_watchout === "string" ? optionObj.fit_watchout : "";
        const description =
          typeof optionObj.description === "string"
            ? optionObj.description
            : whyThis || "Curated frame selection.";

        return {
          id: typeof optionObj.id === "string" ? optionObj.id : `Option ${index + 1}`,
          name: optionName,
          description,
          why_this: whyThis,
          fit_watchout: fitWatchout,
          total_estimated_cost:
            toNumber(optionObj.total_estimated_cost) || toNumber(optionObj.estimated_total) || fallbackTotal,
          items,
        };
      })
      .filter((option: CatalogOption | null): option is CatalogOption => Boolean(option));

    return normalizedOptions.length ? { meta, options: normalizedOptions } : null;
  } catch {
    return null;
  }
};

const createSessionId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function ConciergeChat(props: ConciergeConfig = {}) {
  const { title, placeholder, pillLabel, pillHoverLabel, initialMessage, openRef } = {
    ...defaultConfig,
    ...props,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ConciergeMessage[]>(() =>
    DEFAULT_MESSAGES.map((m) => (m.id === "1" ? { ...m, content: initialMessage } : m))
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [catalogHistory, setCatalogHistory] = useState<CatalogRecord[]>([]);
  const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);
  const [isCatalogVisible, setIsCatalogVisible] = useState(false);
  const [isShippingVisible, setIsShippingVisible] = useState(false);
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const [hasShippingUiTriggered, setHasShippingUiTriggered] = useState(false);
  const [hasPaymentUiTriggered, setHasPaymentUiTriggered] = useState(false);
  const [showLongWaitStatus, setShowLongWaitStatus] = useState(false);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null);
  const [sessionId, setSessionId] = useState(createSessionId);
  const [expandedCatalogOption, setExpandedCatalogOption] = useState<CatalogOption | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const handledCatalogMessagesRef = useRef<Set<string>>(new Set());
  const handledShippingMessagesRef = useRef<Set<string>>(new Set());
  const handledPaymentMessagesRef = useRef<Set<string>>(new Set());

  const activeCatalog = useMemo(
    () => catalogHistory.find((c) => c.id === activeCatalogId) ?? null,
    [activeCatalogId, catalogHistory]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) { setShowLongWaitStatus(false); return; }
    const timer = window.setTimeout(() => setShowLongWaitStatus(true), 7000);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== "assistant") continue;

      if (msg.content.includes(TRIGGER_SHIPPING_UI) && !handledShippingMessagesRef.current.has(msg.id)) {
        handledShippingMessagesRef.current.add(msg.id);
        setHasShippingUiTriggered(true);
        setIsShippingVisible(true);
        setIsPaymentVisible(false);
        setIsCatalogVisible(false);
      }

      if (msg.content.includes(TRIGGER_PAYMENT_UI) && !handledPaymentMessagesRef.current.has(msg.id)) {
        handledPaymentMessagesRef.current.add(msg.id);
        setHasPaymentUiTriggered(true);
        setIsPaymentVisible(true);
        setIsShippingVisible(false);
        setIsCatalogVisible(false);
      }

      if (handledCatalogMessagesRef.current.has(msg.id)) continue;

      const parsedCatalog = parseCatalogPayload(msg.content);
      if (parsedCatalog) {
        handledCatalogMessagesRef.current.add(msg.id);
        const catalogId = `catalog-${msg.id}`;
        setCatalogHistory((prev) => {
          if (prev.some((c) => c.id === catalogId)) return prev;
          return [
            ...prev,
            {
              id: catalogId,
              label: `${parsedCatalog.meta.use_case} • ${parsedCatalog.meta.fit_focus}`,
              data: parsedCatalog,
            },
          ];
        });
        setActiveCatalogId(catalogId);
        setIsCatalogVisible(true);
        return;
      }
    }
  }, [messages]);

  const openChat = useCallback(() => { setHasStarted(true); setIsOpen(true); }, []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!openRef) return;
    openRef.current = { open: openChat };
    return () => {
      openRef.current = null;
    };
  }, [openRef, openChat]);

  const resetAndClose = useCallback(() => {
    setIsOpen(false);
    setHasStarted(false);
    setCatalogHistory([]);
    setActiveCatalogId(null);
    setExpandedCatalogOption(null);
    setIsCatalogVisible(false);
    setIsShippingVisible(false);
    setIsPaymentVisible(false);
    setHasShippingUiTriggered(false);
    setHasPaymentUiTriggered(false);
    setShowLongWaitStatus(false);
    setShippingDetails(null);
    setSelectedPackage(null);
    handledCatalogMessagesRef.current.clear();
    handledShippingMessagesRef.current.clear();
    handledPaymentMessagesRef.current.clear();
    setSessionId(createSessionId());
    setMessages([{ id: "1", role: "assistant", content: initialMessage }]);
  }, [initialMessage]);

  const resetForNewSession = useCallback(() => {
    setInput("");
    setCatalogHistory([]);
    setActiveCatalogId(null);
    setExpandedCatalogOption(null);
    setIsCatalogVisible(false);
    setIsShippingVisible(false);
    setIsPaymentVisible(false);
    setHasShippingUiTriggered(false);
    setHasPaymentUiTriggered(false);
    setShowLongWaitStatus(false);
    setShippingDetails(null);
    setSelectedPackage(null);
    handledCatalogMessagesRef.current.clear();
    handledShippingMessagesRef.current.clear();
    handledPaymentMessagesRef.current.clear();
    setSessionId(createSessionId());
    setMessages([{ id: "1", role: "assistant", content: initialMessage }]);
  }, [initialMessage]);

  const sendTextMessage = useCallback(
    async (rawText: string, options?: SendTextMessageOptions) => {
      const text = rawText.trim();
      if (!text || isLoading) return;

      if (!options?.hideUserMessage) {
        const userMsg: ConciergeMessage = {
          id: `u-${Date.now()}`,
          role: "user",
          content: options?.visibleUserText ?? text,
        };
        setMessages((m) => [...m, userMsg]);
      }

      setInput("");
      setIsLoading(true);

      try {
        if (!LYZR_API_KEY) {
          setMessages((m) => [
            ...m,
            { id: `a-${Date.now()}`, role: "assistant", content: "Chat is not configured (missing NEXT_PUBLIC_LYZR_API_KEY)." },
          ]);
          setIsLoading(false);
          return;
        }

        const res = await fetch(LYZR_CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": LYZR_API_KEY },
          body: JSON.stringify({
            user_id: LYZR_USER_ID,
            agent_id: LYZR_AGENT_ID,
            session_id: sessionId,
            message: text,
          }),
        });

        const data = await res.json().catch(() => null);
        const replyText =
          data?.response ?? data?.message ?? data?.data?.response ?? data?.data?.message ??
          (typeof data === "string" ? data : null);

        const content =
          res.ok && typeof replyText === "string"
            ? replyText
            : !res.ok && typeof data?.error === "string"
              ? data.error
              : "Sorry, I couldn't get a response. Please try again.";

        setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content }]);
      } catch {
        setMessages((m) => [
          ...m,
          { id: `a-${Date.now()}`, role: "assistant", content: "Something went wrong. Please try again." },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    await sendTextMessage(text);
  }, [input, sendTextMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    },
    [sendMessage]
  );

  const canSend = input.trim().length > 0 && !isLoading;
  const hasCatalog = Boolean(activeCatalog) && isCatalogVisible;
  const hasProductCatalog = catalogHistory.length > 0;

  const loadingStatusMessage = useMemo(() => {
    if (!showLongWaitStatus) return "Thinking";
    if (!hasProductCatalog) return "Searching catalog";
    if (!hasShippingUiTriggered) return "Preparing details";
    if (!hasPaymentUiTriggered) return "Setting up payment";
    return "Almost ready";
  }, [showLongWaitStatus, hasProductCatalog, hasShippingUiTriggered, hasPaymentUiTriggered]);

  const chooseOption = useCallback(
    async (option: CatalogOption) => {
      setExpandedCatalogOption(null);
      const selection = `I choose ${option.id}: ${option.name}. Please proceed with this option.`;
      setSelectedPackage({
        id: option.id,
        title: `${option.id}: ${option.name}`,
        subtitle: `${option.items.length} item${option.items.length === 1 ? "" : "s"} • curated package`,
        total: option.total_estimated_cost,
      });
      setIsCatalogVisible(false);
      await sendTextMessage(selection);
    },
    [sendTextMessage]
  );

  const handleShippingSubmit = useCallback(
    async (data: ShippingDetails) => {
      setIsShippingVisible(false);
      setShippingDetails(data);
      const shippingInfo = `Here are my shipping details:\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nPhone: ${data.phoneNumber}\nAddress: ${data.address.streetAddress}, ${data.address.addressLocality}, ${data.address.addressRegion} ${data.address.postalCode}, ${data.address.addressCountry}`;
      await sendTextMessage(shippingInfo);
    },
    [sendTextMessage]
  );

  const sendPaymentPayload = useCallback(
    async (wallet: "apple_pay" | "google_pay") => {
      setIsPaymentVisible(false);
      const payload =
        wallet === "apple_pay"
          ? { payment: { selected_instrument_id: "temp_inst_1", instruments: [{ id: "temp_inst_1", type: "card", brand: "visa", credential: { type: "payment_token", token: "tok_applepay_debug" } }] } }
          : { payment: { selected_instrument_id: "temp_inst_1", instruments: [{ id: "temp_inst_1", type: "card", brand: "visa", credential: { type: "payment_token", token: "tok_gpay_debug" } }] } };
      await sendTextMessage(JSON.stringify(payload, null, 2), {
        hideUserMessage: false,
        visibleUserText: wallet === "google_pay" ? "Payment confirmed with Google Pay." : "Payment confirmed with Apple Pay.",
      });
    },
    [sendTextMessage]
  );

  const formatAssistantBubble = useCallback((content: string): string => {
    if (content.includes(TRIGGER_PAYMENT_UI)) return "Payment is ready. Use the panel below to complete your order.";
    if (content.includes(TRIGGER_SHIPPING_UI)) return "Almost there! Fill in your shipping details below.";
    if (parseCatalogPayload(content)) return "I pulled together frame options for you. Choose A, B, or C to continue.";
    return content;
  }, []);

  const isExpandedLayout = hasCatalog;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="concierge-animate-backdrop absolute inset-0"
            style={{ background: "rgba(15, 38, 64, 0.45)", backdropFilter: "blur(2px)" }}
            onClick={closeModal}
            aria-hidden
          />

          {/* Modal */}
          <div
            className="concierge-animate-modal relative z-[101] flex flex-col overflow-hidden"
            style={{
              width: isExpandedLayout
                ? "min(980px, calc(100vw - 32px))"
                : isShippingVisible
                  ? "min(520px, calc(100vw - 32px))"
                  : "min(480px, calc(100vw - 32px))",
              maxHeight: "min(680px, 88vh)",
              borderRadius: "18px",
              background: "#FFFFFF",
              border: "1px solid #D0C3B5",
              // boxShadow: "0 2px 4px rgba(26,59,93,0.03), 0 8px 24px rgba(26,59,93,0.08), 0 32px 80px rgba(26,59,93,0.14), 0 0 0 0.5px rgba(26,59,93,0.06)",
              transition: "width 300ms cubic-bezier(0.16,1,0.3,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="wp-modal-header">
              <div className="wp-modal-header-left">
                {/* <div className="wp-header-logo-dot">
                  <Glasses size={15} color="#FFFFFF" strokeWidth={1.75} />
                </div> */}
                <div>
                  <p className="wp-modal-title">{title}</p>
                  <p className="wp-modal-subtitle">Lyzr eye store</p>
                </div>
              </div>

              <div className="wp-header-actions">
                {catalogHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeCatalogId) {
                        setActiveCatalogId(catalogHistory[catalogHistory.length - 1].id);
                        setIsShippingVisible(false);
                        setIsPaymentVisible(false);
                        setIsCatalogVisible(true);
                        return;
                      }
                      setIsShippingVisible(false);
                      setIsPaymentVisible(false);
                      setIsCatalogVisible((prev) => !prev);
                    }}
                    className="wp-catalog-toggle-btn"
                    aria-label="Show catalog"
                  >
                    <LayoutGrid size={13} />
                    Frames ({catalogHistory.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetForNewSession}
                  className="wp-icon-btn"
                  aria-label="New session"
                  title="Start new conversation"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="wp-icon-btn"
                  aria-label="Minimize"
                >
                  <Minus size={14} />
                </button>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="wp-icon-btn"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
              {/* ─── Expanded: Frame options takeover ─── */}
              {isExpandedLayout ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                  <CatalogPane
                    activeCatalog={activeCatalog!}
                    catalogHistory={catalogHistory}
                    activeCatalogId={activeCatalogId}
                    expandedOption={expandedCatalogOption}
                    isLoading={isLoading}
                    onChooseOption={chooseOption}
                    onExpandOption={setExpandedCatalogOption}
                    onCloseExpanded={() => setExpandedCatalogOption(null)}
                    onChangeCatalog={(id) => {
                      setActiveCatalogId(id);
                      setIsCatalogVisible(true);
                    }}
                    onBackToChat={() => setIsCatalogVisible(false)}
                  />
                </div>
              ) : isShippingVisible ? (
                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                  <ShippingForm
                    onSubmit={handleShippingSubmit}
                    onCancel={() => setIsShippingVisible(false)}
                  />
                </div>
              ) : (
                /* Chat only */
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <ChatMessages
                    messages={messages}
                    isLoading={isLoading}
                    loadingStatusMessage={loadingStatusMessage}
                    formatAssistantBubble={formatAssistantBubble}
                    bottomRef={bottomRef}
                  />
                  <ChatInputRow
                    input={input}
                    canSend={canSend}
                    placeholder={placeholder}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onSend={sendMessage}
                  />
                </div>
              )}
            </div>

            {/* Payment overlay */}
            {isPaymentVisible && (
              <div className="concierge-payment-overlay">
                <PaymentForm
                  onConfirm={sendPaymentPayload}
                  onClose={() => setIsPaymentVisible(false)}
                  packageTitle={selectedPackage?.title}
                  packageSubtitle={selectedPackage?.subtitle}
                  packageTotal={selectedPackage?.total}
                  shippingName={shippingDetails ? `${shippingDetails.firstName} ${shippingDetails.lastName}` : undefined}
                  shippingAddress={
                    shippingDetails
                      ? `${shippingDetails.address.streetAddress}, ${shippingDetails.address.addressLocality}, ${shippingDetails.address.addressRegion} ${shippingDetails.address.postalCode}, ${shippingDetails.address.addressCountry}`
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <div className="concierge-animate-float fixed bottom-6 right-6 z-[101]">
          <button
            type="button"
            onClick={openChat}
            className="concierge-pill-apple group flex h-[52px] cursor-pointer items-center gap-3 rounded-full pl-5 pr-6 transition-all duration-200"
            aria-label={`Open ${title}`}
          >
            {hasStarted ? (
              <>
                <MessageCircle
                  size={18}
                  color="#FFFFFF"
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110"
                />
                <span
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "0.95rem",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {pillLabel}
                </span>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#7B4A24",
                    display: "inline-block",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.3)",
                  }}
                  aria-hidden
                />
              </>
            ) : (
              <>
                <Sparkles
                  size={16}
                  color="#A65A2C"
                  strokeWidth={1.75}
                  className="concierge-animate-sparkle transition-transform duration-300"
                />
                <span
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "0.95rem",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {pillLabel}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.6)",
                    maxWidth: 0,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    opacity: 0,
                    transition: "max-width 300ms ease, opacity 300ms ease",
                  }}
                  className="group-hover:[max-width:120px] group-hover:opacity-100"
                >
                  {pillHoverLabel}
                </span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}

/* ── Sub-components ── */

function ChatMessages({
  messages,
  isLoading,
  loadingStatusMessage,
  formatAssistantBubble,
  bottomRef,
}: {
  messages: ConciergeMessage[];
  isLoading: boolean;
  loadingStatusMessage: string;
  formatAssistantBubble: (content: string) => string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="wp-chat-pane">
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className="concierge-animate-message flex"
          style={{
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            animationDelay: `${i * 30}ms`,
          }}
        >
          {msg.role === "assistant" ? (
            <div className="wp-bubble-assistant">
              {formatAssistantBubble(msg.content)}
            </div>
          ) : (
            <div className="wp-bubble-user">{msg.content}</div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="concierge-animate-message flex justify-start">
          <div className="wp-bubble-assistant concierge-loading-status">
            {loadingStatusMessage}
            <AnimatedDots />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function ChatInputRow({
  input,
  canSend,
  placeholder,
  onChange,
  onKeyDown,
  onSend,
}: {
  input: string;
  canSend: boolean;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
}) {
  return (
    <div className="wp-input-row">
      <div className="wp-input-shell">
        <input
          value={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="wp-input-field"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!canSend}
          className="wp-send-btn"
          aria-label="Send"
        >
          <ArrowUp size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function CatalogPane({
  activeCatalog,
  catalogHistory,
  activeCatalogId,
  expandedOption,
  isLoading,
  onChooseOption,
  onExpandOption,
  onCloseExpanded,
  onChangeCatalog,
  onBackToChat,
}: {
  activeCatalog: { id: string; label: string; data: ProductCatalogPayload };
  catalogHistory: CatalogRecord[];
  activeCatalogId: string | null;
  expandedOption: CatalogOption | null;
  isLoading: boolean;
  onChooseOption: (option: CatalogOption) => Promise<void>;
  onExpandOption: (option: CatalogOption | null) => void;
  onCloseExpanded: () => void;
  onChangeCatalog: (id: string) => void;
  onBackToChat: () => void;
}) {
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: activeCatalog.data.meta.currency || "USD",
        maximumFractionDigits: 0,
      }),
    [activeCatalog.data.meta.currency]
  );

  if (expandedOption) {
    const option = expandedOption;
    const heroImage = option.items[0]?.image_url || option.items[0]?.gallery_images?.[0];
    const allImages = option.items[0]?.gallery_images?.length
      ? option.items[0].gallery_images
      : heroImage ? [heroImage] : [];

    return (
      <div className="wp-catalog-stage wp-catalog-stage-detail">
        <div className="wp-catalog-detail-card">
          <button
            type="button"
            className="wp-catalog-detail-back"
            onClick={onCloseExpanded}
            aria-label="Back to options"
          >
            <ArrowLeft size={18} strokeWidth={2} />
            Back to options
          </button>

          <div className="wp-catalog-detail-body">
            <div className="wp-catalog-detail-media">
              <div className="wp-catalog-detail-hero">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={option.items[0]?.product_name ?? option.name}
                    fill
                    sizes="(max-width: 860px) 100vw, 50vw"
                    className="wp-catalog-detail-hero-image"
                  />
                ) : (
                  <div className="wp-catalog-detail-hero-fallback" />
                )}
              </div>
              {allImages.length > 1 && (
                <div className="wp-catalog-detail-thumbs">
                  {allImages.slice(0, 4).map((src, i) => (
                    <div key={`${option.id}-thumb-${i}`} className="wp-catalog-detail-thumb">
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="80px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="wp-catalog-detail-copy">
              <p className="wp-catalog-detail-tag">{option.id}</p>
              <h2 className="wp-catalog-detail-title">{option.name}</h2>
              {option.items[0] && (
                <div className="wp-catalog-detail-fit-row">
                  <span className="wp-catalog-fit-pill">
                    Fit: {option.items[0].frame_width || "Standard"}
                  </span>
                  {option.items[0].tags.map((tag) => (
                    <span key={`${option.id}-${tag}`} className="wp-catalog-fit-pill wp-catalog-fit-pill-soft">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(option.why_this || option.description) && (
                <div className="wp-catalog-detail-block">
                  <h4 className="wp-catalog-detail-label">Why this frame</h4>
                  <p className="wp-catalog-detail-text">{option.why_this || option.description}</p>
                </div>
              )}
              {option.fit_watchout && (
                <div className="wp-catalog-detail-block wp-catalog-detail-fit-tip">
                  <CheckCircle2 size={16} />
                  <p className="wp-catalog-detail-text">{option.fit_watchout}</p>
                </div>
              )}
              <div className="wp-catalog-detail-actions">
                <div className="wp-catalog-detail-price-row">
                  <span className="wp-catalog-price-label">Starting at</span>
                  <span className="wp-catalog-detail-price">{formatter.format(option.total_estimated_cost)}</span>
                </div>
                <button
                  type="button"
                  className="wp-catalog-detail-cta"
                  onClick={() => onChooseOption(option)}
                  disabled={isLoading}
                >
                  Choose this frame
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wp-catalog-stage">
      {/* Compact horizontal header */}
      <div className="wp-catalog-header-bar">
        <div className="wp-catalog-header-left">
          <span className="wp-catalog-eyebrow-inline">Frame Selection</span>
          <span className="wp-catalog-title-inline">{activeCatalog.data.meta.use_case}</span>
          <span className="wp-catalog-meta-pill">
            <Ruler size={10} />
            {activeCatalog.data.meta.fit_focus}
          </span>
          {activeCatalog.data.meta.budget_max > 0 && (
            <span className="wp-catalog-meta-pill">
              <Wallet size={10} />
              Budget max {formatter.format(activeCatalog.data.meta.budget_max)}
            </span>
          )}
        </div>
        <div className="wp-catalog-header-right">
          {catalogHistory.length > 1 && (
            <>
              <label htmlFor="catalog-picker" className="wp-catalog-saved-label">Saved</label>
              <select
                id="catalog-picker"
                value={activeCatalogId ?? ""}
                onChange={(e) => onChangeCatalog(e.target.value)}
                className="wp-catalog-select"
              >
                {catalogHistory.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </>
          )}
          <button type="button" className="wp-catalog-chat-btn" onClick={onBackToChat}>
            Back to chat
          </button>
        </div>
      </div>

      {/* Options grid */}
      <div className="wp-catalog-grid">
        {activeCatalog.data.options.map((option, idx) => (
          <button
            type="button"
            key={`${option.id}-${idx}`}
            className="wp-catalog-card"
            style={{ animationDelay: `${idx * 70}ms` }}
            onClick={() => onExpandOption(option)}
            disabled={isLoading}
          >
            {option.items[0] &&
              (() => {
                const heroImage = option.items[0].image_url || option.items[0].gallery_images[0];
                if (!heroImage) return null;
                const hoverImages = option.items[0].gallery_images.slice(1, 3);
                while (hoverImages.length < 2) hoverImages.push(heroImage);
                return (
                  <div className="wp-catalog-card-media">
                    <div className="wp-catalog-main-shot">
                      <Image
                        src={heroImage}
                        alt={option.items[0].product_name}
                        fill
                        sizes="(max-width: 860px) 100vw, 33vw"
                        className="wp-catalog-main-image"
                      />
                      <div className="wp-catalog-main-overlay">
                        <span className="wp-catalog-fit-chip">
                          {option.items[0].frame_width || "Standard fit"}
                        </span>
                      </div>
                    </div>
                    <div className="wp-catalog-hover-gallery">
                      {hoverImages.map((src, imageIdx) => (
                        <div key={`${option.id}-${src}-${imageIdx}`} className="wp-catalog-alt-shot">
                          <Image
                            src={src}
                            alt={`${option.items[0].product_name} alternate view ${imageIdx + 1}`}
                            fill
                            sizes="(max-width: 860px) 50vw, 15vw"
                            className="wp-catalog-alt-image"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

            <div>
              <p className="wp-catalog-card-tag">{option.id}</p>
              <h4 className="wp-catalog-card-title">{option.name}</h4>
              {option.items[0] && (
                <div className="wp-catalog-fit-row">
                  <span className="wp-catalog-fit-pill">
                    Fit: {option.items[0].frame_width || "Standard"}
                  </span>
                  {option.items[0].tags.slice(0, 1).map((tag) => (
                    <span key={`${option.id}-${tag}`} className="wp-catalog-fit-pill wp-catalog-fit-pill-soft">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="wp-catalog-card-desc">{option.why_this || option.description}</p>
            </div>

            {option.fit_watchout && (
              <p className="wp-catalog-fit-watchout">
                <CheckCircle2 size={13} />
                <span>{option.fit_watchout}</span>
              </p>
            )}

            <div className="wp-catalog-price-row">
              <span className="wp-catalog-price-label">Starting at</span>
              <span className="wp-catalog-price-value">{formatter.format(option.total_estimated_cost)}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="wp-catalog-safety">Click a card to see more details, then choose your frame to continue.</p>
    </div>
  );
}

interface ProductCatalogPayload {
  meta: CatalogMeta;
  options: CatalogOption[];
}
