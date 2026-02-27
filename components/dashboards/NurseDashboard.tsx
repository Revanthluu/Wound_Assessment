import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Assessment, User, Task, Patient } from '../../types';
import { DashboardHeader, ClinicalStat, SectionHeader, CriticalCard } from './SharedDashboardComponents';
import { Link, useNavigate } from 'react-router-dom';

export const NurseDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tData, aData, pData] = await Promise.all([
                    db.getTasks('NURSE', parseInt(user.id)),
                    db.getAssessments(),
                    db.getPatientsByNurse(parseInt(user.id))
                ]);
                setTasks(tData);
                setAssessments(aData);
                setPatients(pData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleToggleStatus = (e: React.MouseEvent, task: Task) => {
        e.stopPropagation();
        const updateTask = async () => {
            const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
            const success = await db.updateTaskStatus(task.id, newStatus);
            if (success) {
                setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            }
        };
        updateTask();
    };

    const handleStatClick = (type: 'pending' | 'urgent' | 'watchlist') => {
        if (type === 'pending' || type === 'urgent') {
            document.getElementById('task-list')?.scrollIntoView({ behavior: 'smooth' });
        } else if (type === 'watchlist') {
            document.getElementById('critical-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const urgentTasks = pendingTasks.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        const now = new Date();
        const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours < 1 || due < now;
    });

    const criticalPatients = patients.filter(p => {
        const latest = assessments.find(a => a.patient_id === p.id);
        return latest && (latest.status === 'Deteriorating' || latest.pain_level >= 8);
    }).map(p => ({
        ...p,
        latestAssessment: assessments.find(a => a.patient_id === p.id)
    }));

    if (loading) return <div className="p-12 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Synchronizing Nurse Station...</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <DashboardHeader
                title="Nursing Care Hub"
                subtitle="Active Ward Monitoring & Task Execution"
                icon="fas fa-user-nurse"
                currentUser={user}
                colorClass="bg-indigo-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ClinicalStat
                    label="Pending Protocols"
                    value={pendingTasks.length}
                    icon="fas fa-clipboard-list"
                    color="blue"
                    subtitle="Awaiting Action"
                    onClick={() => handleStatClick('pending')}
                />
                <ClinicalStat
                    label="Urgent Status"
                    value={urgentTasks.length}
                    icon="fas fa-clock"
                    color="amber"
                    trend="IMMEDIATE"
                    onClick={() => handleStatClick('urgent')}
                />
                <ClinicalStat
                    label="Patient Watchlist"
                    value={criticalPatients.length}
                    icon="fas fa-heartbeat"
                    color="rose"
                    subtitle="Critical Condition"
                    onClick={() => handleStatClick('watchlist')}
                />
                <ClinicalStat label="Team Handover" value={tasks.filter(t => t.status === 'COMPLETED').length} icon="fas fa-check-double" color="emerald" subtitle="Today Completed" />
            </div>

            {urgentTasks.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2.5rem] flex items-center justify-between shadow-lg shadow-amber-100/50 animate-bounce-subtle">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ring-4 ring-amber-100">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-amber-900 tracking-tight">Priority Escalation Required</h4>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">{urgentTasks.length} tasks are past due or critically close to deadline.</p>
                        </div>
                    </div>
                    <button onClick={() => handleStatClick('urgent')} className="px-8 py-3 bg-white text-amber-600 font-black text-[10px] uppercase tracking-widest rounded-full shadow-sm border border-amber-200 hover:bg-amber-100 transition-all">Resolve Now</button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10" id="task-list">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <SectionHeader title="Shift Assignment Queue" icon="fas fa-list-check" colorClass="bg-indigo-50 text-indigo-500" />
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                        <i className="fas fa-mug-hot text-3xl"></i>
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">All protocols currently clear</p>
                                </div>
                            ) : (
                                tasks.map(t => {
                                    const isUrgent = urgentTasks.some(ut => ut.id === t.id);
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => navigate(`/patients/${t.patient_id}`)}
                                            className={`p-6 rounded-[2.5rem] border transition-all group cursor-pointer overflow-hidden ${t.status === 'COMPLETED' ? 'bg-slate-50/50 border-slate-100 opacity-60' : isUrgent ? 'bg-amber-50/30 border-amber-200 shadow-amber-50' : 'bg-white border-slate-100 hover:shadow-xl hover:scale-[1.01]'}`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.status === 'COMPLETED' ? 'bg-white text-emerald-500' : isUrgent ? 'bg-amber-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-500'}`}>
                                                        <i className={t.status === 'COMPLETED' ? 'fas fa-check-circle' : 'fas fa-file-medical-alt'}></i>
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-base font-black tracking-tight ${t.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{t.title}</h4>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient: <span className="text-indigo-600">{t.first_name} {t.last_name}</span></p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => handleToggleStatus(e, t)}
                                                    className={`px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all z-10 ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                                                >
                                                    {t.status === 'COMPLETED' ? 'Restart' : 'Mark Complete'}
                                                </button>
                                            </div>
                                            <div className="px-16">
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">{t.description}</p>
                                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <span className="flex items-center gap-2">
                                                        <i className="fas fa-user-md text-blue-400"></i>
                                                        Dr. {t.doctor_name || 'Assigned Physician'}
                                                    </span>
                                                    <span className={`flex items-center gap-2 ${isUrgent ? 'text-amber-600' : ''}`}>
                                                        <i className="fas fa-hourglass-half"></i>
                                                        Due: {t.due_date ? new Date(t.due_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Deadline'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden" id="critical-section">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                        <SectionHeader title="Critical Monitoring" icon="fas fa-heart-pulse" colorClass="bg-rose-50 text-rose-500" />
                        <div className="space-y-4 relative z-10">
                            {criticalPatients.length > 0 ? (
                                criticalPatients.map(p => (
                                    <CriticalCard
                                        key={p.id}
                                        patientName={`${p.firstName} ${p.lastName}`}
                                        mrn={p.mrn}
                                        reason={p.latestAssessment?.status === 'Deteriorating' ? 'Condition Deteriorating' : 'High Pain Score'}
                                        id={p.id}
                                    />
                                ))
                            ) : (
                                <div className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">No Critical Patient Alerts</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-indigo-300">Quick Clinical Entry</h3>
                        <div className="space-y-4">
                            <QuickLink to="/add-assessment" icon="fas fa-plus" label="New Assessment" />
                            <QuickLink to="/patients" icon="fas fa-search" label="Search Patients" />
                            <QuickLink to="/tasks" icon="fas fa-history" label="Activity History" />
                        </div>
                        <i className="fas fa-notes-medical absolute -right-6 -bottom-6 text-9xl text-white/5 -rotate-12"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickLink = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
    <Link to={to} className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300 group-hover:text-white transition-colors">
            <i className={icon}></i>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
);
