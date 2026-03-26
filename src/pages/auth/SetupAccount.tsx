import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
import { apiService } from '../../services/api';

const schema = yup.object({
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

type FormValues = yup.InferType<typeof schema>;

export default function SetupAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toast.error('Invalid setup link. Please request a new one.');
      return;
    }
    setIsLoading(true);
    try {
      await apiService.post('/auth/setup-password', { token, password: values.password });
      toast.success('Account set up successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Setup failed. The link may have expired.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-lime-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-96 text-center">
          <img src={logo} alt="Lugmatic" className="h-16 mx-auto mb-4" />
          <p className="text-red-500 font-medium">Invalid or missing setup link.</p>
          <button onClick={() => navigate('/login')} className="mt-4 text-green-600 hover:underline text-sm">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-lime-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 bg-clip-text text-transparent mb-1">
          Set Up Your Account
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Create a password to activate your Lugmatic account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-500" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full px-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 text-gray-900 placeholder-gray-500 pr-10`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">⚠ {errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-lime-500" />
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`w-full px-4 py-3 bg-gray-50 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 text-gray-900 placeholder-gray-500`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">⚠ {errors.confirmPassword.message}</p>}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Setting up...' : 'Activate Account'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
