
import React, { useMemo } from 'react';
import { TradeRecord, RecordStatus, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { getCounterpartyScore } from '../services/dataService';

interface RecordCardProps {
  record: TradeRecord;
  lang: Language;
  onClick: () => void;
}

export const RecordCard: React.FC<RecordCardProps> = ({ record, lang, onClick }) => {
  const t = TRANSLATIONS[lang];

  // Calculate Trust Score on the fly
  const trustScore = useMemo(() => getCounterpartyScore(record.counterpartyMobile), [record.counterpartyMobile]);
  
  const getScoreColor = (score: number) => {
      if (score >= 750) return 'text-emerald-400';
      if (score >= 600) return 'text-amber-400';
      return 'text-red-400';
  };

  const getStatusBadge = (status: RecordStatus) => {
    switch (status) {
      case RecordStatus.PENDING_CONFIRMATION:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_pending}</span>
          </div>
        );
      case RecordStatus.CONFIRMED:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_confirmed}</span>
          </div>
        );
      case RecordStatus.DISPUTED:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_disputed}</span>
          </div>
        );
      case RecordStatus.SETTLED:
         return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/30 border border-slate-600 text-slate-300">
             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_settled}</span>
          </div>
        );
      default: 
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  const isOverdue = record.dueDate && record.dueDate < new Date().toISOString().split('T')[0] && record.status !== RecordStatus.SETTLED;

  const handleReminder = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // Construct dynamic confirmation link supporting hash routing
      const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      const link = `${baseUrl}#/confirm/${record.id}`;

      let message = "";
      if (record.status === RecordStatus.PENDING_CONFIRMATION) {
          message = `Namaste ${record.counterpartyName}, please confirm this transaction record on SAAKSHY to avoid disputes. Link: ${link}`;
      } else {
          message = `Namaste ${record.counterpartyName}, a friendly reminder regarding payment of ₹${record.remainingAmount} on SAAKSHY. Link: ${link}`;
      }
      
      const url = `https://wa.me/91${record.counterpartyMobile}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  return (
    <div 
        onClick={onClick} 
        className="group relative bg-slate-800/40 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 shadow-sm mb-3 cursor-pointer transition-all duration-500 ease-out hover:bg-slate-800/60 hover:border-slate-600 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:rotate-x-2 preserve-3d"
        style={{ transformStyle: 'preserve-3d' }}
    >
      
      {/* 3D Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none rounded-xl"></div>
      
      {/* Overdue Indicator Strip */}
      {isOverdue && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] rounded-l-xl"></div>}

      <div className="flex justify-between items-start mb-2 pl-2 relative z-10" style={{ transform: 'translateZ(10px)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-lg drop-shadow-sm group-hover:text-blue-200 transition-colors">{record.counterpartyName}</h3>
            {/* Trust Score Badge */}
            <div className="flex items-center gap-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${getScoreColor(trustScore)}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className={`text-[10px] font-bold ${getScoreColor(trustScore)}`}>{trustScore}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{new Date(record.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className="block font-bold text-xl text-white drop-shadow-sm group-hover:scale-110 transition-transform origin-right">₹{record.remainingAmount.toLocaleString()}</span>
          <span className={`text-[10px] uppercase tracking-wider font-bold ${record.role === 'SELLER' ? 'text-emerald-400' : 'text-red-400'}`}>
            {record.role === 'SELLER' ? 'TO RECEIVE' : 'TO PAY'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4 pl-2 relative z-10" style={{ transform: 'translateZ(5px)' }}>
        <div className="flex gap-2 items-center">
            
            {getStatusBadge(record.status)}
            
            {record.dueDate && (
                <span className={`text-xs flex items-center gap-1.5 font-medium ml-2 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(record.dueDate).toLocaleDateString()}
                </span>
            )}
        </div>

        {/* Action Button: Reminder (Visible for Not Settled/Disputed) */}
        {record.status !== RecordStatus.SETTLED && record.status !== RecordStatus.DISPUTED && (
            <button 
                onClick={handleReminder}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-500/50 rounded-full text-green-400 hover:bg-green-500 hover:text-white transition-all shadow-lg hover:shadow-green-500/30 group/btn"
                title={t.btn_remind}
            >
                <span className="text-xs font-bold">Remind</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            </button>
        )}
      </div>
    </div>
  );
};
