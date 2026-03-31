import React from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';

export const DashboardHeader: React.FC<{
    title: string;
    subtitle: string;
    icon: string;
    currentUser: any;
    colorClass?: string;
}> = ({ title, subtitle, icon, currentUser, colorClass = 'bg-slate-900' }) => (
    <div className={`${colorClass} rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative mb-10 border border-white/5`}>
        <div className="relative z-10">
            <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] mb-3">Clinical Command Intelligence</p>
            <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tight flex items-center gap-5">
                <i className={`${icon} text-blue-500`}></i>
                {title}
            </h2>
            <p className="text-white/60 font-bold text-base max-w-xl leading-relaxed">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10 shrink-0">
            <div className="bg-white/5 backdrop-blur-xl px-7 py-5 rounded-[2rem] border border-white/10 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Protocol Status</p>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <h4 className="text-sm font-black uppercase tracking-[0.1em]">{currentUser?.role}</h4>
                </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl px-7 py-5 rounded-[2rem] border border-white/10 shadow-inner">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Authenticated Entity</p>
                <h4 className="text-xs font-black tracking-tight">{currentUser?.email}</h4>
            </div>
        </div>
        <i className={`${icon} absolute -right-8 -bottom-8 text-[12rem] text-white/5 rotate-12 blur-sm pointer-events-none`}></i>
    </div>
);

export const FidelityHeader: React.FC<{
    greeting: string;
    date: string;
    summary: string;
    onAssignTaskToNurse?: () => void;
    onAssignTask?: () => void;
}> = ({ greeting, date, summary, onAssignTaskToNurse, onAssignTask }) => (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">{date}</p>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">{greeting}</h1>
                <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-[10px]">
                        <i className="fas fa-check"></i>
                    </div>
                    <p className="text-sm font-bold">{summary}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                    onClick={onAssignTaskToNurse}
                    className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                    <i className="fas fa-tasks"></i>
                    Assign Task To Nurse
                </button>
                <button
                    onClick={onAssignTask}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest"
                >
                    <i className="fas fa-user-plus"></i>
                    Add New Assignment
                </button>
            </div>
        </div>
    </div>
);

