import React from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, Calendar, Phone, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RouteState } from '../components/PublicLayout';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

interface ServicesListingProps {
  navigate: (route: RouteState) => void;
}

export const ServicesListingPage: React.FC<ServicesListingProps> = ({ navigate }) => {
  const { db } = useApp();
  const activeServices = db.services
    .filter((s) => s.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div>
      <section className="bg-[#0B1B2E] text-white py-16 lg:py-24 border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl mx-0 space-y-4">
          <p className="eyebrow text-[#E8873F]">Fort Worth Residential &amp; Commercial Trades</p>
          <h1 className="section-headline font-display font-extrabold text-white">
            Full-Scope Roofing &amp; General Construction Services
          </h1>
          <p className="text-base text-white/80 leading-relaxed max-w-2xl">
            Every service is executed by RRJ’s insured Fort Worth crews to meet or exceed International Residential Code (IRC) and manufacturer high-wind specifications. Select any service below to review inclusions, step-by-step installation procedures, and schedule a free inspection.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {activeServices.map((service, index) => (
            <article
              key={service.id}
              className="bg-white rounded-xl border border-[#0B1B2E]/12 overflow-hidden flex flex-col justify-between hover:border-[#D9732B] transition-colors group"
            >
              <div>
                <div className="h-52 bg-[#0B1B2E] relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2E]/75 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono-tabular text-white/90">
                    <span>{String(index + 1).padStart(2, '0')} · Trade</span>
                    <span>~{service.estimatedDuration} Min Inspection</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h2 className="font-display text-xl font-bold text-[#0B1B2E] group-hover:text-[#D9732B] transition-colors">
                    {String(index + 1).padStart(2, '0')}. {service.name}
                  </h2>
                  <p className="text-sm text-[#5E6B7A] leading-relaxed">{service.shortDescription}</p>

                  <ul className="pt-2 space-y-1.5 text-xs text-[#0B1B2E]/85">
                    {service.whatsIncluded.slice(0, 3).map((inc) => (
                      <li key={inc} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#D9732B] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-4 border-t border-[#0B1B2E]/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'service-detail', slug: service.slug })}
                  className="text-xs font-semibold text-[#0B1B2E] hover:text-[#D9732B] flex items-center gap-1 cursor-pointer"
                >
                  View Full Scope <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      page: 'book',
                      preselectedServiceId: service.id,
                      preselectedUrgency:
                        service.slug === 'storm-hail-damage-restoration' ? 'EMERGENCY_STORM' : 'STANDARD',
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-[#D9732B] hover:bg-[#E8873F] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  Book This Service
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

interface ServiceDetailProps {
  slug: string;
  navigate: (route: RouteState) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailProps> = ({ slug, navigate }) => {
  const { db } = useApp();
  const service = db.services.find((s) => s.slug === slug) || db.services[0];
  const sampleProject = db.projects[0];

  if (!service) return null;

  return (
    <div>
      <section className="bg-[#0B1B2E] text-white py-14 lg:py-20 border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate({ page: 'services' })}
            className="text-xs font-semibold text-[#E8873F] hover:text-white flex items-center gap-1.5 mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Services
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#E8873F] font-mono-tabular">
                <span>RRJ Certified Trade</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {service.estimatedDuration} Min On-Site Evaluation
                </span>
                <span aria-hidden="true">·</span>
                <span>{service.priceNote}</span>
              </div>

              <h1 className="section-headline font-display font-extrabold text-white">
                {service.name} in Fort Worth &amp; DFW
              </h1>

              <p className="text-base text-white/80 leading-relaxed">{service.shortDescription}</p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      page: 'book',
                      preselectedServiceId: service.id,
                      preselectedUrgency:
                        service.slug === 'storm-hail-damage-restoration' ? 'EMERGENCY_STORM' : 'STANDARD',
                    })
                  }
                  className="px-6 py-3.5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Book {service.name} Inspection
                </button>
                <a
                  href={`tel:${db.settings.phone.replace(/[^0-9]/g, '')}`}
                  className="px-5 py-3.5 rounded-xl border border-white/25 hover:border-white text-white font-semibold text-sm flex items-center gap-2 font-mono-tabular"
                >
                  <Phone className="w-4 h-4 text-[#E8873F]" />
                  {db.settings.phone}
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl overflow-hidden border border-white/15 h-72 sm:h-80 bg-[#12263F]">
              <img
                src={service.image}
                alt={service.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <div className="eyebrow text-[#D9732B]">Technical Overview</div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1B2E]">
                Built for North Texas Weather Extremes
              </h2>
              <p className="text-base text-[#0B1B2E]/85 leading-relaxed">{service.longDescription}</p>
            </div>

            <div className="bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 space-y-5">
              <div className="eyebrow text-[#D9732B]">Complete Scope Checklist</div>
              <h3 className="font-display text-xl font-bold text-[#0B1B2E]">
                What’s Included in Every {service.name} Project
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.whatsIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[#0B1B2E]">
                    <CheckCircle2 className="w-4 h-4 text-[#D9732B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <div className="eyebrow text-[#D9732B]">Field Execution Protocol</div>
              <h3 className="font-display text-2xl font-bold text-[#0B1B2E]">
                How We Execute {service.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.processSteps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-5 rounded-xl bg-white border border-[#0B1B2E]/12 space-y-2"
                  >
                    <div className="font-mono-tabular text-xs font-bold text-[#D9732B]">
                      Step {st.stepNumber}
                    </div>
                    <h4 className="font-display text-lg font-bold text-[#0B1B2E]">{st.title}</h4>
                    <p className="text-xs sm:text-sm text-[#5E6B7A] leading-relaxed">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {sampleProject && (
              <div className="space-y-4">
                <div className="eyebrow text-[#D9732B]">Interactive Proof</div>
                <h3 className="font-display text-2xl font-bold text-[#0B1B2E]">
                  Before &amp; After Inspection Comparison
                </h3>
                <BeforeAfterSlider
                  beforeImage={sampleProject.beforeImage}
                  afterImage={service.image}
                  altTitle={service.name}
                  className="h-80"
                />
              </div>
            )}

            {service.faqs.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-[#0B1B2E]/12">
                <div className="eyebrow text-[#D9732B]">Service Questions</div>
                <h3 className="font-display text-2xl font-bold text-[#0B1B2E]">
                  {service.name} FAQs
                </h3>
                <div className="space-y-4">
                  {service.faqs.map((faq) => (
                    <div key={faq.question} className="p-5 rounded-xl bg-white border border-[#0B1B2E]/12 space-y-2">
                      <h4 className="font-display font-bold text-base text-[#0B1B2E]">{faq.question}</h4>
                      <p className="text-sm text-[#5E6B7A] leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-xl bg-[#0B1B2E] text-white space-y-5 sticky top-24">
              <div className="eyebrow text-[#E8873F]">Free No-Obligation Estimate</div>
              <h3 className="font-display text-2xl font-bold text-white">
                Ready to Schedule Your {service.name} Inspection?
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Our Fort Worth estimator will inspect your property, take high-resolution photos, and provide a transparent written proposal.
              </p>

              <div className="p-3.5 rounded-lg bg-[#12263F] border border-white/10 text-xs space-y-1 font-mono-tabular">
                <div className="flex justify-between">
                  <span className="text-white/70">Inspection Fee:</span>
                  <strong className="text-[#E8873F]">$0.00 (Complimentary)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Est. On-Site Time:</span>
                  <strong className="text-white">{service.estimatedDuration} Minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Timezone:</span>
                  <strong className="text-white">America/Chicago (CT)</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate({
                    page: 'book',
                    preselectedServiceId: service.id,
                    preselectedUrgency:
                      service.slug === 'storm-hail-damage-restoration' ? 'EMERGENCY_STORM' : 'STANDARD',
                  })
                }
                className="w-full py-3.5 px-5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Book This Service Now
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Other RRJ Services
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {db.services
                    .filter((s) => s.active)
                    .map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => navigate({ page: 'service-detail', slug: s.slug })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          s.id === service.id
                            ? 'bg-[#D9732B] text-white'
                            : 'text-white/75 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
