import AuthClientPanel from "../auth/components/AuthClientPanel";

export default function LoginPage({ searchParams }) {
  const mode = searchParams?.mode === "signup" ? "signup" : "login";

  return <AuthClientPanel initialMode={mode} />;
}