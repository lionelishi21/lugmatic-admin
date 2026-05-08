import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

type LoginFormValues = yup.InferType<typeof validationSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, user, clearAuthError } = useAuth();

  const { register, handleSubmit, formState: { errors, touchedFields, isValid } } = useForm<LoginFormValues>({
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'user') {
        window.location.href = 'https://lugmaticmusic.com';
      } else if (user.role === 'admin' || user.role === 'super admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'contributor') {
        navigate('/contributor', { replace: true });
      } else {
        navigate('/artist', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 4000 });
      clearAuthError();
    }
  }, [error, clearAuthError]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">

      {/* Background — subtle brand gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-400/6 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/4 blur-[160px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(134,229,96,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(134,229,96,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/40 p-8">

          {/* Logo + Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <img src={logo} alt="Lugmatic" className="w-9 h-9 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Lugmatic Studio</h1>
            <p className="text-zinc-400 text-sm mt-1">Sign in to your artist dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-zinc-300 text-sm font-medium mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-zinc-800/60 border rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    touchedFields.email && errors.email
                      ? 'border-red-500/60 focus:ring-red-500/20'
                      : 'border-white/[0.08] focus:ring-emerald-500/30 focus:border-emerald-500/40'
                  }`}
                />
              </div>
              {touchedFields.email && errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-300 text-sm font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-zinc-800/60 border rounded-xl text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 transition-all ${
                    touchedFields.password && errors.password
                      ? 'border-red-500/60 focus:ring-red-500/20'
                      : 'border-white/[0.08] focus:ring-emerald-500/30 focus:border-emerald-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touchedFields.password && errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-2 text-center">
            <p className="text-zinc-500 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
              >
                Sign up
              </button>
            </p>
            <p className="text-zinc-600 text-xs">
              Didn't receive a verification email?{' '}
              <button
                onClick={() => navigate('/resend-verification')}
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Resend it
              </button>
            </p>
          </div>
        </div>

        {/* Below card note */}
        <p className="text-center text-zinc-600 text-xs mt-4">
          Artist & Admin accounts only ·{' '}
          <a href="https://lugmaticmusic.com" className="hover:text-zinc-400 transition-colors">
            Fan platform →
          </a>
        </p>
      </motion.div>
    </div>
  );
}
