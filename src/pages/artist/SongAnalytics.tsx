import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, BarChart2, Users, Layout, Smartphone, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
      sparkline: { enabled: false }
    },
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
        style: { colors: '#6b7280', fontSize: '10px' },
        rotate: -45,
        offsetY: 5
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontSize: '10px' },
        formatter: (val) => val.toFixed(0)
      }
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } }
    },
    tooltip: {
      theme: 'light',
      x: { format: 'dd MMM' },
      y: { formatter: (val) => `${val} plays` }
    }
  };

  const donutChartOptions: ApexOptions = {
    chart: { type: 'donut' },
    labels: analytics?.deviceStats.map(d => d.device.charAt(0).toUpperCase() + d.device.slice(1)) || [],
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    legend: { position: 'bottom', fontSize: '12px' },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => analytics?.totalPlays.toLocaleString() || '0'
            }
          }
        }
      }
    },
    dataLabels: { enabled: false }
  };

  if (loading && !song) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-xl ${colorClass}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold gap-0.5 ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/artist/songs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{song?.name} Analytics</h1>
            <p className="text-sm text-gray-500">Track performance over the last {days} days</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${days === d ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Streams" 
          value={analytics?.totalPlays.toLocaleString() || '0'} 
          icon={BarChart2} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Recent Growth" 
          value={analytics?.dailyStats.reduce((sum, d) => sum + d.plays, 0).toLocaleString() || '0'} 
          icon={TrendingUp} 
          trend={12.5}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard 
          title="Unique Devices" 
          value={analytics?.deviceStats.length || '0'} 
          icon={Smartphone} 
          colorClass="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Streaming History</h2>
              <p className="text-xs text-gray-500">Daily play counts for this period</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={14} />
              <span>{analytics?.dailyStats[0]?.date} - {analytics?.dailyStats[analytics.dailyStats.length - 1]?.date}</span>
            </div>
          </div>
          <div className="h-[350px]">
            {analytics?.dailyStats.length ? (
              <Chart 
                options={lineChartOptions} 
                series={[{ name: 'Plays', data: analytics.dailyStats.map(d => d.plays) }]} 
                type="area" 
                height="100%" 
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart2 size={48} className="mb-2 opacity-20" />
                <p>No streaming data for this period</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Device Breakdown</h2>
          <p className="text-xs text-gray-500 mb-8">Where your fans are listening</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            {analytics?.deviceStats.length ? (
              <>
                <Chart 
                  options={donutChartOptions} 
                  series={analytics.deviceStats.map(d => d.count)} 
                  type="donut" 
                  width="100%" 
                />
                <div className="mt-8 w-full space-y-3">
                  {analytics.deviceStats.map((d, i) => (
                    <div key={d.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: donutChartOptions.colors![i % 4] }}></div>
                        <span className="text-xs font-medium text-gray-600 capitalize">{d.device}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">{((d.count / (analytics.totalPlays || 1)) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400">
                <Smartphone size={48} className="mb-2 opacity-20 mx-auto" />
                <p>No device data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const TrendingUp = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);
