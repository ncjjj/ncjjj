'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import {
  decodeServiceAccess,
  getDashboardGroupsForAccess,
} from '../../../lib/serviceAccess';

type ServiceAccessResponse = {
  serviceAccess?: string[];
};

export default function HamburgerMenu() {
  const pathname = usePathname();
  const currentPath = pathname || '';
  const [isOpen, setIsOpen] = useState(false);
  const [serviceAccess, setServiceAccess] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadServiceAccess = async () => {
      try {
        const response = await fetch('/api/profile/service-access', { cache: 'no-store' });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as ServiceAccessResponse;

        if (cancelled) {
          return;
        }

        const values = Array.isArray(payload.serviceAccess)
          ? payload.serviceAccess
          : decodeServiceAccess('');

        setServiceAccess(values);
      } catch {
        if (!cancelled) {
          setServiceAccess([]);
        }
      }
    };

    loadServiceAccess();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleServiceGroups = useMemo(() => {
    if (serviceAccess.length === 0) {
      return [];
    }

    return getDashboardGroupsForAccess(serviceAccess);
  }, [serviceAccess]);

  const hasAnyService = visibleServiceGroups.length > 0;

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#d7c8a7] bg-white/70 text-[#3b2f1c] shadow-sm transition hover:bg-white md:hidden"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 max-h-[calc(100vh-64px)] overflow-y-auto border-b border-gray-200 bg-gradient-to-b from-[#f5e6c8] via-[#faf6ed] to-[#fffaf0] shadow-lg md:hidden">
          <nav className="dashboard-nav-mobile space-y-2 px-3 py-4">
            <Link href="/dashboard/profile" onClick={closeMenu}>
              <div
                className={`cursor-pointer rounded-xl px-4 py-3 transition-all ${
                  pathname === '/dashboard/profile'
                    ? 'bg-white text-black shadow-md'
                    : 'text-gray-600 hover:bg-white/70 hover:shadow-sm'
                }`}
              >
                <span className="text-sm font-medium">Profile Settings</span>
              </div>
            </Link>

            {hasAnyService ? (
              <div className="pt-3">
                <p className="px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7340]">
                  Service Sections
                </p>

                <div className="mt-2 space-y-2">
                  {visibleServiceGroups.map((group) => (
                    <details key={group.key} open={currentPath.includes(`/dashboard/services/${group.key}`)}>
                      <summary className="cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold text-[#4a3a22] hover:bg-[#fbf4e7]">
                        {group.label}
                      </summary>

                      <div className="mt-1 space-y-1 px-3">
                        {group.sections.map((section) => {
                          const href = `/dashboard/services/${group.key}/${section.key}`;
                          const isActive = currentPath === href;

                          return (
                            <Link key={section.key} href={href} onClick={closeMenu}>
                              <div
                                className={`rounded-lg px-3 py-2 text-sm transition ${
                                  isActive
                                    ? 'bg-white font-medium text-[#2f2310] shadow-sm'
                                    : 'text-[#6b5b3e] hover:bg-[#f7eedc]'
                                }`}
                              >
                                {section.label}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d9c69a] bg-[#fdf7eb] px-4 py-3 text-xs text-[#7a6a4f]">
                No service assigned yet.
              </div>
            )}

            {serviceAccess.includes('ngo-registration') || serviceAccess.length === 0 ? (
              <Link href="/dashboard/consultations" onClick={closeMenu}>
                <div
                  className={`cursor-pointer rounded-xl px-4 py-3 transition-all ${
                    currentPath === '/dashboard/consultations'
                      ? 'bg-white text-black shadow-md'
                      : 'text-gray-600 hover:bg-white/70 hover:shadow-sm'
                  }`}
                >
                  <span className="text-sm font-medium">My Requests</span>
                </div>
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </>
  );
}
