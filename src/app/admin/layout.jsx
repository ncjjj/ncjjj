import { AdminProvider, AuthProvider, ThemeProvider } from "./context";

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <ThemeProvider>
          <div className="admin-layout">{children}</div>
        </ThemeProvider>
      </AdminProvider>
    </AuthProvider>
  );
}