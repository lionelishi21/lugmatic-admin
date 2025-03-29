import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface Album {
  id: number;
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  status: 'draft' | 'published' | 'archived';
  coverImage: string;
  trackCount: number;
  totalDuration: string;
  revenue: number;
}

const AlbumManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleOpenDialog = (album?: Album) => {
    setSelectedAlbum(album || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAlbum(null);
  };

  // Mock data - replace with actual API calls
  const albums: Album[] = [
    {
      id: 1,
      title: 'Summer Vibes 2024',
      artist: 'John Doe',
      genre: 'Pop',
      releaseDate: '2024-06-01',
      status: 'published',
      coverImage: 'https://via.placeholder.com/150',
      trackCount: 12,
      totalDuration: '45:30',
      revenue: 2500,
    },
    {
      id: 2,
      title: 'Midnight Dreams',
      artist: 'Jane Smith',
      genre: 'Rock',
      releaseDate: '2024-05-15',
      status: 'draft',
      coverImage: 'https://via.placeholder.com/150',
      trackCount: 10,
      totalDuration: '38:45',
      revenue: 0,
    },
  ];

  const getStatusColor = (status: Album['status']) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Album Management</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            sx={{ mr: 2 }}
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Album
          </Button>
        </Box>
      </Box>

      {viewMode === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cover</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Artist</TableCell>
                <TableCell>Genre</TableCell>
                <TableCell>Release Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tracks</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {albums.map((album) => (
                <TableRow key={album.id}>
                  <TableCell>
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  </TableCell>
                  <TableCell>{album.title}</TableCell>
                  <TableCell>{album.artist}</TableCell>
                  <TableCell>{album.genre}</TableCell>
                  <TableCell>{album.releaseDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={album.status}
                      color={getStatusColor(album.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{album.trackCount}</TableCell>
                  <TableCell>${album.revenue.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(album)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {albums.map((album) => (
            <Card key={album.id}>
              <CardMedia
                component="img"
                height="200"
                image={album.coverImage}
                alt={album.title}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {album.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {album.artist}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label={album.status}
                    color={getStatusColor(album.status)}
                    size="small"
                  />
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(album)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAlbum ? 'Edit Album' : 'Add New Album'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Album Title"
              fullWidth
              defaultValue={selectedAlbum?.title}
            />
            <FormControl fullWidth>
              <InputLabel>Artist</InputLabel>
              <Select defaultValue={selectedAlbum?.artist}>
                <MenuItem value="John Doe">John Doe</MenuItem>
                <MenuItem value="Jane Smith">Jane Smith</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select defaultValue={selectedAlbum?.genre}>
                <MenuItem value="Pop">Pop</MenuItem>
                <MenuItem value="Rock">Rock</MenuItem>
                <MenuItem value="Hip Hop">Hip Hop</MenuItem>
                <MenuItem value="Electronic">Electronic</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Release Date"
              type="date"
              fullWidth
              defaultValue={selectedAlbum?.releaseDate}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select defaultValue={selectedAlbum?.status || 'draft'}>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Cover Image URL"
              fullWidth
              defaultValue={selectedAlbum?.coverImage}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedAlbum ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AlbumManagement; 