
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { User } from '../types';

const StaffList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const stored = sessionStorage.getItem('user');
      if (stored) setCurrentUser(JSON.parse(stored));

      const data = await db.getUsers();
      setUsers(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <Layout title="System Log">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">System Activity Log</h1>
          <p className="text-slate-500 font-medium">Internal registry and usage metrics for MediWound personnel.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">
              Fetching User Registry...
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Clinician</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">System ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Last Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className={`hover:bg-slate-50/50 transition-all ${user.id === currentUser?.id ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 bg-cover bg-center border border-slate-200" style={{ backgroundImage: `url('https://picsum.photos/seed/${user.email}/100')` }}></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {user.fullName}
                            {user.id === currentUser?.id && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-tight">You</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${user.role === 'DOCTOR' ? 'bg-indigo-50 text-indigo-600' :
                        user.role === 'NURSE' ? 'bg-pink-50 text-pink-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-slate-400 font-semibold">{user.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-eye text-slate-300 text-xs"></i>
                        <p className="text-sm font-bold text-slate-700">{user.visitCount}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Visits</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <p className="text-xs font-bold text-slate-600">{new Date(user.lastLogin).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div>
            <h4 className="font-bold">Access Audit Logging</h4>
            <p className="text-xs text-blue-100 font-medium opacity-80">All clinician activities are logged for HIPAA compliance and security monitoring.</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors">
          Download Compliance Report
        </button>
      </div>
    </Layout>
  );
};

export default StaffList;
