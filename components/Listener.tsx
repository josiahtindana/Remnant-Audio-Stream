
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, onDisconnect } from 'firebase/database';

const BROADCASTER_ID = 'rcn-ghana-main-stream';

interface ListenerProps {
  onBack: () => void;
}

export const Listener: React.FC<ListenerProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'offline'>('idle');
  const [firebaseLive, setFirebaseLive] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);

  const peerRef = useRef<any>(null);
  const callRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenerPresenceRef = useRef<any>(null);

  useEffect(() => {
    const statusRef = ref(db, 'status/main');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      const isCurrentlyLive = !!data?.isLive;
      setFirebaseLive(isCurrentlyLive);
      
      if (!isCurrentlyLive && status === 'connected') {
        disconnect();
        setStatus('offline');
        setError('Broadcast has ended.');
      }
    });
    return () => unsubscribe();
  }, [status]);

  const disconnect = () => {
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (listenerPresenceRef.current) {
      set(listenerPresenceRef.current, null);
      listenerPresenceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    setIsPlaying(false);
    setStatus('idle');
  };

  const connectToStream = () => {
    try {
      setStatus('connecting');
      setError(null);

      const Peer = (window as any).Peer;
      if (!Peer) throw new Error('System initialization failed.');

      // Create a unique peer ID for the listener
      peerRef.current = new Peer(null, { debug: 1 });

      peerRef.current.on('open', (id: string) => {
        // 1. Register presence for listener count
        const presenceRef = ref(db, `listeners/${id}`);
        listenerPresenceRef.current = presenceRef;
        set(presenceRef, { active: true });
        onDisconnect(presenceRef).remove();

        // 2. Call the broadcaster with an empty stream (receive-only mode)
        const call = peerRef.current.call(BROADCASTER_ID, new MediaStream());
        callRef.current = call;

        call.on('stream', (remoteStream: MediaStream) => {
          setStatus('connected');
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play()
              .then(() => setIsPlaying(true))
              .catch(() => setError("TAP THE PLAY BUTTON TO START AUDIO"));
          }
        });

        call.on('error', (err: any) => {
          setError('Signal lost or broadcast offline.');
          setStatus('offline');
        });

        call.on('close', () => {
          setStatus('offline');
          setIsPlaying(false);
        });
      });

      peerRef.current.on('error', (err: any) => {
        if (err.type === 'peer-unavailable') {
          setError('Broadcaster is currently offline.');
        } else {
          setError('Connection error occurred.');
        }
        setStatus('offline');
      });

    } catch (err: any) {
      setError('Connection failed.');
      setStatus('offline');
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setError("UNABLE TO PLAY AUDIO"));
      }
    }
  };

  useEffect(() => {
    if (!(window as any).Peer) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
    return () => disconnect();
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
        {/* Brand Banner */}
        <div className="relative h-48 bg-rcn-navy flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 flex items-center justify-center">
                <svg className="w-[150%] h-[150%] animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '80s' }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5 5" />
                </svg>
            </div>
            <div className="relative text-center z-10 px-6">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <svg viewBox="0 0 100 100" className="w-12 h-12">
                        <path d="M50 5 C30 25 10 45 15 65 C20 85 50 95 80 85 C95 75 85 45 50 5Z" className="fill-orange-500" />
                        <rect x="30" y="70" width="8" height="20" rx="4" className="fill-[#1A1A3F]" />
                        <rect x="46" y="70" width="8" height="20" rx="4" className="fill-[#1A1A3F]" />
                        <rect x="62" y="70" width="8" height="20" rx="4" className="fill-[#1A1A3F]" />
                    </svg>
                </div>
            </div>
        </div>

        <div className="p-10">
          <audio ref={audioRef} className="hidden" autoPlay playsInline />

          {status !== 'connected' ? (
            <div className="text-center py-6">
              <div className="mb-8 flex flex-col items-center">
                {firebaseLive === true ? (
                  <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 mb-4">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Signal Detected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 mb-4">
                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">System Offline</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-rcn-navy mt-2">Remnant Audio Network</h3>
                <p className="text-slate-400 text-sm italic mt-2">"publishing the company of the word"</p>
              </div>

              <button
                onClick={connectToStream}
                disabled={status === 'connecting' || firebaseLive === false}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl disabled:opacity-50 ${
                  firebaseLive === true ? 'bg-rcn-navy text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {status === 'connecting' ? 'CONNECTING...' : 'ENTER LIVE STREAM'}
              </button>
              {error && <p className="mt-6 text-rcn-orange text-xs font-bold uppercase tracking-wider">{error}</p>}
            </div>
          ) : (
            <div className="space-y-12">
              <div className="flex flex-col items-center">
                <div className="relative group">
                    <div className={`absolute inset-0 bg-rcn-orange/20 rounded-full blur-2xl transition-all duration-1000 ${isPlaying ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`}></div>
                    <button
                      onClick={togglePlayback}
                      className="relative w-32 h-32 bg-rcn-navy text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
                    >
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="currentColor"><rect width="4" height="16" x="6" y="4" rx="1"/><rect width="4" height="16" x="14" y="4" rx="1"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="currentColor" className="ml-2"><path d="m7 4 12 8-12 8V4z"/></svg>
                      )}
                    </button>
                </div>
                <div className="mt-8 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
                        {isPlaying ? 'Receiving Apostolic Word' : 'Playback Paused'}
                    </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setVolume(val);
                            if (audioRef.current) audioRef.current.volume = val / 100;
                        }}
                        className="flex-grow accent-rcn-orange h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
              </div>
              
              <button 
                onClick={disconnect}
                className="w-full py-4 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 uppercase tracking-widest text-xs border border-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="15"/><line x1="15" x2="9" y1="9" y2="15"/></svg>
                <span>End Stream Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-rcn-navy text-xs font-black uppercase tracking-[0.2em] transition-colors"
        >
          Exit Broadcast Terminal
        </button>
      </div>
    </div>
  );
};
