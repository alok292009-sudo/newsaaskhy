
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { login, register, loginWithGoogle } from '../services/authService';

interface LoginProps {
  lang: Language;
  setLang: (lang: Language) => void;
}

// --- Icons ---
const Icons = {
    User: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Phone: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Lock: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Mail: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>,
    Key: () => <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
    Spinner: () => <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    Alert: () => <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Check: () => <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Google: () => <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
};

export const Login: React.FC<LoginProps> = ({ lang, setLang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- State ---
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UX State
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  // Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Handlers ---

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
        await loginWithGoogle();
        navigate('/dashboard');
    } catch (error: any) {
        setErrorMsg(error.message || "Google Sign-In failed. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Effects ---

  // Mode switching via Router State
  useEffect(() => {
    if (location.state && location.state.mode) {
        setMode(location.state.mode);
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Clear errors when switching modes
  useEffect(() => {
      setErrorMsg('');
      setSuccessMsg('');
      setVerificationSent(false);
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg('');
      
      if (!email) {
          setErrorMsg("Please enter Email.");
          return;
      }

      setIsSubmitting(true);
      
      try {
         if (!password) throw new Error("Password is required.");
         await login(email, password);
         navigate('/dashboard');
      } catch (error: any) {
          if (error.message === "Email not verified") {
              setVerificationEmail(email);
              setVerificationSent(true);
          } else {
              setErrorMsg(error.message || "Invalid credentials. Please try again.");
          }
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg('');

      if (!name) { setErrorMsg("Full Name is required."); return; }
      if (!email) { setErrorMsg("Email is required."); return; }
      if (!password || password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }

      setIsSubmitting(true);

      try {
          await register(name, '', email, password);
          setVerificationEmail(email);
          setVerificationSent(true);
      } catch (error: any) {
          setErrorMsg(error.message || "Registration failed.");
      } finally {
          setIsSubmitting(false);
      }
  };
  
  if (verificationSent) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative font-sans overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
            <div className="w-full max-w-md bg-[#0B1120]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 p-8 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                    <Icons.Mail />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Verify your email</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    We have sent you a verification email to <span className="text-white font-medium">{verificationEmail}</span>. Please verify it and log in.
                </p>
                <button 
                    onClick={() => {
                        setVerificationSent(false);
                        setMode('LOGIN');
                        setErrorMsg('');
                    }}
                    className="w-full py-3.5 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-50 transition-all"
                >
                    Login
                </button>
            </div>
        </div>
      );
  }

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
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-2 animate-fade-in">
                    <div className="flex gap-3 items-start">
                        <div className="shrink-0"><Icons.Alert /></div>
                        <p className="text-red-400 text-xs font-bold leading-relaxed pt-0.5">{errorMsg}</p>
                    </div>
                    {errorMsg.includes("Domain not authorized") && (
                        <div className="pl-8 mt-1">
                            <div className="bg-slate-900/80 p-2 rounded border border-slate-700 flex items-center justify-between gap-2 mb-2">
                                <code className="text-[10px] text-slate-300 font-mono truncate">{window.location.hostname}</code>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(window.location.hostname)}
                                    className="text-[10px] text-blue-400 hover:text-white font-bold uppercase shrink-0"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                1. Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-slate-400 underline hover:text-white">Firebase Console</a><br/>
                                2. Select Project &gt; Authentication &gt; Settings &gt; Authorized Domains<br/>
                                3. Add the domain above.
                            </p>
                        </div>
                    )}
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

                {/* Email Input */}
                <div className="group space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Icons.Mail />
                        </div>
                        <input 
                            type="email" 
                            required 
                            className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-sm font-medium placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* Password Field */}
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

                {/* Main Submit Button */}
                <button 
                    type="submit" 
                    disabled={isSubmitting}
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
                 <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-white text-slate-900 border border-slate-200 rounded-full font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                 >
                    <Icons.Google />
                    <span>Sign in with Google</span>
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
