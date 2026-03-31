
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Layout from '../components/Layout';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Patient, Assessment, User } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EditPatientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSuccess: (updated: Patient) => void;
  currentUser: any;
  doctors: User[];
}> = ({ isOpen, onClose, patient, onSuccess, currentUser, doctors }) => {
  const [form, setForm] = useState({
    mrn: patient.mrn,
    firstName: patient.firstName,
    lastName: patient.lastName,
    dob: patient.dob.split('T')[0],
    gender: patient.gender,
    ward: patient.ward,
    room: patient.room,
    diagnosis: patient.diagnosis,
    doctor_id: patient.doctor_id?.toString() || '',
    previousWound: patient.previousWound || '',
    healingTime: patient.healingTime || '',
    diabetes: patient.diabetes || '',
    ulcer: patient.ulcer || '',
    bp: patient.bp || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Ensure doctor_id is either a number or null
      const submitData = {
          ...form,
          doctor_id: form.doctor_id ? parseInt(form.doctor_id) : null
      };
      const success = await db.updatePatient(patient.id, submitData);
      if (success) {
        onSuccess({ ...patient, ...submitData });
        onClose();
      } else {
        setError('Failed to update patient details.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl my-8">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Edit Clinical Record</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Modify Patient Demographics</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-6 scrollbar-hide">
            {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="MRN" value={form.mrn} onChange={v => setForm({ ...form, mrn: v })} />
              <InputGroup label="Gender" type="select" options={['Male', 'Female', 'Other']} value={form.gender} onChange={v => setForm({ ...form, gender: v })} />
              <InputGroup label="First Name" value={form.firstName} onChange={v => setForm({ ...form, firstName: v })} />
              <InputGroup label="Last Name" value={form.lastName} onChange={v => setForm({ ...form, lastName: v })} />
              <InputGroup label="Date of Birth" type="date" value={form.dob} onChange={v => setForm({ ...form, dob: v })} />
              <InputGroup label="Ward" value={form.ward} onChange={v => setForm({ ...form, ward: v })} />
              <InputGroup label="Room" value={form.room} onChange={v => setForm({ ...form, room: v })} />
              {currentUser?.role === 'ADMIN' && (
                <InputGroup label="Assign Primary Doctor" type="select" options={[{ label: 'Unassigned', value: '' }, ...doctors.map((d: any) => ({ label: d.fullName, value: d.id.toString() }))]} value={form.doctor_id} onChange={v => setForm({ ...form, doctor_id: v })} />
              )}
              <InputGroup label="Previous Wound(s)" value={form.previousWound} onChange={v => setForm({ ...form, previousWound: v })} />
              <InputGroup label="Healing Time" value={form.healingTime} onChange={v => setForm({ ...form, healingTime: v })} />
              <InputGroup label="Diabetes Status" value={form.diabetes} onChange={v => setForm({ ...form, diabetes: v })} />
              <InputGroup label="Ulcer History" value={form.ulcer} onChange={v => setForm({ ...form, ulcer: v })} />
              <InputGroup label="Blood Pressure (BP)" value={form.bp} onChange={v => setForm({ ...form, bp: v })} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Clinical Diagnosis</label>
              <textarea
                value={form.diagnosis}
                onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-save"></i>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const InputGroup = ({ label, value, onChange, type = 'text', options = [] }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
    {type === 'select' ? (
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500">
        {options.map((o: any) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
    )}
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="font-bold text-slate-800 leading-snug">{value}</p>
  </div>
);

const calculateAge = (dobString: string) => {
  if (!dobString) return 'N/A';
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
  }
  return `${age} Yrs`;
};

const PatientDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  doctors: User[];
}> = ({ isOpen, onClose, patient, doctors }) => {
  if (!isOpen) return null;

  const doctor = doctors.find(d => d.id === patient.doctor_id?.toString() || d.id === patient.doctor_id);

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Clinical Profile</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Full Demographic Summary</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-8 space-y-5 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 text-sm">
            <DetailRow label="First Name" value={patient.firstName} />
            <DetailRow label="Last Name" value={patient.lastName} />
            <DetailRow label="MRN" value={patient.mrn} />
            <DetailRow label="Gender" value={patient.gender} />
            <DetailRow label="Date of Birth" value={new Date(patient.dob).toLocaleDateString(undefined, { dateStyle: 'long' })} />
            <DetailRow label="Age" value={calculateAge(patient.dob)} />
            <DetailRow label="Admission Date" value={patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'} />
            <DetailRow label="Ward" value={patient.ward} />
            <DetailRow label="Room" value={patient.room} />
            <div className="col-span-2 pt-2 border-t border-slate-50">
              <DetailRow label="Primary Physician" value={doctor ? doctor.fullName : 'Unassigned'} />
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-50 border-b pb-2">
              <DetailRow label="Clinical Diagnosis" value={patient.diagnosis || 'None specified'} />
            </div>
            <DetailRow label="Previous Wound(s)" value={patient.previousWound || 'None'} />
            <DetailRow label="Healing Time" value={patient.healingTime || 'N/A'} />
            <DetailRow label="Diabetes Status" value={patient.diabetes || 'None'} />
            <DetailRow label="Ulcer History" value={patient.ulcer || 'None'} />
            <div className="col-span-2">
              <DetailRow label="Blood Pressure (BP)" value={patient.bp || 'N/A'} />
            </div>
          </div>
        </div>
        <div className="p-8 border-t border-slate-50 bg-slate-50/20 text-center">
             <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">Close File</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;

      const userJson = sessionStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;

      if (user?.role === 'NURSE') {
        const assignedPatients = await db.getPatientsByNurse(parseInt(user.id));
        const isAssigned = assignedPatients.some(p => p.id === id);
        if (!isAssigned) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }

      if (user?.role === 'DOCTOR') {
        const myPatients = await db.getPatients('DOCTOR', parseInt(user.id));
        const isAssigned = myPatients.some(p => p.id === id);
        if (!isAssigned) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }

      if (user?.role === 'PATIENT') {
        const myPatient = await db.getPatientByUserId(parseInt(user.id));
        if (!myPatient || myPatient.id !== id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }

      const [p, v, usersList] = await Promise.all([
        db.getPatientById(id),
        db.getAssessmentsByPatient(id),
        db.getUsers()
      ]);
      setPatient(p);
      setVisits(v);
      setDoctors(usersList.filter((u: any) => u.role === 'DOCTOR'));
      setCurrentUser(user);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <Layout title="Patient File"><div className="p-20 text-center animate-pulse">Synchronizing Clinical Data...</div></Layout>;
  if (accessDenied) return (
    <Layout title="Access Restricted">
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 text-3xl shadow-sm border border-rose-100">
          <i className="fas fa-user-lock"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Unauthorized Clinical Access</h2>
        <p className="text-slate-500 font-medium max-w-md mx-auto">This patient record is currently restricted. You can only access patients explicitly assigned to your shift by a Lead Physician.</p>
        <Link to="/dashboard" className="inline-block mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
          Return to Hub
        </Link>
      </div>
    </Layout>
  );
  if (!patient) return <Layout title="Error"><div className="p-20 text-center text-red-500 font-bold">Patient Not Found</div></Layout>;

  // Ensure chart data is sorted oldest to newest
  const chartData = [...visits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(v => ({
    date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: new Date(v.date).toLocaleDateString(),
    granulation: v.granulation_pct,
    status: v.status
  }));

  const latest = visits[0]; // Already sorted descending by date in db service
  const lineColor = latest ? (latest.status === 'Healing' ? '#10b981' : latest.status === 'Stable' ? '#eab308' : '#ef4444') : '#3b82f6';

  // Healing Estimation Logic
  const getHealingEstimate = () => {
    if (visits.length < 2) return null;
    
    const sortedVisits = [...visits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sortedVisits[0];
    const last = sortedVisits[sortedVisits.length - 1];
    
    const deltaG = last.granulation_pct - first.granulation_pct;
    const deltaT = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
    
    if (deltaG <= 0 || deltaT <= 0) return "Stable trend - monitoring required";
    
    const ratePerDay = deltaG / deltaT;
    const remainingG = 100 - last.granulation_pct;
    const daysRemaining = Math.ceil(remainingG / ratePerDay);
    
    if (daysRemaining <= 0) return "Healing complete";
    if (daysRemaining > 365) return "Long-term recovery expected (>1 year)";
    
    if (daysRemaining >= 30) {
        const months = Math.floor(daysRemaining / 30);
        const days = daysRemaining % 30;
        return `~ ${months} month${months > 1 ? 's' : ''}${days > 0 ? ` and ${days} days` : ''}`;
    }
    
    return `~ ${daysRemaining} days`;
  };

  return (
    <Layout title={`Patient File: ${patient.firstName} ${patient.lastName}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Header */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black ${patient.status === 'Recovered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-extrabold text-slate-800">{patient.firstName} {patient.lastName}</h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${patient.status === 'Recovered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {patient.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                  <p className="whitespace-nowrap">MRN: <span className="font-bold text-slate-700">{patient.mrn}</span></p>
                  <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:inline"></span>
                  <p className="whitespace-nowrap">DOB: <span className="font-bold text-slate-700">{new Date(patient.dob).toLocaleDateString()}</span></p>
                  <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:inline"></span>
                  <p className="whitespace-nowrap">Age: <span className="font-bold text-slate-700">{calculateAge(patient.dob)}</span></p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {(() => {
                const userJson = sessionStorage.getItem('user');
                const currentUser = userJson ? JSON.parse(userJson) : null;
                const canManage = ['ADMIN', 'NURSE', 'DOCTOR'].includes(currentUser?.role);

                if (!canManage) return null;

                return (
                    <>
                        <button
                            onClick={async () => {
                                const newStatus = patient.status === 'Active' ? 'Recovered' : 'Active';
                                const success = await db.updatePatientStatus(patient.id, newStatus);
                                if (success) {
                                    setPatient({ ...patient, status: newStatus });
                                }
                            }}
                            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all border ${patient.status === 'Active' ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}
                        >
                            {patient.status === 'Active' ? 'Mark Recovered' : 'Reactivate'}
                        </button>
                        {(currentUser?.role === 'ADMIN' || currentUser?.role === 'DOCTOR') && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-6 py-2.5 bg-white text-slate-600 rounded-xl font-bold text-xs border border-slate-200 hover:bg-slate-50 transition-all"
                            >
                                Edit Profile
                            </button>
                        )}
                        <Link to={`/add-assessment?patientId=${patient.id}`} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all">
                            New Assessment
                        </Link>
                    </>
                );
            })()}
        </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button 
              onClick={() => setIsDetailsModalOpen(true)}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                <i className="fas fa-id-card"></i>
              </div>
              <div className="text-left">
                <h4 className="font-black text-slate-800 tracking-tight">Complete Details</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">View Profile Info</p>
              </div>
            </button>

            <button 
              onClick={() => document.getElementById('visit-log')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                <i className="fas fa-history"></i>
              </div>
              <div className="text-left">
                <h4 className="font-black text-slate-800 tracking-tight">History</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Clinical Visit Logs</p>
              </div>
            </button>

            <button 
              onClick={() => document.getElementById('healing-chart')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center gap-4 group"
            >
              <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform`} style={{ backgroundColor: lineColor }}>
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="text-left">
                <h4 className="font-black text-slate-800 tracking-tight">Healing Chart</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">View Recovery Trend</p>
              </div>
            </button>
          </div>

          <EditPatientModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            patient={patient}
            onSuccess={setPatient}
            currentUser={currentUser}
            doctors={doctors}
          />

          <PatientDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            patient={patient}
            doctors={doctors}
          />

          {/* Longitudinal Chart */}
          <div id="healing-chart" className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Wound Recovery Timeline</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Healing Progress Analysis</p>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[9px] font-black uppercase tracking-[0.15em]">
                <div className="flex items-center gap-1.5 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Healing (Recovering)</div>
                <div className="flex items-center gap-1.5 text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Stable (Moderate)</div>
                <div className="flex items-center gap-1.5 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Deteriorating (High Risk)</div>
                <div className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-[2px] bg-emerald-500/80 border-dashed border-t border-emerald-500"></span> Clinical Goal (80%)</div>
              </div>
            </div>
            <div className="h-[300px] w-full mt-4">
              {visits.length < 2 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-50 rounded-[2.5rem] text-slate-300 gap-6">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border border-slate-100">
                    <i className="fas fa-chart-line text-2xl"></i>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Awaiting clinical baseline for trend generation</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="granulation"
                      name="Granulation %"
                      stroke={lineColor}
                      strokeWidth={4}
                      dot={{ r: 6, fill: lineColor, strokeWidth: 3, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 4 }}
                      animationDuration={1500}
                    />
                    {/* Reference Line for Target */}
                    <Line
                      type="monotone"
                      dataKey={() => 80}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Visit History */}
          <div id="visit-log" className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl -ml-32 -mt-32"></div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
                <i className="fas fa-notes-medical text-blue-600"></i>
                Clinical Visit Log
              </h3>
              <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-100">
                {visits.length} Recorded Assessments
              </span>
            </div>
            <div className="space-y-6">
              {visits.map((v, index) => (
                <Link
                  to={`/assessments/${v.id}`}
                  key={v.id}
                  className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all group cursor-pointer overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-8 mb-6 xl:mb-0">
                    <div className="text-center min-w-[80px] p-4 bg-slate-50 rounded-2xl border border-slate-100 relative shadow-inner">
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded uppercase tracking-widest shadow-sm">
                          LOG #{visits.length - index}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(v.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{new Date(v.date).getDate()}</p>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-base mb-1">{v.wound_location}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] flex items-center gap-2">
                        {v.wound_stage} <span className="w-1 h-1 bg-slate-200 rounded-full"></span> {v.length_cm}x{v.width_cm} CM AREA
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 xl:gap-14">
                    <div className="min-w-[220px] hidden 2xl:block">
                      <p className="text-[9px] font-black text-slate-350 uppercase tracking-[0.2em] mb-3">Clinical Insight</p>
                      <p className="text-xs font-bold text-slate-500 line-clamp-2 max-w-[240px] leading-relaxed italic">
                        "{v.doctor_suggestion || 'Routine assessment protocol followed.'}"
                      </p>
                    </div>
                    <div className="text-center px-10 border-x border-slate-50">
                        <p className="text-[9px] font-black text-slate-350 uppercase tracking-[0.2em] mb-2">Granulation</p>
                        <div className="flex items-center gap-2">
                            <p className={`text-2xl font-black ${v.granulation_pct >= 80 ? 'text-emerald-500' : 'text-blue-600'} tracking-tighter`}>{v.granulation_pct}%</p>
                            <div className="h-1.5 w-12 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div className={`h-full ${v.granulation_pct >= 80 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${v.granulation_pct}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${v.status === 'Healing' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {v.status}
                      </span>
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all flex items-center justify-center shadow-inner group-hover:shadow-lg">
                        <i className="fas fa-chevron-right text-xs"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div id="clinical-details" className="bg-slate-900 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[80px]"></div>
            <h3 className="font-bold uppercase tracking-wider text-xs text-slate-400 mb-10 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Clinical Identifier
            </h3>
            <div className="space-y-10">
              <SummaryItem icon="fas fa-file-medical" label="Primary Diagnosis" value={patient.diagnosis || 'Unspecified'} />
              <SummaryItem icon="fas fa-hospital" label="Active Ward" value={patient.ward} />
              <SummaryItem icon="fas fa-bed" label="Assigned Bed" value={patient.room} />
              <SummaryItem icon="fas fa-calendar-check" label="Admission Date" value={new Date(patient.admissionDate).toLocaleDateString(undefined, { dateStyle: 'long' })} />
            </div>
          </div>

          <div className="bg-blue-600 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden">
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <h3 className="font-bold uppercase tracking-wider text-xs text-blue-100 mb-8 flex items-center gap-3">
              <i className="fas fa-robot animate-pulse"></i>
              DeepLens AI Insight
            </h3>
            {latest ? (
              <div className="space-y-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                    <p className="text-4xl font-bold tracking-tight">{latest.granulation_pct}%</p>
                    <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-2">Granulation</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 opacity-80">Estimated Recovery</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                      <p className="text-xl font-bold tracking-tight">{getHealingEstimate() || 'Calculating...'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 opacity-80">Healing Velocity Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                    <p className="text-xl font-bold tracking-tight">{latest.status}</p>
                  </div>
                </div>
                {latest.doctor_suggestion && (
                  <div className="bg-slate-900/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
                    <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4 opacity-80">Automated Care Plan</p>
                    <p className="text-sm font-semibold leading-relaxed">{latest.doctor_suggestion}</p>
                  </div>
                )}
                <div className="bg-blue-700/40 p-6 rounded-[2rem] border border-blue-500/30">
                  <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.2em] mb-4 opacity-80">Clinical Observation</p>
                  <p className="text-sm font-semibold leading-relaxed italic opacity-90 line-clamp-3">
                    "{latest.notes}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-10 bg-blue-700/30 rounded-[2rem] border border-blue-500/30 text-center">
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">Awaiting First Insight</p>
              </div>
            )}
          </div>

          {/* Task Assignment Section for Doctors */}
          {(() => {
            const userJson = sessionStorage.getItem('user');
            const currentUser = userJson ? JSON.parse(userJson) : null;

            if (currentUser?.role === 'DOCTOR') {
              return <TaskAssignment patientId={id!} doctorId={currentUser.id} />;
            }
            return null;
          })()}
        </div>
      </div>
    </Layout >
  );
};

const TaskAssignment = ({ patientId, doctorId }: { patientId: string, doctorId: string }) => {
  const [nurses, setNurses] = useState<any[]>([]);
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const u = await db.getUsers();
      setNurses(u.filter((n: any) => n.role === 'NURSE'));
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNurseId) return;
    setLoading(true);
    const success = await db.createTask({
      doctor_id: parseInt(doctorId),
      nurse_id: parseInt(selectedNurseId),
      patient_id: patientId,
      title,
      description: desc,
      due_date: new Date(Date.now() + 86400000).toISOString() // Default 24h
    });
    if (success) {
      setTitle('');
      setDesc('');
      alert('Task assigned to nurse!');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8">
      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3">
        <i className="fas fa-user-nurse text-blue-600"></i>
        Add New Assignment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          value={selectedNurseId}
          onChange={e => setSelectedNurseId(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Nurse...</option>
          {nurses.map(n => <option key={n.id} value={n.id}>{n.fullName}</option>)}
        </select>
        <input
          required
          placeholder="Assignment Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Clinical Instructions..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
        <button
          disabled={loading || !selectedNurseId}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
        >
          {loading ? 'Processing...' : 'Add New Assignment'}
        </button>
      </form>
    </div>
  );
};

const SummaryItem = ({ label, value, icon }: any) => (
  <div className="flex gap-5">
    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
      <i className={icon}></i>
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-sm font-bold text-white tracking-tight">{value}</p>
    </div>
  </div>
);

export default PatientProfile;
