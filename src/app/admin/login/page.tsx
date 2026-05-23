import AdminLoginForm from "../../../components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin Login | NCJ Legal Business Solutions LLP",
  description: "Admin sign in for consultation management.",
};

type AdminLoginPageProps = {
  searchParams?: {
    callbackUrl?: string | string[];
  };
};

function getCallbackUrl(value: string | string[] | undefined) {
  const callbackUrl = Array.isArray(value) ? value[0] : value;

  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/admin";
  }

  return callbackUrl;
}

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const callbackUrl = getCallbackUrl(searchParams?.callbackUrl);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fffaf0] via-[#faf6ed] to-[#f5e6c8] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6 text-[#3b2f1c]">
          <span className="inline-flex max-w-full rounded-full border border-[#d9c9a4] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7340] sm:text-sm sm:tracking-[0.2em]">
            Admin Access
          </span>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Consultation Requests and Profile Oversight</h1>
          <p className="max-w-2xl text-base text-[#6b5b3e] sm:text-lg">
            Sign in to manage consultation requests, review registered profiles, and update request status in one place.
          </p>
        </section>

        <AdminLoginForm callbackUrl={callbackUrl} />
      </div>
    </main>
  );
}
