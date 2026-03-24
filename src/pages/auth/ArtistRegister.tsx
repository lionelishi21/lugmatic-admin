import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ArrowLeft, User, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
import { userService } from '../../services/userService';
import Preloader from '../../components/ui/Preloader';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the Terms of Service'),
});

type RegisterFormValues = yup.InferType<typeof validationSchema>;

export default function ArtistRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await userService.register({
        ...values,
        isArtist: true,
      });
      
      toast.success(
        <div className="font-medium">
          <span className="text-green-600 font-bold">Success!</span><br />
          <span className="text-gray-700">Account created. Check your email for verification.</span>
        </div>
      );
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.1),transparent_50%)]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.05),transparent_50%)]" />

      <Preloader isVisible={isLoading} text="Preparing your stage..." />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-12">
            <Link to="/" className="inline-block mb-6 group">
              <img
                src={logo}
                alt="Lugmatic"
                className="h-16 w-auto mx-auto group-hover:scale-110 transition-transform duration-500"
              />
            </Link>
            <h1 className="text-4xl font-bold mb-3 tracking-tighter italic" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              JOIN THE <span className="text-green-500">ROSTER</span>
            </h1>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto">
              Create your artist account and start sharing your sound with the Caribbean.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder="John"
                    className="w-full bg-white/5 border border-white/10 pl-12 pr-4 h-14 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Doe"
                    className="w-full bg-white/5 border border-white/10 pl-12 pr-4 h-14 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="artist@lugmatic.com"
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 h-14 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-12 h-14 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 outline-none transition-all placeholder:text-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  {...register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 pl-12 pr-4 h-14 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500/40 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3 py-2">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  {...register('agreeToTerms')}
                  id="terms"
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/10 bg-white/5 checked:bg-green-500 checked:border-green-500 transition-all focus:ring-2 focus:ring-green-500/20"
                />
                <CheckCircle2 className="absolute h-3.5 w-3.5 pointer-events-none hidden peer-checked:block text-black" />
              </div>
              <label htmlFor="terms" className="text-[11px] text-zinc-500 cursor-pointer select-none leading-relaxed">
                I agree to the <span className="text-green-500 hover:underline">Terms of Service</span> and <span className="text-green-500 hover:underline">Privacy Policy</span>. I understand that my artist profile will be subject to review.
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-red-500 text-[10px] -mt-2 ml-8">{errors.agreeToTerms.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-green-500 hover:bg-green-400 text-black font-bold rounded-2xl text-lg shadow-[0_20px_40px_-15px_rgba(34,197,94,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 mt-4"
            >
              Initialize Artist Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-sm">
              Already part of the roster?{' '}
              <Link to="/login" className="text-green-500 font-bold hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
