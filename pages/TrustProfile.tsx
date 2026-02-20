
import React, { useState, useEffect } from 'react';
import { getMetrics, getRecords } from '../services/dataService';
import { getSessionUser } from '../services/authService';
import { generateTrustSummary } from '../services/geminiService';
import { TrustMetrics, Language, TradeRecord } from '../types';
import { TRANSLATIONS } from '../constants';

interface TrustProfileProps {
  lang: Language;
}

export const TrustProfile: React.FC<TrustProfileProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const user = getSessionUser();
  const [metrics, setMetrics] = useState<TrustMetrics | null>(null);
  const [records, setRecords] = useState<TradeRecord[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
        try {
            const m = await getMetrics();
            const r = await getRecords();
            setMetrics(m);
            setRecords(r);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchProfileData();
  }, []);

  const handleAiGenerate = async () => {
    if (!metrics) return;
    setAiLoading(true);
    const summary = await generateTrustSummary(metrics, records);
    setAiSummary(summary);
    setAiLoading(false);
  };

  if (!user) return <div className="p-10 text-center text-slate-400">{t.loading}</div>;
  if (loading || !metrics) return <div className="p-10 text-center text-slate-400">Loading Profile...</div>;

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 mb-6 border border-blue-500/20">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-2xl font-bold border border-white/20">
                {user.name.charAt(0)}
            </div>
            <div>
                <h2 className="text-xl font-bold">{user.business?.businessName}</h2>
                <p className="text-sm text-slate-300">Joined {new Date(user.createdAt).getFullYear()}</p>
                <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs font-medium text-emerald-400">Verified Identity</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
            <div className="text-center">
                <span className="block text-2xl font-bold">{metrics.totalConfirmed}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Confirmed</span>
            </div>
            <div className="text-center border-l border-white/10">
                <span className="block text-2xl font-bold">{metrics.onTimePercentage}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">On Time</span>
            </div>
            <div className="text-center border-l border-white/10">
                <span className="block text-2xl font-bold text-red-300">{metrics.disputeCount}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">Disputes</span>
            </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-3">
             <h3 className="font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Saakshy AI
             </h3>
             <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300">Beta</span>
        </div>
        
        {aiSummary ? (
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 leading-relaxed italic">"{aiSummary}"</p>
                <p className="text-[10px] text-slate-500 mt-2 text-right">{new Date().toLocaleDateString()}</p>
            </div>
        ) : (
             <div className="text-center py-4">
                 <p className="text-xs text-slate-500 mb-4">{t.ai_disclaimer}</p>
                 <button 
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {aiLoading ? t.loading : t.ai_analysis_btn}
                </button>
             </div>
        )}
      </div>

      <div className="space-y-4">
         <h3 className="font-bold text-slate-300 mb-2">Platform Commitments</h3>
         
         <div className="grid md:grid-cols-2 gap-4">
            {/* Immutable Records */}
            <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="bg-green-500/10 p-2.5 rounded-full text-green-400 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-white mb-1">Immutable Records</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Once confirmed, records cannot be deleted or edited. This creates a permanent, undeniable source of truth for both parties.</p>
                </div>
            </div>

            {/* Neutral Witness */}
            <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="bg-blue-500/10 p-2.5 rounded-full text-blue-400 shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-white mb-1">Neutral Witness</p>
                    <p className="text-xs text-slate-400 leading-relaxed">We do not assign credit scores. We simply preserve the facts of your agreements so they can speak for themselves.</p>
                </div>
            </div>

            {/* Data Sovereignty */}
            <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="bg-purple-500/10 p-2.5 rounded-full text-purple-400 shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-white mb-1">Data Sovereignty</p>
                    <p className="text-xs text-slate-400 leading-relaxed">We do not sell transaction data to advertisers, lenders, or third parties. Your business relationships are private.</p>
                </div>
            </div>

            {/* Forensic Security */}
            <div className="flex items-start gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="bg-amber-500/10 p-2.5 rounded-full text-amber-400 shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-white mb-1">Forensic Security</p>
                    <p className="text-xs text-slate-400 leading-relaxed">Protected by AES-256 encryption. Our infrastructure is designed for Section 65B (Indian Evidence Act) compliance.</p>
                </div>
            </div>

            {/* AI Philosophy */}
            <div className="md:col-span-2 flex items-start gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="bg-indigo-500/10 p-2.5 rounded-full text-indigo-400 shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-white mb-1">AI as an Assistant, Not a Judge</p>
                    <p className="text-xs text-slate-400 leading-relaxed">SAAKSHY AI analyzes patterns to help you prove your reliability. It does not make decisions for you, block access, or assign a 'character score'. It is purely a tool to summarize your digital reputation for your benefit.</p>
                </div>
            </div>

         </div>
      </div>
    </div>
  );
};
