
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { db, APIError } from '../services/db';
import { User } from '../types';

const Settings: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Account Profile');

    // Mock settings
    const [notifications, setNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [language, setLanguage] = useState('English (US)');

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setFullName(user.fullName);
            setEmail(user.email);
        }
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!currentUser) return;

        setLoading(true);
        try {
            const payload: any = { fullName, email };
            if (password) payload.password = password;

            const updatedUser = await db.updateProfile(currentUser.id, payload);
            if (updatedUser) {
                const newUser = { ...currentUser, ...updatedUser };
                sessionStorage.setItem('user', JSON.stringify(newUser));
                setCurrentUser(newUser);
                setSuccess("Profile updated successfully");
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            if (err instanceof APIError) {
                setError(err.message);
            } else {
                setError("Failed to update profile");
            }
        } finally {
            setLoading(false);
        }
    };

    const notifyChange = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    return (
        <Layout title="System Settings">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-1 space-y-2">
                        <SettingsTab
                            label="Account Profile"
                            icon="fas fa-user-circle"
                            active={activeTab === 'Account Profile'}
                            onClick={() => setActiveTab('Account Profile')}
                        />
                        <SettingsTab
                            label="Security & Privacy"
                            icon="fas fa-shield-alt"
                            active={activeTab === 'Security & Privacy'}
                            onClick={() => setActiveTab('Security & Privacy')}
                        />
                        <SettingsTab
                            label="Notifications"
                            icon="fas fa-bell"
                            active={activeTab === 'Notifications'}
                            onClick={() => setActiveTab('Notifications')}
                        />
                        <SettingsTab
                            label="System Preferences"
                            icon="fas fa-sliders-h"
                            active={activeTab === 'System Preferences'}
                            onClick={() => setActiveTab('System Preferences')}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {activeTab === 'Account Profile' && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Clinical Profile</h3>
                                    <p className="text-xs text-slate-400 font-medium">Update your professional information and system identity.</p>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                                    {(error || success) && (
                                        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${error ? 'bg-red-50 border border-red-100 text-red-600' : 'bg-green-50 border border-green-100 text-green-600'}`}>
                                            <i className={`fas ${error ? 'fa-exclamation-circle' : 'fa-check-circle'} text-lg`}></i>
                                            {error || success}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                                                placeholder="Dr. John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Professional Email</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                                                placeholder="clinician@hospital.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-save"></i>}
                                            Save Profile Changes
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}

                        {activeTab === 'Security & Privacy' && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Security Configuration</h3>
                                    <p className="text-xs text-slate-400 font-medium">Manage your access credentials and authentication methods.</p>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-bold text-slate-800">Update Secure Password</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUpdateProfile}
                                            className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all"
                                        >
                                            Update Password
                                        </button>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add an extra layer of security to your clinical account.</p>
                                        </div>
                                        <Toggle active={twoFactor} onToggle={() => { setTwoFactor(!twoFactor); notifyChange("2FA status updated"); }} />
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'Notifications' && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Communication Alerts</h3>
                                    <p className="text-xs text-slate-400 font-medium">Configure how you receive critical system updates and patient alerts.</p>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Email Notifications</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Receive patient reports and system logs via email.</p>
                                        </div>
                                        <Toggle active={notifications} onToggle={() => { setNotifications(!notifications); notifyChange("Email notifications updated"); }} />
                                    </div>
                                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Push Notifications</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time alerts in your browser for urgent assessments.</p>
                                        </div>
                                        <Toggle active={pushNotifications} onToggle={() => { setPushNotifications(!pushNotifications); notifyChange("Push settings updated"); }} />
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'System Preferences' && (
                            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="font-bold text-slate-800">Environment Preferences</h3>
                                    <p className="text-xs text-slate-400 font-medium">Tailor the system interface to your specific clinical workflow.</p>
                                </div>
                                <div className="p-6 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">High-Contrast Mode</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Optimize UI for low-light or outdoor environments.</p>
                                        </div>
                                        <Toggle active={darkMode} onToggle={() => { setDarkMode(!darkMode); notifyChange("Interface theme updated"); }} />
                                    </div>
                                    <div className="pt-8 border-t border-slate-100 flex flex-col gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">Primary Language</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select the default interface language.</p>
                                        </div>
                                        <select
                                            value={language}
                                            onChange={(e) => { setLanguage(e.target.value); notifyChange(`Language set to ${e.target.value}`); }}
                                            className="w-full max-w-xs px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
                                        >
                                            <option>English (US)</option>
                                            <option>Spanish (ES)</option>
                                            <option>French (FR)</option>
                                            <option>German (DE)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-4">
                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                <i className="fas fa-exclamation-triangle"></i>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-orange-800">Security Audit Notice</h4>
                                <p className="text-xs text-orange-700 mt-1 leading-relaxed">
                                    All modifications to clinician profiles are logged for HIPAA compliance. unauthorized access or changes may lead to system suspension.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const SettingsTab = ({ label, icon, active = false, onClick }: { label: string; icon: string; active?: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
    >
        <i className={`${icon} w-5 text-center ${active ? 'text-white' : 'text-slate-400'}`}></i>
        <span>{label}</span>
        {active && <i className="fas fa-chevron-right ml-auto text-xs opacity-50"></i>}
    </button>
);

const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-7 shadow-sm' : 'left-1'}`}></div>
    </button>
);

export default Settings;
