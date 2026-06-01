import AuthClientPanel from "./components/AuthClientPanel";
import { createPageMetadata } from "../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Client Login",
  description: "Secure client login for NCJ Legal LLP services.",
  path: "/auth",
  noIndex: true,
});

export default function AuthPage() {
  return <AuthClientPanel initialMode="login" />;
}
