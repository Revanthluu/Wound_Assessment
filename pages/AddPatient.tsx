
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { db, APIError } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types';

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientUsers, setPatientUsers] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    mrn: '', firstName: '', lastName: '', dob: '', gender: 'Male', ward: 'Medical-Surgical', room: '', diagnosis: '',
    previousWound: '', healingTime: '', diabetes: '', ulcer: '', bp: ''
  });

  React.useEffect(() => {
    const fetchUsers = async () => {
      const u = await db.getUsers();
      setPatientUsers(u.filter(user => user.role === 'PATIENT'));
      setDoctors(u.filter(user => user.role === 'DOCTOR'));
    };
    fetchUsers();

    const storedUser = sessionStorage.getItem('user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const p: any = {
        ...form,
        id: Math.random().toString(36).substr(2, 9),
        admissionDate: new Date().toISOString().split('T')[0],
        user_id: selectedUserId ? parseInt(selectedUserId) : undefined,
        doctor_id: selectedDoctorId ? parseInt(selectedDoctorId) : undefined
      };
      await db.createPatient(p);
      navigate('/patients');
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <Layout title="Register Patient">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800">New Patient Entry</h1>
          <p className="text-slate-500 font-medium">Create a permanent record in the MediWound database.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-bold text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          {/* Step Indicator */}
          <div className="flex items-center gap-6 mb-8 px-2">
            <div className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Demographics</p>
            </div>
            <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className="flex-1 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>Medical History</p>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Medical Record ID (MRN)" value={form.mrn} onChange={v => setForm({ ...form, mrn: v })} required placeholder="e.g. MRN-7729" />
                <InputGroup label="Link System Account" type="select" options={[{ label: 'Unlinked', value: '' }, ...patientUsers.map(u => ({ label: u.fullName, value: u.id.toString() }))]} value={selectedUserId} onChange={v => setSelectedUserId(v)} />
                {currentUser?.role === 'ADMIN' && (
                  <InputGroup label="Assign Primary Doctor" type="select" options={[{ label: 'Unassigned', value: '' }, ...doctors.map(d => ({ label: d.fullName, value: d.id.toString() }))]} value={selectedDoctorId} onChange={v => setSelectedDoctorId(v)} />
                )}
                <InputGroup label="Patient Gender" type="select" options={['Male', 'Female', 'Other']} value={form.gender} onChange={v => setForm({ ...form, gender: v })} />
                <InputGroup label="First Name" value={form.firstName} onChange={v => setForm({ ...form, firstName: v })} required placeholder="Enter first name" />
                <InputGroup label="Last Name" value={form.lastName} onChange={v => setForm({ ...form, lastName: v })} required placeholder="Enter last name" />
                <InputGroup label="Date of Birth" type="date" value={form.dob} onChange={v => setForm({ ...form, dob: v })} required />
                <InputGroup label="Clinical Ward / Dept" value={form.ward} onChange={v => setForm({ ...form, ward: v })} placeholder="e.g. ICU, Surgical" />
                <InputGroup label="Room / Bed #" value={form.room} onChange={v => setForm({ ...form, room: v })} placeholder="e.g. 402-A" />
              </div>
              <div className="pt-6 border-t border-slate-50">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-wider">Primary Clinical Diagnosis</label>
                <textarea
                  value={form.diagnosis}
                  onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] transition-all"
                  placeholder="Provide a detailed medical diagnosis..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button type="button" onClick={() => navigate('/patients')} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all">
                  Cancel Entry
                </button>
                <button type="button" onClick={() => setStep(2)} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                  Next: Medical History <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputGroup label="Previous Wound(s)" value={form.previousWound} onChange={v => setForm({ ...form, previousWound: v })} placeholder="Describe previous wounds or 'None'" />
                <InputGroup label="Healing Time" value={form.healingTime} onChange={v => setForm({ ...form, healingTime: v })} placeholder="e.g. 2 weeks, 1 month" />
                <InputGroup label="Diabetes Status" value={form.diabetes} onChange={v => setForm({ ...form, diabetes: v })} placeholder="e.g. Type 2, None" />
                <InputGroup label="Ulcer History" value={form.ulcer} onChange={v => setForm({ ...form, ulcer: v })} placeholder="e.g. Foot ulcer, None" />
                <InputGroup label="Blood Pressure (BP)" value={form.bp} onChange={v => setForm({ ...form, bp: v })} placeholder="e.g. 120/80" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button type="submit" disabled={loading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                  {loading ? <><i className="fas fa-circle-notch animate-spin"></i> Securing Record...</> : <><i className="fas fa-user-plus"></i> Complete Clinical Registration</>}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

const InputGroup = ({ label, value, onChange, type = 'text', options = [], required = false }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">{label}</label>
    {type === 'select' ? (
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500">
        {options.map((o: any) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
    )}
  </div>
);

export default AddPatient;
