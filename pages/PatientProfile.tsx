
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { Patient, Assessment } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

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

      if (user?.role === 'PATIENT') {
        const myPatient = await db.getPatientByUserId(parseInt(user.id));
        if (!myPatient || myPatient.id !== id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }

      const [p, v] = await Promise.all([
        db.getPatientById(id),
        db.getAssessmentsByPatient(id)
      ]);
      setPatient(p);
      setVisits(v);
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

  return (
    <Layout title={`Patient File: ${patient.firstName} ${patient.lastName}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Header */}
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-slate-100 ${patient.status === 'Recovered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{patient.firstName} {patient.lastName}</h1>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${patient.status === 'Recovered' ? 'bg-green-100/50 text-green-700 border-green-200' : 'bg-blue-100/50 text-blue-700 border-blue-200'}`}>
                    {patient.status} Case
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                    MRN: <span className="font-mono text-slate-800 ml-1">{patient.mrn}</span>
                  </p>
                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full hidden sm:block"></span>
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
                    DOB: <span className="text-slate-800 ml-1">{new Date(patient.dob).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  const newStatus = patient.status === 'Active' ? 'Recovered' : 'Active';
                  const success = await db.updatePatientStatus(patient.id, newStatus);
                  if (success) {
                    setPatient({ ...patient, status: newStatus });
                  }
                }}
                className={`flex-1 md:flex-none px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-sm border ${patient.status === 'Active' ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-green-600 hover:text-white hover:border-green-600' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}
              >
                <i className={patient.status === 'Active' ? 'fas fa-check-double' : 'fas fa-undo-alt'}></i>
                {patient.status === 'Active' ? 'Discharge' : 'Reactivate'}
              </button>
              <Link to={`/add-assessment?patientId=${patient.id}`} className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                <i className="fas fa-plus-circle"></i>
                New Assessment
              </Link>
            </div>
          </div>

          {/* Longitudinal Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Wound Recovery Timeline</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Healing Progress Analysis</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-tight">
                <div className="flex items-center gap-2 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Clinical Goal (80%+)</div>
                <div className="flex items-center gap-2 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Recorded Granulation</div>
              </div>
            </div>
            <div className="h-[300px] w-full mt-4">
              {visits.length < 2 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 gap-3">
                  <i className="fas fa-chart-line text-3xl"></i>
                  <p className="font-bold uppercase tracking-wider text-xs">Awaiting second visit for trend generation</p>
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
                      stroke="#2563eb"
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#2563eb', strokeWidth: 3, stroke: '#fff' }}
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
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
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
                  className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-blue-500 hover:shadow-blue-50/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <div className="text-center min-w-[70px] py-2 bg-slate-50 rounded-2xl border border-slate-100 relative">
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <span className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded uppercase tracking-wide">
                          # {visits.length - index}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-0.5">{new Date(v.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                      <p className="text-2xl font-bold text-slate-800 tracking-tight">{new Date(v.date).getDate()}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{v.wound_location}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{v.wound_stage} • {v.length_cm}x{v.width_cm} cm</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-8 md:gap-12">
                    <div className="min-w-[160px] hidden lg:block">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Observation</p>
                      <p className="text-xs font-semibold text-slate-600 line-clamp-2 max-w-[200px] leading-relaxed">
                        {v.doctor_suggestion || 'Routine assessment protocol followed.'}
                      </p>
                    </div>
                    <div className="text-center px-6 border-x border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Granulation</p>
                      <p className={`text-xl font-bold ${v.granulation_pct >= 80 ? 'text-green-600' : 'text-blue-600'} tracking-tight`}>{v.granulation_pct}%</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border ${v.status === 'Healing' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                        {v.status}
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center shadow-inner">
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
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800">
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

          <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden">
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <h3 className="font-bold uppercase tracking-wider text-xs text-blue-100 mb-8 flex items-center gap-3">
              <i className="fas fa-robot animate-pulse"></i>
              DeepLens AI Insight
            </h3>
            {latest ? (
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20">
                    <p className="text-4xl font-bold tracking-tight">{latest.granulation_pct}%</p>
                    <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-2">Granulation</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2 opacity-80">Healing Velocity</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                      <p className="text-xl font-bold tracking-tight">{latest.status}</p>
                    </div>
                  </div>
                </div>
                {latest.doctor_suggestion && (
                  <div className="bg-slate-900/20 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-4 opacity-80">Automated Care Plan</p>
                    <p className="text-sm font-semibold leading-relaxed">{latest.doctor_suggestion}</p>
                  </div>
                )}
                <div className="bg-blue-700/40 p-6 rounded-3xl border border-blue-500/30">
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-4 opacity-80">Clinical Observation</p>
                  <p className="text-sm font-semibold leading-relaxed italic opacity-90 line-clamp-3">
                    "{latest.notes}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-blue-700/30 rounded-3xl border border-blue-500/30 text-center">
                <p className="text-sm text-blue-100 font-black uppercase tracking-widest">Awaiting First Insight</p>
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
    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm mt-8">
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <i className="fas fa-tasks text-blue-600"></i>
        Assign Nurse Task
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          value={selectedNurseId}
          onChange={e => setSelectedNurseId(e.target.value)}
          className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border border-slate-100"
        >
          <option value="">Select Nurse...</option>
          {nurses.map(n => <option key={n.id} value={n.id}>{n.fullName}</option>)}
        </select>
        <input
          required
          placeholder="Task Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border border-slate-100"
        />
        <textarea
          placeholder="Instructions..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs outline-none border border-slate-100 min-h-[80px]"
        />
        <button
          disabled={loading || !selectedNurseId}
          className="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Assigning...' : 'Assign Task'}
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
