import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, Music2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

type FormValues = yup.InferType<typeof schema>;

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
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-1.5 pl-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await userService.forgotPassword(values.email);
      setIsSuccess(true);
      toast.success('Password reset email sent');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center relative overflow-hidden">
      {/* Gradient orbs */}
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
      </div>

      <div className="relative w-full max-w-md mx-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-zinc-900/70 backdrop-blur-2xl rounded-2xl border border-white/[0.09] shadow-2xl overflow-hidden"
        >
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #86E560, transparent)' }} />

          <div className="p-8">
            <div className="flex items-center gap-2 mb-8">
              <Music2 className="w-6 h-6 text-emerald-400" />
              <span className="text-white font-bold text-xl tracking-tight">Lugmatic Studio</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {isSuccess ? (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm text-center">
                    Check your email for the reset link! If you don't see it, check your spam folder.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading ? 1 : 0.99 }}
                  className="relative w-full py-3 px-6 rounded-xl font-bold text-sm text-black overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #86E560 0%, #5EC43A 100%)' }}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </motion.button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-zinc-400 text-sm hover:text-emerald-400 transition-colors"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
