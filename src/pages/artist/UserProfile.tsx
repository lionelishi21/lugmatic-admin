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
  Image as ImageIcon
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
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'contact' | 'media'>('basic');
  
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
    const toastId = toast.loading('Updating profile...');
    
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
        // Handle case where profile needs to be created first (should be rare with new auto-create fix)
        const newArtist = await artistService.createArtist({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          name: updatedData.name || `${user?.firstName} ${user?.lastName}`.trim(),
          bio: updatedData.bio,
          image: updatedData.image
        });
        
        // We'll need to refresh the user session to get the new artistId
        await dispatch(refreshUser()).unwrap();
        toast.success('Artist profile initialized and saved!', { id: toastId });
      } else {
        await dispatch(updateArtist({ id: String(user.artistId), data: updatedData })).unwrap();
        toast.success('Profile updated successfully!', { id: toastId });
      }
      
      // Reset file states
      setProfileImage(null);
      setCoverImage(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update profile', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (artistLoading && !currentArtist) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="relative mb-8">
        {/* Cover Image */}
        <div 
          className="h-48 rounded-2xl bg-gray-100 overflow-hidden relative group cursor-pointer"
          onClick={() => coverInputRef.current?.click()}
        >
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/90 p-2 rounded-full shadow-lg">
              <Camera className="h-5 w-5 text-gray-700" />
            </div>
          </div>
          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
        </div>

        {/* Profile Info Summary */}
        <div className="absolute -bottom-12 left-8 flex items-end gap-6">
          <div 
            className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl relative group cursor-pointer"
            onClick={() => profileInputRef.current?.click()}
          >
            <div className="w-full h-full rounded-[1.2rem] overflow-hidden bg-gray-50 border border-gray-100">
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </div>
            <div className="absolute inset-1.5 rounded-[1.2rem] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profile')} />
          </div>
          
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {formData.name || 'Set Artist Name'}
              {currentArtist?.isVerified && <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-50" />}
            </h1>
            <p className="text-gray-500 font-medium">@{user?.email?.split('@')[0]}</p>
          </div>
        </div>

        <div className="absolute -bottom-10 right-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-20 flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto pb-px">
        {[
          { id: 'basic', label: 'Basic Info', icon: Info },
          { id: 'social', label: 'Social Links', icon: Globe },
          { id: 'contact', label: 'Contact & Location', icon: Mail },
          { id: 'media', label: 'Preferences', icon: Music },
          { id: 'verification', label: 'Verification (TRN/ID)', icon: CheckCircle2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-green-600 border-green-600 bg-green-50/50' 
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
        >
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Stage Name</label>
                  <div className="relative">
                    <Music className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      className={inputClass + " pl-10"}
                      placeholder="Your stage name"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Artist Type</label>
                  <select
                    name="artistType"
                    value={formData.artistType as string || 'solo'}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="solo">Solo Artist</option>
                    <option value="band">Band / Group</option>
                    <option value="producer">Producer</option>
                    <option value="composer">Composer</option>
                    <option value="podcaster">Podcaster</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Professional Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className={inputClass + " resize-none"}
                  placeholder="Tell the world about your musical journey..."
                />
                <p className="text-right text-[10px] text-gray-400 mt-1">Maximum 2000 characters</p>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'socialLinks.instagram', label: 'Instagram', icon: Instagram, placeholder: 'instagram.com/yourname' },
                { name: 'socialLinks.twitter', label: 'Twitter', icon: Twitter, placeholder: 'twitter.com/yourname' },
                { name: 'socialLinks.facebook', label: 'Facebook', icon: Facebook, placeholder: 'facebook.com/yourname' },
                { name: 'socialLinks.youtube', label: 'YouTube', icon: Youtube, placeholder: 'youtube.com/c/yourchannel' },
                { name: 'socialLinks.website', label: 'Website', icon: Globe, placeholder: 'yourwebsite.com' },
                { name: 'socialLinks.spotify', label: 'Spotify', icon: Music, placeholder: 'spotify.com/artist/...' },
              ].map((social) => (
                <div key={social.name}>
                  <label className={labelClass}>{social.label}</label>
                  <div className="relative">
                    <social.icon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name={social.name}
                      value={(formData.socialLinks as any)?.[social.name.split('.')[1]] || ''}
                      onChange={handleInputChange}
                      className={inputClass + " pl-10"}
                      placeholder={social.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Booking Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail || ''}
                      onChange={handleInputChange}
                      className={inputClass + " pl-10"}
                      placeholder="booking@yourname.com"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone || ''}
                      onChange={handleInputChange}
                      className={inputClass + " pl-10"}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="location.city"
                      value={(formData.location as any)?.city || ''}
                      onChange={handleInputChange}
                      className={inputClass + " pl-10"}
                      placeholder="e.g. New York"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="location.country"
                      value={(formData.location as any)?.country || ''}
                      onChange={handleInputChange}
                      className={inputClass + " pl-10"}
                      placeholder="e.g. USA"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-l-4 border-green-500 pl-3 uppercase tracking-wider">Interactions</h3>
                  {[
                    { key: 'preferences.allowComments', label: 'Allow Comments', desc: 'Let fans comment on your tracks' },
                    { key: 'preferences.allowGifts', label: 'Accept Gifts', desc: 'Enable digital gifting during live streams' },
                    { key: 'preferences.allowMessages', label: 'Direct Messages', desc: 'Allow fans to message you directly' },
                  ].map((pref) => (
                    <label key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{pref.label}</p>
                        <p className="text-xs text-gray-500">{pref.desc}</p>
                      </div>
                      <input
                        type="checkbox"
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
                        className="w-5 h-5 rounded-lg border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 border-l-4 border-purple-500 pl-3 uppercase tracking-wider">Payments</h3>
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl">
                    <label className={labelClass}>Payout Method</label>
                    <select
                      name="payoutInfo.method"
                      value={(formData.payoutInfo as any)?.method || 'paypal'}
                      onChange={handleInputChange}
                      className={inputClass + " bg-white/50 backdrop-blur-sm"}
                    >
                      <option value="paypal">PayPal</option>
                      <option value="bank_transfer">International Bank Transfer (SWIFT)</option>
                      <option value="jamaican_bank">Jamaican Local Bank (J$)</option>
                      <option value="jamdex">JAMDEX (CBDC)</option>
                      <option value="stripe">Stripe</option>
                    </select>
                    
                    {(formData.payoutInfo as any)?.method === 'paypal' && (
                      <div className="mt-4">
                        <label className={labelClass}>PayPal Email</label>
                        <input
                          type="email"
                          name="payoutInfo.paypalEmail"
                          value={(formData.payoutInfo as any)?.paypalEmail || ''}
                          onChange={handleInputChange}
                          className={inputClass + " bg-white/50 backdrop-blur-sm"}
                          placeholder="your-paypal@email.com"
                        />
                      </div>
                    )}

                    {(formData.payoutInfo as any)?.method === 'jamaican_bank' && (
                      <div className="mt-4 space-y-4">
                        <label className={labelClass}>Jamaican Bank Details</label>
                        <select
                          name="payoutInfo.jamaicanBank.bankName"
                          value={(formData.payoutInfo as any)?.jamaicanBank?.bankName || ''}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          <option value="">Select Bank</option>
                          <option value="NCB">NCB (National Continental Bank)</option>
                          <option value="Scotia">Scotiabank</option>
                          <option value="Sagicor">Sagicor Bank</option>
                          <option value="JMMB">JMMB Bank</option>
                          <option value="FGB">First Global Bank</option>
                        </select>
                        <input
                          type="text"
                          name="payoutInfo.jamaicanBank.branchName"
                          value={(formData.payoutInfo as any)?.jamaicanBank?.branchName || ''}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Branch / Street"
                        />
                        <input
                          type="text"
                          name="payoutInfo.jamaicanBank.accountNumber"
                          value={(formData.payoutInfo as any)?.jamaicanBank?.accountNumber || ''}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Account Number"
                        />
                        <select
                          name="payoutInfo.jamaicanBank.accountType"
                          value={(formData.payoutInfo as any)?.jamaicanBank?.accountType || 'savings'}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          <option value="savings">Savings</option>
                          <option value="checking">Chequing</option>
                        </select>
                      </div>
                    )}

                    {(formData.payoutInfo as any)?.method === 'jamdex' && (
                      <div className="mt-4 space-y-4">
                        <label className={labelClass}>JAMDEX Details (CBDC)</label>
                        <input
                          type="text"
                          name="payoutInfo.jamdex.walletAddress"
                          value={(formData.payoutInfo as any)?.jamdex?.walletAddress || ''}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Lynk Wallet / Email"
                        />
                        <input
                          type="text"
                          name="payoutInfo.jamdex.trn"
                          value={(formData.payoutInfo as any)?.jamdex?.trn || ''}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="TRN (9-digits)"
                          maxLength={9}
                        />
                      </div>
                    )}
                    
                    <p className="mt-4 text-[11px] text-purple-600 font-medium">
                      Note: Payout details are encrypted and stored securely. Minimum payout threshold is $50. JAMDEX payouts require a verified Jamaican TRN.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 border-l-4 border-blue-500 pl-3 uppercase tracking-wider">Government ID / TRN Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Identification Type</label>
                  <select
                    name="verificationDocuments.idType"
                    value={(formData.verificationDocuments as any)?.idType || 'nis'}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="nis">NIS (National Insurance Scheme)</option>
                    <option value="drivers_license">Driver's License (Jamaican)</option>
                    <option value="passport">Passport</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>ID Number</label>
                  <input
                    type="text"
                    name="verificationDocuments.idNumber"
                    value={(formData.verificationDocuments as any)?.idNumber || ''}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Enter ID Number"
                  />
                </div>
              </div>
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3">
                 <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                 <p className="text-xs text-blue-700 leading-relaxed font-medium">
                   Verification is required for high-volume earners and local bank payouts. 
                   Ensure your document name matches your Lugmatic profile name.
                 </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}