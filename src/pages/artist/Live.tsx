import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { Radio, Users, MessageSquare, Gift, Settings, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StreamSettings {
  title: string;
  description: string;
  category: string;
}

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  timestamp: string;
}

interface StreamStats {
  viewers: number;
  likes: number;
  gifts: number;
}

export default function Live() {
  const [isLive, setIsLive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    title: '',
    description: '',
    category: ''
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [stats] = useState<StreamStats>({
    viewers: 0,
    likes: 0,
    gifts: 0
  });
  
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll chat to bottom when new messages arrive
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setStreamSettings(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const startStream = async () => {
    if (!streamSettings.title) {
      toast.error('Please set a stream title');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate starting a stream
      setIsLive(true);
      setIsSettingsOpen(false);
      toast.success('Stream started successfully!');
    } catch (error) {
      console.error('Stream error:', error);
      toast.error('Failed to start stream');
    } finally {
      setIsLoading(false);
    }
  };

  const endStream = async () => {
    setIsLoading(true);
    try {
      // Simulate ending a stream
      setIsLive(false);
      setMessages([]);
      toast.success('Stream ended');
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Failed to end stream');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Simulate sending a message
      setNewMessage('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <Layout userRole="artist">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stream Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stream Preview */}
            <div className="bg-gray-900 aspect-video rounded-lg flex items-center justify-center">
              {isLive ? (
                <div className="text-white text-center">
                  <Radio className="h-16 w-16 mb-4 animate-pulse" />
                  <p className="text-xl">Live Stream Active</p>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <Radio className="h-16 w-16 mb-4" />
                  <p className="text-xl">Stream Preview</p>
                </div>
              )}
            </div>

            {/* Stream Controls */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {streamSettings.title || 'Untitled Stream'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {streamSettings.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    onClick={isLive ? endStream : () => setIsSettingsOpen(true)}
                    disabled={isLoading}
                    className={`flex items-center px-4 py-2 rounded-md ${
                      isLive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : isLive ? (
                      'End Stream'
                    ) : (
                      'Go Live'
                    )}
                  </button>
                </div>
              </div>

              {/* Stream Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-semibold">{stats.viewers}</p>
                  <p className="text-sm text-gray-500">Viewers</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-semibold">{messages.length}</p>
                  <p className="text-sm text-gray-500">Chat Messages</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Gift className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-semibold">{stats.gifts}</p>
                  <p className="text-sm text-gray-500">Gifts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-12rem)]">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Live Chat</h3>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {msg.user_name[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{msg.user_name}</p>
                    <p className="text-sm text-gray-600">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stream Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stream Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Stream Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={streamSettings.title}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={streamSettings.description}
                  onChange={handleSettingsChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={streamSettings.category}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="">Select a category</option>
                  <option value="music">Music</option>
                  <option value="talk-show">Talk Show</option>
                  <option value="performance">Live Performance</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={startStream}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
                >
                  {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                  Start Stream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}