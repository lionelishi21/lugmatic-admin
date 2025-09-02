import React, { useState } from 'react';
import { Music2, ListMusic, Tags, Shield, Brain, FileCheck } from 'lucide-react';

export default function MusicManagement() {
  const [activeTab, setActiveTab] = useState('tracks');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Music Management</h1>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <TabButton 
          active={activeTab === 'tracks'} 
          icon={<Music2 />} 
          label="Tracks" 
          onClick={() => setActiveTab('tracks')} 
        />
        <TabButton 
          active={activeTab === 'approvals'} 
          icon={<FileCheck />} 
          label="Approvals" 
          onClick={() => setActiveTab('approvals')} 
        />
        <TabButton 
          active={activeTab === 'metadata'} 
          icon={<Tags />} 
          label="Metadata" 
          onClick={() => setActiveTab('metadata')} 
        />
        <TabButton 
          active={activeTab === 'copyright'} 
          icon={<Shield />} 
          label="Copyright" 
          onClick={() => setActiveTab('copyright')} 
        />
        <TabButton 
          active={activeTab === 'recommendations'} 
          icon={<Brain />} 
          label="Recommendations" 
          onClick={() => setActiveTab('recommendations')} 
        />
        <TabButton 
          active={activeTab === 'genres'} 
          icon={<ListMusic />} 
          label="Genres" 
          onClick={() => setActiveTab('genres')} 
        />
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'tracks' && <TracksSection />}
        {activeTab === 'approvals' && <ApprovalsSection />}
        {activeTab === 'metadata' && <MetadataSection />}
        {activeTab === 'copyright' && <CopyrightSection />}
        {activeTab === 'recommendations' && <RecommendationsSection />}
        {activeTab === 'genres' && <GenresSection />}
      </div>
    </div>
  );
}

// Tab Button Component
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

// Section Components
const TracksSection = () => (
  <div>
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-semibold">Track Management</h2>
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Upload New Track
      </button>
    </div>
    <div className="overflow-x-auto">
      {/* Track listing table would go here */}
    </div>
  </div>
);

const ApprovalsSection = () => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
    <div className="grid gap-4">
      {/* Approval queue cards would go here */}
    </div>
  </div>
);

const MetadataSection = () => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Metadata Management</h2>
    <div className="grid grid-cols-2 gap-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Metadata Templates</h3>
        {/* Template management interface */}
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Batch Editing</h3>
        {/* Batch editing interface */}
      </div>
    </div>
  </div>
);

const CopyrightSection = () => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Copyright & Licensing</h2>
    <div className="space-y-4">
      {/* Copyright verification interface */}
      {/* License management tools */}
    </div>
  </div>
);

const RecommendationsSection = () => (
  <div>
    <h2 className="text-lg font-semibold mb-4">Recommendation Settings</h2>
    <div className="grid gap-4">
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Algorithm Parameters</h3>
        {/* Algorithm configuration interface */}
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">Testing & Analytics</h3>
        {/* Testing interface */}
      </div>
    </div>
  </div>
);

const GenresSection = () => (
  <div>
    <div className="flex justify-between mb-4">
      <h2 className="text-lg font-semibold">Genres & Categories</h2>
      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Add New Genre
      </button>
    </div>
    <div className="grid gap-4">
      {/* Genre management interface */}
    </div>
  </div>
);