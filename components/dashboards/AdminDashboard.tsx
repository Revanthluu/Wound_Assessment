import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { User, Patient, Assessment } from '../../types';
import { DashboardHeader, ClinicalStat, SectionHeader } from './SharedDashboardComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [uData, pData, aData] = await Promise.all([
                    db.getUsers(),
                    db.getPatients(),
                    db.getAssessments()
                ]);
                setUsers(uData);
                setPatients(pData);
                setAssessments(aData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getRoleDistribution = () => {
        return [
            { role: 'Doctors', count: users.filter(u => u.role === 'DOCTOR').length },
            { role: 'Nurses', count: users.filter(u => u.role === 'NURSE').length },
            { role: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
        ];
    };

    if (loading) return <div className="p-12 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Accessing System Core...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <DashboardHeader
                title="System Administration"
                subtitle="Infrastructure Monitoring & Compliance Oversight"
                icon="fas fa-server"
                currentUser={{ role: 'ADMIN', email: 'admin@mediwound.ai' }}
                colorClass="bg-slate-800"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ClinicalStat label="System Users" value={users.length} icon="fas fa-users-cog" color="blue" trend="ACTIVE" />
                <ClinicalStat label="Total Records" value={patients.length} icon="fas fa-database" color="indigo" subtitle="Patient Census" />
                <ClinicalStat label="Clinical Audit" value={assessments.length} icon="fas fa-history" color="emerald" subtitle="Events Logged" />
                <ClinicalStat label="Average Access" value={`${Math.round(users.reduce((acc, u) => acc + (u.visitCount || 0), 0) / (users.length || 1))}x`} icon="fas fa-key" color="amber" subtitle="Per User" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <SectionHeader title="Staff Lifecycle Metrics" icon="fas fa-chart-pie" colorClass="bg-blue-50 text-blue-500" />
                        <div className="h-64 mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getRoleDistribution()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <SectionHeader title="Access Governance" icon="fas fa-shield-alt" colorClass="bg-emerald-50 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Trace</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                                    <tr>
                                        <th className="px-10 py-6">Professional Identity</th>
                                        <th className="px-10 py-6">Operational Role</th>
                                        <th className="px-10 py-6">Access Frequency</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-10 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs shadow-sm">
                                                        {u.fullName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 text-sm leading-tight">{u.fullName}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 lowercase truncate max-w-[150px]">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className={`px-3 py-1 rounded-full font-black text-[8px] uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-rose-50 text-rose-600' :
                                                    u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600' :
                                                        u.role === 'NURSE' ? 'bg-emerald-50 text-emerald-600' :
                                                            'bg-slate-50 text-slate-600'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                                                        <div className="h-full bg-indigo-500" style={{ width: `${Math.min((u.visitCount || 0) * 5, 100)}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">{u.visitCount || 0} Traces</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <SectionHeader title="Live Admissions" icon="fas fa-bed-pulse" colorClass="bg-purple-50 text-purple-500" />
                        <div className="space-y-4">
                            {patients.slice(0, 5).map(p => (
                                <div key={p.id} className="p-4 bg-slate-50 border border-slate-50 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover:text-purple-500 shadow-sm transition-colors ring-2 ring-slate-100">
                                            <i className="fas fa-id-card"></i>
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-[11px] leading-tight mb-1">{p.firstName} {p.lastName}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MRN: {p.mrn}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 px-2 py-1 bg-white rounded-lg border border-slate-100">{p.status || 'Active'}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/patients" className="mt-8 w-full block text-center py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Audit Detailed Records</Link>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-white/40">System Protocols</h3>
                        <div className="space-y-4">
                            <AdminAction icon="fas fa-user-plus" label="Register Practitioner" />
                            <AdminAction icon="fas fa-file-invoice-dollar" label="System Compliance" />
                            <AdminAction icon="fas fa-cog" label="Core Configuration" />
                        </div>
                        <i className="fas fa-tools absolute -right-6 -bottom-6 text-9xl text-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminAction = ({ icon, label }: { icon: string; label: string }) => (
    <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/item">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/40 group-hover/item:text-emerald-400 transition-colors">
            <i className={icon}></i>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
);
