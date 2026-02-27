
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Patient } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.role === 'PATIENT') {
        navigate('/dashboard');
        return;
      }
    }

    const fetch = async () => {
      let data: Patient[] = [];
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (currentUser?.role === 'NURSE') {
        data = await db.getPatientsByNurse(parseInt(currentUser.id));
      } else {
        data = await db.getPatients();
      }

      setPatients(data);
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const filtered = patients.filter(p =>
    p.firstName.toLowerCase().includes(search.toLowerCase()) ||
    p.lastName.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.includes(search)
  );

  return (
    <Layout title="Patient Registry">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Patient Directory</h1>
          <p className="text-slate-500 font-medium">Manage clinical records and longitudinal data.</p>
        </div>
        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
          <Link to="/add-patient" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
            <i className="fas fa-user-plus"></i>
            Register New Patient
          </Link>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative max-w-md w-full">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              placeholder="Search by name or MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Active
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Recovered
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-24 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Filtering clinical registry...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 text-3xl">
                <i className="fas fa-users-slash"></i>
              </div>
              <p className="text-slate-500 font-bold">No clinical records found.</p>
              <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Profile & Identifiers</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Status</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Facility Location</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Diagnosis</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${p.status === 'Recovered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-base">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-tight mt-0.5">
                            MRN: <span className="text-slate-700">{p.mrn}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-tight ${p.status === 'Recovered' ? 'bg-green-100/50 text-green-700 border border-green-200/50' : 'bg-blue-100/50 text-blue-700 border border-blue-200/50'}`}>
                        <span className={`w-2 h-2 rounded-full ${p.status === 'Recovered' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                        {p.status}
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-1.5 px-1 uppercase tracking-tight">Adm: {new Date(p.admissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-block">
                        <p className="text-sm font-bold text-slate-700 uppercase tracking-tight">{p.ward}</p>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Room {p.room}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-[240px]">
                        <p className="text-sm font-semibold text-slate-600 leading-relaxed truncate" title={p.diagnosis}>
                          {p.diagnosis || <span className="text-slate-400 italic">No diagnosis recorded</span>}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link to={`/patients/${p.id}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                        View Clinical File
                        <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientList;
