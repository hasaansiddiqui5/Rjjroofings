import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Calendar, ShieldAlert, MapPin, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type RouteState =
  | { page: 'home' }
  | { page: 'services' }
  | { page: 'service-detail'; slug: string }
  | { page: 'projects' }
  | { page: 'about' }
  | { page: 'book'; preselectedServiceId?: string; preselectedUrgency?: 'STANDARD' | 'EMERGENCY_STORM'; manageToken?: string }
  | { page: 'contact' }
  | { page: 'privacy' }
  | { page: 'terms' }
  | { page: 'admin' }
  | { page: '404' };

interface PublicLayoutProps {
  route: RouteState;
  navigate: (route: RouteState) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ route, navigate, children }) => {
  const { db, toasts, dismissToast } = useApp();
  const { settings } = db;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  const navItems: { label: string; target: RouteState; active: boolean }[] = [
    {
      label: 'Services',
      target: { page: 'services' },
      active: route.page === 'services' || route.page === 'service-detail',
    },
    {
      label: 'Projects',
      target: { page: 'projects' },
      active: route.page === 'projects',
    },
    {
      label: 'About',
      target: { page: 'about' },
      active: route.page === 'about',
    },
    {
      label: 'Contact',
      target: { page: 'contact' },
      active: route.page === 'contact',
    },
    {
      label: 'Admin Portal',
      target: { page: 'admin' },
      active: route.page === 'admin',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F5F2] text-[#0B1B2E] pb-14 md:pb-0">
      <header
        className={`sticky top-0 z-40 transition-colors duration-200 ${
          scrolled
            ? 'bg-[#0B1B2E]/95 backdrop-blur-md border-b border-white/10 text-white shadow-sm'
            : 'bg-[#0B1B2E] border-b border-white/10 text-white'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate({ page: 'home' })}
            className="text-left font-display text-lg sm:text-xl font-bold tracking-tight text-white hover:text-[#E8873F] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#D9732B]"
          >
            RRJ Roofing &amp; Construction
          </button>

          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.target)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  item.active
                    ? 'text-[#E8873F] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D9732B]'
                    : 'text-white/80 hover:text-white after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-[#D9732B] after:transition-all after:duration-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <a
              href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
              className="px-3.5 py-2 text-xs font-medium text-white/90 border border-white/20 rounded-lg hover:border-white/50 hover:text-white transition-colors whitespace-nowrap shrink-0 font-mono-tabular flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#D9732B]" />
              {settings.phone}
            </a>
            <button
              type="button"
              onClick={() => navigate({ page: 'book', preselectedUrgency: 'STANDARD' })}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#D9732B] hover:bg-[#E8873F] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Book Free Inspection
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            className="lg:hidden p-2.5 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-[#0B1B2E] text-white z-50 px-6 py-8 flex flex-col justify-between overflow-y-auto border-t border-white/10">
            <div className="space-y-6">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.target)}
                    className={`w-full text-left py-3.5 border-b border-white/10 font-display text-2xl font-bold flex items-center justify-between ${
                      item.active ? 'text-[#E8873F]' : 'text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ArrowUpRight className="w-5 h-5 text-[#D9732B]" />
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#12263F] border border-white/10 space-y-3">
                <p className="eyebrow text-[#E8873F]">Emergency Storm Dispatch</p>
                <p className="text-sm text-white/80">
                  Active roof leak or recent hail damage in Fort Worth? Request priority same-day tarping and inspection.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ page: 'book', preselectedUrgency: 'EMERGENCY_STORM' })}
                  className="w-full py-3 px-4 rounded-lg bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Request Priority Storm Help
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-white/60 space-y-2">
              <p className="font-medium text-white">{settings.businessName}</p>
              <p>{settings.address}</p>
              <p className="font-mono-tabular">Direct: {settings.phone} · {settings.email}</p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#0B1B2E] text-white border-t border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-4 space-y-4">
              <div className="font-display text-2xl font-bold tracking-tight text-white">
                {settings.businessName}
              </div>
              <p className="text-sm text-white/75 leading-relaxed max-w-sm">
                {settings.tagline} Serving residential homeowners and light commercial property owners across the greater Dallas–Fort Worth Metroplex.
              </p>
              <div className="pt-2 space-y-1.5 text-sm text-white/80">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#D9732B] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </p>
                <p className="font-mono-tabular">
                  Phone:{' '}
                  <a href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`} className="text-white hover:text-[#E8873F] underline">
                    {settings.phone}
                  </a>
                </p>
                <p className="font-mono-tabular">
                  Email:{' '}
                  <a href={`mailto:${settings.email}`} className="text-white hover:text-[#E8873F] underline">
                    {settings.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <div className="eyebrow text-[#E8873F]">Roofing &amp; Construction</div>
              <ul className="space-y-2 text-sm text-white/75">
                {db.services
                  .filter((s) => s.active)
                  .slice(0, 7)
                  .map((srv) => (
                    <li key={srv.id}>
                      <button
                        type="button"
                        onClick={() => navigate({ page: 'service-detail', slug: srv.slug })}
                        className="hover:text-white transition-colors text-left cursor-pointer"
                      >
                        {srv.name}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <div className="eyebrow text-[#E8873F]">DFW Service Area</div>
              <p className="text-sm text-white/75 leading-relaxed">
                Fort Worth · Arlington · Haltom City · North Richland Hills · Keller · Saginaw · Benbrook · Weatherford · Southlake · Colleyville · Burleson · Grapevine
              </p>
              <div className="pt-2 text-xs text-white/60 space-y-1 font-mono-tabular">
                <p>Mon–Fri: 7:30 AM – 6:00 PM CT</p>
                <p>Saturday: 8:00 AM – 2:00 PM CT</p>
                <p>Sunday: Emergency Storm Dispatch</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="eyebrow text-[#E8873F]">Company</div>
              <ul className="space-y-2 text-sm text-white/75">
                <li>
                  <button type="button" onClick={() => navigate({ page: 'about' })} className="hover:text-white cursor-pointer">
                    About RRJ
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate({ page: 'projects' })} className="hover:text-white cursor-pointer">
                    Before &amp; After Gallery
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate({ page: 'book' })} className="hover:text-white cursor-pointer">
                    Book Free Inspection
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate({ page: 'contact' })} className="hover:text-white cursor-pointer">
                    Contact Office
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate({ page: 'privacy' })} className="hover:text-white cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate({ page: 'terms' })} className="hover:text-white cursor-pointer">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate({ page: 'admin' })} className="hover:text-white cursor-pointer">
                    Staff &amp; Admin Login
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
            <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved. Fort Worth, Texas.</p>
            <p>Licensed &amp; Insured Texas General &amp; Roofing Contractor · All times America/Chicago (CT)</p>
          </div>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 bg-[#0B1B2E] border-t border-white/15 px-3 flex items-center gap-2.5 shadow-lg">
        <a
          href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
          className="flex-1 h-10 rounded-lg border border-white/25 text-white font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap font-mono-tabular active:bg-white/10"
        >
          <Phone className="w-3.5 h-3.5 text-[#D9732B]" />
          Call Now
        </a>
        <button
          type="button"
          onClick={() => navigate({ page: 'book', preselectedUrgency: 'STANDARD' })}
          className="flex-1 h-10 rounded-lg bg-[#D9732B] text-white font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap active:bg-[#E8873F]"
        >
          <Calendar className="w-3.5 h-3.5" />
          Free Inspection
        </button>
      </div>

      {toasts.length > 0 && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start justify-between gap-3 transition-all ${
                t.variant === 'danger'
                  ? 'bg-red-950 text-white border-red-700'
                  : t.variant === 'warning'
                  ? 'bg-amber-950 text-white border-amber-700'
                  : 'bg-[#0B1B2E] text-white border-[#D9732B]'
              }`}
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="text-xs text-white/80 leading-relaxed">{t.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="text-white/60 hover:text-white p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
