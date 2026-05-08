import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, FileText, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, AlertCircle, Loader2, Music2, Clock, XCircle, RefreshCw,
  Mic2, Pen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import apiService from '../../services/api';

// ── Constants ─────────────────────────────────────────────────────────

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
  { id: 'profile',   label: 'Artist Profile',    icon: Mic2 },
  { id: 'legal',     label: 'Legal Details',      icon: User },
  { id: 'agreement', label: 'Platform Agreement', icon: Pen },
  { id: 'review',    label: 'Review & Submit',    icon: CheckCircle2 },
];

const PLATFORM_SPLIT = 20; // Lugmatic platform cut (%)
const ARTIST_SPLIT   = 80;

// ── Shared field wrapper ──────────────────────────────────────────────

function Field({ label, required, error, children, hint }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
        {label} {required && <span className="text-emerald-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-zinc-600 text-[11px]">{hint}</p>}
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 bg-zinc-800/60 border border-white/[0.07] rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all ${className}`}
    />
  );
}

function Select({ children, className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3.5 py-2.5 bg-zinc-800/60 border border-white/[0.07] rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${className}`}
    >
      {children}
    </select>
  );
}

// ── Step 1: Artist Profile ─────────────────────────────────────────────

function StepProfile({ data, onChange, errors }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Artist Profile</h2>
        <p className="text-zinc-400 text-sm mt-1">Tell the world who you are as an artist.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Stage / Artist Name" required error={errors.name}>
          <Input
            value={data.name || ''}
            onChange={e => onChange('name', e.target.value)}
            placeholder="e.g. Buju Banton"
          />
        </Field>
        <Field label="Artist Type" required>
          <Select value={data.artistType || 'solo'} onChange={e => onChange('artistType', e.target.value)}>
            <option value="solo">Solo Artist</option>
            <option value="band">Band / Group</option>
            <option value="producer">Producer / Beatmaker</option>
            <option value="podcaster">Podcaster</option>
            <option value="composer">Composer</option>
          </Select>
        </Field>
      </div>

      <Field label="Bio" required error={errors.bio}
        hint="Minimum 50 characters. Tell fans about your musical journey, influences, and style.">
        <textarea
          value={data.bio || ''}
          onChange={e => onChange('bio', e.target.value)}
          rows={4}
          placeholder="I'm a reggae artist from Kingston, Jamaica, influenced by..."
          className="w-full px-3.5 py-2.5 bg-zinc-800/60 border border-white/[0.07] rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none"
        />
        <div className="text-right text-[11px] text-zinc-600 mt-1">{(data.bio || '').length} / 2000</div>
      </Field>

      <Field label="Genres" required error={errors.genres} hint="Select all that apply (minimum 1)">
        <div className="flex flex-wrap gap-2 mt-1">
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selected
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                    : 'bg-zinc-800/60 border-white/[0.07] text-zinc-400 hover:border-white/20'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Country" required error={errors.country}>
          <Input
            value={data.location?.country || ''}
            onChange={e => onChange('location', { ...data.location, country: e.target.value })}
            placeholder="e.g. Jamaica"
          />
        </Field>
        <Field label="City">
          <Input
            value={data.location?.city || ''}
            onChange={e => onChange('location', { ...data.location, city: e.target.value })}
            placeholder="e.g. Kingston"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Contact Phone">
          <Input value={data.contactPhone || ''} onChange={e => onChange('contactPhone', e.target.value)} placeholder="+1 876 000 0000" />
        </Field>
        <Field label="Contact Email">
          <Input type="email" value={data.contactEmail || ''} onChange={e => onChange('contactEmail', e.target.value)} placeholder="booking@example.com" />
        </Field>
      </div>
    </div>
  );
}

// ── Step 2: Legal Details ──────────────────────────────────────────────

