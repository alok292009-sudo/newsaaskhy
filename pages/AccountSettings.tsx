
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser, updateUserProfile } from '../services/authService';
import { User, BusinessType, Language, UserPreferences } from '../types';
import { TRANSLATIONS, BUSINESS_TYPES, INDIAN_STATES, CITIES_BY_STATE } from '../constants';

interface Props {
    lang: Language;
}

export const AccountSettings: React.FC<Props> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    const navigate = useNavigate();
    const user = getSessionUser();
    
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    // Personal Info
    const [name, setName] = useState('');
    
    // Business Info
    const [businessName, setBusinessName] = useState('');
    const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.KIRANA);
    const [city, setCity] = useState('');
    const [stateName, setStateName] = useState('');
    const [gst, setGst] = useState('');

    // Preferences
    const [prefs, setPrefs] = useState<UserPreferences>({
        whatsappAlerts: true,
        emailAlerts: false,
        dailyReports: false
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        setName(user.name);
        if (user.business) {
            setBusinessName(user.business.businessName || '');
            setBusinessType(user.business.businessType || BusinessType.KIRANA);
            setCity(user.business.city || '');
            setStateName(user.business.state || '');
            setGst(user.business.gst || '');
        }
        if (user.preferences) {
            setPrefs(user.preferences);
        }
    }, [navigate]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setSuccessMsg('');

        try {
            await updateUserProfile(user.id, {
                name,
                business: {
                    businessName,
                    businessType,
                    city,
                    state: stateName,
                    gst
                },
                preferences: prefs
            });
            setSuccessMsg(t.saved_success);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStateName(e.target.value);
        setCity('');
    };

    const availableCities = stateName ? (CITIES_BY_STATE[stateName] || []) : [];

    if (!user) return null;

    return (
        <div className="min-h-full pb-20 max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">{t.settings_title}</h2>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="text-sm text-slate-400 hover:text-white"
                >
                    Back to Dashboard
                </button>
            </div>

            {successMsg && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-emerald-300 font-medium">{successMsg}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                
                {/* Section 1: Personal & Business Info */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-3">{t.sect_personal}</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Full Name</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Mobile Number</label>
                            <input 
                                type="text" 
                                disabled
                                className="w-full p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-500 cursor-not-allowed"
                                value={user.mobile || 'N/A'}
                            />
                            <p className="text-[10px] text-slate-600 mt-1">Mobile number cannot be changed as it is your primary ID.</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-3">{t.sect_business}</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Business Name</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white"
                                value={businessName}
                                onChange={e => setBusinessName(e.target.value)}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Business Type</label>
                                <select 
                                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white"
                                    value={businessType}
                                    onChange={e => setBusinessType(e.target.value as BusinessType)}
                                >
                                    {BUSINESS_TYPES.map(bt => (
                                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                                    ))}
                                </select>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">GSTIN (Optional)</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white placeholder-slate-600"
                                    value={gst}
                                    onChange={e => setGst(e.target.value)}
                                    placeholder="22AAAAA0000A1Z5"
                                />
                             </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">State</label>
                                <select 
                                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white"
                                    value={stateName}
                                    onChange={handleStateChange}
                                >
                                    <option value="" disabled>Select State</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">City</label>
                                <input 
                                    list="settings-cities"
                                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-white"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    disabled={!stateName}
                                    placeholder={!stateName ? "Select State first" : "Type or Select"}
                                />
                                <datalist id="settings-cities">
                                    {availableCities.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Notification Preferences */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-700 pb-3">{t.sect_prefs}</h3>
                    
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prefs.whatsappAlerts ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{t.pref_whatsapp}</p>
                                    <p className="text-xs text-slate-500">Receive OTPs and Record confirmations via WhatsApp</p>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${prefs.whatsappAlerts ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prefs.whatsappAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={prefs.whatsappAlerts} 
                                onChange={() => setPrefs({...prefs, whatsappAlerts: !prefs.whatsappAlerts})} 
                            />
                        </label>

                        <label className="flex items-center justify-between p-4 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prefs.emailAlerts ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{t.pref_email}</p>
                                    <p className="text-xs text-slate-500">Receive backup copies of records via Email</p>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${prefs.emailAlerts ? 'bg-blue-500' : 'bg-slate-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prefs.emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={prefs.emailAlerts} 
                                onChange={() => setPrefs({...prefs, emailAlerts: !prefs.emailAlerts})} 
                            />
                        </label>

                         <label className="flex items-center justify-between p-4 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prefs.dailyReports ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-600'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{t.pref_reports}</p>
                                    <p className="text-xs text-slate-500">Get a daily summary of overdue payments at 9 AM</p>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${prefs.dailyReports ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${prefs.dailyReports ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={prefs.dailyReports} 
                                onChange={() => setPrefs({...prefs, dailyReports: !prefs.dailyReports})} 
                            />
                        </label>
                    </div>
                </div>

                <div className="pt-4 pb-12">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Saving Changes...</span>
                            </>
                        ) : t.btn_save}
                    </button>
                </div>

            </form>
        </div>
    );
};
