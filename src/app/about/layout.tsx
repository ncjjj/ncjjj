import { getAboutPageData } from "./data";
import type { ReactNode } from "react";

type AboutLayoutProps = {
  children: ReactNode;
};

export default async function AboutLayout({ children }: AboutLayoutProps) {
  const aboutData = await getAboutPageData();

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 rounded-lg bg-slate-50 p-6">
        <p className="text-sm uppercase tracking-wide text-slate-500">About</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{aboutData.firmName}</h1>
        <p className="mt-2 text-slate-700">
          Trusted advisory and compliance services with a server-rendered foundation.
        </p>
      </header>
      {children}
    </section>
  );
}
