import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Assessment, Patient } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { useDeviceType } from '../hooks/useDeviceType';

export const AssessmentHistory = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [patientsMap, setPatientsMap] = useState<Record<string, Patient>>({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { isMobile } = useDeviceType();

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (user?.role === 'PATIENT') {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [assessData, patientsData] = await Promise.all([
                    db.getAssessments(),
                    db.getPatients()
                ]);

                // Create a lookup map for faster patient identification
                const pMap = patientsData.reduce((acc, p) => {
                    acc[p.id] = p;
                    return acc;
                }, {} as Record<string, Patient>);

                setAssessments(assessData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setPatientsMap(pMap);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <Layout title="Assessment History">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Assessment History</h1>
                    <p className="text-slate-500 font-medium">View and manage wound assessments across all patients.</p>
                </div>
                <Link to="/add-assessment" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
                    <i className="fas fa-plus"></i>
                    New Assessment
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative flex-1 w-full max-w-md">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Search by patient, MRN, or wound location..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
                            <i className="far fa-calendar text-slate-400"></i>
                            Date Range
                        </button>
                        <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-50">
                            <i className="fas fa-filter text-slate-400"></i>
                            More Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400">Synchronizing records...</div>
                    ) : assessments.length === 0 ? (
                        <div className="p-20 text-center text-slate-500 font-bold">No assessments recorded.</div>
                    ) : isMobile ? (
                        <div className="flex flex-col gap-4 p-4 md:p-6 bg-slate-50/30">
                            {assessments.map((a) => {
                                const patient = patientsMap[a.patient_id];
                                return (
                                    <div key={a.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                                    <i className="far fa-calendar-alt"></i>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                        {patient?.mrn || 'N/A'} • {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide shrink-0 ${a.status === 'Healing'
                                                ? 'bg-green-50 text-green-600'
                                                : a.status === 'Deteriorating'
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {a.status}
                                            </span>
                                        </div>
                                        
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Wound</p>
                                                <p className="text-[11px] font-bold text-slate-700 max-w-[150px] truncate text-right text-balance">{a.wound_location} • {a.wound_type}</p>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Size</p>
                                                <div className="text-right">
                                                    <p className="text-[11px] font-extrabold text-slate-700">{(a.length_cm * a.width_cm).toFixed(1)}cm² <span className="text-[9px] font-medium text-slate-400">Area</span></p>
                                                    <p className="text-[11px] font-extrabold text-slate-700">{a.depth_cm.toFixed(1)}cm <span className="text-[9px] font-medium text-slate-400">Depth</span></p>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center border-t border-slate-200/50 pt-2">
                                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Tissue</p>
                                                <div className="w-24">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Granulation</span>
                                                        <span className="text-[9px] font-extrabold text-slate-700">{a.granulation_pct}%</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${a.granulation_pct >= 80 ? 'bg-green-500' : 'bg-blue-500'} rounded-full`}
                                                            style={{ width: `${a.granulation_pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <div className="max-w-[200px]">
                                                {a.doctor_suggestion ? (
                                                    <p className="text-[10px] text-slate-600 truncate" title={a.doctor_suggestion}>
                                                        <i className="fas fa-robot text-purple-500 mr-1.5"></i>
                                                        {a.doctor_suggestion}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] text-slate-300 italic">No suggestion</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 text-center items-center">
                                                <Link to={`/assessments/${a.id}`} className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-all font-black text-xs">
                                                    <i className="fas fa-file-medical"></i>
                                                </Link>
                                                <Link to={`/patients/${a.patient_id}`} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all font-black text-xs">
                                                    <i className="far fa-user"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Patient</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Wound</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Dimensions</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tissue Comp.</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">AI Suggestion</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assessments.map((a) => {
                                    const patient = patientsMap[a.patient_id];
                                    return (
                                        <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <Link to={`/assessments/${a.id}`} className="flex items-center gap-3 group/item">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                                                        <i className="far fa-calendar-alt"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 group-hover/item:text-blue-600 transition-colors">
                                                            {new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                            {new Date(a.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-slate-800">
                                                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                    {patient?.mrn || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{a.wound_location}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{a.wound_type}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex gap-4">
                                                    <div>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Area</p>
                                                        <p className="text-xs font-extrabold text-slate-800">{(a.length_cm * a.width_cm).toFixed(1)} <span className="text-[10px] text-slate-400 font-medium">cm²</span></p>
                                                    </div>
                                                    <div className="border-l border-slate-100 pl-4">
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Depth</p>
                                                        <p className="text-xs font-extrabold text-slate-800">{a.depth_cm.toFixed(1)} <span className="text-[10px] text-slate-400 font-medium">cm</span></p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-32">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Granulation</span>
                                                        <span className="text-[10px] font-extrabold text-slate-700">{a.granulation_pct}%</span>
                                                    </div>
                                                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${a.granulation_pct >= 80 ? 'bg-green-500' : 'bg-blue-500'} rounded-full`}
                                                            style={{ width: `${a.granulation_pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="max-w-[200px]">
                                                    {a.doctor_suggestion ? (
                                                        <p className="text-xs text-slate-600 truncate" title={a.doctor_suggestion}>
                                                            <i className="fas fa-robot text-purple-500 mr-2"></i>
                                                            {a.doctor_suggestion}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-slate-300 italic">No suggestion</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${a.status === 'Healing'
                                                    ? 'bg-green-50 text-green-600'
                                                    : a.status === 'Deteriorating'
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link to={`/assessments/${a.id}`} title="View Details" className="w-8 h-8 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center">
                                                        <i className="fas fa-file-medical"></i>
                                                    </Link>
                                                    <Link to={`/patients/${a.patient_id}`} title="Patient Profile" className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center">
                                                        <i className="far fa-user"></i>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {assessments.length} results</p>
                    <div className="flex items-center gap-2">
                        <button disabled className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg text-xs font-bold disabled:opacity-50">Previous</button>
                        <button className="px-3 py-1.5 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50">Next</button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// End of file
