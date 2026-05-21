import { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Lock, Mail, ArrowRight, ArrowLeft,
  User, CheckCircle2, Mic2, Star, Globe, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import apiService from '../../services/api';

// ── Validation ────────────────────────────────────────────────────────
const schema = yup.object({
  firstName:       yup.string().required('First name is required'),
  lastName:        yup.string().required('Last name is required'),
  email:           yup.string().email('Enter a valid email').required('Email is required'),
  password:        yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Required'),
  agreeToTerms:    yup.boolean().oneOf([true], 'You must agree to the terms'),
});
type FormValues = yup.InferType<typeof schema>;

// ── Shared constants (matches Login.tsx) ─────────────────────────────
const PARTICLES = [
  { x: 8,  y: 18, size: 4, delay: 0 },
  { x: 88, y: 12, size: 6, delay: 1.2 },
  { x: 18, y: 78, size: 3, delay: 0.8 },
  { x: 92, y: 55, size: 5, delay: 2 },
  { x: 48, y: 8,  size: 4, delay: 1.5 },
  { x: 4,  y: 48, size: 3, delay: 0.4 },
  { x: 78, y: 82, size: 6, delay: 2.5 },
  { x: 38, y: 92, size: 3, delay: 1.8 },
  { x: 62, y: 28, size: 5, delay: 0.6 },
  { x: 96, y: 42, size: 4, delay: 3 },
];

const BARS = Array.from({ length: 18 }, (_, i) => ({
  height: 20 + (i % 3 === 0 ? 30 : i % 3 === 1 ? 50 : 40),
  delay: i * 0.08,
}));

// ── Password strength ─────────────────────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak',   color: '#ef4444' };
  if (score <= 2) return { score: 2, label: 'Fair',   color: '#f59e0b' };
  if (score <= 3) return { score: 3, label: 'Good',   color: '#86E560' };
  return              { score: 4, label: 'Strong', color: '#5EC43A' };
}

// ── Floating particle ────────────────────────────────────────────────
function Particle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-emerald-400/20"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

