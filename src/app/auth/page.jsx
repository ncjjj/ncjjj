"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import styles from "./AuthPage.module.css";

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

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, signup, user, loading } = useAuth();

  const initialMode = useMemo(() => {
    const mode = searchParams.get("mode");
    return mode === "signup" ? "signup" : "login";
  }, [searchParams]);

  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [signupForm, setSignupForm] = useState(initialSignup);
  const [message, setMessage] = useState({ type: "", text: "" });

  const setError = (text) => setMessage({ type: "error", text });
  const setSuccess = (text) => setMessage({ type: "success", text });

  if (!loading && user) {
    return (
      <section className={styles.authPage}>
        <div className={styles.shell}>
          <div className={styles.showcase}>
            <span className={styles.badge}>Welcome Back</span>
            <h1>You are already signed in.</h1>
            <p>
              You can continue exploring services or submit your enquiry directly
              from the contact page.
            </p>
          </div>
          <div className={styles.formWrap}>
            <p className={`${styles.message} ${styles.success}`}>
              Logged in as {user.email}
            </p>
            <div className={styles.form}>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={() => router.push("/contact")}
              >
                Go to Contact Page
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

  const onLogin = (event) => {
    event.preventDefault();
    const result = login(loginForm);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess("Login successful. Redirecting to dashboard...");
    setTimeout(() => router.push("/dashboard"), 500);
  };

  const onSignup = (event) => {
    event.preventDefault();

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = signup(signupForm);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess("Account created successfully. Redirecting to dashboard...");
    setTimeout(() => router.push("/dashboard"), 500);
  };

  return (
    <div>
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
                <button type="submit" className={styles.submitBtn}>
                  Login
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
                  No account yet? <Link href="/auth?mode=signup">Sign up</Link>
                </p>
              </form>
            ) : (
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
                  <label htmlFor="Mobile">Mobile Number</label>
                  <input
                    id="Mobile"
                    type="tel"
                    value={signupForm.mobile}
                    onChange={(event) =>
                      setSignupForm((prev) => ({ ...prev, mobile: event.target.value }))
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
                <button type="submit" className={styles.submitBtn}>
                  Create Account
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
                  Already have an account? <Link href="/auth">Login</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
