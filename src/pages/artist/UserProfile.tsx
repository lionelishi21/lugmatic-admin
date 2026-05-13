import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music,
  Save,
  Camera,
  MapPin,
  Info,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Settings2,
  LayoutGrid,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchArtistById, updateArtist } from '../../store/slices/artistSlice';
import { refreshUser } from '../../store/slices/authSlice';
import artistService, { Artist } from '../../services/artistService';
import songService from '../../services/songService';

export default function UserProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentArtist, loading: artistLoading } = useSelector((state: RootState) => state.artist);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'contact' | 'media' | 'verification'>('basic');

  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.artistId) {
      dispatch(fetchArtistById(String(user.artistId)));
    }
  }, [dispatch, user?.artistId]);

  useEffect(() => {
    if (currentArtist) {
      setFormData(currentArtist);
      if (currentArtist.image) setProfilePreview(currentArtist.image);
      if (currentArtist.coverImage) setCoverPreview(currentArtist.coverImage);
    }
  }, [currentArtist]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      setFormData(prev => {
        const newFormData = { ...prev };
        let current: any = newFormData;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current[parts[i]] = { ...current[parts[i]] };
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return newFormData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'profile') {
        setProfileImage(file);
        setProfilePreview(URL.createObjectURL(file));
      } else {
        setCoverImage(file);
        setCoverPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const toastId = toast.loading('Saving changes...');
    try {
      let updatedData = { ...formData };
      if (profileImage) {
        const res = await songService.getPresignedUrl('profile-image', profileImage.name, profileImage.type);
        await songService.uploadToS3(res.uploadUrl, profileImage, profileImage.type);
        updatedData.image = res.key;
      }
      if (coverImage) {
        const res = await songService.getPresignedUrl('cover-art', coverImage.name, coverImage.type);
        await songService.uploadToS3(res.uploadUrl, coverImage, coverImage.type);
        updatedData.coverImage = res.key;
      }
      if (!user?.artistId) {
        await artistService.createArtist({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          name: updatedData.name || `${user?.firstName} ${user?.lastName}`.trim(),
          bio: updatedData.bio,
          image: updatedData.image
        });
        await dispatch(refreshUser()).unwrap();
        toast.success('Artist profile created!', { id: toastId });
      } else {
        await dispatch(updateArtist({ id: String(user.artistId), data: updatedData })).unwrap();
        toast.success('Profile updated!', { id: toastId });
      }
      setProfileImage(null);
      setCoverImage(null);
    } catch (error: any) {
      toast.error(error?.message || 'Update failed', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (artistLoading && !currentArtist) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1";

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Profile Settings</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Manage your public artist profile, social links, and account preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="space-y-8">
           <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
              <div className="h-32 bg-zinc-950 relative cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                {coverPreview ? <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon size={32} /></div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-all flex items-center justify-center"><Camera size={20} className="text-white" /></div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
              </div>
              <div className="px-6 pb-8">
                 <div className="flex justify-center -mt-10 relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-zinc-900 p-1 shadow-2xl cursor-pointer relative group" onClick={() => profileInputRef.current?.click()}>
                       <div className="w-full h-full rounded-[1.25rem] overflow-hidden border border-white/10">
                         {profilePreview ? <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><User size={32} /></div>}
                       </div>
                       <div className="absolute inset-1 rounded-[1.25rem] bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"><Camera size={16} className="text-white" /></div>
                       <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                    </div>
                 </div>
                 <div className="mt-4 text-center">
                    <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                      {formData.name || 'Set Stage Name'}
                      {currentArtist?.isVerified && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </h2>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Artist Profile</p>
                 </div>
                 <div className="mt-8">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full h-14 flex items-center justify-center gap-3 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Save Profile
                    </button>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-2">
             {[
               { id: 'basic', label: 'General', icon: Info },
               { id: 'social', label: 'Social Media', icon: Globe },
               { id: 'contact', label: 'Contact Details', icon: Mail },
               { id: 'media', label: 'Preferences', icon: Settings2 },
               { id: 'verification', label: 'Verification', icon: ShieldCheck },
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
                   activeTab === tab.id ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white bg-zinc-950/50'
                 }`}
               >
                 <tab.icon size={18} />
                 {tab.label}
               </button>
             ))}
           </div>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="premium-card p-10 border-white/5 shadow-2xl"
            >
              {activeTab === 'basic' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold text-white">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={labelClass}>Stage Name</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className={inputClass} placeholder="Enter your stage name" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Artist Type</label>
                      <select name="artistType" value={formData.artistType as string || 'solo'} onChange={handleInputChange} className={inputClass + " appearance-none cursor-pointer"}>
                        <option value="solo">Solo Artist</option>
                        <option value="band">Band / Group</option>
                        <option value="producer">Producer</option>
                        <option value="podcaster">Podcaster</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Biography</label>
                    <textarea name="bio" value={formData.bio || ''} onChange={handleInputChange} rows={8} className={inputClass + " resize-none leading-relaxed"} placeholder="Share your story..." />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold text-white">Social Presence</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { name: 'socialLinks.instagram', label: 'Instagram', icon: Instagram, placeholder: 'instagram.com/...' },
                      { name: 'socialLinks.twitter', label: 'Twitter', icon: Twitter, placeholder: 'twitter.com/...' },
                      { name: 'socialLinks.facebook', label: 'Facebook', icon: Facebook, placeholder: 'facebook.com/...' },
                      { name: 'socialLinks.youtube', label: 'YouTube', icon: Youtube, placeholder: 'youtube.com/...' },
                      { name: 'socialLinks.website', label: 'Official Website', icon: Globe, placeholder: 'yourwebsite.com' },
                      { name: 'socialLinks.spotify', label: 'Spotify', icon: Music, placeholder: 'spotify.com/artist/...' },
                    ].map((social) => (
                      <div key={social.name} className="space-y-2">
                        <label className={labelClass}>{social.label}</label>
                        <div className="relative">
                          <social.icon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                          <input type="text" name={social.name} value={(formData.socialLinks as any)?.[social.name.split('.')[1]] || ''} onChange={handleInputChange} className={inputClass + " pl-14"} placeholder={social.placeholder} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold text-white">Contact & Location</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={labelClass}>Booking Email</label>
                      <input type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleInputChange} className={inputClass} placeholder="booking@artist.com" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" name="contactPhone" value={formData.contactPhone || ''} onChange={handleInputChange} className={inputClass} placeholder="+1..." />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>City</label>
                      <input type="text" name="location.city" value={(formData.location as any)?.city || ''} onChange={handleInputChange} className={inputClass} placeholder="Kingston" />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Country</label>
                      <input type="text" name="location.country" value={(formData.location as any)?.country || ''} onChange={handleInputChange} className={inputClass} placeholder="Jamaica" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-10">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold text-white">Platform Preferences</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'preferences.allowComments', label: 'Allow Comments', desc: 'Enable fan interactions on your tracks.', icon: MessageSquare },
                      { key: 'preferences.allowGifts', label: 'Enable Gifting', desc: 'Accept virtual gifts during your live streams.', icon: Sparkles },
                      { key: 'preferences.allowMessages', label: 'Direct Messages', desc: 'Let fans reach out to you directly.', icon: Mail },
                    ].map((pref) => (
                      <label key={pref.key} className="flex items-center justify-between p-6 bg-zinc-950/40 border border-white/5 rounded-[2rem] cursor-pointer hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-emerald-500 transition-colors"><pref.icon size={20} /></div>
                           <div>
                             <p className="text-sm font-bold text-white uppercase tracking-tight">{pref.label}</p>
                             <p className="text-xs text-zinc-500 font-medium mt-1">{pref.desc}</p>
                           </div>
                        </div>
                        <div className={`relative h-7 w-12 rounded-full transition-all duration-300 ${(formData.preferences as any)?.[pref.key.split('.')[1]] ?? true ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                           <div className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300 ${(formData.preferences as any)?.[pref.key.split('.')[1]] ?? true ? 'translate-x-5' : 'translate-x-0'}`} />
                           <input type="checkbox" className="sr-only" checked={(formData.preferences as any)?.[pref.key.split('.')[1]] ?? true} onChange={(e) => {
                             const [parent, child] = pref.key.split('.');
                             setFormData(prev => ({ ...prev, [parent]: { ...(prev[parent] as any), [child]: e.target.checked } }));
                           }} />
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <CreditCard size={18} className="text-zinc-600" />
                       <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Payout Settings</h4>
                    </div>
                    <div className="p-8 bg-zinc-950/40 rounded-[2.5rem] border border-white/5 space-y-8">
                       <div className="space-y-2">
                         <label className={labelClass}>Preferred Method</label>
                         <select name="payoutInfo.method" value={(formData.payoutInfo as any)?.method || 'paypal'} onChange={handleInputChange} className={inputClass + " appearance-none cursor-pointer"}>
                           <option value="paypal">PayPal</option>
                           <option value="bank_transfer">Bank Transfer</option>
                           <option value="jamaican_bank">Local Jamaican Bank</option>
                           <option value="jamdex">JAMDEX (CBDC)</option>
                           <option value="stripe">Stripe</option>
                         </select>
                       </div>
                       
                       {/* Method Specific Fields */}
                       {(formData.payoutInfo as any)?.method === 'paypal' && (
                         <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                           <label className={labelClass}>PayPal Email</label>
                           <input type="email" name="payoutInfo.paypalEmail" value={(formData.payoutInfo as any)?.paypalEmail || ''} onChange={handleInputChange} className={inputClass} placeholder="email@example.com" />
                         </div>
                       )}

                       <div className="flex items-start gap-4 p-5 bg-zinc-900/50 rounded-2xl border border-white/5">
                          <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Financial details are securely encrypted and never shared. Processing may take up to 3-5 business days.</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'verification' && (
                <div className="space-y-8">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-xl font-bold text-white">Identity Verification</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={labelClass}>ID Type</label>
                      <select name="verificationDocuments.idType" value={(formData.verificationDocuments as any)?.idType || 'nis'} onChange={handleInputChange} className={inputClass + " appearance-none cursor-pointer"}>
                        <option value="nis">NIS (National Insurance)</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="passport">Passport</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>ID Number</label>
                      <input type="text" name="verificationDocuments.idNumber" value={(formData.verificationDocuments as any)?.idNumber || ''} onChange={handleInputChange} className={inputClass} placeholder="Enter document number" />
                    </div>
                  </div>
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] flex items-start gap-5">
                    <Info size={24} className="text-emerald-500 shrink-0" />
                    <div>
                       <p className="text-sm font-bold text-white mb-1">Verification Required</p>
                       <p className="text-xs text-zinc-500 font-medium leading-relaxed">Verification is necessary for security and revenue withdrawals. Please ensure the information provided matches your official documentation.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
