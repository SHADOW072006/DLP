import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UserManagement from './pages/Users';
import Organization from './pages/Organization';
import Endpoints from './pages/Endpoints';
import LiveMonitoring from './pages/LiveMonitoring';
import Policies from './pages/Policies';
import Incidents from './pages/Incidents';
import IncidentDetail from './pages/IncidentDetail';
import RiskAnalytics from './pages/RiskAnalytics';
import Reports from './pages/Reports';
import AiAssistant from './pages/AiAssistant';
import ClientEndpointView from './pages/ClientEndpointView';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login & Client Endpoint View */}
        <Route path="/login" element={<Login />} />
        <Route path="/client-agent" element={<ClientEndpointView />} />

        {/* Authenticated Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="organization" element={<Organization />} />
          <Route path="endpoints" element={<Endpoints />} />
          <Route path="live-events" element={<LiveMonitoring />} />
          <Route path="policies" element={<Policies />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="risk-analytics" element={<RiskAnalytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ai-assistant" element={<AiAssistant />} />

          {/* User Management restricted to ROLE_ADMIN */}
          <Route
            path="users"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="file-scanner"
            element={
              <PlaceholderPage
                title="File Upload & Directory Scanner"
                description="Extract safe text and discover sensitive markers across TXT, PDF, DOCX, CSV, and XLSX."
                phaseBadge="Phase 3"
              />
            }
          />
          <Route
            path="data-inventory"
            element={
              <PlaceholderPage
                title="Sensitive Data Inventory"
                description="Catalog of discovered Aadhaar, PAN, Credit Cards, API Keys, Passwords and classified files."
                phaseBadge="Phase 4"
              />
            }
          />
          <Route
            path="audit-logs"
            element={
              <PlaceholderPage
                title="Audit Logs"
                description="Immutable security trail of administrative actions, policy adjustments, and authentications."
                phaseBadge="Phase 8"
              />
            }
          />
          <Route
            path="settings"
            element={
              <PlaceholderPage
                title="System Settings"
                description="Configure monitoring debounce, hash algorithms, AI parameters, and storage paths."
                phaseBadge="Phase 10"
              />
            }
          />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
