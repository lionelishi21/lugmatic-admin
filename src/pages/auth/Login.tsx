import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password should be at least 8 characters')
    .required('Password is required'),
});

type LoginFormValues = yup.InferType<typeof validationSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, user, clearAuthError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
    watch,
  } = useForm<LoginFormValues>({
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // No redirect useEffect - login function handles navigation after successful login
  // This prevents infinite loops

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show error toast if login fails
  useEffect(() => {
    if (error) {
      // Display a more styled toast notification
      toast.error(
        <div className="font-medium">
          <span className="text-red-600 font-bold">Login Failed</span><br />
          <span className="text-gray-700">{error}</span>
        </div>,
        { 
          duration: 4000,
          style: {
            padding: '16px',
            borderRadius: '10px',
            background: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          icon: '❌',
        }
      );
      clearAuthError();
    }
  }, [error, clearAuthError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-lime-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Music Waves Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Music Notes */}
        <div className="absolute top-20 left-20 text-white/10 text-4xl animate-bounce">♪</div>
        <div className="absolute top-40 right-32 text-white/10 text-3xl animate-bounce delay-500">♫</div>
        <div className="absolute bottom-32 left-40 text-white/10 text-5xl animate-bounce delay-1000">♪</div>
        <div className="absolute bottom-20 right-20 text-white/10 text-3xl animate-bounce delay-700">♫</div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/20 to-lime-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-lime-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Sound Wave Visualization */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 opacity-20">
          {[...Array(50)].map((_, i) => {
            const duration = Math.random() * 2 + 1;
            return (
              <div
                key={i}
                className="bg-gradient-to-t from-green-400 to-lime-400 rounded-full"
                style={{
                  width: '4px',
                  height: `${Math.random() * 60 + 20}px`,
                  animationName: 'pulse',
                  animationDuration: `${duration}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 text-center">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-8 bg-green-400 rounded-full"
                  style={{
                    animationName: 'pulse',
                    animationDuration: '1s',
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'ease-in-out',
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
            <p className="text-white font-medium">Tuning in...</p>
          </div>
        </div>
      )}
      
      <motion.div 
        className="relative bg-white p-8 rounded-3xl shadow-2xl w-96 border border-gray-200"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px rgba(0, 0, 0, 0.1)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Music App Logo */}
       
        <div className="flex justify-center mb-2 relative">
         <img src={logo} alt="Lugmatic" className="h-20 mb-1" />
        </div>
        
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Lugmatic
        </h2>

        <p className="text-center text-gray-600 mb-8 text-sm">
          Your music, your way. Sign in to continue.
        </p>

      
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div 
            className="relative"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="text-green-500">📧</span>
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                {...register('email')}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  touchedFields.email && errors.email 
                    ? 'border-red-300' 
                    : 'border-gray-200'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200`}
                placeholder="Enter your email"
              />
              {emailValue && !errors.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div 
                    className="w-2 h-2 bg-green-400 rounded-full"
                    style={{
                      animationName: 'pulse',
                      animationDuration: '2s',
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'ease-in-out'
                    }}
                  ></div>
                </div>
              )}
            </div>
            {touchedFields.email && errors.email && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.email.message}
              </p>
            )}
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="text-lime-500">🔒</span>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  touchedFields.password && errors.password 
                    ? 'border-red-300' 
                    : 'border-gray-200'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200`}
                placeholder="Enter your password"
              />
              {passwordValue && !errors.password && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div 
                    className="w-2 h-2 bg-lime-400 rounded-full"
                    style={{
                      animationName: 'pulse',
                      animationDuration: '2s',
                      animationIterationCount: 'infinite',
                      animationTimingFunction: 'ease-in-out'
                    }}
                  ></div>
                </div>
              )}  
              {passwordValue && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={handlePasswordVisibility}>
                  {showPassword ? (
                    <span className="text-lime-500">🔒</span>
                  ) : (
                    <span className="text-lime-500">🔓</span>
                  )}
                </div>
              )}
            </div>
            {touchedFields.password && errors.password && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {errors.password.message}
              </p>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full relative bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        style={{
                          animationName: 'bounce',
                          animationDuration: '1s',
                          animationIterationCount: 'infinite',
                          animationTimingFunction: 'ease-in-out',
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                  </div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  {/* <span className="text-xl">🎵</span> */}
                  <span>Login</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </>
              )}
            </div>
          </motion.button>
        </form>

        {/* Demo Credentials */}
        {/* <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-600 mb-2 font-medium">Demo Credentials:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div> */}
      </motion.div>
    </div>
  );
}