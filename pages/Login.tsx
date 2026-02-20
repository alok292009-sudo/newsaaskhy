
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { login, register, loginWithGoogle, sendOtp, loginWithOtp, setOfflineSession } from '../services/authService';

// Fix for TypeScript error regarding window.google
declare global {
    interface Window {
        google: any;
    }
}

interface LoginProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; 

// --- Icons ---
const Icons = {
    User: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Phone: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Lock: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Mail: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>,
    Key: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    Spinner: () => <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Alert: () => <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Check: () => <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export const Login: React.FC<LoginProps> = ({ lang, setLang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  // --- State ---
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  
  // Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UX State
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Effects ---

  // Mode switching via Router State
  useEffect(() => {
    if (location.state && location.state.mode) {
        setMode(location.state.mode);
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Google Auth Init
  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse
          });
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: 'outline', size: 'large', width: '100%', shape: 'pill' } // Customized
          );
      } catch (e) {
          console.warn("Google Auth Init Warning:", e);
      }
    }
  }, [mode]);

  // Clear errors when switching modes
  useEffect(() => {
      setErrorMsg('');
      setSuccessMsg('');
      setOtpSent(false);
      setOtp('');
  }, [mode, authMethod]);

  // --- Handlers ---

  const handleGoogleResponse = async (response: any) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
        await loginWithGoogle(response.credential);
        navigate('/dashboard');
    } catch (error: any) {
        setErrorMsg("Google Sign-In failed. Please try again or use Mobile.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const validateMobile = (mob: string) => {
      const regex = /^[0-9]{10}$/;
      return regex.test(mob);
  };

  const handleSendOtp = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!validateMobile(mobile)) {
          setErrorMsg("Please enter a valid 10-digit mobile number.");
          return;
      }
      
      setIsSendingOtp(true);
      setErrorMsg('');
      
      try {
          const otpCode = await sendOtp(mobile);
          setOtpSent(true);
          setSuccessMsg(otpCode ? `Dev Mode OTP: ${otpCode}` : 'OTP sent to your mobile.');
      } catch (error: any) {
          setErrorMsg(error.message || "Could not send OTP. Check connection.");
      } finally {
          setIsSendingOtp(false);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg('');
      
      if (!mobile && !email) {
          setErrorMsg("Please enter Mobile or Email.");
          return;
      }

      setIsSubmitting(true);
      
      try {
          if (authMethod === 'OTP') {
              if (otp.length !== 6) {
                  throw new Error("Please enter a valid 6-digit OTP.");
              }
              await loginWithOtp(mobile, otp);
          } else {
             const identifier = mobile || email;
             if (!password) throw new Error("Password is required.");
             await login(identifier, password);
          }
          navigate('/dashboard');
      } catch (error: any) {
          setErrorMsg(error.message || "Invalid credentials. Please try again.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg('');

      if (!name) { setErrorMsg("Full Name is required."); return; }
      if (!mobile || !validateMobile(mobile)) { setErrorMsg("Valid 10-digit Mobile is required."); return; }
      if (!password || password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }

      setIsSubmitting(true);

      try {
          await register(name, mobile, email, password);
          navigate('/onboarding');
      } catch (error: any) {
          setErrorMsg(error.message || "Registration failed. Mobile might be taken.");
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const handleDemoLogin = async () => {
      try {
          const demoUser = {
              id: 'demo-user-123',
              name: 'Demo Merchant',
              mobile: '9876543210',
              role: 'OWNER',
              createdAt: Date.now(),
              business: {
                  businessName: 'Demo Store',
                  businessType: 'Kirana',
                  city: 'Jaipur',
                  state: 'Rajasthan',
                  gst: '22AAAAA0000A1Z5'
              }
          };
          setOfflineSession(demoUser as any);
          navigate('/dashboard');
      } catch (err: any) {
          console.error("Demo login error", err);
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow"></div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#0B1120]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 transition-all duration-300">
        
        {/* Toggle Header */}
        <div className="flex border-b border-slate-700/50">
            <button 
                onClick={() => setMode('LOGIN')}
                className={`flex-1 py-5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${mode === 'LOGIN' ? 'bg-[#0B1120] text-white shadow-[inset_0_-2px_0_0_#4F46E5]' : 'bg-[#050914] text-slate-500 hover:text-slate-300'}`}
            >
                Sign In
            </button>
            <button 
                onClick={() => setMode('REGISTER')}
                className={`flex-1 py-5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 ${mode === 'REGISTER' ? 'bg-[#0B1120] text-white shadow-[inset_0_-2px_0_0_#4F46E5]' : 'bg-[#050914] text-slate-500 hover:text-slate-300'}`}
            >
                Register
            </button>
        </div>

        <div className="p-8 md:p-10">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2 tracking-tighter drop-shadow-md">
                    {mode === 'LOGIN' ? 'Welcome Back' : 'Create Identity'}
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                    {mode === 'LOGIN' ? 'Secure access to your trust ledger.' : 'Join the immutable commerce network.'}
                </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 items-start animate-fade-in">
                    <Icons.Alert />
                    <p className="text-red-400 text-xs font-bold leading-relaxed pt-0.5">{errorMsg}</p>
                </div>
            )}

            {/* Success Banner */}
            {successMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3 items-start animate-fade-in">
                    <Icons.Check />
                    <p className="text-emerald-400 text-xs font-bold leading-relaxed pt-0.5">{successMsg}</p>
                </div>
            )}

            <form onSubmit={mode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-5">
                
                {/* Full Name (Register Only) */}
                {mode === 'REGISTER' && (
                    <div className="group space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Icons.User />
                            </div>
                            <input 
                                type="text" 
                                required 
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                placeholder="e.g. Ramesh Kumar"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Input */}
                <div className="group space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Mobile Number</label>
                    <div className="flex gap-2">
                        <div className="px-3 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-400 font-bold text-sm select-none shadow-inner flex items-center justify-center">
                            🇮🇳 +91
                        </div>
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Icons.Phone />
                            </div>
                            <input 
                                type="tel" 
                                required 
                                maxLength={10}
                                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-lg font-mono tracking-wide placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                placeholder="98765 43210"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g,''))}
                            />
                        </div>
                    </div>
                </div>

                {/* Login Method Toggle */}
                {mode === 'LOGIN' && (
                    <div className="flex justify-center p-1 bg-slate-900/50 rounded-lg border border-slate-800">
                         <button 
                            type="button" 
                            onClick={() => setAuthMethod('PASSWORD')} 
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${authMethod === 'PASSWORD' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Password
                        </button>
                         <button 
                            type="button" 
                            onClick={() => setAuthMethod('OTP')} 
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${authMethod === 'OTP' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Via OTP
                        </button>
                    </div>
                )}

                {/* Password Field */}
                {(mode === 'REGISTER' || (mode === 'LOGIN' && authMethod === 'PASSWORD')) && (
                     <div className="group space-y-1.5 animate-fade-in">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Icons.Lock />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required 
                                className="w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider"
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                )}

                {/* OTP Field */}
                {(mode === 'LOGIN' && authMethod === 'OTP') && (
                    <div className="space-y-4 animate-fade-in">
                        {!otpSent ? (
                            <button 
                                onClick={handleSendOtp}
                                disabled={isSendingOtp || mobile.length < 10}
                                className="w-full py-3 bg-slate-800 border border-slate-700 text-blue-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-750 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isSendingOtp ? <Icons.Spinner /> : <Icons.Key />}
                                {isSendingOtp ? 'Sending OTP...' : 'Request OTP'}
                            </button>
                        ) : (
                            <div className="group space-y-1.5 animate-slide-up">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-400">Enter OTP</label>
                                    <button onClick={handleSendOtp} type="button" className="text-[10px] text-blue-400 hover:text-white font-bold transition-colors">Resend?</button>
                                </div>
                                <input 
                                    type="text" 
                                    className="w-full p-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-center font-mono text-xl tracking-[0.5em] shadow-inner"
                                    placeholder="••••••"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Main Submit Button */}
                <button 
                    type="submit" 
                    disabled={isSubmitting || (authMethod === 'OTP' && !otpSent)}
                    className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-blue-50 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Icons.Spinner /> : null}
                    {isSubmitting ? 'Processing...' : (mode === 'LOGIN' ? 'Access Account' : 'Create Identity')}
                </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Or Continue With</span>
                <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            {/* Third Party Auth */}
            <div className="space-y-4">
                 <div ref={googleButtonRef} className="min-h-[44px] w-full"></div>
                 
                 <button 
                    onClick={handleDemoLogin}
                    className="w-full py-3 bg-transparent border border-slate-700 rounded-full text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2"
                >
                    <span>Use Demo Account</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] border border-slate-700">Offline</span>
                </button>
            </div>

            <div className="mt-8 text-center text-[10px] text-slate-600 uppercase tracking-widest space-y-1 font-medium">
                <p>Protected by AES-256 Encryption.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
