import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Mail, FileText, Camera, 
  Globe, Facebook, Twitter, Instagram, Plus, 
  X, CheckCircle2, ChevronRight, UserPlus, 
  ShieldCheck, MapPin, Music
} from 'lucide-react';
import Preloader from '../../components/ui/Preloader';
import useCreateArtist from '../../hooks/artist/useCreateArtist';
import toast from 'react-hot-toast';

interface ArtistFormData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  bio: string;
  gender: string;
  genres: string[];
  socialLinks: {
    website: string;
    facebook: string;
    twitter: string;
    instagram: string;
  };
  image?: File | null;
}

const ArtistCreate: React.FC = () => {
  const navigate = useNavigate();
  const { isSubmitting, createArtist } = useCreateArtist();

  const [formData, setFormData] = useState<ArtistFormData>({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    bio: '',
    gender: '',
    genres: [],
    socialLinks: {
      website: '',
      facebook: '',
      twitter: '',
      instagram: ''
    },
    image: null
  });
  
  const [genreInput, setGenreInput] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const jamaicaGenres = [
    "Reggae", "Dancehall", "Ska", "Rocksteady", "Dub", "Mento", 
    "Ragga", "Reggaeton", "Gospel Reggae", "Lover's Rock", 
    "Dub Poetry", "Jamaican Jazz", "Reggae Fusion"
  ];
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialLinkField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [socialLinkField]: value }
      }));
    } else {
      setFormData(prev => {
        if (name === 'firstName' || name === 'lastName') {
          const firstName = name === 'firstName' ? value : prev.firstName;
          const lastName = name === 'lastName' ? value : prev.lastName;
          return { 
            ...prev, 
            [name]: value,
            name: `${firstName} ${lastName}`.trim() 
          };
        }
        return { ...prev, [name]: value };
      });
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()]
      }));
      setGenreInput('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.firstName) errors.firstName = 'First name required';
    if (!formData.lastName) errors.lastName = 'Last name required';
    if (!formData.email) errors.email = 'Email required';
    if (!formData.gender) errors.gender = 'Gender required';
    if (formData.genres.length === 0) errors.genres = 'Select at least one genre';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const loadingId = toast.loading('Synchronizing artist profile...');
      try {
        await createArtist(formData);
        toast.success('Artist registered', { id: loadingId });
        navigate('/admin/artist-management');
      } catch (err) {
        toast.error('Registration failed', { id: loadingId });
      }
    }
  };

  if (isSubmitting) return <Preloader isVisible={true} text="Registering artist profile..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/admin/artist-management')}
            className="flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Directory</span>
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <UserPlus className="text-emerald-500" size={32} />
            Register New Artist
          </h1>
          <p className="text-zinc-500">Configure public identity and network presence for a new talent.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Identity Hub */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card space-y-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Camera size={14} /> Profile Index
            </h3>
            
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center transition-all group-hover:border-emerald-500/20">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <User size={40} className="text-zinc-700" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <input
                  type="file" accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-4">Avatar Payload</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Public Details</h4>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Stage Name</label>
                <input
                  type="text" name="name" required
                  className="input-field"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Chronixx"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Biography</label>
                <textarea
                  name="bio" rows={4}
                  className="input-field h-auto resize-none"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Artist's history and mission..."
                />
              </div>
            </div>
          </div>

          <div className="premium-card border-emerald-500/10">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <ShieldCheck size={18} />
              <h4 className="text-xs font-bold uppercase tracking-widest">Integrity Check</h4>
            </div>
            <ul className="space-y-3">
              {[
                { label: 'Identity Verified', ok: !!formData.firstName && !!formData.lastName },
                { label: 'Signal Endpoint', ok: !!formData.email },
                { label: 'Genre Mapping', ok: formData.genres.length > 0 },
              ].map((check, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">{check.label}</span>
                  <div className={`w-2 h-2 rounded-full ${check.ok ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Personal & Genre Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card space-y-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-4">
              <User size={14} /> Profile Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">First Name</label>
                <input
                  type="text" name="firstName" required
                  className="input-field"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  type="text" name="lastName" required
                  className="input-field"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Endpoint</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input
                    type="email" name="email" required
                    className="input-field pl-12"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Gender Identification</label>
                <div className="relative">
                  <select
                    name="gender" required
                    className="input-field appearance-none"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Protocol...</option>
                    <option value="male">MALE</option>
                    <option value="female">FEMALE</option>
                    <option value="non-binary">NON-BINARY</option>
                    <option value="prefer-not-to-say">UNDISCLOSED</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 rotate-90 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Music size={14} /> Genre Mapping
              </h3>
              
              <div className="flex gap-4">
                <input
                  type="text" value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                  className="input-field flex-1"
                  placeholder="Add custom genre..."
                />
                <button type="button" onClick={addGenre} className="btn-secondary !px-6">Add</button>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Platform Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {jamaicaGenres.map((genre) => (
                    <button
                      key={genre} type="button"
                      onClick={() => !formData.genres.includes(genre) && setFormData(prev => ({ ...prev, genres: [...prev.genres, genre] }))}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        formData.genres.includes(genre)
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-white/5 text-zinc-500 border-white/5 hover:border-emerald-500/20'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {formData.genres.map((genre) => (
                  <span key={genre} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    {genre}
                    <button type="button" onClick={() => removeGenre(genre)} className="hover:text-rose-500 transition-colors"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Social Signals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'socialLinks.website', icon: Globe, label: 'Website' },
                  { name: 'socialLinks.facebook', icon: Facebook, label: 'Facebook' },
                  { name: 'socialLinks.twitter', icon: Twitter, label: 'Twitter' },
                  { name: 'socialLinks.instagram', icon: Instagram, label: 'Instagram' },
                ].map(link => (
                  <div key={link.name} className="relative">
                    <link.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input
                      type="url" name={link.name}
                      placeholder={link.label}
                      className="input-field pl-12"
                      value={(formData.socialLinks as any)[link.name.split('.')[1]]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
              <button type="button" onClick={() => navigate('/admin/artist-management')} className="btn-secondary !px-10">Abort</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary !px-12 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Register Profile
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArtistCreate;