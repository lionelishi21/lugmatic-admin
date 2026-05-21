import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Music2, Radio, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import apiService from '../../services/api';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';

const schema = yup.object({
  email:    yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'At least 8 characters').required('Password is required'),
});
type FormValues = yup.InferType<typeof schema>;

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

// Static particle positions to avoid re-renders
const PARTICLES = [
  { x: 10, y: 20, size: 4, delay: 0 },
  { x: 85, y: 15, size: 6, delay: 1.2 },
  { x: 20, y: 75, size: 3, delay: 0.8 },
  { x: 90, y: 60, size: 5, delay: 2 },
  { x: 50, y: 10, size: 4, delay: 1.5 },
  { x: 5,  y: 50, size: 3, delay: 0.4 },
  { x: 75, y: 80, size: 6, delay: 2.5 },
  { x: 35, y: 90, size: 3, delay: 1.8 },
  { x: 60, y: 30, size: 5, delay: 0.6 },
  { x: 95, y: 40, size: 4, delay: 3 },
];

// ── Animated waveform bars ───────────────────────────────────────────
const BARS = Array.from({ length: 18 }, (_, i) => ({
  height: 20 + (i % 3 === 0 ? 30 : i % 3 === 1 ? 50 : 40),
  delay: i * 0.08,
}));

// ── Input field ──────────────────────────────────────────────────────
function Field({
  label, icon: Icon, error, focused, children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">
        {label}
      </label>
      <motion.div
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ duration: 0.2 }}
        className={`relative flex items-center rounded-xl border transition-all duration-300 ${
          error
            ? 'border-red-500/60 bg-red-500/5'
            : focused
            ? 'border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_0_3px_rgba(134,229,96,0.08)]'
            : 'border-white/[0.08] bg-zinc-800/40'
        }`}
      >
        <Icon className={`absolute left-3.5 w-4 h-4 transition-colors duration-200 ${
          focused ? 'text-emerald-400' : 'text-zinc-500'
        }`} />
        {children}
      </motion.div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-red-400 text-xs mt-1.5 pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { login, isLoading, error, isAuthenticated, user, clearAuthError } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const handleGoogleSuccess = async (cred: CredentialResponse) => {
    if (!cred.credential) return;
    try {
      const res = await apiService.post<any>('/auth/google', {
        idToken: cred.credential,
        deviceType: 'web',
      });
      const { accessToken, refreshToken, user: u } = (res.data as any).data;
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      // Sync redux state
      dispatch({ type: 'auth/login/fulfilled', payload: u });
      toast.success(`Welcome, ${u?.firstName || 'Artist'}!`);
      navigate(u?.role === 'admin' ? '/admin' : '/artist');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Google sign-in failed');
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    mouseY.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try { await login(values.email, values.password); }
    catch (err: any) { toast.error(err.message || 'Login failed'); }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = (user.role || '').toLowerCase().trim();
      const isAdmin = role.includes('admin');
      
      if (isAdmin) navigate('/admin', { replace: true });
      else if (role === 'contributor') navigate('/contributor', { replace: true });
      else navigate('/artist', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); clearAuthError(); }
  }, [error, clearAuthError]);

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center relative overflow-hidden">

      {/* ── Gradient orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(134,229,96,0.07) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(94,196,58,0.05) 0%, transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-40 bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent" />
      </div>

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* ── Two-column layout ── */}
      <div className="relative w-full max-w-5xl mx-6 grid lg:grid-cols-2 gap-8 items-center">

        {/* LEFT — Branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex flex-col gap-10"
        >
          {/* Logo mark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Music2 className="w-5 h-5 text-emerald-400" />
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
              Your stage.<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #86E560 0%, #5EC43A 50%, #3A8A22 100%)' }}>
                Your sound.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-zinc-400 text-base leading-relaxed max-w-sm"
            >
              Manage your music, connect with fans in real-time, and grow your career — all from one dashboard.
            </motion.p>
          </div>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap gap-2"
          >
            {[
              { icon: Radio, label: 'Go Live' },
              { icon: Zap,   label: 'Clash Mode' },
              { icon: Music2, label: 'Upload Tracks' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/60 border border-white/[0.07] text-zinc-300 text-xs font-medium">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                {label}
              </div>
            ))}
          </motion.div>

          {/* Animated waveform */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex items-end gap-0.5 h-12"
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

        {/* RIGHT — Login card */}
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
          {/* Glow behind card */}
          <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, #86E560 0%, transparent 70%)' }} />

          <div className="relative bg-zinc-900/70 backdrop-blur-2xl rounded-2xl border border-white/[0.09] shadow-2xl overflow-hidden">

            {/* Top accent bar */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #86E560, transparent)' }} />

            <div className="p-8">
              {/* Mobile logo */}
              <div className="flex items-center gap-2 mb-8 lg:hidden">
                <Music2 className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-bold tracking-tight">Lugmatic Studio</span>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
                <p className="text-zinc-400 text-sm mt-1">Sign in to your artist dashboard</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Email */}
                <Field
                  label="Email"
                  icon={Mail}
                  error={touchedFields.email ? errors.email?.message : undefined}
                  focused={emailFocused}
                >
                  <input
                    type="email"
                    {...register('email')}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                  />
                </Field>

                {/* Password */}
                <Field
                  label="Password"
                  icon={Lock}
                  error={touchedFields.password ? errors.password?.message : undefined}
                  focused={passwordFocused}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-transparent text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </Field>

                {/* Forgot password */}
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="relative w-full py-3 px-6 rounded-xl font-bold text-sm text-black overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}
                >
                  {/* Shimmer */}
                  {!isLoading && (
                    <motion.div
                      className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #9BEE76 0%, #6ED44A 100%)' }}
                    />
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-zinc-600 text-xs">or</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              {/* Google Sign-In */}
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in failed')}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  width="320"
                />
              </div>

              {/* Footer */}
              <div className="space-y-2 text-center">
                <p className="text-zinc-500 text-sm">
                  New to Lugmatic?{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                  >
                    Create an account
                  </button>
                </p>
                <p className="text-zinc-600 text-xs">
                  Didn't get a verification email?{' '}
                  <button
                    onClick={() => navigate('/resend-verification')}
                    className="text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(134,229,96,0.2), transparent)' }} />
          </div>
        </motion.div>
      </div>

      {/* Fan platform link */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="absolute bottom-6 left-0 right-0 text-center text-zinc-600 text-xs"
      >
        Not an artist?{' '}
        <a href="https://lugmaticmusic.com" className="text-zinc-400 hover:text-emerald-400 transition-colors">
          Go to the fan platform →
        </a>
      </motion.p>
    </div>
  );
}
