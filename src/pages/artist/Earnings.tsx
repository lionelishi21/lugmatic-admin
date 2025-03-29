import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { DollarSign, TrendingUp, BarChart2, Calendar, Download, ChevronDown, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface EarningsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  streamEarnings: number;
  giftEarnings: number;
}

interface EarningsData {
  id: string;
  amount: number;
  source: 'stream' | 'gift' | 'subscription';
  source_name: string;
  created_at: string;
  status: 'pending' | 'paid';
  payout_date?: string;
}

export default function Earnings() {
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    streamEarnings: 0,
    giftEarnings: 0
  });
  const [earnings, setEarnings] = useState<EarningsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    fetchEarningsData();
  }, [selectedMonth, statusFilter]);

  const fetchEarningsData = async () => {
    try {
      // Simulate fetching earnings from a different source
      const mockEarnings = [
        // Add mock earnings here
      ];
      setEarnings(mockEarnings);

      // Calculate stats
      const total = mockEarnings.reduce((sum, earning) => sum + earning.amount, 0);
      const streamTotal = mockEarnings
        .filter(earning => earning.source === 'stream')
        .reduce((sum, earning) => sum + earning.amount, 0);
      const giftTotal = mockEarnings
        .filter(earning => earning.source === 'gift')
        .reduce((sum, earning) => sum + earning.amount, 0);

      setStats({
        totalEarnings: total,
        monthlyEarnings: total,
        streamEarnings: streamTotal,
        giftEarnings: giftTotal
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadEarningsReport = () => {
    const csvContent = [
      ['Date', 'Source', 'Amount', 'Status', 'Payout Date'].join(','),
      ...earnings.map(earning => [
        format(new Date(earning.created_at), 'yyyy-MM-dd'),
        earning.source_name,
        earning.amount.toFixed(2),
        earning.status,
        earning.payout_date ? format(new Date(earning.payout_date), 'yyyy-MM-dd') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${format(selectedMonth, 'yyyy-MM')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon: Icon, title, value, trend }: { icon: any, title: string, value: string | number, trend?: string }) => (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <span className="text-green-500 text-sm">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Layout userRole="artist">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DollarSign}
            title="Monthly Earnings"
            value={`$${stats.monthlyEarnings.toLocaleString()}`}
            trend="+15.3%"
          />
          <StatCard
            icon={BarChart2}
            title="Stream Revenue"
            value={`$${stats.streamEarnings.toLocaleString()}`}
            trend="+8.2%"
          />
          <StatCard
            icon={DollarSign}
            title="Gift Revenue"
            value={`$${stats.giftEarnings.toLocaleString()}`}
            trend="+12.5%"
          />
          <StatCard
            icon={Calendar}
            title="Next Payout"
            value={format(endOfMonth(selectedMonth), 'MMM d, yyyy')}
          />
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900">Earnings History</h2>
              <div className="flex space-x-4 w-full sm:w-auto">
                {/* Month Selector */}
                <div className="relative">
                  <select
                    value={selectedMonth.toISOString()}
                    onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => subMonths(new Date(), i)).map((date) => (
                      <option key={date.toISOString()} value={date.toISOString()}>
                        {format(date, 'MMMM yyyy')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'paid')}
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadEarningsReport}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payout Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading earnings...
                    </td>
                  </tr>
                ) : earnings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No earnings found for this period
                    </td>
                  </tr>
                ) : (
                  earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(earning.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            earning.source === 'stream'
                              ? 'bg-blue-100 text-blue-600'
                              : earning.source === 'gift'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {earning.source === 'stream' ? '🎵' : earning.source === 'gift' ? '🎁' : '⭐'}
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {earning.source_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${earning.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          earning.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {earning.payout_date
                          ? format(new Date(earning.payout_date), 'MMM d, yyyy')
                          : 'Pending'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}