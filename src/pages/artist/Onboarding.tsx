import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, FileText, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, AlertCircle, Loader2, Music2, Clock, XCircle, RefreshCw,
  Mic2, Pen, ShieldAlert, Activity, LayoutGrid, Check, Globe, Shield, CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

const GENRES = [
  'Reggae', 'Dancehall', 'Soca', 'Calypso', 'Afrobeats', 'R&B', 'Hip Hop',
  'Pop', 'Gospel', 'Jazz', 'Classical', 'Electronic', 'Rock', 'Folk',
  'Latin', 'Kompa', 'Zouk', 'Steelpan', 'Chutney', 'Other',
];

const PRO_ORGS = [
  'ASCAP', 'BMI', 'SESAC', 'SOCAN', 'PRS for Music', 'APRA AMCOS',
  'CISAC', 'COTT (Caribbean)', 'JACAP (Jamaica)', 'None',
];

const ID_TYPES = [
  { value: 'passport',         label: 'Passport' },
  { value: 'drivers_license',  label: "Driver's Licence" },
  { value: 'national_id',      label: 'National ID Card' },
  { value: 'other',            label: 'Other Government ID' },
];

const STEPS = [
  { id: 'profile',   label: 'Profile',    icon: Mic2 },
  { id: 'legal',     label: 'Verification', icon: Shield },
  { id: 'agreement', label: 'Agreement',    icon: FileText },
  { id: 'review',    label: 'Review',       icon: CheckCircle2 },
];

const PLATFORM_SPLIT = 20; 
const ARTIST_SPLIT   = 80;

function Field({ label, required, error, children, hint }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
        {label} {required && <span className="text-emerald-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-zinc-600 text-[10px] px-1 font-medium">{hint}</p>}
      {error && <p className="text-rose-500 text-[10px] px-1 font-bold">{error}</p>}
    </div>
  );
}

function StepProfile({ data, onChange, errors }: any) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Field label="Stage Name" required error={errors.name}>
          <input
            value={data.name || ''}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Artist or band name"
            className="premium-input"
          />
        </Field>
        <Field label="Artist Category" required>
          <select 
            value={data.artistType || 'solo'} 
            onChange={e => onChange('artistType', e.target.value)}
            className="premium-input appearance-none"
          >
            <option value="solo">Solo Artist</option>
            <option value="band">Band / Group</option>
            <option value="producer">Producer</option>
            <option value="podcaster">Podcaster</option>
            <option value="composer">Composer</option>
          </select>
        </Field>
      </div>

      <Field label="Biography" required error={errors.bio} hint="Minimum 50 characters. Tell your story.">
        <textarea
          value={data.bio || ''}
          onChange={e => onChange('bio', e.target.value)}
          rows={5}
          placeholder="Describe your musical journey..."
          className="premium-input resize-none h-auto"
        />
        <div className="text-right text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-2">{(data.bio || '').length} / 2000</div>
      </Field>

      <Field label="Music Genres" required error={errors.genres} hint="Select at least one genre">
        <div className="flex flex-wrap gap-2.5 mt-2 p-6 bg-zinc-950 border border-white/5 rounded-3xl">
          {GENRES.map(g => {
            const selected = (data.genres || []).includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => {
                  const current = data.genres || [];
                  onChange('genres', selected ? current.filter((x: string) => x !== g) : [...current, g]);
                }}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                  selected
                    ? 'bg-emerald-500 text-black border-emerald-500 shadow-xl'
                    : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Field label="Country" required error={errors.country}>
          <input
            value={data.location?.country || ''}
            onChange={e => onChange('location', { ...data.location, country: e.target.value })}
            placeholder="e.g. Jamaica"
            className="premium-input"
          />
        </Field>
        <Field label="City">
          <input
            value={data.location?.city || ''}
            onChange={e => onChange('location', { ...data.location, city: e.target.value })}
            placeholder="e.g. Kingston"
            className="premium-input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Field label="Contact Phone">
          <input value={data.contactPhone || ''} onChange={e => onChange('contactPhone', e.target.value)} placeholder="+1 876..." className="premium-input" />
        </Field>
        <Field label="Contact Email">
          <input type="email" value={data.contactEmail || ''} onChange={e => onChange('contactEmail', e.target.value)} placeholder="email@example.com" className="premium-input" />
        </Field>
      </div>
    </div>
  );
}

