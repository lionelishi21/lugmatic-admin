import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, BarChart2, Users, Layout, 
  Smartphone, Globe, ArrowUpRight, ArrowDownRight,
  TrendingUp, Activity, Target, Layers, Play,
  Zap, Headphones, Activity as ActivityIcon,
  Shield, Database, Radio, Disc, Mic,
  Clock, Filter, SlidersHorizontal, ArrowRight,
  ChevronRight, FileText, Search
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
    stroke: { curve: 'smooth', width: 2.5 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [20, 100, 100, 100]
      }
    },
    xaxis: {
      categories: analytics?.dailyStats.map(d => d.date) || [],
      labels: {
        style: { colors: '#71717a', fontSize: '10px', fontWeight: 600 },
        rotate: -45,
        offsetY: 5
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#71717a', fontSize: '10px', fontWeight: 600 },
        formatter: (val) => val.toFixed(0)
      }
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.03)',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'dd MMM' },
      y: { formatter: (val) => `${val} streams` }
    }
  };

  const donutChartOptions: ApexOptions = {
    chart: { type: 'donut', background: 'transparent' },
    theme: { mode: 'dark' },
    labels: analytics?.deviceStats.map(d => d.device) || [],
    colors: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'],
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Plays',
              color: '#71717a',
              fontSize: '11px',
              fontWeight: 700,
              formatter: () => analytics?.totalPlays.toLocaleString() || '0'
            },
            value: {
              show: true,
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 800,
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
      <div className="space-y-10 pb-24 opacity-60">
        <div className="flex items-center gap-8">
           <Skeleton className="h-16 w-16 rounded-2xl bg-white/5" />
           <div className="space-y-3">
              <Skeleton className="h-8 w-64 bg-white/5 rounded-lg" />
              <Skeleton className="h-4 w-48 bg-white/5 rounded-lg" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 bg-white/5 rounded-2xl" />
          <Skeleton className="h-40 bg-white/5 rounded-2xl" />
          <Skeleton className="h-40 bg-white/5 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Skeleton className="lg:col-span-2 h-[500px] bg-white/5 rounded-2xl" />
           <Skeleton className="h-[500px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={() => navigate('/artist/songs')}
            className="w-12 h-12 flex items-center justify-center bg-zinc-950/40 hover:bg-white text-zinc-600 hover:text-black rounded-xl transition-all border border-white/5 shadow-xl group/back"
          >
            <ChevronLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight text-white leading-none">
                {song?.name} Analytics
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            <p className="text-zinc-500 font-medium">Detailed performance metrics and audience insights for your track.</p>
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2 bg-zinc-950/40 p-1 rounded-2xl border border-white/5 shadow-xl backdrop-blur-3xl">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-6 py-2.5 text-xs font-semibold transition-all rounded-xl ${
                days === d
                  ? 'bg-white text-black shadow-lg'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Total Streams', value: analytics?.totalPlays.toLocaleString() || '0', icon: ActivityIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { title: 'Recent Growth', value: analytics?.dailyStats.reduce((sum, d) => sum + d.plays, 0).toLocaleString() || '0', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/5', trend: '+12.5%', trendUp: true },
          { title: 'Active Devices', value: analytics?.deviceStats.length || '0', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-500/5' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="premium-card group hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              {stat.trend && (
                <div className={`flex items-center px-3 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] font-bold gap-1 shadow-inner ${stat.trendUp ? 'text-emerald-500' : 'text-zinc-500'}`}>
                  {stat.trendUp && <ArrowUpRight size={12} />}
                  {stat.trend}
                </div>
              )}
            </div>
            <p className="text-zinc-500 text-xs font-semibold mb-1.5">{stat.title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight tabular-nums leading-none group-hover:text-emerald-400 transition-colors">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stream Chart */}
        <div className="premium-card lg:col-span-2 !p-0 overflow-hidden border-white/5 shadow-2xl flex flex-col">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-950/20">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                 <Layers className="text-emerald-500" size={20} />
              </div>
              <div>
                 <h3 className="text-lg font-bold text-white">Streaming History</h3>
                 <p className="text-xs text-zinc-500 font-medium">Daily stream distribution for this track</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-8">
            <div className="h-[380px] w-full">
              {analytics?.dailyStats.length ? (
                <Chart 
                  options={lineChartOptions} 
                  series={[{ name: 'Streams', data: analytics.dailyStats.map(d => d.plays) }]} 
                  type="area" 
                  height="100%" 
                  width="100%"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-800 bg-zinc-950/40 rounded-3xl border border-dashed border-white/5 relative overflow-hidden">
                  <ActivityIcon size={48} className="mb-4 opacity-10" />
                  <p className="text-xs font-bold uppercase tracking-widest">No streaming data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Device Chart */}
        <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl flex flex-col">
          <div className="p-8 border-b border-white/5 bg-zinc-950/20">
             <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                   <Smartphone className="text-emerald-500" size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">Device Matrix</h3>
                   <p className="text-xs text-zinc-500 font-medium">Audience endpoint distribution</p>
                </div>
             </div>
          </div>
          
          <div className="flex-1 p-8 flex flex-col">
            {analytics?.deviceStats.length ? (
              <>
                <div className="w-full relative py-4">
                   <Chart 
                     options={donutChartOptions} 
                     series={analytics.deviceStats.map(d => d.count)} 
                     type="donut" 
                     width="100%" 
                   />
                </div>
                <div className="mt-8 space-y-3">
                  {analytics.deviceStats.map((d, i) => (
                    <div key={d.device} className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-950/50 border border-white/5 hover:border-emerald-500/20 transition-all shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: donutChartOptions.colors![i % 4] }}></div>
                        <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-200 transition-colors">{d.device}</span>
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{((d.count / (analytics.totalPlays || 1)) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-800 bg-zinc-950/40 rounded-3xl border border-dashed border-white/5 relative overflow-hidden">
                <Target size={48} className="mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest text-center px-8">Device data unavailable</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
