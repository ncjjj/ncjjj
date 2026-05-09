import AuthClientPanel from "./components/AuthClientPanel";

type AuthPageProps = {
  searchParams?: {
    mode?: string;
  };
};

export default function AuthPage({ searchParams }: AuthPageProps) {
  const mode = searchParams?.mode === "signup" ? "signup" : "login";

  return <AuthClientPanel initialMode={mode} />;
}
