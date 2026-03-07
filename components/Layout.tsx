
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentLang: Language;
  setLang: (l: Language) => void;
  user?: User | null;
}

// --- Header Component (Used in Mobile & Public views) ---
const Header = ({ currentLang, setLang }: { currentLang: Language, setLang: (l: Language) => void }) => (
  <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
    <div className="flex items-center gap-3">
      {/* LOGO */}
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-1.028 1.201-2.129 1.637-3.295M11 11a1 1 0 102 0 1 1 0 00-2 0m-5 2a3.001 3.001 0 005.17 2.447m2.49 4.39a3.001 3.001 0 004.88-3.341m-9.52 4.417a5.998 5.998 0 007.61-2.357" />
          </svg>
      </div>
      <div>
        <h1 className="font-bold text-white leading-none tracking-tight text-lg drop-shadow-md">SAAKSHY</h1>
        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Trust Memory Layer</p>
      </div>
    </div>
    
    <select 
      value={currentLang}
      onChange={(e) => setLang(e.target.value as Language)}
      className="text-xs font-medium bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow cursor-pointer hover:bg-slate-700/50 backdrop-blur-md"
    >
      <option value={Language.ENGLISH}>English</option>
      <option value={Language.HINDI}>हिंदी</option>
      <option value={Language.HINGLISH}>Hinglish</option>
    </select>
  </header>
);

// Global Atmosphere Component
const Atmosphere = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] brightness-100 contrast-150 mix-blend-overlay"></div>
        
        {/* Deep Space Glows */}
        <div className="absolute top-[-20%] left-[10%] w-[70vw] h-[70vw] bg-indigo-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[0%] w-[60vw] h-[60vw] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[40%] w-[40vw] h-[40vw] bg-emerald-900/05 blur-[100px] rounded-full mix-blend-screen"></div>

        {/* Perspective Grid Floor (Subtle) */}
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_top,black,transparent)]" style={{ transform: 'perspective(1000px) rotateX(60deg) translateY(100px)' }}></div>
    </div>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentLang, setLang, user }) => {
  const t = TRANSLATIONS[currentLang];
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'text-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] border-l-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50';
  const isActiveMobile = (path: string) => location.pathname === path ? 'text-blue-500' : 'text-slate-400';

  // --- Public Layout (Login/Landing) ---
  if (!user) {
      return (
          <div className="min-h-screen bg-slate-950 font-sans text-slate-200 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <Atmosphere />
            <div className="relative z-10">
                {location.pathname !== '/' && location.pathname !== '/login' && <Header currentLang={currentLang} setLang={setLang} />}
                <main className="w-full">
                {children}
                </main>
            </div>
          </div>
      );
  }

  // --- Authenticated Layout (Dashboard etc) ---
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col md:flex-row relative overflow-hidden perspective-wrapper">
      <Atmosphere />
      
      {/* DESKTOP SIDEBAR (Visible on md+) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/60 backdrop-blur-2xl border-r border-slate-800/50 h-screen sticky top-0 z-40 shadow-2xl">
         <div className="p-6 border-b border-slate-800/50">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-1.028 1.201-2.129 1.637-3.295M11 11a1 1 0 102 0 1 1 0 00-2 0m-5 2a3.001 3.001 0 005.17 2.447m2.49 4.39a3.001 3.001 0 004.88-3.341m-9.52 4.417a5.998 5.998 0 007.61-2.357" />
                    </svg>
                </div>
                <h1 className="font-bold text-xl text-white tracking-tight drop-shadow-sm">SAAKSHY</h1>
             </div>
         </div>

         <nav className="flex-1 p-4 space-y-2">
            <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive('/dashboard')}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {t.nav_dashboard}
            </Link>
            
            <Link to="/create" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive('/create')}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t.nav_create}
            </Link>

            <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive('/profile')}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.nav_profile}
            </Link>

            <Link to="/more" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${isActive('/more')}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {t.nav_more}
            </Link>
         </nav>

         <div className="p-4 border-t border-slate-800/50">
             <div className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.business?.businessName}</p>
                </div>
             </div>
             
             <select 
                value={currentLang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="mt-3 w-full text-xs font-medium bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-2 text-slate-400 outline-none focus:ring-1 focus:ring-blue-500 backdrop-blur-sm"
              >
                <option value={Language.ENGLISH}>English</option>
                <option value={Language.HINDI}>हिंदी</option>
                <option value={Language.HINGLISH}>Hinglish</option>
              </select>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
          
          {/* MOBILE HEADER (Hidden on Desktop) */}
          <div className="md:hidden">
              <Header currentLang={currentLang} setLang={setLang} />
          </div>

          <main className="flex-1 overflow-y-auto w-full pb-24 md:pb-8">
            <div className="mx-auto w-full">
                {children}
            </div>
          </main>

          {/* MOBILE BOTTOM NAV (Hidden on Desktop) */}
          <nav className="md:hidden fixed bottom-0 w-full z-50 pb-safe">
            {/* Glass Background with Gradient Border Top */}
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"></div>
            
            <div className="relative grid grid-cols-5 h-[70px] items-end pb-2">
              {/* Dashboard */}
              <Link to="/" className="flex flex-col items-center justify-center gap-1 h-full group">
                 <div className={`p-1.5 rounded-xl transition-all duration-300 ${location.pathname === '/dashboard' || location.pathname === '/' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                 </div>
                 <span className={`text-[10px] font-medium transition-colors ${location.pathname === '/dashboard' || location.pathname === '/' ? 'text-blue-400' : 'text-slate-500'}`}>Home</span>
              </Link>

              {/* Partners */}
              <Link to="/partners" className="flex flex-col items-center justify-center gap-1 h-full group">
                 <div className={`p-1.5 rounded-xl transition-all duration-300 ${location.pathname === '/partners' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                 </div>
                 <span className={`text-[10px] font-medium transition-colors ${location.pathname === '/partners' ? 'text-blue-400' : 'text-slate-500'}`}>Partners</span>
              </Link>
              
              {/* Create (FAB) - Floating above */}
              <div className="flex justify-center h-full items-start -mt-6">
                  <Link to="/create" className="group relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity rotate-45"></div>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl rotate-45 flex items-center justify-center shadow-xl border-4 border-slate-900 group-active:scale-95 transition-all duration-300 z-10 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                  </Link>
              </div>

              {/* Profile */}
              <Link to="/profile" className="flex flex-col items-center justify-center gap-1 h-full group">
                 <div className={`p-1.5 rounded-xl transition-all duration-300 ${location.pathname === '/profile' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                 </div>
                 <span className={`text-[10px] font-medium transition-colors ${location.pathname === '/profile' ? 'text-blue-400' : 'text-slate-500'}`}>Profile</span>
              </Link>
              
              {/* More */}
              <Link to="/more" className="flex flex-col items-center justify-center gap-1 h-full group">
                 <div className={`p-1.5 rounded-xl transition-all duration-300 ${location.pathname === '/more' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                 </div>
                 <span className={`text-[10px] font-medium transition-colors ${location.pathname === '/more' ? 'text-blue-400' : 'text-slate-500'}`}>More</span>
              </Link>
            </div>
          </nav>
      </div>
      <style>{`
          .perspective-wrapper {
              perspective: 2000px;
          }
      `}</style>
    </div>
  );
};
