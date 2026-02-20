
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById, addPayment, raiseDispute } from '../services/dataService';
import { getSessionUser } from '../services/authService';
import { generateRecordSummary } from '../services/geminiService';
import { TradeRecord, Language, EventType, RecordStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface RecordDetailProps {
  lang: Language;
}

export const RecordDetail: React.FC<RecordDetailProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<TradeRecord | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState('');
  const [aiTimestamp, setAiTimestamp] = useState<Date | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [paymentReference, setPaymentReference] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Dispute Modal State
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [processingDispute, setProcessingDispute] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
        if (id) {
            try {
                const foundRecord = await getRecordById(id);
                setRecord(foundRecord);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };
    fetchRecord();
  }, [id]);

  const handleAiSummary = async () => {
    if (!record) return;
    setAiLoading(true);
    const summary = await generateRecordSummary(record);
    setAiSummary(summary);
    setAiTimestamp(new Date());
    setAiLoading(false);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || !paymentAmount || !paymentDate) return;

    setProcessingPayment(true);
    try {
        await addPayment(record.id, parseFloat(paymentAmount), paymentDate, paymentReference);
        // Refresh record data
        const updated = await getRecordById(record.id);
        setRecord(updated);
        
        // Reset modal
        setShowPaymentModal(false);
        setPaymentAmount('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentReference('');
        
        // Reset AI summary as history changed
        setAiSummary('');
        setAiTimestamp(null);
    } catch (err) {
        console.error(err);
        alert("Failed to add payment");
    } finally {
        setProcessingPayment(false);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || !disputeReason) return;

    setProcessingDispute(true);
    try {
        const user = getSessionUser();
        await raiseDispute(record.id, disputeReason, user?.id || 'User');
        
        const updated = await getRecordById(record.id);
        setRecord(updated);
        
        setShowDisputeModal(false);
        setDisputeReason('');
        
        // Clear AI summary
        setAiSummary('');
        setAiTimestamp(null);
    } catch (err) {
        console.error(err);
        alert("Failed to raise dispute");
    } finally {
        setProcessingDispute(false);
    }
  };

  const getStatusBadge = (status: RecordStatus) => {
    switch (status) {
      case RecordStatus.PENDING_CONFIRMATION:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_pending}</span>
          </div>
        );
      case RecordStatus.CONFIRMED:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_confirmed}</span>
          </div>
        );
      case RecordStatus.DISPUTED:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_disputed}</span>
          </div>
        );
      case RecordStatus.SETTLED:
         return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/30 border border-slate-600 text-slate-300">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-wide">{t.status_settled}</span>
          </div>
        );
      default: return null;
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">{t.loading}</div>;
  if (!record) return <div className="p-10 text-center text-red-500">Record not found.</div>;

  const getEventDescription = (type: string, payload: any) => {
    switch (type) {
      case 'RecordCreated': return "Record Created & Stamped";
      case 'RecordConfirmed': return "Mutual Confirmation Received";
      case 'PaymentAdded': return `Payment of ₹${payload.amount} Added`;
      case 'DisputeRaised': return "Dispute Flag Raised";
      case 'RecordSettled': return "Record Fully Settled";
      default: return type;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'RecordCreated': return "bg-blue-500 border-blue-400";
      case 'RecordConfirmed': return "bg-emerald-500 border-emerald-400";
      case 'PaymentAdded': return "bg-purple-500 border-purple-400";
      case 'DisputeRaised': return "bg-red-500 border-red-400";
      case 'RecordSettled': return "bg-slate-500 border-slate-400";
      default: return "bg-slate-600 border-slate-500";
    }
  };

  const isPending = record.status === RecordStatus.PENDING_CONFIRMATION;
  const canDispute = record.status !== RecordStatus.SETTLED && record.status !== RecordStatus.DISPUTED;

  return (
    <div className="min-h-full pb-20 relative max-w-3xl mx-auto">
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
           </svg>
        </button>
        <h2 className="font-bold text-white">Record Details</h2>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Counterparty</p>
                    <h3 className="text-xl font-bold text-white">{record.counterpartyName}</h3>
                    <p className="text-sm text-slate-400 font-mono mt-0.5">+91 {record.counterpartyMobile}</p>
                </div>
                {getStatusBadge(record.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Original Amount</p>
                    <p className="text-lg font-bold text-slate-300">₹{record.originalAmount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-semibold">Balance Due</p>
                    <p className="text-lg font-bold text-blue-400">₹{record.remainingAmount.toLocaleString()}</p>
                </div>
            </div>
            
            {record.note && (
                <div className="mt-4 bg-slate-900/50 p-3 rounded-lg text-sm text-slate-400 italic border border-slate-700">
                    "{record.note}"
                </div>
            )}

            {isPending && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-200 leading-relaxed font-medium">
                        Waiting for confirmation. This record is not yet immutable. Payments cannot be added until confirmed.
                    </p>
                </div>
            )}

            <div className="flex gap-3 mt-4">
                {!isPending && record.status !== RecordStatus.DISPUTED && (
                    <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/30 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        {t.act_payment}
                    </button>
                )}
                
                {canDispute && (
                    <button 
                        onClick={() => setShowDisputeModal(true)}
                        className={`py-3 px-4 rounded-xl font-bold text-sm border shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2
                            ${isPending ? 'w-full bg-slate-800 text-red-400 border-red-500/30 hover:bg-red-500/10' : 'bg-slate-800 text-red-400 border-slate-700 hover:bg-red-500/10 hover:border-red-500/30'}
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {isPending ? 'Reject / Dispute' : 'Raise Dispute'}
                    </button>
                )}
            </div>
        </div>

        {record.paymentHistory.length > 0 && (
            <div>
                 <h3 className="font-bold text-white mb-3">Payment History</h3>
                 <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700 overflow-hidden shadow-sm">
                    {record.paymentHistory.map((payment, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">₹{payment.amount.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">
                                        Logged by {payment.loggedBy === record.creatorId ? 'Owner' : 'Counterparty'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                                <p className="text-[10px] text-slate-500">{new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        )}

        {/* AI Summary Section */}
        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4 mb-2 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    AI Event Summary
                </h3>
                {!aiSummary && (
                    <button 
                        onClick={handleAiSummary}
                        disabled={aiLoading}
                        className="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 font-bold hover:bg-indigo-500/20 disabled:opacity-50 transition-colors"
                    >
                        {aiLoading ? 'Analyzing...' : 'Generate'}
                    </button>
                )}
            </div>
            
            {aiSummary ? (
                <div className="animate-fade-in">
                    <p className="text-sm text-indigo-200 leading-relaxed italic bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/10 shadow-sm">"{aiSummary}"</p>
                    <div className="flex justify-between items-center mt-3 px-1">
                        <span className="text-[10px] text-indigo-400 font-medium">Generated: {aiTimestamp?.toLocaleTimeString()}</span>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-indigo-400/70">Get a neutral, AI-generated summary of this record's history.</p>
            )}
        </div>

        <div>
            <div className="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-white">{t.history_log}</h3>
            </div>

            <div className="relative pl-4 border-l-2 border-slate-700 ml-2 space-y-8">
                {record.events.map((event, index) => (
                    <div key={event.id} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 shadow-sm ${getEventColor(event.type)}`}></div>
                        
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-slate-200">{getEventDescription(event.type, event.payload)}</span>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                                    {new Date(event.timestamp).toLocaleDateString()} • {new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            
                            <div className="text-xs text-slate-500 mb-2">
                                Actor: <span className="font-mono bg-slate-900/50 px-1 rounded text-slate-400">{event.actorId === record.creatorId ? 'Owner' : 'Counterparty/System'}</span>
                            </div>

                            <div className="bg-slate-900/50 p-2 rounded border border-slate-700 flex items-center gap-2 overflow-hidden">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <code className="text-[10px] font-mono text-slate-600 truncate w-full">
                                    HASH: {event.hash}
                                </code>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                 <p className="text-[10px] text-slate-600 uppercase tracking-widest">End of History</p>
                 <div className="w-1 h-8 bg-gradient-to-b from-slate-800 to-transparent mx-auto mt-2"></div>
            </div>
        </div>
      </div>

      {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}>
              <div 
                className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up sm:animate-scale-in" 
                onClick={e => e.stopPropagation()}
              >
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Add Payment</h3>
                      <button onClick={() => setShowPaymentModal(false)} className="p-2 bg-slate-700 rounded-full text-slate-400 hover:bg-slate-600 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                      </button>
                  </div>
                  
                  <form onSubmit={handleAddPayment} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Payment Amount (₹)</label>
                          <input 
                            autoFocus
                            type="number" 
                            max={record.remainingAmount}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg text-white"
                            placeholder="0"
                            value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                          <input 
                            type="date" 
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-white"
                            value={paymentDate}
                            onChange={e => setPaymentDate(e.target.value)}
                          />
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Reference (Optional)</label>
                          <input 
                            type="text" 
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm text-white"
                            placeholder="e.g. UPI Ref, Cash, Check"
                            value={paymentReference}
                            onChange={e => setPaymentReference(e.target.value)}
                          />
                      </div>

                      <div className="pt-2">
                          <button 
                            type="submit" 
                            disabled={!paymentAmount || !paymentDate || processingPayment}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                             {processingPayment ? 'Processing...' : 'Confirm Payment'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showDisputeModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDisputeModal(false)}>
              <div 
                className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up sm:animate-scale-in" 
                onClick={e => e.stopPropagation()}
              >
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Raise Dispute
                      </h3>
                      <button onClick={() => setShowDisputeModal(false)} className="p-2 bg-slate-700 rounded-full text-slate-400 hover:bg-slate-600 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                      </button>
                  </div>
                  
                  <form onSubmit={handleRaiseDispute} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-2">Reason for Dispute</label>
                          <textarea 
                            autoFocus
                            rows={3}
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm text-white"
                            placeholder="e.g. Amount mismatch, goods returned, etc."
                            value={disputeReason}
                            onChange={e => setDisputeReason(e.target.value)}
                          />
                      </div>
                      
                      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                          <p className="text-xs text-red-200 leading-relaxed">
                              <strong>Note:</strong> Raising a dispute flags the record for both parties. It does not delete the history but marks the current status as 'Disputed' until resolved.
                          </p>
                      </div>

                      <div className="pt-2">
                          <button 
                            type="submit" 
                            disabled={!disputeReason || processingDispute}
                            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                             {processingDispute ? 'Processing...' : 'Submit Dispute'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
