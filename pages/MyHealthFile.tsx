import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import Layout from '../components/Layout';

const MyHealthFile: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyProfile = async () => {
            const userJson = sessionStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            if (!user || user.role !== 'PATIENT') {
                navigate('/dashboard');
                return;
            }

            try {
                const patient = await db.getPatientByUserId(parseInt(user.id));
                if (patient) {
                    navigate(`/patients/${patient.id}`);
                } else {
                    setError("Your clinical record is still being synchronized. Please contact your physician.");
                }
            } catch (err) {
                setError("Failed to access clinical registry.");
            }
        };
        fetchMyProfile();
    }, [navigate]);

    if (error) {
        return (
            <Layout title="Synchronization Error">
                <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 text-3xl shadow-sm border border-amber-100">
                        <i className="fas fa-sync-alt animate-spin"></i>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Registry Linkage Pending</h2>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Return to Hub
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Accessing Clinical File">
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Authenticating Clinical Credentials...</p>
            </div>
        </Layout>
    );
};

export default MyHealthFile;
