import React, { useState } from 'react';
import { 
  Zap, 
  Target, 
  Calendar, 
  Users, 
  TrendingUp, 
  Gift, 
  Star, 
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'bonus' | 'featured' | 'referral';
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate: string;
  targetAudience: string;
  discount: number;
  participants: number;
  revenue: number;
}

const Promotions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const promotions: Promotion[] = [
    {
      id: '1',
      name: 'Summer Music Festival',
      type: 'discount',
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      targetAudience: 'All Users',
      discount: 25,
      participants: 1250,
      revenue: 45678
    },
    {
      id: '2',
      name: 'New Artist Spotlight',
      type: 'featured',
      status: 'active',
      startDate: '2024-05-15',
      endDate: '2024-06-15',
      targetAudience: 'New Artists',
      discount: 0,
      participants: 89,
      revenue: 12345
    },
    {
      id: '3',
      name: 'Referral Bonus Program',
      type: 'referral',
      status: 'scheduled',
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      targetAudience: 'Existing Users',
      discount: 15,
      participants: 0,
      revenue: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'featured':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'referral':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'bonus':
        return <Gift className="h-5 w-5 text-purple-600" />;
      default:
        return <Zap className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
          Promotions Management
        </h1>
        <p className="text-gray-600 text-lg">
          Create and manage promotional campaigns to boost user engagement and revenue.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Promotions</p>
              <p className="text-3xl font-bold text-green-600">12</p>
            </div>
            <Zap className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Participants</p>
              <p className="text-3xl font-bold text-blue-600">8,456</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue Generated</p>
              <p className="text-3xl font-bold text-purple-600">$89,234</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-yellow-600">23.4%</p>
            </div>
            <Target className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
          {['all', 'active', 'scheduled', 'inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-white text-orange-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            <Plus className="h-5 w-5" />
            Create Promotion
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300">
            <Calendar className="h-5 w-5" />
            Schedule Campaign
          </button>
        </div>
        <div className="flex space-x-2">
          <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Eye className="h-5 w-5" />
          </button>
          <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {promotions.map((promotion) => (
          <div
            key={promotion.id}
            className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTypeIcon(promotion.type)}
                <div>
                  <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{promotion.type}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                {promotion.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target Audience:</span>
                <span className="font-medium">{promotion.targetAudience}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount:</span>
                <span className="font-medium text-green-600">{promotion.discount}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Participants:</span>
                <span className="font-medium">{promotion.participants.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Revenue:</span>
                <span className="font-medium text-green-600">${promotion.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {promotion.startDate}
              </div>
              <span>to</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {promotion.endDate}
              </div>
            </div>

            <div className="flex justify-between">
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Eye className="h-4 w-4" />
                View
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Campaign</h3>
          <p className="text-gray-600 text-sm mb-4">
            Create a simple promotional campaign in minutes.
          </p>
          <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            Start Campaign
          </button>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">
            View detailed analytics and performance metrics.
          </p>
          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            View Analytics
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Templates</h3>
          <p className="text-gray-600 text-sm mb-4">
            Use pre-built promotion templates for quick setup.
          </p>
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
            Browse Templates
          </button>
        </div>
      </div>
    </div>
  );
};

export default Promotions; 