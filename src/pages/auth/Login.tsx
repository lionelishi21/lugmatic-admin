import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';

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
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
      {/* Toaster container for notifications */}
      <Toaster position="top-right" />
      
      {/* Reusable Preloader component */}
      <Preloader 
        isVisible={isLoading} 
        text="Logging in..." 
        spinnerColor="#22c55e"
      />
      
      <motion.div 
        className="bg-white p-8 rounded-lg shadow-xl w-96"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-8">
          <motion.img 
            src="/assets/images/logo.png" 
            width="50" 
            alt="Lugmatic Logo"
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 260 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          />
        </div>
        
        <motion.h2 
          className="text-2xl font-bold text-center text-gray-800 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome to Lugmatic
        </motion.h2>

        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error.includes("password") ? "Incorrect password. Please try again." : error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={formik.handleSubmit}>
          <motion.div 
            className="mb-4"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border ${
                formik.touched.email && formik.errors.email 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <AnimatePresence>
              {formik.touched.email && formik.errors.email && (
                <motion.p 
                  className="text-red-500 text-xs mt-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {formik.errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="mb-6"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 border ${
                formik.touched.password && formik.errors.password 
                  ? 'border-red-500' 
                  : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            <AnimatePresence>
              {formik.touched.password && formik.errors.password && (
                <motion.p 
                  className="text-red-500 text-xs mt-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {formik.errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}