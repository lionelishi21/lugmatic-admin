import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Gift, TrendingUp, Calendar, DollarSign, ChevronDown, Search } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface GiftStats {
  totalGifts: number;
  totalValue: number;
  monthlyGifts: number;
  monthlyValue: number;
}

interface Gift {
  id: string;
  name: string;
  value: number;
  sender_name: string;
  sender_image: string;
  created_at: string;
  stream_title: string;
  gift_image: string; // Added gift image field
}

export default function Gifts() {
  const [stats, setStats] = useState<GiftStats>({
    totalGifts: 0,
    totalValue: 0,
    monthlyGifts: 0,
    monthlyValue: 0
  });
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGiftsData();
  }, [timeFilter]);

  const fetchGiftsData = async () => {
    try {
      // Static data for demonstration
      const staticGifts: Gift[] = [
        {
          id: '1',
          name: 'Gift 1',
          value: 10,
          sender_name: 'John Doe',
          sender_image: 'https://example.com/johndoe.jpg',
          created_at: '2022-01-01T00:00:00.000Z',
          stream_title: 'Stream 1',
          gift_image: '/assets/gif/gifts/microphone.gif' // Added gift image link
        },
        {
          id: '2',
          name: 'Gift 2',
          value: 20,
          sender_name: 'Jane Doe',
          sender_image: 'https://example.com/janedoe.jpg',
          created_at: '2022-02-01T00:00:00.000Z',
          stream_title: 'Stream 2',
          gift_image: '/assets/gif/gifts/microphone.gif' // Added gift image link
        },
        // Add more static gifts as needed
      ];

      setGifts(staticGifts);

      // Calculate stats
      const total = staticGifts.reduce((sum: number, gift: Gift) => sum + gift.value, 0);
      const monthlyGifts = staticGifts.filter(gift => {
        const giftDate = new Date(gift.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return giftDate >= thirtyDaysAgo;
      });
      const monthlyTotal = monthlyGifts.reduce((sum: number, gift: Gift) => sum + gift.value, 0);

      setStats({
        totalGifts: staticGifts.length,
        totalValue: total,
        monthlyGifts: monthlyGifts.length,
        monthlyValue: monthlyTotal
      });
    } catch (error) {
      console.error('Error fetching gifts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGifts = gifts.filter(gift =>
    gift.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gift.stream_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ icon: Icon, title, value, subValue, trend }: { icon: any, title: string, value: string | number, subValue?: string, trend?: string }) => (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subValue && (
              <p className="text-sm text-gray-500">{subValue}</p>
            )}
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
            icon={Gift}
            title="Total Gifts"
            value={stats.totalGifts}
            subValue="All time"
          />
          <StatCard
            icon={DollarSign}
            title="Total Value"
            value={`$${stats.totalValue.toLocaleString()}`}
            trend="+12.5%"
          />
          <StatCard
            icon={Calendar}
            title="Monthly Gifts"
            value={stats.monthlyGifts}
            subValue="Last 30 days"
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Value"
            value={`$${stats.monthlyValue.toLocaleString()}`}
            trend="+8.3%"
          />
        </div>

        {/* Gifts List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900">Gift History</h2>
              <div className="flex space-x-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search gifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="relative">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md pl-4 pr-10 py-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Time</option>
                    <option value="month">Last 30 Days</option>
                    <option value="week">Last 7 Days</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stream
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading gifts...
                    </td>
                  </tr>
                ) : filteredGifts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No gifts found
                    </td>
                  </tr>
                ) : (
                  filteredGifts.map((gift) => (
                    <tr key={gift.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img src={gift.gift_image} alt="Gift" className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{gift.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={gift.sender_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(gift.sender_name)}&background=random`}
                            alt={gift.sender_name}
                            className="h-8 w-8 rounded-full"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{gift.sender_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{gift.stream_title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${gift.value.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span>{format(new Date(gift.created_at), 'MMM d, yyyy')}</span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(gift.created_at), { addSuffix: true })}
                          </span>
                        </div>
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