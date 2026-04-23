import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Button, 
  TextField, 
  InputAdornment,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Pagination
} from '@mui/material';
import { 
  Search, 
  MoreVert, 
  Edit, 
  Delete, 
  Radio as PodcastIcon, 
  PlayCircle,
  FilterList,
  CheckCircle,
  XCircle,
  Mic,
  Calendar,
  Eye
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Podcast } from '../../types';

const PodcastManagement: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);
  const [moderateAction, setModerateAction] = useState<'approve' | 'reject'>('approve');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    episodes: 0
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await adminService.getAllPodcasts(page, 10, filters);
      if (response && response.data) {
        setPodcasts(response.data);
        // Assuming pagination data is in response.pagination as per other endpoints
        if ((response as any).pagination) {
          setTotalPages((response as any).pagination.pages);
          setStats(prev => ({
              ...prev,
              total: (response as any).pagination.total
          }));
        } else if (response.data.data && Array.isArray(response.data.data)) {
           // Handle cases where response structure might vary
           setPodcasts(response.data.data);
           if (response.data.pagination) {
              setTotalPages(response.data.pagination.pages);
              setStats(prev => ({
                  ...prev,
                  total: response.data.pagination.total
              }));
           }
        }
      }
    } catch (err: any) {
      console.error('Error fetching podcasts:', err);
      showSnackbar('Failed to fetch podcasts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPodcasts();
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, podcast: Podcast) => {
    setAnchorEl(event.currentTarget);
    setSelectedPodcast(podcast);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPodcast) return;
    try {
      // Assuming a delete endpoint exists or using moderateContent with 'delete'
      await adminService.moderateContent('podcasts', selectedPodcast._id, 'delete');
      showSnackbar('Podcast deleted successfully');
      setPodcasts(prev => prev.filter(p => p._id !== selectedPodcast._id));
    } catch (err) {
      showSnackbar('Failed to delete podcast', 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleModerateClick = (action: 'approve' | 'reject') => {
    setModerateAction(action);
    setModerateDialogOpen(true);
    handleMenuClose();
  };

  const handleModerateConfirm = async () => {
    if (!selectedPodcast) return;
    try {
      await adminService.moderateContent('podcasts', selectedPodcast._id, moderateAction);
      showSnackbar(`Podcast ${moderateAction}d successfully`);
      fetchPodcasts(); // Refresh list
    } catch (err) {
      showSnackbar(`Failed to ${moderateAction} podcast`, 'error');
    } finally {
      setModerateDialogOpen(false);
    }
  };

  const getStatusChip = (podcast: Podcast) => {
    if (!podcast.isApproved) return <Chip label="Pending" size="small" color="warning" icon={<Eye size={14} />} />;
    if (!podcast.isActive) return <Chip label="Inactive" size="small" color="default" />;
    return <Chip label="Live" size="small" color="success" icon={<PodcastIcon size={14} />} />;
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Podcast Management
          </Typography>
          <Typography variant="body2" color="slate.500">
            Monitor and manage audio podcasts across the platform.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Mic size={18} />}
          sx={{ 
            bgcolor: '#10b981', 
            '&:hover': { bgcolor: '#059669' },
            borderRadius: '12px',
            textTransform: 'none',
            px: 3
          }}
        >
          Add New Podcast
        </Button>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Podcasts', value: stats.total, icon: <PodcastIcon className="text-blue-500" /> },
          { label: 'Published', value: stats.published, icon: <CheckCircle className="text-green-500" /> },
          { label: 'Pending Approval', value: stats.pending, icon: <Eye className="text-amber-500" /> },
          { label: 'Total Episodes', value: stats.episodes, icon: <Mic className="text-purple-500" /> }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '16px' }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters & Search */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, position: 'relative' }}>
          <TextField
            fullWidth
            placeholder="Search podcasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
              sx: { borderRadius: '16px', bgcolor: 'white' }
            }}
          />
        </Box>
        <TextField
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: '16px', bgcolor: 'white' } }}
        >
          <option value="all">All Status</option>
          <option value="approved">Live Only</option>
          <option value="pending">Pending Only</option>
          <option value="inactive">Inactive</option>
        </TextField>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper} sx={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Podcast Info</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Artist</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Episodes</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ mt: 1 }}>Loading podcasts...</Typography>
                </TableCell>
              </TableRow>
            ) : podcasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">No podcasts found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              podcasts.map((podcast) => (
                <TableRow key={podcast._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={podcast.coverArt} 
                        variant="rounded" 
                        sx={{ width: 48, height: 48, borderRadius: '12px' }}
                      >
                        <PodcastIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{podcast.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {podcast.explicit ? 'Explicit' : 'Clean'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {(podcast.artist as any)?.name || 'Unknown Artist'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={podcast.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayCircle size={14} style={{ color: '#94a3b8' }} />
                      <Typography variant="body2">{podcast.episodes?.length || 0}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(podcast)}</TableCell>
                  <TableCell>
                     <Typography variant="caption">
                      {new Date(podcast.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, podcast)}>
                      <MoreVert size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(_, value) => setPage(value)} 
              color="primary"
            />
          </Box>
        )}
      </TableContainer>

      {/* Menus & Dialogs */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: '12px', minWidth: 150, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } }}
      >
        <MenuItem onClick={handleMenuClose}><Edit size={16} style={{ marginRight: 8 }} /> Edit Details</MenuItem>
        
        {selectedPodcast && !selectedPodcast.isApproved ? (
          <MenuItem onClick={() => handleModerateClick('approve')} sx={{ color: 'success.main' }}>
            <CheckCircle size={16} style={{ marginRight: 8 }} /> Approve
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleModerateClick('reject')} sx={{ color: 'warning.main' }}>
            <XCircle size={16} style={{ marginRight: 8 }} /> Deactivate
          </MenuItem>
        )}
        
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} /> Delete Permanent
        </MenuItem>
      </Menu>

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle>Delete Podcast?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedPodcast?.title}"? This action cannot be undone and will remove all associated episodes.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ borderRadius: '12px' }}>Delete Podcast</Button>
        </DialogActions>
      </Dialog>

      {/* Moderate confirmation */}
      <Dialog open={moderateDialogOpen} onClose={() => setModerateDialogOpen(false)} PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle>{moderateAction === 'approve' ? 'Approve Podcast?' : 'Deactivate Podcast?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {moderateAction === 'approve' 
              ? `Are you sure you want to approve "${selectedPodcast?.title}" and make it visible to all users?`
              : `Are you sure you want to deactivate "${selectedPodcast?.title}"? It will no longer be visible on the platform.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setModerateDialogOpen(false)} sx={{ borderRadius: '12px' }}>Cancel</Button>
          <Button 
            onClick={handleModerateConfirm} 
            color={moderateAction === 'approve' ? 'success' : 'warning'} 
            variant="contained" 
            sx={{ borderRadius: '12px' }}
          >
            Confirm {moderateAction === 'approve' ? 'Approval' : 'Deactivation'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PodcastManagement;