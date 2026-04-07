import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface SupportTicket {
  _id: string;
  subject: string;
  category: string;
  message: string;
  status: 'pending' | 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
}

export default function SupportHistory() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await userService.getUserSupportTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </span>
        );
      case 'in-progress':
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="h-3 w-3" />
            {status}
          </span>
        );
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link 
            to="/artist/support" 
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors mb-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Support
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Support History</h1>
          <p className="text-gray-500 text-sm mt-1">Track the status of your reported issues</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 transition-all">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-gray-500 mt-4">Loading your tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-20 text-center">
              <div className="p-4 bg-gray-50 rounded-2xl inline-block mb-4">
                <MessageSquare className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No tickets found</h3>
              <p className="text-sm text-gray-500 mt-2">Any support requests you submit will appear here.</p>
              <Link 
                to="/artist/support"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
              >
                Submit New Request
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      {getStatusBadge(ticket.status)}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ticket.category}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400 font-medium">{format(new Date(ticket.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
                      {ticket.subject}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {ticket.message}
                    </p>
                  </div>
                  <Link 
                    to={`/artist/support/ticket/${ticket._id}`}
                    className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
