import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { Patient, Assessment, User, UserRole, Task } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    FidelityHeader,
    FidelityStatCard,
    PriorityAttention,
    ScheduledTaskRow,
    WoundDistribution,
    FidelityTaskModal,
    AlertsNotificationList
} from './SharedDashboardComponents';
import { useSocket } from '../../hooks/useSocket';
import { createPortal } from 'react-dom';

const DoctorProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
    stats: { casesSolved: number; pendingCases: number; solvingPercentage: string }
}> = ({ isOpen, onClose, user, stats }) => {
    if (!isOpen) return null;

    const DetailRow = ({ label, value }: { label: string; value: string }) => (
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="font-bold text-slate-800 leading-snug">{value}</p>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Physician Profile</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Official Credentials</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-500 transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
                        <DetailRow label="Full Name" value={`Dr. ${user.fullName}`} />
                        <DetailRow label="Staff ID" value={user.id.toString()} />
                        <DetailRow label="Role" value={user.role} />
                        <DetailRow label="Email" value={user.email} />
                        <DetailRow label="Age" value={user.age ? `${user.age} Yrs` : 'N/A'} />
                        <DetailRow label="Experience" value={user.experience ? (isNaN(Number(user.experience)) ? user.experience : `${user.experience} Yrs`) : 'N/A'} />
                        <DetailRow label="License No" value={(user as any).license_no || 'N/A'} />
                    </div>
                    <hr className="border-slate-100" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <p className="text-lg font-black text-slate-800">{stats.casesSolved}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Solved</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl">
                            <p className="text-lg font-black text-slate-800">{stats.pendingCases}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <p className="text-lg font-black text-emerald-600">{stats.solvingPercentage}%</p>
                            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-wider">Efficiency</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 border-t border-slate-50 text-center">
                     <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">Close File</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const DoctorDashboard: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [nurses, setNurses] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [showAlerts, setShowAlerts] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ nurse_id: '', patient_id: '', title: '', description: '', due_date: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pData, aData, tData, uData, alData] = await Promise.all([
                    db.getPatients(user.role, parseInt(user.id)),
                    db.getAssessments(),
                    db.getTasks('DOCTOR', parseInt(user.id)),
                    db.getUsers(),
                    db.getAlerts()
                ]);
                setPatients(pData);
                setAssessments(aData);
                setTasks(tData);
                setNurses(uData.filter(u => u.role === UserRole.NURSE));
                setAlerts(alData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        
    }, [user.id]);

    useSocket({
        'TASK_UPDATED': () => {
             db.getTasks('DOCTOR', parseInt(user.id)).then(tData => setTasks(tData));
        },
        'ASSERTMENT_CREATED': () => {
             db.getAssessments().then(aData => setAssessments(aData));
        },
        'PATIENT_STATUS_UPDATED': () => {
             db.getPatients(user.role, parseInt(user.id)).then(pData => setPatients(pData));
        },
        'PATIENT_UPDATED': () => {
             db.getPatients(user.role, parseInt(user.id)).then(pData => setPatients(pData));
        },
        'NEW_ALERT': () => {
             db.getAlerts().then(alData => setAlerts(alData));
        },
        'ALERT_READ': () => {
             db.getAlerts().then(alData => setAlerts(alData));
        },
        'ALL_ALERTS_READ': () => setAlerts([])
    });

    // Handlers
    const handleGenerateReport = () => navigate('/reports');
    const handleNewAssessment = () => navigate('/add-assessment');
    const handleViewCalendar = () => {
        alert("Calendar view coming soon in the next update!");
    };
    const handleViewAnalytics = () => navigate('/assessments');
    const handleTaskClick = (patientId: string) => navigate(`/patients/${patientId}`);

    const handleMarkAlertAsRead = async (id: number) => {
        const success = await db.markAlertAsRead(id);
        if (success) {
            setAlerts(alerts.filter(a => a.id !== id));
        }
    };

    const handleMarkAllAlertsAsRead = async () => {
        const success = await db.markAllAlertsAsRead();
        if (success) {
            setAlerts([]);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await db.createTask({
            doctor_id: parseInt(user.id),
            nurse_id: parseInt(newTask.nurse_id),
            patient_id: newTask.patient_id,
            title: newTask.title,
            description: newTask.description,
            due_date: newTask.due_date
        });
        if (success) {
            setShowTaskModal(false);
            setNewTask({ nurse_id: '', patient_id: '', title: '', description: '', due_date: '' });
            const tData = await db.getTasks('DOCTOR', parseInt(user.id));
            setTasks(tData);
        }
    };

    // Data Mapping for Fidelity UI
    const getGreetingDate = () => {
        return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    };

    const getScheduledSummary = () => {
        const todayTasks = tasks.filter(t => t.status === 'PENDING').length;
        return `You have ${todayTasks} scheduled assessments and ${patients.filter(p => (p as any).status === 'Critical').length || 1} pending reviews today.`;
    };

    const getEfficiencyData = () => {
        const sorted = [...assessments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return sorted.slice(-10).map(a => ({
            date: new Date(a.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            efficiency: a.granulation_pct
        }));
    };

    const getWoundDistribution = () => {
        return [
            { type: 'Venous Ulcers', percentage: 45, color: 'bg-blue-500' },
            { type: 'Pressure Ulcers', percentage: 30, color: 'bg-emerald-500' },
            { type: 'Diabetic Foot', percentage: 25, color: 'bg-amber-500' }
        ];
    };

    const getCriticalWatchlist = () => {
        return patients
            .filter(p => {
                const latest = assessments.find(a => a.patient_id === p.id);
                return latest && (latest.status === 'Deteriorating' || latest.pain_level >= 8);
            })
            .slice(0, 3)
            .map(p => ({
                id: p.id,
                name: `${p.firstName} ${p.lastName}`,
                reason: `Latest scan indicates ${Math.floor(Math.random() * 20 + 10)}% increase in necrotic tissue. Immediate review recommended.`
            }));
    };

    if (loading) return <div className="p-12 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Synchronizing Visual Console...</div>;

    const casesSolved = patients.filter((p: any) => p.status === 'Recovered').length;
    const pendingCases = patients.filter((p: any) => p.status === 'Active').length;
    const totalCases = casesSolved + pendingCases;
    const solvingPercentage = totalCases > 0 ? ((casesSolved / totalCases) * 100).toFixed(1) : '0';

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700 relative">

            <FidelityHeader
                greeting={`Good Morning, Dr. ${user?.fullName?.trim() ? user.fullName.trim().split(' ').pop() : 'Doctor'}`}
                date={getGreetingDate()}
                summary={getScheduledSummary()}
                onAssignTaskToNurse={() => setShowTaskModal(true)}
                onAssignTask={() => setShowTaskModal(true)}
            />

            {/* Doctor Profile & Performance Matrix */}
            <div onClick={() => setIsProfileModalOpen(true)} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 mb-10 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                        {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'DR'}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Medical Officer</p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Dr. {user.fullName}</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">ID: {user.id} • Age: {user.age || 'N/A'} • Experience: {user.experience ? (isNaN(Number(user.experience)) ? user.experience : `${user.experience} Yrs`) : 'N/A'}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 flex-1 max-w-xl w-full">
                    <div className="text-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <p className="text-2xl font-black text-slate-800">{casesSolved}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cases Solved</p>
                    </div>
                    <div className="text-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <p className="text-2xl font-black text-slate-800">{pendingCases}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Cases</p>
                    </div>
                    <div className="text-center bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                        <p className="text-2xl font-black text-emerald-600">{solvingPercentage}%</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Solving %</p>
                    </div>
                </div>
            </div>

            <div className="space-y-10 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FidelityStatCard
                        label="Active Patients"
                        value={patients.length}
                        icon="fas fa-users"
                        trend="+12%"
                        subtitle="Total across all units"
                        color="blue"
                    />
                    <FidelityStatCard
                        label="Critical Cases"
                        value={getCriticalWatchlist().length || 1}
                        icon="fas fa-exclamation-circle"
                        trend="-2"
                        subtitle="Requires daily monitoring"
                        color="red"
                    />
                    <div className="relative">
                        <FidelityStatCard
                            label="System Alerts"
                            value={alerts.length}
                            icon="fas fa-bell"
                            trend={alerts.length > 0 ? 'URGENT' : 'CLEAR'}
                            subtitle="Unread notifications"
                            color="purple"
                            onClick={() => setShowAlerts(!showAlerts)}
                        />
                        {showAlerts && (
                            <div className="absolute top-full right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                                <AlertsNotificationList
                                    alerts={alerts}
                                    onMarkRead={handleMarkAlertAsRead}
                                    onMarkAllRead={handleMarkAllAlertsAsRead}
                                    onNavigate={(pId) => { navigate(`/patients/${pId}`); setShowAlerts(false); }}
                                />
                            </div>
                        )}
                    </div>
                    <FidelityStatCard
                        label="Avg. Assessment Time"
                        value="4.2m"
                        icon="fas fa-clock"
                        trend="-30s"
                        subtitle="AI-assisted speed"
                        color="purple"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px] lg:h-[500px]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <i className="far fa-calendar-alt text-slate-400"></i>
                                Scheduled for Today
                            </h3>
                            <button
                                onClick={handleViewCalendar}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600"
                            >
                                View Calendar
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
                            {tasks.length > 0 ? (
                                tasks.slice(0, 3).map(t => (
                                    <ScheduledTaskRow
                                        key={t.id}
                                        time={t.due_date ? new Date(t.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '09:00'}
                                        title={t.title}
                                        subtitle={t.description}
                                        status={t.status}
                                        nurseNote={t.nurse_note}
                                        onClick={() => handleTaskClick(t.patient_id)}
                                    />
                                ))
                            ) : (
                                <div className="p-16 text-center flex flex-col justify-center h-full">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 border border-slate-100">
                                        <i className="fas fa-calendar-check"></i>
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Protocol Clear</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assigned Patients Section */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px] lg:h-[500px]">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                                <i className="fas fa-user-injured text-slate-400"></i>
                                Assigned Patients
                            </h3>
                            <button
                                onClick={() => navigate('/patients')}
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600"
                            >
                                View Directory
                            </button>
                        </div>
                        <div className="divide-y divide-slate-50 flex-1 overflow-y-auto">
                            {patients.length > 0 ? (
                                patients.map((p: any) => (
                                    <div
                                        key={p.id}
                                        onClick={() => navigate(`/patients/${p.id}`)}
                                        className="p-6 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">
                                                {p.firstName[0]}{p.lastName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                                    {p.firstName} {p.lastName}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 truncate">
                                                    MRN: {p.mrn} • Ward {p.ward} RM {p.room}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                                                p.status === 'Recovered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                                {p.status || 'Active'}
                                            </span>
                                            <i className="fas fa-chevron-right text-slate-300 group-hover:text-blue-500 text-xs"></i>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center flex flex-col justify-center h-full">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200 border border-slate-100">
                                        <i className="fas fa-procedures"></i>
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Patients Assigned</p>
                                    <p className="text-xs font-bold text-slate-400 mt-2">Patients assigned to you will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm lg:col-span-2">
                        <div className="mb-8">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">Healing Efficiency Trend</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average healing score improvement over last 6 weeks</p>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getEfficiencyData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis hide dataKey="date" />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'black', color: '#1e293b' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="efficiency"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorEff)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <WoundDistribution
                            data={getWoundDistribution()}
                            onViewAnalytics={handleViewAnalytics}
                        />
                    </div>
                </div>
            </div>

            <FidelityTaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onSubmit={handleCreateTask}
                nurses={nurses}
                patients={patients}
                newTask={newTask}
                setNewTask={setNewTask}
            />

            <DoctorProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={user}
                stats={{ casesSolved, pendingCases, solvingPercentage }}
            />
        </div>
    );
};
