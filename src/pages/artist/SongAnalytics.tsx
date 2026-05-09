import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, BarChart2, Users, Layout, 
  Smartphone, Globe, ArrowUpRight, ArrowDownRight,
  TrendingUp, Activity, Target, Layers, Play
} from 'lucide-react';
import Chart from 'react-apexcharts';
import songService, { Song } from '../../services/songService';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { ApexOptions } from 'apexcharts';

interface AnalyticsData {
  totalPlays: number;
  dailyStats: { date: string; plays: number }[];
  deviceStats: { device: string; count: number }[];
  period: number;
}

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';

export default function SongAnalytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [song, setSong] = useState<Song | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [songData, analyticsData] = await Promise.all([
        songService.getSongById(id!),
        songService.getSongAnalytics(id!, days)
      ]);
      setSong(songData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const lineChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter, sans-serif',
      sparkline: { enabled: false },
      background: 'transparent'
    },
    theme: { mode: 'dark' },
    colors: ['#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100, 100]
      }
    },
    xaxis: {
      categories: analytics?.dailyStats.map(d => d.date) || [],
      labels: {
        style: { colors: '#71717a', fontSize: '10px', fontWeight: 700 },
        rotate: -45,
        offsetY: 5
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#71717a', fontSize: '10px', fontWeight: 700 },
        formatter: (val) => val.toFixed(0)
      }
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.04)',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'dd MMM' },
      y: { formatter: (val) => `${val} transmissions` }
    }
  };

  const donutChartOptions: ApexOptions = {
    chart: { type: 'donut', background: 'transparent' },
    theme: { mode: 'dark' },
    labels: analytics?.deviceStats.map(d => d.device.charAt(0).toUpperCase() + d.device.slice(1)) || [],
    colors: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'TOTAL',
              color: '#71717a',
              fontSize: '10px',
              fontWeight: 900,
              formatter: () => analytics?.totalPlays.toLocaleString() || '0'
            },
            value: {
              show: true,
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 900,
              offsetY: 5
            }
          }
        }
      }
    },
    stroke: { show: false },
    dataLabels: { enabled: false }
  };

  if (loading && !song) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-pulse">
        <div className="flex items-center gap-6">
           <Skeleton className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/[0.06]" />
           <div className="space-y-3">
              <Skeleton className="h-8 w-64 bg-zinc-900 rounded-lg" />
              <Skeleton className="h-4 w-48 bg-zinc-900 rounded-lg" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 bg-zinc-900 border border-white/[0.06] rounded-2xl" />
          <Skeleton className="h-40 bg-zinc-900 border border-white/[0.06] rounded-2xl" />
          <Skeleton className="h-40 bg-zinc-900 border border-white/[0.06] rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Skeleton className="lg:col-span-2 h-[500px] bg-zinc-900 border border-white/[0.06] rounded-2xl" />
           <Skeleton className="h-[500px] bg-zinc-900 border border-white/[0.06] rounded-2xl" />
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, colorClass }: any) => (
    <div className={`${card} p-7 relative overflow-hidden group cursor-default`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none group-hover:bg-white/[0.02] transition-all" />
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-950 border border-white/[0.04] shadow-inner text-emerald-500 group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center px-3 py-1 rounded-lg bg-zinc-950 border border-white/[0.02] text-[10px] font-black italic gap-1 shadow-inner ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">{title}</p>
      <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter italic group-hover:text-emerald-500 transition-colors">{value}</h3>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-700">
      
      {/* ── Branded Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={() => navigate('/artist/songs')}
            className="w-12 h-12 flex items-center justify-center bg-zinc-950 hover:bg-emerald-500 hover:text-white text-zinc-500 rounded-xl transition-all border border-white/[0.06] shadow-xl group/back"
          >
            <ChevronLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Sonic Intelligence Cycle</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
              {song?.name} <span className="text-zinc-600">/</span> Telemetry
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Track performance metrics over the last {days} distribution days.</p>
          </div>
        </div>

        {/* Tactical Filters */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-zinc-950 border border-white/[0.04] rounded-2xl p-1.5 flex items-center gap-1.5 shadow-inner">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl italic ${
                  days === d
                    ? 'bg-white text-zinc-900 shadow-2xl'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Transmissions" 
          value={analytics?.totalPlays.toLocaleString() || '0'} 
          icon={Activity} 
        />
        <StatCard 
          title="Recent Ingestion" 
          value={analytics?.dailyStats.reduce((sum, d) => sum + d.plays, 0).toLocaleString() || '0'} 
          icon={TrendingUp} 
          trend={12.5}
        />
        <StatCard 
          title="Terminal Access" 
          value={analytics?.deviceStats.length || '0'} 
          icon={Smartphone} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streaming History HUD */}
        <div className={`${card} lg:col-span-2 p-8 relative overflow-hidden`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                  <Layers className="h-5 w-5 text-emerald-500" />
               </div>
               <div>
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Streaming Trajectory</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Daily ingestion cycles for this sector</p>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-white/[0.02] shadow-inner">
              <Calendar size={14} className="text-emerald-500/50" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">{analytics?.dailyStats[0]?.date} — {analytics?.dailyStats[analytics.dailyStats.length - 1]?.date}</span>
            </div>
          </div>
          <div className="h-[380px] w-full">
            {analytics?.dailyStats.length ? (
              <Chart 
                options={lineChartOptions} 
                series={[{ name: 'Transmissions', data: analytics.dailyStats.map(d => d.plays) }]} 
                type="area" 
                height="100%" 
                width="100%"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-950/20 rounded-2xl border border-dashed border-white/[0.04]">
                <Activity size={64} className="mb-4 opacity-10" />
                <p className="text-[11px] font-black uppercase tracking-widest">No spectral data detected in this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Breakdown HUD */}
        <div className={`${card} p-8 flex flex-col relative overflow-hidden`}>
          <div className="flex items-center gap-4 mb-8">
             <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                <Smartphone className="h-5 w-5 text-emerald-500" />
             </div>
             <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Access Matrix</h2>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Fan terminal identification</p>
             </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-6">
            {analytics?.deviceStats.length ? (
              <>
                <div className="w-full relative">
                   <Chart 
                     options={donutChartOptions} 
                     series={analytics.deviceStats.map(d => d.count)} 
                     type="donut" 
                     width="100%" 
                   />
                </div>
                <div className="mt-12 w-full space-y-4">
                  {analytics.deviceStats.map((d, i) => (
                    <div key={d.device} className="group flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-white/[0.02] hover:border-emerald-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: donutChartOptions.colors![i % 4], color: donutChartOptions.colors![i % 4] }}></div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-zinc-300 transition-colors">{d.device}</span>
                      </div>
                      <span className="text-[11px] font-black text-white italic tracking-tighter">{((d.count / (analytics.totalPlays || 1)) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 w-full bg-zinc-950/20 rounded-2xl border border-dashed border-white/[0.04]">
                <Target size={64} className="mb-4 opacity-10" />
                <p className="text-[11px] font-black uppercase tracking-widest text-center px-6">Terminal identification unsuccessful</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
