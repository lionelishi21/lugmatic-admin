import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useFormik } from 'formik';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, clearAuthError } = useAuth();

  // Form validation schema
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

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log('Login attempt:', values.email, values.password);
      try {
        await login(values.email, values.password);
        // Navigation is handled in the login function
      } catch (error) {
        // Error is handled by the useEffect below
        console.error('Login error:', error);
      }
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Music Waves Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Music Notes */}
        <div className="absolute top-20 left-20 text-white/10 text-4xl animate-bounce">♪</div>
        <div className="absolute top-40 right-32 text-white/10 text-3xl animate-bounce delay-500">♫</div>
        <div className="absolute bottom-32 left-40 text-white/10 text-5xl animate-bounce delay-1000">♪</div>
        <div className="absolute bottom-20 right-20 text-white/10 text-3xl animate-bounce delay-700">♫</div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Sound Wave Visualization */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-t from-purple-400 to-pink-400 rounded-full"
              style={{
                width: '4px',
                height: `${Math.random() * 60 + 20}px`,
                animation: `pulse ${Math.random() * 2 + 1}s infinite ease-in-out`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
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
                  className="w-1 h-8 bg-purple-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
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
        <div className="flex justify-center mb-8 relative">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-4 rounded-2xl transform group-hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Vinyl Record Design */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl"></div>
                <div className="relative w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Lugmatic
        </h2>

        <p className="text-center text-gray-600 mb-8 text-sm">
          Your music, your way. Sign in to continue.
        </p>

        {/* Music Genre Pills */}
        <div className="flex justify-center gap-2 mb-6">
          {['Pop', 'Rock', 'Jazz', 'Hip-Hop'].map((genre) => (
            <span
              key={genre}
              className="px-3 py-1 bg-purple-50 rounded-full text-xs text-purple-600 border border-purple-200"
            >
              {genre}
            </span>
          ))}
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <motion.div 
            className="relative"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="text-purple-500">📧</span>
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  formik.touched.email && formik.errors.email 
                    ? 'border-red-300' 
                    : 'border-gray-200'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200`}
                placeholder="Enter your email"
              />
              {formik.values.email && !formik.errors.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {formik.errors.email}
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
              <span className="text-pink-500">🔒</span>
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  formik.touched.password && formik.errors.password 
                    ? 'border-red-300' 
                    : 'border-gray-200'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-200`}
                placeholder="Enter your password"
              />
              {formik.values.password && !formik.errors.password && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {formik.errors.password}
              </p>
            )}
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="w-full relative bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🎵</span>
                  <span>Start Listening</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </>
              )}
            </div>
          </motion.button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-600 mb-2 font-medium">Demo Credentials:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Email:</strong> demo@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>

        {/* Music Controls Preview */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
              <span className="text-gray-500">⏮</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
              <span className="text-white">▶</span>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
              <span className="text-gray-500">⏭</span>
            </div>
          </div>
          <p className="text-center text-gray-500 text-xs">
            Millions of songs. Zero ads. Sign in to unlock.
          </p>
        </div>
      </motion.div>
    </div>
  );
}