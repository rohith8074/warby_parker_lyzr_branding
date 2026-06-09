"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import "./concierge.css";

interface PaymentFormProps {
  onConfirm: (wallet: "apple_pay" | "google_pay") => Promise<void>;
  onClose: () => void;
  packageTitle?: string;
  packageSubtitle?: string;
  packageTotal?: number;
  shippingName?: string;
  shippingAddress?: string;
}

export function PaymentForm({
  onConfirm,
  onClose,
  packageTitle,
  packageSubtitle,
  packageTotal,
  shippingName,
  shippingAddress,
}: PaymentFormProps) {
  const [selectedWallet, setSelectedWallet] = useState<"apple_pay" | "google_pay" | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const isReviewStep = selectedWallet !== null;
  const walletLabel = selectedWallet === "google_pay" ? "Google Pay" : "Apple Pay";
  const orderTotal = typeof packageTotal === "number" ? `$${packageTotal.toFixed(2)}` : "$289.73";

  const handleConfirm = async () => {
    if (!selectedWallet || isCompleting) return;
    setIsCompleting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await onConfirm(selectedWallet);
  };

  return (
    <section
      className="concierge-payment-sheet"
      aria-label="Payment options"
      style={{ width: "100%" }}
    >
      {/* Sheet header */}
      <div className="concierge-payment-sheet-head">
        {isReviewStep ? (
          <button
            type="button"
            onClick={() => setSelectedWallet(null)}
            className="concierge-payment-icon-btn"
            aria-label="Back"
            disabled={isCompleting}
          >
            <ChevronLeft size={15} />
          </button>
        ) : (
          <div style={{ width: "30px", height: "30px" }} />
        )}

        <p className="concierge-payment-head-title">
          {isReviewStep ? `Review · ${walletLabel}` : "Complete your order"}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="concierge-payment-icon-btn"
          aria-label="Close payment panel"
          disabled={isCompleting}
        >
          <X size={14} />
        </button>
      </div>

      {/* Choose payment */}
      {!isReviewStep ? (
        <div className="concierge-payment-chooser">
          <p
            style={{
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: "0.72rem",
              color: "#9C968F",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "4px",
            }}
          >
            Choose a payment method
          </p>

          <button
            type="button"
            onClick={() => setSelectedWallet("apple_pay")}
            className="concierge-wallet-choice concierge-wallet-choice-apple"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt=""
              className="concierge-apple-logo"
              width={18}
              height={22}
            />
            <span className="concierge-applepay-wordmark"> Pay</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedWallet("google_pay")}
            className="concierge-wallet-choice concierge-wallet-choice-google"
          >
            <span className="concierge-gpay-wordmark">
              Buy with <span className="concierge-gpay-g">G</span> Pay
            </span>
          </button>

          {/* Order summary preview */}
          <div
            style={{
              borderRadius: "8px",
              border: "1px solid #E2DDD6",
              background: "#FAF9F7",
              padding: "10px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "4px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#1A3B5D",
                }}
              >
                {packageTitle ?? "Selected package"}
              </p>
              <p
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: "0.68rem",
                  color: "#9C968F",
                  marginTop: "1px",
                }}
              >
                {packageSubtitle ?? "1 package"}
              </p>
            </div>
            <p
              style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: "1.05rem",
                color: "#1A3B5D",
                letterSpacing: "-0.02em",
              }}
            >
              {orderTotal}
            </p>
          </div>
        </div>
      ) : (
        /* Review step */
        <div className="concierge-payment-review">
          <h3 className="concierge-payment-review-title">Review your order</h3>

          <div className="concierge-gpay-card">
            <div className="concierge-gpay-row">
              <div className="concierge-gpay-thumb" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="concierge-gpay-line-strong">{packageTitle ?? "Selected package"}</p>
                <p className="concierge-gpay-line-sub">{packageSubtitle ?? "1 package · priority prep"}</p>
              </div>
              <p className="concierge-gpay-line-strong">{orderTotal}</p>
            </div>

            <div className="concierge-gpay-row">
              <CreditCard size={15} color="#6B6560" strokeWidth={1.75} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="concierge-gpay-line-strong">
                  {selectedWallet === "google_pay" ? "Google Pay Visa •••• 1234" : "Apple Pay Visa •••• 1234"}
                </p>
                <p className="concierge-gpay-line-sub">Secure tokenized payment</p>
              </div>
              <ChevronRight size={14} color="#9C968F" />
            </div>

            <div className="concierge-gpay-row">
              <MapPin size={15} color="#6B6560" strokeWidth={1.75} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="concierge-gpay-line-strong">{shippingName ?? "Shipping address"}</p>
                <p className="concierge-gpay-line-sub">
                  {shippingAddress ?? "Address on file from shipping details"}
                </p>
              </div>
              <ChevronRight size={14} color="#9C968F" />
            </div>

            <div className="concierge-gpay-row">
              <Truck size={15} color="#6B6560" strokeWidth={1.75} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="concierge-gpay-line-strong">Free Shipping</p>
                <p className="concierge-gpay-line-sub">Priority overnight delivery</p>
              </div>
              <ChevronRight size={14} color="#9C968F" />
            </div>
          </div>

          <div className="concierge-gpay-footer">
            <p className="concierge-gpay-payto">
              <span style={{ fontFamily: '"DM Sans", system-ui, sans-serif', fontSize: "0.82rem", color: "#6B6560" }}>
                Total due
              </span>
              <span>{orderTotal}</span>
            </p>

            <button
              type="button"
              onClick={handleConfirm}
              className={`concierge-gpay-confirm ${
                selectedWallet === "google_pay"
                  ? "concierge-gpay-confirm-google"
                  : "concierge-gpay-confirm-apple"
              }`}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <span className="concierge-payment-done">
                  <CheckCircle2 size={16} />
                  Order placed!
                </span>
              ) : selectedWallet === "google_pay" ? (
                <span className="concierge-gpay-wordmark">
                  Buy with <span className="concierge-gpay-g">G</span> Pay
                </span>
              ) : (
                <>
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                    alt=""
                    className="concierge-apple-logo"
                    width={18}
                    height={22}
                  />
                  <span className="concierge-applepay-wordmark"> Pay</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
