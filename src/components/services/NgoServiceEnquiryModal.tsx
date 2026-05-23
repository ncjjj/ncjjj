"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
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
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated" && Boolean(session?.user?.id);

  const [profile, setProfile] = useState<ProfileDetails>({
    name: "",
    email: "",
    phone: "",
    firmName: "",
  });
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setAddress("");
    setNote("");
    setMessage("");
    setError("");
  }, []);

  const loadProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        phone: session?.user?.mobileNumber || "",
        firmName: "",
      });
      return;
    }

    setLoadingProfile(true);

    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load profile.");
      }

      setProfile({
        name: payload.user?.name || session.user?.name || "",
        email: payload.user?.email || session.user?.email || "",
        phone: payload.user?.mobileNumber || session.user?.mobileNumber || "",
        firmName: payload.user?.firmName || "",
      });
    } catch {
      setProfile({
        name: session.user?.name || "",
        email: session.user?.email || "",
        phone: session.user?.mobileNumber || "",
        firmName: "",
      });
    } finally {
      setLoadingProfile(false);
    }
  }, [session?.user?.email, session?.user?.id, session?.user?.mobileNumber, session?.user?.name]);

  useEffect(() => {
    if (!open) {
      return;
    }

    resetForm();
    loadProfile();
  }, [loadProfile, open, resetForm]);

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

  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || "/services/ngo")}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isAuthenticated) {
      setError("Please sign in to submit your request.");
      return;
    }

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
        }),
      });

      const payload = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to submit your request.");
      }

      setMessage(payload?.message || "Your request has been submitted successfully.");
      setAddress("");
      setNote("");
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

        {!isAuthenticated ? (
          <div className="ngo-enquiry-modal__auth">
            <p>Sign in so we can pre-fill your profile details and submit this request.</p>
            <Link href={loginHref} className="ngo-enquiry-modal__login-link">
              Sign in to continue
            </Link>
          </div>
        ) : null}

        <form className="ngo-enquiry-modal__form" onSubmit={handleSubmit}>
          <section className="ngo-enquiry-modal__profile" aria-label="Profile details">
            <h3 className="ngo-enquiry-modal__section-title">Your profile</h3>
            {loadingProfile ? (
              <p className="ngo-enquiry-modal__hint">Loading profile details...</p>
            ) : (
              <dl className="ngo-enquiry-modal__profile-grid">
                <div>
                  <dt>Name</dt>
                  <dd>{profile.name || "—"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{profile.email || "—"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{profile.phone || "—"}</dd>
                </div>
                <div>
                  <dt>Firm / Organization</dt>
                  <dd>{profile.firmName || "—"}</dd>
                </div>
              </dl>
            )}
          </section>

          <label className="ngo-enquiry-modal__field">
            <span>Address</span>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Enter your complete address"
              rows={3}
              required
              disabled={!isAuthenticated || submitting}
            />
          </label>

          <label className="ngo-enquiry-modal__field">
            <span>Additional note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Share timelines, documents ready, or specific requirements"
              rows={4}
              disabled={!isAuthenticated || submitting}
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
              disabled={!isAuthenticated || submitting || loadingProfile}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