function StepLegal({ data, onChange, errors, onFileUpload, uploading }: any) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Legal & Identity Verification</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Required by law and to protect you and your collaborators. All data is encrypted and stored securely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Legal Full Name" required error={errors.legalName}
          hint="As it appears on your government ID">
          <Input value={data.legalName || ''} onChange={e => onChange('legalName', e.target.value)} placeholder="Given names + Surname" />
        </Field>
        <Field label="Date of Birth" required error={errors.dateOfBirth}>
          <Input type="date" value={data.dateOfBirth || ''} onChange={e => onChange('dateOfBirth', e.target.value)}
            max={new Date(Date.now() - 16 * 365.25 * 86400000).toISOString().split('T')[0]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nationality / Country of Citizenship" required error={errors.nationality}>
          <Input value={data.nationality || ''} onChange={e => onChange('nationality', e.target.value)} placeholder="e.g. Jamaican" />
        </Field>
        <Field label="PRO Affiliation" hint="Performing Rights Organisation you're registered with">
          <Select value={data.proAffiliation || ''} onChange={e => onChange('proAffiliation', e.target.value)}>
            <option value="">Select PRO (or None)</option>
            {PRO_ORGS.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </Field>
      </div>

      {data.proAffiliation && data.proAffiliation !== 'None' && (
        <Field label="IPI / CAE Number" hint="Your unique composer/publisher identifier from your PRO">
          <Input value={data.ipiNumber || ''} onChange={e => onChange('ipiNumber', e.target.value)} placeholder="e.g. 00123456789" />
        </Field>
      )}

      <div className="border-t border-white/[0.06] pt-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Government ID Verification</h3>
        <p className="text-zinc-500 text-xs">Upload a clear photo or scan of a valid government-issued ID. This is required to comply with anti-fraud and rights management regulations.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="ID Type" required error={errors.idType}>
            <Select value={data.idType || ''} onChange={e => onChange('idType', e.target.value)}>
              <option value="">Select ID type</option>
              {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
          <Field label="ID Number" required error={errors.idNumber} hint="Number as printed on your document">
            <Input value={data.idNumber || ''} onChange={e => onChange('idNumber', e.target.value)} placeholder="e.g. A12345678" />
          </Field>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            data.idDocumentUrl
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
          }`}
        >
          <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={e => onFileUpload(e.target.files?.[0])} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-zinc-400 text-sm">Uploading...</p>
            </div>
          ) : data.idDocumentUrl ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              <p className="text-emerald-400 text-sm font-semibold">ID Document Uploaded</p>
              <p className="text-zinc-500 text-xs">Click to replace</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-zinc-500" />
              <p className="text-zinc-300 text-sm font-medium">Click to upload your ID document</p>
              <p className="text-zinc-600 text-xs">JPEG, PNG, or PDF · Max 5 MB</p>
            </div>
          )}
        </div>
        {errors.idDocumentUrl && <p className="text-red-400 text-[11px]">{errors.idDocumentUrl}</p>}
      </div>
    </div>
  );
}

// ── Step 3: Platform Agreement (Split Sheet) ───────────────────────────

function StepAgreement({ data, onChange, errors }: any) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Platform Revenue Agreement</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Review the standard royalty split and rights agreement. This must be signed before you can upload tracks or go live.
        </p>
      </div>

      {/* Revenue split summary */}
      <div className="bg-zinc-800/40 border border-white/[0.07] rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Standard Revenue Split</h3>
        <div className="space-y-2">
          {[
            { party: 'You (Artist)', pct: ARTIST_SPLIT, color: 'bg-emerald-500' },
            { party: 'Lugmatic Platform', pct: PLATFORM_SPLIT, color: 'bg-zinc-600' },
          ].map(row => (
            <div key={row.party} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-zinc-300 text-xs">{row.party}</span>
                  <span className="text-white text-xs font-bold">{row.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                  <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-zinc-500 text-xs">
          This split applies to all streaming revenue and gift earnings on the platform. Per-track collaborator splits are configured separately when you upload each track.
        </p>
      </div>

      {/* Agreement terms */}
      <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-5 max-h-64 overflow-y-auto space-y-3 text-xs text-zinc-400 leading-relaxed">
        <p className="font-bold text-zinc-200 text-sm">Lugmatic Artist Platform Agreement</p>
        <p><strong className="text-zinc-200">1. Rights Representation.</strong> You confirm that you own or control all necessary rights to the music and content you upload to Lugmatic, including master recordings, compositions, and any associated artwork.</p>
        <p><strong className="text-zinc-200">2. Revenue Share.</strong> You agree to the revenue split described above ({ARTIST_SPLIT}% to you, {PLATFORM_SPLIT}% to Lugmatic) for all monetisation activities on the platform including streaming, gifts, and live events.</p>
        <p><strong className="text-zinc-200">3. Identity Verification.</strong> You confirm that the identity documents submitted are authentic and belong to you. Providing false identity information may result in immediate account termination and legal action.</p>
        <p><strong className="text-zinc-200">4. Collaborator Split Sheets.</strong> For any track featuring collaborators (co-writers, producers, featured artists), you agree to accurately complete a split sheet at the time of upload, ensuring all contributors are credited and compensated fairly.</p>
        <p><strong className="text-zinc-200">5. Content Standards.</strong> You agree not to upload content that infringes third-party rights, contains hate speech, explicit violence, or violates Lugmatic's Community Guidelines.</p>
        <p><strong className="text-zinc-200">6. Live Streaming.</strong> You accept that live streams are subject to real-time content moderation. Violations may result in stream termination and suspension of live privileges.</p>
        <p><strong className="text-zinc-200">7. Payouts.</strong> Earnings are paid out monthly provided your balance meets the minimum threshold. Payout method and banking details are configured in your account settings.</p>
        <p><strong className="text-zinc-200">8. Termination.</strong> Lugmatic reserves the right to suspend or terminate accounts that violate these terms, with prior notice where possible.</p>
        <p className="text-zinc-500">By signing below you acknowledge you have read, understood, and agree to be bound by this agreement and Lugmatic's full Terms of Service and Privacy Policy.</p>
      </div>

      {/* Digital signature */}
      <div className="space-y-3">
        <Field label="Digital Signature" required error={errors.platformAgreementSignature}
          hint="Type your full legal name exactly as it appears on your government ID">
          <Input
            value={data.platformAgreementSignature || ''}
            onChange={e => onChange('platformAgreementSignature', e.target.value)}
            placeholder="Type your full legal name"
            className="font-serif italic text-base"
          />
        </Field>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 flex-none">
            <input
              type="checkbox"
              checked={data.platformAgreementSigned || false}
              onChange={e => {
                onChange('platformAgreementSigned', e.target.checked);
                if (e.target.checked) onChange('platformAgreementSignedAt', new Date().toISOString());
              }}
              className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/10 bg-zinc-800 checked:bg-emerald-500 checked:border-emerald-500 transition-all"
            />
            <CheckCircle2 className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-black" />
          </div>
          <span className="text-zinc-400 text-[12px] leading-relaxed group-hover:text-zinc-300 transition-colors">
            I have read and agree to the Lugmatic Artist Platform Agreement. I confirm that my submitted information is accurate and I am authorised to enter into this agreement.
          </span>
        </label>
        {errors.platformAgreementSigned && <p className="text-red-400 text-[11px]">{errors.platformAgreementSigned}</p>}
      </div>
    </div>
  );
}

// ── Step 4: Review & Submit ───────────────────────────────────────────

function StepReview({ data }: any) {
  const sections = [
    { label: 'Stage Name',      value: data.name },
    { label: 'Artist Type',     value: data.artistType },
    { label: 'Genres',          value: (data.genres || []).join(', ') || '—' },
    { label: 'Country',         value: data.location?.country },
    { label: 'Legal Name',      value: data.legalName },
    { label: 'Nationality',     value: data.nationality },
    { label: 'ID Type',         value: ID_TYPES.find(t => t.value === data.idType)?.label || data.idType },
    { label: 'ID Number',       value: data.idNumber },
    { label: 'ID Document',     value: data.idDocumentUrl ? '✓ Uploaded' : '✗ Missing' },
    { label: 'PRO',             value: data.proAffiliation || 'None' },
    { label: 'Agreement',       value: data.platformAgreementSigned ? `✓ Signed as "${data.platformAgreementSignature}"` : '✗ Not signed' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Review Your Application</h2>
        <p className="text-zinc-400 text-sm mt-1">
          Double-check everything before submitting. An admin will review your application within <strong className="text-zinc-200">2–3 business days</strong>.
        </p>
      </div>

      <div className="bg-zinc-800/30 border border-white/[0.06] rounded-xl divide-y divide-white/[0.05]">
        {sections.map(({ label, value }) => (
          <div key={label} className="flex justify-between px-5 py-3 text-sm">
            <span className="text-zinc-500">{label}</span>
            <span className={`text-right max-w-[55%] truncate ${
              String(value).startsWith('✗') ? 'text-red-400' : 'text-zinc-200'
            }`}>{value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-none mt-0.5" />
        <div className="text-xs text-amber-200 space-y-1">
          <p className="font-bold">What happens next?</p>
          <p>Once submitted, our team will verify your identity and review your application. You can still browse the platform but you won't be able to go live or upload tracks until you're approved. You'll receive an email notification when the review is complete.</p>
        </div>
      </div>
    </div>
  );
}

// ── Status screens ────────────────────────────────────────────────────

function PendingScreen() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
        <Clock className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Application Under Review</h2>
      <p className="text-zinc-400 max-w-sm mx-auto text-sm leading-relaxed">
        Your application has been submitted and is being reviewed by our team. This typically takes 2–3 business days. We'll notify you by email once it's processed.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Pending Admin Review
      </div>
    </div>
  );
}

function RejectedScreen({ reason, onResubmit }: { reason: string; onResubmit: () => void }) {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-white">Application Needs Updates</h2>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left max-w-md mx-auto">
        <p className="text-red-300 text-xs font-bold mb-1">Reason from reviewer:</p>
        <p className="text-red-200 text-sm">{reason}</p>
      </div>
      <p className="text-zinc-400 text-sm">Please fix the issues above and resubmit your application.</p>
      <button onClick={onResubmit} className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-bold text-sm text-black" style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}>
        <RefreshCw className="w-4 h-4" /> Update & Resubmit
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]       = useState<'form' | 'pending' | 'rejected'>('form');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [data, setData]           = useState<Record<string, any>>({});

  const update = useCallback((key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const saveStep = async (currentStep: number) => {
    setSaving(true);
    try {
      await apiService.post('/onboarding/save-step', { ...data, step: currentStep });
    } catch { /* non-blocking */ }
    finally { setSaving(false); }
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10 MB'); return; }
    setUploading(true);
    try {
      const presign = await apiService.post<any>('/upload/presign/id-document', {
        filename: file.name, contentType: file.type,
      });
      await fetch(presign.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      update('idDocumentUrl', presign.data.publicUrl);
      toast.success('ID document uploaded');
    } catch {
      toast.error('Upload failed — please try again');
    } finally {
      setUploading(false);
    }
  };

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!data.name?.trim())         errs.name    = 'Stage name is required';
      if (!data.bio || data.bio.length < 50) errs.bio = 'Bio must be at least 50 characters';
      if (!data.genres?.length)       errs.genres  = 'Select at least one genre';
      if (!data.location?.country?.trim()) errs.country = 'Country is required';
    }
    if (s === 1) {
      if (!data.legalName?.trim())    errs.legalName    = 'Legal name is required';
      if (!data.dateOfBirth)          errs.dateOfBirth  = 'Date of birth is required';
      if (!data.nationality?.trim())  errs.nationality  = 'Nationality is required';
      if (!data.idType)               errs.idType       = 'Select an ID type';
      if (!data.idNumber?.trim())     errs.idNumber     = 'ID number is required';
      if (!data.idDocumentUrl?.trim()) errs.idDocumentUrl = 'Please upload your ID document';
    }
    if (s === 2) {
      if (!data.platformAgreementSignature?.trim()) errs.platformAgreementSignature = 'Your signature is required';
      if (!data.platformAgreementSigned) errs.platformAgreementSigned = 'You must agree to the platform terms';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = async () => {
    if (!validate(step)) return;
    await saveStep(step + 1);
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const submit = async () => {
    setSubmitting(true);
    try {
      await apiService.post('/onboarding/submit', data);
      setStatus('pending');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Submission failed';
      const missing = err.response?.data?.missing;
      if (missing?.length) {
        toast.error(`Missing: ${missing.join(', ')}`, { duration: 6000 });
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'pending') return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-zinc-900/70 backdrop-blur-xl border border-white/[0.09] rounded-2xl p-8">
        <PendingScreen />
      </div>
    </div>
  );

  if (status === 'rejected') return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-zinc-900/70 backdrop-blur-xl border border-white/[0.09] rounded-2xl p-8">
        <RejectedScreen reason={rejectionReason} onResubmit={() => setStatus('form')} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Mic2 className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-bold">Lugmatic Studio</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Artist Application</h1>
          <p className="text-zinc-400 text-sm mt-2">Complete all steps to apply for your artist account.</p>
        </div>

        {/* Step tracker */}
        <div className="flex items-center justify-between mb-8 px-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done   ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_16px_rgba(134,229,96,0.3)]'
                  : active ? 'bg-zinc-800 border-emerald-500'
                  : 'bg-zinc-800 border-zinc-700'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4 text-black" /> : <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-zinc-600'}`} />}
                </div>
                <span className={`text-[10px] font-semibold text-center hidden md:block ${active ? 'text-emerald-400' : done ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="absolute" style={{ left: `${((i + 0.5) / STEPS.length) * 100}%`, width: `${100 / STEPS.length}%` }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/[0.09] rounded-2xl overflow-hidden">
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #86E560, transparent)' }} />

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && <StepProfile data={data} onChange={update} errors={errors} />}
                {step === 1 && <StepLegal data={data} onChange={update} errors={errors} onFileUpload={handleFileUpload} uploading={uploading} />}
                {step === 2 && <StepAgreement data={data} onChange={update} errors={errors} />}
                {step === 3 && <StepReview data={data} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 md:px-8 py-5 border-t border-white/[0.06]">
            <button
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-2">
              {saving && <span className="text-zinc-500 text-xs flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-black transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {submitting ? 'Submitting…' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-4">
          Your data is encrypted and only accessible to authorised Lugmatic staff.
        </p>
      </div>
    </div>
  );
}
