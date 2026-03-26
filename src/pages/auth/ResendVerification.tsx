import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import logo from '../../assets/logo.png';
import { userService } from '../../services/userService';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

type FormValues = yup.InferType<typeof schema>;

export default function ResendVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      await userService.resendVerificationEmail(values.email);
      setSent(true);
    } catch {
      // Always show success to avoid revealing account existence
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-lime-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-white/10 text-4xl animate-bounce">♪</div>
        <div className="absolute top-40 right-32 text-white/10 text-3xl animate-bounce delay-500">♫</div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/20 to-lime-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative bg-white p-8 rounded-3xl shadow-2xl w-96 border border-gray-200"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-2">
          <img src={logo} alt="Lugmatic" className="h-16 mb-1" />
        </div>

        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Resend Verification
        </h2>

        {!sent ? (
          <>
            <p className="text-center text-gray-500 text-sm mb-6">
              Enter your email and we'll send you a new verification link.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="text-green-500">📧</span>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 text-gray-900 placeholder-gray-500 transition-all`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">⚠ {errors.email.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Sending...' : 'Send Verification Email'}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-gray-700 font-medium">
              If an unverified account exists for that email, a new verification link has been sent.
            </p>
            <p className="text-gray-500 text-sm">
              Please check your inbox (and spam folder).
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
