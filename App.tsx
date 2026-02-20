
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreateRecord } from './pages/CreateRecord';
import { TrustProfile } from './pages/TrustProfile';
import { AccountSettings } from './pages/AccountSettings';
import { MoreMenu, AboutPage, TrustPage, ContactPage, FAQPage, PrivacyPage, TermsPage } from './pages/StaticPages';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { RecordDetail } from './pages/RecordDetail';
import { ConfirmRecord } from './pages/ConfirmRecord';
import { Language, User } from './types';
import { getSessionUser, subscribeToAuth } from './services/authService';

export default function App() {
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [user, setUser] = useState<User | null>(() => getSessionUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to login/logout events for instant UI updates
    const unsubscribe = subscribeToAuth((updatedUser) => {
        setUser(updatedUser);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading SAAKSHY...</div>;
  }

  return (
    <HashRouter>
      <Layout currentLang={lang} setLang={setLang} user={user}>
        <Routes>
          {/* Root: Landing Page if Public, Redirect to Dashboard if Logged In */}
          <Route path="/" element={!user ? <LandingPage lang={lang} setLang={setLang} /> : <Navigate to="/dashboard" />} />
          
          {/* Public Routes (Auth) */}
          <Route path="/login" element={!user ? <Login lang={lang} setLang={setLang} /> : <Navigate to="/dashboard" />} />
          
          {/* Onboarding: Accessible to authenticated users who might need to complete profile */}
          <Route path="/onboarding" element={user ? <Onboarding lang={lang} /> : <Navigate to="/login" />} />

          {/* Public Routes (Information) - Accessible to everyone */}
          <Route path="/about" element={<AboutPage lang={lang} />} />
          <Route path="/contact" element={<ContactPage lang={lang} />} />
          <Route path="/trust" element={<TrustPage lang={lang} />} />
          <Route path="/faq" element={<FAQPage lang={lang} />} />
          <Route path="/privacy" element={<PrivacyPage lang={lang} />} />
          <Route path="/terms" element={<TermsPage lang={lang} />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={user ? <Dashboard lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/create" element={user ? <CreateRecord lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/record/:id" element={user ? <RecordDetail lang={lang} /> : <Navigate to="/login" />} />
          
          {/* The Confirmation Link (Accessible via link sharing) */}
          <Route path="/confirm/:id" element={<ConfirmRecord lang={lang} />} />

          <Route path="/profile" element={user ? <TrustProfile lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <AccountSettings lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/more" element={user ? <MoreMenu lang={lang} /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
