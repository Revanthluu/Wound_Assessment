import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardHeader: React.FC<{
    title: string;
    subtitle: string;
    icon: string;
    currentUser: any;
    colorClass?: string;
}> = ({ title, subtitle, icon, currentUser, colorClass = 'bg-blue-600' }) => (
    <div className={`${colorClass} rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative mb-8`}>
        <div className="relative z-10">
            <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Hospital Command Center</p>
            <h2 className="text-4xl font-black mb-2 tracking-tight flex items-center gap-4">
                <i className={icon}></i>
                {title}
            </h2>
            <p className="text-white/80 font-bold text-sm">{subtitle}</p>
        </div>
        <div className="flex gap-4 relative z-10 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Session Protocol</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{currentUser?.role}</h4>
                </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Access Trace</p>
                <h4 className="text-xs font-black">{currentUser?.email}</h4>
            </div>
        </div>
        <i className={`${icon} absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12`}></i>
    </div>
);

export const FidelityHeader: React.FC<{
    greeting: string;
    date: string;
    summary: string;
    onGenerateReport?: () => void;
    onAssignTask?: () => void;
}> = ({ greeting, date, summary, onGenerateReport, onAssignTask }) => (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">{date}</p>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">{greeting}</h1>
                <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-[10px]">
                        <i className="fas fa-check"></i>
                    </div>
                    <p className="text-sm font-bold">{summary}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onGenerateReport}
                    className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                    <i className="far fa-file-alt"></i>
                    Generate Report
                </button>
                <button
                    onClick={onAssignTask}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest"
                >
                    <i className="fas fa-user-plus"></i>
                    Assign Task to Nurse
                </button>
            </div>
        </div>
    </div>
);

export const FidelityStatCard: React.FC<{
    label: string;
    value: string | number;
    icon: string;
    trend: string;
    subtitle: string;
    color: 'blue' | 'red' | 'emerald' | 'purple';
}> = ({ label, value, icon, trend, subtitle, color }) => {
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', trend: 'text-emerald-500' },
        red: { bg: 'bg-red-50', text: 'text-red-600', trend: 'text-red-500' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', trend: 'text-emerald-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', trend: 'text-emerald-500' }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
            <div className="absolute top-8 right-8 flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                <i className={`fas fa-caret-up text-[10px] ${colors[color].trend}`}></i>
                <span className={`text-[10px] font-black ${colors[color].trend}`}>{trend}</span>
            </div>
            <div className={`w-12 h-12 ${colors[color].bg} ${colors[color].text} rounded-2xl flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform`}>
                <i className={icon}></i>
            </div>
            <h3 className="text-4xl font-black text-slate-800 mb-1">{value}</h3>
            <p className="text-sm font-black text-slate-800 mb-1">{label}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
        </div>
    );
};

export const PriorityAttention: React.FC<{ count: number; patients: any[] }> = ({ count, patients }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Priority Attention</h3>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100">
                {count} Active
            </span>
        </div>
        <div className="space-y-4">
            {patients.map((p, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-black text-slate-800 text-base">{p.name}</h4>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full uppercase tracking-widest">High Risk</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                        {p.reason}
                    </p>
                    <Link to={`/patients/${p.id}`} className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                        Review Case <i className="fas fa-chevron-right"></i>
                    </Link>
                </div>
            ))}
        </div>
    </div>
);

export const ScheduledTaskRow: React.FC<{ time: string; title: string; subtitle: string; onClick?: () => void }> = ({ time, title, subtitle, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-6 p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${onClick ? 'cursor-pointer' : ''}`}
    >
        <span className="text-sm font-black text-slate-400">{time}</span>
        <div>
            <h4 className="text-sm font-black text-slate-800 mb-0.5">{title}</h4>
            <p className="text-xs font-bold text-slate-400">{subtitle}</p>
        </div>
    </div>
);

export const WoundDistribution: React.FC<{ data: { type: string; percentage: number; color: string }[]; onViewAnalytics?: () => void }> = ({ data, onViewAnalytics }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mt-8">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-8">Wound Types Distribution</h3>
        <div className="space-y-6">
            {data.map((item, i) => (
                <div key={i}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black text-slate-600">{item.type}</span>
                        <span className="text-xs font-black text-slate-800">{item.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${item.percentage}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
        <button
            onClick={onViewAnalytics}
            className="w-full mt-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
        >
            View Full Analytics
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
                        <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 sticky bottom-0">
                            Deploy Assignment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
