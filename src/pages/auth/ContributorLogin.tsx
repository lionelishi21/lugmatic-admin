import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
import { ShieldCheck, Music, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type LoginFormValues = yup.InferType<typeof validationSchema>;

export default function ContributorLogin() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const targetPath = user.role === 'contributor' ? '/contributor' : (user.role === 'admin' ? '/admin' : '/artist');
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const userData = await login(values.email, values.password);
      if (userData && userData.role !== 'contributor') {
         toast.success(`Welcome back, ${userData.firstName}! Redirecting to your dashboard.`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Contributor Portal</h1>
            <p className="text-gray-400 text-sm font-medium">Manage your rights, credits, and earnings.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              {errors.email && <p className="text-red-400 text-xs ml-1 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              {errors.password && <p className="text-red-400 text-xs ml-1 font-medium">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 bg-white/5 border-white/10 rounded focus:ring-green-500 text-green-500 transition-all" />
                <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-xs font-bold text-green-500 hover:text-green-400 transition-colors">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all transform active:scale-[0.98] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Are you an artist? <Link to="/login" className="text-white hover:text-green-500 transition-colors ml-1">Go to Artist Login</Link>
            </p>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Secure Access</span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">Contributor Rights</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
