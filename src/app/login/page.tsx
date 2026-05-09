import AuthClientPanel from "../auth/components/AuthClientPanel";

type LoginPageProps = {
  searchParams?: {
    mode?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const mode = searchParams?.mode === "signup" ? "signup" : "login";

  return <AuthClientPanel initialMode={mode} />;
}