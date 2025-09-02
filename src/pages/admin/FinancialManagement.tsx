import React, { useState } from 'react';
import { CreditCard, FileText, Receipt, Settings, TrendingUp } from 'lucide-react';

// Removed unused interfaces

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState('revenue');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Management</h1>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <TabButton 
          active={activeTab === 'revenue'} 
          icon={<TrendingUp />} 
          label="Revenue" 
          onClick={() => setActiveTab('revenue')} 
        />
        <TabButton 
          active={activeTab === 'payouts'} 
          icon={<CreditCard />} 
          label="Payouts" 
          onClick={() => setActiveTab('payouts')} 
        />
        <TabButton 
          active={activeTab === 'compliance'} 
          icon={<FileText />} 
          label="Compliance" 
          onClick={() => setActiveTab('compliance')} 
        />
        <TabButton 
          active={activeTab === 'subscriptions'} 
          icon={<Receipt />} 
          label="Subscriptions" 
          onClick={() => setActiveTab('subscriptions')} 
        />
        <TabButton 
          active={activeTab === 'pricing'} 
          icon={<Settings />} 
          label="Pricing" 
          onClick={() => setActiveTab('pricing')} 
        />
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'revenue' && <RevenueSection />}
        {activeTab === 'payouts' && <PayoutsSection />}
        {activeTab === 'compliance' && <ComplianceSection />}
        {activeTab === 'subscriptions' && <SubscriptionsSection />}
        {activeTab === 'pricing' && <PricingSection />}
      </div>
    </div>
  );
}

const TabButton = ({ active, icon, label, onClick }: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    className={`flex items-center px-4 py-2 border-b-2 ${
      active 
        ? 'border-purple-600 text-purple-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    <span className="mr-2">{icon}</span>
    {label}
  </button>
);

const RevenueSection = () => (
  <div>
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500">Total Revenue (MTD)</h3>
        <p className="text-2xl font-semibold">$124,567</p>
        <span className="text-green-500 text-sm">+12.5% vs last month</span>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500">Active Subscribers</h3>
        <p className="text-2xl font-semibold">8,234</p>
        <span className="text-green-500 text-sm">+5.2% vs last month</span>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm text-gray-500">Average Revenue Per User</h3>
        <p className="text-2xl font-semibold">$15.13</p>
        <span className="text-green-500 text-sm">+2.1% vs last month</span>
      </div>
    </div>
    
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-4">Revenue Breakdown</h3>
      {/* Revenue chart would go here */}
      <div className="h-64 bg-gray-50 rounded-lg mb-4"></div>
      
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-gray-500">Subscriptions</p>
          <p className="font-semibold">45%</p>
        </div>
        <div>
          <p className="text-gray-500">Virtual Gifts</p>
          <p className="font-semibold">30%</p>
        </div>
        <div>
          <p className="text-gray-500">Tickets</p>
          <p className="font-semibold">15%</p>
        </div>
        <div>
          <p className="text-gray-500">Other</p>
          <p className="font-semibold">10%</p>
        </div>
      </div>
    </div>
  </div>
);

const PayoutsSection = () => (
  <div>
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-semibold">Artist Payouts</h2>
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Process Payouts
      </button>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artist</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Payout rows would go here */}
        </tbody>
      </table>
    </div>
  </div>
);

const ComplianceSection = () => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Financial Compliance</h2>
    <div className="grid gap-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Tax Documents</h3>
        <div className="space-y-2">
          {/* Tax document management interface */}
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Compliance Reports</h3>
        <div className="space-y-2">
          {/* Compliance reporting interface */}
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Audit Logs</h3>
        <div className="space-y-2">
          {/* Audit log interface */}
        </div>
      </div>
    </div>
  </div>
);

const SubscriptionsSection = () => (
  <div>
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-semibold">Subscription Plans</h2>
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Add New Plan
      </button>
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      {/* Example Subscription Plan Card */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Basic Plan</h3>
          <span className="text-green-500">Active</span>
        </div>
        <p className="text-2xl font-bold mb-2">$9.99<span className="text-sm text-gray-500">/month</span></p>
        <p className="text-sm text-gray-500 mb-4">1,234 active subscribers</p>
        <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded">
          Edit Plan
        </button>
      </div>
    </div>
  </div>
);

const PricingSection = () => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Pricing Configuration</h2>
    <div className="grid gap-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Price Tiers</h3>
        <div className="space-y-2">
          {/* Price tier configuration interface */}
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Currency Settings</h3>
        <div className="space-y-2">
          {/* Currency configuration interface */}
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Discount Rules</h3>
        <div className="space-y-2">
          {/* Discount configuration interface */}
        </div>
      </div>
    </div>
  </div>
);