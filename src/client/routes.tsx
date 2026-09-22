import React, { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ClientLayout } from './layouts/ClientLayout';
import { HomePage } from '../pages/HomePage';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';

// Route-level code splitting for secondary client pages
const ServicesPage = lazy(() => import('../pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('../pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));
const IndustriesPage = lazy(() => import('../pages/IndustriesPage').then(m => ({ default: m.IndustriesPage })));
const TechnologyPage = lazy(() => import('../pages/TechnologyPage').then(m => ({ default: m.TechnologyPage })));
const TrackingPage = lazy(() => import('../pages/TrackingPage').then(m => ({ default: m.TrackingPage })));
const QuotePage = lazy(() => import('../pages/QuotePage').then(m => ({ default: m.QuotePage })));
const ViewQuotePage = lazy(() => import('../pages/ViewQuotePage').then(m => ({ default: m.ViewQuotePage })));
const CaseStudiesPage = lazy(() => import('../pages/CaseStudiesPage').then(m => ({ default: m.CaseStudiesPage })));
const BlogPage = lazy(() => import('../pages/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('../pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then(m => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import('../pages/FaqPage').then(m => ({ default: m.FaqPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('../pages/TermsPage').then(m => ({ default: m.TermsPage })));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<RouteLoadingFallback />}>{Component}</Suspense>
);

export const ClientRoutes = (
  <Route element={<ClientLayout />}>
    <Route index element={<HomePage />} />
    <Route path="services" element={withSuspense(<ServicesPage />)} />
    <Route path="services/:serviceId" element={withSuspense(<ServiceDetailPage />)} />
    <Route path="industries" element={withSuspense(<IndustriesPage />)} />
    <Route path="technology" element={withSuspense(<TechnologyPage />)} />
    <Route path="tracking" element={withSuspense(<TrackingPage />)} />
    <Route path="quote" element={withSuspense(<QuotePage />)} />
    <Route path="quote/:quoteRef" element={withSuspense(<ViewQuotePage />)} />
    <Route path="quotes/:quoteRef" element={withSuspense(<ViewQuotePage />)} />
    <Route path="case-studies" element={withSuspense(<CaseStudiesPage />)} />
    <Route path="blog" element={withSuspense(<BlogPage />)} />
    <Route path="blog/:slug" element={withSuspense(<BlogPostPage />)} />
    <Route path="about" element={withSuspense(<AboutPage />)} />
    <Route path="faq" element={withSuspense(<FaqPage />)} />
    <Route path="contact" element={withSuspense(<ContactPage />)} />
    <Route path="privacy" element={withSuspense(<PrivacyPage />)} />
    <Route path="terms" element={withSuspense(<TermsPage />)} />
    <Route path="unauthorized" element={withSuspense(<UnauthorizedPage />)} />
    <Route path="*" element={withSuspense(<NotFoundPage />)} />
  </Route>
);
