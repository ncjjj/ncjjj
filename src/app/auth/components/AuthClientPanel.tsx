"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import styles from "../AuthPage.module.css";

const initialLogin = {
  email: "",
  password: "",
};

const initialSignup = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type AuthMode = "login" | "signup" | "reset" | "resetVerify";

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

async function getPostLoginRoute() {
  return "/dashboard";
}

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
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<AuthMessage>({ type: "", text: "" });
  const [nextRoute, setNextRoute] = useState("");

  const signupPasswordCriteria = getPasswordCriteria(signupForm.password);
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
                onClick={() => router.push("/dashboard")}
              >
                Continue
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

      setSuccess("Login successful. Click below to open your dashboard.");
      setNextRoute(await getPostLoginRoute());
    } catch {
      setError("Unable to login right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setMessage({ type: "", text: "" });
    setNextRoute("");

    const normalizedEmail = signupForm.email.trim().toLowerCase();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupForm.name.trim(),
          email: normalizedEmail,
          password: signupForm.password,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.message || "Unable to register right now.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email: normalizedEmail,
        password: signupForm.password,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        setSuccess("Account created. Please login now.");
        setMode("login");
        return;
      }

      setSuccess("Account created successfully. Click below to open your dashboard.");
      setNextRoute(await getPostLoginRoute());
    } catch {
      setError("Unable to create your account right now. Please try again.");
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
              Fast onboarding in under a minute
            </li>
            <li>
              <span>2</span>
              Enquiry form auto-filled after login
            </li>
            <li>
              <span>3</span>
              Session persists while you browse
            </li>
          </ul>
        </div>

        <div className={styles.formWrap}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                mode === "login" ? styles.tabBtnActive : ""
              }`}
              onClick={() => {
                setMode("login");
                setMessage({ type: "", text: "" });
                setNextRoute("");
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${
                mode === "signup" ? styles.tabBtnActive : ""
              }`}
              onClick={() => {
                setMode("signup");
                setMessage({ type: "", text: "" });
                setNextRoute("");
              }}
            >
              Sign Up
            </button>
          </div>

          {mode === "login" ? (
            <form className={styles.form} onSubmit={onLogin}>
              <h2>Login</h2>
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
              <div className={styles.field}>
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                />
              </div>
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
              {nextRoute ? (
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={() => router.push(nextRoute)}
                >
                  Continue to Dashboard
                </button>
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
                  Forgot password?
                </button>
              </p>
              <p className={styles.helper}>
                No account yet? <Link href="/login?mode=signup">Sign up</Link>
              </p>
            </form>
          ) : mode === "signup" ? (
            <form className={styles.form} onSubmit={onSignup}>
              <h2>Create account</h2>
              <div className={styles.field}>
                <label htmlFor="signup-name">Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={signupForm.name}
                  onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                
              </div>
              <div className={styles.field}>
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={signupForm.email}
                  onChange={(event) =>
                    setSignupForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  required
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={signupForm.password}
                  onChange={(event) =>
                    setSignupForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  required
                />
                <p className={styles.helper}>
                  Use 8+ characters with 1 uppercase letter, 1 number, and 1 special character.
                </p>
                <ul className={styles.featureList}>
                  <li>
                    <span>{signupPasswordCriteria.length ? "✓" : "1"}</span>
                    At least 8 characters
                  </li>
                  <li>
                    <span>{signupPasswordCriteria.uppercase ? "✓" : "A"}</span>
                    One uppercase letter
                  </li>
                  <li>
                    <span>{signupPasswordCriteria.number ? "✓" : "0"}</span>
                    One number
                  </li>
                  <li>
                    <span>{signupPasswordCriteria.symbol ? "✓" : "#"}</span>
                    One special character
                  </li>
                </ul>
              </div>
              <div className={styles.field}>
                <label htmlFor="signup-confirm-password">Confirm Password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(event) =>
                    setSignupForm((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? "Please wait..." : "Create Account"}
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
              {nextRoute ? (
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={() => router.push(nextRoute)}
                >
                  Continue to Dashboard
                </button>
              ) : null}
              <p className={styles.helper}>
                Already have an account? <Link href="/login">Login</Link>
              </p>
            </form>
          ) : mode === "reset" ? (
            <form className={styles.form} onSubmit={onRequestPasswordReset}>
              <h2>Forgot Password</h2>
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
                {submitting ? "Please wait..." : "Request OTP via Email"}
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
              <h2>Reset Password</h2>
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
              <div className={styles.field}>
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="confirm-new-password">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? "Please wait..." : "Verify OTP & Reset Password"}
              </button>
              <p className={styles.helper}>
                Use 8+ characters with 1 uppercase letter, 1 number, and 1 special character.
              </p>
              <ul className={styles.featureList}>
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
