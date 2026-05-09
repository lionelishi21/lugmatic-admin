import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, FileText, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  Upload, AlertCircle, Loader2, Music2, Clock, XCircle, RefreshCw,
  Mic2, Pen, ShieldAlert, Activity, LayoutGrid
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

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic px-1';
const inputClass = 'w-full px-5 py-3 bg-zinc-950 border border-white/[0.08] rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic tracking-widest';

function Field({ label, required, error, children, hint }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass}>
        {label} {required && <span className="text-emerald-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-zinc-600 text-[10px] px-1 font-bold uppercase tracking-tight italic opacity-60">{hint}</p>}
      {error && <p className="text-rose-500 text-[10px] px-1 font-black uppercase tracking-widest italic">{error}</p>}
    </div>
  );
}

// ── Step 1: Artist Profile ─────────────────────────────────────────────

function StepProfile({ data, onChange, errors }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Mic2 className="h-5 w-5 text-emerald-500" />
         </div>
         <div>
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight leading-none">Artist Profile</h2>
            <p className="text-zinc-500 text-xs mt-1 font-medium italic">Establish your identity within the network.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Stage / Artist Name" required error={errors.name}>
          <input
            value={data.name || ''}
            onChange={e => onChange('name', e.target.value)}
            placeholder="E.G. BUJU BANTON"
            className={inputClass}
          />
        </Field>
        <Field label="Artist Type" required>
          <select 
            value={data.artistType || 'solo'} 
            onChange={e => onChange('artistType', e.target.value)}
            className={inputClass + " appearance-none cursor-pointer"}
          >
            <option value="solo">SOLO ARTIST</option>
            <option value="band">BAND / GROUP</option>
            <option value="producer">PRODUCER / BEATMAKER</option>
            <option value="podcaster">PODCASTER</option>
            <option value="composer">COMPOSER</option>
          </select>
        </Field>
      </div>

      <Field label="Operational Bio" required error={errors.bio}
        hint="Minimum 50 characters. Document your sonic journey and influences.">
        <textarea
          value={data.bio || ''}
          onChange={e => onChange('bio', e.target.value)}
          rows={5}
          placeholder="I'M A REGGAE ARTIST FROM KINGSTON, JAMAICA, INFLUENCED BY..."
          className={inputClass + " resize-none leading-relaxed h-auto"}
        />
        <div className="text-right text-[9px] font-black text-zinc-700 uppercase tracking-widest mt-1">{(data.bio || '').length} / 2000</div>
      </Field>

      <Field label="Genre Sectoring" required error={errors.genres} hint="Select primary audio classifications (minimum 1)">
        <div className="flex flex-wrap gap-2.5 mt-2 p-4 bg-zinc-950 rounded-2xl border border-white/[0.04] shadow-inner">
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
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all italic ${
                  selected
                    ? 'bg-emerald-500 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/20'
                    : 'bg-zinc-900 border-white/[0.06] text-zinc-500 hover:border-zinc-700'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Base Operations (Country)" required error={errors.country}>
          <input
            value={data.location?.country || ''}
            onChange={e => onChange('location', { ...data.location, country: e.target.value })}
            placeholder="E.G. JAMAICA"
            className={inputClass}
          />
        </Field>
        <Field label="Hub (City)">
          <input
            value={data.location?.city || ''}
            onChange={e => onChange('location', { ...data.location, city: e.target.value })}
            placeholder="E.G. KINGSTON"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Direct Frequency (Phone)">
          <input value={data.contactPhone || ''} onChange={e => onChange('contactPhone', e.target.value)} placeholder="+1 876 000 0000" className={inputClass} />
        </Field>
        <Field label="Transmission Email">
          <input type="email" value={data.contactEmail || ''} onChange={e => onChange('contactEmail', e.target.value)} placeholder="BOOKING@EXAMPLE.COM" className={inputClass} />
        </Field>
      </div>
    </div>
  );
}

// ── Step 2: Legal Details ──────────────────────────────────────────────

