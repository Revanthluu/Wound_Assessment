import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { User, UserRole } from '../types';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { DoctorDashboard } from '../components/dashboards/DoctorDashboard';
import { NurseDashboard } from '../components/dashboards/NurseDashboard';
import { PatientDashboard } from '../components/dashboards/PatientDashboard';

import { db } from '../services/db';

export const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setCurrentUser(userObj);
      
      // Sync with latest data from DB to get updated fields like age/experience
      db.getUsers().then(users => {
          const latest = users.find(u => u.id === userObj.id);
          if (latest) {
              setCurrentUser(latest);
              sessionStorage.setItem('user', JSON.stringify(latest));
          }
      });
    }
    setLoading(false);
  }, []);

  if (loading) return (
    <Layout title="Dashboard">
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Synchronizing Clinical Data...</p>
      </div>
    </Layout>
  );

  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case UserRole.ADMIN:
        return <AdminDashboard />;
      case UserRole.DOCTOR:
        return <DoctorDashboard user={currentUser} />;
      case UserRole.NURSE:
        return <NurseDashboard user={currentUser} />;
      case UserRole.PATIENT:
        return <PatientDashboard user={currentUser} />;
      default:
        return <DoctorDashboard user={currentUser} />;
    }
  };

  const getTitle = () => {
    if (!currentUser) return 'Dashboard';
    switch (currentUser.role) {
      case UserRole.ADMIN: return 'System Administration';
      case UserRole.DOCTOR: return 'Clinical Overview';
      case UserRole.NURSE: return 'Nurse Station';
      case UserRole.PATIENT: return 'Health Portal';
      default: return 'Clinical Overview';
    }
  };

  return (
    <Layout title={getTitle()}>
      {renderDashboard()}
    </Layout>
  );
};

// End of file
