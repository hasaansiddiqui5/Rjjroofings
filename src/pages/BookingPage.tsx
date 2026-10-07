import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Trash2,
  Download,
  Phone,
  ShieldCheck,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RouteState } from '../components/PublicLayout';
import {
  getNowInChicago,
  generateAvailableSlotsForDate,
  formatDisplayDate,
  formatTime12Hour,
  generateICSFileContent,
} from '../utils/timezone';
import { BookingItem, BookingPhoto, ContactMethod, RoofType, UrgencyLevel } from '../types';

interface BookingPageProps {
  preselectedServiceId?: string;
  preselectedUrgency?: UrgencyLevel;
  manageToken?: string;
  navigate: (route: RouteState) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  preselectedServiceId,
  preselectedUrgency = 'STANDARD',
  manageToken,
  navigate,
}) => {
  const { db, createBooking, updateBookingStatus, rescheduleBooking } = useApp();
  const { settings, services, businessHours, blockedDates, bookings } = db;
  const activeServices = services.filter((s) => s.active).sort((a, b) => a.displayOrder - b.displayOrder);

  const nowChicago = useMemo(() => getNowInChicago(), []);

  const calendarDates = useMemo(() => {
    const [y, m, d] = nowChicago.dateStr.split('-').map(Number);
    const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const list: { dateStr: string; dayNum: number; monthShort: string; weekdayShort: string }[] = [];

    const maxDays = Math.min(settings.maxAdvanceDays || 60, 35);
    for (let i = 0; i < maxDays; i++) {
      const dt = new Date(base.getTime() + i * 86_400_000);
      const yr = dt.getUTCFullYear();
      const mo = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const da = String(dt.getUTCDate()).padStart(2, '0');
      const dateStr = `${yr}-${mo}-${da}`;

      const weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(dt);
      const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(dt);

      list.push({ dateStr, dayNum: dt.getUTCDate(), monthShort, weekdayShort });
    }
    return list;
  }, [nowChicago.dateStr, settings.maxAdvanceDays]);

  const [step, setStep] = useState<number>(1);
  const [serviceId, setServiceId] = useState<string>(
    preselectedServiceId || activeServices[0]?.id || 'srv-1'
  );
  const [urgency, setUrgency] = useState<UrgencyLevel>(preselectedUrgency);

  const defaultDate = calendarDates[1]?.dateStr || nowChicago.dateStr;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyCity, setPropertyCity] = useState('Fort Worth');
  const [propertyZip, setPropertyZip] = useState('76106');
  const [roofType, setRoofType] = useState<RoofType>('SHINGLE');
  const [roofAgeYears, setRoofAgeYears] = useState<number>(12);
  const [issueDescription, setIssueDescription] = useState('');
  const [insuranceClaim, setInsuranceClaim] = useState<boolean>(false);
  const [preferredContact, setPreferredContact] = useState<ContactMethod>('PHONE');
  const [photos, setPhotos] = useState<BookingPhoto[]>([]);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>('');

  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingItem | null>(null);

  const [lookupTokenOrRef, setLookupTokenOrRef] = useState<string>(manageToken || '');
  const [managedBooking, setManagedBooking] = useState<BookingItem | null>(() => {
    if (!manageToken) return null;
    return (
      bookings.find(
        (b) =>
          b.cancelToken === manageToken ||
          b.referenceCode.toLowerCase() === manageToken.toLowerCase()
      ) || null
    );
  });
  const [reschedDate, setReschedDate] = useState<string>(defaultDate);
  const [reschedTime, setReschedTime] = useState<string>('10:30');
  const [manageFeedback, setManageFeedback] = useState<string>('');

  const selectedService = activeServices.find((s) => s.id === serviceId) || activeServices[0];

  const slotResult = useMemo(() => {
    return generateAvailableSlotsForDate({
      dateStr: selectedDate,
      serviceDurationMinutes: selectedService?.estimatedDuration || 60,
      urgency,
      settings,
      businessHours,
      blockedDates,
      bookings,
    });
  }, [selectedDate, selectedService, urgency, settings, businessHours, blockedDates, bookings]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setFormError('');

    if (photos.length + files.length > 5) {
      setFormError('You may upload a maximum of 5 roof/property photos.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setFormError('Only image files (JPG, PNG, WEBP) are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Each image must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [
            ...prev.slice(0, 4),
            {
              id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              url: reader.result as string,
              caption: file.name,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleNextStep = () => {
    setFormError('');
    if (step === 1) {
      if (!serviceId) {
        setFormError('Please select a roofing or construction service.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedDate) {
        setFormError('Please select an inspection date.');
        return;
      }
      const openCount = slotResult.slots.filter((s) => s.available).length;
      if (slotResult.isDateClosed || openCount === 0) {
        setFormError(
          slotResult.closedReason ||
            'No open time slots on this date. Please choose another date or select Emergency Storm Damage priority.'
        );
        return;
      }
      if (!selectedTimeSlot || !slotResult.slots.some((s) => s.time === selectedTimeSlot && s.available)) {
        const first = slotResult.slots.find((s) => s.available);
        if (first) setSelectedTimeSlot(first.time);
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedTimeSlot) {
        setFormError('Please choose an available time slot.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setFormError('Please enter your full name.');
        return;
      }
      if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
        setFormError('Please enter a valid 10-digit phone number.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setFormError('Please enter a valid email address for your confirmation.');
        return;
      }
      if (!propertyAddress.trim() || !propertyCity.trim() || !propertyZip.trim()) {
        setFormError('Please enter the complete Fort Worth / DFW property address, city, and ZIP code.');
        return;
      }
      if (!issueDescription.trim() || issueDescription.trim().length < 8) {
        setFormError('Please briefly describe what you need inspected (e.g., hail damage, leak, replacement quote).');
        return;
      }
      if (!consentChecked) {
        setFormError('Please check the box authorizing RRJ Roofing & Construction to perform your on-site inspection.');
        return;
      }
      setStep(5);
    }
  };

  const handleConfirmBooking = async () => {
    setFormError('');
    setIsSubmitting(true);
    const result = await createBooking({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      customerName: fullName.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      durationMinutes: selectedService.estimatedDuration,
      urgency,
      roofType,
      roofAgeYears,
      issueDescription: issueDescription.trim(),
      insuranceClaim,
      preferredContact,
      propertyAddress: propertyAddress.trim(),
      propertyCity: propertyCity.trim(),
      propertyZip: propertyZip.trim(),
      internalNotes: '',
      photos,
      honeypot,
    });
    setIsSubmitting(false);

    if (!result.ok || !result.booking) {
      setFormError(result.error || 'Could not complete booking. Please choose another slot.');
      return;
    }

    setConfirmedBooking(result.booking);
    setStep(6);
  };

  const handleDownloadICS = (booking: BookingItem) => {
    const icsContent = generateICSFileContent(booking, settings);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${booking.referenceCode}-RRJ-Roof-Inspection.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLookupBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setManageFeedback('');
    const q = lookupTokenOrRef.trim().toLowerCase();
    const found = bookings.find(
      (b) => b.referenceCode.toLowerCase() === q || b.cancelToken.toLowerCase() === q
    );
    if (!found) {
      setManageFeedback('No booking found matching that reference code or token. Try e.g. RRJ-2026-8814');
      setManagedBooking(null);
      return;
    }
    setManagedBooking(found);
    setReschedDate(found.date);
    setReschedTime(found.timeSlot);
  };

  return (
    <div className="py-12 lg:py-20 max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 pb-8 border-b border-[#0B1B2E]/12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-[#D9732B]">
              Free 21-Point Roof Inspection &amp; Written Estimate · America/Chicago (CT)
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B1B2E] mt-1">
              Schedule Your On-Site Inspection
            </h1>
          </div>
          <a
            href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
            className="px-4 py-2.5 rounded-xl bg-[#0B1B2E] text-white text-xs font-mono-tabular font-semibold flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5 text-[#D9732B]" />
            Immediate Dispatch: {settings.phone}
          </a>
        </div>

        {step <= 5 && (
          <div className="pt-4 grid grid-cols-5 gap-2">
            {[
              { s: 1, label: '01. Service & Urgency' },
              { s: 2, label: '02. Select Date' },
              { s: 3, label: '03. Time Slot (CT)' },
              { s: 4, label: '04. Property Details' },
              { s: 5, label: '05. Review & Confirm' },
            ].map((item) => (
              <button
                key={item.s}
                type="button"
                disabled={item.s > step}
                onClick={() => item.s < step && setStep(item.s)}
                className={`text-left p-2.5 rounded-lg border transition-colors ${
                  step === item.s
                    ? 'bg-[#0B1B2E] text-white border-[#0B1B2E]'
                    : item.s < step
                    ? 'bg-white text-[#0B1B2E] border-[#D9732B] cursor-pointer'
                    : 'bg-white/50 text-[#5E6B7A] border-[#0B1B2E]/10 opacity-60'
                }`}
              >
                <div className="text-[11px] font-mono-tabular font-semibold truncate">{item.label}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {formError && (
        <div
          role="alert"
          className="mt-6 p-4 rounded-xl bg-red-950 text-white border border-red-700 flex items-center gap-3 text-xs sm:text-sm font-medium"
        >
          <AlertTriangle className="w-5 h-5 text-[#E8873F] shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 space-y-8">
          <div className="bg-white rounded-xl border border-[#0B1B2E]/12 p-6 space-y-4">
            <div className="eyebrow text-[#D9732B]">Step 1A · Select Request Priority</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUrgency('STANDARD')}
                className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  urgency === 'STANDARD'
                    ? 'border-[#0B1B2E] bg-[#0B1B2E] text-white'
                    : 'border-[#0B1B2E]/15 bg-[#F7F5F2] text-[#0B1B2E] hover:border-[#0B1B2E]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Standard Free Roof Inspection / Estimate</span>
                  <ShieldCheck className="w-5 h-5 text-[#D9732B]" />
                </div>
                <p className={`mt-1.5 text-xs leading-relaxed ${urgency === 'STANDARD' ? 'text-white/80' : 'text-[#5E6B7A]'}`}>
                  Ideal for full roof replacement quotes, routine hail/wind checks, standing seam metal consultations, commercial flat roofs, or gutter &amp; siding estimates.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUrgency('EMERGENCY_STORM');
                  const stormSrv = activeServices.find((s) => s.slug === 'storm-hail-damage-restoration');
                  if (stormSrv) setServiceId(stormSrv.id);
                }}
                className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  urgency === 'EMERGENCY_STORM'
                    ? 'border-[#D9732B] bg-[#D9732B] text-white shadow-md'
                    : 'border-[#D9732B]/40 bg-amber-50/60 text-[#0B1B2E] hover:border-[#D9732B]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Emergency / Active Storm Damage Priority</span>
                  <AlertTriangle className={`w-5 h-5 ${urgency === 'EMERGENCY_STORM' ? 'text-white' : 'text-[#D9732B]'}`} />
                </div>
                <p className={`mt-1.5 text-xs leading-relaxed ${urgency === 'EMERGENCY_STORM' ? 'text-white/95' : 'text-[#0B1B2E]/80'}`}>
                  Active interior leak, blown-off shingles, tree impact, or urgent tarping needed. Bypasses standard advance notice windows and triggers an instant priority alert to our Fort Worth dispatch desk.
                </p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#0B1B2E]/12 p-6 space-y-4">
            <div className="eyebrow text-[#D9732B]">Step 1B · Select Service Category</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeServices.map((srv) => {
                const isSelected = srv.id === serviceId;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setServiceId(srv.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0B1B2E] text-white border-[#0B1B2E] ring-2 ring-[#D9732B]'
                        : 'bg-[#F7F5F2]/70 text-[#0B1B2E] border-[#0B1B2E]/12 hover:border-[#D9732B]'
                    }`}
                  >
                    <div>
                      <div className="font-display font-bold text-base">{srv.name}</div>
                      <p className={`mt-1 text-xs line-clamp-2 ${isSelected ? 'text-white/75' : 'text-[#5E6B7A]'}`}>
                        {srv.shortDescription}
                      </p>
                    </div>
                    <div className={`mt-3 pt-2 border-t text-[11px] font-mono-tabular flex justify-between ${isSelected ? 'border-white/15 text-[#E8873F]' : 'border-[#0B1B2E]/10 text-[#5E6B7A]'}`}>
                      <span>Free On-Site Inspection</span>
                      <span>~{srv.estimatedDuration} mins</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNextStep}
              className="px-7 py-4 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center gap-2 cursor-pointer"
            >
              Continue to Date Selection
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-8 bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0B1B2E]/10 pb-4">
            <div>
              <div className="eyebrow text-[#D9732B]">Step 02 · Choose Inspection Date</div>
              <h2 className="font-display text-2xl font-bold text-[#0B1B2E]">
                Select a Date ({settings.timezone})
              </h2>
            </div>
            <div className="text-xs font-mono-tabular text-[#5E6B7A]">
              Selected Trade: <strong className="text-[#0B1B2E]">{selectedService.name}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {calendarDates.map((d) => {
              const dayEval = generateAvailableSlotsForDate({
                dateStr: d.dateStr,
                serviceDurationMinutes: selectedService.estimatedDuration,
                urgency,
                settings,
                businessHours,
                blockedDates,
                bookings,
              });
              const openCount = dayEval.slots.filter((s) => s.available).length;
              const disabled = dayEval.isDateClosed || openCount === 0;
              const isSelected = selectedDate === d.dateStr;

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedDate(d.dateStr);
                    const first = dayEval.slots.find((s) => s.available);
                    if (first) setSelectedTimeSlot(first.time);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    disabled
                      ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-[#0B1B2E] text-white border-[#0B1B2E] ring-2 ring-[#D9732B] cursor-pointer'
                      : 'bg-[#F7F5F2] text-[#0B1B2E] border-[#0B1B2E]/12 hover:border-[#D9732B] cursor-pointer'
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-wider opacity-75">{d.weekdayShort}</div>
                  <div className="font-display text-xl font-extrabold my-0.5 font-mono-tabular">
                    {d.monthShort} {d.dayNum}
                  </div>
                  <div className={`text-[10px] font-mono-tabular ${isSelected ? 'text-[#E8873F]' : 'text-[#5E6B7A]'}`}>
                    {disabled ? 'Closed' : `${openCount} Slots`}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#0B1B2E]/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl border border-[#0B1B2E]/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-7 py-3.5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center gap-2 cursor-pointer"
            >
              Continue to Time Slots
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0B1B2E]/10 pb-4">
            <div>
              <div className="eyebrow text-[#D9732B]">Step 03 · Choose Available Arrival Window</div>
              <h2 className="font-display text-2xl font-bold text-[#0B1B2E]">
                Available Slots for {formatDisplayDate(selectedDate)}
              </h2>
            </div>
            <span className="text-xs font-mono-tabular text-[#5E6B7A]">
              All times in Central Time (America/Chicago)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slotResult.slots.map((slot) => {
              const isSelected = selectedTimeSlot === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedTimeSlot(slot.time)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    !slot.available
                      ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                      : isSelected
                      ? 'bg-[#0B1B2E] text-white border-[#0B1B2E] ring-2 ring-[#D9732B] cursor-pointer'
                      : 'bg-[#F7F5F2] text-[#0B1B2E] border-[#0B1B2E]/15 hover:border-[#D9732B] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tabular font-bold text-sm">{slot.label}</span>
                    <Clock className={`w-4 h-4 ${isSelected ? 'text-[#E8873F]' : 'text-[#5E6B7A]'}`} />
                  </div>
                  <div className="mt-1 text-[11px] opacity-75">
                    {slot.available ? `Available · ${selectedService.estimatedDuration}m` : slot.reason || 'Reserved'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#0B1B2E]/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl border border-[#0B1B2E]/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Change Date
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-7 py-3.5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center gap-2 cursor-pointer"
            >
              Continue to Property Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8 bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#0B1B2E]/10 pb-4">
            <div className="eyebrow text-[#D9732B]">Step 04 · Property &amp; Roof Specifications</div>
            <h2 className="font-display text-2xl font-bold text-[#0B1B2E]">
              Where Should Our Fort Worth Estimator Meet You?
            </h2>
          </div>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="company-website-hp">Company Website</label>
            <input
              id="company-website-hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="bk-name" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Full Name *
              </label>
              <input
                id="bk-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Robert Garrison"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm"
              />
            </div>
            <div>
              <label htmlFor="bk-phone" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Mobile / Direct Phone *
              </label>
              <input
                id="bk-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(817) 555-0144"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm font-mono-tabular"
              />
            </div>
            <div>
              <label htmlFor="bk-email" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Email Address *
              </label>
              <input
                id="bk-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="robert@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label htmlFor="bk-addr" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Property Street Address *
              </label>
              <input
                id="bk-addr"
                type="text"
                required
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                placeholder="4820 Camp Bowie Blvd"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm"
              />
            </div>
            <div className="sm:col-span-4">
              <label htmlFor="bk-city" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                City (DFW Area) *
              </label>
              <input
                id="bk-city"
                type="text"
                required
                value={propertyCity}
                onChange={(e) => setPropertyCity(e.target.value)}
                placeholder="Fort Worth"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bk-zip" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                ZIP Code *
              </label>
              <input
                id="bk-zip"
                type="text"
                required
                value={propertyZip}
                onChange={(e) => setPropertyZip(e.target.value)}
                placeholder="76107"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm font-mono-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="bk-rooftype" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Current Roof Material
              </label>
              <select
                id="bk-rooftype"
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as RoofType)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm bg-white"
              >
                <option value="SHINGLE">Asphalt Shingle</option>
                <option value="METAL">Standing Seam / Metal</option>
                <option value="TILE">Clay / Concrete Tile</option>
                <option value="FLAT_TPO">Flat / Commercial TPO</option>
                <option value="UNSURE">Unsure</option>
              </select>
            </div>

            <div>
              <label htmlFor="bk-roofage" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Approx. Roof Age (Years)
              </label>
              <input
                id="bk-roofage"
                type="number"
                min={0}
                max={80}
                value={roofAgeYears}
                onChange={(e) => setRoofAgeYears(parseInt(e.target.value || '0', 10))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm font-mono-tabular"
              />
            </div>

            <div>
              <label htmlFor="bk-claim" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Insurance Claim Involved?
              </label>
              <select
                id="bk-claim"
                value={insuranceClaim ? 'YES' : 'NO'}
                onChange={(e) => setInsuranceClaim(e.target.value === 'YES')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm bg-white"
              >
                <option value="NO">No / Retail Estimate</option>
                <option value="YES">Yes – Storm / Insurance Claim</option>
              </select>
            </div>

            <div>
              <label htmlFor="bk-contact-pref" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
                Preferred Contact Method
              </label>
              <select
                id="bk-contact-pref"
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value as ContactMethod)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm bg-white"
              >
                <option value="PHONE">Phone Call</option>
                <option value="TEXT">Text Message (SMS)</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="bk-issue" className="block text-xs font-semibold text-[#0B1B2E] mb-1">
              Describe Your Roof Issue or Project Goal *
            </label>
            <textarea
              id="bk-issue"
              rows={3}
              required
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="e.g., Hail hit last Tuesday; noticed missing shingles near chimney and granule buildup in gutters. Gate code is #1492."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#0B1B2E]/20 text-sm"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#F7F5F2] border border-[#0B1B2E]/12 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#0B1B2E] block">
                  Optional: Upload Damage or Property Photos (Up to 5 Images)
                </span>
                <span className="text-[11px] text-[#5E6B7A]">
                  Have photos of ceiling water spots, blown shingles, or hail stones? Attach them for our estimator.
                </span>
              </div>
              <label className="px-3.5 py-2 rounded-lg bg-white border border-[#0B1B2E]/20 hover:border-[#D9732B] text-xs font-semibold text-[#0B1B2E] flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#D9732B]" />
                Add Photos ({photos.length}/5)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {photos.map((ph) => (
                  <div key={ph.id} className="relative rounded-lg overflow-hidden border border-[#0B1B2E]/15 h-20 bg-[#0B1B2E]">
                    <img src={ph.url} alt={ph.caption || 'Uploaded roof photo'} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((item) => item.id !== ph.id))}
                      className="absolute top-1 right-1 p-1 rounded bg-black/70 text-white hover:bg-red-600"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 text-xs text-[#0B1B2E] cursor-pointer">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#D9732B]"
            />
            <span>
              I authorize <strong>{settings.businessName}</strong> to access the exterior roof/property at the address above for my free inspection and to contact me via phone, SMS, or email regarding my appointment.
            </span>
          </label>

          <div className="pt-4 border-t border-[#0B1B2E]/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-3 rounded-xl border border-[#0B1B2E]/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Time Slot
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-7 py-3.5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center gap-2 cursor-pointer"
            >
              Review Appointment Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="mt-8 bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#0B1B2E]/10 pb-4 flex items-center justify-between">
            <div>
              <div className="eyebrow text-[#D9732B]">Step 05 · Final Verification</div>
              <h2 className="font-display text-2xl font-bold text-[#0B1B2E]">
                Review &amp; Confirm Your Free Inspection
              </h2>
            </div>
            {urgency === 'EMERGENCY_STORM' && (
              <span className="text-xs font-mono-tabular font-bold text-[#D9732B]">
                PRIORITY EMERGENCY / STORM REQUEST
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="p-5 rounded-xl bg-[#F7F5F2] space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5E6B7A]">
                Appointment Schedule
              </div>
              <div className="font-display text-lg font-bold text-[#0B1B2E]">{selectedService.name}</div>
              <div className="font-mono-tabular text-sm text-[#0B1B2E]">
                Date: <strong>{formatDisplayDate(selectedDate)}</strong>
              </div>
              <div className="font-mono-tabular text-sm text-[#0B1B2E]">
                Arrival Slot: <strong>{formatTime12Hour(selectedTimeSlot)} CT (America/Chicago)</strong>
              </div>
              <div className="text-xs text-[#5E6B7A]">
                Est. Duration: {selectedService.estimatedDuration} Minutes · $0.00 Free Inspection
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#F7F5F2] space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#5E6B7A]">
                Homeowner &amp; Property Location
              </div>
              <div className="font-bold text-[#0B1B2E]">{fullName}</div>
              <div className="font-mono-tabular text-xs text-[#0B1B2E]">
                {phone} · {email} (Preferred: {preferredContact})
              </div>
              <div className="text-xs text-[#0B1B2E]">
                Property: <strong>{propertyAddress}, {propertyCity}, TX {propertyZip}</strong>
              </div>
              <div className="text-xs text-[#5E6B7A]">
                Roof: {roofType} (~{roofAgeYears} yrs) · Insurance Claim: {insuranceClaim ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#0B1B2E]/10 text-xs text-[#0B1B2E] space-y-1">
            <strong className="block">Inspection Notes:</strong>
            <p className="text-[#5E6B7A]">{issueDescription}</p>
          </div>

          <div className="pt-4 border-t border-[#0B1B2E]/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-5 py-3 rounded-xl border border-[#0B1B2E]/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Edit Details
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmBooking}
              className="px-8 py-4 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-base flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isSubmitting ? 'Locking Slot...' : 'Confirm Free Roof Inspection'}
            </button>
          </div>
        </div>
      )}

      {step === 6 && confirmedBooking && (
        <div className="mt-8 bg-[#0B1B2E] text-white rounded-2xl p-8 sm:p-12 border border-white/15 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
            <div className="space-y-2">
              <div className="eyebrow text-[#E8873F]">
                {confirmedBooking.urgency === 'EMERGENCY_STORM'
                  ? 'Priority Storm Alert Dispatched to Fort Worth Crew'
                  : 'Inspection Slot Locked & Confirmed'}
              </div>
              <h2 className="font-display text-3xl font-extrabold text-white">
                Booking Reference: <span className="font-mono-tabular text-[#E8873F]">{confirmedBooking.referenceCode}</span>
              </h2>
              <p className="text-sm text-white/80">
                A confirmation email and calendar invitation have been sent to <strong>{confirmedBooking.customerEmail}</strong> and our dispatch desk at <strong>{settings.notificationEmail}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadICS(confirmedBooking)}
              className="px-5 py-3 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Add to Calendar (.ics)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="p-5 rounded-xl bg-[#12263F] border border-white/10 space-y-1.5">
              <div className="text-white/60 text-xs">Date &amp; Arrival Window</div>
              <div className="font-mono-tabular font-bold text-base text-white">
                {formatDisplayDate(confirmedBooking.date)}
              </div>
              <div className="font-mono-tabular text-[#E8873F]">
                {formatTime12Hour(confirmedBooking.timeSlot)} CT (America/Chicago)
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#12263F] border border-white/10 space-y-1.5">
              <div className="text-white/60 text-xs">Property Location</div>
              <div className="font-bold text-white">{confirmedBooking.propertyAddress}</div>
              <div className="text-white/80">
                {confirmedBooking.propertyCity}, TX {confirmedBooking.propertyZip}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#12263F] border border-white/10 space-y-1.5">
              <div className="text-white/60 text-xs">Secure Cancel / Reschedule Token</div>
              <div className="font-mono-tabular font-bold text-white">{confirmedBooking.cancelToken}</div>
              <button
                type="button"
                onClick={() => {
                  setLookupTokenOrRef(confirmedBooking.referenceCode);
                  setManagedBooking(confirmedBooking);
                }}
                className="text-xs text-[#E8873F] underline cursor-pointer"
              >
                Manage or Reschedule Below ↓
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="px-5 py-2.5 rounded-lg border border-white/25 text-xs font-semibold text-white cursor-pointer"
            >
              Return to Homepage
            </button>
            <button
              type="button"
              onClick={() => navigate({ page: 'admin' })}
              className="text-xs text-[#E8873F] hover:underline cursor-pointer"
            >
              View Booking in Admin Dashboard →
            </button>
          </div>
        </div>
      )}

      <div className="mt-16 pt-12 border-t border-[#0B1B2E]/12">
        <div className="bg-white rounded-xl border border-[#0B1B2E]/12 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="eyebrow text-[#D9732B]">Existing Appointment Portal</div>
              <h3 className="font-display text-xl font-bold text-[#0B1B2E]">
                Reschedule or Cancel an Existing Inspection
              </h3>
              <p className="text-xs text-[#5E6B7A]">
                Enter your booking reference code (e.g., <code className="font-mono-tabular">RRJ-2026-8814</code>) or secure token from your confirmation email.
              </p>
            </div>

            <form onSubmit={handleLookupBooking} className="flex items-center gap-2">
              <input
                type="text"
                value={lookupTokenOrRef}
                onChange={(e) => setLookupTokenOrRef(e.target.value)}
                placeholder="RRJ-2026-8814"
                className="px-3.5 py-2 rounded-lg border border-[#0B1B2E]/20 text-xs font-mono-tabular"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0B1B2E] text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                Locate Booking
              </button>
            </form>
          </div>

          {manageFeedback && (
            <p className="text-xs font-medium text-[#D9732B]">{manageFeedback}</p>
          )}

          {managedBooking && (
            <div className="p-5 rounded-xl bg-[#F7F5F2] border border-[#0B1B2E]/12 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono-tabular font-bold text-[#D9732B]">
                    {managedBooking.referenceCode} · Status: {managedBooking.status}
                  </span>
                  <h4 className="font-display text-lg font-bold text-[#0B1B2E]">
                    {managedBooking.serviceName} — {managedBooking.customerName}
                  </h4>
                  <p className="text-xs text-[#5E6B7A]">
                    Scheduled for {formatDisplayDate(managedBooking.date)} at {formatTime12Hour(managedBooking.timeSlot)} CT · {managedBooking.propertyAddress}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadICS(managedBooking)}
                  className="px-3 py-1.5 rounded-lg border border-[#0B1B2E]/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" /> Download .ics
                </button>
              </div>

              {managedBooking.status !== 'CANCELLED' && (
                <div className="pt-3 border-t border-[#0B1B2E]/10 flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0B1B2E] mb-1">New Date</label>
                      <input
                        type="date"
                        min={nowChicago.dateStr}
                        value={reschedDate}
                        onChange={(e) => setReschedDate(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-[#0B1B2E]/20 text-xs bg-white font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0B1B2E] mb-1">New Time (CT)</label>
                      <select
                        value={reschedTime}
                        onChange={(e) => setReschedTime(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-[#0B1B2E]/20 text-xs bg-white font-mono-tabular"
                      >
                        <option value="08:00">8:00 AM CT</option>
                        <option value="09:30">9:30 AM CT</option>
                        <option value="11:00">11:00 AM CT</option>
                        <option value="13:30">1:30 PM CT</option>
                        <option value="15:00">3:00 PM CT</option>
                        <option value="16:30">4:30 PM CT</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const res = rescheduleBooking(managedBooking.id, reschedDate, reschedTime);
                        if (!res.ok) {
                          setManageFeedback(res.error || 'Could not reschedule.');
                        } else {
                          setManagedBooking({
                            ...managedBooking,
                            date: reschedDate,
                            timeSlot: reschedTime,
                            status: 'RESCHEDULED',
                          });
                          setManageFeedback('Your inspection has been rescheduled.');
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0B1B2E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Confirm Reschedule
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateBookingStatus(managedBooking.id, 'CANCELLED', 'Cancelled by customer via self-service token.');
                      setManagedBooking({ ...managedBooking, status: 'CANCELLED' });
                      setManageFeedback('Your appointment has been cancelled and the slot released.');
                    }}
                    className="px-4 py-2 rounded-lg border border-red-600 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
