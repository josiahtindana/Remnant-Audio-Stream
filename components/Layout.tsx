
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => window.location.hash = ''}
          >
            <div className="flex items-center">
               <div className="w-12 h-12 bg-rcn-navy rounded-lg flex items-center justify-center text-white overflow-hidden p-1">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                    <path d="M50 5 C30 25 10 45 15 65 C20 85 50 95 80 85 C95 75 85 45 50 5Z" className="text-orange-500" />
                    <rect x="30" y="70" width="8" height="20" rx="4" className="text-white" />
                    <rect x="46" y="70" width="8" height="20" rx="4" className="text-white" />
                    <rect x="62" y="70" width="8" height="20" rx="4" className="text-white" />
                  </svg>
               </div>
               <div className="ml-3">
                 <h1 className="text-xl font-bold tracking-tight text-rcn-navy leading-none">Remnant Audio Stream</h1>
               </div>
            </div>
          </div>
          <nav className="hidden sm:block">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Ministry Broadcast</span>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 px-4 mt-auto">
        <div className="max-w-5xl mx-auto text-center text-slate-500 text-sm">
          <p className="font-bold text-rcn-navy">Remnant Christian Network Ghana</p>
          <p className="mt-1 text-slate-400 italic">"striving towards the rebirth of apostolic christianity"</p>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-slate-400">© {new Date().getFullYear()} Official Digital Broadcast</p>
        </div>
      </footer>
    </div>
  );
};