export const TaskUpdateModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (status: 'PENDING' | 'COMPLETED', note: string) => void;
    task: any;
}> = ({ isOpen, onClose, onSubmit, task }) => {
    const [status, setStatus] = React.useState<'PENDING' | 'COMPLETED'>(task?.status || 'PENDING');
    const [note, setNote] = React.useState(task?.nurse_note || '');

    React.useEffect(() => {
        if (task) {
            setStatus(task.status);
            setNote(task.nurse_note || '');
        }
    }, [task]);

    if (!isOpen || !task) return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100/50 flex flex-col max-h-[95vh] lg:max-h-[90vh]">
                <div className="p-6 lg:p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Update Care Protocol</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Clinical Progress Report</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="p-8 lg:p-10 space-y-8 overflow-y-auto max-h-full scrollbar-hide">
                    <div className="p-7 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Target Protocol</h4>
                        <p className="text-base font-black text-slate-800 mb-1 tracking-tight">{task.title}</p>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{task.description}</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Execution Status</label>
                        <div className="grid grid-cols-2 gap-5">
                            <button
                                type="button"
                                onClick={() => setStatus('PENDING')}
                                className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all duration-300 ${status === 'PENDING' ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-lg shadow-amber-100/50' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <i className="fas fa-clock mr-2 opacity-50"></i> Pending Review
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('COMPLETED')}
                                className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all duration-300 ${status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-lg shadow-emerald-100/50' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <i className="fas fa-check-circle mr-2 opacity-50"></i> Finalized
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Clinical Observations</label>
                        <textarea
                            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-bold h-40 focus:ring-8 focus:ring-blue-500/5 transition-all outline-none resize-none placeholder:text-slate-300 leading-relaxed"
                            placeholder="Document any significant changes in wound morphology or patient response..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => onSubmit(status, note)}
                        className="w-full py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                    >
                        <i className="fas fa-cloud-upload-alt text-blue-400"></i>
                        Sync Clinical Update
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const FidelityStatCard: React.FC<{
    label: string;
    value: string | number;
    icon: string;
    trend: string;
    subtitle: string;
    color: 'blue' | 'red' | 'emerald' | 'purple';
    onClick?: () => void;
}> = ({ label, value, icon, trend, subtitle, color, onClick }) => {
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', trend: 'text-emerald-500' },
        red: { bg: 'bg-red-50', text: 'text-red-600', trend: 'text-red-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', trend: 'text-emerald-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', trend: 'text-emerald-500' }
    };

    return (
        <div onClick={onClick} className={`bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}>
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-10 right-10 flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                <i className={`fas fa-caret-up text-[10px] ${colors[color].trend}`}></i>
                <span className={`text-[10px] font-black ${colors[color].trend} tracking-tighter`}>{trend}</span>
            </div>
            <div className={`w-12 h-12 md:w-14 md:h-14 ${colors[color].bg} ${colors[color].text} rounded-[1.25rem] flex items-center justify-center mb-6 md:mb-8 text-xl md:text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm shadow-slate-200`}>
                <i className={icon}></i>
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-slate-800 mb-2 tracking-tighter">{value}</h3>
            <p className="text-sm font-black text-slate-800 mb-1 tracking-tight">{label}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] opacity-80">{subtitle}</p>
        </div>
    );
};

export const PriorityAttention: React.FC<{ count: number; patients: any[] }> = ({ count, patients }) => (
    <div className="bg-white p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-100 shadow-sm h-full overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-[1.25rem] flex items-center justify-center text-lg shadow-inner">
                    <i className="fas fa-shield-virus"></i>
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Active Criticals</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Physical Watchlist</p>
                </div>
            </div>
            <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-rose-100 shadow-sm">
                {count} Cases
            </span>
        </div>
            {patients.map((p, i) => (
                <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative group hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-800 text-sm tracking-tight">{p.name}</h4>
                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest px-2 py-0.5 bg-rose-50 rounded-full border border-rose-100">Urgent</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 opacity-80">
                        {p.reason}
                    </p>
                    <Link to={`/patients/${p.id}`} className="inline-flex py-2 px-4 bg-white border border-slate-200 text-[10px] font-black text-slate-600 rounded-xl uppercase tracking-widest items-center gap-2 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                        View File <i className="fas fa-arrow-right text-[8px]"></i>
                    </Link>
                </div>
            ))}
    </div>
);

export const ScheduledTaskRow: React.FC<{
    time: string;
    title: string;
    subtitle: string;
    status?: 'PENDING' | 'COMPLETED';
    nurseNote?: string;
    onClick?: () => void;
}> = ({ time, title, subtitle, status, nurseNote, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-8 p-8 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="flex flex-col items-center shrink-0 w-20 px-2 py-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
            <span className="text-xs font-black text-slate-800 tracking-tight">{time}</span>
            {status && (
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase mt-2 shadow-sm ${status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'}`}>
                    {status === 'COMPLETED' ? 'Done' : 'Active'}
                </span>
            )}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className={`text-base font-black mb-1 truncate tracking-tight transition-colors ${status === 'COMPLETED' ? 'text-slate-400' : 'text-slate-800'}`}>{title}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-1">{subtitle}</p>
            {nurseNote && (
                <div className="mt-4 p-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl relative">
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-blue-50 border-l border-b border-blue-100/50 rotate-45"></div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                        <i className="fas fa-user-nurse"></i> Nurse Report
                    </p>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed italic">"{nurseNote}"</p>
                </div>
            )}
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 group-hover:shadow-md transition-all">
            <i className="fas fa-chevron-right text-xs"></i>
        </div>
    </div>
);

