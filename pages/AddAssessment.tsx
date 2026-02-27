
import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { db, APIError } from '../services/db';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { Patient } from '../types';

export const AddAssessment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const targetPatientId = query.get('patientId');

    const [loading, setLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [patients, setPatients] = useState<any[]>([]);

    // Default date to today in YYYY-MM-DD format for the input
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        patient_id: targetPatientId || '',
        visitDate: today,
        woundLocation: 'Right Heel',
        woundType: 'Pressure Injury',
        woundStage: 'Stage II',
        length: '0.0',
        width: '0.0',
        depth: '0.0',
        painLevel: 5,
        notes: '',
        granulation: 0,
        epithelial: 0,
        slough: 0,
        eschar: 0,
        doctorSuggestion: ''
    });

    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [marker, setMarker] = useState<{ x: number, y: number } | null>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        const fetchPatients = async () => {
            const userJson = sessionStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            let p: Patient[] = [];
            if (user?.role === 'NURSE') {
                p = await db.getPatientsByNurse(parseInt(user.id));
                // Security check for targetPatientId from URL
                if (targetPatientId && !p.some(pat => pat.id === targetPatientId)) {
                    setAccessDenied(true);
                }
            } else {
                p = await db.getPatients();
            }

            setPatients(p);
            if (!formData.patient_id && p.length > 0) {
                setFormData(prev => ({ ...prev, patient_id: targetPatientId && p.some(pat => pat.id === targetPatientId) ? targetPatientId : p[0].id }));
            }
        };
        fetchPatients();
    }, [targetPatientId]);

    const analyzeImage = async (base64Data: string) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

            if (!apiKey) {
                throw new Error("Gemini API Key is missing. Please check your .env.local file.");
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Analyze this clinical wound image accurately. 
      You MUST return valid JSON. 
      Return a JSON object with:
      - granulation_pct: number (percentage of healthy red tissue, 0-100)
      - epithelial_pct: number (percentage of pink/white skin growth, 0-100)
      - slough_pct: number (percentage of yellow/tan tissue, 0-100)
      - eschar_pct: number (percentage of black/brown dead tissue, 0-100)
      - suggested_location: string (specific body part, e.g., 'Right Heel', 'Sacrum', 'Left Lateral Malleolus')
      - suggested_stage: string (One of: 'Stage I', 'Stage II', 'Stage III', 'Stage IV' based on depth and tissue loss)
      - estimated_l_cm: number (length in cm)
      - estimated_w_cm: number (width in cm)
      - description: string (brief clinical description of the wound bed and periwound)
      - treatment_plan: string (concise clinical care suggestion for the doctor)`;

            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: [{
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: 'image/jpeg', data: base64Data.split(',')[1] } }
                    ],
                }],
                config: { responseMimeType: "application/json" }
            });

            const data = JSON.parse(response.text || '{}');
            setFormData(prev => ({
                ...prev,
                granulation: data.granulation_pct || 0,
                epithelial: data.epithelial_pct || 0,
                slough: data.slough_pct || 0,
                eschar: data.eschar_pct || 0,
                woundLocation: data.suggested_location || prev.woundLocation,
                woundStage: data.suggested_stage || prev.woundStage,
                length: (data.estimated_l_cm || 0).toString(),
                width: (data.estimated_w_cm || 0).toString(),
                notes: data.description || prev.notes,
                doctorSuggestion: data.treatment_plan || prev.doctorSuggestion
            }));
        } catch (e: any) {
            console.error("AI Analysis Failed:", e);
            setError(`AI analysis encountered an error: ${e.message || "Unknown error"}. Please enter values manually.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
                analyzeImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patient_id) { setError("Select a patient first."); return; }
        setLoading(true);
        setError(null);

        try {
            const assessmentPayload: any = {
                id: Math.random().toString(36).substr(2, 9),
                patient_id: formData.patient_id,
                // Use the selected visit date instead of current time
                date: new Date(formData.visitDate).toISOString(),
                wound_location: formData.woundLocation,
                wound_type: formData.woundType,
                wound_stage: formData.woundStage,
                length_cm: parseFloat(formData.length),
                width_cm: parseFloat(formData.width),
                depth_cm: parseFloat(formData.depth),
                pain_level: formData.painLevel,
                granulation_pct: formData.granulation,
                epithelial_pct: formData.epithelial,
                slough_pct: formData.slough,
                eschar_pct: formData.eschar,
                marker_data: JSON.stringify({ marker, zoom, rotation }),
                notes: formData.notes,
                doctor_suggestion: formData.doctorSuggestion,
                image_data: previewImage,
                status: 'Stable'
            };

            const success = await db.saveAssessment(assessmentPayload);
            if (success) {
                // Infection Detection Logic
                const infectionKeywords = ['infection', 'infected', 'sepsis', 'pus', 'purulent', 'foul odor', 'cellulitis'];
                const contentToSearch = `${formData.notes} ${formData.doctorSuggestion}`.toLowerCase();
                const hasInfection = infectionKeywords.some(keyword => contentToSearch.includes(keyword));

                if (hasInfection) {
                    const patient = patients.find(p => p.id === formData.patient_id);
                    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
                    await db.createAlert({
                        patient_id: formData.patient_id,
                        assessment_id: assessmentPayload.id,
                        message: `Potential infection detected for patient ${patientName}. Please review assessment immediately.`
                    });
                }

                navigate(`/patients/${formData.patient_id}`);
            }
        } catch (err) {
            setError(err instanceof APIError ? err.message : "Database write failed.");
            setLoading(false);
        }
    };

    if (accessDenied) return (
        <Layout title="Access Restricted">
            <div className="p-20 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 text-3xl shadow-sm border border-rose-100">
                    <i className="fas fa-user-lock"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">Unauthorized Clinical Action</h2>
                <p className="text-slate-500 font-medium max-w-md mx-auto">Nurses can only commit data for patients explicitly assigned to their active shift. Please contact an Admin if this is an error.</p>
                <Link to="/dashboard" className="inline-block mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    Return to Hub
                </Link>
            </div>
        </Layout>
    );

    return (
        <Layout title="Secure Data Entry">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">New Visit Assessment</h1>
                    <p className="text-slate-500 font-medium">Capture wound telemetry for patient progression tracking.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || isAnalyzing}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <><i className="fas fa-spinner animate-spin"></i> Commit To DB...</>
                    ) : (
                        'Finalize Assessment'
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm animate-shake">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-4">Patient Selection</h3>
                                <select
                                    value={formData.patient_id}
                                    onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
                                    disabled={!!targetPatientId}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                                >
                                    {patients.length === 0 ? <option>No patients registered</option> :
                                        patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>)
                                    }
                                </select>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-4">Visit Date</h3>
                                <input
                                    type="date"
                                    value={formData.visitDate}
                                    onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-blue-700 font-bold animate-pulse uppercase tracking-widest text-xs">AI Surface Analysis...</p>
                            </div>
                        )}
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-6">Visual Documentation</h3>
                        {!previewImage ? (
                            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl">
                                    <i className="fas fa-camera"></i>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-800">Upload Wound Imagery</p>
                                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-tight">Gemini Vision Enabled</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div
                                    ref={imageContainerRef}
                                    className="rounded-2xl overflow-hidden border border-slate-200 group relative bg-slate-900 cursor-crosshair h-[400px] flex items-center justify-center"
                                    onClick={(e) => {
                                        const rect = imageContainerRef.current?.getBoundingClientRect();
                                        if (rect) {
                                            // Normalized coordinates (0 to 1)
                                            let nx = (e.clientX - rect.left) / rect.width;
                                            let ny = (e.clientY - rect.top) / rect.height;

                                            // Adjust for rotation (calculate coordinates in the unrotated frame)
                                            const rad = (-rotation * Math.PI) / 180;
                                            const dx = nx - 0.5;
                                            const dy = ny - 0.5;

                                            const rx = (dx * Math.cos(rad) - dy * Math.sin(rad)) / zoom;
                                            const ry = (dx * Math.sin(rad) + dy * Math.cos(rad)) / zoom;

                                            setMarker({
                                                x: (rx + 0.5) * 100,
                                                y: (ry + 0.5) * 100
                                            });
                                        }
                                    }}
                                >
                                    <div
                                        style={{
                                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                            transition: 'transform 0.2s ease-out'
                                        }}
                                        className="w-full h-full flex items-center justify-center relative"
                                    >
                                        <img src={previewImage} className="max-w-full max-h-full object-contain" alt="Wound" />

                                        {marker && (
                                            <div
                                                className="absolute w-6 h-6 border-2 border-white bg-red-500 rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-10"
                                                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                                            >
                                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        <button onClick={(e) => { e.stopPropagation(); setRotation(r => (r + 90) % 360); }} className="w-10 h-10 bg-white/90 text-blue-600 rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all" title="Rotate Clockwise">
                                            <i className="fas fa-redo"></i>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); }} className="w-10 h-10 bg-white/90 text-slate-800 rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all">
                                            <i className="fas fa-plus"></i>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 1)); }} className="w-10 h-10 bg-white/90 text-slate-800 rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all">
                                            <i className="fas fa-minus"></i>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setMarker(null); setZoom(1); setRotation(0); }} className="w-10 h-10 bg-white/90 text-slate-800 rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all" title="Reset All View Settings">
                                            <i className="fas fa-undo"></i>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setMarker(null); setZoom(1); setRotation(0); }} className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>

                                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-xs font-bold rounded-full uppercase tracking-tight backdrop-blur-sm pointer-events-none">
                                        Tap to mark wound area • Scroll/Buttons to zoom
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-6 flex justify-between items-center">
                            <span>Tissue Analysis</span>
                            <span className="text-blue-600 font-bold uppercase tracking-widest text-[10px] bg-blue-50 px-2 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                                <i className="fas fa-microchip"></i>
                                {isAnalyzing ? 'AI Analyzing...' : 'Manual Edit Enabled'}
                            </span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100 focus-within:ring-2 focus-within:ring-green-400 transition-all">
                                <label className="block text-[10px] font-bold text-green-600 uppercase mb-2 tracking-wider">Granulation (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.granulation}
                                    onChange={e => setFormData({ ...formData, granulation: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-center text-2xl font-extrabold text-slate-800 border-none outline-none p-0"
                                />
                            </div>
                            <div className="text-center p-4 bg-pink-50 rounded-2xl border border-pink-100 focus-within:ring-2 focus-within:ring-pink-400 transition-all">
                                <label className="block text-[10px] font-bold text-pink-600 uppercase mb-2 tracking-wider">Epithelial (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.epithelial}
                                    onChange={e => setFormData({ ...formData, epithelial: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-center text-2xl font-extrabold text-slate-800 border-none outline-none p-0"
                                />
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-2xl border border-yellow-100 focus-within:ring-2 focus-within:ring-yellow-400 transition-all">
                                <label className="block text-[10px] font-bold text-yellow-600 uppercase mb-2 tracking-wider">Slough (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.slough}
                                    onChange={e => setFormData({ ...formData, slough: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-center text-2xl font-extrabold text-slate-800 border-none outline-none p-0"
                                />
                            </div>
                            <div className="text-center p-4 bg-slate-900 rounded-2xl border border-slate-700 focus-within:ring-2 focus-within:ring-slate-500 transition-all">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Eschar (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.eschar}
                                    onChange={e => setFormData({ ...formData, eschar: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-transparent text-center text-2xl font-extrabold text-white border-none outline-none p-0"
                                />
                            </div>
                        </div>
                        <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                            <div style={{ width: `${formData.granulation}%` }} className="bg-green-500 h-full shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
                            <div style={{ width: `${formData.epithelial}%` }} className="bg-pink-400 h-full shadow-[0_0_10px_rgba(244,114,182,0.3)]"></div>
                            <div style={{ width: `${formData.slough}%` }} className="bg-yellow-400 h-full shadow-[0_0_10px_rgba(250,204,21,0.3)]"></div>
                            <div style={{ width: `${formData.eschar}%` }} className="bg-slate-800 h-full shadow-[0_0_10px_rgba(30,41,59,0.3)]"></div>
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-8">Clinical Parameters</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="Location" value={formData.woundLocation} onChange={v => setFormData({ ...formData, woundLocation: v })} />
                            <InputGroup label="Clinical Stage" value={formData.woundStage} onChange={v => setFormData({ ...formData, woundStage: v })} type="select" options={['Stage I', 'Stage II', 'Stage III', 'Stage IV']} />
                            <InputGroup label="Length (cm)" value={formData.length} onChange={v => setFormData({ ...formData, length: v })} />
                            <InputGroup label="Width (cm)" value={formData.width} onChange={v => setFormData({ ...formData, width: v })} />
                        </div>

                        <div className="mt-8">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">Pain Score (0-10)</label>
                            <div className="flex justify-between gap-1">
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <button key={n} type="button" onClick={() => setFormData({ ...formData, painLevel: n })} className={`flex-1 py-3 rounded-lg font-bold text-xs transition-all ${formData.painLevel === n ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{n}</button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-6">Clinician Progress Notes</h3>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Enter clinical findings..."
                            className="w-full min-h-[120px] p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium resize-none shadow-inner"
                        />
                    </section>

                    <section className="bg-purple-50 p-8 rounded-3xl border border-purple-100 shadow-sm border-dashed">
                        <h3 className="font-bold text-purple-700 uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
                            <i className="fas fa-robot"></i>
                            AI Treatment Suggestions
                        </h3>
                        <textarea
                            value={formData.doctorSuggestion}
                            onChange={e => setFormData({ ...formData, doctorSuggestion: e.target.value })}
                            placeholder="AI recommendations will appear here..."
                            className="w-full min-h-[120px] p-4 bg-white/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-purple-400 text-sm font-bold text-slate-700 resize-none"
                        />
                        <p className="mt-4 text-xs text-purple-400 font-bold uppercase tracking-tight italic">Generated based on visual wound analysis</p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

const InputGroup = ({ label, value, onChange, type = 'text', options = [] }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">{label}</label>
        {type === 'select' ? (
            <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border-none focus:ring-2 focus:ring-blue-500 outline-none">
                {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
            </select>
        ) : (
            <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border-none focus:ring-2 focus:ring-blue-500 outline-none" />
        )}
    </div>
);

// End of file
