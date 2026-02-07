
import React, { useState, useEffect, useRef } from 'react';
import { StreamStatus } from '../types';

const BROADCASTER_ID = 'rcn-ghana-main-stream';
const ADMIN_PASSCODE = 'Remnant2025';

interface BroadcasterProps {
  onBack: () => void;
}

export const Broadcaster: React.FC<BroadcasterProps> = ({ onBack }) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [listeners, setListeners] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const connectionsRef = useRef<Set<any>>(new Set());

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Invalid passcode for RCN Network.');
    }
  };

  const startStream = async () => {
    try {
      setStatus('starting');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const Peer = (window as any).Peer;
      if (!Peer) {
        throw new Error('Streaming engine not initialized.');
      }

      peerRef.current = new Peer(BROADCASTER_ID, { debug: 1 });

      peerRef.current.on('open', (id: string) => {
        setStatus('live');
      });

      peerRef.current.on('error', (err: any) => {
        if (err.type === 'unavailable-id') {
          setError('Another RCN broadcast is already active.');
        } else {
          setError(`Stream error: ${err.type}`);
        }
        stopStream();
      });

      peerRef.current.on('call', (call: any) => {
        call.answer(streamRef.current!);
        connectionsRef.current.add(call);
        setListeners(prev => prev + 1);
        call.on('close', () => {
          connectionsRef.current.delete(call);
          setListeners(prev => Math.max(0, prev - 1));
        });
      });

    } catch (err: any) {
      setError(err.message || 'Microphone access denied.');
      setStatus('error');
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    connectionsRef.current.clear();
    setListeners(0);
    setStatus('idle');
  };

  useEffect(() => {
    if (!(window as any).Peer) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
    return () => stopStream();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12 px-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-rcn-navy rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-rcn-navy">Broadcaster Login</h2>
            <p className="text-slate-500 text-sm mt-1">Authorized access only for RCN Ghana.</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rcn-orange focus:border-rcn-orange outline-none transition-all text-center text-lg tracking-widest"
                placeholder="PASSCODE"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-rcn-navy text-white rounded-xl hover:bg-slate-800 transition-colors font-bold uppercase tracking-widest shadow-lg shadow-blue-900/10"
            >
              Unlock Terminal
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-2 text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${status === 'live' ? 'bg-rcn-orange animate-ping' : 'bg-slate-300'}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-rcn-navy">
                {status === 'live' ? 'Live on Air' : status === 'starting' ? 'Preparing...' : 'System Idle'}
              </span>
            </div>
            <button onClick={onBack} className="text-slate-300 hover:text-rcn-navy transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-rcn-navy mb-2">Broadcast Console</h2>
            <p className="text-slate-400 font-medium">Global Network Audio Transmission</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
              <span className="block text-3xl font-bold text-rcn-navy">{listeners}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Live Listeners</span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
              <span className="block text-3xl font-bold text-rcn-navy">HQ</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Audio Profile</span>
            </div>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">{error}</div>}

          <div className="space-y-4">
            {status !== 'live' ? (
              <button
                onClick={startStream}
                disabled={status === 'starting'}
                className="w-full py-5 bg-rcn-orange hover:bg-orange-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                <span>{status === 'starting' ? 'ENGAGING...' : 'START BROADCAST'}</span>
              </button>
            ) : (
              <button
                onClick={stopStream}
                className="w-full py-5 bg-rcn-navy hover:bg-slate-800 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center space-x-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="5" y="5" rx="2" ry="2"/></svg>
                <span>END TRANSMISSION</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
