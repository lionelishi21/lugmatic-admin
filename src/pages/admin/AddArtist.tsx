import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { CreateArtistData } from '../../services/artistService';
import { Upload, ArrowLeft, User, Mail, Music, FileText, ImageIcon, X, Loader2, Shield } from 'lucide-react';
import { usePostArtist } from '../../hooks/artist/usePostArtist';

interface ArtistFormData {
  firstName: string;
  lastName: string;
  email: string;
  stageName: string;
  bio: string;
  genre: string;
}

const schema: yup.ObjectSchema<ArtistFormData> = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  stageName: yup.string().required('Artist name is required'),
  bio: yup.string().required('Artist bio is required'),
  genre: yup.string().required('Genre is required'),
}) as yup.ObjectSchema<ArtistFormData>;

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 bg-zinc-950 border rounded transition-all duration-200 focus:outline-none font-black italic uppercase text-xs tracking-widest ${
    hasError
      ? 'border-rose-500 text-rose-500 placeholder-rose-500/50'
      : 'border-white/10 text-white placeholder-white/20 focus:border-emerald-500'
  }`;

const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic";
const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg p-6 shadow-2xl relative overflow-hidden group";

const AddArtist = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { postArtist, isLoading } = usePostArtist();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ArtistFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      stageName: '',
      bio: '',
      genre: ''
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImageFile(null);
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const onSubmit: SubmitHandler<ArtistFormData> = async (data) => {
    try {
      const genres = data.genre.trim() ? [data.genre.trim()] : undefined;
      const artistData: CreateArtistData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        name: data.stageName.trim(),
        bio: data.bio.trim(),
        genres,
      };

      if (selectedImageFile) {
        artistData.image = await fileToBase64(selectedImageFile);
      }

      await postArtist(artistData);
      toast.success('Artist added successfully!');
      reset();
      setImagePreview(null);
      setSelectedImageFile(null);
      navigate('/admin/artist-management');
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to add artist. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/artist-management');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* ── Page header ── */}
      <div className={`${cardClass} p-8`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
             <button
               onClick={handleCancel}
               className="w-12 h-12 bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all group/back"
             >
               <ArrowLeft className="h-5 w-5 group-hover/back:-translate-x-1 transition-transform" />
             </button>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Ecosystem Registry</p>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">
                  Initialize Artist
                </h1>
                <p className="text-sm text-zinc-500 mt-1 max-w-md">
                  Onboarding new talent into the Lugmatic Intelligence loop.
                </p>
             </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Connection
             </span>
             <p className="text-[11px] text-zinc-600 font-bold mt-1 uppercase tracking-widest">v2.4.0 Registry</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Profile image section */}
          <div className="lg:col-span-4 h-fit">
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-500/10 rounded flex items-center justify-center">
                   <ImageIcon className="h-4 w-4 text-emerald-500" />
                </div>
                <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Visual Identity</h2>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                {imagePreview ? (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded blur opacity-20 group-hover:opacity-40 transition-opacity" />
                    <img
                      src={imagePreview}
                      alt="Artist preview"
                      className="relative h-48 w-48 rounded object-cover border border-black/20 dark:border-white/20"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-zinc-900 dark:text-white rounded flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-48 w-48 rounded bg-zinc-50 dark:bg-zinc-950 border border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center gap-3 group-hover:border-emerald-500/30 transition-all">
                    <User className="h-10 w-10 text-zinc-800" />
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No Signature</p>
                  </div>
                )}
                
                <div className="w-full">
                  <label className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest cursor-pointer hover:bg-black/5 dark:bg-white/5 hover:border-emerald-500/30 transition-all">
                    <Upload className="h-4 w-4 text-emerald-500" />
                    {imagePreview ? 'Change Avatar' : 'Upload Avatar'}
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                  </label>
                  <p className="text-[9px] text-zinc-500 text-center mt-3 font-bold uppercase tracking-widest">RAW / HQ / MAX 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal information */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                   <User className="h-4 w-4 text-blue-500" />
                </div>
                <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Core Credentials</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    placeholder="ENTER GIVEN NAME"
                    {...register('firstName')}
                    className={inputClass(!!errors.firstName)}
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    placeholder="ENTER SURNAME"
                    {...register('lastName')}
                    className={inputClass(!!errors.lastName)}
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className={labelClass}>Neural Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="USER@ECOSYSTEM.COM"
                    {...register('email')}
                    className={`${inputClass(!!errors.email)} pl-12`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Artist details */}
            <div className={cardClass}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-emerald-500/10 rounded flex items-center justify-center">
                   <Music className="h-4 w-4 text-emerald-500" />
                </div>
                <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">Sonic Intelligence</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Stage Designation</label>
                  <input
                    type="text"
                    placeholder="E.G. NEON VORTEX"
                    {...register('stageName')}
                    className={inputClass(!!errors.stageName)}
                  />
                  {errors.stageName && (
                    <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{errors.stageName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Primary Frequency (Genre)</label>
                  <input
                    type="text"
                    placeholder="E.G. SYNTHWAVE / TRAP"
                    {...register('genre')}
                    className={inputClass(!!errors.genre)}
                  />
                  {errors.genre && (
                    <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{errors.genre.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Combat Bio / Artist Profile</label>
                  <FileText className="h-3.5 w-3.5 text-zinc-700" />
                </div>
                <textarea
                  {...register('bio')}
                  rows={4}
                  placeholder="TRANSMIT ARTIST HISTORY AND MISSION OBJECTIVES..."
                  className={inputClass(!!errors.bio)}
                />
                {errors.bio && (
                  <p className="mt-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest">{errors.bio.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors disabled:opacity-50 italic"
              >
                Abort Protocol
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-10 py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 italic"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Finalize Registration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default AddArtist;