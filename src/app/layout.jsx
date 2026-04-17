import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export const metadata = {
  title: "CA Firm",
  description: "GST and ITR filing services",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <div className="page-content">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}