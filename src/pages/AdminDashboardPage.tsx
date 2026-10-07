import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  ClipboardList,
  Wrench,
  Clock,
  Users,
  Images,
  MessageSquareQuote,
  Mail,
  Settings,
  Shield,
  Activity,
  LogOut,
  Sun,
  Moon,
  AlertTriangle,
  Search,
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Eye,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RouteState } from '../components/PublicLayout';
import {
  BookingItem,
  BookingStatus,
  ProjectItem,
  Role,
  ServiceItem,
} from '../types';
import {
  formatDisplayDate,
  formatTime12Hour,
  getNowInChicago,
} from '../utils/timezone';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

interface AdminDashboardProps {
  navigate: (route: RouteState) => void;
}

type AdminTab =
  | 'overview'
  | 'bookings'
  | 'calendar'
  | 'services'
  | 'hours'
  | 'customers'
  | 'projects'
  | 'testimonials'
  | 'messages'
  | 'settings'
  | 'users'
  | 'logs';

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const {
    db,
    session,
    loginAdmin,
    logoutAdmin,
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
    markMessageRead,
    addUserAccount,
    removeUserAccount,
    resetDemoDatabase,
    addToast,
  } = useApp();

  const [loginEmail, setLoginEmail] = useState('rrjroofings@gmail.com');
  const [loginPassword, setLoginPassword] = useState('AdminPassword2026!');
  const [loginError, setLoginError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerReschedDate, setDrawerReschedDate] = useState('');
  const [drawerReschedTime, setDrawerReschedTime] = useState('');

  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day'>('week');
  const nowChicago = useMemo(() => getNowInChicago(), []);
  const [calendarAnchorDate, setCalendarAnchorDate] = useState<string>(nowChicago.dateStr);

  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [newBlockedHoliday, setNewBlockedHoliday] = useState(false);

  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);

  const [newTestAuthor, setNewTestAuthor] = useState('');
  const [newTestRole, setNewTestRole] = useState('Homeowner · Fort Worth, TX');
  const [newTestService, setNewTestService] = useState('Roof Replacement');
  const [newTestQuote, setNewTestQuote] = useState('');
  const [newTestOutcome, setNewTestOutcome] = useState('');

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Role>('STAFF');

  const [settingsForm, setSettingsForm] = useState(db.settings);

  const sortedBookings = useMemo(() => {
    return [...db.bookings].sort((a, b) => {
      if (a.urgency === 'EMERGENCY_STORM' && b.urgency !== 'EMERGENCY_STORM') return -1;
      if (b.urgency === 'EMERGENCY_STORM' && a.urgency !== 'EMERGENCY_STORM') return 1;
      return b.date.localeCompare(a.date) || a.timeSlot.localeCompare(b.timeSlot);
    });
  }, [db.bookings]);

  const filteredBookings = useMemo(() => {
    return sortedBookings.filter((b) => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (urgencyFilter !== 'ALL' && b.urgency !== urgencyFilter) return false;
      if (serviceFilter !== 'ALL' && b.serviceId !== serviceFilter) return false;
      if (bookingSearch.trim()) {
        const q = bookingSearch.toLowerCase();
        const match =
          b.referenceCode.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.propertyAddress.toLowerCase().includes(q) ||
          b.propertyCity.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [sortedBookings, statusFilter, urgencyFilter, serviceFilter, bookingSearch]);

  const exportBookingsCSV = () => {
    const headers = [
      'Reference',
      'Urgency',
      'Status',
      'Date (CT)',
      'Time (CT)',
      'Service',
      'Customer',
      'Phone',
      'Email',
      'Address',
      'City',
      'ZIP',
      'Roof Type',
      'Insurance Claim',
    ];
    const rows = filteredBookings.map((b) => [
      b.referenceCode,
      b.urgency,
      b.status,
      b.date,
      b.timeSlot,
      `"${b.serviceName}"`,
      `"${b.customerName}"`,
      `"${b.customerPhone}"`,
      b.customerEmail,
      `"${b.propertyAddress}"`,
      `"${b.propertyCity}"`,
      b.propertyZip,
      b.roofType,
      b.insuranceClaim ? 'YES' : 'NO',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RRJ-Bookings-${nowChicago.dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCustomersCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'Address', 'City', 'ZIP', 'Insurance Claim', 'Tags'];
    const rows = db.customers.map((c) => [
      `"${c.fullName}"`,
      c.email,
      `"${c.phone}"`,
      `"${c.address}"`,
      `"${c.city}"`,
      c.zip,
      c.insuranceClaim ? 'YES' : 'NO',
      `"${c.tags.join('; ')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RRJ-Customers-CRM-${nowChicago.dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!session.user) {
    return (
      <div className="min-h-screen bg-[#0B1B2E] text-white flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-[#12263F] border border-white/15 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <div className="eyebrow text-[#E8873F]">Protected Contractor Portal</div>
            <h1 className="font-display text-2xl font-extrabold text-white">
              RRJ Roofing &amp; Construction Admin
            </h1>
            <p className="text-xs text-white/75">
              Sign in with your administrator or field estimator credentials to manage Fort Worth inspections, storm requests, and site content.
            </p>
          </div>

          {forgotMode ? (
            <div className="space-y-4">
              {forgotSent ? (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-xs text-emerald-200 space-y-2">
                  <p className="font-semibold">Password Reset Dispatched</p>
                  <p>
                    A temporary reset token has been sent to <strong>{loginEmail}</strong>. For immediate demo access, use the seeded admin credentials below.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-white/90">
                    Enter Your RRJ Account Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B1B2E] border border-white/20 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="w-full py-3 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-xs cursor-pointer"
                  >
                    Send Password Reset Link
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setForgotSent(false);
                }}
                className="text-xs text-[#E8873F] underline cursor-pointer"
              >
                ← Back to Admin Sign In
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoginError('');
                const res = await loginAdmin(loginEmail, loginPassword);
                if (!res.ok) {
                  setLoginError(res.error || 'Login failed');
                }
              }}
              className="space-y-4"
            >
              {loginError && (
                <div className="p-3 rounded-lg bg-red-950 border border-red-700 text-xs text-red-200">
                  {loginError}
                </div>
              )}

              <div>
                <label htmlFor="adm-email" className="block text-xs font-semibold text-white/90 mb-1">
                  Email Address
                </label>
                <input
                  id="adm-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B1B2E] border border-white/20 text-sm text-white font-mono-tabular"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="adm-pass" className="text-xs font-semibold text-white/90">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-[11px] text-[#E8873F] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="adm-pass"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B1B2E] border border-white/20 text-sm text-white font-mono-tabular"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Lock className="w-4 h-4" />
                Sign In to Dashboard
              </button>

              <div className="p-3.5 rounded-xl bg-[#0B1B2E]/90 border border-white/10 text-xs space-y-1.5 font-mono-tabular">
                <div className="text-[#E8873F] font-semibold">Seeded Accounts (Click to Autofill):</div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('rrjroofings@gmail.com');
                      setLoginPassword('AdminPassword2026!');
                    }}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] cursor-pointer"
                  >
                    Admin: rrjroofings@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('cole@rrjroofing.com');
                      setLoginPassword('AdminPassword2026!');
                    }}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] cursor-pointer"
                  >
                    Staff: cole@rrjroofing.com
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/60">
            <button
              type="button"
              onClick={() => navigate({ page: 'home' })}
              className="hover:text-white cursor-pointer"
            >
              ← Return to Public Website
            </button>
            <span>America/Chicago (CT)</span>
          </div>
        </div>
      </div>
    );
  }

  const todaysBookings = db.bookings.filter((b) => b.date === nowChicago.dateStr && b.status !== 'CANCELLED');
  const pendingBookings = db.bookings.filter((b) => b.status === 'PENDING');
  const emergencyBookings = db.bookings.filter(
    (b) => b.urgency === 'EMERGENCY_STORM' && b.status !== 'CANCELLED' && b.status !== 'COMPLETED'
  );
  const unreadMessagesCount = db.contactMessages.filter((m) => !m.isRead).length;

  const navMenu: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: pendingBookings.length,
    },
    { id: 'calendar', label: 'Schedule Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-4 h-4" /> },
    { id: 'hours', label: 'Business Hours', icon: <Clock className="w-4 h-4" /> },
    { id: 'customers', label: 'Customers (CRM)', icon: <Users className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects / Gallery', icon: <Images className="w-4 h-4" /> },
    { id: 'testimonials', label: 'Testimonials', icon: <MessageSquareQuote className="w-4 h-4" /> },
    {
      id: 'messages',
      label: 'Contact Inbox',
      icon: <Mail className="w-4 h-4" />,
      badge: unreadMessagesCount,
    },
    { id: 'settings', label: 'Site Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'users', label: 'Users & Roles', icon: <Shield className="w-4 h-4" /> },
    { id: 'logs', label: 'Activity & Emails', icon: <Activity className="w-4 h-4" /> },
  ];

  const surfaceBg = darkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F7F5F2] text-[#0B1B2E]';
  const cardBg = darkMode
    ? 'bg-[#1E293B] border-white/10 text-white'
    : 'bg-white border-[#0B1B2E]/12 text-[#0B1B2E]';
  const mutedText = darkMode ? 'text-slate-400' : 'text-[#5E6B7A]';

  return (
    <div className={`min-h-screen flex ${surfaceBg}`}>
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } bg-[#0B1B2E] text-white border-r border-white/10 flex flex-col justify-between transition-all duration-200 shrink-0`}
      >
        <div>
          <div className="h-16 px-4 border-b border-white/10 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="truncate">
                <div className="font-display font-bold text-sm text-white truncate">RRJ Roofing Admin</div>
                <div className="text-[11px] text-[#E8873F] font-mono-tabular">Fort Worth · CT</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="p-2.5 space-y-1">
            {navMenu.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#D9732B] text-white font-semibold'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.icon}
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="font-mono-tabular text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/30 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => navigate({ page: 'home' })}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:bg-white/10 flex items-center gap-2.5 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#E8873F]" />
            {!sidebarCollapsed && <span>View Live Website</span>}
          </button>
          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium text-red-300 hover:bg-red-950/50 flex items-center gap-2.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`h-16 px-6 border-b flex items-center justify-between gap-4 ${cardBg}`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className={mutedText}>Admin Console</span>
            <span className={mutedText}>/</span>
            <span className="font-display font-bold capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            {emergencyBookings.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('bookings');
                  setUrgencyFilter('EMERGENCY_STORM');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#D9732B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {emergencyBookings.length} Priority Storm Request{emergencyBookings.length > 1 ? 's' : ''}
              </button>
            )}

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-current/15 hover:bg-current/5 cursor-pointer"
              aria-label="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#E8873F]" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold leading-none">{session.user.name}</div>
              <div className={`text-[11px] font-mono-tabular ${mutedText}`}>
                Role: {session.user.role}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {emergencyBookings.length > 0 && (
                <div className="p-5 rounded-xl bg-[#0B1B2E] text-white border-l-4 border-[#D9732B] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#E8873F] font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      PRIORITY STORM &amp; ACTIVE LEAK DISPATCH QUEUE
                    </div>
                    <h2 className="font-display text-lg font-bold">
                      {emergencyBookings[0].customerName} — {emergencyBookings[0].propertyAddress}, {emergencyBookings[0].propertyCity}
                    </h2>
                    <p className="text-xs text-white/80 max-w-3xl">
                      Ref <strong className="font-mono-tabular">{emergencyBookings[0].referenceCode}</strong> · Scheduled {emergencyBookings[0].date} at {formatTime12Hour(emergencyBookings[0].timeSlot)} CT · “{emergencyBookings[0].issueDescription}”
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBooking(emergencyBookings[0]);
                        setDrawerNotes(emergencyBookings[0].internalNotes);
                        setDrawerReschedDate(emergencyBookings[0].date);
                        setDrawerReschedTime(emergencyBookings[0].timeSlot);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#D9732B] hover:bg-[#E8873F] text-white text-xs font-semibold cursor-pointer"
                    >
                      Inspect &amp; Dispatch Crew
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className={`p-5 rounded-xl border ${cardBg}`}>
                  <div className={`text-xs ${mutedText}`}>Today’s Inspections ({nowChicago.dateStr})</div>
                  <div className="mt-2 font-display text-3xl font-extrabold font-mono-tabular">
                    {todaysBookings.length}
                  </div>
                  <div className={`mt-1 text-[11px] ${mutedText}`}>America/Chicago (CT)</div>
                </div>

                <div className={`p-5 rounded-xl border ${cardBg}`}>
                  <div className={`text-xs ${mutedText}`}>Pending Approvals</div>
                  <div className="mt-2 font-display text-3xl font-extrabold font-mono-tabular text-[#D9732B]">
                    {pendingBookings.length}
                  </div>
                  <div className={`mt-1 text-[11px] ${mutedText}`}>Awaiting estimator confirmation</div>
                </div>

                <div className={`p-5 rounded-xl border ${cardBg}`}>
                  <div className={`text-xs ${mutedText}`}>Emergency / Storm Priority</div>
                  <div className="mt-2 font-display text-3xl font-extrabold font-mono-tabular text-red-600">
                    {emergencyBookings.length}
                  </div>
                  <div className={`mt-1 text-[11px] ${mutedText}`}>Sorted to top of queue</div>
                </div>

                <div className={`p-5 rounded-xl border ${cardBg}`}>
                  <div className={`text-xs ${mutedText}`}>Total CRM Homeowners</div>
                  <div className="mt-2 font-display text-3xl font-extrabold font-mono-tabular">
                    {db.customers.length}
                  </div>
                  <div className={`mt-1 text-[11px] ${mutedText}`}>
                    {db.customers.filter((c) => c.insuranceClaim).length} with insurance claims
                  </div>
                </div>

                <div className={`p-5 rounded-xl border ${cardBg}`}>
                  <div className={`text-xs ${mutedText}`}>Active Roofing Services</div>
                  <div className="mt-2 font-display text-3xl font-extrabold font-mono-tabular">
                    {db.services.filter((s) => s.active).length}
                  </div>
                  <div className={`mt-1 text-[11px] ${mutedText}`}>Bookable on public site</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className={`lg:col-span-7 p-6 rounded-xl border ${cardBg} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold">
                        2026 Monthly Inspection Volume (DFW)
                      </h3>
                      <p className={`text-xs ${mutedText}`}>
                        Standard vs. Emergency Hail/Storm Restoration Requests
                      </p>
                    </div>
                    <span className="text-xs font-mono-tabular text-[#D9732B] font-semibold">
                      Peak Storm Season: Apr–Oct
                    </span>
                  </div>

                  <div className="pt-4 grid grid-cols-6 gap-3 items-end h-44">
                    {[
                      { month: 'May', total: 48, storm: 29 },
                      { month: 'Jun', total: 42, storm: 21 },
                      { month: 'Jul', total: 36, storm: 12 },
                      { month: 'Aug', total: 39, storm: 14 },
                      { month: 'Sep', total: 51, storm: 26 },
                      { month: 'Oct', total: 44 + db.bookings.length, storm: 19 + emergencyBookings.length },
                    ].map((bar) => (
                      <div key={bar.month} className="flex flex-col items-center gap-2 h-full justify-end">
                        <div className="text-[11px] font-mono-tabular font-bold">{bar.total}</div>
                        <div className="w-full bg-[#0B1B2E]/15 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${Math.min(100, bar.total * 1.6)}%` }}>
                          <div
                            className="w-full bg-[#D9732B]"
                            style={{ height: `${Math.round((bar.storm / bar.total) * 100)}%` }}
                            title={`${bar.storm} Storm Requests`}
                          />
                        </div>
                        <div className={`text-xs font-mono-tabular ${mutedText}`}>{bar.month}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`lg:col-span-5 p-6 rounded-xl border ${cardBg} space-y-4`}>
                  <h3 className="font-display text-lg font-bold">Recent Dispatch Activity</h3>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {db.activityLogs.slice(0, 6).map((log) => (
                      <div key={log.id} className="pb-2.5 border-b border-current/10 text-xs space-y-0.5">
                        <div className="flex items-center justify-between font-mono-tabular">
                          <span className="font-bold text-[#D9732B]">{log.action}</span>
                          <span className={mutedText}>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{log.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl border ${cardBg} flex flex-wrap items-center justify-between gap-3`}>
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  <div className="relative min-w-[220px]">
                    <Search className={`w-4 h-4 absolute left-3 top-2.5 ${mutedText}`} />
                    <input
                      type="text"
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      placeholder="Search ref, name, phone, address..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="RESCHEDULED">RESCHEDULED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="NO_SHOW">NO_SHOW</option>
                  </select>

                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                  >
                    <option value="ALL">All Urgencies</option>
                    <option value="EMERGENCY_STORM">Emergency / Storm Only</option>
                    <option value="STANDARD">Standard Only</option>
                  </select>

                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                  >
                    <option value="ALL">All Services</option>
                    {db.services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={exportBookingsCSV}
                  className="px-4 py-2 rounded-lg bg-[#0B1B2E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV ({filteredBookings.length})
                </button>
              </div>

              <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-current/12 uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4">Reference &amp; Priority</th>
                        <th className="py-3.5 px-4">Date &amp; Slot (CT)</th>
                        <th className="py-3.5 px-4">Homeowner &amp; Property</th>
                        <th className="py-3.5 px-4">Service &amp; Roof</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-current/10">
                      {filteredBookings.map((b) => (
                        <tr
                          key={b.id}
                          className={`hover:bg-current/5 transition-colors ${
                            b.urgency === 'EMERGENCY_STORM' && b.status === 'PENDING'
                              ? 'bg-[#D9732B]/10'
                              : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono-tabular">
                            <div className="font-bold">{b.referenceCode}</div>
                            {b.urgency === 'EMERGENCY_STORM' ? (
                              <span className="text-[11px] font-bold text-[#D9732B] flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> EMERGENCY STORM
                              </span>
                            ) : (
                              <span className={mutedText}>Standard</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-mono-tabular">
                            <div className="font-semibold">{b.date}</div>
                            <div className={mutedText}>{formatTime12Hour(b.timeSlot)} CT</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold">{b.customerName}</div>
                            <div className={`text-[11px] ${mutedText}`}>
                              {b.propertyAddress}, {b.propertyCity} {b.propertyZip} · {b.customerPhone}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-medium">{b.serviceName}</div>
                            <div className={`text-[11px] ${mutedText}`}>
                              Roof: {b.roofType} · Claim: {b.insuranceClaim ? 'Yes' : 'No'}
                              {b.photos.length > 0 ? ` · ${b.photos.length} Photo(s)` : ''}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono-tabular font-bold">
                            <span
                              className={
                                b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                                  ? 'text-emerald-600'
                                  : b.status === 'PENDING'
                                  ? 'text-[#D9732B]'
                                  : b.status === 'CANCELLED'
                                  ? 'text-red-600'
                                  : ''
                              }
                            >
                              {b.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                            {b.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => updateBookingStatus(b.id, 'CONFIRMED')}
                                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-semibold cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}
                            {b.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => updateBookingStatus(b.id, 'COMPLETED')}
                                className="px-2.5 py-1 rounded bg-[#0B1B2E] text-white font-semibold cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBooking(b);
                                setDrawerNotes(b.internalNotes);
                                setDrawerReschedDate(b.date);
                                setDrawerReschedTime(b.timeSlot);
                              }}
                              className="px-2.5 py-1 rounded border border-current/25 hover:border-[#D9732B] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl border ${cardBg} flex flex-wrap items-center justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-lg font-bold">
                    Inspection Dispatch Calendar (America/Chicago)
                  </h2>
                  <input
                    type="date"
                    value={calendarAnchorDate}
                    onChange={(e) => setCalendarAnchorDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-current/20 text-xs font-mono-tabular bg-transparent"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0B1B2E]/10">
                  {(['day', 'week', 'month'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCalendarViewMode(m)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize cursor-pointer ${
                        calendarViewMode === m ? 'bg-[#0B1B2E] text-white' : ''
                      }`}
                    >
                      {m} View
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {db.bookings
                  .filter((b) => b.status !== 'CANCELLED')
                  .map((b) => (
                    <div
                      key={b.id}
                      className={`p-5 rounded-xl border ${cardBg} space-y-2.5 flex flex-col justify-between`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono-tabular">
                          <span className="font-bold text-[#D9732B]">
                            {b.date} · {formatTime12Hour(b.timeSlot)} CT
                          </span>
                          <span>{b.status}</span>
                        </div>
                        <h3 className="font-display font-bold text-base">{b.serviceName}</h3>
                        <p className="text-xs font-semibold">{b.customerName} ({b.customerPhone})</p>
                        <p className={`text-xs ${mutedText}`}>
                          {b.propertyAddress}, {b.propertyCity}, TX {b.propertyZip}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-current/10 flex justify-between items-center text-xs">
                        <span className="font-mono-tabular">{b.referenceCode}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(b);
                            setDrawerNotes(b.internalNotes);
                            setDrawerReschedDate(b.date);
                            setDrawerReschedTime(b.timeSlot);
                          }}
                          className="text-[#D9732B] font-semibold hover:underline cursor-pointer"
                        >
                          Open Record →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between`}>
                <div>
                  <h2 className="font-display text-lg font-bold">Roofing &amp; Construction Services ({db.services.length})</h2>
                  <p className={`text-xs ${mutedText}`}>
                    Create, edit, reorder, or toggle active status on public booking services.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingService({
                      name: '',
                      shortDescription: '',
                      longDescription: '',
                      estimatedDuration: 60,
                      priceNote: 'Free On-Site Inspection & Written Estimate',
                      active: true,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-[#D9732B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>

              {editingService && (
                <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
                  <h3 className="font-display text-lg font-bold">
                    {editingService.id ? `Edit ${editingService.name}` : 'Create New Service'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Service Name *</label>
                      <input
                        type="text"
                        value={editingService.name || ''}
                        onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        value={editingService.estimatedDuration || 60}
                        onChange={(e) =>
                          setEditingService({ ...editingService, estimatedDuration: parseInt(e.target.value || '60', 10) })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent font-mono-tabular"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Price / Inspection Note</label>
                      <input
                        type="text"
                        value={editingService.priceNote || ''}
                        onChange={(e) => setEditingService({ ...editingService, priceNote: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Short Description</label>
                    <input
                      type="text"
                      value={editingService.shortDescription || ''}
                      onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Detailed Specification Copy</label>
                    <textarea
                      rows={3}
                      value={editingService.longDescription || ''}
                      onChange={(e) => setEditingService({ ...editingService, longDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-lg border border-current/20 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingService.name?.trim()) {
                          upsertService(editingService as Partial<ServiceItem> & { name: string });
                          setEditingService(null);
                        }
                      }}
                      className="px-5 py-2 rounded-lg bg-[#D9732B] text-white text-xs font-semibold cursor-pointer"
                    >
                      Save Service
                    </button>
                  </div>
                </div>
              )}

              <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-current/12 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Service Name &amp; Slug</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/10">
                    {[...db.services]
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((srv) => (
                        <tr key={srv.id}>
                          <td className="py-3 px-4 font-mono-tabular">
                            <div className="flex items-center gap-1">
                              <span>#{srv.displayOrder}</span>
                              <button
                                type="button"
                                onClick={() => reorderService(srv.id, 'up')}
                                className="p-1 hover:text-[#D9732B] cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => reorderService(srv.id, 'down')}
                                className="p-1 hover:text-[#D9732B] cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold">{srv.name}</div>
                            <div className={`text-[11px] font-mono-tabular ${mutedText}`}>/services/{srv.slug}</div>
                          </td>
                          <td className="py-3 px-4 font-mono-tabular">{srv.estimatedDuration} mins</td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => upsertService({ ...srv, active: !srv.active })}
                              className={`font-mono-tabular font-bold cursor-pointer ${
                                srv.active ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              {srv.active ? 'ACTIVE' : 'HIDDEN'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => setEditingService(srv)}
                              className="px-2.5 py-1 rounded border border-current/20 font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteService(srv.id)}
                              className="px-2.5 py-1 rounded border border-red-600/40 text-red-600 font-semibold cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`lg:col-span-7 p-6 rounded-xl border ${cardBg} space-y-4`}>
                <h2 className="font-display text-lg font-bold">
                  Weekly Schedule (America/Chicago)
                </h2>
                <div className="space-y-3">
                  {db.businessHours.map((bh, idx) => (
                    <div
                      key={bh.id}
                      className="p-3 rounded-lg border border-current/12 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="w-28 font-bold">{bh.dayName}</div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!bh.isClosed}
                          onChange={(e) => {
                            const next = [...db.businessHours];
                            next[idx] = { ...bh, isClosed: !e.target.checked };
                            updateBusinessHours(next);
                          }}
                        />
                        <span>{bh.isClosed ? 'Closed (Emergency Callback Only)' : 'Open'}</span>
                      </label>
                      {!bh.isClosed && (
                        <div className="flex items-center gap-2 font-mono-tabular">
                          <input
                            type="time"
                            value={bh.openTime}
                            onChange={(e) => {
                              const next = [...db.businessHours];
                              next[idx] = { ...bh, openTime: e.target.value };
                              updateBusinessHours(next);
                            }}
                            className="px-2 py-1 rounded border border-current/20 bg-transparent"
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={bh.closeTime}
                            onChange={(e) => {
                              const next = [...db.businessHours];
                              next[idx] = { ...bh, closeTime: e.target.value };
                              updateBusinessHours(next);
                            }}
                            className="px-2 py-1 rounded border border-current/20 bg-transparent"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={`lg:col-span-5 p-6 rounded-xl border ${cardBg} space-y-5`}>
                <h2 className="font-display text-lg font-bold">Holidays &amp; Blocked Dates</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newBlockedDate || !newBlockedReason) return;
                    addBlockedDate({
                      date: newBlockedDate,
                      reason: newBlockedReason,
                      isHoliday: newBlockedHoliday,
                    });
                    setNewBlockedDate('');
                    setNewBlockedReason('');
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      value={newBlockedDate}
                      onChange={(e) => setNewBlockedDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-current/20 text-xs font-mono-tabular bg-transparent"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Reason (e.g. Crew Safety Day)"
                      value={newBlockedReason}
                      onChange={(e) => setNewBlockedReason(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={newBlockedHoliday}
                        onChange={(e) => setNewBlockedHoliday(e.target.checked)}
                      />
                      Mark as Public Holiday
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#D9732B] text-white text-xs font-semibold cursor-pointer"
                    >
                      Block Date
                    </button>
                  </div>
                </form>

                <div className="space-y-2 pt-3 border-t border-current/10">
                  {db.blockedDates.map((blk) => (
                    <div
                      key={blk.id}
                      className="p-3 rounded-lg border border-current/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono-tabular font-bold">{blk.date}</div>
                        <div className={mutedText}>{blk.reason}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBlockedDate(blk.id)}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between`}>
                <div>
                  <h2 className="font-display text-lg font-bold">
                    Homeowner &amp; Commercial Customer CRM ({db.customers.length})
                  </h2>
                  <p className={`text-xs ${mutedText}`}>
                    Full property records, insurance claim flags, notes, and appointment histories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportCustomersCSV}
                  className="px-4 py-2 rounded-lg bg-[#0B1B2E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export CRM CSV
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {db.customers.map((cust) => {
                  const custBookings = db.bookings.filter((b) => b.customerId === cust.id);
                  return (
                    <div key={cust.id} className={`p-5 rounded-xl border ${cardBg} space-y-3`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold">{cust.fullName}</h3>
                          <p className="text-xs font-mono-tabular">
                            {cust.phone} · {cust.email}
                          </p>
                          <p className={`text-xs ${mutedText}`}>
                            {cust.address}, {cust.city}, {cust.state} {cust.zip}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateCustomer(cust.id, { insuranceClaim: !cust.insuranceClaim })
                          }
                          className={`text-xs font-mono-tabular font-bold cursor-pointer ${
                            cust.insuranceClaim ? 'text-[#D9732B]' : mutedText
                          }`}
                        >
                          {cust.insuranceClaim ? 'INSURANCE CLAIM' : 'Retail Client'}
                        </button>
                      </div>

                      <div className="text-xs">
                        <strong>CRM Notes:</strong> {cust.notes || 'No notes yet.'}
                      </div>

                      <div className="pt-2 border-t border-current/10 flex items-center justify-between text-xs">
                        <span className="font-mono-tabular">
                          {custBookings.length} Inspection Booking(s)
                        </span>
                        <span className={mutedText}>{cust.tags.join(' · ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-5">
              <div className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between`}>
                <div>
                  <h2 className="font-display text-lg font-bold">
                    Before &amp; After Project Gallery Manager ({db.projects.length})
                  </h2>
                  <p className={`text-xs ${mutedText}`}>
                    Manage completed Fort Worth roof installations displayed on the public website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingProject({
                      title: '',
                      category: 'Storm Restoration',
                      location: 'Fort Worth, TX',
                      completedAt: 'October 2026',
                      description: '',
                      roofSquare: '42 Squares',
                      materialUsed: 'Owens Corning Duration STORM Class 4',
                      durationDays: '1.5 Days',
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-[#D9732B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Project Pair
                </button>
              </div>

              {editingProject && (
                <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
                  <h3 className="font-display text-lg font-bold">
                    {editingProject.id ? 'Edit Project' : 'Add Before/After Project'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Project Title *"
                      value={editingProject.title || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Neighborhood / City (e.g. Keller, TX)"
                      value={editingProject.location || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Material Installed"
                      value={editingProject.materialUsed || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, materialUsed: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Project scope & outcome description..."
                    value={editingProject.description || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="px-4 py-2 rounded-lg border border-current/20 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingProject.title?.trim()) {
                          upsertProject(editingProject as Partial<ProjectItem> & { title: string });
                          setEditingProject(null);
                        }
                      }}
                      className="px-5 py-2 rounded-lg bg-[#D9732B] text-white text-xs font-semibold cursor-pointer"
                    >
                      Save Project
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {db.projects.map((p) => (
                  <div key={p.id} className={`rounded-xl border overflow-hidden ${cardBg}`}>
                    <BeforeAfterSlider
                      beforeImage={p.beforeImage}
                      afterImage={p.afterImage}
                      altTitle={p.title}
                      className="h-60 rounded-none"
                    />
                    <div className="p-5 space-y-2">
                      <div className="text-xs font-mono-tabular text-[#D9732B]">
                        {p.category} · {p.location} · {p.roofSquare}
                      </div>
                      <h3 className="font-display font-bold text-base">{p.title}</h3>
                      <p className={`text-xs ${mutedText}`}>{p.description}</p>
                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProject(p)}
                          className="px-3 py-1 rounded border border-current/20 text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(p.id)}
                          className="px-3 py-1 rounded border border-red-600/40 text-red-500 text-xs font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`lg:col-span-5 p-6 rounded-xl border ${cardBg} space-y-4`}>
                <h2 className="font-display text-lg font-bold">Add Verified Homeowner Review</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTestAuthor.trim() || !newTestQuote.trim()) return;
                    upsertTestimonial({
                      authorName: newTestAuthor,
                      authorRole: newTestRole,
                      serviceType: newTestService,
                      quote: newTestQuote,
                      outcome: newTestOutcome,
                      rating: 5,
                      featured: true,
                    });
                    setNewTestAuthor('');
                    setNewTestQuote('');
                    setNewTestOutcome('');
                  }}
                  className="space-y-3 text-xs"
                >
                  <input
                    type="text"
                    required
                    placeholder="Homeowner Full Name *"
                    value={newTestAuthor}
                    onChange={(e) => setNewTestAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Neighborhood / City (e.g. Homeowner · Keller, TX)"
                    value={newTestRole}
                    onChange={(e) => setNewTestRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Service Type"
                    value={newTestService}
                    onChange={(e) => setNewTestService(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                  <textarea
                    rows={3}
                    required
                    placeholder="Testimonial Quote *"
                    value={newTestQuote}
                    onChange={(e) => setNewTestQuote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Quantified Outcome (e.g. Full $28k replacement approved)"
                    value={newTestOutcome}
                    onChange={(e) => setNewTestOutcome(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#D9732B] text-white font-semibold cursor-pointer"
                  >
                    Publish Testimonial
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {db.testimonials.map((t) => (
                  <div key={t.id} className={`p-5 rounded-xl border ${cardBg} space-y-2 text-xs`}>
                    <div className="flex justify-between">
                      <strong>{t.authorName} · {t.authorRole}</strong>
                      <button
                        type="button"
                        onClick={() => deleteTestimonial(t.id)}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <p className={mutedText}>“{t.quote}”</p>
                    <div className="font-mono-tabular text-[#D9732B]">Outcome: {t.outcome}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold">
                Website Contact Inquiries ({db.contactMessages.length})
              </h2>
              {db.contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-5 rounded-xl border ${cardBg} space-y-3 text-xs ${
                    !msg.isRead ? 'border-l-4 border-l-[#D9732B]' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-display text-base font-bold">{msg.subject}</span>
                      <div className={`font-mono-tabular ${mutedText}`}>
                        From: {msg.fullName} · {msg.phone} · {msg.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!msg.isRead && (
                        <button
                          type="button"
                          onClick={() => markMessageRead(msg.id)}
                          className="px-3 py-1.5 rounded bg-[#0B1B2E] text-white font-semibold cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                        onClick={() => markMessageRead(msg.id, true)}
                        className="px-3 py-1.5 rounded bg-[#D9732B] text-white font-semibold"
                      >
                        Reply via Email
                      </a>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={`p-6 rounded-xl border ${cardBg} space-y-6 max-w-4xl`}>
              <div className="flex items-center justify-between border-b border-current/10 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold">
                    Live Company Profile, Hero Copy &amp; Booking Rules
                  </h2>
                  <p className={`text-xs ${mutedText}`}>
                    Changes saved here update the public homepage, stats strip, and slot generator immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetDemoDatabase}
                  className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-500 text-xs font-semibold cursor-pointer"
                >
                  Reset Seed Database
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settingsForm.businessName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Notification &amp; Public Email</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        email: e.target.value,
                        notificationEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Hero Headline</label>
                <input
                  type="text"
                  value={settingsForm.heroHeadline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-current/20 text-xs bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Stat: Years Exp</label>
                  <input
                    type="text"
                    value={settingsForm.statYearsExperience}
                    onChange={(e) => setSettingsForm({ ...settingsForm, statYearsExperience: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stat: Roofs Completed</label>
                  <input
                    type="text"
                    value={settingsForm.statRoofsCompleted}
                    onChange={(e) => setSettingsForm({ ...settingsForm, statRoofsCompleted: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stat: Satisfaction</label>
                  <input
                    type="text"
                    value={settingsForm.statHappyHomeowners}
                    onChange={(e) => setSettingsForm({ ...settingsForm, statHappyHomeowners: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Min Notice (Hours)</label>
                  <input
                    type="number"
                    value={settingsForm.minNoticeHours}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, minNoticeHours: parseInt(e.target.value || '6', 10) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent font-mono-tabular"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings(settingsForm)}
                className="px-6 py-3 rounded-xl bg-[#D9732B] hover:bg-[#E8873F] text-white text-xs font-semibold cursor-pointer"
              >
                Save All Site Settings
              </button>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={`lg:col-span-5 p-6 rounded-xl border ${cardBg} space-y-4`}>
                <h2 className="font-display text-lg font-bold">Add Estimator or Admin Account</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
                    addUserAccount({ name: newStaffName, email: newStaffEmail, role: newStaffRole });
                    setNewStaffName('');
                    setNewStaffEmail('');
                  }}
                  className="space-y-3 text-xs"
                >
                  <input
                    type="text"
                    required
                    placeholder="Full Name & Title *"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Address *"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent font-mono-tabular"
                  />
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as Role)}
                    className="w-full px-3 py-2 rounded-lg border border-current/20 bg-transparent"
                  >
                    <option value="STAFF">STAFF (Estimator / Coordinator)</option>
                    <option value="ADMIN">ADMIN (Full Access)</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#D9732B] text-white font-semibold cursor-pointer"
                  >
                    Create Account
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {db.users.map((u) => (
                  <div
                    key={u.id}
                    className={`p-4 rounded-xl border ${cardBg} flex items-center justify-between text-xs`}
                  >
                    <div>
                      <div className="font-bold text-sm">{u.name}</div>
                      <div className={`font-mono-tabular ${mutedText}`}>
                        {u.email} · Role: <strong>{u.role}</strong>
                      </div>
                    </div>
                    {u.email !== 'rrjroofings@gmail.com' && (
                      <button
                        type="button"
                        onClick={() => removeUserAccount(u.id)}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
                <h2 className="font-display text-lg font-bold">Dispatched Email Notifications Log</h2>
                <div className="space-y-3">
                  {db.emailLogs.map((em) => (
                    <div key={em.id} className="p-3.5 rounded-lg border border-current/10 text-xs space-y-1">
                      <div className="flex justify-between font-mono-tabular">
                        <span className="font-bold text-[#D9732B]">{em.type}</span>
                        <span className={mutedText}>{new Date(em.sentAt).toLocaleString()}</span>
                      </div>
                      <div className="font-semibold">To: {em.to}</div>
                      <div className="font-medium">{em.subject}</div>
                      <p className={mutedText}>{em.previewText}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-xl border ${cardBg} space-y-4`}>
                <h2 className="font-display text-lg font-bold">System &amp; Admin Audit Log</h2>
                <div className="space-y-3">
                  {db.activityLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-lg border border-current/10 text-xs space-y-1">
                      <div className="flex justify-between font-mono-tabular">
                        <span className="font-bold text-[#D9732B]">{log.action}</span>
                        <span className={mutedText}>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="font-semibold">Actor: {log.actorName}</div>
                      <p className={mutedText}>{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-xl w-full bg-[#0B1B2E] text-white h-full overflow-y-auto p-6 sm:p-8 space-y-6 border-l border-white/15">
            <div className="flex items-start justify-between border-b border-white/15 pb-4">
              <div>
                <span className="text-xs font-mono-tabular text-[#E8873F]">
                  {selectedBooking.referenceCode} · {selectedBooking.urgency}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">
                  {selectedBooking.customerName}
                </h3>
                <p className="text-xs text-white/75">
                  {selectedBooking.propertyAddress}, {selectedBooking.propertyCity}, TX {selectedBooking.propertyZip}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Update Inspection Status
              </div>
              <div className="flex flex-wrap gap-2">
                {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as BookingStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      updateBookingStatus(selectedBooking.id, st, drawerNotes);
                      setSelectedBooking({ ...selectedBooking, status: st });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-tabular font-bold cursor-pointer ${
                      selectedBooking.status === st
                        ? 'bg-[#D9732B] text-white'
                        : 'bg-[#12263F] text-white/80 hover:bg-white/15'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#12263F] border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Service:</span>
                <strong>{selectedBooking.serviceName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Date &amp; Time (CT):</span>
                <strong className="font-mono-tabular">
                  {formatDisplayDate(selectedBooking.date)} at {formatTime12Hour(selectedBooking.timeSlot)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Phone / Email:</span>
                <strong className="font-mono-tabular">
                  {selectedBooking.customerPhone} · {selectedBooking.customerEmail}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Roof Material &amp; Age:</span>
                <strong>
                  {selectedBooking.roofType} (~{selectedBooking.roofAgeYears} yrs)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Insurance Claim:</span>
                <strong className="text-[#E8873F]">
                  {selectedBooking.insuranceClaim ? 'YES – Storm Claim' : 'No (Retail)'}
                </strong>
              </div>
              <div className="pt-2 border-t border-white/10">
                <span className="text-white/60 block mb-1">Homeowner Issue Description:</span>
                <p className="text-white leading-relaxed">{selectedBooking.issueDescription}</p>
              </div>
            </div>

            {selectedBooking.photos.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Uploaded Property / Damage Photos ({selectedBooking.photos.length})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {selectedBooking.photos.map((ph) => (
                    <div key={ph.id} className="rounded-lg overflow-hidden border border-white/15 bg-[#12263F]">
                      <img src={ph.url} alt={ph.caption || 'Roof photo'} className="w-full h-36 object-cover" />
                      {ph.caption && <div className="p-2 text-[11px] text-white/80 truncate">{ph.caption}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#12263F] border border-white/10 space-y-3">
              <div className="text-xs font-semibold text-[#E8873F]">Reschedule Inspection Slot</div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={drawerReschedDate}
                  onChange={(e) => setDrawerReschedDate(e.target.value)}
                  className="px-3 py-1.5 rounded bg-[#0B1B2E] border border-white/20 text-xs font-mono-tabular text-white"
                />
                <input
                  type="time"
                  value={drawerReschedTime}
                  onChange={(e) => setDrawerReschedTime(e.target.value)}
                  className="px-3 py-1.5 rounded bg-[#0B1B2E] border border-white/20 text-xs font-mono-tabular text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const res = rescheduleBooking(selectedBooking.id, drawerReschedDate, drawerReschedTime);
                    if (res.ok) {
                      setSelectedBooking({
                        ...selectedBooking,
                        date: drawerReschedDate,
                        timeSlot: drawerReschedTime,
                        status: 'RESCHEDULED',
                      });
                    } else if (res.error) {
                      addToast({ title: 'Slot Conflict', description: res.error, variant: 'danger' });
                    }
                  }}
                  className="px-3.5 py-1.5 rounded bg-[#D9732B] text-white text-xs font-semibold cursor-pointer"
                >
                  Move Slot
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60">
                Internal Estimator &amp; Dispatch Notes
              </label>
              <textarea
                rows={3}
                value={drawerNotes}
                onChange={(e) => setDrawerNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#12263F] border border-white/20 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => updateBookingNotes(selectedBooking.id, drawerNotes)}
                className="px-4 py-2 rounded-lg bg-white text-[#0B1B2E] text-xs font-semibold cursor-pointer"
              >
                Save Internal Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
