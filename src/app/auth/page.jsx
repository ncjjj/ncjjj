import AuthClientPanel from "./components/AuthClientPanel";

export default function AuthPage({ searchParams }) {
  const mode = searchParams?.mode === "signup" ? "signup" : "login";

  return <AuthClientPanel initialMode={mode} />;
}
