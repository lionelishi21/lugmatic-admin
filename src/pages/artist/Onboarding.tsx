import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, Loader2, Music2, Clock, Check, Globe, Shield, Activity, ShieldAlert,
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
  { value: 'passport',        label: 'Passport' },
  { value: 'drivers_license', label: "Driver's Licence" },
  { value: 'national_id',     label: 'National ID Card' },
  { value: 'other',           label: 'Other Government ID' },
];

const STEPS = [
  { id: 'profile',   label: 'Profile',      icon: Music2 },
  { id: 'legal',     label: 'Verification', icon: Shield },
  { id: 'agreement', label: 'Agreement',    icon: FileText },
  { id: 'review',    label: 'Review',       icon: CheckCircle2 },
];

const PLATFORM_SPLIT = 20;
const ARTIST_SPLIT   = 80;

const PARTICLES = [
  { x: 8,  y: 15, size: 3, delay: 0 },
  { x: 88, y: 20, size: 5, delay: 1.3 },
  { x: 15, y: 70, size: 4, delay: 0.7 },
  { x: 92, y: 55, size: 3, delay: 2.1 },
  { x: 45, y: 8,  size: 4, delay: 1.6 },
  { x: 3,  y: 45, size: 3, delay: 0.3 },
  { x: 72, y: 82, size: 5, delay: 2.6 },
  { x: 30, y: 92, size: 3, delay: 1.9 },
  { x: 60, y: 25, size: 4, delay: 0.5 },
  { x: 96, y: 38, size: 3, delay: 3.1 },
];

function Particle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-emerald-400/20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -28, 0], opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const inputCls = (focused?: boolean, error?: boolean) =>
  `w-full h-14 px-5 bg-zinc-800/40 border rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-all duration-200 ${
    error   ? 'border-rose-500/60 bg-rose-500/5'
    : focused ? 'border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]'
    : 'border-white/[0.08] hover:border-white/[0.14]'
  }`;

function Field({ label, required, error, children, hint }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider">
        {label} {required && <span className="text-emerald-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-zinc-600 text-xs pl-1">{hint}</p>}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs pl-1">
          {error}
        </motion.p>
      )}
    </div>
  );
}

