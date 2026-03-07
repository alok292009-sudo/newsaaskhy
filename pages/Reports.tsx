
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Language, TradeRecord, RecordStatus, User } from '../types';
import { TRANSLATIONS } from '../constants';
import { getRecords } from '../services/dataService';
import { getSessionUser } from '../services/authService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import html2canvas from 'html2canvas';

interface ReportsProps {
  lang: Language;
}

interface DossierStats {
  totalVolume: number;
  totalDeals: number;
  activePartners: number;
  trustScore: number;
  onTimePercentage: number;
  disputeCount: number;
  accountAgeDays: number;
}

const TradeDossier = ({ stats, user, records }: { stats: DossierStats | null, user: User | null, records: TradeRecord[] }) => {
  if (!stats || !user) return null;

  const recentTrades = records
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  return (
    <div id="trade-dossier" style={{
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      padding: '40px',
      width: '210mm',
      minHeight: '297mm',
      backgroundColor: '#ffffff',
      color: '#000000',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '4px solid #0f172a',
        paddingBottom: '24px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
      }}>
        <div>
           <h1 style={{
             fontSize: '36px',
             fontWeight: '900',
             textTransform: 'uppercase',
             letterSpacing: '0.05em',
             color: '#0f172a',
             margin: 0,
             lineHeight: 1.2
           }}>Trade Dossier</h1>
           <p style={{
             fontSize: '14px',
             marginTop: '8px',
             fontWeight: '500',
             letterSpacing: '0.1em',
             textTransform: 'uppercase',
             color: '#64748b',
             margin: '8px 0 0 0'
           }}>Verified Trust Report • SAAKSHY Protocol</p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: '700', fontSize: '20px', color: '#0f172a', margin: 0 }}>{user.name}</p>
            <p style={{ fontSize: '16px', color: '#475569', margin: 0 }}>{user.business?.businessName || 'Business Entity'}</p>
            <p style={{ fontSize: '12px', marginTop: '8px', fontFamily: 'monospace', color: '#94a3b8', margin: '8px 0 0 0' }}>Generated: {new Date().toLocaleDateString()}</p>
            <p style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', margin: 0 }}>ID: {user.id.substring(0, 8)}...</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '8px',
          color: '#94a3b8',
          margin: '0 0 16px 0'
        }}>Executive Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
           <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', color: '#64748b', margin: '0 0 4px 0' }}>Trust Score</p>
              <p style={{ fontSize: '36px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{stats.trustScore}</p>
              <div style={{ width: '100%', height: '6px', marginTop: '8px', borderRadius: '9999px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                  <div style={{ height: '100%', width: `${stats.trustScore}%`, backgroundColor: '#0f172a' }}></div>
              </div>
           </div>
           <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', color: '#64748b', margin: '0 0 4px 0' }}>Total Volume</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>₹{(stats.totalVolume / 1000).toFixed(1)}k</p>
              <p style={{ fontSize: '10px', marginTop: '4px', color: '#94a3b8', margin: '4px 0 0 0' }}>Lifetime Value</p>
           </div>
           <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', color: '#64748b', margin: '0 0 4px 0' }}>Reliability</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{stats.onTimePercentage}%</p>
              <p style={{ fontSize: '10px', marginTop: '4px', color: '#94a3b8', margin: '4px 0 0 0' }}>On-Time Payments</p>
           </div>
           <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', color: '#64748b', margin: '0 0 4px 0' }}>Network</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{stats.activePartners}</p>
              <p style={{ fontSize: '10px', marginTop: '4px', color: '#94a3b8', margin: '4px 0 0 0' }}>Active Partners</p>
           </div>
        </div>
      </div>

      {/* Risk Profile */}
      <div style={{ marginBottom: '40px' }}>
         <h2 style={{
           fontSize: '14px',
           fontWeight: '700',
           textTransform: 'uppercase',
           letterSpacing: '0.1em',
           marginBottom: '16px',
           borderBottom: '1px solid #e2e8f0',
           paddingBottom: '8px',
           color: '#94a3b8',
           margin: '0 0 16px 0'
         }}>Risk Profile</h2>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>Account Age</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{stats.accountAgeDays} Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>Total Deals</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{stats.totalDeals}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>Dispute History</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: stats.disputeCount > 0 ? '#dc2626' : '#059669' }}>
                        {stats.disputeCount} Record(s)
                    </span>
                </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #f1f5f9',
              fontSize: '12px',
              lineHeight: '1.625',
              backgroundColor: '#f8fafc',
              color: '#64748b'
            }}>
                <p style={{ fontWeight: '700', marginBottom: '8px', color: '#334155', margin: '0 0 8px 0' }}>Assessment Note:</p>
                This entity has maintained a {stats.onTimePercentage}% on-time payment record over {stats.totalDeals} transactions. 
                {stats.disputeCount === 0 ? " No disputes have been recorded against this profile." : ` ${stats.disputeCount} dispute(s) have been noted in the history.`}
                The verified volume indicates a {stats.totalVolume > 100000 ? "high" : "growing"} level of commercial activity.
            </div>
         </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ marginBottom: '40px' }}>
         <h2 style={{
           fontSize: '14px',
           fontWeight: '700',
           textTransform: 'uppercase',
           letterSpacing: '0.1em',
           marginBottom: '16px',
           borderBottom: '1px solid #e2e8f0',
           paddingBottom: '8px',
           color: '#94a3b8',
           margin: '0 0 16px 0'
         }}>Recent Verified Transactions</h2>
         <table style={{ width: '100%', textAlign: 'left', fontSize: '14px', borderCollapse: 'collapse' }}>
             <thead>
                 <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                     <th style={{ padding: '8px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>Date</th>
                     <th style={{ padding: '8px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>Counterparty</th>
                     <th style={{ padding: '8px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>Amount</th>
                     <th style={{ padding: '8px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                 </tr>
             </thead>
             <tbody>
                 {recentTrades.map(record => (
                     <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                         <td style={{ padding: '8px', fontFamily: 'monospace', color: '#64748b' }}>{new Date(record.createdAt).toLocaleDateString()}</td>
                         <td style={{ padding: '8px', fontWeight: '700', color: '#1e293b' }}>{record.counterpartyName}</td>
                         <td style={{ padding: '8px', fontFamily: 'monospace', color: '#334155' }}>₹{record.originalAmount.toLocaleString()}</td>
                         <td style={{ padding: '8px' }}>
                             <span style={{
                                 fontSize: '10px',
                                 fontWeight: '700',
                                 padding: '2px 8px',
                                 borderRadius: '9999px',
                                 border: '1px solid',
                                 backgroundColor: record.status === RecordStatus.SETTLED ? '#ecfdf5' : record.status === RecordStatus.DISPUTED ? '#fef2f2' : '#fffbeb',
                                 color: record.status === RecordStatus.SETTLED ? '#059669' : record.status === RecordStatus.DISPUTED ? '#dc2626' : '#d97706',
                                 borderColor: record.status === RecordStatus.SETTLED ? '#a7f3d0' : record.status === RecordStatus.DISPUTED ? '#fecaca' : '#fde68a',
                                 display: 'inline-block'
                             }}>
                                 {record.status.replace('_', ' ')}
                             </span>
                         </td>
                     </tr>
                 ))}
             </tbody>
         </table>
      </div>
      
      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '24px',
        borderTop: '2px solid #f1f5f9',
        textAlign: 'center',
        position: 'absolute',
        bottom: '40px',
        left: '40px',
        right: '40px'
      }}>
         <p style={{ fontSize: '12px', fontFamily: 'monospace', marginBottom: '8px', color: '#94a3b8', margin: '0 0 8px 0' }}>Cryptographically verifiable via SAAKSHY Protocol • {new Date().toISOString()}</p>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#cbd5e1' }}>
             <span>Confidential</span>
             <span>•</span>
             <span>Verified</span>
             <span>•</span>
             <span>Secure</span>
         </div>
      </div>
    </div>
  );
};

export const Reports: React.FC<ReportsProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'history' | 'dossier' | 'audit'>('history');
  const [records, setRecords] = useState<TradeRecord[]>([]);
  const [stats, setStats] = useState<DossierStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        try {
            const currentUser = getSessionUser();
            setUser(currentUser);
            
            const allRecords = await getRecords();
            setRecords(allRecords);

            // Calculate Stats
            let totalVolume = 0;
            let settledCount = 0;
            let onTimeCount = 0;
            let disputeCount = 0;
            const uniquePartners = new Set();
            let firstTradeDate = Date.now();

            allRecords.forEach(r => {
                totalVolume += r.originalAmount;
                uniquePartners.add(r.counterpartyMobile);
                if (r.createdAt < firstTradeDate) firstTradeDate = r.createdAt;
                
                if (r.status === RecordStatus.DISPUTED) disputeCount++;
                if (r.status === RecordStatus.SETTLED) {
                    settledCount++;
                    // Basic on-time check logic (same as Partners page)
                    const dueDate = new Date(r.dueDate).getTime();
                    const lastPayment = r.paymentHistory?.length > 0 
                        ? r.paymentHistory.sort((a, b) => b.date - a.date)[0] 
                        : null;
                    const settledDate = lastPayment ? lastPayment.date : r.createdAt;
                    if (settledDate <= dueDate + 86400000) onTimeCount++;
                }
            });

            const onTimePercentage = settledCount > 0 ? Math.round((onTimeCount / settledCount) * 100) : 100;
            const accountAgeDays = Math.max(1, Math.floor((Date.now() - (currentUser?.createdAt || firstTradeDate)) / (1000 * 60 * 60 * 24)));
            
            // Trust Score Algorithm (Simple Mock)
            // Base 50 + (OnTime% * 0.3) + (Volume/1000 * 0.1 capped at 10) + (AccountAge * 0.1 capped at 10) - (Disputes * 10)
            let trustScore = 50 + (onTimePercentage * 0.3);
            trustScore += Math.min(10, totalVolume / 10000);
            trustScore += Math.min(10, accountAgeDays / 30);
            trustScore -= (disputeCount * 15);
            trustScore = Math.max(10, Math.min(99, Math.round(trustScore)));

            setStats({
                totalVolume,
                totalDeals: allRecords.length,
                activePartners: uniquePartners.size,
                trustScore,
                onTimePercentage,
                disputeCount,
                accountAgeDays
            });

        } catch (e) {
            console.error("Failed to load report data", e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const getFilteredRecords = () => {
      return records.filter(r => {
          const recordDate = new Date(r.createdAt);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          // Adjust end date to include the full day
          if (end) end.setHours(23, 59, 59, 999);

          const isAfterStart = !start || recordDate >= start;
          const isBeforeEnd = !end || recordDate <= end;
          
          const amount = r.originalAmount;
          const min = minAmount ? parseFloat(minAmount) : null;
          const max = maxAmount ? parseFloat(maxAmount) : null;

          const isAboveMin = min === null || amount >= min;
          const isBelowMax = max === null || amount <= max;

          return isAfterStart && isBeforeEnd && isAboveMin && isBelowMax;
      });
  };

  const handleDownloadCSV = () => {
      const filteredRecords = getFilteredRecords();
      if (filteredRecords.length === 0) return;

      const headers = ['Date', 'ID', 'Type', 'Counterparty', 'Mobile', 'Amount', 'Status', 'Due Date'];
      const rows = filteredRecords.map(r => [
          new Date(r.createdAt).toISOString().split('T')[0],
          r.id,
          r.role,
          r.counterpartyName,
          r.counterpartyMobile,
          r.originalAmount,
          r.status,
          new Date(r.dueDate).toISOString().split('T')[0]
      ]);

      const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Saakshy_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      setShowExportOptions(false);
  };

  const handleDownloadExcel = () => {
      const filteredRecords = getFilteredRecords();
      if (filteredRecords.length === 0) return;

      const ws = XLSX.utils.json_to_sheet(filteredRecords.map(r => ({
          Date: new Date(r.createdAt).toISOString().split('T')[0],
          ID: r.id,
          Type: r.role,
          Counterparty: r.counterpartyName,
          Mobile: r.counterpartyMobile,
          Amount: r.originalAmount,
          Status: r.status,
          DueDate: new Date(r.dueDate).toISOString().split('T')[0]
      })));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `Saakshy_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
      setShowExportOptions(false);
  };

  const handleDownloadPDF = () => {
      const filteredRecords = getFilteredRecords();
      if (filteredRecords.length === 0) return;

      const doc = new jsPDF();
      doc.text("Transaction History Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
      
      if (startDate || endDate) {
          doc.text(`Date Range: ${startDate || 'Start'} to ${endDate || 'Present'}`, 14, 34);
      }

      const tableData = filteredRecords.map(r => [
          new Date(r.createdAt).toLocaleDateString(),
          r.counterpartyName,
          r.role,
          `₹${r.originalAmount}`,
          r.status.replace('_', ' '),
          new Date(r.dueDate).toLocaleDateString()
      ]);

      autoTable(doc, {
          startY: startDate || endDate ? 40 : 35,
          head: [['Date', 'Counterparty', 'Type', 'Amount', 'Status', 'Due Date']],
          body: tableData,
      });

      doc.save(`Saakshy_Transactions_${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportOptions(false);
  };

  const handleDownloadDossier = async () => {
      const element = document.getElementById('trade-dossier');
      if (!element) return;
      
      setLoading(true);
      try {
          const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false,
              onclone: (clonedDoc) => {
                  const clonedElement = clonedDoc.getElementById('trade-dossier');
                  if (clonedElement) {
                      clonedElement.style.position = 'static';
                      clonedElement.style.top = 'auto';
                      clonedElement.style.left = 'auto';
                      clonedElement.style.display = 'block';
                  }
              }
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Saakshy_Trade_Dossier_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (err) {
          console.error("Failed to generate dossier PDF", err);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-full pb-20 max-w-4xl mx-auto px-4 py-6">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #trade-dossier, #trade-dossier * {
            visibility: visible;
          }
          #trade-dossier {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            background: white;
            color: black;
            z-index: 9999;
          }
          /* Hide everything else explicitly */
          nav, header, aside, .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Hidden Dossier Component (Visible only in Print) */}
      <TradeDossier stats={stats} user={user} records={records} />

      <div className="flex items-center gap-3 mb-6 no-print">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
           </svg>
        </button>
        <h2 className="text-2xl font-bold text-white">Reports & Insights</h2>
      </div>

      <div className="flex p-1 bg-slate-800/50 backdrop-blur-sm rounded-xl mb-8 border border-slate-700/50 no-print">
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            Transaction History
          </button>
          <button 
            onClick={() => setActiveTab('dossier')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'dossier' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            Trade Dossier
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'audit' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            Audit Trail
          </button>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 min-h-[400px] no-print relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
              <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20 transition-colors duration-500 ${
                  activeTab === 'history' ? 'bg-blue-500' : 
                  activeTab === 'dossier' ? 'bg-purple-500' : 'bg-emerald-500'
              }`}></div>
              <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20 transition-colors duration-500 ${
                  activeTab === 'history' ? 'bg-blue-500' : 
                  activeTab === 'dossier' ? 'bg-purple-500' : 'bg-emerald-500'
              }`}></div>
          </div>

          {activeTab === 'history' && (
              <div className="max-w-2xl mx-auto text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-600/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-400 border border-blue-500/20 shadow-xl shadow-blue-900/10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Transaction History Report</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">Download a complete record of all your trades, payments, and disputes. Choose your preferred format below.</p>
                  
                  {/* Filter Section */}
                  <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-1 mb-8">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                          <div className="flex items-center gap-2 text-slate-300">
                              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                  </svg>
                              </div>
                              <span className="font-bold text-sm">Filter Records</span>
                          </div>
                          <div className="flex items-center gap-3">
                              {(startDate || endDate || minAmount || maxAmount) && (
                                  <button 
                                      onClick={() => {
                                          setStartDate('');
                                          setEndDate('');
                                          setMinAmount('');
                                          setMaxAmount('');
                                      }}
                                      className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                      Clear
                                  </button>
                              )}
                              <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">Found:</span>
                                  <span className="text-xs font-bold text-white bg-blue-600/20 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                                      {getFilteredRecords().length}
                                  </span>
                              </div>
                          </div>
                      </div>
                      
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Time Period */}
                          <div className="space-y-4">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                  Time Period
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Start Date</label>
                                      <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                          </div>
                                          <input 
                                              type="date" 
                                              value={startDate}
                                              onChange={(e) => setStartDate(e.target.value)}
                                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-slate-600"
                                          />
                                      </div>
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">End Date</label>
                                      <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                              </svg>
                                          </div>
                                          <input 
                                              type="date" 
                                              value={endDate}
                                              onChange={(e) => setEndDate(e.target.value)}
                                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder-slate-600"
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Transaction Value */}
                          <div className="space-y-4">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                  Transaction Value
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Min Amount</label>
                                      <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400">
                                              <span className="text-sm font-bold">₹</span>
                                          </div>
                                          <input 
                                              type="number" 
                                              value={minAmount}
                                              onChange={(e) => setMinAmount(e.target.value)}
                                              placeholder="0"
                                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all placeholder-slate-600"
                                          />
                                      </div>
                                  </div>
                                  <div className="space-y-1.5">
                                      <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Max Amount</label>
                                      <div className="relative group">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400">
                                              <span className="text-sm font-bold">₹</span>
                                          </div>
                                          <input 
                                              type="number" 
                                              value={maxAmount}
                                              onChange={(e) => setMaxAmount(e.target.value)}
                                              placeholder="Any"
                                              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all placeholder-slate-600"
                                          />
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button 
                        onClick={handleDownloadCSV}
                        disabled={loading || getFilteredRecords().length === 0}
                        className="group relative bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700 hover:border-green-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                              <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-green-500/20">
                                  <span className="font-bold text-xs">CSV</span>
                              </div>
                              <p className="font-bold text-white mb-1 group-hover:text-green-400 transition-colors">CSV Format</p>
                              <p className="text-xs text-slate-500">Raw data for analysis</p>
                          </div>
                      </button>

                      <button 
                        onClick={handleDownloadExcel}
                        disabled={loading || getFilteredRecords().length === 0}
                        className="group relative bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700 hover:border-emerald-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                  </svg>
                              </div>
                              <p className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Excel Format</p>
                              <p className="text-xs text-slate-500">Formatted spreadsheet</p>
                          </div>
                      </button>

                      <button 
                        onClick={handleDownloadPDF}
                        disabled={loading || getFilteredRecords().length === 0}
                        className="group relative bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700 hover:border-red-500/50 p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                              <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-red-500/20">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                  </svg>
                              </div>
                              <p className="font-bold text-white mb-1 group-hover:text-red-400 transition-colors">PDF Document</p>
                              <p className="text-xs text-slate-500">Print-ready report</p>
                          </div>
                      </button>
                  </div>
              </div>
          )}

          {activeTab === 'dossier' && (
              <div className="max-w-4xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                      {/* Left: Value Prop */}
                      <div className="text-left">
                          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-400 border border-purple-500/20">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                          </div>
                          <h3 className="text-3xl font-bold text-white mb-4">Verified Trade Dossier</h3>
                          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                              Generate a cryptographically verifiable report of your trade reliability. 
                              This dossier serves as proof of your creditworthiness for lenders, banks, and new suppliers.
                          </p>
                          
                          <div className="space-y-4 mb-8">
                              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                                      <span className="font-bold text-sm">{stats?.trustScore || '-'}</span>
                                  </div>
                                  <div>
                                      <p className="text-white font-bold text-sm">Trust Score Included</p>
                                      <p className="text-slate-500 text-xs">Based on payment history & volume</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                  </div>
                                  <div>
                                      <p className="text-white font-bold text-sm">Verified Transactions</p>
                                      <p className="text-slate-500 text-xs">Last 10 verified deals listed</p>
                                  </div>
                              </div>
                          </div>

                          <button 
                            onClick={handleDownloadDossier}
                            disabled={loading || !stats}
                            className="w-full sm:w-auto bg-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-purple-900/30 hover:bg-purple-700 hover:shadow-purple-900/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                              </svg>
                              {loading ? 'Generating PDF...' : 'Download Verified Dossier PDF'}
                          </button>
                      </div>

                      {/* Right: Document Preview Visual */}
                      <div className="relative hidden md:block group cursor-pointer" onClick={handleDownloadDossier}>
                          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative bg-white text-slate-900 p-6 rounded-tr-3xl rounded-bl-3xl rounded-tl-sm rounded-br-sm shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 border border-slate-200 h-[400px] flex flex-col">
                              <div className="flex justify-between items-start mb-6 border-b-2 border-slate-900 pb-4">
                                  <div>
                                      <div className="h-4 w-32 bg-slate-900 mb-2"></div>
                                      <div className="h-2 w-24 bg-slate-400"></div>
                                  </div>
                                  <div className="text-right">
                                      <div className="h-3 w-20 bg-slate-800 mb-1 ml-auto"></div>
                                      <div className="h-2 w-16 bg-slate-400 ml-auto"></div>
                                  </div>
                              </div>
                              <div className="space-y-4 mb-auto">
                                  <div className="flex gap-4">
                                      <div className="w-1/3 h-24 bg-slate-100 rounded-lg border border-slate-200"></div>
                                      <div className="w-1/3 h-24 bg-slate-100 rounded-lg border border-slate-200"></div>
                                      <div className="w-1/3 h-24 bg-slate-100 rounded-lg border border-slate-200"></div>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded"></div>
                                  <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                                  <div className="h-2 w-4/6 bg-slate-100 rounded"></div>
                                  <div className="mt-6 space-y-2">
                                      <div className="h-8 w-full bg-slate-50 border-b border-slate-200"></div>
                                      <div className="h-8 w-full bg-slate-50 border-b border-slate-200"></div>
                                      <div className="h-8 w-full bg-slate-50 border-b border-slate-200"></div>
                                  </div>
                              </div>
                              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                  <div className="h-2 w-32 bg-slate-300"></div>
                                  <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                  </div>
                              </div>
                              
                              {/* Overlay Badge */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  Click to Generate
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'audit' && (
              <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-white">System Audit Trail</h3>
                          <p className="text-slate-400 text-sm">Log of all critical system events and security actions.</p>
                      </div>
                  </div>

                  <div className="relative pl-4 border-l border-slate-700/50 space-y-8">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="relative group">
                              {/* Timeline Dot */}
                              <div className="absolute -left-[21px] top-3 w-3 h-3 rounded-full bg-slate-800 border-2 border-emerald-500 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                              
                              <div className="flex gap-4 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors">
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start mb-1">
                                          <p className="text-slate-200 font-medium text-sm">System backup completed successfully</p>
                                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-700">ID: SYS-{1000+i}</span>
                                      </div>
                                      <p className="text-xs text-slate-500">Automated daily backup of all trade records and user preferences.</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                      <p className="text-xs font-bold text-slate-400">Today</p>
                                      <p className="text-[10px] text-slate-600 font-mono">09:00 AM</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
