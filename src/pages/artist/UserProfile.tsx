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
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchArtistById, updateArtist } from '../../store/slices/artistSlice';
import { refreshUser } from '../../store/slices/authSlice';
import artistService, { Artist } from '../../services/artistService';
import songService from '../../services/songService';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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
    const toastId = toast.loading('Syncing profile updates...');

    try {
      let updatedData = { ...formData };

      // Handle Image Uploads if changed
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
        // Handle case where profile needs to be created first
        const newArtist = await artistService.createArtist({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          name: updatedData.name || `${user?.firstName} ${user?.lastName}`.trim(),
          bio: updatedData.bio,
          image: updatedData.image
        });

        await dispatch(refreshUser()).unwrap();
        toast.success('Artist profile initialized!', { id: toastId });
      } else {
        await dispatch(updateArtist({ id: String(user.artistId), data: updatedData })).unwrap();
        toast.success('Profile synced successfully!', { id: toastId });
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
        <div className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block px-1";

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      
      {/* ── Header ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <User className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Identity Management</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Artist Core
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Manage your public artist information and platform presence.
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ── Sidebar Nav ── */}
        <div className="space-y-6">
           {/* Profile Preview Card */}
           <div className={`${card} overflow-hidden group`}>
              <div 
                className="h-32 bg-zinc-100 dark:bg-zinc-800 relative cursor-pointer"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-zinc-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                   <Camera className="h-5 w-5 text-white" />
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
              </div>
              <div className="px-4 pb-5">
                 <div className="flex justify-center -mt-8 relative z-10">
                    <div 
                      className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 p-1 shadow-2xl cursor-pointer relative group/avatar"
                      onClick={() => profileInputRef.current?.click()}
                    >
                       <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5">
                         {profilePreview ? (
                           <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <User className="h-8 w-8 text-zinc-400" />
                           </div>
                         )}
                       </div>
                       <div className="absolute inset-1 rounded-xl bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center">
                          <Camera className="h-4 w-4 text-white" />
                       </div>
                       <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
                    </div>
                 </div>
                 <div className="mt-3 text-center">
                    <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center justify-center gap-1.5">
                      {formData.name || 'Anonymous Artist'}
                      {currentArtist?.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">@{user?.email?.split('@')[0]}</p>
                 </div>
                 <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-white/5">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full h-11 flex items-center justify-center gap-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Sync Changes
                    </button>
                 </div>
              </div>
           </div>

           {/* Tab Nav */}
           <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                 <LayoutGrid className="h-3.5 w-3.5 text-zinc-500" />
                 <p className="text-[10px] uppercase tracking-widest font-black text-zinc-500">Configuration</p>
              </div>
              <div className={`${card} p-1.5 flex flex-col gap-1 bg-zinc-50/50 dark:bg-zinc-800/20`}>
                {[
                  { id: 'basic', label: 'Basic Info', icon: Info },
                  { id: 'social', label: 'Social Links', icon: Globe },
                  { id: 'contact', label: 'Inbound / Loc', icon: Mail },
                  { id: 'media', label: 'Preferences', icon: Music },
                  { id: 'verification', label: 'Verification', icon: ShieldCheck },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? 'bg-zinc-900 dark:bg-zinc-700 text-white shadow-lg'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* ── Form Content ── */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={card}
            >
              {activeTab === 'basic' && (
                <>
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">Primary Signature</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={labelClass}>Transmission Name (Stage Name)</label>
                        <div className="relative">
                          <Music className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            className={inputClass + " pl-11"}
                            placeholder="Your stage name"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>Creative Sector</label>
                        <select
                          name="artistType"
                          value={formData.artistType as string || 'solo'}
                          onChange={handleInputChange}
                          className={inputClass + " appearance-none cursor-pointer"}
                        >
                          <option value="solo">Solo Operator</option>
                          <option value="band">Band / Collective</option>
                          <option value="producer">Producer / Engineer</option>
                          <option value="composer">Composer</option>
                          <option value="podcaster">Broadcaster / Podcaster</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Operational Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                        rows={8}
                        className={inputClass + " resize-none leading-relaxed"}
                        placeholder="Tell the world about your musical journey..."
                      />
                      <p className="text-right text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">Cap: 2000 chars</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'social' && (
                <>
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">Signal Relays</span>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { name: 'socialLinks.instagram', label: 'Instagram', icon: Instagram, placeholder: 'instagram.com/user' },
                        { name: 'socialLinks.twitter', label: 'Twitter', icon: Twitter, placeholder: 'twitter.com/user' },
                        { name: 'socialLinks.facebook', label: 'Facebook', icon: Facebook, placeholder: 'facebook.com/user' },
                        { name: 'socialLinks.youtube', label: 'YouTube', icon: Youtube, placeholder: 'youtube.com/c/channel' },
                        { name: 'socialLinks.website', label: 'Portal (Website)', icon: Globe, placeholder: 'yourwebsite.com' },
                        { name: 'socialLinks.spotify', label: 'Spotify Frequency', icon: Music, placeholder: 'spotify.com/artist/...' },
                      ].map((social) => (
                        <div key={social.name} className="space-y-2">
                          <label className={labelClass}>{social.label}</label>
                          <div className="relative group">
                            <social.icon className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                              type="text"
                              name={social.name}
                              value={(formData.socialLinks as any)?.[social.name.split('.')[1]] || ''}
                              onChange={handleInputChange}
                              className={inputClass + " pl-11"}
                              placeholder={social.placeholder}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'contact' && (
                <>
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">Inbound / Coordinates</span>
                  </div>
                  <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={labelClass}>Operational Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail || ''}
                            onChange={handleInputChange}
                            className={inputClass + " pl-11"}
                            placeholder="booking@yourname.com"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>Direct Frequency (Phone)</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone || ''}
                            onChange={handleInputChange}
                            className={inputClass + " pl-11"}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={labelClass}>Operations Hub (City)</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="text"
                            name="location.city"
                            value={(formData.location as any)?.city || ''}
                            onChange={handleInputChange}
                            className={inputClass + " pl-11"}
                            placeholder="e.g. New York"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>Sector (Country)</label>
                        <div className="relative group">
                          <Globe className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            type="text"
                            name="location.country"
                            value={(formData.location as any)?.country || ''}
                            onChange={handleInputChange}
                            className={inputClass + " pl-11"}
                            placeholder="e.g. USA"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'media' && (
                <>
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">System Logic</span>
                  </div>
                  <div className="p-6 space-y-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Interaction Permissions</p>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { key: 'preferences.allowComments', label: 'Public Commentary', desc: 'Let fans comment on your tracks', icon: MessageSquare },
                          { key: 'preferences.allowGifts', label: 'Signal Gratuity', desc: 'Enable digital gifting during live streams', icon: Sparkles },
                          { key: 'preferences.allowMessages', label: 'Direct Transmissions', desc: 'Allow fans to message you directly', icon: Mail },
                        ].map((pref) => (
                          <label key={pref.key} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-white/[0.01] border border-zinc-100 dark:border-white/[0.04] rounded-2xl cursor-pointer hover:border-zinc-300 dark:hover:border-white/10 transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                  <pref.icon className="h-5 w-5" />
                               </div>
                               <div>
                                 <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">{pref.label}</p>
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{pref.desc}</p>
                               </div>
                            </div>
                            <div className={`relative h-6 w-11 rounded-full transition-all duration-300 ${(formData.preferences as any)?.[pref.key.split('.')[1]] ?? true ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
                               <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-300 ${(formData.preferences as any)?.[pref.key.split('.')[1]] ?? true ? 'translate-x-5' : 'translate-x-0'}`} />
                               <input
                                 type="checkbox"
                                 className="hidden"
                                 checked={(formData.preferences as any)?.[pref.key.split('.')[1]] ?? true}
                                 onChange={(e) => {
                                   const [parent, child] = pref.key.split('.');
                                   setFormData(prev => ({
                                     ...prev,
                                     [parent]: {
                                       ...(prev[parent] as any),
                                       [child]: e.target.checked
                                     }
                                   }));
                                 }}
                               />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Revenue Logistics</p>
                      <div className="p-6 bg-zinc-50 dark:bg-white/[0.01] rounded-2xl border border-zinc-100 dark:border-white/[0.04] space-y-6">
                        <div className="space-y-2">
                          <label className={labelClass}>Default Payout Protocol</label>
                          <div className="relative">
                             <CreditCard className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                             <select
                               name="payoutInfo.method"
                               value={(formData.payoutInfo as any)?.method || 'paypal'}
                               onChange={handleInputChange}
                               className={inputClass + " pl-11 appearance-none cursor-pointer"}
                             >
                               <option value="paypal">PayPal Gateway</option>
                               <option value="bank_transfer">International SWIFT</option>
                               <option value="jamaican_bank">Jamaican Local Hub (J$)</option>
                               <option value="jamdex">JAMDEX (CBDC)</option>
                               <option value="stripe">Stripe Connect</option>
                             </select>
                          </div>
                        </div>

                        {/* Sub-fields for payout methods - logic preserved */}
                        {(formData.payoutInfo as any)?.method === 'paypal' && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className={labelClass}>PayPal Identifier (Email)</label>
                            <input
                              type="email"
                              name="payoutInfo.paypalEmail"
                              value={(formData.payoutInfo as any)?.paypalEmail || ''}
                              onChange={handleInputChange}
                              className={inputClass}
                              placeholder="your-paypal@email.com"
                            />
                          </div>
                        )}

                        {(formData.payoutInfo as any)?.method === 'jamaican_bank' && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                               <label className={labelClass}>Institution</label>
                               <select
                                 name="payoutInfo.jamaicanBank.bankName"
                                 value={(formData.payoutInfo as any)?.jamaicanBank?.bankName || ''}
                                 onChange={handleInputChange}
                                 className={inputClass + " appearance-none cursor-pointer"}
                               >
                                 <option value="">Select Local Bank</option>
                                 <option value="NCB">NCB (National Continental Bank)</option>
                                 <option value="Scotia">Scotiabank</option>
                                 <option value="Sagicor">Sagicor Bank</option>
                                 <option value="JMMB">JMMB Bank</option>
                                 <option value="FGB">First Global Bank</option>
                               </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className={labelClass}>Account Number</label>
                                  <input
                                    type="text"
                                    name="payoutInfo.jamaicanBank.accountNumber"
                                    value={(formData.payoutInfo as any)?.jamaicanBank?.accountNumber || ''}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                    placeholder="8-12 digits"
                                  />
                               </div>
                               <div className="space-y-2">
                                  <label className={labelClass}>Account Logic</label>
                                  <select
                                    name="payoutInfo.jamaicanBank.accountType"
                                    value={(formData.payoutInfo as any)?.jamaicanBank?.accountType || 'savings'}
                                    onChange={handleInputChange}
                                    className={inputClass + " appearance-none cursor-pointer"}
                                  >
                                    <option value="savings">Savings</option>
                                    <option value="checking">Chequing</option>
                                  </select>
                               </div>
                            </div>
                          </div>
                        )}

                        {(formData.payoutInfo as any)?.method === 'jamdex' && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                               <label className={labelClass}>JAMDEX Wallet Hub (Lynk/Email)</label>
                               <input
                                 type="text"
                                 name="payoutInfo.jamdex.walletAddress"
                                 value={(formData.payoutInfo as any)?.jamdex?.walletAddress || ''}
                                 onChange={handleInputChange}
                                 className={inputClass}
                                 placeholder="Wallet Identifier"
                               />
                            </div>
                            <div className="space-y-2">
                               <label className={labelClass}>Verification TRN (9-digits)</label>
                               <input
                                 type="text"
                                 name="payoutInfo.jamdex.trn"
                                 value={(formData.payoutInfo as any)?.jamdex?.trn || ''}
                                 onChange={handleInputChange}
                                 className={inputClass}
                                 placeholder="000-000-000"
                                 maxLength={9}
                               />
                            </div>
                          </div>
                        )}

                        <div className="p-4 bg-zinc-900 dark:bg-black/40 rounded-xl border border-zinc-800 flex gap-4">
                           <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                             Payout logistics are encrypted. Minimum threshold: $50.00 USD. JAMDEX operations require a verified Jamaican Tax Registration Number.
                           </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'verification' && (
                <>
                  <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white italic">Authority Verification</span>
                  </div>
                  <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={labelClass}>Identification Logic</label>
                        <select
                          name="verificationDocuments.idType"
                          value={(formData.verificationDocuments as any)?.idType || 'nis'}
                          onChange={handleInputChange}
                          className={inputClass + " appearance-none cursor-pointer"}
                        >
                          <option value="nis">NIS (National Insurance)</option>
                          <option value="drivers_license">Driver's License (JA)</option>
                          <option value="passport">Global Passport</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>Credential Identifier (ID #)</label>
                        <input
                          type="text"
                          name="verificationDocuments.idNumber"
                          value={(formData.verificationDocuments as any)?.idNumber || ''}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="ID Number"
                        />
                      </div>
                    </div>
                    <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                      <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                         <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest italic">Verification Protocol</p>
                         <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                           Required for high-volume revenue extraction. Ensure documentation names align with your core signature.
                         </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
