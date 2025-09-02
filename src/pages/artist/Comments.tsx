import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Avatar
} from '@mui/material';
import {
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Chat as MessageIcon,
  TrendingUp as TrendingIcon,
  Warning as AlertIcon
} from '@mui/icons-material';
import { commentService } from '../../services/commentService';
import { Comment } from '../../types';
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
      id={`comment-tabpanel-${index}`}
      aria-labelledby={`comment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getArtistComments('current-artist-id');
      if (response.data && Array.isArray(response.data.data)) {
        setComments(response.data.data as Comment[]);
      } else if (response.data && (response.data as any).data) {
        setComments((response.data as any).data as Comment[]);
      } else {
        setComments([]);
      }
    } catch (error) {
      toast.error('Failed to load comments');
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReply = async () => {
    if (!selectedComment || !replyText.trim()) return;

    try {
      await commentService.createComment({
        content: replyText,
        parentComment: selectedComment._id
      });
      toast.success('Reply posted successfully');
      setReplyDialog(false);
      setReplyText('');
      setSelectedComment(null);
      loadComments();
    } catch (error) {
      toast.error('Failed to post reply');
      console.error('Error posting reply:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentService.deleteComment(commentId);
        toast.success('Comment deleted successfully');
        loadComments();
      } catch (error) {
        toast.error('Failed to delete comment');
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleModerateComment = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      await commentService.moderateComment(commentId, action);
      toast.success(`Comment ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      loadComments();
    } catch (error) {
      toast.error(`Failed to ${action} comment`);
      console.error(`Error ${action}ing comment:`, error);
    }
  };

  const handleToggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const filteredComments = comments.filter(comment => {
    switch (tabValue) {
      case 0: // All comments
        return true;
      case 1: // Pending moderation
        return comment.moderationStatus === 'pending';
      case 2: // Approved
        return comment.moderationStatus === 'approved';
      case 3: // Rejected
        return comment.moderationStatus === 'rejected';
      default:
        return true;
    }
  });

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
              Comments Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Moderate and manage user comments on your content
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mt: 2 }}>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            textAlign: 'center'
          }}>
            <MessageIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
              {comments.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Comments
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 163, 74, 0.1) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            textAlign: 'center'
          }}>
            <ApproveIcon sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
              {comments.filter(c => c.moderationStatus === 'approved').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            textAlign: 'center'
          }}>
            <AlertIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
              {comments.filter(c => c.moderationStatus === 'pending').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Box>
          <Box sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.2)',
            textAlign: 'center'
          }}>
            <TrendingIcon sx={{ fontSize: 40, color: '#ec4899', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ec4899' }}>
              {comments.reduce((sum, c) => sum + c.likes, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Likes
            </Typography>
          </Box>
        </Box>
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
          <Tab label="All Comments" />
          <Tab 
            label={
              <Badge badgeContent={comments.filter(c => c.moderationStatus === 'pending').length} color="warning">
                Pending
              </Badge>
            } 
          />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden'
        }}>
          <List>
            {filteredComments.map((comment) => (
              <React.Fragment key={comment._id}>
                <ListItem alignItems="flex-start" sx={{ p: 3 }}>
                  <ListItemAvatar>
                    <Avatar sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}>
                      {typeof comment.user === 'string' ? comment.user.charAt(0) : comment.user.firstName?.charAt(0) || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {typeof comment.user === 'string' ? 'User' : `${comment.user.firstName} ${comment.user.lastName}`}
                        </Typography>
                        <Chip
                          label={comment.moderationStatus}
                          color={getStatusColor(comment.moderationStatus)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        {comment.isEdited && (
                          <Chip label="Edited" size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.primary" gutterBottom sx={{ mb: 1 }}>
                          {comment.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {formatDate(comment.createdAt)} • {comment.likes} likes
                        </Typography>
                        {comment.replies.length > 0 && (
                          <Button
                            size="small"
                            startIcon={expandedComments.has(comment._id) ? <CollapseIcon /> : <ExpandIcon />}
                            onClick={() => handleToggleExpanded(comment._id)}
                            sx={{
                              color: '#667eea',
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            {comment.replies.length} replies
                          </Button>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedComment(comment);
                        setReplyDialog(true);
                      }}
                      sx={{ color: '#667eea', mr: 1 }}
                    >
                      <ReplyIcon />
                    </IconButton>
                    {comment.moderationStatus === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleModerateComment(comment._id, 'approve')}
                          sx={{ mr: 1 }}
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleModerateComment(comment._id, 'reject')}
                          sx={{ mr: 1 }}
                        >
                          <RejectIcon />
                        </IconButton>
                      </>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {expandedComments.has(comment._id) && comment.replies.length > 0 && (
                  <Box sx={{ ml: 4 }}>
                    {comment.replies.map((reply) => (
                      <ListItem key={reply._id} alignItems="flex-start" sx={{ pl: 6, pr: 3 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            fontSize: '0.875rem'
                          }}>
                            {typeof reply.user === 'string' ? reply.user.charAt(0) : reply.user.firstName?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {typeof reply.user === 'string' ? 'User' : `${reply.user.firstName} ${reply.user.lastName}`}
                              </Typography>
                              <Chip
                                label={reply.moderationStatus}
                                color={getStatusColor(reply.moderationStatus)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                                {reply.content}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(reply.createdAt)} • {reply.likes} likes
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          {reply.moderationStatus === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleModerateComment(reply._id, 'approve')}
                                sx={{ mr: 1 }}
                              >
                                <ApproveIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleModerateComment(reply._id, 'reject')}
                                sx={{ mr: 1 }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteComment(reply._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </Box>
                )}
                <Divider component="li" sx={{ mx: 3 }} />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden'
        }}>
          <List>
            {filteredComments.map((comment) => (
              <ListItem key={comment._id} alignItems="flex-start" sx={{ p: 3 }}>
                <ListItemAvatar>
                  <Avatar sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white'
                  }}>
                    {typeof comment.user === 'string' ? comment.user.charAt(0) : comment.user.firstName?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {typeof comment.user === 'string' ? 'User' : `${comment.user.firstName} ${comment.user.lastName}`}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.primary" gutterBottom sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleModerateComment(comment._id, 'approve')}
                    sx={{ mr: 1 }}
                  >
                    <ApproveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleModerateComment(comment._id, 'reject')}
                    sx={{ mr: 1 }}
                  >
                    <RejectIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden'
        }}>
          <List>
            {filteredComments.map((comment) => (
              <ListItem key={comment._id} alignItems="flex-start" sx={{ p: 3 }}>
                <ListItemAvatar>
                  <Avatar sx={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white'
                  }}>
                    {typeof comment.user === 'string' ? comment.user.charAt(0) : comment.user.firstName?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {typeof comment.user === 'string' ? 'User' : `${comment.user.firstName} ${comment.user.lastName}`}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.primary" gutterBottom sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)} • {comment.likes} likes
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden'
        }}>
          <List>
            {filteredComments.map((comment) => (
              <ListItem key={comment._id} alignItems="flex-start" sx={{ p: 3 }}>
                <ListItemAvatar>
                  <Avatar sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white'
                  }}>
                    {typeof comment.user === 'string' ? comment.user.charAt(0) : comment.user.firstName?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {typeof comment.user === 'string' ? 'User' : `${comment.user.firstName} ${comment.user.lastName}`}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.primary" gutterBottom sx={{ mb: 1 }}>
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleModerateComment(comment._id, 'approve')}
                    sx={{ mr: 1 }}
                  >
                    <ApproveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </TabPanel>

      {/* Reply Dialog */}
      <Dialog 
        open={replyDialog} 
        onClose={() => setReplyDialog(false)} 
        maxWidth="sm" 
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
          Reply to Comment
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setReplyDialog(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReply}
            variant="contained"
            disabled={!replyText.trim()}
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
            Post Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Comments; 