
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { db } from '../services/db';
import { Patient, Assessment } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [latestAssessment, setLatestAssessment] = useState<Assessment | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const userJson = sessionStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;

                let data: Patient[] = [];
                if (user?.role === 'NURSE') {
                    data = await db.getPatientsByNurse(parseInt(user.id));
                } else if (user?.role === 'PATIENT') {
                    const myPatient = await db.getPatientByUserId(parseInt(user.id));
                    if (myPatient) {
                        data = [myPatient];
                        setSelectedPatientId(myPatient.id);
                    }
                } else {
                    data = await db.getPatients();
                }
                setPatients(data);
            } catch (err) {
                console.error("Failed to fetch patients", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    useEffect(() => {
        if (selectedPatientId) {
            const fetchAssessment = async () => {
                try {
                    const assessments = await db.getAssessmentsByPatient(selectedPatientId);
                    setLatestAssessment(assessments[0] || null);
                } catch (err) {
                    console.error("Failed to fetch assessments", err);
                }
            };
            fetchAssessment();
        } else {
            setLatestAssessment(null);
        }
    }, [selectedPatientId]);

    const handleDownloadReport = async () => {
        if (!reportRef.current || !latestAssessment) return;

        setIsGenerating(true);
        setExportError(null);

        try {
            // Wait a small beat for any renders to finish
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`MediWound_Report_${selectedPatientId}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error: any) {
            console.error('Failed to generate PDF:', error);
            setExportError(error.message || 'Error generating clinical report PDF.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    return (
        <Layout title="Clinical Reports">
            <div className="space-y-8 animate-in fade-in duration-500 p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Case Reporting Engine</h2>
                        <p className="text-slate-500 font-bold opacity-80 uppercase tracking-widest text-[10px] mt-1">Generate HIPAA-compliant diagnostic files</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        {(!sessionStorage.getItem('user') || JSON.parse(sessionStorage.getItem('user') || '{}').role !== 'PATIENT') && (
                            <select
                                className="bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[200px]"
                                value={selectedPatientId}
                                onChange={(e) => setSelectedPatientId(e.target.value)}
                            >
                                <option value="">Select a patient...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={handleDownloadReport}
                            disabled={!latestAssessment || isGenerating}
                            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${!latestAssessment || isGenerating
                                ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'
                                : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
                                }`}
                        >
                            <i className={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                            {isGenerating ? 'Generating...' : 'Download Medical Report'}
                        </button>
                    </div>
                </div>

                {exportError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-4">
                        <i className="fas fa-exclamation-circle text-lg"></i>
                        <p className="text-sm font-bold">{exportError}</p>
                        <button onClick={() => setExportError(null)} className="ml-auto text-red-400 hover:text-red-600 transition-colors">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="p-20 text-center text-slate-400 font-black tracking-widest text-xs animate-pulse uppercase">
                        Accessing Secure Registry...
                    </div>
                ) : !selectedPatientId ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                            <i className="fas fa-file-medical-alt text-3xl"></i>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">Ready to Archive</h4>
                        <p className="text-sm text-slate-500 font-medium">Please select a clinical case from the dropdown above to generate a medical report.</p>
                    </div>
                ) : !latestAssessment ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                            <i className="fas fa-exclamation-triangle text-3xl"></i>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2">No Assessments Found</h4>
                        <p className="text-sm text-slate-500 font-medium">This patient does not have any clinical assessments. Reports can only be generated for active cases.</p>
                    </div>
                ) : (
                    <div ref={reportRef} className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-10 max-w-4xl mx-auto ring-8 ring-slate-50 mb-10">
                        {/* Report Header */}
                        <div className="flex border-b-4 border-blue-600 pb-8 mb-10 items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 leading-none mb-2 tracking-tight">CLINICAL WOUND REPORT</h1>
                                <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px]">MediWound AI Healthcare Systems</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generated On</p>
                                <p className="text-lg font-black text-slate-800 tracking-tight">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Patient Data */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Medical Profile</h5>
                                <p className="text-xl font-black text-slate-800 tracking-tight">{selectedPatient?.firstName} {selectedPatient?.lastName}</p>
                                <p className="text-sm text-slate-500 font-bold uppercase mt-1">MRN: {selectedPatient?.mrn}</p>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Facility Details</h5>
                                <p className="text-sm font-black text-slate-700">Ward {selectedPatient?.ward}</p>
                                <p className="text-sm text-slate-500 font-bold uppercase">Room {selectedPatient?.room}</p>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Classification</h5>
                                <p className="text-sm font-black text-slate-700">{selectedPatient?.diagnosis || 'Undisclosed'}</p>
                                <p className={`text-xs font-black uppercase inline-block px-2 py-0.5 rounded mt-1 shadow-sm ${selectedPatient?.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{selectedPatient?.status}</p>
                            </div>
                        </div>

                        {/* Assessment Summary */}
                        <div className="bg-slate-50/50 rounded-2xl p-8 border border-slate-100 mb-10">
                            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    <i className="fas fa-stethoscope text-blue-600"></i>
                                    Diagnostic Evaluation
                                </h3>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment ID</p>
                                    <p className="font-mono text-xs font-bold text-slate-600">{latestAssessment.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Site</p>
                                    <p className="text-base font-black text-slate-800">{latestAssessment.wound_location}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                    <p className="text-base font-black text-slate-800">{latestAssessment.wound_type}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimensions</p>
                                    <p className="text-base font-black text-slate-800">{latestAssessment.length_cm} × {latestAssessment.width_cm} × {latestAssessment.depth_cm} cm</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pain Index</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[60px]">
                                            <div className="h-full bg-blue-600" style={{ width: `${latestAssessment.pain_level * 10}%` }}></div>
                                        </div>
                                        <p className="text-base font-black text-slate-800">{latestAssessment.pain_level}/10</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Vision Analysis %</h5>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                        <span className="text-[10px] font-black text-slate-500">Granulation</span>
                                        <span className="text-sm font-black text-green-600">{latestAssessment.granulation_pct}%</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                        <span className="text-[10px] font-black text-slate-500">Epithelial</span>
                                        <span className="text-sm font-black text-blue-600">{latestAssessment.epithelial_pct}%</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                        <span className="text-[10px] font-black text-slate-500">Slough</span>
                                        <span className="text-sm font-black text-orange-600">{latestAssessment.slough_pct}%</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                        <span className="text-[10px] font-black text-slate-500">Eschar</span>
                                        <span className="text-sm font-black text-red-600">{latestAssessment.eschar_pct}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Suggestions */}
                        <div className="space-y-8 mb-10">
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <i className="fas fa-edit"></i>
                                    Clinical Observations
                                </h4>
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed min-h-[80px]">
                                    {latestAssessment.notes || 'No notes provided for this assessment.'}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <i className="fas fa-lightbulb"></i>
                                    Diagnostic Suggestions
                                </h4>
                                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-800 text-sm font-bold leading-relaxed shadow-sm">
                                    {latestAssessment.doctor_suggestion || 'Maintain current wound care protocol and monitor for changes in slough percentage.'}
                                </div>
                            </div>
                        </div>

                        {/* Footer Disclaimer */}
                        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <i className="fas fa-shield-alt text-slate-300 text-2xl"></i>
                                <div className="max-w-md">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] leading-tight mb-1">Confidential Medical Data</p>
                                    <p className="text-[9px] text-slate-400 leading-tight">This document contains sensitive patient information and is intended only for authorized clinical use under HIPAA compliance protocols.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 tracking-tighter uppercase mb-1">Certified By</p>
                                <p className="text-sm font-black text-slate-800">MediWound AI Analyst v2.4</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Reports;
