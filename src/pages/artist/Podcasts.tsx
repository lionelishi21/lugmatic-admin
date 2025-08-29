import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Analytics as AnalyticsIcon,
  Upload as UploadIcon,
  Headphones as HeadphonesIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { podcastService } from '../../services/podcastService';
import { Podcast, CreatePodcastRequest } from '../../types';
import toast from 'react-hot-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`podcast-tabpanel-${index}`}
      aria-labelledby={`podcast-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Podcasts: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [formData, setFormData] = useState<CreatePodcastRequest>({
    title: '',
    description: '',
    audioUrl: '',
    category: '',
    tags: []
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const response = await podcastService.getArtistPodcasts('current-artist-id');
      if (response.data && response.data.data) {
        setPodcasts(response.data.data as unknown as Podcast[]);
      } else {
        setPodcasts([]);
      }
    } catch (error) {
      toast.error('Failed to load podcasts');
      console.error('Error loading podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (podcast?: Podcast) => {
    if (podcast) {
      setEditingPodcast(podcast);
      setFormData({
        title: podcast.title,
        description: podcast.description,
        audioUrl: podcast.audioUrl,
        category: podcast.category,
        tags: podcast.tags || []
      });
    } else {
      setEditingPodcast(null);
      setFormData({
        title: '',
        description: '',
        audioUrl: '',
        category: '',
        tags: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPodcast(null);
    setFormData({
      title: '',
      description: '',
      audioUrl: '',
      category: '',
      tags: []
    });
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      if (editingPodcast) {
        await podcastService.updatePodcast(editingPodcast._id, formData);
        toast.success('Podcast updated successfully');
      } else {
        await podcastService.createPodcast(formData);
        toast.success('Podcast created successfully');
      }
      handleCloseDialog();
      loadPodcasts();
    } catch (error) {
      toast.error('Failed to save podcast');
      console.error('Error saving podcast:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (podcastId: string) => {
    if (window.confirm('Are you sure you want to delete this podcast?')) {
      try {
        await podcastService.deletePodcast(podcastId);
        toast.success('Podcast deleted successfully');
        loadPodcasts();
      } catch (error) {
        toast.error('Failed to delete podcast');
        console.error('Error deleting podcast:', error);
      }
    }
  };

  const handleTogglePublish = async (podcastId: string, isPublished: boolean) => {
    try {
      await podcastService.togglePublishStatus(podcastId, !isPublished);
      toast.success(`Podcast ${!isPublished ? 'published' : 'unpublished'} successfully`);
      loadPodcasts();
    } catch (error) {
      toast.error('Failed to update podcast status');
      console.error('Error updating podcast status:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4, 
          p: 4, 
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              My Podcasts
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Manage your podcast content and track performance
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Upload Podcast
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              textAlign: 'center'
            }}>
              <HeadphonesIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                {podcasts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Podcasts
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 163, 74, 0.1) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              textAlign: 'center'
            }}>
              <PlayIcon sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                {podcasts.filter(p => p.isPublished).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Published
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              textAlign: 'center'
            }}>
              <TrendingIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {podcasts.reduce((sum, p) => sum + p.listeners, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Listeners
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              textAlign: 'center'
            }}>
              <ViewIcon sx={{ fontSize: 40, color: '#ec4899', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ec4899' }}>
                {podcasts.reduce((sum, p) => sum + p.likes, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Likes
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Box sx={{ 
        mb: 3,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        overflow: 'hidden'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 64
            },
            '& .Mui-selected': {
              color: '#667eea !important'
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: 3
            }
          }}
        >
          <Tab label="All Podcasts" />
          <Tab label="Published" />
          <Tab label="Drafts" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {podcasts.map((podcast) => (
            <Grid item xs={12} sm={6} md={4} key={podcast._id}>
              <Card sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={podcast.coverImage || '/default-podcast-cover.jpg'}
                  alt={podcast.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {podcast.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    {podcast.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip 
                      label={podcast.category} 
                      size="small" 
                      sx={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    <Chip
                      label={podcast.isPublished ? 'Published' : 'Draft'}
                      color={podcast.isPublished ? 'success' : 'default'}
                      size="small"
                      variant={podcast.isPublished ? 'filled' : 'outlined'}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {formatDuration(podcast.duration)} • {podcast.listeners} listeners
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(podcast)}
                        sx={{ color: '#667eea' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(podcast._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {podcasts.filter(p => p.isPublished).map((podcast) => (
            <Grid item xs={12} sm={6} md={4} key={podcast._id}>
              <Card sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={podcast.coverImage || '/default-podcast-cover.jpg'}
                  alt={podcast.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {podcast.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    {podcast.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip label={podcast.category} size="small" />
                    <Chip label="Published" color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {formatDuration(podcast.duration)} • {podcast.listeners} listeners
                    </Typography>
                    <Box>
                      <IconButton size="small" sx={{ color: '#667eea' }}>
                        <AnalyticsIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleTogglePublish(podcast._id, podcast.isPublished)}
                      >
                        <PauseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {podcasts.filter(p => !p.isPublished).map((podcast) => (
            <Grid item xs={12} sm={6} md={4} key={podcast._id}>
              <Card sx={{
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
                }
              }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={podcast.coverImage || '/default-podcast-cover.jpg'}
                  alt={podcast.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {podcast.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    {podcast.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip label={podcast.category} size="small" />
                    <Chip label="Draft" color="default" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {formatDuration(podcast.duration)}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleTogglePublish(podcast._id, podcast.isPublished)}
                        sx={{ color: '#22c55e' }}
                      >
                        <PlayIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(podcast)}
                        sx={{ color: '#667eea' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden'
        }}>
          <Typography variant="h6" sx={{ p: 3, fontWeight: 600 }}>
            Podcast Analytics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Podcast</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Listeners</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Likes</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {podcasts.map((podcast) => (
                  <TableRow key={podcast._id} sx={{ '&:hover': { background: 'rgba(102, 126, 234, 0.05)' } }}>
                    <TableCell>{podcast.title}</TableCell>
                    <TableCell>{podcast.listeners}</TableCell>
                    <TableCell>{podcast.likes}</TableCell>
                    <TableCell>{formatDuration(podcast.duration)}</TableCell>
                    <TableCell>
                      <Chip
                        label={podcast.isPublished ? 'Published' : 'Draft'}
                        color={podcast.isPublished ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </TabPanel>

      {/* Upload/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          {editingPodcast ? 'Edit Podcast' : 'Upload New Podcast'}
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <TextField
              fullWidth
              label="Audio URL"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
                sx={{
                  borderRadius: 2
                }}
              >
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="comedy">Comedy</MenuItem>
                <MenuItem value="news">News</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="lifestyle">Lifestyle</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Tags (comma separated)"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              margin="normal"
              helperText="Enter tags separated by commas"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || !formData.title || !formData.audioUrl}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {uploading ? 'Saving...' : editingPodcast ? 'Update' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Podcasts; 