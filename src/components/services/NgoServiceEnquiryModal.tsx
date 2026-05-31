"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { NgoServiceItem } from "../../app/services/ngo/data";

type ProfileDetails = {
  name: string;
  email: string;
  phone: string;
  firmName: string;
};

type NgoServiceEnquiryModalProps = {
  service: NgoServiceItem | null;
  open: boolean;
  onClose: () => void;
};

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error("Unexpected server response. Please try again.");
  }

  return response.json() as Promise<{
    message?: string;
    enquiry?: unknown;
    user?: {
      name?: string | null;
      email?: string | null;
      mobileNumber?: string | null;
      firmName?: string | null;
    };
  }>;
}

export default function NgoServiceEnquiryModal({ service, open, onClose }: NgoServiceEnquiryModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<ProfileDetails>({
    name: "",
    email: "",
    phone: "",
    firmName: "",
  });
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setAddress("");
    setNote("");
    setMessage("");
    setError("");
  }, []);

  // Do not prefetch profile details. Users should enter details manually.
  useEffect(() => {
    if (!open) return;

    resetForm();
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !service) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    // allow anonymous submissions; backend will create or reuse a profile

    setSubmitting(true);

    try {
      const response = await fetch("/api/ngo-enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            serviceKey: service.id,
            serviceName: service.title,
            address: address.trim(),
            note: note.trim(),
            fullName: profile.name.trim(),
            email: profile.email.trim(),
            phone: profile.phone.trim(),
            firmName: profile.firmName.trim(),
          }),
      });

      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to submit your request.");
      }

      setMessage(payload?.message || "Your request has been submitted successfully.");
      setAddress("");
      setNote("");
      setProfile({ name: "", email: "", phone: "", firmName: "" });
      // Keep the modal open until the user explicitly closes it via the Cancel/Close button
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ngo-enquiry-modal" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="ngo-enquiry-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ngo-enquiry-modal__header">
          <div>
            <p className="ngo-enquiry-modal__eyebrow">Service enquiry</p>
            <h2 id={titleId} className="ngo-enquiry-modal__title">
              {service.title}
            </h2>
          </div>
          <button type="button" className="ngo-enquiry-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="ngo-enquiry-modal__summary">{service.summary}</p>

        <form className="ngo-enquiry-modal__form" onSubmit={handleSubmit}>
          <section className="ngo-enquiry-modal__profile" aria-label="Profile details">
            <h3 className="ngo-enquiry-modal__section-title">Your details</h3>
            <div className="ngo-enquiry-modal__profile-grid">
              <div>
                <label>
                  <dt>Name</dt>
                  <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} required />
                </label>
              </div>
              <div>
                <label>
                  <dt>Email</dt>
                  <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} required />
                </label>
              </div>
              <div>
                <label>
                  <dt>Phone</dt>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} required />
                </label>
              </div>
              <div>
                <label>
                  <dt>Firm / Organization</dt>
                  <input type="text" value={profile.firmName} onChange={(e) => setProfile((p) => ({ ...p, firmName: e.target.value }))} />
                </label>
              </div>
            </div>
          </section>

          <label className="ngo-enquiry-modal__field">
            <span>Address</span>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter your complete address"
              rows={3}
              required
              disabled={submitting}
            />
          </label>

          <label className="ngo-enquiry-modal__field">
            <span>Additional note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Share timelines, documents ready, or specific requirements"
              rows={4}
              disabled={submitting}
            />
          </label>

          {error ? <p className="ngo-enquiry-modal__error">{error}</p> : null}
          {message ? <p className="ngo-enquiry-modal__success">{message}</p> : null}

          <div className="ngo-enquiry-modal__actions">
            <button type="button" className="ngo-enquiry-modal__secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="ngo-enquiry-modal__submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
