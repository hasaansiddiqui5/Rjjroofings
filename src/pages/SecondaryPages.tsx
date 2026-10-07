import React, { useState } from 'react';
import {
  Maximize2,
  X,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Award,
  Hammer,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RouteState } from '../components/PublicLayout';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { ProjectItem } from '../types';
import { GENERATED_IMAGES } from '../data/seedData';

interface PageNavProps {
  navigate: (route: RouteState) => void;
}

export const ProjectsGalleryPage: React.FC<PageNavProps> = ({ navigate }) => {
  const { db } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxProject, setLightboxProject] = useState<ProjectItem | null>(null);

  const categories = [
    'All',
    'Storm Restoration',
    'Standing Seam Metal',
    'Residential Shingle',
    'Commercial TPO',
    'Gutters & Exterior',
  ];

  const filtered =
    selectedCategory === 'All'
      ? db.projects
      : db.projects.filter((p) => p.category === selectedCategory);

  return (
    <div>
      <section className="bg-[#0B1B2E] text-white py-16 lg:py-24 border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="eyebrow text-[#E8873F]">Completed Fort Worth &amp; DFW Roof Installations</p>
          <h1 className="section-headline font-display font-extrabold text-white">
            Interactive Before &amp; After Project Gallery
          </h1>
          <p className="text-base text-white/80 max-w-2xl leading-relaxed">
            Drag the comparison handle on any project below to inspect hail and wind damage prior to our work versus the completed architectural installation.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#0B1B2E]/12">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-xl border border-[#0B1B2E]/12">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0B1B2E] text-white'
                    : 'text-[#5E6B7A] hover:text-[#0B1B2E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate({ page: 'book' })}
            className="px-4 py-2.5 rounded-lg bg-[#D9732B] hover:bg-[#E8873F] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            Book Free Roof Inspection
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map((project) => (
            <article
              key={project.id}
              className="bg-white rounded-xl border border-[#0B1B2E]/12 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <BeforeAfterSlider
                  beforeImage={project.beforeImage}
                  afterImage={project.afterImage}
                  altTitle={project.title}
                  className="h-80 rounded-none"
                />

                <div className="p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular text-[#D9732B]">
                    <span>{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.completedAt}</span>
                  </div>

                  <h2 className="font-display text-2xl font-bold text-[#0B1B2E]">{project.title}</h2>
                  <p className="text-sm text-[#5E6B7A] leading-relaxed">{project.description}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-[#0B1B2E]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-[#5E6B7A] font-mono-tabular">
                  {project.roofSquare} · {project.materialUsed} · {project.durationDays}
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxProject(project)}
                  className="px-3 py-1.5 rounded-lg border border-[#0B1B2E]/20 hover:border-[#0B1B2E] text-[#0B1B2E] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Inspect Fullscreen
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {lightboxProject && (
        <div
          className="fixed inset-0 z-50 bg-[#0B1B2E]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-5xl w-full bg-[#12263F] border border-white/15 rounded-2xl overflow-hidden text-white">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono-tabular text-[#E8873F]">
                  {lightboxProject.category} · {lightboxProject.location}
                </span>
                <h3 className="font-display text-xl font-bold text-white">{lightboxProject.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxProject(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <BeforeAfterSlider
                beforeImage={lightboxProject.beforeImage}
                afterImage={lightboxProject.afterImage}
                altTitle={lightboxProject.title}
                className="h-[360px] sm:h-[460px]"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-white/80">
                <p className="max-w-2xl">{lightboxProject.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxProject(null);
                    navigate({ page: 'book' });
                  }}
                  className="px-5 py-3 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-xs whitespace-nowrap cursor-pointer"
                >
                  Request Similar Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AboutPage: React.FC<PageNavProps> = ({ navigate }) => {
  const { db } = useApp();
  const { settings } = db;

  return (
    <div>
      <section className="bg-[#0B1B2E] text-white py-16 lg:py-24 border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="eyebrow text-[#E8873F]">Our Story · 4466 Hardy St, Fort Worth, TX</p>
            <h1 className="section-headline font-display font-extrabold text-white">
              Local Fort Worth Builders Protecting What Matters, From the Top Down.
            </h1>
            <p className="text-base text-white/80 leading-relaxed">
              Every spring, thousands of out-of-state storm chasers flood Tarrant County with magnetic door signs, rush through sub-standard installations, and vanish before the first winter freeze reveals flashing leaks. RRJ Roofing &amp; Construction, LLC was founded in Fort Worth to be the permanent, accountable alternative.
            </p>
          </div>
          <div className="lg:col-span-5 rounded-xl overflow-hidden border border-white/15 h-80">
            <img
              src={GENERATED_IMAGES.metalStandingSeam}
              alt="RRJ Roofing craftsmanship on custom standing seam metal roof"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-xl bg-white border border-[#0B1B2E]/12 space-y-3">
            <ShieldCheck className="w-7 h-7 text-[#D9732B]" />
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">
              Licensed, Bonded &amp; $2M General Liability Insured
            </h2>
            <p className="text-sm text-[#5E6B7A] leading-relaxed">
              We carry full General Liability and Workers’ Compensation insurance coverage, pull all required municipal roof permits across Fort Worth, Arlington, Keller, and Weatherford, and provide certificates of insurance with every proposal.
            </p>
          </div>
          <div className="p-7 rounded-xl bg-white border border-[#0B1B2E]/12 space-y-3">
            <Award className="w-7 h-7 text-[#D9732B]" />
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">
              Manufacturer Certified Master Installers
            </h2>
            <p className="text-sm text-[#5E6B7A] leading-relaxed">
              Certified in UL 2218 Class 4 impact-resistant shingle assemblies, 24-gauge Kynar 500® architectural standing seam metal fabrication, and robotic heat-welded 60-mil/80-mil commercial TPO membranes.
            </p>
          </div>
          <div className="p-7 rounded-xl bg-white border border-[#0B1B2E]/12 space-y-3">
            <Hammer className="w-7 h-7 text-[#D9732B]" />
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">
              Both Master Roofers &amp; General Contractors
            </h2>
            <p className="text-sm text-[#5E6B7A] leading-relaxed">
              Because we hold general construction expertise, we handle structural rafters, patio additions, chimney rebuilds, James Hardie® siding, seamless gutters, and interior drywall restoration without handing you off to strangers.
            </p>
          </div>
        </div>

        <div className="bg-[#0B1B2E] text-white rounded-xl p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="eyebrow text-[#E8873F]">Credentials &amp; Compliance Record</div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Standing Behind Every Nail, Seam, and Flashing Joint
            </h2>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-white/85 font-mono-tabular">
              <div>Entity: RRJ Roofing &amp; Construction, LLC (Texas LLC)</div>
              <div>Fort Worth Office: {settings.address}</div>
              <div>General Liability Policy: $2,000,000 Aggregate</div>
              <div>Workmanship Warranty: 10-Year Written Labor Guarantee</div>
              <div>Code Standard: 2021/2024 International Residential Code (IRC)</div>
              <div>Hail Rating Certs: UL 2218 Class 4 Impact Certification</div>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate({ page: 'book' })}
              className="w-full py-3.5 px-6 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm cursor-pointer"
            >
              Schedule Free Roof Inspection
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'contact' })}
              className="w-full py-3.5 px-6 rounded-xl border border-white/25 hover:border-white text-white font-semibold text-sm cursor-pointer"
            >
              Contact Fort Worth Office
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export const ContactPage: React.FC<PageNavProps> = ({ navigate }) => {
  const { db, submitContactMessage } = useApp();
  const { settings } = db;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Free Roof Inspection / Estimate Question');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Please complete your name, phone, email, and message.');
      return;
    }
    submitContactMessage({ fullName, email, phone, subject, message });
    setSubmitted(true);
  };

  return (
    <div>
      <section className="bg-[#0B1B2E] text-white py-16 border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <p className="eyebrow text-[#E8873F]">Direct Fort Worth Dispatch &amp; Office</p>
          <h1 className="section-headline font-display font-extrabold text-white">
            Contact RRJ Roofing &amp; Construction
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl">
            Have a question about an insurance claim, commercial flat roof, or general construction project? Reach us directly by phone, visit our Hardy St office, or send a message below.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-white border border-[#0B1B2E]/12 space-y-5">
              <div className="eyebrow text-[#D9732B]">Headquarters &amp; Dispatch</div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#D9732B] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#5E6B7A]">24/7 Phone &amp; Storm Line</div>
                    <a
                      href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
                      className="font-mono-tabular text-base font-bold text-[#0B1B2E] hover:text-[#D9732B]"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#D9732B] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#5E6B7A]">Direct Email</div>
                    <a
                      href={`mailto:${settings.email}`}
                      className="font-mono-tabular text-base font-bold text-[#0B1B2E] hover:text-[#D9732B]"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#D9732B] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs text-[#5E6B7A]">Fort Worth Office &amp; Yard</div>
                    <div className="font-semibold text-[#0B1B2E]">{settings.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#D9732B] shrink-0 mt-0.5" />
                  <div className="w-full">
                    <div className="text-xs text-[#5E6B7A] mb-1">Business Hours (America/Chicago)</div>
                    <div className="space-y-1 text-xs font-mono-tabular text-[#0B1B2E]">
                      {db.businessHours.map((bh) => (
                        <div key={bh.id} className="flex justify-between">
                          <span>{bh.dayName}:</span>
                          <span>
                            {bh.isClosed
                              ? 'Emergency Storm Callback Only'
                              : `${bh.openTime} – ${bh.closeTime} CT`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#0B1B2E]/12 h-64 bg-[#0B1B2E]">
              <iframe
                title="Fort Worth Office Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-97.4100%2C32.7800%2C-97.2900%2C32.8600&layer=mapnik&marker=32.8224%2C-97.3517"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-10">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#D9732B] mx-auto" />
                  <h2 className="font-display text-2xl font-bold text-[#0B1B2E]">
                    Message Received by Our Fort Worth Office
                  </h2>
                  <p className="text-sm text-[#5E6B7A] max-w-md mx-auto">
                    Thank you, <strong>{fullName}</strong>. Your inquiry has been logged in our dispatch inbox and emailed to <strong>{settings.email}</strong>.
                  </p>
                  <div className="pt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                      }}
                      className="px-4 py-2 rounded-lg border border-[#0B1B2E]/20 text-xs font-semibold"
                    >
                      Send Another Message
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'book' })}
                      className="px-4 py-2 rounded-lg bg-[#D9732B] text-white text-xs font-semibold"
                    >
                      Book Specific Time Slot Instead
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <div className="eyebrow text-[#D9732B]">Direct Inquiry Form</div>
                    <h2 className="font-display text-2xl font-bold text-[#0B1B2E]">
                      Send a Message to Our Team
                    </h2>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-xs font-semibold text-[#0B1B2E] mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Jordan Travis"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm focus:outline-none focus:border-[#D9732B]"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#0B1B2E] mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(817) 555-0199"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm focus:outline-none focus:border-[#D9732B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-[#0B1B2E] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm focus:outline-none focus:border-[#D9732B]"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#0B1B2E] mb-1.5">
                        Topic / Subject
                      </label>
                      <select
                        id="contact-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm bg-white focus:outline-none focus:border-[#D9732B]"
                      >
                        <option value="Free Roof Inspection / Estimate Question">Free Roof Inspection / Estimate Question</option>
                        <option value="Emergency Storm or Leak Dispatch">Emergency Storm or Leak Dispatch</option>
                        <option value="Insurance Claim & Adjuster Meeting">Insurance Claim &amp; Adjuster Meeting</option>
                        <option value="Commercial Flat / TPO Roofing">Commercial Flat / TPO Roofing</option>
                        <option value="Remodeling, Siding, Gutters or Fencing">Remodeling, Siding, Gutters or Fencing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-semibold text-[#0B1B2E] mb-1.5">
                      How Can We Help? *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your property address, roof type, or any storm damage..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm focus:outline-none focus:border-[#D9732B]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Send Message to RRJ Office
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export const LegalPage: React.FC<{ type: 'privacy' | 'terms'; navigate: (route: RouteState) => void }> = ({
  type,
  navigate,
}) => {
  const { db } = useApp();
  const { settings } = db;

  return (
    <div className="py-16 lg:py-24 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-2 border-b border-[#0B1B2E]/12 pb-6">
        <p className="eyebrow text-[#D9732B]">Legal &amp; Compliance Documentation</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1B2E]">
          {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service & Inspection Agreement'}
        </h1>
        <p className="text-xs font-mono-tabular text-[#5E6B7A]">
          Effective Date: October 2026 · {settings.businessName} · {settings.address}
        </p>
      </div>

      {type === 'privacy' ? (
        <div className="space-y-6 text-sm text-[#0B1B2E]/85 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">1. Information We Collect</h2>
            <p>
              When you schedule a Free Roof Inspection or submit a contact inquiry with {settings.businessName}, we collect your name, phone number, email address, property street address, roof specifications, and any optional storm damage photographs you upload.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">2. How We Use Your Property Information</h2>
            <p>
              We use your information strictly to dispatch a certified Fort Worth roofing estimator to your property, send appointment confirmations and reminders in America/Chicago time, prepare written construction estimates, and assist with your insurance claim documentation when requested. We never sell or rent your personal contact information to third-party lead brokers.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">3. Data Security &amp; Contact</h2>
            <p>
              To request updates or deletion of your customer record, contact our office at {settings.email} or call {settings.phone}.
            </p>
          </section>
        </div>
      ) : (
        <div className="space-y-6 text-sm text-[#0B1B2E]/85 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">1. Scope of Free Roof Inspections</h2>
            <p>
              On-site roof inspections and written estimates provided by {settings.businessName} are complimentary for residential and commercial property owners within our Dallas–Fort Worth service area. Booking an inspection authorizes our estimator to safely access your exterior roof slopes and take diagnostic photographs.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">2. Texas HB 2102 Deductible Compliance</h2>
            <p>
              In strict compliance with Texas Insurance Code Chapter 707 (HB 2102), Texas law requires a person insured under a property insurance policy to pay any deductible applicable to a claim made under the policy. {settings.businessName} provides transparent Xactimate scopes and flexible financing options but never engages in unlawful deductible rebating.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold text-[#0B1B2E]">3. Rescheduling &amp; Emergency Weather Dispatch</h2>
            <p>
              Because roof safety depends on dry slopes and safe wind speeds, inspections may be rescheduled during active lightning or severe rainfall. Emergency leak tarping requests are prioritized in the order received.
            </p>
          </section>
        </div>
      )}

      <div className="pt-6 border-t border-[#0B1B2E]/12">
        <button
          type="button"
          onClick={() => navigate({ page: 'home' })}
          className="px-5 py-2.5 rounded-lg bg-[#0B1B2E] text-white text-xs font-semibold cursor-pointer"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<PageNavProps> = ({ navigate }) => (
  <div className="py-24 max-w-[700px] mx-auto px-4 text-center space-y-5">
    <p className="eyebrow text-[#D9732B]">Error 404</p>
    <h1 className="font-display text-4xl font-extrabold text-[#0B1B2E]">
      Page Not Found on the Roofline
    </h1>
    <p className="text-sm text-[#5E6B7A]">
      The page you are looking for may have moved or been updated. Return home or book a free roof inspection below.
    </p>
    <div className="pt-2 flex justify-center gap-3">
      <button
        type="button"
        onClick={() => navigate({ page: 'home' })}
        className="px-5 py-2.5 rounded-lg bg-[#0B1B2E] text-white text-xs font-semibold cursor-pointer"
      >
        Back to Home
      </button>
      <button
        type="button"
        onClick={() => navigate({ page: 'book' })}
        className="px-5 py-2.5 rounded-lg bg-[#D9732B] text-white text-xs font-semibold cursor-pointer"
      >
        Book Free Inspection
      </button>
    </div>
  </div>
);
