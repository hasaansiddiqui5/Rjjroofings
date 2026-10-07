import { BookingItem, BusinessHoursDay, BlockedDateItem, SiteSettings } from '../types';

export const CHICAGO_TZ = 'America/Chicago';

export function getNowInChicago(): {
  dateStr: string;
  timeStr: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CHICAGO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  const year = parseInt(map.year || '2026', 10);
  const month = parseInt(map.month || '10', 10);
  const day = parseInt(map.day || '07', 10);
  const hour = parseInt(map.hour === '24' ? '00' : map.hour || '12', 10);
  const minute = parseInt(map.minute || '00', 10);

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return { dateStr, timeStr, year, month, day, hour, minute };
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map((n) => parseInt(n, 10));
  return h * 60 + m;
}

export function minutesToTimeStr(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTime12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${suffix}`;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateObj);
}

export function getDayOfWeekFromDateStr(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return dateObj.getUTCDay();
}

export interface GeneratedTimeSlot {
  time: string;
  label: string;
  available: boolean;
  reason?: string;
}

export function generateAvailableSlotsForDate(params: {
  dateStr: string;
  serviceDurationMinutes: number;
  urgency: 'STANDARD' | 'EMERGENCY_STORM';
  settings: SiteSettings;
  businessHours: BusinessHoursDay[];
  blockedDates: BlockedDateItem[];
  bookings: BookingItem[];
  excludeBookingId?: string;
}): {
  isDateClosed: boolean;
  closedReason?: string;
  slots: GeneratedTimeSlot[];
} {
  const {
    dateStr,
    serviceDurationMinutes,
    urgency,
    settings,
    businessHours,
    blockedDates,
    bookings,
    excludeBookingId,
  } = params;

  const nowChicago = getNowInChicago();

  if (dateStr < nowChicago.dateStr) {
    return { isDateClosed: true, closedReason: 'Past date', slots: [] };
  }

  const blocked = blockedDates.find((b) => b.date === dateStr);
  if (blocked && !(urgency === 'EMERGENCY_STORM' && settings.emergencyBypassNotice)) {
    return { isDateClosed: true, closedReason: blocked.reason, slots: [] };
  }

  const dayOfWeek = getDayOfWeekFromDateStr(dateStr);
  const dayConfig = businessHours.find((bh) => bh.dayOfWeek === dayOfWeek);

  if (!dayConfig || dayConfig.isClosed) {
    if (urgency === 'EMERGENCY_STORM' && settings.emergencyBypassNotice) {
      const emergencySlots = ['09:00', '11:00', '14:00', '16:00'].map((t) => {
        const conflict = bookings.some(
          (b) =>
            b.id !== excludeBookingId &&
            b.date === dateStr &&
            b.timeSlot === t &&
            b.status !== 'CANCELLED'
        );
        return {
          time: t,
          label: `${formatTime12Hour(t)} CT (Emergency Dispatch)`,
          available: !conflict,
          reason: conflict ? 'Reserved' : undefined,
        };
      });
      return { isDateClosed: false, slots: emergencySlots };
    }
    return { isDateClosed: true, closedReason: 'Closed on Sundays (Emergency dispatch available)', slots: [] };
  }

  const openMins = parseTimeToMinutes(dayConfig.openTime);
  const closeMins = parseTimeToMinutes(dayConfig.closeTime);
  const breakStartMins = dayConfig.breakStart ? parseTimeToMinutes(dayConfig.breakStart) : -1;
  const breakEndMins = dayConfig.breakEnd ? parseTimeToMinutes(dayConfig.breakEnd) : -1;

  const stepMins = Math.max(30, settings.slotIntervalMinutes + settings.bufferTravelMinutes);
  const activeDayBookings = bookings.filter(
    (b) =>
      b.id !== excludeBookingId &&
      b.date === dateStr &&
      b.status !== 'CANCELLED'
  );

  const slots: GeneratedTimeSlot[] = [];
  let cursor = openMins;

  const nowTotalMins = nowChicago.hour * 60 + nowChicago.minute;
  const minNoticeMins =
    urgency === 'EMERGENCY_STORM' && settings.emergencyBypassNotice
      ? 30
      : settings.minNoticeHours * 60;

  while (cursor + serviceDurationMinutes <= closeMins) {
    const slotEnd = cursor + serviceDurationMinutes;

    if (breakStartMins >= 0 && breakEndMins > breakStartMins) {
      const overlapsBreak = cursor < breakEndMins && slotEnd > breakStartMins;
      if (overlapsBreak) {
        cursor = breakEndMins;
        continue;
      }
    }

    const timeStr = minutesToTimeStr(cursor);
    let available = true;
    let reason: string | undefined;

    if (dateStr === nowChicago.dateStr) {
      if (cursor < nowTotalMins + minNoticeMins) {
        available = false;
        reason = 'Within minimum notice window';
      }
    }

    if (available) {
      for (const existing of activeDayBookings) {
        const exStart = parseTimeToMinutes(existing.timeSlot);
        const exEnd = exStart + (existing.durationMinutes || 60) + settings.bufferTravelMinutes;
        const thisEndWithBuffer = slotEnd + settings.bufferTravelMinutes;

        if (cursor < exEnd && thisEndWithBuffer > exStart) {
          available = false;
          reason = 'Already booked';
          break;
        }
      }
    }

    slots.push({
      time: timeStr,
      label: `${formatTime12Hour(timeStr)} CT`,
      available,
      reason,
    });

    cursor += stepMins;
  }

  return {
    isDateClosed: false,
    slots,
  };
}

export function generateICSFileContent(booking: BookingItem, settings: SiteSettings): string {
  const [y, m, d] = booking.date.split('-').map(Number);
  const [hr, min] = booking.timeSlot.split(':').map(Number);

  const pad = (n: number) => String(n).padStart(2, '0');
  const startLocal = `${y}${pad(m)}${pad(d)}T${pad(hr)}${pad(min)}00`;

  const endTotalMins = hr * 60 + min + (booking.durationMinutes || 60);
  const endHr = Math.floor(endTotalMins / 60);
  const endMin = endTotalMins % 60;
  const endLocal = `${y}${pad(m)}${pad(d)}T${pad(endHr)}${pad(endMin)}00`;

  const description = [
    `Booking Reference: ${booking.referenceCode}`,
    `Service: ${booking.serviceName}`,
    `Urgency: ${booking.urgency === 'EMERGENCY_STORM' ? 'PRIORITY EMERGENCY / STORM DAMAGE' : 'Standard Free Inspection'}`,
    `Inspector Dispatch: ${settings.businessName} (${settings.phone})`,
    `Property: ${booking.propertyAddress}, ${booking.propertyCity}, TX ${booking.propertyZip}`,
  ].join('\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RRJ Roofing & Construction LLC//NONSGML Inspection Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.referenceCode}@rrjroofing.com`,
    `SUMMARY:${booking.serviceName} – ${settings.businessName}`,
    `DTSTART;TZID=America/Chicago:${startLocal}`,
    `DTEND;TZID=America/Chicago:${endLocal}`,
    `LOCATION:${booking.propertyAddress}\\, ${booking.propertyCity}\\, TX ${booking.propertyZip}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
