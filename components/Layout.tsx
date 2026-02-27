
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Alert, UserRole } from '../types';
import { db } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "Dashboard Overview" }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }

    const fetchAlerts = async () => {
      const data = await db.getAlerts();
      setAlerts(data);
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleMarkAsRead = async (id: number) => {
    const success = await db.markAlertAsRead(id);
    if (success) {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await db.markAllAlertsAsRead();
    if (success) {
      setAlerts([]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
            <i className="fas fa-plus"></i>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight text-xl tracking-tight">MediWound AI</h1>
            <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Clinician Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <SidebarLink to="/dashboard" icon="fas fa-th-large" label="Dashboard" />

          {currentUser?.role !== UserRole.PATIENT ? (
            <>
              <SidebarLink to="/patients" icon="fas fa-user-friends" label="Patients" />
              <SidebarLink to="/assessments" icon="fas fa-wave-square" label="Assessments" />
            </>
          ) : (
            <SidebarLink to="/my-profile" icon="fas fa-user-medical" label="My Health Profile" />
          )}

          <SidebarLink to="/reports" icon="fas fa-file-alt" label="Reports" />

          {currentUser?.role !== UserRole.PATIENT && (
            <div className="pt-4">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${showAlerts ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <i className="fas fa-bell w-5 text-center"></i>
                  <span>Alerts</span>
                </div>
                {alerts.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {currentUser?.role === UserRole.ADMIN && (
            <SidebarLink to="/staff" icon="fas fa-terminal" label="System Log" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-50 space-y-1">
          <SidebarLink to="/settings" icon="fas fa-cog" label="Settings" />
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
          >
            <i className="fas fa-sign-out-alt w-5 text-center"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-lg font-bold text-slate-800 whitespace-nowrap">{title}</h2>
            <div className="relative max-w-md w-full">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search patient MRN..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-slate-600"><i className="far fa-question-circle text-lg"></i></button>
              <button className="relative hover:text-slate-600">
                <i className="far fa-bell text-lg"></i>
              </button>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{currentUser?.fullName || 'Clinician'}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                  {currentUser?.role === 'DOCTOR' ? 'Lead Wound Specialist' : 'System User'}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full bg-slate-200 bg-cover bg-center border border-slate-100 shadow-sm"
                style={{ backgroundImage: `url('https://picsum.photos/seed/${currentUser?.email || 'user'}/100')` }}
              ></div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive
        ? 'bg-blue-50 text-blue-600 shadow-sm'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`
    }
  >
    <i className={`${icon} w-5 text-center`}></i>
    <span>{label}</span>
  </NavLink>
);

export default Layout;
