import { useState, useEffect, useCallback } from 'react';
import {
  UserCheck, UserX, Search, Clock, ChevronDown, ChevronUp,
  FileText, Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle,
  ExternalLink, RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '@/services/api';

interface PendingArtist {
  _id: string;
  name: string;
  bio: string;
  genres: string[];
  image?: string;
  artistType?: string;
  legalName: string;
  dateOfBirth?: string;
  nationality: string;
  idType: string;
  idNumber: string;
  idDocumentUrl?: string;
  proAffiliation?: string;
  ipiNumber?: string;
  platformAgreementSigned: boolean;
  platformAgreementSignature?: string;
  onboardingSubmittedAt: string;
  verificationStatus: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
}

const ID_LABELS: Record<string, string> = {
  passport: 'Passport',
  drivers_license: "Driver's License",
  national_id: 'National ID',
  voters_id: "Voter's ID",
};

export default function ArtistApprovals() {
  const [artists, setArtists] = useState<PendingArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ artistId: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const fetchPending = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/onboarding/admin/pending?page=${page}&limit=20`);
      setArtists(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load pending applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (artistId: string, name: string) => {
    setProcessing(artistId);
    try {
      await api.put(`/onboarding/admin/${artistId}/approve`, { notes: adminNotes || undefined });
      toast.success(`${name} approved — they can now go live and upload tracks`);
      setArtists(prev => prev.filter(a => a._id !== artistId));
      setExpanded(null);
    } catch {
      toast.error('Approval failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setProcessing(rejectModal.artistId);
    try {
      await api.put(`/onboarding/admin/${rejectModal.artistId}/reject`, {
        reason: rejectReason,
        notes: adminNotes || undefined,
      });
      toast.success(`${rejectModal.name}'s application returned for revision`);
      setArtists(prev => prev.filter(a => a._id !== rejectModal.artistId));
      setRejectModal(null);
      setRejectReason('');
      setAdminNotes('');
    } catch {
      toast.error('Rejection failed. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = artists.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.legalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Artist Applications</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {pagination.total} pending application{pagination.total !== 1 ? 's' : ''} awaiting review
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
            />
          </div>
          <button
            onClick={() => fetchPending(pagination.page)}
            className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-3 bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <UserCheck className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No pending applications</p>
          <p className="text-zinc-600 text-sm mt-1">All artist submissions have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(artist => (
            <ArtistCard
              key={artist._id}
              artist={artist}
              isExpanded={expanded === artist._id}
              isProcessing={processing === artist._id}
              onToggle={() => setExpanded(prev => prev === artist._id ? null : artist._id)}
              onApprove={() => handleApprove(artist._id, artist.name)}
              onReject={() => {
                setRejectModal({ artistId: artist._id, name: artist.name });
                setAdminNotes('');
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchPending(p)}
              className={`px-3 py-1 rounded text-sm ${
                p === pagination.page
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Reject Application</h3>
                <p className="text-zinc-400 text-sm">{rejectModal.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Reason for rejection <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. ID document unclear, bio too short, missing agreement signature..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Admin notes (internal only)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Optional internal notes..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!!processing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {processing ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ArtistCardProps {
  artist: PendingArtist;
  isExpanded: boolean;
  isProcessing: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
}

function ArtistCard({ artist, isExpanded, isProcessing, onToggle, onApprove, onReject }: ArtistCardProps) {
  const [showId, setShowId] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Summary row */}
      <div className="flex items-center gap-4 p-5">
        <img
          src={artist.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=10b981&color=fff`}
          alt={artist.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white truncate">{artist.name}</span>
            {artist.artistType && (
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full capitalize">
                {artist.artistType}
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm truncate">
            {artist.user?.email} · {artist.user?.firstName} {artist.user?.lastName}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(artist.onboardingSubmittedAt), { addSuffix: true })}
            </span>
            {artist.genres?.slice(0, 3).map(g => (
              <span key={g} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{g}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onApprove}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 text-red-400 rounded-lg hover:bg-red-500/10 disabled:opacity-50 transition-colors text-sm"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-zinc-800 p-5 space-y-5">
          {/* Bio */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Bio</h4>
            <p className="text-zinc-300 text-sm leading-relaxed">{artist.bio || '—'}</p>
          </div>

          {/* Identity */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Legal Identity</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <InfoRow label="Legal Name" value={artist.legalName} />
              <InfoRow label="Date of Birth" value={artist.dateOfBirth ? new Date(artist.dateOfBirth).toLocaleDateString() : '—'} />
              <InfoRow label="Nationality" value={artist.nationality} />
              <InfoRow label="ID Type" value={ID_LABELS[artist.idType] || artist.idType} />
              <InfoRow label="ID Number" value={
                <span className="flex items-center gap-2">
                  {showId ? artist.idNumber : '•'.repeat(Math.min(artist.idNumber?.length || 8, 8))}
                  <button onClick={() => setShowId(v => !v)} className="text-zinc-500 hover:text-zinc-300">
                    {showId ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </span>
              } />
              {artist.proAffiliation && <InfoRow label="PRO Affiliation" value={artist.proAffiliation} />}
              {artist.ipiNumber && <InfoRow label="IPI Number" value={artist.ipiNumber} />}
            </div>
          </div>

          {/* ID Document */}
          {artist.idDocumentUrl ? (
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Government ID</h4>
              <a
                href={artist.idDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                View ID Document
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              No ID document uploaded
            </div>
          )}

          {/* Agreement */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Platform Agreement</h4>
            {artist.platformAgreementSigned ? (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-zinc-300 text-sm">
                  Signed digitally as <strong className="text-white italic">"{artist.platformAgreementSignature}"</strong>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <XCircle className="h-4 w-4" />
                Agreement not signed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="text-zinc-200 mt-0.5">{value || '—'}</p>
    </div>
  );
}
