import React, { useState } from 'react';
import GiftUpload from '../../components/GiftUpload';
import { Plus, X } from 'lucide-react';

const TestGiftUpload: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);

  const handleGiftCreated = (gift: unknown) => {
    console.log('Gift created:', gift);
    setShowUpload(false);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Gift Upload Test
        </h1>
        <p className="text-gray-600 text-lg">
          Test the complete gift upload functionality with image upload.
        </p>
      </div>

      {!showUpload ? (
        <div className="text-center">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Test Gift Upload
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowUpload(false)}
            className="absolute top-4 right-4 p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <GiftUpload onGiftCreated={handleGiftCreated} onClose={() => setShowUpload(false)} />
        </div>
      )}
    </div>
  );
};

export default TestGiftUpload; 