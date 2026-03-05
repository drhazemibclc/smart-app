// Add this to your root layout or a debug component
// src/components/debug/network-debug.tsx
'use client';

import { useEffect, useState } from 'react';

export function NetworkDebug() {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'issue'>('checking');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString()}: ${msg}`]);

    // Check API connectivity
    fetch('/api/health')
      .then(res => {
        if (res.ok) {
          addLog('✅ API health check passed');
          setStatus('healthy');
        } else {
          addLog(`❌ API returned ${res.status}`);
          setStatus('issue');
        }
      })
      .catch(err => {
        addLog(`❌ API fetch failed: ${err.message}`);
        setStatus('issue');
      });

    // Log navigation events
    const handleOnline = () => addLog('📡 Network online');
    const handleOffline = () => addLog('📡 Network offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (status === 'healthy') return null;

  return (
    <div className='fixed right-4 bottom-4 z-50 max-w-md rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg'>
      <h3 className='mb-2 font-bold text-red-800'>Network Debug</h3>
      <div className='max-h-60 overflow-auto text-xs'>
        {logs.map((log, i) => (
          <div
            className='border-red-100 border-b py-1 font-mono'
            key={i}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
