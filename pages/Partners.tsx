
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecords } from '../services/dataService';
import { TradeRecord, Language, RecordStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface PartnersProps {
  lang: Language;
}

interface PartnerStats {
  name: string;
  mobile: string;
  totalVolume: number;
  outstanding: number;
  dealCount: number;
  lastTradeDate: number;
  onTimeCount: number;
  settledCount: number;
  disputeCount: number;
  onTimePercentage: number;
}

export const Partners: React.FC<PartnersProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();
  const [partners, setPartners] = useState<PartnerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const records = await getRecords();
        const statsMap: Record<string, PartnerStats> = {};

        records.forEach(r => {
            const key = r.counterpartyMobile; // Unique identifier
            if (!statsMap[key]) {
                statsMap[key] = {
                    name: r.counterpartyName,
                    mobile: r.counterpartyMobile,
                    totalVolume: 0,
                    outstanding: 0,
                    dealCount: 0,
                    lastTradeDate: 0,
                    onTimeCount: 0,
                    settledCount: 0,
                    disputeCount: 0,
                    onTimePercentage: 0
                };
            }
            
            const p = statsMap[key];
            p.totalVolume += r.originalAmount;
            if (r.status !== RecordStatus.SETTLED && r.status !== RecordStatus.DISPUTED) {
                p.outstanding += r.remainingAmount;
            }
            p.dealCount++;
            if (r.createdAt > p.lastTradeDate) p.lastTradeDate = r.createdAt;
            
            // Check for dispute history (either current status or in events)
            const hasDispute = r.status === RecordStatus.DISPUTED || r.events?.some(e => e.type === 'DisputeRaised');
            if (hasDispute) {
                p.disputeCount++;
            }

            if (r.status === RecordStatus.SETTLED) {
                p.settledCount++;
                
                // Check if settled on time
                const dueDate = new Date(r.dueDate).getTime();
                // Find last payment date
                const lastPayment = r.paymentHistory?.length > 0 
                    ? r.paymentHistory.sort((a, b) => b.date - a.date)[0] 
                    : null;
                
                const settledDate = lastPayment ? lastPayment.date : r.createdAt; // Fallback if no payment history
                
                // Allow a 1-day buffer for "on time"
                if (settledDate <= dueDate + 86400000) {
                    p.onTimeCount++;
                }
            }
        });

        // Calculate percentages and sort
        const partnerList = Object.values(statsMap).map(p => ({
            ...p,
            onTimePercentage: p.settledCount > 0 ? Math.round((p.onTimeCount / p.settledCount) * 100) : 0
        })).sort((a, b) => b.totalVolume - a.totalVolume);

        setPartners(partnerList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mobile.includes(searchTerm)
  );

  return (
    <div className="min-h-full pb-20 max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
           </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Counterparty List</h2>
      </div>

      {/* Top Insights */}
      <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-800 p-5 rounded-2xl border border-indigo-500/20 shadow-lg">
              <p className="text-xs text-indigo-300 uppercase font-bold tracking-wider mb-1">Total Partners</p>
              <p className="text-3xl font-bold text-white">{partners.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900 to-slate-800 p-5 rounded-2xl border border-emerald-500/20 shadow-lg">
              <p className="text-xs text-emerald-300 uppercase font-bold tracking-wider mb-1">Active Relationships</p>
              <p className="text-3xl font-bold text-white">{partners.filter(p => p.outstanding > 0).length}</p>
          </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search partners by name or mobile..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
            <div className="text-center py-10 text-slate-500">Loading partners...</div>
        ) : filteredPartners.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No partners found.</div>
        ) : (
            filteredPartners.map(partner => (
                <div key={partner.mobile} className="group bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
                    {/* Hover Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-5 relative z-10">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-lg font-bold text-white shadow-inner border border-slate-600">
                                {partner.name.charAt(0)}
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-white text-xl tracking-tight">{partner.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <p className="text-sm text-slate-400 font-mono tracking-wide">+91 {partner.mobile}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-right">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${partner.outstanding > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${partner.outstanding > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                {partner.outstanding > 0 ? 'Active' : 'Settled'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Key Metrics - Highlighted */}
                    <div className="grid grid-cols-3 gap-4 mb-5 relative z-10">
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Outstanding</p>
                            <p className={`text-lg font-black ${partner.outstanding > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                                ₹{partner.outstanding.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Total Volume</p>
                            <p className="text-lg font-bold text-slate-300">₹{(partner.totalVolume / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Deals</p>
                            <p className="text-lg font-bold text-white">{partner.dealCount}</p>
                        </div>
                    </div>

                    {/* Insights Section */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs relative z-10">
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${partner.onTimePercentage >= 80 ? 'bg-emerald-500' : partner.onTimePercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></div>
                             <span className="text-slate-400 font-medium">Payment Behavior:</span>
                             <span className={`font-bold ${partner.onTimePercentage >= 80 ? 'text-emerald-400' : partner.onTimePercentage >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                {partner.settledCount > 0 ? `${partner.onTimePercentage}% On-Time` : 'No Data'}
                             </span>
                        </div>
                        {partner.disputeCount > 0 && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 rounded border border-red-500/20">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                 </svg>
                                 <span className="font-bold text-red-400">
                                    {partner.disputeCount} Dispute{partner.disputeCount > 1 ? 's' : ''}
                                 </span>
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
