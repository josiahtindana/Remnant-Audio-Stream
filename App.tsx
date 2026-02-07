
import React, { useState, useEffect } from 'react';
import { Broadcaster } from './components/Broadcaster';
import { Listener } from './components/Listener';
import { Layout } from './components/Layout';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'broadcaster' | 'listener'>('home');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Listen for live status from Firebase
    const statusRef = ref(db, 'status/main');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      setIsLive(data?.isLive || false);
    });

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#broadcaster') setView('broadcaster');
      else if (hash === '#listener') setView('listener');
      else setView('home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      unsubscribe();
    };
  }, []);

  const renderContent = () => {
    switch (view) {
      case 'broadcaster':
        return <Broadcaster onBack={() => window.location.hash = ''} />;
      case 'listener':
        return <Listener onBack={() => window.location.hash = ''} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center space-y-12 py-16 px-4 animate-fade-in">
            <div className="text-center max-w-lg">
              <h2 className="text-5xl font-bold text-rcn-navy mb-4">Remnant Audio Stream</h2>
              <div className="w-20 h-1 bg-rcn-orange mx-auto mb-6 rounded-full"></div>
              <p className="text-slate-600 leading-relaxed italic text-lg">
                "The Lord gave the word: great was the company of those that published it."
              </p>
              <p className="text-rcn-orange font-bold uppercase tracking-widest text-xs mt-4">— Psalm 68:11</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
              <button
                onClick={() => window.location.hash = 'listener'}
                className="group relative overflow-hidden p-10 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center space-y-6"
              >
                {isLive && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Now</span>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rcn-orange/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                <div className="w-20 h-20 bg-rcn-navy text-white rounded-2xl flex items-center justify-center transform transition-transform group-hover:rotate-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 11v3a4 4 0 0 0 4 4h12 a4 4 0 0 0 4-4v-3"/><path d="M12 4a8 8 0 0 0-8 8v3h16v-3a8 8 0 0 0-8-8Z"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-rcn-navy">Join the Stream</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-[200px] mx-auto">Listen to the live ministration and apostolic teaching.</p>
                </div>
              </button>

              <button
                onClick={() => window.location.hash = 'broadcaster'}
                className="group relative overflow-hidden p-10 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center space-y-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rcn-navy/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                <div className="w-20 h-20 bg-rcn-orange text-white rounded-2xl flex items-center justify-center transform transition-transform group-hover:-rotate-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-rcn-navy">Admin Portal</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-[200px] mx-auto">Broadcast live from the pulpit to the global network.</p>
                </div>
              </button>
            </div>
          </div>
        );
    }
  };

  return <Layout>{renderContent()}</Layout>;
};

export default App;
