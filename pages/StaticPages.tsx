
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { logout } from '../services/authService';

interface PageProps {
  lang: Language;
}

export const MoreMenu: React.FC<PageProps> = ({ lang }) => {
    return (
        <div className="p-4 space-y-2 min-h-full">
            <h2 className="font-bold text-xl mb-6 text-white px-2">Menu</h2>
            
            <div className="space-y-3">
                <Link to="/settings" className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 font-bold text-slate-200 hover:bg-slate-800 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                     </div>
                     Account Settings
                </Link>

                <div className="grid grid-cols-2 gap-3">
                    <Link to="/about" className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 font-medium text-sm text-slate-300 hover:bg-slate-800 transition-colors flex flex-col gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        How It Works
                    </Link>
                    <Link to="/faq" className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 font-medium text-sm text-slate-300 hover:bg-slate-800 transition-colors flex flex-col gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        FAQs
                    </Link>
                    <Link to="/trust" className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 font-medium text-sm text-slate-300 hover:bg-slate-800 transition-colors flex flex-col gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Trust Code
                    </Link>
                    <Link to="/contact" className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 font-medium text-sm text-slate-300 hover:bg-slate-800 transition-colors flex flex-col gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Support
                    </Link>
                </div>
                
                <div className="pt-6">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/5 rounded-xl border border-red-500/20 font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                    </button>
                </div>

                <div className="p-4 mt-8 text-center opacity-50">
                    <div className="flex justify-center gap-4 text-xs text-slate-500 mb-2">
                        <Link to="/privacy">Privacy Policy</Link>
                        <span>•</span>
                        <Link to="/terms">Terms of Use</Link>
                    </div>
                    <p className="text-[10px] text-slate-600 font-mono">SAAKSHY v2.4 (Stable)</p>
                </div>
            </div>
        </div>
    )
}

export const AboutPage: React.FC<PageProps> = ({ lang }) => {
    return (
        <div className="p-6 pb-20 min-h-full max-w-5xl mx-auto">
            <div className="mb-10 text-center">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">How <span className="text-amber-500">SAAKSHY</span> Works</h2>
                <p className="text-slate-400 max-w-xl mx-auto">The operating system for high-trust informal commerce. We turn verbal promises into digital assets.</p>
            </div>
            
            {/* 3-Step Workflow */}
            <div className="relative grid md:grid-cols-3 gap-8 mb-20">
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-900 via-emerald-900 to-blue-900 border-t border-dashed border-slate-700 z-0"></div>
                
                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center mb-6 shadow-xl shadow-blue-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm border-4 border-slate-950">1</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Draft & Send</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                        One party creates a record (Amount, Due Date, Note) and shares a secure link via WhatsApp.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center mb-6 shadow-xl shadow-emerald-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm border-4 border-slate-950">2</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Mutual Lock</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                        The counterparty clicks the link and verifies via OTP. This digital signature locks the record forever.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-900 rounded-full border border-slate-700 flex items-center justify-center mb-6 shadow-xl shadow-purple-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white text-sm border-4 border-slate-950">3</div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Settle or Dispute</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                        Log payments as they happen. If issues arise, raise a 'Dispute Flag' instead of deleting history.
                    </p>
                </div>
            </div>

            {/* Core Functions */}
            <h3 className="text-2xl font-bold text-white mb-6 border-l-4 border-amber-500 pl-4">Core Features</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-16">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
                    <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        <span className="text-amber-400">#</span> Legal Admissibility
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        SAAKSHY records captures IP addresses, timestamps, and OTP verification logs. This creates a Section 65B compliant audit trail admissible as electronic evidence in Indian courts.
                    </p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
                    <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        <span className="text-emerald-400">#</span> Immutable History
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Once confirmed, a record cannot be deleted or secretly edited. It serves as a neutral "Trust Memory" that prevents "I never said that" disputes later.
                    </p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
                    <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        <span className="text-red-400">#</span> Dispute Flagging
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        If a disagreement occurs, either party can raise a Dispute Flag. This freezes the settlement status but keeps the record visible, proving the transaction existed.
                    </p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
                    <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                        <span className="text-blue-400">#</span> Privacy Silos
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Your data is not a social feed. Transaction details are visible ONLY to the two parties involved. We do not sell your financial graph to advertisers.
                    </p>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-slate-800">
                <p className="text-slate-500 text-sm">Built by SAAKSHY Technologies Pvt Ltd • Jaipur, India</p>
            </div>
        </div>
    );
}

