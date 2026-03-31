import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../services/db';
import { User, Assessment, Patient } from '../../types';
import { DashboardHeader, ClinicalStat, SectionHeader } from './SharedDashboardComponents';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';

export const PatientDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
    const [consultMessage, setConsultMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const journeyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const found = await db.getPatientByUserId(parseInt(user.id));

                if (found) {
                    setPatient(found);
                    const aData = await db.getAssessmentsByPatient(found.id);
                    setAssessments(aData);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        
    }, [user.id]);

    useSocket({
        'ASSESSMENT_CREATED': (data: any) => {
            if (patient && data.patient_id === patient.id) {
                // Refresh data
                db.getAssessmentsByPatient(patient.id).then(aData => setAssessments(aData));
            }
        },
        'PATIENT_STATUS_UPDATED': (data: any) => {
            if (patient && data.id === patient.id) {
                setPatient(prev => prev ? { ...prev, status: data.status } : null);
            }
        }
    });

    const handleContactCare = () => {
        alert("Connecting to clinical command center... A care coordinator will be with you shortly.");
    };

    const handleAction = (label: string) => {
        if (label === "Download Records") {
            navigate('/reports');
        } else if (label === "Secure Messaging") {
            alert("Secure Messaging Protocol Initializing... You will be notified when the channel is established.");
        } else if (label === "Request Consultation") {
            setIsConsultModalOpen(true);
        }
    };

    const handleConsultSubmit = async () => {
        if (!consultMessage.trim() || !patient) return;
        setIsSubmitting(true);
        try {
            const success = await db.createTask({
                doctor_id: patient.doctor_id || 1, // Fallback to safe index
                nurse_id: 1, // Assigned default station
                patient_id: patient.id,
                title: "Patient Request: Consultation",
                description: consultMessage,
                due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours priority
            });
            if (success) {
                setIsConsultModalOpen(false);
                setConsultMessage('');
                alert("Consultation request transmitted successfully.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Accessing Secure Health Records...</div>;

    if (!patient) return (
        <div className="bg-white p-20 rounded-[4rem] border border-slate-200 text-center shadow-2xl max-w-2xl mx-auto my-20">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-lg ring-8 ring-blue-50/50">
                <i className="fas fa-user-shield"></i>
            </div>
            <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Protocol Sync Pending</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">Your clinical biometric data is currently being encrypted and synchronized with your medical file. Please contact your physician for immediate activation.</p>
            <button
                onClick={handleContactCare}
                className="px-10 py-4 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
            >
                Contact Care Team
            </button>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <DashboardHeader
                title={`Hello, ${patient.firstName}`}
                subtitle="Personalized Healing Protocol & Recovery Trace"
                icon="fas fa-heart"
                currentUser={user}
                colorClass="bg-emerald-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ClinicalStat label="Recovery Status" value={patient.status || 'Active'} icon="fas fa-shield-heart" color="emerald" trend="OPTIMAL" />
                <ClinicalStat label="Clinical ID" value={patient.mrn} icon="fas fa-fingerprint" color="indigo" subtitle="Secure Medical Key" />
                <ClinicalStat
                    label="Data Snapshots"
                    value={assessments.length}
                    icon="fas fa-camera-retro"
                    color="blue"
                    subtitle="Imaging History"
                    onClick={() => journeyRef.current?.scrollIntoView({ behavior: 'smooth' })}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                <div ref={journeyRef} className="bg-white/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/40 shadow-blue-900/5 relative scroll-mt-10 group hover:shadow-2xl transition-all duration-500">
                    <SectionHeader title="Your Healing Journey" icon="fas fa-route" colorClass="bg-emerald-500/10 text-emerald-600 shadow-inner" />

                    {assessments.length === 0 ? (
                        <div className="p-20 text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Initialization of longitudinal data pending first clinical assessment.</p>
                        </div>
                    ) : (
                        <div className="space-y-10 relative mt-12 pb-6">
                            <div className="absolute left-[23px] top-6 bottom-6 w-1 bg-slate-50"></div>
                            {assessments.map((a, idx) => (
                                <div key={a.id} className="relative pl-16 group">
                                    <div className="absolute left-0 top-1 w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-400 z-10 transition-all group-hover:border-emerald-500 group-hover:text-emerald-600 shadow-sm group-hover:scale-110">
                                        {a.granulation_pct}%
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-black text-slate-800">{new Date(a.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                                            {idx === 0 && <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">latest update</span>}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Location: {a.wound_location}</p>
                                        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-sm group-hover:bg-white/90 group-hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                            <p className="text-xs text-slate-600 italic leading-relaxed mb-6 relative z-10">"{a.notes}"</p>

                                            {a.doctor_suggestion && (
                                                <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <i className="fas fa-stethoscope text-emerald-500 text-xs"></i>
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Physician Directive</span>
                                                    </div>
                                                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{a.doctor_suggestion}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-10">
                    <div className="bg-white/70 backdrop-blur-2xl p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] border border-white/40 shadow-blue-900/5 hover:shadow-2xl transition-all duration-500">
                        <SectionHeader title="Your Care Team" icon="fas fa-user-group" colorClass="bg-indigo-500/10 text-indigo-600 shadow-inner" />
                        <div className="space-y-4">
                            <div
                                onClick={handleContactCare}
                                className="flex items-center gap-5 p-5 bg-slate-50 rounded-[2rem] border border-slate-50 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                            >
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                    <i className="fas fa-user-doctor text-xl"></i>
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm">Primary Wound Specialist</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Board Certified Clinical Team</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group hover:shadow-emerald-900/40 transition-shadow duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl -mr-16 -mt-16 opacity-20"></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-white/40">Secure Patient Portal</h3>
                        <div className="space-y-4">
                            <PatientAction
                                icon="fas fa-file-medical"
                                label="Download Records"
                                onClick={() => handleAction("Download Records")}
                            />
                            <PatientAction
                                icon="fas fa-comment-medical"
                                label="Secure Messaging"
                                onClick={() => handleAction("Secure Messaging")}
                            />
                            <PatientAction
                                icon="fas fa-calendar-check"
                                label="Request Consultation"
                                onClick={() => handleAction("Request Consultation")}
                            />
                        </div>
                        <i className="fas fa-shield-heart absolute -right-6 -bottom-6 text-9xl text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700"></i>
                    </div>
                </div>
            </div>
            {isConsultModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-300">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Request Consultation</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Clinical Care Request</p>
                        </div>
                        <textarea 
                            value={consultMessage} 
                            onChange={e => setConsultMessage(e.target.value)} 
                            placeholder="Describe your concern for the care team..." 
                            className="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium resize-none shadow-inner"
                        />
                        <div className="flex gap-4">
                            <button onClick={() => setIsConsultModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                            <button 
                                onClick={handleConsultSubmit} 
                                disabled={isSubmitting || !consultMessage.trim()}
                                className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <i className="fas fa-spinner animate-spin"></i> : 'Transmit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PatientAction = ({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) => (
    <div
        onClick={onClick}
        className="flex items-center gap-4 p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group/item shadow-inner relative overflow-hidden"
    >
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-300 group-hover/item:text-white transition-colors">
            <i className={icon}></i>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
);
