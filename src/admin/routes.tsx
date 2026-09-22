import React, { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminGuard } from './components/AdminGuard';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';

// Route-level code splitting for all admin pages
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ShipmentsPage = lazy(() => import('./pages/ShipmentsPage').then(m => ({ default: m.ShipmentsPage })));
const NewShipmentPage = lazy(() => import('./pages/NewShipmentPage').then(m => ({ default: m.NewShipmentPage })));
const ShipmentDetailPage = lazy(() => import('./pages/ShipmentDetailPage').then(m => ({ default: m.ShipmentDetailPage })));
const QuotesAdminPage = lazy(() => import('./pages/QuotesAdminPage').then(m => ({ default: m.QuotesAdminPage })));
const MessagesAdminPage = lazy(() => import('./pages/MessagesAdminPage').then(m => ({ default: m.MessagesAdminPage })));
const ServicesAdminPage = lazy(() => import('./pages/ServicesAdminPage').then(m => ({ default: m.ServicesAdminPage })));
const IndustriesAdminPage = lazy(() => import('./pages/IndustriesAdminPage').then(m => ({ default: m.IndustriesAdminPage })));
const BlogAdminPage = lazy(() => import('./pages/BlogAdminPage').then(m => ({ default: m.BlogAdminPage })));
const CaseStudiesAdminPage = lazy(() => import('./pages/CaseStudiesAdminPage').then(m => ({ default: m.CaseStudiesAdminPage })));
const TestimonialsAdminPage = lazy(() => import('./pages/TestimonialsAdminPage').then(m => ({ default: m.TestimonialsAdminPage })));
const FaqsAdminPage = lazy(() => import('./pages/FaqsAdminPage').then(m => ({ default: m.FaqsAdminPage })));
const LocationsAdminPage = lazy(() => import('./pages/LocationsAdminPage').then(m => ({ default: m.LocationsAdminPage })));
const UsersAdminPage = lazy(() => import('./pages/UsersAdminPage').then(m => ({ default: m.UsersAdminPage })));
const CompanyInfoAdminPage = lazy(() => import('./pages/CompanyInfoAdminPage').then(m => ({ default: m.CompanyInfoAdminPage })));
const AdminDocsPage = lazy(() => import('./pages/AdminDocsPage').then(m => ({ default: m.AdminDocsPage })));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));

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
