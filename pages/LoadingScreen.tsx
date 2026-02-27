
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedUser = sessionStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (user?.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-3xl shadow-xl shadow-blue-50 mb-8 animate-pulse">
        <i className="fas fa-plus"></i>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Wound Assessment Tool</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-12">Hospital - Grade Diagnostics</p>

        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
