
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

const RoleSelection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.DOCTOR);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="absolute top-10 left-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <i className="fas fa-plus"></i>
        </div>
        <div>
          <h1 className="font-bold text-slate-800">Wound Assessment Tool</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Hospital - Grade Diagnostics</p>
        </div>
      </div>

      <div className="text-center mb-16 max-w-md">
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4">Select Your Role</h2>
        <p className="text-slate-400 font-medium">Choose your workspace to continue with specialized tools for your daily tasks.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mb-12">
        <RoleCard
          icon="fas fa-user-shield"
          title="Administrator"
          description="Manage system users, monitor infrastructure, and oversee clinical compliance logs."
          isSelected={selectedRole === UserRole.ADMIN}
          onClick={() => setSelectedRole(UserRole.ADMIN)}
        />
        <RoleCard
          icon="fas fa-user-md"
          title="Doctor"
          description="Manage clinical workflows, assess wounds, and monitor patient healing trends."
          isSelected={selectedRole === UserRole.DOCTOR}
          onClick={() => setSelectedRole(UserRole.DOCTOR)}
        />
        <RoleCard
          icon="fas fa-user-nurse"
          title="Nurse"
          description="Assist in patient care, update charts, and perform wound assessments."
          isSelected={selectedRole === UserRole.NURSE}
          onClick={() => setSelectedRole(UserRole.NURSE)}
        />
        <RoleCard
          icon="fas fa-user-injured"
          title="Patient"
          description="Track your own recovery, view assessments, and communicate with your care team."
          isSelected={selectedRole === UserRole.PATIENT}
          onClick={() => setSelectedRole(UserRole.PATIENT)}
        />
      </div>

      <button
        onClick={() => {
          const storedUser = sessionStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            user.role = selectedRole;
            sessionStorage.setItem('user', JSON.stringify(user));
          }
          navigate('/dashboard');
        }}
        className="px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
      >
        Continue
      </button>
    </div>
  );
};

const RoleCard = ({ icon, title, description, isSelected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 text-left p-10 rounded-[2rem] border-4 transition-all duration-300 relative group ${isSelected
      ? 'bg-blue-50 border-blue-600 shadow-2xl shadow-blue-100 scale-[1.02]'
      : 'bg-white border-transparent hover:border-slate-200'
      }`}
  >
    {isSelected && (
      <div className="absolute top-6 right-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
        <i className="fas fa-check text-xs"></i>
      </div>
    )}
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-8 transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
      }`}>
      <i className={icon}></i>
    </div>
    <h3 className={`text-2xl font-extrabold mb-4 transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
      {title}
    </h3>
    <p className={`font-medium leading-relaxed transition-colors ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>
      {description}
    </p>
  </button>
);

export default RoleSelection;