export const TrustPage: React.FC<PageProps> = ({ lang }) => {
    return (
        <div className="p-6 min-h-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-white">Trust Architecture</h2>
            
            <div className="space-y-8">
                <div className="relative pl-8 border-l-2 border-slate-700">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-blue-500 rounded-full"></div>
                    <h3 className="font-bold text-xl text-white mb-2">1. We Do Not Move Money</h3>
                    <p className="text-slate-400 leading-relaxed">
                        SAAKSHY is an information utility, not a payment gateway. We verify the *agreement* of debt, not the transfer of funds. This keeps us neutral and eliminates custody risk.
                    </p>
                </div>
                
                <div className="relative pl-8 border-l-2 border-slate-700">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-emerald-500 rounded-full"></div>
                    <h3 className="font-bold text-xl text-white mb-2">2. Unbribable Witness</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Our system is designed to be blind to power dynamics. A small vendor has the same evidence power as a large distributor. We do not edit records for anyone.
                    </p>
                </div>

                <div className="relative pl-8 border-l-2 border-slate-700">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-purple-500 rounded-full"></div>
                    <h3 className="font-bold text-xl text-white mb-2">3. Zero-Knowledge Intent</h3>
                    <p className="text-slate-400 leading-relaxed">
                        We minimize what we know. We verify phone numbers and log agreements. We do not read your other SMS, contacts, or location history unless explicitly required for a feature.
                    </p>
                </div>
            </div>
        </div>
    );
}

