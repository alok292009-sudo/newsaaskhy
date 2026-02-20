
// ... existing imports ...
import React, { useEffect, useState, useRef, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../types';

interface LandingPageProps {
// ... existing interface ...
  lang: Language;
  setLang: (lang: Language) => void;
}


class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 1.5 + 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.height) this.vy *= -1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#334155'; // Slate-700
        ctx.fill();
    }
}

// --- 1. OPTIMIZED PARTICLE NETWORK ---
const ParticleNetwork: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles: Particle[] = [];

        const isMobile = width < 768;
        const particleCount = isMobile ? 30 : 60;
        const connectionDistance = isMobile ? 100 : 180;
        const mouseDistance = 250;

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(width, height));
            }
        };

        const mouse = { x: -1000, y: -1000 };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            
            // Draw background explicitly to avoid alpha accumulation
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(51, 65, 85, ${0.4 * (1 - distance / connectionDistance)})`;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
                
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouseDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / mouseDistance)})`; // Blue connect
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (e: globalThis.MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-40 pointer-events-none" />;
};

// --- 2. SPOTLIGHT HERO COMPONENT ---
const SpotlightHero = ({ children }: { children?: React.ReactNode }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div 
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative min-h-screen flex items-center justify-center px-6 pt-20 border-b border-white/5 overflow-hidden"
        >
            <div 
                className="pointer-events-none absolute -inset-px transition duration-300 z-0"
                style={{
                    opacity,
                    background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(29, 78, 216, 0.15), transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
};

// --- 3. 3D TILT CARD ---
const TiltCard = ({ children, className }: { children?: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (e.clientX - left - width / 2) / 25;
        const y = (e.clientY - top - height / 2) / 25;
        setTransform(`perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.02)`);
    };

    const handleMouseLeave = () => {
        setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
    };

    return (
        <div 
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`transition-transform duration-200 ease-out ${className}`}
            style={{ transform }}
        >
            {children}
        </div>
    );
};

// --- GLITCH TEXT EFFECT ---
const GlitchText: React.FC<{ text: string }> = ({ text }) => {
    return (
        <span className="relative inline-block group">
            <span className="relative z-10">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-red-500 opacity-0 group-hover:opacity-70 group-hover:animate-glitch-1 transition-opacity duration-100">{text}</span>
            <span className="absolute top-0 left-0 -z-10 w-full h-full text-blue-500 opacity-0 group-hover:opacity-70 group-hover:animate-glitch-2 transition-opacity duration-100">{text}</span>
        </span>
    );
};

// --- LIVE TRANSACTION TICKER ---
const LiveTicker = () => {
    // Use fixed values or memoized values to avoid hydration mismatch
    const tickerItems = [
        { label: "SECURED", amount: "₹45,200", city: "JAIPUR", color: "bg-emerald-500" },
        { label: "LOCKED", amount: "₹1,20,000", city: "MUMBAI", color: "bg-blue-500" },
        { label: "DISPUTE RESOLVED", amount: "", city: "DELHI", color: "bg-amber-500" },
        { label: "SECURED", amount: "₹12,500", city: "PUNE", color: "bg-emerald-500" },
        { label: "LOCKED", amount: "₹85,000", city: "BANGALORE", color: "bg-blue-500" },
        { label: "SECURED", amount: "₹32,000", city: "CHENNAI", color: "bg-emerald-500" }
    ];

    return (
        <div className="w-full bg-black border-y border-slate-800 py-3 overflow-hidden relative z-20">
            <div className="flex gap-12 animate-marquee whitespace-nowrap">
                {tickerItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span className={`w-2 h-2 rounded-full ${item.color} animate-pulse`}></span>
                        {item.label}{item.amount && `: ${item.amount}`} <span className="text-slate-600">|</span> {item.city}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- TRUST SIMULATOR ---
const TrustSimulator = () => {
    const [sliderVal, setSliderVal] = useState(50);
    
    return (
        <div className="max-w-5xl mx-auto py-20 px-6">
            <h2 className="text-3xl font-black text-white text-center mb-12">THE REALITY GAP</h2>
            <div className="relative h-[400px] rounded-3xl overflow-hidden border border-slate-700 shadow-2xl group select-none">
                
                {/* Left Side: Chaos (Verbal) */}
                <div 
                    className="absolute inset-0 bg-slate-900 flex items-center justify-center"
                    style={{ clipPath: `polygon(0 0, ${sliderVal}% 0, ${sliderVal}% 100%, 0 100%)` }}
                >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                    <div className="text-center p-10 filter blur-[1px] opacity-80 transition-all duration-300">
                        <h3 className="text-4xl font-black text-red-500 mb-4">VERBAL DEAL</h3>
                        <p className="text-xl text-red-300 font-mono">"I forgot."</p>
                        <p className="text-xl text-red-300 font-mono">"Come back next week."</p>
                        <p className="text-xl text-red-300 font-mono">"No proof."</p>
                        <div className="mt-8 text-6xl font-black text-red-600/20">CHAOS</div>
                    </div>
                </div>

                {/* Right Side: Order (Saakshy) */}
                <div 
                    className="absolute inset-0 bg-gradient-to-br from-emerald-950 to-slate-900 flex items-center justify-center"
                    style={{ clipPath: `polygon(${sliderVal}% 0, 100% 0, 100% 100%, ${sliderVal}% 100%)` }}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9811a_1px,transparent_1px),linear-gradient(to_bottom,#10b9811a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="text-center p-10">
                        <h3 className="text-4xl font-black text-emerald-400 mb-4 tracking-tight">SAAKSHY RECORD</h3>
                        <div className="space-y-4 font-mono text-emerald-200/90 text-lg">
                            <div className="flex items-center gap-2 justify-center">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Verified Amount
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Due Date Locked
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                Legal Evidence
                            </div>
                        </div>
                        <div className="mt-8 text-6xl font-black text-emerald-500/10">ORDER</div>
                    </div>
                </div>

                {/* Slider Handle */}
                <div 
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center hover:bg-amber-400 transition-colors"
                    style={{ left: `${sliderVal}%` }}
                >
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.5)] border-4 border-slate-900">
                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                    </div>
                </div>

                {/* Invisible Interaction Layer */}
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={sliderVal} 
                    onChange={(e) => setSliderVal(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
            </div>
            <p className="text-center text-slate-500 mt-4 text-xs uppercase tracking-widest animate-pulse">Drag slider to compare</p>
        </div>
    );
};

// --- SCROLLY VISUALS (Generative 3D Art) ---
const VisualVoid = () => {
    // Generate deterministic positions based on index
    const particles = [...Array(10)].map((_, i) => ({
        top: `${(i * 13 + 7) % 100}%`,
        left: `${(i * 29 + 3) % 100}%`,
        animDuration: 2 + (i % 3)
    }));

    return (
    <div className="relative w-full max-w-sm aspect-square flex items-center justify-center animate-fade-in group">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        {/* Generative 'Void' - Chaos */}
        <div className="relative z-10 w-64 h-64 bg-slate-900/50 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] group-hover:scale-105 transition-transform duration-700 backdrop-blur-sm overflow-hidden">
             {/* Random particles inside */}
             {particles.map((p, i) => (
                 <div key={i} className="absolute w-2 h-2 bg-red-500/40 rounded-full" style={{
                     top: p.top,
                     left: p.left,
                     animation: `float ${p.animDuration}s infinite alternate`
                 }}></div>
             ))}
             <div className="text-center space-y-2 opacity-80 z-20">
                 <div className="text-5xl filter drop-shadow-lg">🌫️</div>
                 <div className="text-xs font-mono text-red-400 uppercase tracking-widest font-bold">Unverified</div>
             </div>
        </div>
        <div className="absolute bottom-10 space-y-2 text-center z-20">
            <div className="text-4xl font-mono font-bold text-slate-500 blur-[1px] animate-pulse">₹ 50,000</div>
            <div className="text-xs text-red-500 font-bold uppercase tracking-widest">Status: Lost</div>
        </div>
    </div>
    );
};

const VisualLock = () => (
    <div className="relative w-full max-w-sm aspect-square flex items-center justify-center animate-fade-in-up group">
        <div className="absolute w-72 h-72 border border-emerald-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
        <div className="absolute w-60 h-60 border border-emerald-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
        {/* Generative 'Lock' - Order */}
        <div className="relative z-10 w-48 h-48 bg-slate-900 border border-emerald-500/50 rounded-xl shadow-[0_0_60px_rgba(16,185,129,0.15)] flex items-center justify-center transform rotate-45 group-hover:rotate-0 transition-all duration-700 backdrop-blur-md">
            <div className="transform -rotate-45 group-hover:rotate-0 transition-all duration-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
        <div className="absolute bottom-5 bg-black/80 px-4 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 text-xs uppercase tracking-widest font-mono backdrop-blur-md shadow-lg">
            Hash: 8f92...a12b
        </div>
    </div>
);

const VisualGrowth = () => (
    <div className="relative w-full max-w-sm aspect-square flex items-end justify-center px-8 pb-10 animate-fade-in group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3341551a_1px,transparent_1px),linear-gradient(to_bottom,#3341551a_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
        {/* Generative 'Growth' - Asset */}
        <div className="flex items-end gap-3 h-56 w-full z-10">
            <div className="flex-1 bg-amber-500/20 h-[20%] rounded-t-sm border-t border-amber-500/50 group-hover:h-[25%] transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"></div>
            <div className="flex-1 bg-amber-500/30 h-[40%] rounded-t-sm border-t border-amber-500/50 group-hover:h-[45%] transition-all duration-500 delay-75 shadow-[0_0_15px_rgba(245,158,11,0.1)]"></div>
            <div className="flex-1 bg-amber-500/40 h-[30%] rounded-t-sm border-t border-amber-500/50 group-hover:h-[35%] transition-all duration-500 delay-100 shadow-[0_0_15px_rgba(245,158,11,0.1)]"></div>
            <div className="flex-1 bg-amber-500/60 h-[60%] rounded-t-sm border-t border-amber-500/50 group-hover:h-[65%] transition-all duration-500 delay-150 shadow-[0_0_15px_rgba(245,158,11,0.2)]"></div>
            <div className="flex-1 bg-gradient-to-t from-amber-600 to-amber-400 h-[85%] rounded-t-sm shadow-[0_0_30px_rgba(245,158,11,0.4)] group-hover:h-[95%] transition-all duration-500 delay-200 relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-400 font-bold text-xl drop-shadow-md">+750</div>
            </div>
        </div>
    </div>
);

// --- 5. INDUSTRY USE CASES TABS ---
const UseCases = () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = [
        {
            title: "Wholesalers",
            icon: "📦",
            headline: "Stop Chasing Payments",
            desc: "Send a SAAKSHY link with every invoice. If they don't confirm, you don't ship next time. Build a verified ledger of who pays on time.",
            stat: "40% faster recovery"
        },
        {
            title: "Kirana & Retail",
            icon: "🏪",
            headline: "Digital Khata That Works",
            desc: "Customers say 'write it down', but notebooks get lost. SAAKSHY sends a subtle SMS link. They confirm the debt on their own phone, making recovery polite but firm.",
            stat: "95% less conflict"
        },
        {
            title: "Construction",
            icon: "🏗️",
            headline: "Material & Labor Tracking",
            desc: "Daily wages and material drops often happen on verbal trust. SAAKSHY locks the price and quantity at the moment of delivery.",
            stat: "Zero disputes"
        },
        {
            title: "Freelancers",
            icon: "💻",
            headline: "Proof of Scope",
            desc: "Clients changing requirements? Payments delayed? Use SAAKSHY to confirm the scope and payment terms before starting work.",
            stat: "Professional proof"
        },
        {
            title: "Agri-Traders",
            icon: "🚜",
            headline: "Mandi Settlement Proof",
            desc: "Farmers and traders deal in lakhs on verbal trust. SAAKSHY locks the rate and weight instantly via mobile, preventing 'bhaav' (price) disputes later.",
            stat: "Instant rate-lock"
        },
        {
            title: "Manufacturers",
            icon: "⚙️",
            headline: "Supplier Credit Score",
            desc: "You give credit to distributors. Who pays on time? SAAKSHY builds a behavior score for every distributor, helping you decide who gets the next shipment.",
            stat: "Data-driven credit"
        },
        {
            title: "Private Loans",
            icon: "🤝",
            headline: "Preserve Relationships",
            desc: "Lending to a friend? It's awkward to ask for a contract. SAAKSHY acts as the neutral third party. Sending a 'record link' is professional, not personal.",
            stat: "Relationship saved"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-24">
             {/* Section Title */}
             <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-16 tracking-tight">
                BUILT FOR <span className="text-blue-500">REAL BUSINESS</span>
             </h2>

             {/* Main Card Container */}
             <div className="relative bg-[#020617] border border-blue-500/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(37,99,235,0.1)] overflow-hidden min-h-[500px] flex flex-col">
                
                {/* Floating Tabs (Horizontal Scroll) */}
                <div className="flex gap-4 overflow-x-auto pb-4 mb-8 no-scrollbar md:flex-wrap">
                    {tabs.map((tab, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                                activeTab === idx
                                ? 'bg-white text-black shadow-xl scale-105'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                            }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            {tab.title}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-8 animate-fade-in key={activeTab}">
                        <h3 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            {tabs[activeTab].headline}
                        </h3>
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-lg">
                            {tabs[activeTab].desc}
                        </p>
                        
                        <div className="inline-flex items-center gap-3 bg-blue-900/20 border border-blue-500/30 rounded-lg px-5 py-3">
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-blue-400 font-mono font-bold uppercase text-sm tracking-wider">
                                REAL IMPACT: <span className="text-white">{tabs[activeTab].stat}</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Side Illustration (Abstract 3D-ish representation) */}
                    <div className="relative flex items-center justify-center h-full min-h-[300px]">
                         {/* Abstract Shape Background */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-[100px]"></div>
                         
                         {/* The "Icon" */}
                         <div className="relative z-10 transform transition-all duration-500 hover:scale-105 hover:rotate-2">
                             <div className="text-[150px] md:text-[200px] leading-none filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] grayscale opacity-80 select-none">
                                {tabs[activeTab].icon}
                             </div>
                             {/* Decorative Elements */}
                             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600/20 blur-2xl rounded-full"></div>
                         </div>
                    </div>
                </div>

                {/* Background Grid Pattern inside card */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.1] pointer-events-none"></div>
             </div>
        </div>
    );
};

// --- FAQ COMPONENT ---
const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-800">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
            >
                <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-amber-400' : 'text-slate-300 group-hover:text-white'}`}>
                    {question}
                </span>
                <span className={`ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-400' : 'text-slate-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-400 leading-relaxed text-sm max-w-2xl">
                    {answer}
                </p>
            </div>
        </div>
    )
}

// --- MAIN LANDING PAGE ---

export const LandingPage: React.FC<LandingPageProps> = ({ lang, setLang }) => {
  const [activeStep, setActiveStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const steps = scrollRef.current.querySelectorAll('.scroll-step');
        const viewportHeight = window.innerHeight;
        
        steps.forEach((step, index) => {
            const rect = step.getBoundingClientRect();
            // Trigger when element middle is in viewport middle
            if (rect.top < viewportHeight / 2 && rect.bottom > viewportHeight / 2) {
                setActiveStep(index);
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-slate-200 selection:bg-amber-900 selection:text-white overflow-x-hidden">
      
      <ParticleNetwork />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-6 px-6 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Shield Logo */}
                <div className="w-8 h-8 bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-2 16l-4-4 1.41-1.41L10 15.17l6.59-6.59L18 10l-8 8z" clipRule="evenodd"/>
                    </svg>
                </div>
                <span className="font-bold text-xl tracking-tighter text-white">SAAKSHY</span>
            </div>
            <div className="flex items-center gap-6">
                 <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors hidden md:block">Login</Link>
                 <Link to="/login" state={{ mode: 'REGISTER' }} className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] rounded">Get Access</Link>
            </div>
        </div>
      </nav>

      {/* --- HERO SECTION WITH SPOTLIGHT --- */}
      <SpotlightHero>
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none"></div>
          
          <div className="text-center z-10 max-w-5xl mx-auto space-y-8">
              <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter animate-fade-in-up delay-100 mix-blend-overlay">
                  TRUST IS <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 to-amber-600">
                      <GlitchText text="CURRENCY." />
                  </span>
              </h1>
              
              <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200 font-light">
                  The <span className="text-white font-medium">immutable memory layer</span> for informal commerce. 
                  We convert verbal promises into undeniable digital assets without intermediaries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up delay-300">
                  <Link 
                    to="/login" 
                    state={{ mode: 'REGISTER' }} 
                    className="group relative px-10 py-5 bg-white text-black font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
                  >
                      <span className="relative z-10 flex items-center gap-2">Start Protocol <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                  </Link>
                  <Link to="/about" className="px-10 py-5 border border-white/20 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-colors">
                      System Logic
                  </Link>
              </div>
          </div>
          
          <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      </SpotlightHero>

      {/* --- LIVE TICKER --- */}
      <LiveTicker />

      {/* --- VALUE PROP DEEP DIVE --- */}
      <section className="py-24 px-6 bg-slate-950 border-b border-white/5">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                      Why Verbal Contracts <br/>
                      <span className="text-blue-500">Fail at Scale.</span>
                  </h2>
                  <div className="space-y-6 text-slate-400 text-lg">
                      <p>
                          In high-trust communities, word of mouth is gold. But as your business grows, memory fades. Disputes arise not from malice, but from <span className="text-white font-bold">misalignment</span>.
                      </p>
                      <p>
                          SAAKSHY introduces a "Trust Checkpoint" — a simple, digital handshake that freezes the agreement in time.
                      </p>
                      <ul className="space-y-3 mt-4">
                          <li className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">✓</div>
                              <span>Eliminate "he said, she said"</span>
                          </li>
                          <li className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">✓</div>
                              <span>Professionalize casual lending</span>
                          </li>
                          <li className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">✓</div>
                              <span>Build a portable reputation</span>
                          </li>
                      </ul>
                  </div>
              </div>
              <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full"></div>
                  {/* Abstract Representation of Digital Handshake */}
                  <div className="relative z-10 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                      <div className="flex justify-between items-center mb-8 opacity-50">
                          <div className="h-2 w-24 bg-slate-700 rounded"></div>
                          <div className="h-2 w-12 bg-slate-700 rounded"></div>
                      </div>
                      <div className="space-y-4">
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700"></div>
                              <div className="flex-1 h-12 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center px-4 text-slate-500 font-mono text-xs">
                                  Request: ₹50,000 sent...
                              </div>
                          </div>
                          <div className="flex justify-center py-2">
                              <div className="h-8 w-0.5 bg-blue-500/50"></div>
                          </div>
                          <div className="flex items-center gap-4 flex-row-reverse">
                              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700"></div>
                              <div className="flex-1 h-12 bg-blue-900/20 rounded-lg border border-blue-500/50 flex items-center px-4 text-blue-400 font-bold text-xs justify-between">
                                  <span>CONFIRMED</span>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </div>
                          </div>
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-500">
                          <span>HASH: 0x8F...2A</span>
                          <span>TIME: 14:02 UTC</span>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* --- SCROLLYTELLING CONTAINER --- */}
      <div className="relative border-y border-white/5 bg-black">
          <div className="max-w-7xl mx-auto lg:flex" ref={scrollRef}>
              
              {/* SCROLLING NARRATIVE (Left Side) */}
              <div className="relative z-10 w-full lg:w-1/2 px-6">
                  
                  {/* STEP 1 */}
                  <div className="scroll-step min-h-screen flex items-center py-24">
                      <div className="max-w-md space-y-8">
                          <div className="lg:hidden mb-10"><VisualVoid /></div>
                          <span className="text-red-500 font-mono text-sm tracking-widest uppercase font-bold border-b border-red-500/30 pb-2">01. The Void</span>
                          <h2 className="text-4xl md:text-6xl font-black text-white leading-none">
                              Where Capital <br/>
                              <span className="text-slate-700 line-through decoration-red-500/50">Disappears.</span>
                          </h2>
                          <div className="space-y-4">
                              <p className="text-slate-400 text-lg leading-relaxed">
                                  Every unrecorded transaction is a leak in your business. When you rely solely on memory, you lose leverage.
                              </p>
                              <p className="text-slate-400 text-lg leading-relaxed">
                                  The "Void" is the space between what was agreed and what can be proven. SAAKSHY closes this gap.
                              </p>
                          </div>
                      </div>
                  </div>

                  {/* STEP 2 */}
                  <div className="scroll-step min-h-screen flex items-center py-24">
                      <div className="max-w-md space-y-8">
                          <div className="lg:hidden mb-10"><VisualLock /></div>
                          <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase font-bold border-b border-emerald-500/30 pb-2">02. The Lock</span>
                          <h2 className="text-4xl md:text-6xl font-black text-white leading-none">
                              Cryptographic <br/>
                              <span className="text-emerald-500">Certainty.</span>
                          </h2>
                          <p className="text-slate-400 text-lg leading-relaxed">
                              SAAKSHY acts as a neutral third-party vault. When both sides confirm via OTP, the record is locked. It cannot be deleted. It cannot be edited. It exists forever as <strong>Section 65B Compliant Evidence</strong>.
                          </p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
                                  <p className="text-white font-bold mb-1">Non-Repudiation</p>
                                  <p className="text-xs text-slate-500">They can't deny it later.</p>
                              </div>
                              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors">
                                  <p className="text-white font-bold mb-1">Time-Stamped</p>
                                  <p className="text-xs text-slate-500">Exact proof of when.</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* STEP 3 */}
                  <div className="scroll-step min-h-screen flex items-center py-24">
                      <div className="max-w-md space-y-8">
                          <div className="lg:hidden mb-10"><VisualGrowth /></div>
                          <span className="text-amber-500 font-mono text-sm tracking-widest uppercase font-bold border-b border-amber-500/30 pb-2">03. The Asset</span>
                          <h2 className="text-4xl md:text-6xl font-black text-white leading-none">
                              Reputation as <br/>
                              <span className="text-amber-500">Currency.</span>
                          </h2>
                          <p className="text-slate-400 text-lg leading-relaxed">
                              Every settled record builds your <strong>Trust Profile</strong>. Stop relying on bank statements that don't show your informal dealings. Use your SAAKSHY score to negotiate better credit terms.
                          </p>
                          <Link to="/login" state={{ mode: 'REGISTER' }} className="inline-flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest hover:translate-x-2 transition-transform mt-4">
                              Start Building <span className="text-xl">→</span>
                          </Link>
                      </div>
                  </div>

              </div>

              {/* STICKY VISUAL STAGE (Desktop) - REFACTORED TO BE STICKY */}
              <div className="hidden lg:flex lg:w-1/2 h-screen sticky top-0 items-center justify-center pointer-events-none">
                  <div className="relative w-full max-w-lg p-10">
                      <div className={`transition-all duration-700 absolute inset-0 flex items-center justify-center ${activeStep === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-10'}`}>
                          <VisualVoid />
                      </div>
                      <div className={`transition-all duration-700 absolute inset-0 flex items-center justify-center ${activeStep === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-10'}`}>
                          <VisualLock />
                      </div>
                      <div className={`transition-all duration-700 absolute inset-0 flex items-center justify-center ${activeStep === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 translate-y-10'}`}>
                          <VisualGrowth />
                      </div>
                  </div>
              </div>

          </div>
      </div>

      {/* --- TRUST SIMULATOR --- */}
      <TrustSimulator />

      {/* --- INDUSTRY USE CASES --- */}
      <UseCases />

      {/* --- FEATURES GRID (WITH 3D TILT) --- */}
      <section className="py-32 px-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-16 text-center tracking-tight">DEFENSE GRADE INFRASTRUCTURE</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <TiltCard className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:bg-slate-900 transition-colors group h-full">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-900/30 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Legal Admissibility</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          Our logs capture IP, device ID, and OTP verification timestamps. This structured data meets the requirements for <strong>Section 65B of the Indian Evidence Act</strong>.
                      </p>
                  </TiltCard>

                  {/* Feature 2 */}
                  <TiltCard className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:bg-slate-900 transition-colors group h-full">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-900/30 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Zero-Knowledge</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          We are an infrastructure utility, not an ad network. We do not sell your transaction graph. Your business relationships are visible only to you and your counterparty.
                      </p>
                  </TiltCard>

                  {/* Feature 3 */}
                  <TiltCard className="p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:bg-slate-900 transition-colors group h-full">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-900/30 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Dispute Flagging</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          Instead of "he said, she said," we offer a formal Dispute Protocol. Raising a flag freezes the record's status but preserves the history, proving the transaction existed.
                      </p>
                  </TiltCard>
              </div>
          </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-32 px-6 bg-black border-t border-white/5">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-12 text-center">COMMON QUERIES</h2>
              
              <FaqItem 
                question="Is this better than a WhatsApp screenshot?"
                answer="Yes. Screenshots can be faked, deleted, or lost. A SAAKSHY record is a neutral, third-party database entry. It requires active confirmation (OTP) from the other party, making it undeniable proof of agreement."
              />
              <FaqItem 
                question="Does the other person need to download the app?"
                answer="No. This is crucial. The counterparty receives a secure web link via WhatsApp or SMS. They can view the details and confirm the transaction using just their mobile browser. We do not force downloads."
              />
              <FaqItem 
                question="Can I edit a record if I made a mistake?"
                answer="No. Once a record is CONFIRMED, it is immutable (permanent) to ensure trust. If you made a mistake, you must 'Settle' it to zero and create a new correct record. This preserves the audit trail."
              />
              <FaqItem 
                question="Do you help recover money?"
                answer="We provide the unbribable evidence you need to recover money socially or legally, but we are not recovery agents. We are a technology infrastructure provider."
              />
              <FaqItem 
                question="Is my data safe?"
                answer="We use bank-grade AES-256 encryption. Our servers are located in India, complying with local data residency laws. We do not share your financial data with anyone."
              />
          </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="relative py-32 px-6 bg-gradient-to-t from-slate-900 to-black">
          <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter">
                  READY TO <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">STABILIZE?</span>
              </h2>
              <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto">
                  Join the network of verified businesses building on solid ground.
              </p>
              
              <Link 
                to="/login"
                state={{ mode: 'REGISTER' }}
                className="inline-block px-12 py-5 bg-white text-black font-black text-lg uppercase tracking-[0.2em] hover:bg-emerald-400 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)] rounded"
              >
                  Initiate Setup
              </Link>

              <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-slate-600 font-mono">
                  <p>© 2026 SAAKSHY SYSTEMS INC.</p>
                  <div className="flex gap-8 mt-4 md:mt-0">
                      <Link to="/privacy" className="hover:text-white transition-colors">Privacy Protocol</Link>
                      <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                      <Link to="/contact" className="hover:text-white transition-colors">Support Node</Link>
                  </div>
              </div>
          </div>
      </section>

      <style>{`
        @keyframes grow {
            from { height: 0; opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes float {
            0% { transform: translate(0, 0); }
            100% { transform: translate(10px, -10px); }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitch-1 {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }
        @keyframes glitch-2 {
            0% { transform: translate(0); }
            20% { transform: translate(2px, -2px); }
            40% { transform: translate(2px, 2px); }
            60% { transform: translate(-2px, -2px); }
            80% { transform: translate(-2px, 2px); }
            100% { transform: translate(0); }
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        @keyframes dash {
            to {
                stroke-dashoffset: -20;
            }
        }
        .animate-dash {
            animation: dash 1s linear infinite;
        }
        .animate-fade-in { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-glitch-1 { animation: glitch-1 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
        .animate-glitch-2 { animation: glitch-2 0.3s cubic-bezier(.25, .46, .45, .94) reverse both infinite; }
        .animate-marquee { animation: marquee 20s linear infinite; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  );
};
