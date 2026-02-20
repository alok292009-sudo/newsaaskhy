
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecordCard } from '../components/RecordCard';
import { getRecords } from '../services/dataService';
import { getSessionUser } from '../services/authService';
import { TradeRecord, Language, RecordStatus, EventType } from '../types';
import { TRANSLATIONS } from '../constants';

interface DashboardProps {
  lang: Language;
}

// --- SKELETON COMPONENT ---
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5 relative overflow-hidden h-[140px]">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                      <div className="h-16 w-16 bg-slate-500/20 rounded-full"></div>
                  </div>
                  <div className="h-3 w-24 bg-slate-700/50 rounded mb-4 mt-1"></div>
                  <div className="h-9 w-16 bg-slate-700 rounded mb-3"></div>
                  <div className="h-2 w-32 bg-slate-700/30 rounded"></div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <div className="flex gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
                  <div className="h-9 w-32 bg-slate-800 rounded-lg"></div>
                  <div className="h-9 w-24 bg-slate-800/50 rounded-lg"></div>
                  <div className="h-9 w-24 bg-slate-800/50 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 relative">
                          <div className="flex justify-between mb-4">
                              <div className="space-y-2">
                                  <div className="h-4 w-32 bg-slate-700 rounded"></div>
                                  <div className="h-3 w-20 bg-slate-700/50 rounded"></div>
                              </div>
                              <div className="h-8 w-24 bg-slate-700 rounded"></div>
                          </div>
                          <div className="flex justify-between mt-8 items-end">
                               <div className="h-6 w-20 bg-slate-700/50 rounded"></div>
                               <div className="h-8 w-8 rounded-full bg-slate-700/50"></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
          <div className="space-y-6">
              <div className="h-40 bg-slate-800/40 rounded-2xl border border-slate-700/50 p-5">
                   <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded-full bg-slate-700"></div>
                       <div className="h-3 w-24 bg-slate-700 rounded"></div>
                   </div>
                   <div className="space-y-2">
                       <div className="h-2 w-full bg-slate-700/50 rounded"></div>
                       <div className="h-2 w-5/6 bg-slate-700/50 rounded"></div>
                       <div className="h-2 w-4/6 bg-slate-700/50 rounded"></div>
                   </div>
              </div>
              
              <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
                  <div className="h-3 w-24 bg-slate-700/50 rounded mb-4"></div>
                  <div className="space-y-2">
                      {[1, 2].map(k => (
                          <div key={k} className="h-14 w-full bg-slate-700/20 rounded-xl border border-slate-700/30 flex items-center px-3 gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-700/40"></div>
                              <div className="h-3 w-32 bg-slate-700/40 rounded"></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();
  const user = getSessionUser();
  
  // State
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState<TradeRecord[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'ATTENTION' | 'UPCOMING' | 'HISTORY'>('ATTENTION');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Single Fetch Optimization
  useEffect(() => {
    const fetchData = async () => {
        try {
            const records = await getRecords();
            setAllRecords(records);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };
    
    if (user) {
        fetchData();
    }
  }, [user]);

  // --- Derived Data (Computed Client-Side for Speed) ---

  // 1. Stats Overview
  const stats = useMemo(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      let overdueCount = 0, overdueAmount = 0;
      let pendingCount = 0;
      let dueTodayCount = 0, dueTodayAmount = 0;
      let disputedCount = 0;
      
      allRecords.forEach(r => {
          if (r.status === RecordStatus.PENDING_CONFIRMATION) pendingCount++;
          if (r.status === RecordStatus.DISPUTED) disputedCount++;
          
          if (r.status === RecordStatus.CONFIRMED && r.dueDate) {
              if (r.dueDate < today) {
                  overdueCount++;
                  overdueAmount += r.remainingAmount;
              }
              if (r.dueDate === today) {
                  dueTodayCount++;
                  dueTodayAmount += r.remainingAmount;
              }
          }
      });

      return { overdueCount, overdueAmount, pendingCount, dueTodayCount, dueTodayAmount, disputedCount };
  }, [allRecords]);

  // 2. Behavioral Trust Snapshot
  const trustSnapshot = useMemo(() => {
        const settled = allRecords.filter(r => r.status === RecordStatus.SETTLED);
        const uniquePartners = new Set(allRecords.map(r => r.counterpartyMobile)).size;
        
        let onTimeCount = 0;
        let totalDelayDays = 0;
        let delayedCount = 0;

        if (settled.length === 0) {
             return { onTime: 100, avgDelay: 0, relationships: uniquePartners };
        }

        settled.forEach(r => {
            const settleEvent = r.events?.find(e => e.type === EventType.RECORD_SETTLED);
            if (settleEvent && r.dueDate) {
                const settledAt = settleEvent.timestamp;
                const dueDate = new Date(r.dueDate).getTime() + (24 * 60 * 60 * 1000); 
                
                if (settledAt <= dueDate) {
                    onTimeCount++;
                } else {
                    const diffMs = settledAt - dueDate;
                    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    totalDelayDays += days;
                    delayedCount++;
                }
            } else {
                onTimeCount++;
            }
        });

        const onTime = Math.round((onTimeCount / settled.length) * 100);
        const avgDelay = delayedCount > 0 ? Math.round(totalDelayDays / delayedCount) : 0;

        return { onTime, avgDelay, relationships: uniquePartners };
  }, [allRecords]);

  // 4. Recent Activity Feed
  const recentActivity = useMemo(() => {
      const events = allRecords.flatMap(r => {
          if (!r.events) return [];
          return r.events.map(e => {
              let description = "";
              let amount = undefined;
              if (e.type === 'RecordCreated') { 
                  description = `New Record with ${r.counterpartyName}`;
                  amount = e.payload?.amount ? parseFloat(e.payload.amount) : undefined;
              } else if (e.type === 'RecordConfirmed') {
                  description = `Confirmed: ${r.counterpartyName}`;
              } else if (e.type === 'PaymentAdded') {
                  description = `Payment from ${r.counterpartyName}`;
                  amount = e.payload?.amount ? parseFloat(e.payload.amount) : undefined;
              } else if (e.type === 'DisputeRaised') {
                  description = `Dispute Flagged: ${r.counterpartyName}`;
              } else if (e.type === 'RecordSettled') {
                  description = `Settled: ${r.counterpartyName}`;
              }
              return {
                  id: e.id || Math.random().toString(),
                  timestamp: e.timestamp,
                  description,
                  amount,
                  type: e.type
              };
          });
      });
      return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [allRecords]);

  // 5. Top Partners
  const topPartners = useMemo(() => {
      const partnerStats: Record<string, {name: string, count: number}> = {};
      allRecords.forEach(r => {
          if (!partnerStats[r.counterpartyName]) {
              partnerStats[r.counterpartyName] = { name: r.counterpartyName, count: 0 };
          }
          partnerStats[r.counterpartyName].count++;
      });
      return Object.values(partnerStats).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [allRecords]);

  // 6. Filtered List
  const filteredRecords = useMemo(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      let filtered = allRecords;

      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(r => 
              (r.counterpartyName || '').toLowerCase().includes(q) || 
              (r.originalAmount || '').toString().includes(q) ||
              (r.remainingAmount || '').toString().includes(q) ||
              (r.note || '').toLowerCase().includes(q)
          );
      }

      switch (activeTab) {
          case 'ATTENTION':
              return filtered.filter(r => 
                  (r.status === RecordStatus.PENDING_CONFIRMATION) ||
                  (r.status === RecordStatus.DISPUTED) ||
                  (r.status === RecordStatus.CONFIRMED && r.dueDate && r.dueDate <= today)
              ).sort((a, b) => (a.dueDate || '') > (b.dueDate || '') ? 1 : -1);
          case 'UPCOMING':
              return filtered.filter(r => 
                   r.status === RecordStatus.CONFIRMED && 
                   r.dueDate && r.dueDate > today
              ).sort((a, b) => (a.dueDate || '') > (b.dueDate || '') ? 1 : -1);
          case 'HISTORY':
              return filtered.filter(r => r.status === RecordStatus.SETTLED).slice(0, 10);
          default:
              return filtered;
      }
  }, [allRecords, activeTab, searchQuery]);

  if (!user) return null;
  
  if (loading) return (
      <div className="min-h-full">
          <div className="bg-slate-900/40 border-b border-slate-800/50 px-4 py-4 sticky top-0 z-30 flex justify-between">
              <div className="h-8 w-32 bg-slate-800 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-slate-800 rounded animate-pulse hidden md:block"></div>
          </div>
          <DashboardSkeleton />
      </div>
  );

  return (
    <div className="min-h-full pb-10 relative">
      
      {/* --- HEADER --- */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/50 px-4 md:px-8 py-4 sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight drop-shadow-sm flex items-center gap-2">
                    Dashboard
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </h2>
                <p className="text-xs text-slate-400">Financial Infrastructure • Live</p>
            </div>
            
            <div className="flex-1 max-w-md w-full relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-700/50 rounded-xl leading-5 bg-slate-800/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition-all shadow-inner"
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <Link to="/create" className="hidden md:flex px-5 py-2.5 bg-blue-600 rounded-xl text-sm text-white font-bold hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all items-center gap-2 group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Record</span>
            </Link>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-8 animate-fade-in-up">

          {/* --- 1. STATS OVERVIEW (Cards) --- */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              
              {/* CARD 1: ACTIVE */}
              <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-sm hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Active</p>
                  <p className="text-3xl font-black text-white mt-2 drop-shadow-sm">{allRecords.length}</p>
                  <div className="mt-3 text-[10px] text-emerald-400/80 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live Sync
                  </div>
              </div>

              {/* CARD 2: ACTION REQUIRED */}
              <div className="bg-gradient-to-br from-amber-900/10 to-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-amber-500/20 shadow-sm hover:border-amber-500/40 hover:bg-slate-800/60 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-[10px] font-bold text-amber-500/90 uppercase tracking-widest">Needs Attention</p>
                  <p className="text-3xl font-black text-amber-500 mt-2 drop-shadow-sm">{stats.overdueCount + stats.pendingCount + stats.disputedCount}</p>
                  <div className="mt-3 flex gap-2">
                      {stats.overdueCount > 0 && <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-bold border border-red-500/20">{stats.overdueCount} Overdue</span>}
                      {stats.pendingCount > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/20">{stats.pendingCount} Pending</span>}
                  </div>
              </div>

              {/* CARD 3: DUE TODAY */}
              <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-sm hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:-translate-y-2 duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.312-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.312.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>
                  </div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Due Today</p>
                  <p className="text-3xl font-black text-blue-400 mt-2 drop-shadow-sm">₹{stats.dueTodayAmount.toLocaleString()}</p>
                  <div className="mt-3 text-[10px] text-blue-300/70 font-medium">
                      {stats.dueTodayCount > 0 ? `${stats.dueTodayCount} items due` : 'No obligations'}
                  </div>
              </div>

              {/* CARD 4: BEHAVIORAL SNAPSHOT */}
              <div className="bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-sm hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all duration-300 group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-105 duration-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   </div>
                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">On-Time Rate</p>
                   <div className="flex items-end gap-3 mt-2">
                       <p className="text-3xl font-black text-white drop-shadow-sm">{trustSnapshot.onTime}%</p>
                       <p className="text-xs text-slate-400 mb-1.5 font-mono">{trustSnapshot.avgDelay}d Avg Delay</p>
                   </div>
                   <div className="w-full bg-slate-700/50 h-1 mt-3 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${trustSnapshot.onTime}%` }}></div>
                   </div>
              </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* --- LEFT COLUMN (MAIN) --- */}
              <div className="lg:col-span-2 space-y-6">
                  
                  {/* TABS - Modern Pill Design */}
                  <div className="flex items-center gap-1 p-1 bg-slate-900/60 backdrop-blur-sm rounded-xl border border-slate-800 w-full sm:w-fit overflow-x-auto shadow-inner">
                      {['ATTENTION', 'UPCOMING', 'HISTORY'].map((tab) => (
                          <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`relative px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap z-10 ${activeTab === tab ? 'text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                              {activeTab === tab && (
                                  <div className="absolute inset-0 bg-slate-700 rounded-lg -z-10 animate-fade-in"></div>
                              )}
                              {tab === 'ATTENTION' ? 'Needs Attention' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                              {tab === 'ATTENTION' && (stats.overdueCount + stats.pendingCount + stats.disputedCount) > 0 && (
                                  <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">{stats.overdueCount + stats.pendingCount + stats.disputedCount}</span>
                              )}
                          </button>
                      ))}
                  </div>

                  {/* RECORD LIST */}
                  <div className="space-y-4">
                      {filteredRecords.length > 0 ? (
                          filteredRecords.map((record, idx) => (
                              <div key={record.id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                  <RecordCard 
                                      record={record} 
                                      lang={lang} 
                                      onClick={() => navigate(`/record/${record.id}`)}
                                  />
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-24 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 animate-fade-in flex flex-col items-center justify-center">
                              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-700 ring-1 ring-slate-800">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                  </svg>
                              </div>
                              <p className="text-slate-400 font-bold text-sm">No records found here.</p>
                              {activeTab === 'ATTENTION' && (
                                  <p className="text-xs text-emerald-500 mt-2 font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">You are all caught up!</p>
                              )}
                          </div>
                      )}
                  </div>
              </div>

              {/* --- RIGHT COLUMN (WIDGETS) --- */}
              <div className="space-y-6">
                  
                  {/* AI INSIGHT WIDGET - Pulsating */}
                  <div className="bg-gradient-to-br from-indigo-900/30 via-slate-900/50 to-slate-900/30 p-6 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.1)] relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-500">
                      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                               <div className="relative">
                                   <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 z-10 relative">
                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                       </svg>
                                   </div>
                                   <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-30"></div>
                               </div>
                               <h3 className="font-bold text-indigo-300 text-sm tracking-wide">AI Insight</h3>
                          </div>
                          <p className="text-sm text-indigo-100/90 leading-relaxed italic border-l-2 border-indigo-500/30 pl-3">
                              {stats.pendingCount > 0 
                                ? `"You have ${stats.pendingCount} records waiting for confirmation. Sending a WhatsApp reminder via the 'Share Link' usually speeds up approval by 40%."`
                                : `"All pending records are cleared. Maintaining this streak improves your on-time payment behavior profile."`
                              }
                          </p>
                      </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50">
                      <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                           <Link to="/create" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700/50 hover:bg-slate-700 hover:border-slate-600 transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                               <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-500/20">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                   </svg>
                               </div>
                               <div>
                                   <span className="text-sm font-bold text-slate-300 group-hover:text-white block">Create New Record</span>
                                   <span className="text-[10px] text-slate-500 group-hover:text-slate-400">Add a transaction</span>
                               </div>
                           </Link>
                           <Link to="/profile" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 border border-slate-700/50 hover:bg-slate-700 hover:border-slate-600 transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5">
                               <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors border border-emerald-500/20">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                   </svg>
                               </div>
                               <div>
                                   <span className="text-sm font-bold text-slate-300 group-hover:text-white block">Trust Profile</span>
                                   <span className="text-[10px] text-slate-500 group-hover:text-slate-400">View analytics</span>
                               </div>
                           </Link>
                      </div>
                  </div>

                  {/* ACTIVITY FEED */}
                  <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 border border-slate-700/50">
                       <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-4">Live Activity</h3>
                       <div className="space-y-5 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800"></div>
                            
                            {recentActivity.map(event => (
                                <div key={event.id} className="relative pl-8 group">
                                    <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center z-10 transition-colors group-hover:border-slate-600`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${event.type.includes('Payment') ? 'bg-emerald-500' : 'bg-blue-500'} group-hover:scale-125 transition-transform`}></div>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium leading-snug group-hover:text-white transition-colors">{event.description}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-xs text-slate-500 pl-8">No recent activity found.</p>
                            )}
                       </div>
                  </div>

                  {/* COUNTERPARTY INTELLIGENCE */}
                  <div>
                      <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-3">Top Partners</h3>
                      <div className="space-y-2">
                          {topPartners.map((partner, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors cursor-default border border-transparent hover:border-slate-800">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                          {partner.name.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="text-xs font-bold text-slate-300">{partner.name}</p>
                                          <p className="text-[10px] text-slate-500">{partner.count} Interactions</p>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          {topPartners.length === 0 && (
                              <p className="text-xs text-slate-500 italic p-2">No partners yet.</p>
                          )}
                      </div>
                  </div>

              </div>
          </div>
      </div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; opacity: 0; }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  );
};