export const FAQPage: React.FC<PageProps> = ({ lang }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

    const faqs = [
        {
            category: "Concept",
            q: "How is this better than a WhatsApp screenshot?",
            a: "Screenshots can be faked, deleted, or lost. A SAAKSHY record is a cryptographically secured, timestamped entry in a neutral database. It requires active OTP confirmation from the other party, making it undeniable proof of agreement."
        },
        {
            category: "Concept",
            q: "Does the other party need the app?",
            a: "No. The counterparty receives a secure web link via WhatsApp/SMS. They can view, verify, and confirm the transaction using just their mobile browser and OTP. No app download is forced."
        },
        {
            category: "Usage",
            q: "Can I delete a record if I made a mistake?",
            a: "No. Once a record is CONFIRMED, it is immutable (permanent). If you made a mistake, you must 'Settle' it to zero and create a new correct record. This ensures a complete audit trail that cannot be manipulated."
        },
        {
            category: "Usage",
            q: "What if the other party refuses to confirm?",
            a: "The record remains in 'Pending' state. While not a binding contract yet, it serves as evidence that you attempted to formalize the debt. You can send reminders via the dashboard."
        },
        {
            category: "Legal",
            q: "Is this admissible in court?",
            a: "Yes. SAAKSHY logs verify the Identity (Mobile/OTP), Intent (Record Details), and Consent (Confirmation Action). These logs are structured to meet the requirements of Section 65B of the Indian Evidence Act for electronic evidence."
        },
        {
            category: "Usage",
            q: "Do you help with recovery agents?",
            a: "No. We provide the evidence you need to pursue recovery legally or socially, but we do not employ recovery agents. We are a technology infrastructure, not a muscle agency."
        }
    ];

    return (
        <div className="p-6 pb-20 min-h-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-300">
                        <button 
                            onClick={() => toggle(idx)}
                            className="w-full text-left p-5 flex justify-between items-center focus:outline-none hover:bg-slate-800 transition-colors"
                        >
                            <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 block">{faq.category}</span>
                                <span className={`font-bold text-lg ${openIndex === idx ? 'text-amber-400' : 'text-slate-200'}`}>
                                    {faq.q}
                                </span>
                            </div>
                            <span className={`flex-shrink-0 ml-4 transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-amber-400' : 'text-slate-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        </button>
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-700/30 mt-2">
                                {faq.a}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-blue-900/20 rounded-2xl border border-blue-500/20 text-center">
                <p className="text-slate-300 mb-4 font-medium">Still have questions?</p>
                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    Contact Support
                </Link>
            </div>
        </div>
    );
}

export const ContactPage: React.FC<PageProps> = ({ lang }) => {
    return (
        <div className="p-6 min-h-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Contact Support</h2>
            
            <div className="space-y-6">
                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <p className="text-sm text-blue-300 font-medium">For urgent disputes or account security issues, please email us immediately.</p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Support Email</label>
                    <a href="mailto:support@saakshy.in" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">support@saakshy.in</a>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Operating Hours</label>
                    <p className="text-slate-200 font-medium text-lg">Mon - Sat: 9:00 AM - 7:00 PM IST</p>
                    <p className="text-slate-500 text-sm mt-1">Response time: Within 24 hours</p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800">
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">
                        Registered Office:<br/>
                        SAAKSHY Technologies Pvt Ltd<br/>
                        Malviya Nagar,<br/>
                        Jaipur, Rajasthan 302017
                    </p>
                </div>
            </div>
        </div>
    );
}

export const PrivacyPage: React.FC<PageProps> = ({ lang }) => {
    return (
        <div className="p-6 min-h-full max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 text-white">Privacy Policy</h2>
             <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                <p className="text-slate-500">Last Updated: October 2025</p>
                <p>At SAAKSHY ("we", "our", "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.</p>
                
                <section>
                    <h3 className="text-white font-bold text-lg mb-2">1. Information We Collect</h3>
                    <ul className="list-disc pl-5 space-y-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <li><strong>Account Information:</strong> Name, mobile number, and business details provided during registration.</li>
                        <li><strong>Transaction Data:</strong> Details of records you create, including amounts, dates, and counterparty names.</li>
                        <li><strong>Device Data:</strong> IP address, device type, and browser info for security audit trails (Section 65B compliance).</li>
                    </ul>
                </section>

                <section>
                    <h3 className="text-white font-bold text-lg mb-2">2. How We Use Your Data</h3>
                    <p>We use your data strictly to provide the Trust Memory Layer service. We do not sell your data to third-party advertisers. Your transaction history is visible only to you and the specific counterparty involved in that transaction.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold text-lg mb-2">3. Data Security</h3>
                    <p>We employ bank-grade encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Our servers are located in secure facilities within India to comply with local data residency laws.</p>
                </section>
             </div>
        </div>
    );
};

export const TermsPage: React.FC<PageProps> = ({ lang }) => {
    return (
        <div className="p-6 min-h-full max-w-4xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 text-white">Terms of Service</h2>
             <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                <p className="text-slate-500">Last Updated: October 2025</p>
                
                <section>
                    <h3 className="text-white font-bold text-lg mb-2">1. Acceptance of Terms</h3>
                    <p>By accessing SAAKSHY, you agree to be bound by these Terms. If you do not agree, do not use our services.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold text-lg mb-2">2. Nature of Service</h3>
                    <p>SAAKSHY is an information utility. We provide infrastructure to record data. We are not a bank, lender, or enforcement agency. We take no responsibility for the truthfulness of the data entered by users, although we provide mechanisms (mutual confirmation) to establish veracity.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold text-lg mb-2">3. User Responsibility</h3>
                    <p>You are responsible for safeguarding your OTPs and account credentials. Any action taken with your credentials is deemed to be taken by you. You agree not to use the platform for illegal activities.</p>
                </section>

                <section>
                    <h3 className="text-white font-bold text-lg mb-2">4. Limitation of Liability</h3>
                    <p>SAAKSHY shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service. Our liability is limited to the amount paid by you for the service, if any.</p>
                </section>
             </div>
        </div>
    );
};
