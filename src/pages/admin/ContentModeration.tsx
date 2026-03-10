import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  TextField,
  Pagination,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  PlayCircle as PlayIcon,
  Report as FlagIcon,
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';

interface ModerationItem {
  _id: string;
  name?: string;
  title?: string;
  content?: string;
  artist?: string | { name: string };
  author?: { firstName: string; lastName: string; profilePicture?: string };
  coverArt?: string;
  coverImage?: string;
  isApproved?: boolean;
  isFlagged?: boolean;
  createdAt: string;
}

const ContentModeration: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const tabConfigs = [
    { label: 'Songs', type: 'songs' },
    { label: 'Albums', type: 'albums' },
    { label: 'Podcasts', type: 'podcasts' },
    { label: 'Comments', type: 'comments' },
  ];

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const contentType = tabConfigs[activeTab].type;
      const response = await adminService.getContentForModeration(contentType, page, 12);

      if (response.data.success && response.data.data) {
        setItems(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.pages);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch content');
      }
    } catch (err: any) {
      console.error('Error fetching moderation content:', err);
      setError(err.message || 'An error occurred while fetching content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeTab, page]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1); // Reset to page 1 when switching tabs
  };

  const handleAction = async (itemId: string, action: 'approve' | 'reject' | 'delete', reason?: string) => {
    try {
      const contentType = tabConfigs[activeTab].type;
      const response = await adminService.moderateContent(contentType, itemId, action, reason);

      if (response.data.success) {
        showSnackbar(`Content successfully ${action}d`, 'success');
        // Remove item from UI
        setItems((prev) => prev.filter((item) => item._id !== itemId));
      } else {
        throw new Error(response.data.message || `Failed to ${action} content`);
      }
    } catch (err: any) {
      console.error(`Error moderating content:`, err);
      showSnackbar(err.message || 'An error occurred', 'error');
    }
  };

  const openRejectDialog = (item: ModerationItem) => {
    setSelectedItem(item);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedItem) {
      handleAction(selectedItem._id, 'reject', rejectReason);
    }
    setRejectDialogOpen(false);
  };

  const renderItemCard = (item: ModerationItem) => {
    const isComment = tabConfigs[activeTab].type === 'comments';
    const title = item.title || item.name || (isComment ? 'Comment' : 'Unknown');
    const image = item.coverArt || item.coverImage;
    const subtitle = isComment
      ? `${item.author?.firstName || 'Unknown'} ${item.author?.lastName || ''}`
      : (typeof item.artist === 'object' ? item.artist?.name : item.artist) || 'Unknown Artist';

    return (
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item._id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {isComment && item.isFlagged && (
            <Chip
              icon={<FlagIcon />}
              label="Flagged"
              color="error"
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
            />
          )}

          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Avatar
              src={isComment ? item.author?.profilePicture : image}
              variant={isComment ? "circular" : "rounded"}
              sx={{ width: 56, height: 56 }}
            >
              {!image && !isComment && <PlayIcon />}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle1" noWrap title={title}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ flexGrow: 1 }}>
            {isComment && (
              <Typography variant="body2" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                "{item.content}"
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Submitted: {new Date(item.createdAt).toLocaleDateString()}
            </Typography>
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
            <Button
              size="small"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={() => handleAction(item._id, 'approve')}
            >
              Approve
            </Button>
            <Box>
              <IconButton
                size="small"
                color="warning"
                title="Reject"
                onClick={() => openRejectDialog(item)}
              >
                <RejectIcon />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                title="Delete"
                onClick={() => handleAction(item._id, 'delete')}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Content Moderation
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Review and manage pending uploads and flagged content across the platform.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="moderation tabs">
          {tabConfigs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 5, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">
                No pending {tabConfigs[activeTab].label.toLowerCase()} to review.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {items.map(renderItemCard)}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, v) => setPage(v)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Content</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this {tabConfigs[activeTab].label.slice(0, -1).toLowerCase()}.
            This will keep the item in the database as rejected.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} color="warning" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContentModeration;