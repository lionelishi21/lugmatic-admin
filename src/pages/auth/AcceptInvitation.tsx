import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const validationSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
});

type RegisterFormValues = yup.InferType<typeof validationSchema>;

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided.');
      setVerifying(false);
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const res = await userService.verifyInvitation(token!);
      setInviteData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired invitation token.');
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setSubmitting(true);
      await userService.registerContributor({
        firstName: values.firstName,
        lastName: values.lastName,
        email: inviteData.email,
        password: values.password,
        invitationToken: token
      });
      
      toast.success('Account created successfully! Please log in.');
      navigate('/contributor/login', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Verifying Invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 p-8 rounded-[32px] max-w-sm text-center"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Invite Error</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[140px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Complete Setup</h1>
            <p className="text-gray-400 text-sm font-medium">
              You've been invited as a <span className="text-white font-bold">Contributor</span> for <span className="text-white font-bold">{inviteData.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">First Name</label>
                <div className="relative">
                  <input
                    {...register('firstName')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all text-sm font-bold"
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="text-red-400 text-[10px] font-bold ml-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Last Name</label>
                <div className="relative">
                  <input
                    {...register('lastName')}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all text-sm font-bold"
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && <p className="text-red-400 text-[10px] font-bold ml-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all text-sm font-bold"
                  placeholder="••••••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              </div>
              {errors.password && <p className="text-red-400 text-[10px] font-bold ml-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-12 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all text-sm font-bold"
                  placeholder="••••••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-[10px] font-bold ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex gap-4">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                By completing this setup, you agree to the <span className="text-white">Lugmatic Contributor Terms</span> and authorize the platform to manage revenue distribution on your behalf.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all transform active:scale-[0.98] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Register Contributor Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
