import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, Music2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';

const schema = yup.object({
  password: yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
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
      <label className="block text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center text-zinc-900 dark:text-white">
        <div className="text-center space-y-4">
          <p className="text-xl">Invalid or missing reset token.</p>
          <button onClick={() => navigate('/forgot-password')} className="text-emerald-400 hover:underline">
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await userService.resetPassword(token, values.password);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reset password');
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
              <span className="text-zinc-900 dark:text-white font-bold text-xl tracking-tight">Lugmatic Studio</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Create New Password</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                Please enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Field
                label="New Password"
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
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>

              <Field
                label="Confirm Password"
                icon={Lock}
                error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
                focused={confirmPasswordFocused}
              >
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-600 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-3.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                      Reset Password
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
