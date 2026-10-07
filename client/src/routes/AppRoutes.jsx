import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { AppLayout } from '../layouts/AppLayout';
import { PublicLayout } from '../layouts/PublicLayout';

// Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { About } from '../pages/About';
import { SecurityPage } from '../pages/SecurityPage';

import { Dashboard } from '../pages/Dashboard';
import { AISystems } from '../pages/AISystems';
import { PersonalizationCenter } from '../pages/PersonalizationCenter';
import { RiskProfilePage } from '../pages/RiskProfilePage';
import { TrustMemoryPage } from '../pages/TrustMemoryPage';
import { Evaluations } from '../pages/Evaluations';
import { EvaluationDetail } from '../pages/EvaluationDetail';
import { CompareEvaluations } from '../pages/CompareEvaluations';
import { Vulnerabilities } from '../pages/Vulnerabilities';
import { FirewallPage } from '../pages/FirewallPage';
import { Playground } from '../pages/Playground';
import { TestLibrary } from '../pages/TestLibrary';
import { Reports } from '../pages/Reports';
import { ReportDetail } from '../pages/ReportDetail';
import { IncidentsPage } from '../pages/IncidentsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-cyan-400 font-mono text-xs">
        Validating SecOps Session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/security" element={<SecurityPage />} />
      </Route>

      {/* Authenticated Dashboard Pages */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ai-systems" element={<AISystems />} />
        <Route path="/ai-systems/:id" element={<PersonalizationCenter />} />
        <Route path="/ai-systems/:id/personalization" element={<PersonalizationCenter />} />
        <Route path="/ai-systems/:id/risk-profile" element={<RiskProfilePage />} />
        <Route path="/ai-systems/:id/trust-memory" element={<TrustMemoryPage />} />

        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/evaluations/:id" element={<EvaluationDetail />} />
        <Route path="/evaluations/:id/results" element={<EvaluationDetail />} />
        <Route path="/evaluations/compare" element={<CompareEvaluations />} />

        <Route path="/vulnerabilities" element={<Vulnerabilities />} />
        <Route path="/ai-firewall" element={<FirewallPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/test-playground" element={<Playground />} />
        <Route path="/test-library" element={<TestLibrary />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
