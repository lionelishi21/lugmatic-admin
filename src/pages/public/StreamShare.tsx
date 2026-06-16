import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Radio, WifiOff } from 'lucide-react';
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import api from '@/services/api';

interface StreamInfo {
  title: string;
  host: string;
}

interface TokenData {
  token: string;
  url: string;
  roomName: string;
  stream: StreamInfo;
}

type PageState = 'loading' | 'offline' | 'live' | 'error';

export default function StreamShare() {
  const { streamId } = useParams<{ streamId: string }>();
  const [state, setState] = useState<PageState>('loading');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!streamId) return;
    api.get(`/live-stream/${streamId}/public-token`)
      .then(res => {
        setTokenData((res.data as any).data);
        setState('live');
      })
      .catch(err => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || '';
        if (status === 400 && msg.toLowerCase().includes('not currently live')) {
          setState('offline');
        } else {
          setErrorMsg(msg || 'Stream unavailable');
          setState('error');
        }
      });
  }, [streamId]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
        <span className="text-emerald-400 font-bold text-sm tracking-tight">Lugmatic</span>
        {state === 'live' && tokenData && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {state === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-zinc-500 text-sm">Connecting to stream…</p>
            </div>
          </div>
        )}

        {state === 'offline' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center mx-auto">
                <WifiOff className="h-8 w-8 text-zinc-600" />
              </div>
              <h2 className="text-zinc-900 dark:text-white font-bold text-lg">Stream is Offline</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                This stream isn't live right now. The artist may start streaming soon — try refreshing this page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-emerald-600 text-zinc-900 dark:text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-3 max-w-sm">
              <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center mx-auto">
                <Radio className="h-8 w-8 text-zinc-600" />
              </div>
              <h2 className="text-zinc-900 dark:text-white font-bold text-lg">Unavailable</h2>
              <p className="text-zinc-500 text-sm">{errorMsg || 'This stream could not be loaded.'}</p>
            </div>
          </div>
        )}

        {state === 'live' && tokenData && (
          <div className="flex-1 flex flex-col">
            {/* Stream info bar */}
            <div className="px-5 py-3 bg-zinc-900 border-b border-white/[0.05]">
              <h1 className="text-zinc-900 dark:text-white font-semibold text-sm truncate">{tokenData.stream.title}</h1>
              <p className="text-zinc-500 text-xs mt-0.5">{tokenData.stream.host}</p>
            </div>

            {/* LiveKit room — viewer only */}
            <div className="flex-1">
              <LiveKitRoom
                serverUrl={tokenData.url}
                token={tokenData.token}
                connect={true}
                video={false}
                audio={false}
                data-lk-theme="default"
                style={{ height: '100%' }}
              >
                <VideoConference />
              </LiveKitRoom>
            </div>

            <p className="text-center text-zinc-700 text-xs py-2">
              Watching as guest · <a href="https://lugmaticmusic.com/register" className="text-emerald-500 hover:underline">Join Lugmatic</a> to interact
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