function StepLegal({ data, onChange, errors, onFileUpload, uploading }: any) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Field label="Full Legal Name" required error={errors.legalName} hint="As shown on your ID">
          <input value={data.legalName || ''} onChange={e => onChange('legalName', e.target.value)} placeholder="First and last name" className="premium-input" />
        </Field>
        <Field label="Date of Birth" required error={errors.dateOfBirth}>
          <input type="date" value={data.dateOfBirth || ''} onChange={e => onChange('dateOfBirth', e.target.value)}
            className="premium-input appearance-none"
            max={new Date(Date.now() - 16 * 365.25 * 86400000).toISOString().split('T')[0]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Field label="Nationality" required error={errors.nationality}>
          <input value={data.nationality || ''} onChange={e => onChange('nationality', e.target.value)} placeholder="e.g. Jamaican" className="premium-input" />
        </Field>
        <Field label="PRO Affiliation" hint="Performing Rights Organization">
          <select value={data.proAffiliation || ''} onChange={e => onChange('proAffiliation', e.target.value)} className="premium-input appearance-none">
            <option value="">None / Other</option>
            {PRO_ORGS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <div className="pt-6 space-y-6">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Identification Document</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="ID Type" required error={errors.idType}>
            <select value={data.idType || ''} onChange={e => onChange('idType', e.target.value)} className="premium-input appearance-none">
              <option value="">Select ID Type</option>
              {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="ID Number" required error={errors.idNumber}>
            <input value={data.idNumber || ''} onChange={e => onChange('idNumber', e.target.value)} placeholder="Enter document number" className="premium-input" />
          </Field>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all ${
            data.idDocumentUrl
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-white/10 bg-zinc-950/50 hover:border-emerald-500/30'
          }`}
        >
          <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={e => onFileUpload(e.target.files?.[0])} />
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={40} className="text-emerald-500 animate-spin" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Uploading Document</p>
            </div>
          ) : data.idDocumentUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-emerald-500/20">
                <Check size={32} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Document Received</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Tap to replace</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 group-hover:text-emerald-500 transition-colors">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Upload Identity Proof</p>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Images or PDF up to 10MB</p>
              </div>
            </div>
          )}
        </div>
        {errors.idDocumentUrl && <p className="text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">{errors.idDocumentUrl}</p>}
      </div>
    </div>
  );
}

function StepAgreement({ data, onChange, errors }: any) {
  return (
    <div className="space-y-10">
      <div className="bg-zinc-950 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Revenue Distribution</h3>
        <div className="space-y-8">
          {[
            { party: 'Artist Earnings', pct: ARTIST_SPLIT, color: 'bg-emerald-500' },
            { party: 'Platform Fee', pct: PLATFORM_SPLIT, color: 'bg-zinc-800' },
          ].map(row => (
            <div key={row.party} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{row.party}</span>
                  <span className="text-2xl font-bold text-white tracking-tighter tabular-nums">{row.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${row.pct}%` }} transition={{ duration: 1 }} className={`h-full ${row.color} shadow-lg`} />
                </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
          This split applies to standard streaming and gifts. Specialized content may have custom rates.
        </p>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[2rem] p-10 h-72 overflow-y-auto space-y-6 text-sm text-zinc-500 leading-relaxed custom-scrollbar">
        <p className="font-bold text-white text-base uppercase tracking-tight">Artist Platform Agreement</p>
        <p><strong className="text-white">1. Content Ownership.</strong> You maintain ownership of your recordings. By uploading, you grant Lugmatic a license to distribute and monetize on your behalf.</p>
        <p><strong className="text-white">2. Revenue.</strong> You will receive {ARTIST_SPLIT}% of net revenue generated from your content on our platform.</p>
        <p><strong className="text-white">3. Integrity.</strong> You confirm all provided details are accurate. False information will result in account termination.</p>
        <p><strong className="text-white">4. Guidelines.</strong> You agree to follow our community standards and copyright policies.</p>
        <p><strong className="text-white">5. Payouts.</strong> Earnings are distributed monthly based on your selected payment method once the minimum threshold is met.</p>
      </div>

      <div className="space-y-8">
        <Field label="Signature" required error={errors.platformAgreementSignature} hint="Type your full name exactly as it appears on your ID">
          <input
            value={data.platformAgreementSignature || ''}
            onChange={e => onChange('platformAgreementSignature', e.target.value)}
            placeholder="Legal Name Signature"
            className="premium-input text-xl italic font-serif"
          />
        </Field>

        <label className="flex items-start gap-5 cursor-pointer bg-zinc-950 p-8 rounded-3xl border border-white/5 hover:border-emerald-500/20 transition-all group">
          <div className="relative mt-1">
            <input
              type="checkbox"
              checked={data.platformAgreementSigned || false}
              onChange={e => {
                onChange('platformAgreementSigned', e.target.checked);
                if (e.target.checked) onChange('platformAgreementSignedAt', new Date().toISOString());
              }}
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-xl border border-white/10 bg-zinc-900 checked:bg-emerald-500 transition-all"
            />
            <Check size={16} className="absolute inset-0 m-auto pointer-events-none hidden peer-checked:block text-black" />
          </div>
          <span className="text-zinc-500 text-xs font-medium leading-relaxed group-hover:text-zinc-300">
            I confirm that I have read the platform agreement and agree to the terms and conditions outlined above.
          </span>
        </label>
        {errors.platformAgreementSigned && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest px-2">{errors.platformAgreementSigned}</p>}
      </div>
    </div>
  );
}

