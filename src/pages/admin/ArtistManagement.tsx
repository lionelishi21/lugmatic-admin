import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast, Toaster } from 'react-hot-toast';
import useFetchArtists, { Artist } from '../../hooks/artist/useFetchArtists';
import { Link } from 'react-router-dom';

// Types
type ModalType = 'add' | 'edit' | 'delete' | 'view' | null;
// type FilterParams = {
//   searchTerm: string;
//   status: string;
// };

// Animation variants
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  initial: { scale: 0.9, y: 20, opacity: 0 },
  animate: { scale: 1, y: 0, opacity: 1 },
  exit: { scale: 0.9, y: 20, opacity: 0 }
};

// Extracted components for better code organization and performance
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800',
    default: 'bg-gray-200 text-gray-800'
  };
  
  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.default;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${style} capitalize`}>
      {status}
    </span>
  );
};

const ModalContainer: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    {...fadeIn}
  >
    <motion.div
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  </motion.div>
);

const SearchBar: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
}> = ({ searchTerm, onSearchChange }) => (
  <div className="relative w-full sm:w-64">
    <input
      type="text"
      placeholder="Search artists..."
      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
    />
    <svg 
      className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
);

const StatusFilter: React.FC<{
  filterStatus: string;
  onStatusChange: (status: string) => void;
}> = ({ filterStatus, onStatusChange }) => (
  <select
    className="w-full sm:w-44 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
    value={filterStatus}
    onChange={(e) => onStatusChange(e.target.value)}
  >
    <option value="all">All Status</option>
    <option value="active">Active</option>
    <option value="pending">Pending</option>
    <option value="inactive">Inactive</option>
  </select>
);

// Using React.memo to prevent re-renders when parent component re-renders
const ArtistRow = React.memo(({ 
  artist, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  artist: Artist; 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void; 
}) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10">
          <img 
            className="h-10 w-10 rounded-full object-cover" 
            src={artist.imageUrl || 'https://placehold.co/40x40/gray/white?text=Artist'} 
            alt={artist.name} 
            loading="lazy"
          />
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{artist.name}</div>
          <div className="text-sm text-gray-500">{artist.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{artist.genre}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={artist.status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {artist.joinDate}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">—</div>
      <div className="text-sm text-gray-500">—</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex justify-end space-x-2">
        <button 
          onClick={onView}
          className="text-blue-600 hover:text-blue-900">
          View
        </button>
        <button 
          onClick={onEdit}
          className="text-indigo-600 hover:text-indigo-900" >
          Edit
        </button>
        <button 
          onClick={onDelete}
          className="text-red-600 hover:text-red-900">
          Delete
        </button>
      </div>
    </td>
  </tr>
));

const FormField: React.FC<{
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ name, type = 'text', value, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2 capitalize">
      {name}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      required
    />
  </div>
);

const ArtistManagement: React.FC = () => {

  // State management
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState<Partial<Artist>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  // const [filterParams, setFilterParams] = useState<FilterParams>({
  //   searchTerm: '',
  //   status: 'all'
  // });
  
  // Get artists data with filters
  const { artists, loading } = useFetchArtists();

  console.log('data------->',artists);

  // Update filter params with debounce
  useEffect(() => {
    const timer = setTimeout(() => {}, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  // Modal handlers with stabilized functions
  const handleOpenModal = useCallback((type: ModalType, artist: Artist | null = null) => {
    setModalOpen(type);
    setSelectedArtist(artist);
    
    if (type === 'add') {
      setFormData({});
    } else if (type === 'edit' && artist) {
      setFormData({ ...artist });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(null);
    setSelectedArtist(null);
    setFormData({});
  }, []);

  // Form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalOpen === 'add') {
      // Create new artist template
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const newArtist: Artist = {
      //   id: Date.now(),
      //   name: formData.name || '',
      //   email: formData.email || '',
      //   genre: formData.genre || '',
      //   status: (formData.status as 'active' | 'pending' | 'inactive') || 'pending',
      //   joinDate: new Date().toISOString().split('T')[0],
      //   totalSongs: 0,
      //   totalAlbums: 0,
      // };
      
      // For demonstration only
      toast.success('Artist added successfully!');
    } else if (modalOpen === 'edit' && selectedArtist) {
      // In a real implementation, you would update the artist
      // artists = artists.map(a => a.id === selectedArtist.id ? {...a, ...formData} : a);
      
      toast.success('Artist updated successfully!');
    }
    
    handleCloseModal();
  }, [modalOpen, formData, selectedArtist, handleCloseModal]);

  // Delete handler
  const handleDeleteArtist = useCallback(() => {
    if (selectedArtist) {
      // In a real implementation, you would remove the artist
      // artists = artists.filter(a => a.id !== selectedArtist.id);
      
      toast.success('Artist deleted successfully!');
      handleCloseModal();
    }
  }, [selectedArtist, handleCloseModal]);

  // Search handler - stabilized to prevent re-renders
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Status filter handler - stabilized to prevent re-renders
  const handleStatusChange = useCallback((status: string) => {
    setFilterStatus(status);
  }, []);

  // Render the ArtistTable to avoid re-renders of the entire component
  const ArtistTable = useMemo(() => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Artist
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Genre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Join Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Content
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {artists && artists.length > 0 ? (
            artists.map((artist) => (
              <ArtistRow 
                key={artist.id} 
                artist={artist} 
                onView={() => handleOpenModal('view', artist)}
                onEdit={() => handleOpenModal('edit', artist)}
                onDelete={() => handleOpenModal('delete', artist)}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                No artists found. Try adjusting your search or filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ), [artists, handleOpenModal]);

  // Memoize add/edit form to prevent unnecessary re-renders
  const ArtistForm = useMemo(() => (
    <form onSubmit={handleSubmit}>
      <FormField name="name" value={formData.name || ''} onChange={handleInputChange} />
      <FormField name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
      <FormField name="genre" value={formData.genre || ''} onChange={handleInputChange} />
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status || 'pending'}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        >
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={handleCloseModal}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
          Cancel
        </button>
       
        <Link
          to="/artist/add"
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Add Artist
        </Link>
      </div>

    </form>
  ), [formData, handleInputChange, handleSubmit, handleCloseModal, modalOpen]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      {/* Loading state - only show when actually loading */}
      {loading && <Preloader isVisible={loading} text="Loading artists..." />}
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Artist Management</h1>
        <p className="text-gray-600 mt-2">Manage all artists in your system</p>
      </div>
      
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <SearchBar 
            searchTerm={searchTerm} 
            onSearchChange={handleSearchChange} 
          />
          <StatusFilter 
            filterStatus={filterStatus} 
            onStatusChange={handleStatusChange} 
          />
        </div>
        
        {/* Add Artist Button */}
        <Link
          to="/admin/artist-add"
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Add Artist
        </Link>
      </div>
      
      {/* Artists Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {ArtistTable}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(modalOpen === 'add' || modalOpen === 'edit') && (
          <ModalContainer>
            <h2 className="text-xl font-bold mb-4">
              {modalOpen === 'add' ? 'Add New Artist' : 'Edit Artist'}
            </h2>
            {ArtistForm}
          </ModalContainer>
        )}
      </AnimatePresence>



      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {modalOpen === 'delete' && selectedArtist && (
          <ModalContainer>
            <div className="text-center mb-4">
              <svg 
                className="mx-auto h-12 w-12 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <h2 className="text-xl font-bold mt-2">Confirm Delete</h2>
              <p className="text-gray-600 mt-1">
                Are you sure you want to delete the artist "{selectedArtist.name}"? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteArtist}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Artist
              </button>
            </div>
          </ModalContainer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtistManagement;