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
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: string;
  status: 'draft' | 'published' | 'archived';
  audioUrl: string;
  trackNumber: number;
  revenue: number;
  plays: number;
  isPlaying?: boolean;
}

const SongManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [playingSong, setPlayingSong] = useState<number | null>(null);

  const handleOpenDialog = (song?: Song) => {
    setSelectedSong(song || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSong(null);
  };

  const handlePlayPause = (songId: number) => {
    setPlayingSong(playingSong === songId ? null : songId);
  };

  // Mock data - replace with actual API calls
  const songs: Song[] = [
    {
      id: 1,
      title: 'Summer Nights',
      artist: 'John Doe',
      album: 'Summer Vibes 2024',
      genre: 'Pop',
      duration: '3:45',
      status: 'published',
      audioUrl: 'https://example.com/song1.mp3',
      trackNumber: 1,
      revenue: 150,
      plays: 1200,
    },
    {
      id: 2,
      title: 'Midnight Dreams',
      artist: 'Jane Smith',
      album: 'Midnight Dreams',
      genre: 'Rock',
      duration: '4:20',
      status: 'draft',
      audioUrl: 'https://example.com/song2.mp3',
      trackNumber: 1,
      revenue: 0,
      plays: 0,
    },
  ];

  const getStatusColor = (status: Song['status']) => {
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

  const formatDuration = (duration: string) => {
    return duration;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Song Management</Typography>
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
            Add New Song
          </Button>
        </Box>
      </Box>

      {viewMode === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Track #</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Artist</TableCell>
                <TableCell>Album</TableCell>
                <TableCell>Genre</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Plays</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {songs.map((song) => (
                <TableRow key={song.id}>
                  <TableCell>{song.trackNumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePlayPause(song.id)}
                        color={playingSong === song.id ? 'primary' : 'default'}
                      >
                        {playingSong === song.id ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                      {song.title}
                    </Box>
                  </TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell>{song.album}</TableCell>
                  <TableCell>{song.genre}</TableCell>
                  <TableCell>{formatDuration(song.duration)}</TableCell>
                  <TableCell>
                    <Chip
                      label={song.status}
                      color={getStatusColor(song.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{song.plays.toLocaleString()}</TableCell>
                  <TableCell>${song.revenue.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(song)}>
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
          {songs.map((song) => (
            <Card key={song.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <IconButton
                    onClick={() => handlePlayPause(song.id)}
                    color={playingSong === song.id ? 'primary' : 'default'}
                  >
                    {playingSong === song.id ? <PauseIcon /> : <PlayIcon />}
                  </IconButton>
                  <Typography variant="h6">
                    {song.trackNumber}. {song.title}
                  </Typography>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  {song.artist}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {song.album}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip
                    label={song.status}
                    color={getStatusColor(song.status)}
                    size="small"
                  />
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(song)}>
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
          {selectedSong ? 'Edit Song' : 'Add New Song'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Song Title"
              fullWidth
              defaultValue={selectedSong?.title}
            />
            <FormControl fullWidth>
              <InputLabel>Artist</InputLabel>
              <Select defaultValue={selectedSong?.artist}>
                <MenuItem value="John Doe">John Doe</MenuItem>
                <MenuItem value="Jane Smith">Jane Smith</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Album</InputLabel>
              <Select defaultValue={selectedSong?.album}>
                <MenuItem value="Summer Vibes 2024">Summer Vibes 2024</MenuItem>
                <MenuItem value="Midnight Dreams">Midnight Dreams</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select defaultValue={selectedSong?.genre}>
                <MenuItem value="Pop">Pop</MenuItem>
                <MenuItem value="Rock">Rock</MenuItem>
                <MenuItem value="Hip Hop">Hip Hop</MenuItem>
                <MenuItem value="Electronic">Electronic</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Track Number"
              type="number"
              fullWidth
              defaultValue={selectedSong?.trackNumber}
              InputProps={{
                inputProps: { min: 1 }
              }}
            />
            <TextField
              label="Duration"
              fullWidth
              defaultValue={selectedSong?.duration}
              InputProps={{
                endAdornment: <InputAdornment position="end">mm:ss</InputAdornment>,
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select defaultValue={selectedSong?.status || 'draft'}>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Audio File URL"
              fullWidth
              defaultValue={selectedSong?.audioUrl}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedSong ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SongManagement; 