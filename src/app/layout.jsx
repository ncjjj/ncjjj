import "./globals.css";
import { getServerSession } from "next-auth";
import AuthSessionProvider from "../components/providers/AuthSessionProvider";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { authOptions } from "../lib/auth";

export const metadata = {
  title: "CA Firm",
  description: "GST and ITR filing services",
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <AuthSessionProvider session={session}>
          <Header />
          <div className="page-content">{children}</div>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}