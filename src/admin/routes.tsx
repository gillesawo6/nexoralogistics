import React, { Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminGuard } from './components/AdminGuard';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';
import { lazyWithRetry } from '../utils/lazyWithRetry';

// Route-level code splitting with auto-retry for all admin pages
const AdminLoginPage = lazyWithRetry(() => import('./pages/AdminLoginPage'), 'AdminLoginPage');
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'), 'DashboardPage');
const ShipmentsPage = lazyWithRetry(() => import('./pages/ShipmentsPage'), 'ShipmentsPage');
const NewShipmentPage = lazyWithRetry(() => import('./pages/NewShipmentPage'), 'NewShipmentPage');
const ShipmentDetailPage = lazyWithRetry(() => import('./pages/ShipmentDetailPage'), 'ShipmentDetailPage');
const QuotesAdminPage = lazyWithRetry(() => import('./pages/QuotesAdminPage'), 'QuotesAdminPage');
const MessagesAdminPage = lazyWithRetry(() => import('./pages/MessagesAdminPage'), 'MessagesAdminPage');
const ServicesAdminPage = lazyWithRetry(() => import('./pages/ServicesAdminPage'), 'ServicesAdminPage');
const IndustriesAdminPage = lazyWithRetry(() => import('./pages/IndustriesAdminPage'), 'IndustriesAdminPage');
const BlogAdminPage = lazyWithRetry(() => import('./pages/BlogAdminPage'), 'BlogAdminPage');
const CaseStudiesAdminPage = lazyWithRetry(() => import('./pages/CaseStudiesAdminPage'), 'CaseStudiesAdminPage');
const TestimonialsAdminPage = lazyWithRetry(() => import('./pages/TestimonialsAdminPage'), 'TestimonialsAdminPage');
const FaqsAdminPage = lazyWithRetry(() => import('./pages/FaqsAdminPage'), 'FaqsAdminPage');
const LocationsAdminPage = lazyWithRetry(() => import('./pages/LocationsAdminPage'), 'LocationsAdminPage');
const UsersAdminPage = lazyWithRetry(() => import('./pages/UsersAdminPage'), 'UsersAdminPage');
const CompanyInfoAdminPage = lazyWithRetry(() => import('./pages/CompanyInfoAdminPage'), 'CompanyInfoAdminPage');
const AdminDocsPage = lazyWithRetry(() => import('./pages/AdminDocsPage'), 'AdminDocsPage');
const UnauthorizedPage = lazyWithRetry(() => import('../pages/UnauthorizedPage'), 'UnauthorizedPage');


const withAdminSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<RouteLoadingFallback />}>{Component}</Suspense>
);

export const AdminRoutes = (
  <>
    {/* Standalone Unauthorized & Login Routes */}
    <Route path="/admin/unauthorized" element={withAdminSuspense(<UnauthorizedPage />)} />
    <Route path="/admin/login" element={withAdminSuspense(<AdminLoginPage />)} />

    <Route
      path="/admin"
      element={
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      }
    >
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={withAdminSuspense(<DashboardPage />)} />
      <Route path="users" element={withAdminSuspense(<UsersAdminPage />)} />
      <Route path="company-info" element={withAdminSuspense(<CompanyInfoAdminPage />)} />
      <Route path="company" element={withAdminSuspense(<CompanyInfoAdminPage />)} />
      <Route path="docs" element={withAdminSuspense(<AdminDocsPage />)} />
      <Route path="manual" element={withAdminSuspense(<AdminDocsPage />)} />
      <Route path="shipments" element={withAdminSuspense(<ShipmentsPage />)} />
      <Route path="shipments/new" element={withAdminSuspense(<NewShipmentPage />)} />
      <Route path="shipments/:id" element={withAdminSuspense(<ShipmentDetailPage />)} />
      <Route path="quotes" element={withAdminSuspense(<QuotesAdminPage />)} />
      <Route path="messages" element={withAdminSuspense(<MessagesAdminPage />)} />
      <Route path="services" element={withAdminSuspense(<ServicesAdminPage />)} />
      <Route path="industries" element={withAdminSuspense(<IndustriesAdminPage />)} />
      <Route path="blog" element={withAdminSuspense(<BlogAdminPage />)} />
      <Route path="case-studies" element={withAdminSuspense(<CaseStudiesAdminPage />)} />
      <Route path="testimonials" element={withAdminSuspense(<TestimonialsAdminPage />)} />
      <Route path="faqs" element={withAdminSuspense(<FaqsAdminPage />)} />
      <Route path="locations" element={withAdminSuspense(<LocationsAdminPage />)} />
      {/* Fallback inside admin */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>
  </>
);