export const WoundDistribution: React.FC<{ data: { type: string; percentage: number; color: string }[]; onViewAnalytics?: () => void }> = ({ data, onViewAnalytics }) => (
    <div className="bg-white p-8 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-100 shadow-sm h-full flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Wound Morphology</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Demographic Distribution</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-chart-pie"></i>
                </div>
            </div>
            <div className="space-y-6">
                {data.map((item, i) => (
                    <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{item.type}</span>
                            <span className="text-xs font-black text-slate-900">{item.percentage}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                            <div
                                className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <button
            onClick={onViewAnalytics}
            className="w-full mt-10 py-3.5 bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 rounded-2xl uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
        >
            View Detailed Analysis
            <i className="fas fa-chevron-right text-[8px]"></i>
        </button>
    </div>
);

export const SectionHeader: React.FC<{ title: string; icon: string; colorClass?: string }> = ({ title, icon, colorClass = 'bg-slate-100 text-slate-600' }) => (
    <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl ${colorClass} flex items-center justify-center text-sm shadow-sm`}>
            <i className={icon}></i>
        </div>
        {title}
    </h3>
);

// Keep legacy for safety/other dashboards if needed, but we'll phase out
export const ClinicalStat: React.FC<{
    label: string;
    value: string | number;
    icon: string;
    trend?: string;
    subtitle?: string;
    color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
    onClick?: () => void;
}> = ({ label, value, icon, trend, subtitle, color = 'blue', onClick }) => {
    const themes = {
        blue: 'text-blue-600 bg-blue-50/50 border-blue-100 h-full w-full text-left',
        emerald: 'text-emerald-600 bg-emerald-50/50 border-emerald-100 h-full w-full text-left',
        amber: 'text-amber-600 bg-amber-50/50 border-amber-100 h-full w-full text-left',
        rose: 'text-rose-600 bg-rose-50/50 border-rose-100 h-full w-full text-left',
        indigo: 'text-indigo-600 bg-indigo-50/50 border-indigo-100 h-full w-full text-left',
        slate: 'text-slate-600 bg-slate-50/50 border-slate-100 h-full w-full text-left'
    };

    const Content = (
        <div className={`p-6 rounded-[2.5rem] border transition-all group ${onClick ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : ''} ${themes[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${themes[color]}`}>
                    <i className={icon}></i>
                </div>
                {trend && (
                    <span className="text-[10px] font-black px-2.5 py-1 bg-slate-50 text-slate-500 rounded-full uppercase tracking-widest border border-slate-100">
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-1">{value}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
            {subtitle && <p className="text-[9px] text-slate-400 font-bold uppercase opacity-60">{subtitle}</p>}
        </div>
    );

    return onClick ? (
        <button onClick={onClick} className="w-full focus:outline-none">
            {Content}
        </button>
    ) : Content;
};

export const CriticalCard: React.FC<{
    patientName: string;
    reason: string;
    mrn: string;
    id: string;
}> = ({ patientName, reason, mrn, id }) => (
    <Link to={`/patients/${id}`} className="flex items-center gap-4 p-4 bg-rose-50/30 border border-rose-100 rounded-[2rem] hover:bg-rose-50 hover:shadow-sm transition-all group">
        <div className="w-12 h-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center text-rose-500 text-lg font-black shadow-sm group-hover:scale-105 transition-transform">
            {patientName.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-black text-slate-800 truncate">{patientName}</p>
                <span className="text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-full uppercase">Critical</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{mrn}</p>
            <p className="text-[9px] font-black text-rose-600 uppercase tracking-tight">{reason}</p>
        </div>
        <i className="fas fa-chevron-right text-rose-200 group-hover:translate-x-1 transition-transform"></i>
    </Link>
);

export const FidelityTaskModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    nurses: any[];
    patients: any[];
    newTask: any;
    setNewTask: (task: any) => void;
}> = ({ isOpen, onClose, onSubmit, nurses, patients, newTask, setNewTask }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-6 animate-in fade-in duration-500 ease-out">
            <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-90 slide-in-from-bottom-12 duration-500 ease-out border border-slate-100/50 flex flex-col">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 flex-shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Assign Clinical Protocol</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Direct Physician Mandate</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 pt-4 scrollbar-hide">
                    <form onSubmit={onSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Assigned Nurse</label>
                                <select
                                    required
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                                    value={newTask.nurse_id}
                                    onChange={e => setNewTask({ ...newTask, nurse_id: e.target.value })}
                                >
                                    <option value="">Select Practitioner</option>
                                    {nurses.map(n => <option key={n.id} value={n.id}>{n.fullName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Patient File</label>
                                <select
                                    required
                                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none appearance-none"
                                    value={newTask.patient_id}
                                    onChange={e => setNewTask({ ...newTask, patient_id: e.target.value })}
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Task Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Sequential Dressing Change"
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Clinical Instructions</label>
                            <textarea
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold h-32 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none resize-none"
                                placeholder="Specific wound care directives..."
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Execution Deadline</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                value={newTask.due_date}
                                onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95">
                            Add New Assignment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const AlertsNotificationList: React.FC<{
    alerts: any[];
    onMarkRead: (id: number) => void;
    onMarkAllRead: () => void;
    onNavigate?: (patientId: string) => void;
}> = ({ alerts, onMarkRead, onMarkAllRead, onNavigate }) => (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden w-72 max-h-[400px] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-sm tracking-tight uppercase">System Alerts</h3>
            {alerts.length > 0 && (
                <button onClick={onMarkAllRead} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Clear All</button>
            )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-hide">
            {alerts.length === 0 ? (
                <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                        <i className="fas fa-bell-slash"></i>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Clear</p>
                </div>
            ) : (
                alerts.map(alert => (
                    <div
                        key={alert.id}
                        className="p-5 hover:bg-slate-50 transition-colors group relative cursor-pointer"
                        onClick={() => onNavigate && onNavigate(alert.patient_id)}
                    >
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 text-xs">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight mb-1">{alert.message}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkRead(alert.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-blue-500 transition-all"
                            >
                                <i className="fas fa-check-circle"></i>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
);
