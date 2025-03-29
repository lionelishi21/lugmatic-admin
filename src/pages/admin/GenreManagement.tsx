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
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';

interface Genre {
  id: number;
  name: string;
  description: string;
  songCount: number;
  albumCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const GenreManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleOpenDialog = (genre?: Genre) => {
    setSelectedGenre(genre || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGenre(null);
  };

  // Mock data - replace with actual API calls
  const genres: Genre[] = [
    {
      id: 1,
      name: 'Pop',
      description: 'Popular music characterized by catchy melodies and contemporary production',
      songCount: 150,
      albumCount: 25,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-03-28',
    },
    {
      id: 2,
      name: 'Rock',
      description: 'Guitar-driven music with strong rhythms and powerful vocals',
      songCount: 200,
      albumCount: 30,
      status: 'active',
      createdAt: '2024-01-02',
      updatedAt: '2024-03-28',
    },
    {
      id: 3,
      name: 'Hip Hop',
      description: 'Urban music featuring rap vocals and electronic beats',
      songCount: 180,
      albumCount: 28,
      status: 'active',
      createdAt: '2024-01-03',
      updatedAt: '2024-03-28',
    },
    {
      id: 4,
      name: 'Electronic',
      description: 'Music created using electronic instruments and digital production',
      songCount: 120,
      albumCount: 20,
      status: 'inactive',
      createdAt: '2024-01-04',
      updatedAt: '2024-03-28',
    },
  ];

  const getStatusColor = (status: Genre['status']) => {
    return status === 'active' ? 'success' : 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Genre Management</Typography>
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
            Add New Genre
          </Button>
        </Box>
      </Box>

      {viewMode === 'list' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Songs</TableCell>
                <TableCell>Albums</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {genres.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MusicNoteIcon color="primary" />
                      {genre.name}
                    </Box>
                  </TableCell>
                  <TableCell>{genre.description}</TableCell>
                  <TableCell>{genre.songCount}</TableCell>
                  <TableCell>{genre.albumCount}</TableCell>
                  <TableCell>
                    <Chip
                      label={genre.status}
                      color={getStatusColor(genre.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(genre.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(genre.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(genre)}>
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
        <Grid container spacing={3}>
          {genres.map((genre) => (
            <Grid item xs={12} sm={6} md={4} key={genre.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <MusicNoteIcon color="primary" />
                    <Typography variant="h6">{genre.name}</Typography>
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {genre.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={`${genre.songCount} Songs`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${genre.albumCount} Albums`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip
                      label={genre.status}
                      color={getStatusColor(genre.status)}
                      size="small"
                    />
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(genre)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGenre ? 'Edit Genre' : 'Add New Genre'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Genre Name"
              fullWidth
              defaultValue={selectedGenre?.name}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              defaultValue={selectedGenre?.description}
            />
            <TextField
              label="Status"
              select
              fullWidth
              defaultValue={selectedGenre?.status || 'active'}
              SelectProps={{
                native: true,
              }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedGenre ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GenreManagement; 