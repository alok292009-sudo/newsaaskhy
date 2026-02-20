
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordByLink, confirmRecord, raiseDispute } from '../services/dataService';
import { TradeRecord, Language, RecordStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface ConfirmRecordProps {
  lang: Language;
}

export const ConfirmRecord: React.FC<ConfirmRecordProps> = ({ lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<TradeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for actions
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [disputed, setDisputed] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
        if (id) {
            try {
                const found = await getRecordByLink(id);
                setRecord(found);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
    };
    fetchLink();
  }, [id]);

  const handleConfirm = async () => {
      if (!record) return;
      setProcessing(true);
      
      try {
          // Here we pass the Counterparty name as the "actor" since they are clicking the link
          await confirmRecord(record.id, record.counterpartyName || 'Counterparty');
          setConfirmed(true);
      } catch (err: any) {
          setError(err.message || "Confirmation failed");
      } finally {
          setProcessing(false);
      }
  };

  const handleDispute = async () => {
      if (!record || !disputeReason) return;
      setProcessing(true);
      
      try {
          await raiseDispute(record.id, disputeReason, record.counterpartyName || 'Counterparty');
          setDisputed(true);
      } catch (err: any) {
          setError(err.message || "Failed to raise dispute");
      } finally {
          setProcessing(false);
      }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading Record...</div>;
  if (!record) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Record not found or invalid link.</div>;

  // View: Success (Confirmed)
  if (confirmed) {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Record Locked</h2>
              <p className="text-slate-400 max-w-xs mb-8">
                  You have successfully confirmed this transaction. It is now part of the permanent immutable history.
              </p>
              <button onClick={() => navigate('/')} className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold">Go to Dashboard</button>
          </div>
      );
  }

  // View: Disputed
  if (disputed) {
      return (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Dispute Raised</h2>
              <p className="text-slate-400 max-w-xs mb-8">
                  The counterparty has been notified. The record is flagged but remains in history as evidence of the attempt.
              </p>
              <button onClick={() => navigate('/')} className="px-8 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl font-bold">Close</button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
        
        <div className="w-full max-w-md relative z-10">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Verification Request
                </div>
                <h1 className="text-2xl font-bold text-white">Confirm Transaction</h1>
                <p className="text-slate-500 text-sm mt-1">Please review the details below carefully.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
                <div className="absolute top-4 right-4 text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Initiated By</p>
                        <p className="text-lg font-bold text-white">Counterparty (Party A)</p>
                    </div>

                    <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Amount Due</p>
                        <p className="text-3xl font-bold text-white font-mono">₹{record.originalAmount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-1">Due Date: {new Date(record.dueDate).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-4 text-sm text-slate-400">
                         <div className="flex-1">
                             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Role</p>
                             <p className="font-medium text-white">{record.role === 'SELLER' ? 'You are the Buyer' : 'You are the Seller'}</p>
                         </div>
                         {record.note && (
                             <div className="flex-1">
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Note</p>
                                 <p className="font-medium text-white truncate">{record.note}</p>
                             </div>
                         )}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                        <span className="font-bold text-amber-400 block mb-0.5">Permanent Action</span>
                        After confirmation, this record becomes permanent and cannot be edited by either party.
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {!showDisputeInput ? (
                    <>
                        <button 
                            onClick={handleConfirm}
                            disabled={processing}
                            className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/40 hover:bg-emerald-400 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {processing ? 'Locking Record...' : 'Confirm & Lock'}
                        </button>
                        
                        <button 
                            onClick={() => setShowDisputeInput(true)}
                            disabled={processing}
                            className="w-full py-4 bg-slate-800 text-red-400 border border-slate-700 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all active:scale-[0.98]"
                        >
                            Dispute / Reject
                        </button>
                    </>
                ) : (
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 animate-fade-in">
                        <label className="block text-xs font-bold text-red-400 uppercase tracking-wide mb-2">Reason for Dispute</label>
                        <textarea 
                            autoFocus
                            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-red-500 mb-3"
                            rows={2}
                            placeholder="e.g. Amount is incorrect, Wrong date..."
                            value={disputeReason}
                            onChange={e => setDisputeReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setShowDisputeInput(false)}
                                className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-lg font-bold text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDispute}
                                disabled={!disputeReason}
                                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-red-900/30 disabled:opacity-50"
                            >
                                Submit Dispute
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
