import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import ErrorBoundary from './component/ErrorBoundary';
const Root = lazy(() => import('./pages/Root'));
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const GenerateResume = lazy(() => import('./pages/GenerateResume'));
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const Dashboards = lazy(() => import('./pages/Dashboards'));
const ResumeViewer = lazy(() => import('./pages/ResumeViewer'));
const EditResume = lazy(() => import('./pages/EditResume'));
import { Toaster } from 'react-hot-toast';
// import Signup from './pages/Signup';
import { ClerkProvider } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './component/ProtectedRoute';


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not defined');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AuthProvider>
          <Toaster />
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
              <Routes>
                <Route path="/" element={<Root />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="services" element={<Services />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
                  <Route path="dashboard" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
                  <Route path="resume/:id" element={<ProtectedRoute><ResumeViewer /></ProtectedRoute>} />
                  <Route path="generate-resume" element={<ProtectedRoute><GenerateResume /></ProtectedRoute>} />
                  <Route path="edit-resume/:resumeId" element={<ProtectedRoute><EditResume /></ProtectedRoute>} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>

        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);