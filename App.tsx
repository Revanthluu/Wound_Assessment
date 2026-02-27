import React, { ReactNode } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';

// Page Imports
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import RoleSelection from './pages/RoleSelection';
import { Dashboard } from './pages/Dashboard';
import { AddAssessment } from './pages/AddAssessment';
import { AssessmentHistory } from './pages/AssessmentHistory';
import LoadingScreen from './pages/LoadingScreen';
import PatientList from './pages/PatientList';
import AddPatient from './pages/AddPatient';
import PatientProfile from './pages/PatientProfile';
import StaffList from './pages/StaffList';
import AssessmentDetail from './pages/AssessmentDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MyHealthFile from './pages/MyHealthFile';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? <>{children}</> : <Navigate to="/" replace />;
};

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  if (!isLoggedIn) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/loading" element={<LoadingScreen />} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add-assessment" element={<ProtectedRoute><AddAssessment /></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute><AssessmentHistory /></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute><PatientList /></ProtectedRoute>} />
        <Route path="/my-profile" element={<ProtectedRoute><MyHealthFile /></ProtectedRoute>} />
        <Route path="/staff" element={<RoleProtectedRoute allowedRoles={[UserRole.ADMIN]}><StaffList /></RoleProtectedRoute>} />
        <Route path="/add-patient" element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
        <Route path="/patients/:id" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
        <Route path="/assessments/:id" element={<ProtectedRoute><AssessmentDetail /></ProtectedRoute>} />

        {/* Fallback routes */}
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
