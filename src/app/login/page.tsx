import AuthClientPanel from "../auth/components/AuthClientPanel";
import { createPageMetadata } from "../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Client Login",
  description: "Secure client login for NCJ Legal LLP services.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return <AuthClientPanel initialMode="login" />;
}
