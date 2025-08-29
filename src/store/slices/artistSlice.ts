import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import artistService, { Artist, Album, Song, CreateArtistData } from '../../services/artistService';
import { AxiosError } from 'axios';

interface ArtistState {
  artists: Artist[];
  currentArtist: Artist | null;
  albums: Album[];
  songs: Song[];
  loading: boolean;
  error: string | null;
}

const initialState: ArtistState = {
  artists: [],
  currentArtist: null,
  albums: [],
  songs: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchArtists = createAsyncThunk(
  'artist/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await artistService.getAllArtists();
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch artists');
    }
  }
);

export const fetchArtistById = createAsyncThunk(
  'artist/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await artistService.getArtistById(id);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch artist');
    }
  }
);

export const fetchArtistAlbums = createAsyncThunk(
  'artist/fetchAlbums',
  async (id: string, { rejectWithValue }) => {
    try {
      return await artistService.getArtistAlbums(id);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch albums');
    }
  }
);

export const fetchArtistSongs = createAsyncThunk(
  'artist/fetchSongs',
  async (id: string, { rejectWithValue }) => {
    try {
      return await artistService.getArtistSongs(id);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch songs');
    }
  }
);

export const createArtist = createAsyncThunk(
  'artist/create',
  async (formData: CreateArtistData, { rejectWithValue }) => {
    try {
      return await artistService.createArtist(formData);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to create artist');
    }
  }
);

export const updateArtist = createAsyncThunk(
  'artist/update',
  async ({ id, data }: { id: string; data: Partial<Artist> }, { rejectWithValue }) => {
    try {
      return await artistService.updateArtist(id, data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to update artist');
    }
  }
);

export const deleteArtist = createAsyncThunk(
  'artist/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await artistService.deleteArtist(id);
      return id;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to delete artist');
    }
  }
);

const artistSlice = createSlice({
  name: 'artist',
  initialState,
  reducers: {
    clearCurrentArtist: (state) => {
      state.currentArtist = null;
    },
    clearArtistData: (state) => {
      state.albums = [];
      state.songs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchArtists
      .addCase(fetchArtists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtists.fulfilled, (state, action: PayloadAction<Artist[]>) => {
        state.loading = false;
        state.artists = action.payload;
      })
      .addCase(fetchArtists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchArtistById
      .addCase(fetchArtistById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtistById.fulfilled, (state, action: PayloadAction<Artist>) => {
        state.loading = false;
        state.currentArtist = action.payload;
      })
      .addCase(fetchArtistById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchArtistAlbums
      .addCase(fetchArtistAlbums.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtistAlbums.fulfilled, (state, action: PayloadAction<Album[]>) => {
        state.loading = false;
        state.albums = action.payload;
      })
      .addCase(fetchArtistAlbums.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // fetchArtistSongs
      .addCase(fetchArtistSongs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtistSongs.fulfilled, (state, action: PayloadAction<Song[]>) => {
        state.loading = false;
        state.songs = action.payload;
      })
      .addCase(fetchArtistSongs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // createArtist
      .addCase(createArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArtist.fulfilled, (state, action: PayloadAction<Artist>) => {
        state.loading = false;
        state.artists.push(action.payload);
      })
      .addCase(createArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // updateArtist
      .addCase(updateArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArtist.fulfilled, (state, action: PayloadAction<Artist>) => {
        state.loading = false;
        state.currentArtist = action.payload;
        state.artists = state.artists.map((artist) => 
          artist._id === action.payload._id ? action.payload : artist
        );
      })
      .addCase(updateArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // deleteArtist
      .addCase(deleteArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteArtist.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.artists = state.artists.filter((artist) => artist._id !== action.payload);
        if (state.currentArtist && state.currentArtist._id === action.payload) {
          state.currentArtist = null;
        }
      })
      .addCase(deleteArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentArtist, clearArtistData } = artistSlice.actions;
export default artistSlice.reducer; 