
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Assessment, Patient } from '../types';

const AssessmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [visitNumber, setVisitNumber] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const userJson = sessionStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;

                const assessData = await db.getAssessmentById(id);
                if (assessData) {
                    if (user?.role === 'PATIENT') {
                        const myPatient = await db.getPatientByUserId(parseInt(user.id));
                        if (!myPatient || myPatient.id !== assessData.patient_id) {
                            navigate('/dashboard');
                            return;
                        }
                    }

                    setAssessment(assessData);
                    const [patientData, allVisits] = await Promise.all([
                        db.getPatientById(assessData.patient_id),
                        db.getAssessmentsByPatient(assessData.patient_id)
                    ]);
                    setPatient(patientData);

                    // Calculate visit number (Visits are sorted DESC in getAssessmentsByPatient)
                    const index = allVisits.findIndex(v => v.id === id);
                    if (index !== -1) {
                        setVisitNumber(allVisits.length - index);
                    }
                }
            } catch (err) {
                console.error("Failed to load assessment detail", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <Layout title="Visit Details">
                <div className="p-20 text-center text-slate-400">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold">Retrieving clinical records...</p>
                </div>
            </Layout>
        );
    }

    if (!assessment || !patient) {
        return (
            <Layout title="Visit Details">
                <div className="p-20 text-center">
                    <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4 block"></i>
                    <p className="text-slate-800 font-bold text-xl">Assessment Not Found</p>
                    <p className="text-slate-500 mb-8">The record you are looking for does not exist or has been moved.</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Go Back</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Visit Details">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                    <i className="fas fa-arrow-left text-sm"></i>
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Visit Summary {visitNumber && <span className="text-blue-600">#{visitNumber}</span>}</h1>
                    <p className="text-slate-500 font-bold tracking-wider uppercase text-xs bg-slate-100 inline-block px-2.5 py-1 rounded-md mt-2">
                        RECORD ID: {assessment.id.toUpperCase()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Side - Patient Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Patient Context</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800">{patient.firstName} {patient.lastName}</h2>
                                <p className="text-sm font-bold text-slate-400">MRN: {patient.mrn}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400">Ward / Room</span>
                                <span className="text-xs font-extrabold text-slate-700">{patient.ward} - {patient.room}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-xs font-bold text-slate-400">Admission</span>
                                <span className="text-xs font-extrabold text-slate-700">{new Date(patient.admissionDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <Link to={`/patients/${patient.id}`} className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all">
                            <i className="far fa-user text-[10px]"></i>
                            Full Patient Profile
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 -mr-8 -mt-8 rounded-full"></div>
                        <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <i className="fas fa-robot"></i>
                            AI Observation
                        </h3>
                        {assessment.doctor_suggestion ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                        "{assessment.doctor_suggestion}"
                                    </p>
                                </div>
                                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-tight">
                                    Generated on {new Date(assessment.date).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic">No AI suggestion available for this record.</p>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 shadow-sm">
                                    <i className="far fa-calendar-alt"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assessment Date</p>
                                    <p className="text-sm font-extrabold text-slate-800">
                                        {new Date(assessment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${assessment.status === 'Healing' ? 'bg-green-100 text-green-700' :
                                assessment.status === 'Deteriorating' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {assessment.status}
                            </span>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-50 pb-2">Visual Documentation</h3>
                                    {assessment.image_data ? (() => {
                                        let meta = { marker: null, zoom: 1, rotation: 0 };
                                        try {
                                            const parsed = JSON.parse(assessment.marker_data || '{}');
                                            if (parsed.marker !== undefined || parsed.rotation !== undefined) {
                                                meta = { ...meta, ...parsed };
                                            } else if (parsed.x !== undefined) {
                                                meta.marker = parsed;
                                            }
                                        } catch (e) { }

                                        return (
                                            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative aspect-video flex items-center justify-center">
                                                <div
                                                    style={{
                                                        transform: `scale(${meta.zoom}) rotate(${meta.rotation}deg)`,
                                                        transition: 'transform 0.3s ease-in-out'
                                                    }}
                                                    className="w-full h-full flex items-center justify-center relative"
                                                >
                                                    <img src={assessment.image_data} alt="Wound" className="max-w-full max-h-full object-contain" />
                                                    {meta.marker && (
                                                        <div
                                                            className="absolute w-4 h-4 border-2 border-white bg-red-500 rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-10"
                                                            style={{ left: `${(meta.marker as any).x}%`, top: `${(meta.marker as any).y}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                {(meta.rotation !== 0 || meta.zoom !== 1) && (
                                                    <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 text-white text-xs font-bold rounded-md uppercase tracking-tight backdrop-blur-sm">
                                                        Saved View: {meta.rotation}° / {meta.zoom}x
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })() : (
                                        <div className="aspect-video bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-300 border border-slate-100">
                                            <i className="fas fa-image text-3xl mb-2"></i>
                                            <p className="text-[10px] font-bold uppercase">No Imagery Saved</p>
                                        </div>
                                    )}
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 border-b border-slate-50 pb-2">Metrics & Parameters</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <MetricCard label="Wound Type" value={assessment.wound_type} icon="fas fa-tag" />
                                        <MetricCard label="Location" value={assessment.wound_location} icon="fas fa-map-marker-alt" />
                                        <MetricCard label="Clinical Stage" value={assessment.wound_stage} icon="fas fa-layer-group" />
                                        <MetricCard label="Pain Level" value={`${assessment.pain_level}/10`} icon="fas fa-percentage" color="text-red-500" />
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Wound Dimensions</h4>
                                        <div className="flex items-center justify-between">
                                            <div className="text-center px-4">
                                                <p className="text-2xl font-extrabold text-slate-800">{assessment.length_cm}<span className="text-xs ml-1 text-slate-400 font-bold">cm</span></p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Length</p>
                                            </div>
                                            <div className="h-8 w-px bg-slate-200"></div>
                                            <div className="text-center px-4">
                                                <p className="text-2xl font-extrabold text-slate-800">{assessment.width_cm}<span className="text-xs ml-1 text-slate-400 font-bold">cm</span></p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Width</p>
                                            </div>
                                            <div className="h-8 w-px bg-slate-200"></div>
                                            <div className="text-center px-4">
                                                <p className="text-2xl font-extrabold text-slate-800">{assessment.depth_cm}<span className="text-xs ml-1 text-slate-400 font-bold">cm</span></p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Depth</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-green-50/50 rounded-2xl border border-green-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Granulation Base</span>
                                            <span className="text-xl font-extrabold text-green-700">{assessment.granulation_pct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${assessment.granulation_pct}%` }}></div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-50">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Observation Notes</h3>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                        {assessment.notes || "No clinical notes attached to this visit record."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const MetricCard = ({ label, value, icon, color = 'text-blue-500' }: any) => (
    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${color} shadow-sm text-xs`}>
            <i className={icon}></i>
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-0.5">{label}</p>
            <p className="text-xs font-extrabold text-slate-800">{value}</p>
        </div>
    </div>
);

export default AssessmentDetail;