// ── Animated input field ─────────────────────────────────────────────
function Field({
  label, icon: Icon, error, focused, children,
}: {
  label: string; icon: React.ElementType; error?: string; focused: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
        {label}
      </label>
      <motion.div
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ duration: 0.2 }}
        className={`relative flex items-center rounded-xl border transition-all duration-300 ${
          error
            ? 'border-red-500/50 bg-red-500/5'
            : focused
            ? 'border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_0_3px_rgba(134,229,96,0.08)]'
            : 'border-white/[0.07] bg-zinc-800/50'
        }`}
      >
        <Icon className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${focused ? 'text-emerald-400' : 'text-zinc-600'}`} />
        {children}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-red-400 text-[11px] mt-1 pl-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Steps indicator ──────────────────────────────────────────────────
const STEPS = ['Details', 'Account', 'Ready'];

// ── Main ─────────────────────────────────────────────────────────────
export default function ArtistRegister() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (cred: CredentialResponse) => {
    if (!cred.credential) return;
    try {
      const res = await apiService.post<any>('/auth/google', {
        idToken: cred.credential,
        deviceType: 'web',
      });
      const { accessToken, refreshToken } = (res.data as any).data;
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      toast.success('Signed in with Google! Complete your artist application.');
      navigate('/artist/onboarding');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Google sign-up failed');
    }
  };

  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [step, setStep]                   = useState(0); // visual progress
  const [focusedField, setFocusedField]   = useState('');
  const [pwValue, setPwValue]             = useState('');

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX  = useMotionValue(0);
  const mouseY  = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left - rect.width  / 2) / rect.width);
    mouseY.set((e.clientY - rect.top  - rect.height / 2) / rect.height);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', agreeToTerms: false },
  });

  // Track password for strength meter
  const watchedPw = watch('password');

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setStep(2);
    try {
      await userService.register({ ...values, isArtist: true });
      toast.success('Account created! Check your email to verify.');
      navigate('/login');
    } catch (err: any) {
      setStep(1);
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getStrength(watchedPw ?? '');

  const focus   = (f: string) => setFocusedField(f);
  const unfocus = ()           => setFocusedField('');

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center relative overflow-hidden py-10 px-4">

      {/* ── Gradient orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(134,229,96,0.07) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(94,196,58,0.05) 0%, transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute top-0 right-1/3 w-px h-40 bg-gradient-to-b from-transparent via-emerald-400/25 to-transparent" />
      </div>

      {/* ── Particles ── */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* ── Two-column layout ── */}
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1fr_1.1fr] gap-10 items-start">

        {/* LEFT — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-col gap-10 pt-4"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Lugmatic</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5">
              Studio
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-5xl font-black text-white leading-[1.05] tracking-tight"
            >
              Join the<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #86E560 0%, #5EC43A 60%, #3A8A22 100%)' }}>
                Roster.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-zinc-400 text-base leading-relaxed max-w-sm"
            >
              Create your artist account and start sharing your sound with the Caribbean and beyond.
            </motion.p>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-3"
          >
            {[
              { icon: Mic2,  text: 'Go live and perform for your fans' },
              { icon: Star,  text: 'Earn from gifts and streaming' },
              { icon: Globe, text: 'Reach audiences across the Caribbean' },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-none">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-zinc-300 text-sm">{text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Registration steps */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            className="space-y-2"
          >
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold mb-3">How it works</p>
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                  step >= i
                    ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(134,229,96,0.4)]'
                    : 'bg-zinc-800 text-zinc-600 border border-zinc-700'
                }`}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span className={`text-sm transition-colors duration-300 ${step >= i ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {s === 'Details' ? 'Fill in your details' : s === 'Account' ? 'Set up your account' : 'Verify your email'}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Waveform */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="flex items-end gap-0.5 h-10"
          >
            {BARS.map((bar, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full flex-none"
                style={{ background: 'linear-gradient(to top, #3A8A22, #86E560)' }}
                animate={{ height: [bar.height * 0.4, bar.height, bar.height * 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: bar.delay }}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — Register card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl blur-2xl opacity-15"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, #86E560 0%, transparent 70%)' }} />

          <div className="relative bg-zinc-900/70 backdrop-blur-2xl rounded-2xl border border-white/[0.09] shadow-2xl overflow-hidden">
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #86E560, transparent)' }} />

            <div className="p-7 md:p-8">
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-6 lg:hidden">
                <Mic2 className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-bold tracking-tight">Lugmatic Studio</span>
              </div>

              {/* Back link */}
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Back to sign in
              </Link>

              {/* Heading */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
                <p className="text-zinc-500 text-sm mt-1">Artist & creator accounts only</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" icon={User}
                    error={errors.firstName?.message} focused={focusedField === 'firstName'}
                  >
                    <input
                      {...register('firstName')}
                      type="text" placeholder="John"
                      onFocus={() => { focus('firstName'); setStep(1); }}
                      onBlur={unfocus}
                      className="w-full pl-9 pr-3 py-2.5 bg-transparent text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                    />
                  </Field>
                  <Field label="Last name" icon={User}
                    error={errors.lastName?.message} focused={focusedField === 'lastName'}
                  >
                    <input
                      {...register('lastName')}
                      type="text" placeholder="Doe"
                      onFocus={() => { focus('lastName'); setStep(1); }}
                      onBlur={unfocus}
                      className="w-full pl-9 pr-3 py-2.5 bg-transparent text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                    />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email address" icon={Mail}
                  error={errors.email?.message} focused={focusedField === 'email'}
                >
                  <input
                    {...register('email')}
                    type="email" placeholder="artist@example.com"
                    onFocus={() => { focus('email'); setStep(1); }}
                    onBlur={unfocus}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                  />
                </Field>

                {/* Password + strength */}
                <div>
                  <Field label="Password" icon={Lock}
                    error={errors.password?.message} focused={focusedField === 'password'}
                  >
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                      onFocus={() => { focus('password'); setStep(1); }}
                      onBlur={unfocus}
                      className="w-full pl-10 pr-10 py-2.5 bg-transparent text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </Field>

                  {/* Strength meter */}
                  <AnimatePresence>
                    {watchedPw && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1.5"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <motion.div
                              key={i}
                              className="flex-1 h-1 rounded-full"
                              animate={{ backgroundColor: strength.score >= i ? strength.color : '#27272a' }}
                              transition={{ duration: 0.3 }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px]" style={{ color: strength.color }}>{strength.label}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm password */}
                <Field label="Confirm password" icon={Lock}
                  error={errors.confirmPassword?.message} focused={focusedField === 'confirm'}
                >
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                    onFocus={() => { focus('confirm'); setStep(1); }}
                    onBlur={unfocus}
                    className="w-full pl-10 pr-10 py-2.5 bg-transparent text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </Field>

                {/* Terms */}
                <div className="space-y-1">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5 flex-none">
                      <input
                        {...register('agreeToTerms')}
                        id="terms" type="checkbox"
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-white/10 bg-zinc-800 checked:bg-emerald-500 checked:border-emerald-500 transition-all focus:outline-none"
                      />
                      <CheckCircle2 className="absolute inset-0 h-4 w-4 pointer-events-none hidden peer-checked:block text-black" />
                    </div>
                    <span className="text-[11px] text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                      I agree to the{' '}
                      <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer">Terms of Service</span>
                      {' '}and{' '}
                      <span className="text-emerald-400 hover:text-emerald-300 cursor-pointer">Privacy Policy</span>.
                      My artist profile will be subject to review.
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-red-400 text-[11px] pl-7">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="relative w-full py-3 px-6 rounded-xl font-bold text-sm text-black overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #9BEE76 0%, #6ED44A 100%)' }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>Create account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </span>
                </motion.button>
              </form>

              {/* Google Sign-Up */}
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.07]" />
                  <span className="text-zinc-600 text-xs">or sign up with</span>
                  <div className="flex-1 h-px bg-white/[0.07]" />
                </div>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google sign-up failed')}
                    theme="filled_black"
                    shape="rectangular"
                    size="large"
                    text="signup_with"
                    width="320"
                  />
                </div>
              </div>

              {/* Sign in link */}
              <p className="text-center text-zinc-500 text-sm mt-6 pt-6 border-t border-white/[0.06]">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(134,229,96,0.2), transparent)' }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
