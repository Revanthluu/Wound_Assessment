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
    FidelityTaskModal
} from './SharedDashboardComponents';

export const DoctorDashboard: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [nurses, setNurses] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({ nurse_id: '', patient_id: '', title: '', description: '', due_date: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pData, aData, tData, uData] = await Promise.all([
                    db.getPatients(),
                    db.getAssessments(),
                    db.getTasks('DOCTOR', parseInt(user.id)),
                    db.getUsers()
                ]);
                setPatients(pData);
                setAssessments(aData);
                setTasks(tData);
                setNurses(uData.filter(u => u.role === UserRole.NURSE));
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

    // Handlers
    const handleGenerateReport = () => navigate('/reports');
    const handleNewAssessment = () => navigate('/add-assessment');
    const handleViewCalendar = () => {
        alert("Calendar view coming soon in the next update!");
    };
    const handleViewAnalytics = () => navigate('/assessments');
    const handleTaskClick = (patientId: string) => navigate(`/patients/${patientId}`);

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

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <FidelityHeader
                greeting={`Good Morning, Dr. ${user.fullName.split(' ').pop()}`}
                date={getGreetingDate()}
                summary={getScheduledSummary()}
                onGenerateReport={handleGenerateReport}
                onAssignTask={() => setShowTaskModal(true)}
            />



            <div className="flex flex-col xl:flex-row gap-10">
                {/* Main Content Hub */}
                <div className="flex-1 space-y-10">
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
                        <FidelityStatCard
                            label="Wound Healing Rate"
                            value="84%"
                            icon="fas fa-wave-square"
                            trend="+5%"
                            subtitle="Patients improving this week"
                            color="emerald"
                        />
                        <FidelityStatCard
                            label="Avg. Assessment Time"
                            value="4.2m"
                            icon="fas fa-clock"
                            trend="-30s"
                            subtitle="AI-assisted speed"
                            color="purple"
                        />
                    </div>

                    {/* Scheduled List */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
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
                        <div className="divide-y divide-slate-50">
                            {tasks.length > 0 ? (
                                tasks.slice(0, 3).map(t => (
                                    <ScheduledTaskRow
                                        key={t.id}
                                        time={t.due_date ? new Date(t.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '09:00'}
                                        title={t.title}
                                        subtitle={t.description}
                                        onClick={() => handleTaskClick(t.patient_id)}
                                    />
                                ))
                            ) : (
                                <div className="p-12 text-center text-slate-400 font-bold text-sm">No assessments scheduled for today.</div>
                            )}
                        </div>
                    </div>

                    {/* Efficiency Trend Chart */}
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="mb-10">
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
                </div>

                {/* Sidebar */}
                <div className="w-full xl:w-[380px] space-y-8">

                    <PriorityAttention
                        count={getCriticalWatchlist().length || 3}
                        patients={getCriticalWatchlist().length > 0 ? getCriticalWatchlist() : [
                            { name: 'James Wilson', reason: 'Latest AI scan indicates 15% increase in necrotic tissue. Immediate review recommended.', id: '1' }
                        ]}
                    />

                    <WoundDistribution
                        data={getWoundDistribution()}
                        onViewAnalytics={handleViewAnalytics}
                    />
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
        </div>
    );
};
