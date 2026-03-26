import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import logo from '../../assets/logo.png';
import { userService } from '../../services/userService';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    userService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified! You can now log in.');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch((err) => {
        setStatus('error');
        const msg = err.response?.data?.message || err.message || 'Verification failed.';
        setMessage(msg);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-lime-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/20 to-lime-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        className="relative bg-white p-8 rounded-3xl shadow-2xl w-96 border border-gray-200 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Lugmatic" className="h-16" />
        </div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 bg-clip-text text-transparent mb-6">
          Email Verification
        </h2>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader className="w-12 h-12 text-green-500 animate-spin" />
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="text-gray-700 font-medium">{message}</p>
            <p className="text-gray-500 text-sm">Redirecting to login...</p>
            <Link to="/login" className="mt-2 text-green-600 font-bold hover:underline text-sm">
              Go to Login now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <XCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-700 font-medium">{message}</p>
            <Link
              to="/resend-verification"
              className="mt-2 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity block"
            >
              Resend Verification Email
            </Link>
            <Link to="/login" className="text-green-600 hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