function StepReview({ data }: any) {
  const sections = [
    { label: 'Artist Name',      value: data.name },
    { label: 'Category',         value: data.artistType },
    { label: 'Primary Genres',   value: (data.genres || []).join(', ') || 'None' },
    { label: 'Location',         value: `${data.location?.city || ''}, ${data.location?.country || ''}` },
    { label: 'Legal Name',       value: data.legalName },
    { label: 'ID Type',          value: ID_TYPES.find(t => t.value === data.idType)?.label || data.idType },
    { label: 'ID Number',        value: data.idNumber },
    { label: 'ID Document',      value: data.idDocumentUrl ? 'Uploaded' : 'Missing' },
    { label: 'Agreement',        value: data.platformAgreementSigned ? 'Signed' : 'Unsigned' },
  ];

  return (
    <div className="space-y-8">
      <div className="premium-card !p-0 border-white/5 rounded-[2.5rem] overflow-hidden">
        {sections.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-10 py-5 border-b border-white/5 last:border-0">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
            <span className={`text-sm font-bold ${String(value).toLowerCase().includes('missing') ? 'text-rose-500' : 'text-white'}`}>{value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-8 flex gap-6">
        <ShieldCheck size={24} className="text-emerald-500 shrink-0 mt-1" />
        <div>
          <p className="text-sm font-bold text-white uppercase tracking-tight">Review Timeline</p>
          <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed">
            Applications are typically processed within 48 to 72 hours. You will receive an email once your verification status is updated.
          </p>
        </div>
      </div>
    </div>
  );
}

function PendingScreen() {
  return (
    <div className="text-center py-16 space-y-8">
      <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-900 flex items-center justify-center mx-auto border border-white/5">
        <Clock size={40} className="text-zinc-700" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Application Under Review</h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-3 font-medium leading-relaxed">
          We are currently verifying your credentials. You will be notified as soon as the process is complete.
        </p>
      </div>
      <div className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        <Activity size={16} className="text-emerald-500 animate-pulse" />
        Processing status
      </div>
    </div>
  );
}

function RejectedScreen({ reason, onResubmit }: { reason: string; onResubmit: () => void }) {
  return (
    <div className="text-center py-16 space-y-8">
      <div className="w-24 h-24 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
        <ShieldAlert size={40} />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Update Required</h2>
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 text-left max-w-md mx-auto">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-3">Feedback from team:</p>
          <p className="text-zinc-300 text-sm font-medium leading-relaxed">{reason}</p>
        </div>
      </div>
      <button onClick={onResubmit} className="h-14 px-12 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
        Revise and Resubmit
      </button>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'form' | 'pending' | 'rejected'>('form');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    apiService.get<any>('/onboarding/status')
      .then(res => {
        const artist = res.data.data;
        if (!artist) return;
        if (artist.verificationStatus === 'approved') {
          navigate('/artist', { replace: true });
          return;
        }
        if (artist.verificationStatus === 'pending') { setStatus('pending'); return; }
        if (artist.verificationStatus === 'rejected') {
          setRejectionReason(artist.rejectionReason || '');
          setStatus('rejected');
          return;
        }
        setData(prev => ({ ...prev, ...artist }));
        if (typeof artist.onboardingStep === 'number' && artist.onboardingStep > 0) {
          setStep(Math.min(artist.onboardingStep, STEPS.length - 1));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const update = useCallback((key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const saveStep = async (currentStep: number, extraData?: Record<string, any>) => {
    setSaving(true);
    try {
      await apiService.post('/onboarding/save-step', { ...data, ...extraData, step: currentStep });
    } catch { }
    finally { setSaving(false); }
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File size exceeds 10MB'); return; }
    setUploading(true);
    try {
      const presign = await apiService.post<any>('/upload/presign/id-document', { filename: file.name, contentType: file.type });
      const { uploadUrl, publicUrl } = presign.data.data;
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      update('idDocumentUrl', publicUrl);
      await saveStep(1, { idDocumentUrl: publicUrl });
      toast.success('Document uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!data.name?.trim()) errs.name = 'Artist name is required';
      if (!data.bio || data.bio.length < 50) errs.bio = 'Bio must be at least 50 characters';
      if (!data.genres?.length) errs.genres = 'Select at least one genre';
      if (!data.location?.country?.trim()) errs.country = 'Country is required';
    }
    if (s === 1) {
      if (!data.legalName?.trim()) errs.legalName = 'Full legal name is required';
      if (!data.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
      if (!data.nationality?.trim()) errs.nationality = 'Nationality is required';
      if (!data.idType) errs.idType = 'Select document type';
      if (!data.idNumber?.trim()) errs.idNumber = 'Document number is required';
      if (!data.idDocumentUrl?.trim()) errs.idDocumentUrl = 'Document upload is required';
    }
    if (s === 2) {
      if (!data.platformAgreementSignature?.trim()) errs.platformAgreementSignature = 'Signature is required';
      if (!data.platformAgreementSigned) errs.platformAgreementSigned = 'Please accept the terms';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = async () => {
    if (!validate(step)) return;
    await saveStep(step + 1);
    setStep(s => s + 1);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const submit = async () => {
    setSubmitting(true);
    try {
      await apiService.post('/onboarding/submit', data);
      setStatus('pending');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 size={40} className="text-emerald-500 animate-spin" />
    </div>
  );

  if (status === 'pending') return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="premium-card max-w-lg w-full p-10 border-white/5 rounded-[3rem] shadow-2xl">
        <PendingScreen />
      </div>
    </div>
  );

  if (status === 'rejected') return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="premium-card max-w-lg w-full p-10 border-rose-500/20 rounded-[3rem] shadow-2xl">
        <RejectedScreen reason={rejectionReason} onResubmit={() => setStatus('form')} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-zinc-950 border border-white/5 rounded-full">
            <Globe size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Artist Network</span>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight uppercase">Onboarding</h1>
          <p className="text-zinc-500 font-medium text-lg">Complete your profile to start sharing and monetizing your music.</p>
        </div>

        {/* Tracker */}
        <div className="flex items-center justify-between mb-16 px-10 relative">
          <div className="absolute left-10 right-10 top-6 h-px bg-white/5" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex flex-col items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                  done   ? 'bg-emerald-500 border-emerald-500 text-black shadow-xl shadow-emerald-500/20'
                  : active ? 'bg-white border-white text-black shadow-xl shadow-white/10'
                  : 'bg-zinc-900 border-white/5 text-zinc-600'
                }`}>
                  {done ? <Check size={24} /> : <Icon size={20} />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${active ? 'text-white' : 'text-zinc-600'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl rounded-[3rem]">
          <div className="h-1.5 w-full bg-zinc-900">
            <motion.div className="h-full bg-emerald-500 shadow-lg shadow-emerald-500/20" initial={{ width: 0 }} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>

          <div className="p-12 md:p-16">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {step === 0 && <StepProfile data={data} onChange={update} errors={errors} />}
                {step === 1 && <StepLegal data={data} onChange={update} errors={errors} onFileUpload={handleFileUpload} uploading={uploading} />}
                {step === 2 && <StepAgreement data={data} onChange={update} errors={errors} />}
                {step === 3 && <StepReview data={data} />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-12 py-10 bg-zinc-950/40 border-t border-white/5 flex items-center justify-between">
            <button onClick={back} disabled={step === 0} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white disabled:opacity-20 transition-all">
              <ArrowLeft size={18} /> Back
            </button>

            <div className="flex items-center gap-8">
              {saving && <span className="flex items-center gap-3 text-[9px] font-bold text-zinc-600 uppercase tracking-widest"><Loader2 size={12} className="animate-spin" /> Saving...</span>}
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="h-14 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                  Continue <ArrowRight size={18} className="ml-2" />
                </button>
              ) : (
                <button onClick={submit} disabled={submitting} className="h-14 px-12 bg-emerald-500 text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {submitting ? 'Submitting...' : 'Complete Registration'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-[9px] font-bold uppercase tracking-widest mt-12 opacity-50">
          Your information is encrypted and securely stored.
        </p>
      </div>
    </div>
  );
}
