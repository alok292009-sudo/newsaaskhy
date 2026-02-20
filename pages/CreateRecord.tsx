
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecord, getRecords } from '../services/dataService';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface CreateRecordProps {
  lang: Language;
}

interface Contact {
    name: string;
    mobile: string;
}

export const CreateRecord: React.FC<CreateRecordProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createdRecordId, setCreatedRecordId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: 'SELLER',
    counterpartyName: '',
    counterpartyMobile: '',
    amount: '',
    dueDate: '',
    note: ''
  });

  // Autocomplete State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContactsByName, setFilteredContactsByName] = useState<Contact[]>([]);
  const [filteredContactsByMobile, setFilteredContactsByMobile] = useState<Contact[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  
  const nameWrapperRef = useRef<HTMLDivElement>(null);
  const mobileWrapperRef = useRef<HTMLDivElement>(null);

  // Load past contacts for autocomplete
  useEffect(() => {
      const loadContacts = async () => {
          try {
              const records = await getRecords();
              const uniqueMap = new Map();
              records.forEach(r => {
                  if (r.counterpartyMobile && r.counterpartyName) {
                      // Key by mobile to ensure unique contacts
                      if (!uniqueMap.has(r.counterpartyMobile)) {
                          uniqueMap.set(r.counterpartyMobile, { name: r.counterpartyName, mobile: r.counterpartyMobile });
                      }
                  }
              });
              setContacts(Array.from(uniqueMap.values()));
          } catch (e) {
              console.error("Failed to load contacts", e);
          }
      };
      loadContacts();
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (nameWrapperRef.current && !nameWrapperRef.current.contains(event.target as Node)) {
        setShowNameSuggestions(false);
      }
      if (mobileWrapperRef.current && !mobileWrapperRef.current.contains(event.target as Node)) {
        setShowMobileSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData({...formData, counterpartyName: value});
      
      if (value.length > 0) {
          const filtered = contacts.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
          setFilteredContactsByName(filtered);
          setShowNameSuggestions(true);
      } else {
          setShowNameSuggestions(false);
      }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g,'').slice(0, 10); // Limit to 10 digits
      setFormData({...formData, counterpartyMobile: value});

      if (value.length > 0) {
          const filtered = contacts.filter(c => c.mobile.includes(value));
          setFilteredContactsByMobile(filtered);
          setShowMobileSuggestions(true);
      } else {
          setShowMobileSuggestions(false);
      }
  };

  const selectContact = (contact: Contact) => {
      setFormData({
          ...formData,
          counterpartyName: contact.name,
          counterpartyMobile: contact.mobile
      });
      setShowNameSuggestions(false);
      setShowMobileSuggestions(false);
  };

  const validateForm = () => {
      if (!formData.counterpartyName.trim()) {
          alert("Counterparty Name is required");
          return false;
      }
      if (!formData.counterpartyMobile || formData.counterpartyMobile.length !== 10) {
          alert("Please enter a valid 10-digit mobile number");
          return false;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
          alert("Please enter a valid amount");
          return false;
      }
      if (!formData.dueDate) {
          alert("Due Date is required");
          return false;
      }
      return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    
    try {
        const id = await createRecord(formData);
        setCreatedRecordId(id);
    } catch (error) {
        console.error("Failed to create record", error);
        alert("Failed to create record. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const getShareLink = () => {
      return `${window.location.origin}${window.location.pathname}#/confirm/${createdRecordId}`;
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(getShareLink());
      alert("Link copied! Share it via WhatsApp.");
  };

  if (createdRecordId) {
      return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Step 1 Complete</h2>
            <p className="text-slate-400 mb-8 max-w-xs mx-auto">
                The record is created but <span className="text-amber-400 font-bold">Pending Confirmation</span>.
            </p>

            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl w-full max-w-sm mx-auto mb-6">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide mb-2 text-left">Action Required</p>
                <p className="text-sm text-slate-300 text-left leading-relaxed">
                    Share this secure link with <span className="font-bold text-white">{formData.counterpartyName}</span>. 
                    They must click "Confirm" to make this record valid and immutable.
                </p>
            </div>

            <div className="w-full max-w-sm mx-auto space-y-3">
                <button 
                    onClick={copyToClipboard}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Copy Link (Simulate Share)
                </button>

                <a 
                    href={`#/confirm/${createdRecordId}`}
                    target="_blank"
                    className="block w-full py-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-bold text-sm hover:bg-slate-750"
                >
                    Simulate Counterparty View (Test)
                </a>

                <button 
                    onClick={() => navigate('/')}
                    className="text-slate-500 text-sm font-medium py-2 hover:text-slate-300"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="px-4 py-6 min-h-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">{t.create_title}</h2>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Source of Truth / सत्य का स्रोत</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Role Selection */}
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide text-center">{t.role_label}</label>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'SELLER'})}
                    className={`flex-1 py-4 px-2 rounded-lg text-sm font-bold border transition-all ${
                        formData.role === 'SELLER' 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30' 
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    {t.seller}
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'BUYER'})}
                    className={`flex-1 py-4 px-2 rounded-lg text-sm font-bold border transition-all ${
                        formData.role === 'BUYER' 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30' 
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    {t.buyer}
                </button>
            </div>
        </div>

        {/* Counterparty Inputs */}
        <div className="space-y-4">
            <div ref={nameWrapperRef} className="relative">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t.cp_name}</label>
                <input 
                    required
                    type="text" 
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all font-medium"
                    value={formData.counterpartyName}
                    onChange={handleNameChange}
                    onFocus={() => { if(formData.counterpartyName && filteredContactsByName.length > 0) setShowNameSuggestions(true) }}
                    placeholder="e.g. Ramesh Kumar"
                    autoComplete="off"
                />
                
                {/* Name Autocomplete Dropdown */}
                {showNameSuggestions && filteredContactsByName.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredContactsByName.map((contact, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => selectContact(contact)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 flex justify-between items-center group"
                            >
                                <span className="font-bold text-white group-hover:text-blue-300">{contact.name}</span>
                                <span className="text-xs text-slate-500 font-mono">{contact.mobile}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div ref={mobileWrapperRef} className="relative">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t.cp_mobile}</label>
                <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-700 bg-slate-800 text-slate-400 font-bold">
                        +91
                    </span>
                    <input 
                        required
                        type="tel" 
                        pattern="[0-9]{10}"
                        maxLength={10}
                        className="flex-1 p-4 bg-slate-800 border border-slate-700 rounded-r-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all font-mono text-lg"
                        value={formData.counterpartyMobile}
                        onChange={handleMobileChange}
                        onFocus={() => { if(formData.counterpartyMobile && filteredContactsByMobile.length > 0) setShowMobileSuggestions(true) }}
                        placeholder="98765 00000"
                        autoComplete="off"
                    />
                </div>

                {/* Mobile Autocomplete Dropdown */}
                {showMobileSuggestions && filteredContactsByMobile.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredContactsByMobile.map((contact, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => selectContact(contact)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 flex justify-between items-center group"
                            >
                                <span className="font-mono text-white group-hover:text-blue-300 font-bold">{contact.mobile}</span>
                                <span className="text-xs text-slate-500">{contact.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t.amount}</label>
                <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all font-mono font-bold text-lg"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    placeholder="0"
                />
            </div>
             <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t.due_date}</label>
                <input 
                    required
                    type="date" 
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all font-medium"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t.note}</label>
            <textarea 
                rows={2}
                className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-slate-500 transition-all"
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
                placeholder="Optional details..."
            />
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold text-base shadow-xl shadow-white/5 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
        >
            {loading ? t.loading : 'Send for Confirmation'}
        </button>

      </form>
    </div>
  );
};
