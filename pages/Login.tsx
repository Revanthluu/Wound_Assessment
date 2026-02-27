
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, APIError } from '../services/db';
import { UserRole } from '../types';
import { emailService } from '../services/emailService';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.DOCTOR);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    emailService.init();
  }, []);

  const generateAndSendOtp = async () => {
    if (!email || !fullName) {
      setError("Please fill in your name and email address first.");
      setLoading(false);
      return;
    }

    console.log("--- Executing OTP Flow ---");
    console.log("Email State:", email);
    console.log("Name State:", fullName);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    setLoading(true);
    try {
      await emailService.sendOTP(email, otp, fullName);
      console.log("OTP sent successfully to service");
      setShowOtpInput(true);
      setError(null);
    } catch (e: any) {
      console.error("Full Error Object:", e);
      setError(`Verification Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleAuth triggered | isRegistering:", isRegistering, "| showOtpInput:", showOtpInput);
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        console.log("Registration path selected");
        if (!showOtpInput) {
          console.log("Triggering OTP generation...");
          // First step: trigger OTP
          await generateAndSendOtp();
          return;
        }

        // Second step: verify OTP
        if (userOtp !== generatedOtp) {
          setError("Invalid verification code. Please check your email.");
          setLoading(false);
          return;
        }

        const success = await db.register({ email, pass: password, fullName, role });
        if (success) {
          setIsRegistering(false);
          setShowOtpInput(false);
          setGeneratedOtp('');
          setUserOtp('');
          setError("Account created. Please log in.");
        }
      } else {
        const user = await db.login(email, password);
        if (user) {
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('user', JSON.stringify(user));
          navigate('/loading');
        }
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("An unexpected connection error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
          <i className="fas fa-plus"></i>
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-tight text-xl tracking-tight">MediWound AI</h1>
          <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">Hospital - Grade Diagnostics</p>
        </div>
      </div>

      <div className="w-full max-w-md">

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="mb-8">
            <div className={`w-10 h-10 ${isRegistering ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'} rounded-lg flex items-center justify-center mb-4`}>
              <i className={isRegistering ? "fas fa-user-plus" : "fas fa-lock"}></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
              {isRegistering ? 'Create Clinical Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              {isRegistering ? 'Register to access the wound analysis system' : 'Please sign in to access secure patient records'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-3 animate-head-shake">
              <i className="fas fa-exclamation-circle text-lg"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            {isRegistering && showOtpInput && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="block text-sm font-bold text-slate-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value)}
                  className="w-full px-4 py-4 bg-blue-50 border border-blue-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-center text-2xl tracking-[1em]"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-slate-400 mt-2 font-medium">Enter the 6-digit code sent to your email.</p>
              </div>
            )}

            {!showOtpInput && (
              <>
                {isRegistering && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Dr. John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">System Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <option value={UserRole.ADMIN}>System Administrator</option>
                        <option value={UserRole.DOCTOR}>Doctor / Clinician</option>
                        <option value={UserRole.NURSE}>Nurse</option>
                        <option value={UserRole.PATIENT}>Patient</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="clinician@hospital.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Secure Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  {showOtpInput ? 'VERIFYING...' : 'LOGGING IN...'}
                </>
              ) : (
                isRegistering ? (showOtpInput ? 'Verify & Register' : 'Send Verification Email') : 'Login to System'
              )}
            </button>

          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setShowOtpInput(false);
                setUserOtp('');
              }}
              className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              {isRegistering ? 'Already have an account? Login' : 'New Clinician? Register here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
