import React, { useState } from 'react';
import {
  Phone,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RouteState } from '../components/PublicLayout';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { GENERATED_IMAGES } from '../data/seedData';

interface HomePageProps {
  navigate: (route: RouteState) => void;
}

const MATERIALS_COMPARISON = [
  {
    name: 'Class 4 Impact Architectural Shingles',
    lifespan: '30–50 Years',
    windRating: 'Up to 130 MPH',
    hailRating: 'UL 2218 Class 4 (Highest)',
    insuranceDiscount: '12%–28% TX Premium Credit',
    bestFor: 'Fort Worth residential homes seeking maximum hail resilience and dimensional curb appeal.',
    summary:
      'Reinforced with SBS polymer-modified asphalt or woven fiberglass-mesh backing so 2-inch hailstones rebound without fracturing the mat.',
  },
  {
    name: '24-Gauge Standing Seam Metal',
    lifespan: '50–70+ Years',
    windRating: 'Up to 160 MPH',
    hailRating: 'UL 2218 Class 4',
    insuranceDiscount: 'Up to 30% TX Premium Credit',
    bestFor: 'Custom residences, ranch estates, accent dormers, and homeowners wanting a generational roof.',
    summary:
      'Interlocking vertical ribs with concealed expansion clips and Kynar 500® solar-reflective PVDF finish that lowers attic heat up to 25°F.',
  },
  {
    name: 'Clay & Concrete Architectural Tile',
    lifespan: '50–75+ Years',
    windRating: 'Up to 125 MPH',
    hailRating: 'Class 3 / Class 4 Options',
    insuranceDiscount: 'Varies by Carrier',
    bestFor: 'Mediterranean, Spanish Colonial, and luxury stone estates in Tanglewood, Westover Hills, and Southlake.',
    summary:
      'Unmatched thermal mass and timeless architectural depth installed over double-layer high-temperature synthetic underlayment.',
  },
  {
    name: '60-Mil & 80-Mil Commercial TPO / Flat',
    lifespan: '25–35 Years',
    windRating: 'FM Approved Uplift',
    hailRating: 'Puncture Resistant Membrane',
    insuranceDiscount: 'Commercial Energy Star Credit',
    bestFor: 'Light commercial buildings, retail centers, warehouses, churches, and modern low-slope residential transitions.',
    summary:
      'Hot-air robotically welded seams stronger than the sheet itself, paired with tapered polyiso insulation to eliminate ponding water.',
  },
];