function StepProfile({ data, onChange, errors }: any) {
  const [focused, setFocused] = useState('');
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Stage Name" required error={errors.name}>
          <input
            value={data.name || ''}
            onChange={e => onChange('name', e.target.value)}
            onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
            placeholder="Artist or band name"
            className={inputCls(focused === 'name', !!errors.name)}
          />
        </Field>
        <Field label="Artist Category" required>
          <select
            value={data.artistType || 'solo'}
            onChange={e => onChange('artistType', e.target.value)}
            onFocus={() => setFocused('type')} onBlur={() => setFocused('')}
            className={`${inputCls(focused === 'type')} appearance-none`}
          >
            <option value="solo">Solo Artist</option>
            <option value="band">Band / Group</option>
            <option value="producer">Producer</option>
            <option value="podcaster">Podcaster</option>
            <option value="composer">Composer</option>
          </select>
        </Field>
      </div>

      <Field label="Biography" required error={errors.bio} hint="Minimum 50 characters — tell your story.">
        <textarea
          value={data.bio || ''}
          onChange={e => onChange('bio', e.target.value)}
          onFocus={() => setFocused('bio')} onBlur={() => setFocused('')}
          rows={5}
          placeholder="Describe your musical journey..."
          className={`${inputCls(focused === 'bio', !!errors.bio)} h-auto py-4 resize-none`}
        />
        <div className="text-right text-[10px] text-zinc-600 mt-1">{(data.bio || '').length} / 2000</div>
      </Field>

      <Field label="Music Genres" required error={errors.genres} hint="Select at least one">
        <div className="flex flex-wrap gap-2 mt-1 p-5 bg-zinc-800/30 border border-white/[0.08] rounded-xl">
          {GENRES.map(g => {
            const sel = (data.genres || []).includes(g);
            return (
              <button
                key={g} type="button"
                onClick={() => {
                  const cur = data.genres || [];
                  onChange('genres', sel ? cur.filter((x: string) => x !== g) : [...cur, g]);
                }}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  sel ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-zinc-800/60 border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/20'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Country" required error={errors.country}>
          <input value={data.location?.country || ''} onChange={e => onChange('location', { ...data.location, country: e.target.value })}
            onFocus={() => setFocused('country')} onBlur={() => setFocused('')}
            placeholder="e.g. Jamaica" className={inputCls(focused === 'country', !!errors.country)} />
        </Field>
        <Field label="City">
          <input value={data.location?.city || ''} onChange={e => onChange('location', { ...data.location, city: e.target.value })}
            onFocus={() => setFocused('city')} onBlur={() => setFocused('')}
            placeholder="e.g. Kingston" className={inputCls(focused === 'city')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Contact Phone">
          <input value={data.contactPhone || ''} onChange={e => onChange('contactPhone', e.target.value)}
            onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
            placeholder="+1 876 000 0000" className={inputCls(focused === 'phone')} />
        </Field>
        <Field label="Contact Email">
          <input type="email" value={data.contactEmail || ''} onChange={e => onChange('contactEmail', e.target.value)}
            onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
            placeholder="email@example.com" className={inputCls(focused === 'email')} />
        </Field>
      </div>
    </div>
  );
}

function StepLegal({ data, onChange, errors, onFileUpload, uploading }: any) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState('');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Full Legal Name" required error={errors.legalName} hint="As shown on your ID">
          <input value={data.legalName || ''} onChange={e => onChange('legalName', e.target.value)}
            onFocus={() => setFocused('legalName')} onBlur={() => setFocused('')}
            placeholder="First and last name" className={inputCls(focused === 'legalName', !!errors.legalName)} />
        </Field>
        <Field label="Date of Birth" required error={errors.dateOfBirth}>
          <input type="date" value={data.dateOfBirth || ''} onChange={e => onChange('dateOfBirth', e.target.value)}
            onFocus={() => setFocused('dob')} onBlur={() => setFocused('')}
            max={new Date(Date.now() - 16 * 365.25 * 86400000).toISOString().split('T')[0]}
            className={`${inputCls(focused === 'dob', !!errors.dateOfBirth)} appearance-none`} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nationality" required error={errors.nationality}>
          <input value={data.nationality || ''} onChange={e => onChange('nationality', e.target.value)}
            onFocus={() => setFocused('nat')} onBlur={() => setFocused('')}
            placeholder="e.g. Jamaican" className={inputCls(focused === 'nat', !!errors.nationality)} />
        </Field>
        <Field label="PRO Affiliation" hint="Performing Rights Organization">
          <select value={data.proAffiliation || ''} onChange={e => onChange('proAffiliation', e.target.value)}
            onFocus={() => setFocused('pro')} onBlur={() => setFocused('')}
            className={`${inputCls(focused === 'pro')} appearance-none`}>
            <option value="">None / Other</option>
            {PRO_ORGS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <div className="space-y-4 pt-2">
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Identification Document</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="ID Type" required error={errors.idType}>
            <select value={data.idType || ''} onChange={e => onChange('idType', e.target.value)}
              onFocus={() => setFocused('idType')} onBlur={() => setFocused('')}
              className={`${inputCls(focused === 'idType', !!errors.idType)} appearance-none`}>
              <option value="">Select ID Type</option>
              {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="ID Number" required error={errors.idNumber}>
            <input value={data.idNumber || ''} onChange={e => onChange('idNumber', e.target.value)}
              onFocus={() => setFocused('idNum')} onBlur={() => setFocused('')}
              placeholder="Enter document number" className={inputCls(focused === 'idNum', !!errors.idNumber)} />
          </Field>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            data.idDocumentUrl ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/[0.08] hover:border-emerald-500/30 bg-zinc-800/20'
          }`}
        >
          <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={e => onFileUpload(e.target.files?.[0])} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-emerald-500 animate-spin" />
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Uploading Document…</p>
            </div>
          ) : data.idDocumentUrl ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/25">
                <Check size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Document Received</p>
                <p className="text-[10px] text-zinc-600 mt-1">Click to replace</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 group-hover:text-emerald-400 transition-colors">
                <Upload size={28} />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-300">Upload Identity Proof</p>
                <p className="text-xs text-zinc-600 mt-1">Images or PDF · max 10 MB</p>
              </div>
            </div>
          )}
        </div>
        {errors.idDocumentUrl && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs text-center">
            {errors.idDocumentUrl}
          </motion.p>
        )}
      </div>
    </div>
  );
}

function StepAgreement({ data, onChange, errors }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-8">
      {/* Revenue split */}
      <div className="bg-zinc-800/30 border border-white/[0.08] rounded-2xl p-8 space-y-6">
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Revenue Distribution</p>
        {[
          { party: 'Artist Earnings', pct: ARTIST_SPLIT, color: 'bg-emerald-500', text: 'text-emerald-400' },
          { party: 'Platform Fee',    pct: PLATFORM_SPLIT, color: 'bg-zinc-700', text: 'text-zinc-500' },
        ].map(row => (
          <div key={row.party} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{row.party}</span>
              <span className={`text-2xl font-black tracking-tighter tabular-nums ${row.text}`}>{row.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-900 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${row.pct}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full ${row.color}`} />
            </div>
          </div>
        ))}
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          Applies to standard streaming and gifts. Specialized content may carry custom rates.
        </p>
      </div>

      {/* Terms scroll */}
      <div className="bg-zinc-800/30 border border-white/[0.08] rounded-2xl p-8 h-64 overflow-y-auto space-y-5 text-sm text-zinc-500 leading-relaxed">
        <p className="font-bold text-white text-base">Artist Platform Agreement</p>
        <p><strong className="text-white">1. Content Ownership.</strong> You maintain ownership of your recordings. By uploading, you grant Lugmatic a license to distribute and monetize on your behalf.</p>
        <p><strong className="text-white">2. Revenue.</strong> You will receive {ARTIST_SPLIT}% of net revenue generated from your content on our platform.</p>
        <p><strong className="text-white">3. Integrity.</strong> You confirm all provided details are accurate. False information will result in account termination.</p>
        <p><strong className="text-white">4. Guidelines.</strong> You agree to follow our community standards and copyright policies.</p>
        <p><strong className="text-white">5. Payouts.</strong> Earnings are distributed monthly based on your selected payment method once the minimum threshold is met.</p>
      </div>

      {/* Signature */}
      <Field label="Digital Signature" required error={errors.platformAgreementSignature} hint="Type your full legal name exactly as it appears on your ID">
        <input
          value={data.platformAgreementSignature || ''}
          onChange={e => onChange('platformAgreementSignature', e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholder="Your Legal Name"
          className={`${inputCls(focused, !!errors.platformAgreementSignature)} italic font-serif text-lg`}
        />
      </Field>

      {/* Checkbox */}
      <label className="flex items-start gap-4 cursor-pointer p-6 bg-zinc-800/30 rounded-xl border border-white/[0.08] hover:border-emerald-500/20 transition-all group">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={data.platformAgreementSigned || false}
            onChange={e => {
              onChange('platformAgreementSigned', e.target.checked);
              if (e.target.checked) onChange('platformAgreementSignedAt', new Date().toISOString());
            }}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-white/10 bg-zinc-800 checked:bg-emerald-500 checked:border-emerald-500 transition-all"
          />
          <Check size={13} className="absolute inset-0 m-auto pointer-events-none hidden peer-checked:block text-black" />
        </div>
        <span className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-200 transition-colors">
          I have read and agree to the Lugmatic Artist Platform Agreement and the terms outlined above.
        </span>
      </label>
      {errors.platformAgreementSigned && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-rose-400 text-xs pl-1">
          {errors.platformAgreementSigned}
        </motion.p>
      )}
    </div>
  );
}

