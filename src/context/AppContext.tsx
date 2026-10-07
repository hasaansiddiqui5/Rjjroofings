import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppDatabaseState,
  BookingItem,
  BookingStatus,
  BlockedDateItem,
  BusinessHoursDay,
  ContactMessageItem,
  CustomerItem,
  ProjectItem,
  Role,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
  UserAccount,
} from '../types';
import { INITIAL_SEED_DATA } from '../data/seedData';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface AuthSession {
  user: {
    name: string;
    email: string;
    role: Role;
  } | null;
}

interface AppContextValue {
  db: AppDatabaseState;
  session: AuthSession;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => void;
  createBooking: (
    payload: Omit<
      BookingItem,
      'id' | 'referenceCode' | 'cancelToken' | 'customerId' | 'createdAt' | 'updatedAt' | 'status'
    > & { honeypot?: string }
  ) => Promise<{ ok: boolean; booking?: BookingItem; error?: string }>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, internalNotes?: string) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newTimeSlot: string) => { ok: boolean; error?: string };
  updateBookingNotes: (bookingId: string, notes: string) => void;
  upsertService: (service: Partial<ServiceItem> & { name: string }) => void;
  deleteService: (serviceId: string) => void;
  reorderService: (serviceId: string, direction: 'up' | 'down') => void;
  updateBusinessHours: (hours: BusinessHoursDay[]) => void;
  addBlockedDate: (item: Omit<BlockedDateItem, 'id'>) => void;
  removeBlockedDate: (id: string) => void;
  updateSettings: (settings: Partial<SiteSettings>) => void;
  updateCustomer: (customerId: string, data: Partial<CustomerItem>) => void;
  upsertProject: (project: Partial<ProjectItem> & { title: string }) => void;
  deleteProject: (projectId: string) => void;
  upsertTestimonial: (testimonial: Partial<TestimonialItem> & { authorName: string }) => void;
  deleteTestimonial: (id: string) => void;
  submitContactMessage: (msg: Omit<ContactMessageItem, 'id' | 'isRead' | 'createdAt'>) => void;
  markMessageRead: (id: string, replied?: boolean) => void;
  addUserAccount: (user: { name: string; email: string; role: Role }) => void;
  removeUserAccount: (id: string) => void;
  resetDemoDatabase: () => void;
}

