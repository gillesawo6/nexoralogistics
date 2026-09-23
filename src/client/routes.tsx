import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { ClientLayout } from './layouts/ClientLayout';
import { HomePage } from '../pages/HomePage';
import { ServicesPage } from '../pages/ServicesPage';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';
import { lazyWithRetry } from '../utils/lazyWithRetry';

// Resilient route-level code splitting with auto-retry for secondary client pages
const ServiceDetailPage = lazyWithRetry(() => import('../pages/ServiceDetailPage'), 'ServiceDetailPage');
const IndustriesPage = lazyWithRetry(() => import('../pages/IndustriesPage'), 'IndustriesPage');
const TechnologyPage = lazyWithRetry(() => import('../pages/TechnologyPage'), 'TechnologyPage');
const TrackingPage = lazyWithRetry(() => import('../pages/TrackingPage'), 'TrackingPage');
const QuotePage = lazyWithRetry(() => import('../pages/QuotePage'), 'QuotePage');
const ViewQuotePage = lazyWithRetry(() => import('../pages/ViewQuotePage'), 'ViewQuotePage');
const CaseStudiesPage = lazyWithRetry(() => import('../pages/CaseStudiesPage'), 'CaseStudiesPage');
const BlogPage = lazyWithRetry(() => import('../pages/BlogPage'), 'BlogPage');
const BlogPostPage = lazyWithRetry(() => import('../pages/BlogPostPage'), 'BlogPostPage');
const AboutPage = lazyWithRetry(() => import('../pages/AboutPage'), 'AboutPage');
const FaqPage = lazyWithRetry(() => import('../pages/FaqPage'), 'FaqPage');
const ContactPage = lazyWithRetry(() => import('../pages/ContactPage'), 'ContactPage');
const PrivacyPage = lazyWithRetry(() => import('../pages/PrivacyPage'), 'PrivacyPage');
const TermsPage = lazyWithRetry(() => import('../pages/TermsPage'), 'TermsPage');
const UnauthorizedPage = lazyWithRetry(() => import('../pages/UnauthorizedPage'), 'UnauthorizedPage');
const NotFoundPage = lazyWithRetry(() => import('../pages/NotFoundPage'), 'NotFoundPage');

const withSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<RouteLoadingFallback />}>{Component}</Suspense>
);

export const ClientRoutes = (
  <Route element={<ClientLayout />}>
    <Route index element={<HomePage />} />
    <Route path="services" element={<ServicesPage />} />
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