function StepReview({ data }: any) {
  const rows = [
    { label: 'Artist Name',    value: data.name },
    { label: 'Category',       value: data.artistType },
    { label: 'Genres',         value: (data.genres || []).join(', ') || 'None' },
    { label: 'Location',       value: [data.location?.city, data.location?.country].filter(Boolean).join(', ') || '—' },
    { label: 'Legal Name',     value: data.legalName },
    { label: 'ID Type',        value: ID_TYPES.find(t => t.value === data.idType)?.label || data.idType },
    { label: 'ID Number',      value: data.idNumber },
    { label: 'ID Document',    value: data.idDocumentUrl ? '✓ Uploaded' : '✗ Missing' },
    { label: 'Agreement',      value: data.platformAgreementSigned ? '✓ Signed' : '✗ Unsigned' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
        {rows.map(({ label, value }, i) => (
          <div key={label} className={`flex justify-between items-center px-7 py-4 ${i !== rows.length - 1 ? 'border-b border-white/[0.06]' : ''}`}>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
            <span className={`text-sm font-bold ${String(value).startsWith('✗') ? 'text-rose-400' : String(value).startsWith('✓') ? 'text-emerald-400' : 'text-white'}`}>
              {value || '—'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4 p-6 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
        <ShieldCheck size={22} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-white">Review Timeline</p>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
            Applications are typically processed within 48–72 hours. You'll receive an email once your verification status is updated.
          </p>
        </div>
      </div>
    </div>
  );
}

function PendingScreen() {
  return (
    <div className="text-center py-12 space-y-8">
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-3xl bg-zinc-800/60 border border-white/[0.08] flex items-center justify-center">
          <Clock size={40} className="text-zinc-600" />
        </div>
        <motion.div className="absolute inset-0 rounded-3xl border border-emerald-500/30"
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity }} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Application Under Review</h2>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-3 leading-relaxed">
          We're verifying your credentials. You'll be notified as soon as the process is complete.
        </p>
      </div>
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-800/60 border border-white/[0.08] rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        <Activity size={14} className="text-emerald-500 animate-pulse" />
        Processing
      </div>
    </div>
  );
}

function RejectedScreen({ reason, onResubmit }: { reason: string; onResubmit: () => void }) {
  return (
    <div className="text-center py-12 space-y-8">
      <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
        <ShieldAlert size={40} className="text-rose-400" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Update Required</h2>
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-6 text-left max-w-md mx-auto">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">Feedback from team</p>
          <p className="text-zinc-300 text-sm leading-relaxed">{reason}</p>
        </div>
      </div>
      <motion.button
        onClick={onResubmit}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="relative h-14 px-10 rounded-xl font-bold text-sm text-black overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}
      >
        Revise & Resubmit
      </motion.button>
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep]             = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState<'form' | 'pending' | 'rejected'>('form');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [data, setData]             = useState<Record<string, any>>({});

  useEffect(() => {
    apiService.get<any>('/onboarding/status')
      .then(res => {
        const artist = res.data.data;
        if (!artist) return;
        if (artist.verificationStatus === 'approved') { navigate('/artist', { replace: true }); return; }
        if (artist.verificationStatus === 'pending') { setStatus('pending'); return; }
        if (artist.verificationStatus === 'rejected') {
          setRejectionReason(artist.rejectionReason || '');
          setStatus('rejected'); return;
        }
        setData(prev => ({ ...prev, ...artist }));
        if (typeof artist.onboardingStep === 'number' && artist.onboardingStep > 0)
          setStep(Math.min(artist.onboardingStep, STEPS.length - 1));
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
    try { await apiService.post('/onboarding/save-step', { ...data, ...extraData, step: currentStep }); }
    catch { } finally { setSaving(false); }
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
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!data.name?.trim())            errs.name    = 'Artist name is required';
      if (!data.bio || data.bio.length < 50) errs.bio = 'Bio must be at least 50 characters';
      if (!data.genres?.length)          errs.genres  = 'Select at least one genre';
      if (!data.location?.country?.trim()) errs.country = 'Country is required';
    }
    if (s === 1) {
      if (!data.legalName?.trim())       errs.legalName      = 'Full legal name is required';
      if (!data.dateOfBirth)             errs.dateOfBirth    = 'Date of birth is required';
      if (!data.nationality?.trim())     errs.nationality    = 'Nationality is required';
      if (!data.idType)                  errs.idType         = 'Select document type';
      if (!data.idNumber?.trim())        errs.idNumber       = 'Document number is required';
      if (!data.idDocumentUrl?.trim())   errs.idDocumentUrl  = 'Document upload is required';
    }
    if (s === 2) {
      if (!data.platformAgreementSignature?.trim()) errs.platformAgreementSignature = 'Signature is required';
      if (!data.platformAgreementSigned)            errs.platformAgreementSigned    = 'Please accept the terms';
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
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center">
      <Loader2 size={36} className="text-emerald-500 animate-spin" />
    </div>
  );

  if (status === 'pending' || status === 'rejected') return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(134,229,96,0.06) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-60 -right-60 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(94,196,58,0.04) 0%, transparent 70%)' }} />
      </div>
      <div className="relative w-full max-w-md">
        <div className="relative bg-zinc-900/70 backdrop-blur-2xl rounded-2xl border border-white/[0.09] shadow-2xl overflow-hidden">
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #86E560, transparent)' }} />
          <div className="p-10">
            {status === 'pending'
              ? <PendingScreen />
              : <RejectedScreen reason={rejectionReason} onResubmit={() => setStatus('form')} />}
          </div>
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(134,229,96,0.2), transparent)' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-start p-6 py-16 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div className="absolute -top-72 -left-72 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(134,229,96,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-72 -right-72 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(94,196,58,0.04) 0%, transparent 70%)' }}
          animate={{ scale: [1.08, 1, 1.08], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />
      </div>

      {/* Particles */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      <div className="w-full max-w-2xl relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12 space-y-5">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Music2 size={20} className="text-emerald-400" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Lugmatic</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">Studio</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-white/[0.08] rounded-full">
            <Globe size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Artist Network</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Artist <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #86E560 0%, #5EC43A 50%, #3A8A22 100%)' }}>Onboarding</span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed">
            Complete your profile to start sharing and monetizing your music on Lugmatic.
          </p>
        </motion.div>

        {/* Step tracker */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-between mb-10 px-4 relative">
          <div className="absolute left-4 right-4 top-5 h-px bg-white/[0.06]" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done   = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex flex-col items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 border ${
                  done   ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : active ? 'bg-white border-white text-black shadow-lg shadow-white/15'
                  : 'bg-zinc-900/80 border-white/[0.08] text-zinc-600'
                }`}>
                  {done ? <Check size={18} /> : <Icon size={16} />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="relative bg-zinc-900/70 backdrop-blur-2xl rounded-2xl border border-white/[0.09] shadow-2xl overflow-hidden">

          {/* Top accent */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #86E560, transparent)' }} />

          {/* Progress bar */}
          <div className="h-1 bg-zinc-800/80">
            <motion.div className="h-full shadow-sm shadow-emerald-500/30"
              style={{ background: 'linear-gradient(90deg, #5EC43A, #86E560)' }}
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }} />
          </div>

          {/* Step label */}
          <div className="px-8 pt-8 pb-2">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Step {step + 1} of {STEPS.length}</p>
            <h2 className="text-xl font-bold text-white mt-1">{STEPS[step].label}</h2>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}>
                {step === 0 && <StepProfile   data={data} onChange={update} errors={errors} />}
                {step === 1 && <StepLegal     data={data} onChange={update} errors={errors} onFileUpload={handleFileUpload} uploading={uploading} />}
                {step === 2 && <StepAgreement data={data} onChange={update} errors={errors} />}
                {step === 3 && <StepReview    data={data} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="px-8 py-6 bg-zinc-950/40 border-t border-white/[0.06] flex items-center justify-between gap-4">
            <button onClick={back} disabled={step === 0}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white disabled:opacity-20 transition-all">
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-5">
              {saving && (
                <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                  <Loader2 size={11} className="animate-spin" /> Saving…
                </span>
              )}
              {step < STEPS.length - 1 ? (
                <motion.button onClick={next} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="relative h-12 px-8 rounded-xl font-bold text-sm text-black overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}>
                  <motion.div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #9BEE76 0%, #6ED44A 100%)' }} />
                  <span className="relative flex items-center gap-2">
                    Continue <ArrowRight size={16} />
                  </span>
                </motion.button>
              ) : (
                <motion.button onClick={submit} disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.02 }} whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className="relative h-12 px-8 rounded-xl font-bold text-sm text-black overflow-hidden disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}>
                  <span className="relative flex items-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {submitting ? 'Submitting…' : 'Complete Registration'}
                  </span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(134,229,96,0.2), transparent)' }} />
        </motion.div>

        <p className="text-center text-zinc-700 text-[10px] font-medium mt-8">
          Your information is encrypted and securely stored.
        </p>
      </div>
    </div>
  );
}
