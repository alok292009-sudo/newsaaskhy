
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, BusinessType } from '../types';
import { TRANSLATIONS, BUSINESS_TYPES, INDIAN_STATES, CITIES_BY_STATE } from '../constants';
import { getSessionUser, updateUserProfile } from '../services/authService';

interface OnboardingProps {
  lang: Language;
}

export const Onboarding: React.FC<OnboardingProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();
  const user = getSessionUser();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // State for Form
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.KIRANA);
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Validate session
  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }
    // If user already has a business profile, skip onboarding
    if (user.business) {
        navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
        await updateUserProfile(user.id, {
            business: {
                businessName,
                businessType,
                city,
                state: stateName
            }
        });
        
        setLoading(false);
        setSuccess(true);
    } catch (err) {
        console.error("Update failed", err);
        setLoading(false);
    }
  };

  const handleEnterDashboard = () => {
      // Hard reload to initialize App with new session
      window.location.href = '#/';
      window.location.reload();
  };

  const getBusinessIcon = (type: BusinessType) => {
      switch (type) {
          case BusinessType.KIRANA:
              return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />;
          case BusinessType.WHOLESALER:
              return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />;
          case BusinessType.TRANSPORT:
              return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16v-1a3 3 0 00-3-3H3m4 4h9m-9-4H3m9 4v-1.5a2.5 2.5 0 012.5-2.5H19M5 8h4.5a2.5 2.5 0 012.5 2.5V14" />;
          case BusinessType.CONSTRUCTION:
              return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
          case BusinessType.MANUFACTURING:
              return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />;
          case BusinessType.OTHER:
              return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />;
          default:
              return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
      }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStateName(e.target.value);
      setCity('');
  };

  // Derived list of cities based on selected state
  const availableCities = stateName ? (CITIES_BY_STATE[stateName] || []) : [];

  if (success) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden font-sans">
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full bg-emerald-500/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20 ring-1 ring-emerald-500/50 backdrop-blur-sm relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3 relative z-10">Setup Complete</h2>
            <p className="text-slate-400 mb-10 max-w-xs leading-relaxed relative z-10">
                Your business identity has been securely established. You are now ready to build trust.
            </p>

            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6 w-full max-w-sm mb-8 text-left relative z-10 shadow-xl">
                <div className="flex justify-between mb-4 border-b border-slate-700 pb-4">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">Business</span>
                    <span className="text-sm text-white font-bold">{businessName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wide">Owner</span>
                    <span className="text-sm text-white font-bold">{user?.name}</span>
                </div>
            </div>

            <button 
                onClick={handleEnterDashboard}
                className="w-full max-w-sm py-4 bg-white text-slate-900 rounded-xl font-bold shadow-xl shadow-white/5 hover:bg-slate-200 transition-all active:scale-[0.98] relative z-10"
            >
                Enter Dashboard
            </button>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
      );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 font-sans text-white">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-1">{t.onboard_title}</h2>
        <p className="text-sm text-slate-400 mb-6">{t.onboard_desc}</p>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl space-y-6">
            
            {/* Identity Read-only */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-xl">
                     {user.name.charAt(0)}
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Account</p>
                    <p className="font-bold text-sm text-slate-200">{user.name}</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">{t.label_biz_name}</label>
                <input 
                    required
                    type="text" 
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-600 transition-all"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="e.g. Rajesh Traders"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-3">{t.label_biz_type}</label>
                <div className="grid grid-cols-2 gap-3">
                    {BUSINESS_TYPES.map(type => {
                        const isSelected = businessType === type.value;
                        return (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setBusinessType(type.value as BusinessType)}
                                className={`
                                    relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden
                                    ${isSelected 
                                        ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500 shadow-lg shadow-blue-900/30' 
                                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                                    }
                                `}
                            >
                                <div className={`
                                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isSelected ? 'bg-blue-500 text-white shadow-md shadow-blue-500/40 scale-110' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600 group-hover:text-slate-200'}
                                `}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {getBusinessIcon(type.value as BusinessType)}
                                    </svg>
                                </div>
                                
                                <span className={`text-xs font-bold text-center transition-colors relative z-10 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {type.label.split('/')[0]}
                                </span>
                                
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* State First */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">State</label>
                    <div className="relative">
                        <select 
                            required
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all appearance-none cursor-pointer"
                            value={stateName}
                            onChange={handleStateChange}
                        >
                            <option value="" disabled className="bg-slate-900 text-slate-500">Select State</option>
                            {INDIAN_STATES.map(state => (
                                <option key={state} value={state} className="bg-slate-900 text-white">{state}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* City Second (Dependent on State) */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">{t.label_city}</label>
                    <div className="relative">
                        <input 
                            required
                            list="cities"
                            disabled={!stateName}
                            className={`w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all appearance-none
                                ${!stateName ? 'opacity-50 cursor-not-allowed placeholder-slate-600' : 'placeholder-slate-400'}
                            `}
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            placeholder={stateName ? "Select or Type" : "Select State First"}
                        />
                        <datalist id="cities">
                            {availableCities.map(c => <option key={c} value={c} />)}
                        </datalist>
                        
                        {!stateName && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        )}
                        {stateName && (
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 mt-4 hover:shadow-blue-600/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
                {loading ? 'Creating Business Profile...' : 'Complete Setup'}
            </button>
        </form>
      </div>
    </div>
  );
};
