import React, { useState, useEffect, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import { PublicLayout, RouteState } from './components/PublicLayout';
import { HomePage } from './pages/HomePage';
import { ServicesListingPage, ServiceDetailPage } from './pages/ServicesPages';
import {
  ProjectsGalleryPage,
  AboutPage,
  ContactPage,
  LegalPage,
  NotFoundPage,
} from './pages/SecondaryPages';
import { BookingPage } from './pages/BookingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function parseRouteFromLocation(): RouteState {
  try {
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = hash.includes('?')
      ? new URLSearchParams(hash.substring(hash.indexOf('?') + 1))
      : null;

    const getParam = (key: string) =>
      searchParams.get(key) || (hashParams ? hashParams.get(key) : null) || undefined;

    const rawPath = hash.split('?')[0];

    if (rawPath === 'admin' || window.location.pathname === '/admin') {
      return { page: 'admin' };
    }

    if (rawPath === 'services' || window.location.pathname === '/services') {
      return { page: 'services' };
    }

    if (rawPath.startsWith('services/') || rawPath.startsWith('service/')) {
      const slug = rawPath.replace(/^services?\//, '');
      if (slug) {
        return { page: 'service-detail', slug };
      }
    }

    if (rawPath === 'projects' || window.location.pathname === '/projects') {
      return { page: 'projects' };
    }

    if (rawPath === 'about' || window.location.pathname === '/about') {
      return { page: 'about' };
    }

    if (rawPath === 'contact' || window.location.pathname === '/contact') {
      return { page: 'contact' };
    }

    if (rawPath === 'privacy') {
      return { page: 'privacy' };
    }

    if (rawPath === 'terms') {
      return { page: 'terms' };
    }

    if (rawPath === 'book' || window.location.pathname === '/book') {
      const serviceId = getParam('service') || getParam('serviceId');
      const urgencyRaw = getParam('urgency');
      const urgency =
        urgencyRaw === 'EMERGENCY_STORM' ? 'EMERGENCY_STORM' : 'STANDARD';
      const manageToken = getParam('manage') || getParam('token');
      return {
        page: 'book',
        preselectedServiceId: serviceId,
        preselectedUrgency: urgency,
        manageToken,
      };
    }

    // Direct token management check from query params
    const manageTokenParam = getParam('manage');
    if (manageTokenParam) {
      return {
        page: 'book',
        manageToken: manageTokenParam,
      };
    }

    if (!rawPath || rawPath === '' || rawPath === 'home') {
      return { page: 'home' };
    }

    return { page: '404' };
  } catch {
    return { page: 'home' };
  }
}

function routeToHash(route: RouteState): string {
  switch (route.page) {
    case 'home':
      return '#';
    case 'services':
      return '#services';
    case 'service-detail':
      return `#services/${route.slug}`;
    case 'projects':
      return '#projects';
    case 'about':
      return '#about';
    case 'contact':
      return '#contact';
    case 'privacy':
      return '#privacy';
    case 'terms':
      return '#terms';
    case 'admin':
      return '#admin';
    case 'book': {
      const params = new URLSearchParams();
      if (route.preselectedServiceId) {
        params.set('service', route.preselectedServiceId);
      }
      if (route.preselectedUrgency && route.preselectedUrgency !== 'STANDARD') {
        params.set('urgency', route.preselectedUrgency);
      }
      if (route.manageToken) {
        params.set('manage', route.manageToken);
      }
      const queryStr = params.toString();
      return queryStr ? `#book?${queryStr}` : '#book';
    }
    default:
      return '#404';
  }
}

const MainRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<RouteState>(() =>
    parseRouteFromLocation()
  );

  const navigate = useCallback((nextRoute: RouteState) => {
    setCurrentRoute(nextRoute);
    const targetHash = routeToHash(nextRoute);
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseRouteFromLocation();
      setCurrentRoute(parsed);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Update document title dynamically based on active page
  useEffect(() => {
    let title = 'RRJ Roofing & Construction – Fort Worth, TX';
    switch (currentRoute.page) {
      case 'home':
        title = 'RRJ Roofing & Construction | Protecting What Matters, From the Top Down';
        break;
      case 'services':
        title = 'Roofing & Construction Services | RRJ Roofing Fort Worth';
        break;
      case 'service-detail':
        title = 'Service Details | RRJ Roofing Fort Worth';
        break;
      case 'projects':
        title = 'Completed Project Showcase & Before/After Gallery | RRJ Roofing';
        break;
      case 'about':
        title = 'About RRJ Roofing & Construction | Local Fort Worth Roofer';
        break;
      case 'contact':
        title = 'Contact Office & 24/7 Storm Dispatch | RRJ Roofing';
        break;
      case 'book':
        title =
          currentRoute.preselectedUrgency === 'EMERGENCY_STORM'
            ? 'Priority Emergency Storm Damage Dispatch | RRJ Roofing'
            : 'Schedule Free Roof Inspection & Estimate | RRJ Roofing';
        break;
      case 'admin':
        title = 'Admin CRM & Scheduling Control Panel | RRJ Roofing';
        break;
      case 'privacy':
        title = 'Privacy Policy | RRJ Roofing & Construction';
        break;
      case 'terms':
        title = 'Terms & Inspection Agreement | RRJ Roofing & Construction';
        break;
    }
    document.title = title;
  }, [currentRoute]);

  // Admin Dashboard has its own dedicated master layout and theme
  if (currentRoute.page === 'admin') {
    return <AdminDashboardPage navigate={navigate} />;
  }

  // Render Public Website pages wrapped in PublicLayout
  return (
    <PublicLayout route={currentRoute} navigate={navigate}>
      {currentRoute.page === 'home' && <HomePage navigate={navigate} />}

      {currentRoute.page === 'services' && (
        <ServicesListingPage navigate={navigate} />
      )}

      {currentRoute.page === 'service-detail' && (
        <ServiceDetailPage slug={currentRoute.slug} navigate={navigate} />
      )}

      {currentRoute.page === 'projects' && (
        <ProjectsGalleryPage navigate={navigate} />
      )}

      {currentRoute.page === 'about' && <AboutPage navigate={navigate} />}

      {currentRoute.page === 'contact' && <ContactPage navigate={navigate} />}

      {currentRoute.page === 'book' && (
        <BookingPage
          preselectedServiceId={currentRoute.preselectedServiceId}
          preselectedUrgency={currentRoute.preselectedUrgency}
          manageToken={currentRoute.manageToken}
          navigate={navigate}
        />
      )}

      {(currentRoute.page === 'privacy' || currentRoute.page === 'terms') && (
        <LegalPage type={currentRoute.page} navigate={navigate} />
      )}

      {currentRoute.page === '404' && <NotFoundPage navigate={navigate} />}
    </PublicLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
