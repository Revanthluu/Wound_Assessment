import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Assessment, User, Task, Patient } from '../../types';
import { DashboardHeader, ClinicalStat, SectionHeader, CriticalCard, TaskUpdateModal } from './SharedDashboardComponents';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';

export const NurseDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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
        
    }, [user.id]);

    useSocket({
        'TASK_CREATED': (data: any) => {
            if (data.nurse_id === parseInt(user.id)) {
                db.getTasks('NURSE', parseInt(user.id)).then(tData => setTasks(tData));
            }
        },
        'ASSERTMENT_CREATED': () => {
             db.getAssessments().then(aData => setAssessments(aData));
        },
        'PATIENT_STATUS_UPDATED': () => {
             db.getPatientsByNurse(parseInt(user.id)).then(pData => setPatients(pData));
        }
    });

    const handleUpdateClick = (e: React.MouseEvent, task: Task) => {
        e.stopPropagation();
        setSelectedTask(task);
        setIsUpdateModalOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateSubmit = async (status: 'PENDING' | 'COMPLETED', note: string) => {
        if (!selectedTask) return;
        const success = await db.updateTaskStatus(selectedTask.id, status, note);
        if (success) {
            setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, status, nurse_note: note } : t));
            setIsUpdateModalOpen(false);
            setSelectedTask(null);
        }
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

            <TaskUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedTask(null);
                }}
                onSubmit={handleUpdateSubmit}
                task={selectedTask}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
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
                <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-xl shadow-rose-100/50 animate-pulse-subtle gap-6 mx-1">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-rose-200 ring-4 ring-rose-50">
                            <i className="fas fa-radiation"></i>
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-rose-900 tracking-tight">Priority Escalation Detected</h4>
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-1 opacity-80">{urgentTasks.length} protocols require immediate clinical intervention.</p>
                        </div>
                    </div>
                    <button onClick={() => handleStatClick('urgent')} className="px-10 py-4 bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 transition-all active:scale-95">Resolve Registry</button>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">
                <div className="xl:col-span-2 space-y-10" id="task-list">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Shift Assignment Queue</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Assigned Clinical Protocols</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                <i className="fas fa-clipboard-check"></i>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {tasks.length === 0 ? (
                                <div className="text-center py-24 border-2 border-dashed border-slate-50 rounded-[2.5rem]">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 border border-slate-50">
                                        <i className="fas fa-check-double text-3xl"></i>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift protocol clear</p>
                                </div>
                            ) : (
                                tasks.map(t => {
                                    const isUrgent = urgentTasks.some(ut => ut.id === t.id);
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => navigate(`/patients/${t.patient_id}`)}
                                            className={`p-8 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-all duration-300 group cursor-pointer ${t.status === 'COMPLETED' ? 'bg-slate-50/50' : ''}`}
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-500' : isUrgent ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>
                                                        <i className={t.status === 'COMPLETED' ? 'fas fa-check-circle text-lg' : isUrgent ? 'fas fa-exclamation-circle text-lg' : 'fas fa-file-medical-alt text-lg'}></i>
                                                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase mt-1 ${t.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'}`}>
                                                            {t.status === 'COMPLETED' ? 'Done' : 'Active'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-lg font-black tracking-tight mb-1 ${t.status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-800'}`}>{t.title}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest">Patient</span>
                                                            <p className="text-[11px] font-black text-blue-600">
                                                                {t.first_name} {t.last_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleUpdateClick(e, t);
                                                    }}
                                                    className={`px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : isUrgent ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-slate-900 text-white shadow-slate-200'}`}
                                                >
                                                    {t.status === 'COMPLETED' ? 'Update Task' : 'Begin Protocol'}
                                                </button>
                                            </div>
                                            <div className="lg:pl-20">
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 italic opacity-80">"{t.description}"</p>

                                                {t.nurse_note && (
                                                    <div className="mb-6 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl relative">
                                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Nurse Report</p>
                                                        <p className="text-xs text-slate-700 font-bold leading-relaxed">"{t.nurse_note}"</p>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    <span className="flex items-center gap-2">
                                                        <i className="fas fa-id-badge text-blue-400"></i>
                                                        DR. {t.doctor_name || 'PHYSICIAN'}
                                                    </span>
                                                    <span className={`flex items-center gap-2 ${isUrgent ? 'text-rose-600' : ''}`}>
                                                        <i className="fas fa-clock"></i>
                                                        BY: {t.due_date ? new Date(t.due_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
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
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm" id="critical-section">
                        <SectionHeader title="Critical Monitoring" icon="fas fa-heart-pulse" colorClass="bg-rose-50 text-rose-500" />
                        <div className="space-y-4">
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
                                <div className="p-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No Alerts</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden hover:shadow-indigo-900/40 transition-shadow duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-indigo-300 relative z-10">Quick Clinical Entry</h3>
                        <div className="space-y-4 relative z-10">
                            <QuickLink to="/add-assessment" icon="fas fa-plus" label="New Assessment" />
                            <QuickLink to="/patients" icon="fas fa-search" label="Search Patients" />
                            <QuickLink to="/tasks" icon="fas fa-history" label="Activity History" />
                        </div>
                        <i className="fas fa-notes-medical absolute -right-6 -bottom-6 text-9xl text-white/5 -rotate-12"></i>
                    </div>
                </div>
            </div>

            <TaskUpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                task={selectedTask}
                onSubmit={handleUpdateSubmit}
            />
        </div>
    );
};

const QuickLink = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
    <Link to={to} className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group shadow-inner">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300 group-hover:text-white transition-colors">
            <i className={icon}></i>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </Link>
);
