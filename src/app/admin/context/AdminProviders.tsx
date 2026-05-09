"use client";

import { AdminProvider } from "./AdminContext";
import { ThemeProvider } from "../../../context/ThemeContext";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AdminProviders({ children }: Props) {
  return (
    <AdminProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AdminProvider>
  );
}
