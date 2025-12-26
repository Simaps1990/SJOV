import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { NotificationsProvider } from './context/NotificationsContext';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './pages/admin/AdminLayout';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import HomePage from './pages/HomePage';
import AssociationPage from './pages/AssociationPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ApplyPage from './pages/ApplyPage';
import ContactPage from './pages/ContactPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import AnnoncesPage from './pages/Annonces'; // ✅ Import correct
import MentionsLegalesPage from './pages/MentionsLegalesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.tsx';
import ProtectedRoute from './ProtectedRoute';
import AdminAnnoncesPage from './pages/admin/AdminAnnoncesPage';
import AdminJardiniersPage from './pages/admin/AdminJardiniersPage';
import AdminParcellesPage from './pages/admin/AdminParcellesPage';

// Public Layout
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const headerRef = useRef<HTMLElement | null>(null);
  const [paddingTop, setPaddingTop] = useState(0);

  useEffect(() => {
    const updatePadding = () => {
      const height = headerRef.current?.offsetHeight || 0;
      setPaddingTop(height + 16);
    };

    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  return (
    <>
      <Header ref={headerRef} />
      <main style={{ paddingTop: paddingTop + 24 }}>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ContentProvider>
          <NotificationsProvider>
            <Router>
            <ScrollToTop />
          <Routes>

            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/association" element={<PublicLayout><AssociationPage /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
            <Route path="/events/:id" element={<PublicLayout><EventDetailPage /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
            <Route path="/blog/:id" element={<PublicLayout><BlogDetailPage /></PublicLayout>} />
            <Route path="/apply" element={<PublicLayout><ApplyPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />
            <Route path="/annonces" element={<PublicLayout><AnnoncesPage /></PublicLayout>} />
            <Route path="/mentions-legales" element={<PublicLayout><MentionsLegalesPage /></PublicLayout>} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="blog" element={<AdminBlogPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="jardiniers" element={<AdminJardiniersPage />} />
              <Route path="parcelles" element={<AdminParcellesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="annonces" element={<AdminAnnoncesPage />} /> {/* ❗ AJOUT ICI */}
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </Router>
          </NotificationsProvider>
        </ContentProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
