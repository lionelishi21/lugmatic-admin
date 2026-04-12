import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  History,
  Info,
  AlertTriangle,
  Users,
  MessageSquare,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  Plus
} from 'lucide-react';
import { adminService } from '../../services/adminService';

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  recipientsCount: number;
  type: string;
}

const NotificationManagement: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('system_alert');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<NotificationHistory[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    try {
      setLoading(true);
      setError(null);
      const response = await adminService.sendBroadcastNotification({
        title,
        message,
        contentType: category
      });

      if (response.data.success) {
        setSentCount(response.data.data.count);
        setTitle('');
        setMessage('');
        // Refresh history (optional: add to local state for instant feedback)
      }
    } catch (err: any) {
      console.error('Failed to send broadcast:', err);
      setError(err.response?.data?.message || 'Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-sm text-gray-500 mt-1">Broadcast system-wide messages to all Lugmatic users</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Reaching ~1,240 users</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Send className="h-4 w-4 text-green-600" />
              <h2 className="text-base font-semibold text-gray-900">Compose Broadcast</h2>
            </div>
            
            <form onSubmit={handleSend} className="p-6 space-y-5">
              {sentCount !== null && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Success!</p>
                    <p className="text-xs text-green-700">Notification was broadcast to {sentCount} users successfully.</p>
                  </div>
                  <button 
                    onClick={() => setSentCount(null)}
                    className="ml-auto text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Notification Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Server Maintenance or New Feature Release"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none bg-white"
                  >
                    <option value="system_alert">System Alert</option>
                    <option value="marketing">Marketing / Promotion</option>
                    <option value="new_release">New Content</option>
                    <option value="live_stream">Live Event</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm appearance-none bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Immediate Popup)</option>
                    <option value="urgent">Urgent / Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Message Content</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the full message details here..."
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  Messages will be sent via Push and in-app feeds.
                </p>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar: History & Guidelines */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Recent History</h3>
              </div>
              <button className="text-[10px] text-green-600 font-medium hover:underline">Clear History</button>
            </div>
            
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {[
                { id: '1', title: 'Welcome to Lugmatic!', date: '2 hours ago', count: 1242, tag: 'Marketing' },
                { id: '2', title: 'Scheduled Maintenance', date: 'Yesterday', count: 1238, tag: 'System' },
                { id: '3', title: 'Artist Contest Winners', date: '2 days ago', count: 1190, tag: 'Event' },
              ].map(item => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">{item.title}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{item.tag}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.date}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {item.count} users</span>
                  </div>
                </div>
              ))}
              
              {/* Empty state if no history */}
              {/* <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-gray-100 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No broadcasts sent yet</p>
              </div> */}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Broadcast Guidelines
            </h3>
            <ul className="space-y-2.5">
              {[
                'Keep messages brief and professional.',
                'Use "High" priority only for critical updates.',
                'Schedule marketing alerts for peak usage hours.',
                'Ensure call-to-action links are valid.'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-800/80 leading-relaxed">
                  <span className="mt-1 w-1 h-1 bg-amber-400 rounded-full shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;