const STORAGE_KEY = 'rrj_roofing_db_v2';
const SESSION_KEY = 'rrj_roofing_auth_v2';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<AppDatabaseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.services && parsed.bookings) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_SEED_DATA;
  });

  const [session, setSession] = useState<AuthSession>(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { user: null };
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // ignore
    }
  }, [db]);

  useEffect(() => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }, [session]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `tst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const appendLog = (
    state: AppDatabaseState,
    action: string,
    entityType: 'Booking' | 'Service' | 'Customer' | 'Project' | 'Setting' | 'Auth' | 'Hours',
    details: string,
    entityId?: string
  ) => {
    const actorName = session.user?.name || 'Public Website Visitor';
    return [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        actorName,
        action,
        entityType,
        entityId,
        details,
        createdAt: new Date().toISOString(),
      },
      ...state.activityLogs.slice(0, 99),
    ];
  };

  const loginAdmin = async (email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const validEmails = ['rrjroofings@gmail.com', 'cole@rrjroofing.com', 'dispatch@rrjroofing.com'];
    const validPass = ['AdminPassword2026!', 'RRJRoofing2026!'];

    if (validEmails.includes(normalized) && validPass.includes(password)) {
      const user = {
        name:
          normalized === 'rrjroofings@gmail.com'
            ? 'RRJ Managing Partner (Admin)'
            : normalized.startsWith('cole')
            ? 'Cole Henderson (Senior Field Estimator)'
            : 'Maria Gomez (Claims & Dispatch Coordinator)',
        email: normalized,
        role: (normalized === 'rrjroofings@gmail.com' ? 'ADMIN' : 'STAFF') as Role,
      };
      setSession({ user });
      setDb((prev) => ({
        ...prev,
        activityLogs: appendLog(
          prev,
          'ADMIN_LOGIN',
          'Auth',
          `${user.name} (${user.role}) signed in to dashboard`
        ),
      }));
      addToast({
        title: 'Signed In Successfully',
        description: `Welcome back, ${user.name}.`,
        variant: 'success',
      });
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials. Use rrjroofings@gmail.com / AdminPassword2026!' };
  };

  const logoutAdmin = () => {
    const prevName = session.user?.name || 'Admin';
    setSession({ user: null });
    addToast({
      title: 'Signed Out',
      description: `${prevName} has logged out safely.`,
    });
  };

  const createBooking: AppContextValue['createBooking'] = async (payload) => {
    if (payload.honeypot && payload.honeypot.trim().length > 0) {
      return { ok: false, error: 'Spam verification failed.' };
    }

    const duplicate = db.bookings.some(
      (b) =>
        b.date === payload.date &&
        b.timeSlot === payload.timeSlot &&
        b.status !== 'CANCELLED'
    );

    if (duplicate) {
      return {
        ok: false,
        error: `Time slot ${payload.timeSlot} on ${payload.date} is already booked. Please choose another slot.`,
      };
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `RRJ-2026-${randomDigits}`;
    const cancelToken = `tok-${Date.now().toString(36)}-${randomDigits}`;
    const nowIso = new Date().toISOString();

    let createdBooking!: BookingItem;

    setDb((prev) => {
      const existingCustomer = prev.customers.find(
        (c) => c.email.toLowerCase() === payload.customerEmail.toLowerCase()
      );
      const customerId = existingCustomer ? existingCustomer.id : `cust-${Date.now()}`;

      const updatedCustomers: CustomerItem[] = existingCustomer
        ? prev.customers.map((c) =>
            c.id === existingCustomer.id
              ? {
                  ...c,
                  phone: payload.customerPhone,
                  address: payload.propertyAddress,
                  city: payload.propertyCity,
                  zip: payload.propertyZip,
                  insuranceClaim: c.insuranceClaim || payload.insuranceClaim,
                  tags: Array.from(
                    new Set([
                      ...c.tags,
                      ...(payload.urgency === 'EMERGENCY_STORM' ? ['Emergency', 'Storm Damage'] : []),
                      ...(payload.insuranceClaim ? ['Insurance Claim'] : []),
                    ])
                  ),
                  updatedAt: nowIso,
                }
              : c
          )
        : [
            {
              id: customerId,
              fullName: payload.customerName,
              email: payload.customerEmail,
              phone: payload.customerPhone,
              address: payload.propertyAddress,
              city: payload.propertyCity,
              state: 'TX',
              zip: payload.propertyZip,
              notes: `Booked ${payload.serviceName} (${referenceCode}). ${payload.issueDescription}`,
              tags: [
                payload.serviceName,
                ...(payload.urgency === 'EMERGENCY_STORM' ? ['Emergency', 'Storm Damage'] : []),
                ...(payload.insuranceClaim ? ['Insurance Claim'] : []),
              ],
              insuranceClaim: payload.insuranceClaim,
              createdAt: nowIso,
              updatedAt: nowIso,
            },
            ...prev.customers,
          ];

      createdBooking = {
        id: `bk-${Date.now()}`,
        referenceCode,
        cancelToken,
        serviceId: payload.serviceId,
        serviceName: payload.serviceName,
        customerId,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        date: payload.date,
        timeSlot: payload.timeSlot,
        durationMinutes: payload.durationMinutes,
        urgency: payload.urgency,
        status: 'PENDING',
        roofType: payload.roofType,
        roofAgeYears: payload.roofAgeYears,
        issueDescription: payload.issueDescription,
        insuranceClaim: payload.insuranceClaim,
        preferredContact: payload.preferredContact,
        propertyAddress: payload.propertyAddress,
        propertyCity: payload.propertyCity,
        propertyZip: payload.propertyZip,
        internalNotes:
          payload.urgency === 'EMERGENCY_STORM'
            ? 'PRIORITY EMERGENCY / STORM REQUEST — Highlighted for immediate dispatch.'
            : '',
        photos: payload.photos || [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const newEmails = [
        {
          id: `em-${Date.now()}-1`,
          to: payload.customerEmail,
          subject: `Inspection Confirmed (#${referenceCode}) — ${prev.settings.businessName}`,
          type: 'CUSTOMER_CONFIRMATION' as const,
          sentAt: nowIso,
          previewText: `Your Free Roof Inspection for ${payload.propertyAddress}, ${payload.propertyCity} is scheduled for ${payload.date} at ${payload.timeSlot} CT.`,
        },
        {
          id: `em-${Date.now()}-2`,
          to: prev.settings.notificationEmail,
          subject:
            payload.urgency === 'EMERGENCY_STORM'
              ? `[PRIORITY STORM ALERT] Emergency Roof Request #${referenceCode} — ${payload.customerName}`
              : `[New Booking #${referenceCode}] ${payload.serviceName} — ${payload.customerName}`,
          type:
            payload.urgency === 'EMERGENCY_STORM'
              ? ('EMERGENCY_PRIORITY_ALERT' as const)
              : ('ADMIN_NEW_ALERT' as const),
          sentAt: nowIso,
          previewText: `${payload.customerName} (${payload.customerPhone}) booked ${payload.serviceName} at ${payload.propertyAddress}, ${payload.propertyCity}.`,
        },
      ];

      return {
        ...prev,
        customers: updatedCustomers,
        bookings: [createdBooking, ...prev.bookings],
        emailLogs: [...newEmails, ...prev.emailLogs],
        activityLogs: appendLog(
          prev,
          payload.urgency === 'EMERGENCY_STORM' ? 'EMERGENCY_BOOKING_CREATED' : 'BOOKING_CREATED',
          'Booking',
          `${payload.customerName} booked ${payload.serviceName} (${referenceCode}) for ${payload.date} at ${payload.timeSlot}`,
          createdBooking.id
        ),
      };
    });

    addToast({
      title:
        payload.urgency === 'EMERGENCY_STORM'
          ? 'Priority Storm Inspection Dispatched'
          : 'Inspection Scheduled',
      description: `Reference ${referenceCode} created. Confirmation sent to ${payload.customerEmail}.`,
      variant: 'success',
    });

    return { ok: true, booking: createdBooking };
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus, internalNotes?: string) => {
    const target = db.bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    setDb((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status,
              internalNotes: internalNotes !== undefined ? internalNotes : b.internalNotes,
              updatedAt: nowIso,
            }
          : b
      ),
      emailLogs: [
        {
          id: `em-${Date.now()}`,
          to: target.customerEmail,
          subject: `Update on Your Roof Inspection (#${target.referenceCode}): ${status}`,
          type: 'STATUS_UPDATE',
          sentAt: nowIso,
          previewText: `Your appointment on ${target.date} at ${target.timeSlot} CT is now marked as ${status}.`,
        },
        ...prev.emailLogs,
      ],
      activityLogs: appendLog(
        prev,
        `BOOKING_${status}`,
        'Booking',
        `Updated booking ${target.referenceCode} (${target.customerName}) status to ${status}`,
        bookingId
      ),
    }));

    addToast({
      title: `Booking ${status}`,
      description: `${target.referenceCode} for ${target.customerName} updated & customer notified.`,
      variant: 'success',
    });
  };

  const rescheduleBooking = (bookingId: string, newDate: string, newTimeSlot: string) => {
    const target = db.bookings.find((b) => b.id === bookingId);
    if (!target) return { ok: false, error: 'Booking not found.' };

    const conflict = db.bookings.some(
      (b) =>
        b.id !== bookingId &&
        b.date === newDate &&
        b.timeSlot === newTimeSlot &&
        b.status !== 'CANCELLED'
    );
    if (conflict) {
      return {
        ok: false,
        error: `Slot ${newTimeSlot} on ${newDate} is already occupied by another appointment.`,
      };
    }

    const nowIso = new Date().toISOString();
    setDb((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              timeSlot: newTimeSlot,
              status: 'RESCHEDULED',
              updatedAt: nowIso,
            }
          : b
      ),
      emailLogs: [
        {
          id: `em-${Date.now()}`,
          to: target.customerEmail,
          subject: `Rescheduled Roof Inspection (#${target.referenceCode}) — ${newDate} at ${newTimeSlot} CT`,
          type: 'STATUS_UPDATE',
          sentAt: nowIso,
          previewText: `Your inspection at ${target.propertyAddress} has been moved to ${newDate} at ${newTimeSlot} CT.`,
        },
        ...prev.emailLogs,
      ],
      activityLogs: appendLog(
        prev,
        'BOOKING_RESCHEDULED',
        'Booking',
        `Rescheduled ${target.referenceCode} to ${newDate} at ${newTimeSlot} CT`,
        bookingId
      ),
    }));

    addToast({
      title: 'Inspection Rescheduled',
      description: `Moved ${target.referenceCode} to ${newDate} at ${newTimeSlot} CT.`,
      variant: 'success',
    });

    return { ok: true };
  };

  const updateBookingNotes = (bookingId: string, notes: string) => {
    setDb((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === bookingId ? { ...b, internalNotes: notes, updatedAt: new Date().toISOString() } : b
      ),
    }));
    addToast({ title: 'Internal Notes Saved', variant: 'success' });
  };

  const upsertService: AppContextValue['upsertService'] = (serviceData) => {
    setDb((prev) => {
      const existing = serviceData.id ? prev.services.find((s) => s.id === serviceData.id) : undefined;
      const slug =
        serviceData.slug ||
        serviceData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      if (existing) {
        const updated = prev.services.map((s) =>
          s.id === existing.id ? { ...s, ...serviceData, slug } : s
        );
        return {
          ...prev,
          services: updated,
          activityLogs: appendLog(prev, 'UPDATED_SERVICE', 'Service', `Updated service: ${serviceData.name}`, existing.id),
        };
      } else {
        const newService: ServiceItem = {
          id: `srv-${Date.now()}`,
          name: serviceData.name,
          slug,
          shortDescription: serviceData.shortDescription || 'Professional Fort Worth roofing & construction service.',
          longDescription: serviceData.longDescription || serviceData.shortDescription || '',
          estimatedDuration: serviceData.estimatedDuration || 60,
          priceNote: serviceData.priceNote || 'Free On-Site Inspection & Detailed Written Estimate',
          image: serviceData.image || prev.services[0]?.image || '',
          icon: serviceData.icon || 'ShieldCheck',
          active: serviceData.active ?? true,
          displayOrder: prev.services.length + 1,
          whatsIncluded: serviceData.whatsIncluded || [
            'Certified Fort Worth estimator inspection',
            'Written line-item estimate & photo report',
            '10-Year RRJ Workmanship Warranty',
          ],
          processSteps: serviceData.processSteps || [
            { stepNumber: '01', title: 'On-Site Inspection', description: 'Comprehensive roof and structural evaluation.' },
            { stepNumber: '02', title: 'Detailed Written Scope', description: 'Transparent pricing with material options.' },
            { stepNumber: '03', title: 'Precision Execution', description: 'Installed to Texas building code and manufacturer specs.' },
          ],
          faqs: serviceData.faqs || [],
        };
        return {
          ...prev,
          services: [...prev.services, newService],
          activityLogs: appendLog(prev, 'CREATED_SERVICE', 'Service', `Created new service: ${newService.name}`, newService.id),
        };
      }
    });
    addToast({ title: 'Service Saved', description: `${serviceData.name} has been updated.`, variant: 'success' });
  };

  const deleteService = (serviceId: string) => {
    const target = db.services.find((s) => s.id === serviceId);
    setDb((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== serviceId),
      activityLogs: appendLog(prev, 'DELETED_SERVICE', 'Service', `Deleted service: ${target?.name || serviceId}`),
    }));
    addToast({ title: 'Service Removed', variant: 'warning' });
  };

  const reorderService = (serviceId: string, direction: 'up' | 'down') => {
    setDb((prev) => {
      const sorted = [...prev.services].sort((a, b) => a.displayOrder - b.displayOrder);
      const idx = sorted.findIndex((s) => s.id === serviceId);
      if (idx === -1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;

      const temp = sorted[idx].displayOrder;
      sorted[idx] = { ...sorted[idx], displayOrder: sorted[swapIdx].displayOrder };
      sorted[swapIdx] = { ...sorted[swapIdx], displayOrder: temp };

      return {
        ...prev,
        services: sorted.sort((a, b) => a.displayOrder - b.displayOrder),
      };
    });
  };

  const updateBusinessHours = (hours: BusinessHoursDay[]) => {
    setDb((prev) => ({
      ...prev,
      businessHours: hours,
      activityLogs: appendLog(prev, 'UPDATED_BUSINESS_HOURS', 'Hours', 'Updated weekly inspection schedule hours'),
    }));
    addToast({ title: 'Business Hours Saved', description: 'Live booking calendar updated.', variant: 'success' });
  };

  const addBlockedDate = (item: Omit<BlockedDateItem, 'id'>) => {
    setDb((prev) => ({
      ...prev,
      blockedDates: [...prev.blockedDates, { ...item, id: `blk-${Date.now()}` }],
      activityLogs: appendLog(prev, 'ADDED_BLOCKED_DATE', 'Hours', `Blocked date ${item.date}: ${item.reason}`),
    }));
    addToast({ title: 'Blocked Date Added', description: `${item.date} is now blocked for standard bookings.`, variant: 'success' });
  };

  const removeBlockedDate = (id: string) => {
    setDb((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((b) => b.id !== id),
    }));
    addToast({ title: 'Blocked Date Removed' });
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setDb((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
      activityLogs: appendLog(prev, 'UPDATED_SITE_SETTINGS', 'Setting', 'Updated company profile, stats, or scheduling rules'),
    }));
    addToast({ title: 'Site Settings Updated', description: 'Changes are live across the website.', variant: 'success' });
  };

  const updateCustomer = (customerId: string, data: Partial<CustomerItem>) => {
    setDb((prev) => ({
      ...prev,
      customers: prev.customers.map((c) =>
        c.id === customerId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
      activityLogs: appendLog(prev, 'UPDATED_CUSTOMER', 'Customer', `Updated CRM record for ${data.fullName || customerId}`, customerId),
    }));
    addToast({ title: 'Customer Profile Updated', variant: 'success' });
  };

  const upsertProject: AppContextValue['upsertProject'] = (projectData) => {
    setDb((prev) => {
      const existing = projectData.id ? prev.projects.find((p) => p.id === projectData.id) : undefined;
      const slug =
        projectData.slug ||
        projectData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      if (existing) {
        return {
          ...prev,
          projects: prev.projects.map((p) => (p.id === existing.id ? { ...p, ...projectData, slug } : p)),
          activityLogs: appendLog(prev, 'UPDATED_PROJECT', 'Project', `Updated gallery project: ${projectData.title}`, existing.id),
        };
      } else {
        const created: ProjectItem = {
          id: `prj-${Date.now()}`,
          title: projectData.title,
          slug,
          category: projectData.category || 'Storm Restoration',
          location: projectData.location || 'Fort Worth, TX',
          completedAt: projectData.completedAt || 'October 2026',
          description: projectData.description || '',
          beforeImage: projectData.beforeImage || prev.projects[0]?.beforeImage || '',
          afterImage: projectData.afterImage || prev.projects[0]?.afterImage || '',
          featured: projectData.featured ?? true,
          displayOrder: prev.projects.length + 1,
          roofSquare: projectData.roofSquare || '40 Squares',
          materialUsed: projectData.materialUsed || 'Class 4 Impact Architectural Shingles',
          durationDays: projectData.durationDays || '1.5 Days',
        };
        return {
          ...prev,
          projects: [created, ...prev.projects],
          activityLogs: appendLog(prev, 'CREATED_PROJECT', 'Project', `Added new gallery project: ${created.title}`, created.id),
        };
      }
    });
    addToast({ title: 'Gallery Project Saved', variant: 'success' });
  };

  const deleteProject = (projectId: string) => {
    setDb((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
      activityLogs: appendLog(prev, 'DELETED_PROJECT', 'Project', `Removed project ${projectId}`),
    }));
    addToast({ title: 'Project Removed' });
  };

  const upsertTestimonial: AppContextValue['upsertTestimonial'] = (item) => {
    setDb((prev) => {
      const existing = item.id ? prev.testimonials.find((t) => t.id === item.id) : undefined;
      if (existing) {
        return {
          ...prev,
          testimonials: prev.testimonials.map((t) => (t.id === existing.id ? { ...t, ...item } : t)),
        };
      }
      const created: TestimonialItem = {
        id: `tst-${Date.now()}`,
        authorName: item.authorName,
        authorRole: item.authorRole || 'Homeowner · Fort Worth, TX',
        serviceType: item.serviceType || 'Roof Replacement',
        rating: item.rating || 5,
        quote: item.quote || '',
        outcome: item.outcome || 'Completed on schedule with 10-year workmanship warranty.',
        featured: item.featured ?? true,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        testimonials: [created, ...prev.testimonials],
      };
    });
    addToast({ title: 'Testimonial Saved', variant: 'success' });
  };

  const deleteTestimonial = (id: string) => {
    setDb((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
    }));
    addToast({ title: 'Testimonial Removed' });
  };

  const submitContactMessage: AppContextValue['submitContactMessage'] = (msg) => {
    const nowIso = new Date().toISOString();
    const newMsg: ContactMessageItem = {
      ...msg,
      id: `msg-${Date.now()}`,
      isRead: false,
      createdAt: nowIso,
    };
    setDb((prev) => ({
      ...prev,
      contactMessages: [newMsg, ...prev.contactMessages],
      emailLogs: [
        {
          id: `em-${Date.now()}`,
          to: prev.settings.notificationEmail,
          subject: `[Website Inquiry] ${msg.subject} — from ${msg.fullName}`,
          type: 'ADMIN_NEW_ALERT',
          sentAt: nowIso,
          previewText: `${msg.fullName} (${msg.phone}, ${msg.email}): ${msg.message.slice(0, 120)}`,
        },
        ...prev.emailLogs,
      ],
    }));
    addToast({
      title: 'Message Sent to RRJ Roofing',
      description: 'Our Fort Worth office will respond shortly.',
      variant: 'success',
    });
  };

  const markMessageRead = (id: string, replied?: boolean) => {
    setDb((prev) => ({
      ...prev,
      contactMessages: prev.contactMessages.map((m) =>
        m.id === id
          ? {
              ...m,
              isRead: true,
              repliedAt: replied ? new Date().toISOString() : m.repliedAt,
            }
          : m
      ),
    }));
  };

  const addUserAccount = (user: { name: string; email: string; role: Role }) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: user.name,
      email: user.email,
      role: user.role,
      active: true,
      lastLoginAt: 'Never',
      createdAt: new Date().toISOString(),
    };
    setDb((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      activityLogs: appendLog(prev, 'ADDED_STAFF_USER', 'Auth', `Added ${user.role} account for ${user.name} (${user.email})`),
    }));
    addToast({ title: 'Team Member Added', description: `${user.name} (${user.role}) created.`, variant: 'success' });
  };

  const removeUserAccount = (id: string) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
    addToast({ title: 'User Account Removed' });
  };

  const resetDemoDatabase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDb(INITIAL_SEED_DATA);
    addToast({
      title: 'Database Reset to Default Seed',
      description: 'All Fort Worth services, sample bookings, and hours restored.',
      variant: 'success',
    });
  };

  return (
    <AppContext.Provider
      value={{
        db,
        session,
        toasts,
        addToast,
        dismissToast,
        loginAdmin,
        logoutAdmin,
        createBooking,
        updateBookingStatus,
        rescheduleBooking,
        updateBookingNotes,
        upsertService,
        deleteService,
        reorderService,
        updateBusinessHours,
        addBlockedDate,
        removeBlockedDate,
        updateSettings,
        updateCustomer,
        upsertProject,
        deleteProject,
        upsertTestimonial,
        deleteTestimonial,
        submitContactMessage,
        markMessageRead,
        addUserAccount,
        removeUserAccount,
        resetDemoDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
