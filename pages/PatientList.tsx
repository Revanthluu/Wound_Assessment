
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Patient } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useDeviceType } from '../hooks/useDeviceType';

const PatientAccessModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: () => void;
}> = ({ isOpen, onClose, patient, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setEmail(`${patient.firstName.toLowerCase()}.${patient.lastName.toLowerCase()}@example.com`);
      setPassword('');
      setError('');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await db.generatePatientCredentials(patient.id, {
        email,
        password,
        fullName: `${patient.firstName} ${patient.lastName}`
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate access.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-500">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100/50">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Portal Access</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Generate Patient Login</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold">{error}</div>}
                
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Patient Name</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-500">
                        {patient.firstName} {patient.lastName}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Login Email</label>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Temporary Password</label>
                    <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Confirm Access'}
                </button>
            </form>
        </div>
    </div>,
    document.body
  );
};

const AssignDoctorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  doctors: any[];
  onSuccess: () => void;
}> = ({ isOpen, onClose, patient, doctors, onSuccess }) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient) {
      setSelectedDoctorId(patient.doctor_id?.toString() || '');
      setError('');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const submitData = {
          mrn: patient.mrn,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dob: patient.dob.split('T')[0],
          gender: patient.gender,
          ward: patient.ward,
          room: patient.room,
          diagnosis: patient.diagnosis,
          doctor_id: selectedDoctorId ? parseInt(selectedDoctorId) : null
      };
      
      const success = await db.updatePatient(patient.id, submitData);
      if (success) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to assign doctor.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign doctor.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-500">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100/50">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Assign Doctor</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Manage Care Assignment</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold">{error}</div>}
                
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Patient Name</label>
                    <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-500">
                        {patient.firstName} {patient.lastName}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Primary Doctor</label>
                    <select 
                        value={selectedDoctorId} 
                        onChange={e => setSelectedDoctorId(e.target.value)} 
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    >
                        <option value="">Unassigned</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>{d.fullName}</option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Confirm Assignment'}
                </button>
            </form>
        </div>
    </div>,
    document.body
  );
};

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]); // Added this line
  const [accessModalPatient, setAccessModalPatient] = useState<Patient | null>(null);
  const [assignDoctorModalPatient, setAssignDoctorModalPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  const fetch = async () => {
    try {
      setLoading(true);
      const userJson = sessionStorage.getItem('user');
      const currentUser = userJson ? JSON.parse(userJson) : null;
      let data = await db.getPatients(currentUser?.role, currentUser?.id);
      
      // Additional safety filtering on the frontend just in case
      if (currentUser?.role === 'NURSE') {
        const myPatients = await db.getPatientsByNurse(parseInt(currentUser.id));
        const myIds = new Set(myPatients.map(p => p.id));
        data = data.filter(p => myIds.has(p.id));
      } else if (currentUser?.role === 'DOCTOR') {
        data = data.filter(p => p.doctor_id === parseInt(currentUser.id));
      }

      setPatients(data);
      if (currentUser?.role === 'ADMIN') {
        const u = await db.getUsers();
        setUsers(u);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

    fetch();
    const interval = setInterval(fetch, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useSocket({
    'PATIENT_UPDATED': () => {
      fetch();
    },
    'PATIENT_CREATED': () => {
      fetch();
    }
  });

  const filtered = patients.filter(p => {
    const matchesSearch = p.firstName.toLowerCase().includes(search.toLowerCase()) ||
                         p.lastName.toLowerCase().includes(search.toLowerCase()) ||
                         p.mrn.includes(search);
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout title="Patient Registry">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Patient Directory</h1>
          <p className="text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Manage clinical records and patient longitudinal data.</p>
        </div>
        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
          <Link to="/add-patient" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            <i className="fas fa-plus"></i>
            Add New Patient
          </Link>
        )}
      </div>

      <PatientAccessModal
        isOpen={!!accessModalPatient}
        onClose={() => setAccessModalPatient(null)}
        patient={accessModalPatient}
        onSuccess={() => {
          fetch();
          setAccessModalPatient(null);
        }}
      />

      <AssignDoctorModal
        isOpen={!!assignDoctorModalPatient}
        onClose={() => setAssignDoctorModalPatient(null)}
        patient={assignDoctorModalPatient}
        doctors={users.filter(u => u.role === 'DOCTOR')}
        onSuccess={() => {
          fetch();
          setAssignDoctorModalPatient(null);
        }}
      />

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-xl w-full">
            <div className="relative flex-1 w-full">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder="Search by name or MRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl text-slate-600 font-bold text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full sm:w-auto"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Recovered">Recovered</option>
            </select>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
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
          ) : isMobile ? (
            <div className="flex flex-col gap-4 p-4 md:p-6 bg-slate-50/30">
              {filtered.map(p => (
                <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-sm ${p.status === 'Recovered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">{p.firstName} {p.lastName}</h4>
                        <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight mt-0.5">MRN: {p.mrn}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${p.status === 'Recovered' ? 'bg-green-100/50 text-green-700 border border-green-200/50' : 'bg-blue-100/50 text-blue-700 border border-blue-200/50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Recovered' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                      {p.status}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-100">
                      Adm: {new Date(p.admissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                     <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase text-slate-400">Location</p>
                       <p className="text-xs font-bold text-slate-700">Ward {p.ward} • Rm {p.room}</p>
                     </div>
                     <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                       <p className="text-[10px] font-black uppercase text-slate-400">Diagnosis</p>
                       <p className="text-xs font-bold text-slate-700 max-w-[150px] truncate text-right">{p.diagnosis || <span className="text-slate-400 italic">None</span>}</p>
                     </div>
                  </div>
                  
                  {user?.role === 'ADMIN' && (
                     <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                       <div className="flex items-center gap-2">
                         {p.doctor_id ? (
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                               {users.find(u => String(u.id) === String(p.doctor_id))?.fullName?.[0] || 'D'}
                             </div>
                             <span className="text-xs font-bold text-slate-700">
                               {users.find(u => String(u.id) === String(p.doctor_id))?.fullName || 'Unknown'}
                             </span>
                           </div>
                         ) : (
                           <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100 uppercase tracking-widest">Unassigned</span>
                         )}
                       </div>
                       <button
                         onClick={(e) => {
                           e.stopPropagation();
                           setAssignDoctorModalPatient(p);
                         }}
                         className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
                       >
                         <i className="fas fa-edit"></i>
                       </button>
                     </div>
                  )}
                  
                  {user?.role === 'ADMIN' && (
                    <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                        {!p.user_id ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAccessModalPatient(p);
                            }}
                            className="w-full justify-center inline-flex items-center gap-2 px-4 py-3 min-h-[44px] bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
                          >
                            <i className="fas fa-key"></i> Provide Access
                          </button>
                        ) : (
                          <span className="w-full justify-center inline-flex items-center gap-1.5 px-3 py-3 min-h-[44px] bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <i className="fas fa-check-circle text-emerald-500"></i> Access Active
                          </span>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-5 text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">Profile & Identifiers</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">Clinical Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">Facility Location</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">Primary Diagnosis</th>
                  {user?.role === 'ADMIN' && <th className="px-8 py-5 text-xs font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">Assigned Doctor</th>}
                  <th className="px-8 py-5 text-xs font-black text-slate-600 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-all cursor-pointer group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-sm ${p.status === 'Recovered' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors text-base truncate max-w-[200px]">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight mt-0.5">
                            MRN: <span className="text-slate-700">{p.mrn}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-tight ${p.status === 'Recovered' ? 'bg-green-100/50 text-green-700 border border-green-200/50' : 'bg-blue-100/50 text-blue-700 border border-blue-200/50'}`}>
                        <span className={`w-2 h-2 rounded-full ${p.status === 'Recovered' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                        {p.status}
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-1.5 px-1 uppercase tracking-tight">Adm: {new Date(p.admissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 inline-block">
                        <p className="text-sm font-extrabold text-slate-700 uppercase tracking-tight">{p.ward}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Room {p.room}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-[300px]">
                        <p className="text-sm font-bold text-slate-700 leading-snug line-clamp-2" title={p.diagnosis}>
                          {p.diagnosis || <span className="text-slate-400 italic">No diagnosis recorded</span>}
                        </p>
                      </div>
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center justify-between gap-4">
                          {p.doctor_id ? (
                             <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                 {users.find(u => String(u.id) === String(p.doctor_id))?.fullName?.[0] || 'D'}
                               </div>
                               <span className="text-xs font-bold text-slate-700">
                                 {users.find(u => String(u.id) === String(p.doctor_id))?.fullName || 'Unknown Doctor'}
                               </span>
                             </div>
                          ) : (
                            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded border border-rose-100 uppercase tracking-widest">Unassigned</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignDoctorModalPatient(p);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
                            title="Assign Doctor"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        {user?.role === 'ADMIN' && (
                          !p.user_id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAccessModalPatient(p);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
                            >
                              <i className="fas fa-key"></i> Provide Access
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                              <i className="fas fa-check-circle text-emerald-500"></i> Access Active
                            </span>
                          )
                        )}

                        <Link to={`/patients/${p.id}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
                          View Clinical File
                          <i className="fas fa-chevron-right text-[10px] opacity-50"></i>
                        </Link>
                      </div>
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
