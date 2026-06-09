"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import "./concierge.css";

interface ShippingFormData {
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

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void;
  onCancel: () => void;
}

export function ShippingForm({ onSubmit, onCancel }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: {
      streetAddress: "",
      addressLocality: "",
      addressRegion: "",
      postalCode: "",
      addressCountry: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      style={{
        padding: "24px 28px 28px",
        background: "#FAF9F7",
        minHeight: "100%",
        fontFamily: '"DM Sans", system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "22px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#EDF3F8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <MapPin size={16} color="#1A3B5D" strokeWidth={1.75} />
        </div>
        <div>
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#2D7D6F",
              fontWeight: 600,
              marginBottom: "3px",
            }}
          >
            Shipping
          </p>
          <h3
            style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: "1.4rem",
              fontWeight: 400,
              color: "#1A3B5D",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Where shall we ship?
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#6B6560", marginTop: "4px", lineHeight: 1.5 }}>
            Enter your delivery address and we&apos;ll get your frames on their way.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} autoComplete="on">
        {/* Name row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label htmlFor="firstName" className="concierge-form-label">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="shipping given-name"
              required
              className="concierge-form-input"
              placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="concierge-form-label">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="shipping family-name"
              required
              className="concierge-form-input"
              placeholder="Smith"
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="email" className="concierge-form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="shipping email"
            required
            className="concierge-form-input"
            placeholder="jane@example.com"
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="phoneNumber" className="concierge-form-label">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            autoComplete="shipping tel"
            required
            className="concierge-form-input"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid #E2DDD6",
            margin: "16px 0",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#9C968F",
              marginTop: "-1px",
              paddingTop: "8px",
              fontWeight: 600,
            }}
          >
            Delivery Address
          </span>
        </div>

        {/* Street */}
        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="streetAddress" className="concierge-form-label">Street Address</label>
          <input
            type="text"
            id="streetAddress"
            name="address.streetAddress"
            value={formData.address.streetAddress}
            onChange={handleChange}
            autoComplete="shipping street-address"
            required
            className="concierge-form-input"
            placeholder="123 Main Street, Apt 4B"
          />
        </div>

        {/* City / State */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>
            <label htmlFor="addressLocality" className="concierge-form-label">City</label>
            <input
              type="text"
              id="addressLocality"
              name="address.addressLocality"
              value={formData.address.addressLocality}
              onChange={handleChange}
              autoComplete="shipping address-level2"
              required
              className="concierge-form-input"
              placeholder="New York"
            />
          </div>
          <div>
            <label htmlFor="addressRegion" className="concierge-form-label">State / Region</label>
            <input
              type="text"
              id="addressRegion"
              name="address.addressRegion"
              value={formData.address.addressRegion}
              onChange={handleChange}
              autoComplete="shipping address-level1"
              required
              className="concierge-form-input"
              placeholder="NY"
            />
          </div>
        </div>

        {/* Postal / Country */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
          <div>
            <label htmlFor="postalCode" className="concierge-form-label">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="address.postalCode"
              value={formData.address.postalCode}
              onChange={handleChange}
              autoComplete="shipping postal-code"
              required
              className="concierge-form-input"
              placeholder="10001"
            />
          </div>
          <div>
            <label htmlFor="addressCountry" className="concierge-form-label">Country</label>
            <input
              type="text"
              id="addressCountry"
              name="address.addressCountry"
              value={formData.address.addressCountry}
              onChange={handleChange}
              autoComplete="shipping country"
              required
              className="concierge-form-input"
              placeholder="United States"
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px" }}>
          <button type="button" onClick={onCancel} className="concierge-form-button-secondary">
            Cancel
          </button>
          <button type="submit" className="concierge-form-button-primary">
            Confirm Shipping
          </button>
        </div>
      </form>
    </div>
  );
}