function StepLegal({ data, onChange, errors, onFileUpload, uploading }: any) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <User className="h-5 w-5 text-emerald-500" />
         </div>
         <div>
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight leading-none">Identity Verification</h2>
            <p className="text-zinc-500 text-xs mt-1 font-medium italic">Legal validation required for revenue distribution.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Legal Core Identity (Full Name)" required error={errors.legalName}
          hint="As it appears on your government identification">
          <input value={data.legalName || ''} onChange={e => onChange('legalName', e.target.value)} placeholder="GIVEN NAMES + SURNAME" className={inputClass} />
        </Field>
        <Field label="Date of Birth" required error={errors.dateOfBirth}>
          <input type="date" value={data.dateOfBirth || ''} onChange={e => onChange('dateOfBirth', e.target.value)}
            className={inputClass + " appearance-none"}
            max={new Date(Date.now() - 16 * 365.25 * 86400000).toISOString().split('T')[0]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nationality / Sector Citizenship" required error={errors.nationality}>
          <input value={data.nationality || ''} onChange={e => onChange('nationality', e.target.value)} placeholder="E.G. JAMAICAN" className={inputClass} />
        </Field>
        <Field label="PRO Affiliation" hint="Performing Rights Organisation registered">
          <select value={data.proAffiliation || ''} onChange={e => onChange('proAffiliation', e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
            <option value="">SELECT PRO (OR NONE)</option>
            {PRO_ORGS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
          </select>
        </Field>
      </div>

      {data.proAffiliation && data.proAffiliation !== 'None' && (
        <Field label="IPI / CAE Signature Number" hint="Unique composer/publisher identifier">
          <input value={data.ipiNumber || ''} onChange={e => onChange('ipiNumber', e.target.value)} placeholder="E.G. 00123456789" className={inputClass} />
        </Field>
      )}

      <div className="pt-4 space-y-5">
        <div className="flex items-center gap-3">
           <ShieldCheck className="h-4 w-4 text-emerald-500" />
           <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Government Credentials</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Credential Type" required error={errors.idType}>
            <select value={data.idType || ''} onChange={e => onChange('idType', e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
              <option value="">SELECT ID TYPE</option>
              {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>)}
            </select>
          </Field>
          <Field label="Credential Identifier" required error={errors.idNumber} hint="Number as printed on document">
            <input value={data.idNumber || ''} onChange={e => onChange('idNumber', e.target.value)} placeholder="E.G. A12345678" className={inputClass} />
          </Field>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            data.idDocumentUrl
              ? 'border-emerald-500/40 bg-emerald-500/[0.02] shadow-2xl shadow-emerald-500/5'
              : 'border-white/10 bg-zinc-950/50 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]'
          }`}
        >
          <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={e => onFileUpload(e.target.files?.[0])} />
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Synchronizing File...</p>
            </div>
          ) : data.idDocumentUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Credential Uploaded</p>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">TAP TO REPLACE FILE</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/[0.04] group-hover:scale-110 transition-transform shadow-inner">
                <Upload className="w-8 h-8 text-zinc-600 group-hover:text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Upload Government Credential</p>
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">JPEG, PNG, OR PDF · MAX 10 MB</p>
              </div>
            </div>
          )}
        </div>
        {errors.idDocumentUrl && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest italic text-center">{errors.idDocumentUrl}</p>}
      </div>
    </div>
  );
}

// ── Step 3: Platform Agreement (Split Sheet) ───────────────────────────

function StepAgreement({ data, onChange, errors }: any) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Pen className="h-5 w-5 text-emerald-500" />
         </div>
         <div>
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight leading-none">Fiscal Agreement</h2>
            <p className="text-zinc-500 text-xs mt-1 font-medium italic">Execute the standard revenue distribution protocol.</p>
         </div>
      </div>

      {/* Revenue split summary */}
      <div className="bg-zinc-950 border border-white/[0.06] rounded-2xl p-6 space-y-6 shadow-inner">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Standard Revenue Split Matrix</h3>
        <div className="space-y-6">
          {[
            { party: 'ARTIST ENTITY', pct: ARTIST_SPLIT, color: 'bg-emerald-500' },
            { party: 'LUGMATIC NETWORK', pct: PLATFORM_SPLIT, color: 'bg-zinc-700' },
          ].map(row => (
            <div key={row.party} className="space-y-2.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{row.party}</span>
                  <span className="text-lg font-black text-white italic tracking-tighter tabular-nums">{row.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/[0.02]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${row.color} shadow-[0_0_12px_rgba(16,185,129,0.2)]`} 
                  />
                </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
          THIS SPLIT APPLIES TO GLOBAL STREAMING REVENUE AND DIGITAL GIFT TRANSFERS. TRACK-SPECIFIC COLLABORATOR LEDGERS ARE CONFIGURED DURING INDIVIDUAL ASSET UPLOAD.
        </p>
      </div>

      {/* Agreement terms */}
      <div className="bg-zinc-950 border border-white/[0.04] rounded-2xl p-6 h-64 overflow-y-auto space-y-4 text-[11px] text-zinc-500 leading-relaxed shadow-inner scrollbar-hide">
        <p className="font-black text-emerald-500 text-xs uppercase tracking-widest italic">Lugmatic Artist Platform Agreement v4.0</p>
        <p><strong className="text-zinc-300 font-black uppercase">1. Rights Representation.</strong> You confirm that you own or control all necessary rights to the music and content you upload to Lugmatic, including master recordings, compositions, and any associated artwork.</p>
        <p><strong className="text-zinc-300 font-black uppercase">2. Revenue Share.</strong> You agree to the revenue split described above ({ARTIST_SPLIT}% to you, {PLATFORM_SPLIT}% to Lugmatic) for all monetisation activities on the platform including streaming, gifts, and live events.</p>
        <p><strong className="text-zinc-300 font-black uppercase">3. Identity Verification.</strong> You confirm that the identity documents submitted are authentic and belong to you. Providing false identity information may result in immediate account termination and legal action.</p>
        <p><strong className="text-zinc-300 font-black uppercase">4. Collaborator Split Sheets.</strong> For any track featuring collaborators (co-writers, producers, featured artists), you agree to accurately complete a split sheet at the time of upload, ensuring all contributors are credited and compensated fairly.</p>
        <p><strong className="text-zinc-300 font-black uppercase">5. Content Standards.</strong> You agree not to upload content that infringes third-party rights, contains hate speech, explicit violence, or violates Lugmatic's Community Guidelines.</p>
        <p><strong className="text-zinc-300 font-black uppercase">6. Live Streaming.</strong> You accept that live streams are subject to real-time content moderation. Violations may result in stream termination and suspension of live privileges.</p>
        <p><strong className="text-zinc-300 font-black uppercase">7. Payouts.</strong> Earnings are paid out monthly provided your balance meets the minimum threshold. Payout method and banking details are configured in your account settings.</p>
        <p><strong className="text-zinc-300 font-black uppercase">8. Termination.</strong> Lugmatic reserves the right to suspend or terminate accounts that violate these terms, with prior notice where possible.</p>
        <p className="text-zinc-700 font-bold uppercase italic mt-4">By executing this digital signature, you acknowledge full compliance with Lugmatic's core operational protocols and privacy standards.</p>
      </div>

      {/* Digital signature */}
      <div className="space-y-6">
        <Field label="Authorized Digital Execution (Full Name)" required error={errors.platformAgreementSignature}
          hint="Type your full legal name as it appears on your verified credential">
          <input
            value={data.platformAgreementSignature || ''}
            onChange={e => onChange('platformAgreementSignature', e.target.value)}
            placeholder="TYPE LEGAL SIGNATURE"
            className={inputClass + " font-serif italic text-lg tracking-normal placeholder:tracking-widest"}
          />
        </Field>

        <label className="flex items-start gap-4 cursor-pointer group bg-zinc-950 p-5 rounded-2xl border border-white/[0.04] transition-all hover:border-emerald-500/20">
          <div className="relative mt-1 flex-none">
            <input
              type="checkbox"
              checked={data.platformAgreementSigned || false}
              onChange={e => {
                onChange('platformAgreementSigned', e.target.checked);
                if (e.target.checked) onChange('platformAgreementSignedAt', new Date().toISOString());
              }}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-white/10 bg-zinc-900 checked:bg-emerald-500 checked:border-emerald-500 transition-all"
            />
            <CheckCircle2 className="absolute inset-0 h-5 w-5 pointer-events-none hidden peer-checked:block text-black" />
          </div>
          <span className="text-zinc-500 text-[11px] font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
            I HAVE READ AND FULLY CONCUR WITH THE LUGMATIC ARTIST PLATFORM AGREEMENT. I CONFIRM THAT THE SUBMITTED TELEMETRY IS ACCURATE AND I AM AUTHORIZED TO EXECUTE THIS PROTOCOL.
          </span>
        </label>
        {errors.platformAgreementSigned && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest italic px-2">{errors.platformAgreementSigned}</p>}
      </div>
    </div>
  );
}

// ── Step 4: Review & Submit ───────────────────────────────────────────

function StepReview({ data }: any) {
  const sections = [
    { label: 'STAGE NAME',      value: data.name?.toUpperCase() },
    { label: 'ARTIST TYPE',     value: data.artistType?.toUpperCase() },
    { label: 'GENRE SECTORS',   value: (data.genres || []).join(', ').toUpperCase() || '—' },
    { label: 'BASE COUNTRY',    value: data.location?.country?.toUpperCase() },
    { label: 'LEGAL IDENTITY',  value: data.legalName?.toUpperCase() },
    { label: 'NATIONALITY',     value: data.nationality?.toUpperCase() },
    { label: 'ID LOGIC',        value: ID_TYPES.find(t => t.value === data.idType)?.label.toUpperCase() || data.idType?.toUpperCase() },
    { label: 'ID IDENTIFIER',   value: data.idNumber },
    { label: 'CREDENTIAL FILE', value: data.idDocumentUrl ? '✓ SYNCHRONIZED' : '✗ MISSING' },
    { label: 'PRO ENTITY',      value: data.proAffiliation?.toUpperCase() || 'NONE' },
    { label: 'FISCAL EXECUTION',value: data.platformAgreementSigned ? `✓ SIGNED: "${data.platformAgreementSignature}"` : '✗ UNSIGNED' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
         <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <LayoutGrid className="h-5 w-5 text-emerald-500" />
         </div>
         <div>
            <h2 className="text-lg font-black text-white uppercase italic tracking-tight leading-none">Manifest Review</h2>
            <p className="text-zinc-500 text-xs mt-1 font-medium italic">Validate all data parameters before final transmission.</p>
         </div>
      </div>

      <div className="bg-zinc-950 border border-white/[0.06] rounded-2xl divide-y divide-white/[0.04] shadow-inner overflow-hidden">
        {sections.map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-6 py-4 text-[11px] group hover:bg-white/[0.01] transition-colors">
            <span className="text-zinc-600 font-black uppercase tracking-widest italic">{label}</span>
            <span className={`text-right max-w-[55%] truncate font-black uppercase italic tracking-tight ${
              String(value).startsWith('✗') ? 'text-rose-500' : 'text-zinc-300'
            }`}>{value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex gap-5 shadow-xl shadow-amber-500/5">
        <AlertCircle className="w-6 h-6 text-amber-500 flex-none mt-1 shadow-sm" />
        <div className="space-y-2">
          <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest italic">Verification Cycle Information</p>
          <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase tracking-tight">
             UPON SUBMISSION, THE INTELLIGENCE CORE WILL VERIFY YOUR CREDENTIALS. THIS PROCESS TYPICALLY REQUIRES <strong className="text-zinc-300">48–72 OPERATIONAL HOURS</strong>. YOU WILL RETAIN PLATFORM ACCESS BUT ASSET UPLOAD AND LIVE TRANSMISSION WILL BE RESTRICTED UNTIL APPROVAL.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Status screens ────────────────────────────────────────────────────

function PendingScreen() {
  return (
    <div className="text-center py-20 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/10">
        <Clock className="w-10 h-10 text-amber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Transmission Pending</h2>
        <p className="text-zinc-500 max-w-sm mx-auto text-[11px] mt-2 font-medium uppercase tracking-tight leading-relaxed">
          YOUR APPLICATION HAS BEEN INGESTED AND IS CURRENTLY UNDER REVIEW BY THE NETWORK ADMINS. STATUS NOTIFICATION WILL BE RELAYED VIA EMAIL.
        </p>
      </div>
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-zinc-950 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest italic shadow-inner">
        <Activity className="w-4 h-4 animate-pulse" />
        Awaiting Network Approval
      </div>
    </div>
  );
}

function RejectedScreen({ reason, onResubmit }: { reason: string; onResubmit: () => void }) {
  return (
    <div className="text-center py-20 space-y-8">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-rose-500/10">
        <ShieldAlert className="w-10 h-10 text-rose-500" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Update Required</h2>
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 text-left max-w-md mx-auto mt-6 shadow-inner">
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 italic">Reviewer Feedback:</p>
          <p className="text-rose-200 text-sm font-medium leading-relaxed italic">{reason}</p>
        </div>
      </div>
      <button 
        onClick={onResubmit} 
        className="flex items-center gap-3 mx-auto px-10 py-4 bg-white text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
      >
        <RefreshCw className="w-4 h-4" /> Update & Resubmit Protocol
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState<'form' | 'pending' | 'rejected'>('form');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [data, setData]           = useState<Record<string, any>>({});

  // Load any previously saved onboarding data on mount
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
      .catch(() => { /* start fresh on error */ })
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
      const { uploadUrl, publicUrl } = presign.data.data;
      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      update('idDocumentUrl', publicUrl);
      await saveStep(1, { idDocumentUrl: publicUrl });
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

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
    </div>
  );

  if (status === 'pending') return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className={`${card} max-w-lg w-full p-10 shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
        <PendingScreen />
      </div>
    </div>
  );

  if (status === 'rejected') return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className={`${card} max-w-lg w-full p-10 shadow-2xl relative overflow-hidden border-rose-500/20`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
        <RejectedScreen reason={rejectionReason} onResubmit={() => setStatus('form')} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4 px-4 py-1.5 bg-zinc-900 border border-white/[0.04] rounded-full shadow-inner">
            <Mic2 className="w-4 h-4 text-emerald-500" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] italic">Lugmatic Studio Network</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Artist Application</h1>
          <p className="text-zinc-500 text-[11px] mt-2 font-black uppercase tracking-widest italic opacity-60">Initialize your presence within the global audio grid.</p>
        </div>

        {/* Step tracker HUD */}
        <div className="flex items-center justify-between mb-12 px-6 relative">
          <div className="absolute left-6 right-6 top-[18px] h-px bg-zinc-800" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-xl ${
                  done   ? 'bg-emerald-500 border-emerald-500 shadow-emerald-500/20'
                  : active ? 'bg-zinc-900 border-emerald-500 shadow-emerald-500/10'
                  : 'bg-zinc-900 border-zinc-800'
                }`}>
                  {done ? <CheckCircle2 className="w-5 h-5 text-black" /> : <Icon className={`w-4 h-4 ${active ? 'text-emerald-500' : 'text-zinc-700'}`} />}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest text-center hidden md:block italic ${active ? 'text-emerald-500' : done ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Console */}
        <div className={`${card} overflow-hidden shadow-2xl`}>
          <div className="h-1 w-full bg-zinc-900 overflow-hidden">
            <motion.div 
               className="h-full bg-emerald-500"
               initial={{ width: 0 }}
               animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
               transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && <StepProfile data={data} onChange={update} errors={errors} />}
                {step === 1 && <StepLegal data={data} onChange={update} errors={errors} onFileUpload={handleFileUpload} uploading={uploading} />}
                {step === 2 && <StepAgreement data={data} onChange={update} errors={errors} />}
                {step === 3 && <StepReview data={data} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Console */}
          <div className="flex items-center justify-between px-8 md:px-12 py-8 bg-zinc-950/50 border-t border-white/[0.04]">
            <button
              onClick={back}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[10px] font-black uppercase tracking-widest italic"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="flex items-center gap-6">
              {saving && <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> SYNCING...</span>}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-3 px-8 h-12 bg-white text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-3 px-10 h-12 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xl shadow-emerald-600/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {submitting ? 'TRANSMITTING...' : 'Execute Submission'}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-[9px] font-black uppercase tracking-[0.2em] mt-8 italic opacity-40">
          ALL SUBMITTED TELEMETRY IS ENCRYPTED AND RESTRICTED TO AUTHORIZED NETWORK OPERATORS.
        </p>
      </div>
    </div>
  );
}