const HOME_FAQS = [
  {
    q: 'How do I know if my Fort Worth roof has hail or wind damage without climbing a ladder?',
    a: 'Most hail damage is not visible from the driveway until a leak appears months later. Signs from the ground include dented aluminum downspouts or box vents, black asphalt granules collecting at the bottom of your gutter downspouts, or lifted shingle tabs. Our certified estimators perform a free, no-obligation 21-point inspection with high-resolution photo proof so you can see the exact condition of your roof from the ground.',
  },
  {
    q: 'How does the Texas homeowner insurance claim process work after a storm?',
    a: 'First, schedule a free inspection with RRJ Roofing & Construction before calling your insurance carrier—we will tell you honestly if the damage exceeds your deductible. If a claim is warranted, you file with your carrier and receive a claim number. Our senior estimator then meets your insurance adjuster on-site at your home, walks the roof slopes together, and verifies that code-required items (drip edge, valley liner, starter strip, steep charges) are included in your settlement.',
  },
  {
    q: 'What is the typical lifespan of an asphalt shingle roof in North Texas?',
    a: 'While manufacturers rate architectural shingles for 30 years in mild climates, extreme North Texas UV heat, 105°F+ attic temperatures, and severe spring hailstorms typically yield a practical service life of 14 to 20 years. Upgrading to UL 2218 Class 4 impact-resistant shingles and proper continuous ridge ventilation significantly extends roof longevity.',
  },
  {
    q: 'Do you offer financing or payment plans for roof replacements and deductibles?',
    a: 'Yes. For retail roof replacements, metal roof upgrades, or homeowners managing insurance deductibles, we offer flexible financing plans with fast approvals and transparent monthly terms. Importantly, in accordance with Texas law (HB 2102), we never illegally waive or rebate insurance deductibles—instead, we offer straightforward payment options and fair pricing.',
  },
  {
    q: 'What warranties protect my roof after RRJ completes the installation?',
    a: 'Every full roof replacement is backed by two layers of protection: (1) our written 10-Year RRJ Workmanship Warranty covering installation labor and flashing integrity, and (2) Manufacturer Limited Lifetime Material Warranties from Owens Corning, GAF, CertainTeed, or Carlisle.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { db } = useApp();
  const { settings, services, projects, testimonials } = db;

  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0);
  const [selectedProjectCategory, setSelectedProjectCategory] = useState<string>('All');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const activeServices = services.filter((s) => s.active).sort((a, b) => a.displayOrder - b.displayOrder);
  const projectCategories = ['All', 'Storm Restoration', 'Standing Seam Metal', 'Residential Shingle', 'Commercial TPO'];
  const filteredProjects =
    selectedProjectCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedProjectCategory);

  return (
    <div>
      <section className="relative bg-[#0B1B2E] text-white overflow-hidden roofline-clip-bottom">
        <div className="absolute inset-0 z-0">
          <img
            src={GENERATED_IMAGES.heroEstate}
            alt="Fort Worth architectural shingle roof and copper valley flashing at sunset"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B2E] via-[#0B1B2E]/90 to-[#0B1B2E]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2E] via-transparent to-[#0B1B2E]/40" />
        </div>

        <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24 lg:pt-24 lg:pb-32">
          <div className="max-w-3xl space-y-6">
            <p className="eyebrow text-[#E8873F]">
              Fort Worth, Texas · Residential &amp; Commercial Roofing Contractor
            </p>

            <h1 className="hero-headline font-display font-extrabold text-white">
              {settings.heroHeadline}
            </h1>

            <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
              {settings.heroSubline}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate({ page: 'book', preselectedUrgency: 'STANDARD' })}
                className="px-7 py-4 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-base transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-5 h-5" />
                Book a Free Roof Inspection
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
                className="px-6 py-4 rounded-xl border border-white/30 hover:border-white bg-white/5 hover:bg-white/10 text-white font-semibold text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap font-mono-tabular"
              >
                <Phone className="w-4 h-4 text-[#E8873F]" />
                Call {settings.phone}
              </a>
            </div>

            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-white/80 font-medium">
              <span>Licensed &amp; Insured in Texas</span>
              <span aria-hidden="true" className="text-[#D9732B]">·</span>
              <span>Free 21-Point Estimates</span>
              <span aria-hidden="true" className="text-[#D9732B]">·</span>
              <span>Storm &amp; Hail Claim Specialists</span>
              <span aria-hidden="true" className="text-[#D9732B]">·</span>
              <span>Local Fort Worth Crew (4466 Hardy St)</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="rounded-xl bg-[#12263F] text-white border border-white/15 shadow-xl overflow-hidden">
          <div className="bg-[#D9732B] px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-white text-sm font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Active roof leak or recent hail storm damage in DFW? Our emergency response team prioritizes active leaks.
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate({ page: 'book', preselectedUrgency: 'EMERGENCY_STORM' })}
              className="px-4 py-1.5 rounded-lg bg-[#0B1B2E] hover:bg-[#12263F] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Request Priority Storm Help
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="p-6">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white font-mono-tabular">
                {settings.statYearsExperience}
              </div>
              <div className="mt-1 text-xs text-white/70">
                North Texas Roofing &amp; General Construction Experience
              </div>
            </div>
            <div className="p-6">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white font-mono-tabular">
                {settings.statRoofsCompleted}
              </div>
              <div className="mt-1 text-xs text-white/70">
                Residential &amp; Commercial Roofs Installed Across DFW
              </div>
            </div>
            <div className="p-6">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white font-mono-tabular">
                {settings.statHappyHomeowners}
              </div>
              <div className="mt-1 text-xs text-white/70">
                Verified Homeowner Satisfaction &amp; Final Walkthrough Sign-Off
              </div>
            </div>
            <div className="p-6">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#E8873F] font-mono-tabular">
                {settings.statServiceAreaCities}
              </div>
              <div className="mt-1 text-xs text-white/70">
                Serving Fort Worth, Arlington, Keller, Weatherford &amp; Beyond
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-[#0B1B2E]/12">
          <div className="space-y-3 max-w-2xl">
            <p className="eyebrow text-[#D9732B]">Comprehensive Exterior &amp; Structural Capabilities</p>
            <h2 className="section-headline font-display font-bold text-[#0B1B2E]">
              Engineered Roofing &amp; Construction Services
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate({ page: 'services' })}
              className="px-5 py-2.5 rounded-lg border border-[#0B1B2E]/20 hover:border-[#0B1B2E] text-xs font-semibold text-[#0B1B2E] transition-colors whitespace-nowrap cursor-pointer"
            >
              View All {activeServices.length} Services
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeServices.slice(0, 6).map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-xl border border-[#0B1B2E]/12 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-[#D9732B]"
            >
              <div>
                <div className="h-48 overflow-hidden bg-[#0B1B2E] relative">
                  <img
                    src={service.image}
                    alt={service.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2E]/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 text-xs font-mono-tabular text-white/90">
                    {String(index + 1).padStart(2, '0')}.Est. Inspection {service.estimatedDuration} mins
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-display text-xl font-bold text-[#0B1B2E] group-hover:text-[#D9732B] transition-colors">
                    {String(index + 1).padStart(2, '0')}. {service.name}
                  </h3>
                  <p className="text-sm text-[#5E6B7A] leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-[#0B1B2E]/8 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'service-detail', slug: service.slug })}
                  className="text-xs font-semibold text-[#0B1B2E] hover:text-[#D9732B] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  Service Specifications
                  <ArrowRight className="w-3.5 h-3.5" />
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
                  className="px-3.5 py-1.5 rounded-lg bg-[#0B1B2E] hover:bg-[#D9732B] text-white text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
                >
                  Book Inspection
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeServices.length > 6 && (
          <div className="mt-8 p-6 rounded-xl bg-white border border-[#0B1B2E]/12 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#D9732B]">
                Additional Exterior &amp; General Construction Trades
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-[#0B1B2E]">
                {activeServices.slice(6).map((s, idx) => (
                  <React.Fragment key={s.id}>
                    {idx > 0 && <span aria-hidden="true" className="text-[#5E6B7A]">·</span>}
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'service-detail', slug: s.slug })}
                      className="hover:text-[#D9732B] underline decoration-[#0B1B2E]/20 hover:decoration-[#D9732B] transition-colors cursor-pointer"
                    >
                      {s.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate({ page: 'services' })}
              className="text-xs font-semibold text-[#D9732B] hover:text-[#0B1B2E] whitespace-nowrap flex items-center gap-1 cursor-pointer"
            >
              Explore All 11 Services <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      <section className="py-20 lg:py-28 bg-[#0B1B2E] text-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-white/12">
            <div className="space-y-3 max-w-2xl">
              <p className="eyebrow text-[#E8873F]">Documented Fort Worth Proof of Work</p>
              <h2 className="section-headline font-display font-bold text-white">
                Before &amp; After Storm Restorations
              </h2>
              <p className="text-sm text-white/75">
                Drag the comparison slider on any project below to inspect the pre-restoration storm condition alongside our finished installation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#12263F] rounded-lg border border-white/10">
              {projectCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedProjectCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedProjectCategory === cat
                      ? 'bg-[#D9732B] text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProjects.slice(0, 2).map((project) => (
              <div
                key={project.id}
                className="bg-[#12263F] rounded-xl border border-white/12 overflow-hidden flex flex-col justify-between"
              >
                <BeforeAfterSlider
                  beforeImage={project.beforeImage}
                  afterImage={project.afterImage}
                  altTitle={project.title}
                  className="h-72 sm:h-80 rounded-none"
                />
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#E8873F] font-mono-tabular">
                    <span>{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.roofSquare}</span>
                    <span aria-hidden="true">·</span>
                    <span>Completed in {project.durationDays}</span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white">{project.title}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">{project.description}</p>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
                    <span>System Installed: <strong className="text-white">{project.materialUsed}</strong></span>
                    <button
                      type="button"
                      onClick={() => navigate({ page: 'projects' })}
                      className="text-[#E8873F] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                    >
                      Full Gallery →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3">
          <p className="eyebrow text-[#D9732B]">Material Science &amp; Texas Climate Engineering</p>
          <h2 className="section-headline font-display font-bold text-[#0B1B2E]">
            Compare Roofing Systems for North Texas
          </h2>
          <p className="text-sm sm:text-base text-[#5E6B7A]">
            Every roof pitch and budget requires the right assembly. Compare service lifespans, UL 2218 hail impact ratings, and potential Texas homeowner insurance premium discounts.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-2">
            {MATERIALS_COMPARISON.map((mat, idx) => (
              <button
                key={mat.name}
                type="button"
                onClick={() => setSelectedMaterialIdx(idx)}
                className={`w-full text-left p-5 rounded-xl border transition-all cursor-pointer ${
                  selectedMaterialIdx === idx
                    ? 'bg-[#0B1B2E] text-white border-[#0B1B2E] shadow-md'
                    : 'bg-white text-[#0B1B2E] border-[#0B1B2E]/12 hover:border-[#D9732B]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-base">{mat.name}</span>
                  <span
                    className={`text-xs font-mono-tabular ${
                      selectedMaterialIdx === idx ? 'text-[#E8873F]' : 'text-[#5E6B7A]'
                    }`}
                  >
                    {mat.lifespan}
                  </span>
                </div>
                <p
                  className={`mt-1.5 text-xs leading-relaxed ${
                    selectedMaterialIdx === idx ? 'text-white/80' : 'text-[#5E6B7A]'
                  }`}
                >
                  {mat.bestFor}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#0B1B2E]/10 pb-5">
              <div className="eyebrow text-[#D9732B]">Selected Assembly Specification</div>
              <h3 className="mt-1 font-display text-2xl font-bold text-[#0B1B2E]">
                {MATERIALS_COMPARISON[selectedMaterialIdx].name}
              </h3>
              <p className="mt-2 text-sm text-[#5E6B7A] leading-relaxed">
                {MATERIALS_COMPARISON[selectedMaterialIdx].summary}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#F7F5F2]">
                <div className="text-xs text-[#5E6B7A]">Expected Service Lifespan</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-[#0B1B2E]">
                  {MATERIALS_COMPARISON[selectedMaterialIdx].lifespan}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#F7F5F2]">
                <div className="text-xs text-[#5E6B7A]">Wind Uplift Rating</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-[#0B1B2E]">
                  {MATERIALS_COMPARISON[selectedMaterialIdx].windRating}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#F7F5F2]">
                <div className="text-xs text-[#5E6B7A]">Hail Impact Classification</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-[#0B1B2E]">
                  {MATERIALS_COMPARISON[selectedMaterialIdx].hailRating}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#F7F5F2]">
                <div className="text-xs text-[#5E6B7A]">Typical Insurance Credit</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-[#D9732B]">
                  {MATERIALS_COMPARISON[selectedMaterialIdx].insuranceDiscount}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#5E6B7A]">
                We bring physical shingle &amp; 24-gauge metal sample boards to your free inspection.
              </p>
              <button
                type="button"
                onClick={() => navigate({ page: 'book' })}
                className="px-5 py-2.5 rounded-lg bg-[#D9732B] hover:bg-[#E8873F] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
              >
                Request Sample &amp; Estimate
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white border-y border-[#0B1B2E]/10">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div>
            <div className="max-w-2xl space-y-3">
              <p className="eyebrow text-[#D9732B]">The RRJ Standard</p>
              <h2 className="section-headline font-display font-bold text-[#0B1B2E]">
                Why Fort Worth Homeowners Trust RRJ Roofing &amp; Construction
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  num: '01',
                  title: 'Uncompromising Workmanship',
                  desc: 'Six-nail high-wind fastening patterns, synthetic underlayment, and ice-and-water valley membranes on every single roof.',
                },
                {
                  num: '02',
                  title: 'Transparent Itemized Quotes',
                  desc: 'Every proposal lists exact square counts, decking rates, ventilation specs, and flashing details—zero hidden add-ons.',
                },
                {
                  num: '03',
                  title: 'Direct Adjuster Representation',
                  desc: 'We meet your insurance adjuster on the roof ladder and document every code-required line item in Xactimate.',
                },
                {
                  num: '04',
                  title: 'Spotless Magnetic Job Sites',
                  desc: 'Landscape tarps protect your shrubs and AC units, followed by triple rolling-magnet nail sweeps across your lawn and driveway.',
                },
                {
                  num: '05',
                  title: '10-Year Workmanship Warranty',
                  desc: 'We are rooted at 4466 Hardy St in Fort Worth—not an out-of-state storm chaser. Our 10-year labor warranty is backed locally.',
                },
              ].map((pillar) => (
                <div
                  key={pillar.num}
                  className="p-6 rounded-xl bg-[#F7F5F2] border border-[#0B1B2E]/10 space-y-3"
                >
                  <div className="font-mono-tabular text-xs font-semibold text-[#D9732B]">
                    {pillar.num}. Standard
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0B1B2E]">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-[#5E6B7A] leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-[#0B1B2E]/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="eyebrow text-[#D9732B]">From First Call to Final Nail Sweep</p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1B2E]">
                  Our 5-Step Inspection &amp; Restoration Process
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate({ page: 'book' })}
                className="text-xs font-semibold text-[#D9732B] hover:text-[#0B1B2E] flex items-center gap-1 cursor-pointer"
              >
                Start Step 01: Book Your Free Inspection <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  step: '01. Free Inspection',
                  detail: '21-point digital photo audit of shingles, soft metals, flashing, decking, and attic ventilation.',
                },
                {
                  step: '02. Detailed Estimate',
                  detail: 'Clear written scope or full Xactimate insurance claim packet with zero pressure.',
                },
                {
                  step: '03. Material Selection',
                  detail: 'Review physical shingle, tile, or 24-gauge metal color boards at your kitchen table.',
                },
                {
                  step: '04. Precision Installation',
                  detail: 'Most residential replacements completed in 1 day with full landscape protection.',
                },
                {
                  step: '05. Final Walkthrough',
                  detail: 'Supervisor roof walk, triple magnetic nail sweep, and warranty certificate registration.',
                },
              ].map((item) => (
                <div key={item.step} className="p-5 rounded-xl border border-[#0B1B2E]/12 bg-white space-y-2">
                  <div className="font-display font-bold text-base text-[#0B1B2E]">{item.step}</div>
                  <p className="text-xs text-[#5E6B7A] leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3">
          <p className="eyebrow text-[#D9732B]">Verified DFW Client Outcomes</p>
          <h2 className="section-headline font-display font-bold text-[#0B1B2E]">
            Trusted Across Fort Worth Neighborhoods
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials
            .filter((t) => t.featured)
            .map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[#D9732B]">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-[#5E6B7A] font-mono-tabular">{t.serviceType}</span>
                  </div>

                  <blockquote className="text-sm sm:text-base text-[#0B1B2E] leading-relaxed">
                    “{t.quote}”
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-[#0B1B2E]/10 space-y-2">
                  <div className="text-xs font-medium text-[#0B1B2E] flex items-start gap-2 bg-[#F7F5F2] p-3 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-[#D9732B] shrink-0 mt-0.5" />
                    <span>
                      <strong>Documented Outcome:</strong> {t.outcome}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#5E6B7A] pt-1">
                    <strong className="text-[#0B1B2E] text-sm">{t.authorName}</strong>
                    <span>{t.authorRole}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="py-20 bg-white border-t border-[#0B1B2E]/10">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="eyebrow text-[#D9732B]">Straight Answers from Master Roofers</p>
            <h2 className="section-headline font-display font-bold text-[#0B1B2E]">
              Frequently Asked Roofing &amp; Claim Questions
            </h2>
          </div>

          <div className="mt-10 divide-y divide-[#0B1B2E]/12 border-y border-[#0B1B2E]/12">
            {HOME_FAQS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={item.q} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-4 font-display text-lg font-bold text-[#0B1B2E] hover:text-[#D9732B] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[#D9732B] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm sm:text-base text-[#5E6B7A] leading-relaxed pr-8">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 bg-[#0B1B2E] text-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="eyebrow text-[#E8873F]">Protect Your Home From the Top Down</p>
              <h2 className="section-headline font-display font-bold text-white">
                Schedule Your Free 21-Point Roof Inspection Today.
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                Whether you need priority storm tarping, an honest pre-claim hail evaluation, or a custom standing seam metal quote, our local Fort Worth team responds fast and puts everything in writing.
              </p>

              <div className="space-y-2 text-sm text-white/85">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D9732B]" />
                  <span>Headquarters: <strong>{settings.address}</strong></span>
                </p>
                <p className="text-xs text-white/65 leading-relaxed">
                  Service Area: {settings.serviceArea}
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => navigate({ page: 'book' })}
                  className="px-6 py-3.5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  Book Free Inspection Online
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
                  className="px-5 py-3.5 rounded-xl border border-white/25 hover:border-white text-white font-semibold text-sm transition-colors font-mono-tabular"
                >
                  Call {settings.phone}
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 rounded-xl overflow-hidden border border-white/15 bg-[#12263F] h-80 sm:h-96 relative">
              <iframe
                title="RRJ Roofing & Construction Fort Worth Map - 4466 Hardy St, Fort Worth, TX 76106"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-97.4100%2C32.7800%2C-97.2900%2C32.8600&layer=mapnik&marker=32.8224%2C-97.3517"
                className="w-full h-full border-0 filter contrast-105"
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-[#0B1B2E]/90 backdrop-blur-xs p-3 rounded-lg border border-white/15 flex items-center justify-between gap-2 text-xs">
                <div>
                  <strong className="text-white block">RRJ Roofing &amp; Construction, LLC</strong>
                  <span className="text-white/75">4466 Hardy St, Fort Worth, TX 76106</span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=4466+Hardy+St+Fort+Worth+TX+76106"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-[#D9732B] text-white font-semibold whitespace-nowrap"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
