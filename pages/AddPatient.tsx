
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { db, APIError } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { Patient } from '../types';

const AddPatient: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [form, setForm] = useState({
    mrn: '', firstName: '', lastName: '', dob: '', gender: 'Male', ward: 'Medical-Surgical', room: '', diagnosis: ''
  });

  React.useEffect(() => {
    const fetchUsers = async () => {
      const u = await db.getUsers();
      setUsers(u.filter(user => user.role === 'PATIENT'));
    };
    fetchUsers();
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
        user_id: selectedUserId ? parseInt(selectedUserId) : undefined
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Medical Record ID (MRN)" value={form.mrn} onChange={v => setForm({ ...form, mrn: v })} required placeholder="e.g. MRN-7729" />
            <InputGroup label="Link System Account" type="select" options={[{ label: 'Unlinked', value: '' }, ...users.map(u => ({ label: u.fullName, value: u.id.toString() }))]} value={selectedUserId} onChange={v => setSelectedUserId(v)} />
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
            <button type="submit" disabled={loading} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 disabled:opacity-50 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              {loading ? <><i className="fas fa-circle-notch animate-spin"></i> Securing Record...</> : <><i className="fas fa-user-plus"></i> Complete Clinical Registration</>}
            </button>
          </div>
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
