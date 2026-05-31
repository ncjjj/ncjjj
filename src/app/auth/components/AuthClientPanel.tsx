"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import PasswordInput from "../../../components/common/PasswordInput";
import styles from "../AuthPage.module.css";

const initialLogin = {
  email: "",
  password: "",
};

type AuthMode = "login" | "reset" | "resetVerify";

type AuthMessage = {
  type: "" | "error" | "success";
  text: string;
};

type PasswordCriteria = {
  length: boolean;
  uppercase: boolean;
  number: boolean;
  symbol: boolean;
};

type AuthClientPanelProps = {
  initialMode?: AuthMode;
};

function getPasswordCriteria(password: string): PasswordCriteria {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export default function AuthClientPanel({ initialMode = "login" }: AuthClientPanelProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<AuthMessage>({ type: "", text: "" });
  const [nextRoute, setNextRoute] = useState("");

  const resetPasswordCriteria = getPasswordCriteria(newPassword);

  const setError = (text: string) => setMessage({ type: "error", text });
  const setSuccess = (text: string) => setMessage({ type: "success", text });

  if (status === "authenticated" && session?.user) {
    return (
      <section className={styles.authPage}>
        <div className={styles.shell}>
          <div className={styles.showcase}>
            <span className={styles.badge}>Welcome Back</span>
            <h1>You are already signed in.</h1>
            <p>
              You can continue exploring services or open your dashboard.
            </p>
          </div>
          <div className={styles.formWrap}>
            <p className={`${styles.message} ${styles.success}`}>
              Logged in as {session.user.email}
            </p>
            <div className={styles.form}>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={() => router.push("/dashboard/profile")}
              >
                Go to Profile Settings
              </button>
              <p className={styles.helper}>
                Or return to <Link href="/">Home</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    setNextRoute("");

    try {
      const result = await signIn("credentials", {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      router.replace("/dashboard/profile");
      router.refresh();
    } catch {
      setError("Unable to login right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onRequestPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = resetEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your registered email.");
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.message || "Unable to request password reset.");
        return;
      }

      setSuccess("OTP has been sent to your registered email.");
      setMode("resetVerify");
    } catch {
      setError("Unable to request password reset right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const onConfirmPasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = resetEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your registered email.");
      return;
    }

    if (!resetCode.trim()) {
      setError("Please enter the OTP code.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/confirm-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          otp: resetCode.trim(),
          newPassword,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.message || "Unable to reset password.");
        return;
      }

      setSuccess("Password updated successfully. Please log in with your new password.");
      setMode("login");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      setError("Unable to reset password right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.authPage}>
      <div className={styles.shell}>
        <div className={styles.showcase}>
          <span className={styles.badge}>Secure Access</span>
          <h1>Login or Create Your NCJ Account</h1>
          <p>
            Track your enquiries, auto-fill forms, and keep your consultation
            details connected across pages.
          </p>
          <ul className={styles.featureList}>
            <li>
              <span>1</span>
              Admin-created credentials only
            </li>
            <li>
              <span>2</span>
              Enquiry forms stay manual and user-driven
            </li>
            <li>
              <span>3</span>
              Session persists while you browse
            </li>
          </ul>
        </div>

        <div className={styles.formWrap}>
          {mode === "login" ? (
            <form className={styles.form} onSubmit={onLogin}>
              <div className={styles.field}>
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>
              <PasswordInput
                id="login-password"
                label="Password"
                value={loginForm.password}
                onChange={(value) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    password: value,
                  }))
                }
                required
                autoComplete="current-password"
                className={styles.passwordRow}
                inputClassName={styles.passwordInput}
                buttonClassName={styles.passwordToggle}
              />
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? "Please wait..." : "Login"}
              </button>
              {message.text ? (
                <p
                  className={`${styles.message} ${
                    message.type === "error" ? styles.error : styles.success
                  }`}
                >
                  {message.text}
                </p>
              ) : null}
              <p className={styles.helper}>
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => {
                    setMode("reset");
                    setMessage({ type: "", text: "" });
                    setNextRoute("");
                  }}
                >
                  Change Password
                </button>
              </p>
            </form>
          ) : mode === "reset" ? (
            <form className={styles.form} onSubmit={onRequestPasswordReset}>
              <h2>Change Password</h2>
              <div className={styles.field}>
                <label htmlFor="reset-email">Registered Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? "Please wait..." : "Request OTP to Change Password"}
              </button>
              {message.text ? (
                <p
                  className={`${styles.message} ${
                    message.type === "error" ? styles.error : styles.success
                  }`}
                >
                  {message.text}
                </p>
              ) : null}
              <p className={styles.helper}>
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => {
                    setMode("login");
                    setMessage({ type: "", text: "" });
                  }}
                >
                  Back to Login
                </button>
              </p>
            </form>
          ) : (
            <form className={styles.form} onSubmit={onConfirmPasswordReset}>
              <h2>Change Password</h2>
              <div className={styles.field}>
                <label htmlFor="reset-email">Registered Email</label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="reset-code">OTP Code</label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  value={resetCode}
                  onChange={(event) => setResetCode(event.target.value)}
                  required
                />
              </div>
              <PasswordInput
                id="new-password"
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                required
                autoComplete="new-password"
                className={styles.passwordRow}
                inputClassName={styles.passwordInput}
                buttonClassName={styles.passwordToggle}
              />
              <PasswordInput
                id="confirm-new-password"
                label="Confirm New Password"
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                required
                autoComplete="new-password"
                className={styles.passwordRow}
                inputClassName={styles.passwordInput}
                buttonClassName={styles.passwordToggle}
              />
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? "Please wait..." : "Verify OTP & Change Password"}
              </button>
              <p className={styles.passwordHint}>
                Use 8+ characters with 1 uppercase letter, 1 number, and 1 special character.
              </p>
              <ul className={styles.passwordRules}>
                <li>
                  <span>{resetPasswordCriteria.length ? "✓" : "1"}</span>
                  At least 8 characters
                </li>
                <li>
                  <span>{resetPasswordCriteria.uppercase ? "✓" : "A"}</span>
                  One uppercase letter
                </li>
                <li>
                  <span>{resetPasswordCriteria.number ? "✓" : "0"}</span>
                  One number
                </li>
                <li>
                  <span>{resetPasswordCriteria.symbol ? "✓" : "#"}</span>
                  One special character
                </li>
              </ul>
              {message.text ? (
                <p
                  className={`${styles.message} ${
                    message.type === "error" ? styles.error : styles.success
                  }`}
                >
                  {message.text}
                </p>
              ) : null}
              <p className={styles.helper}>
                If you do not receive the OTP, check your spam or junk folder, wait a moment, and try again.
              </p>
              <p className={styles.helper}>
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => {
                    setMode("login");
                    setMessage({ type: "", text: "" });
                  }}
                >
                  Back to Login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
