import React from 'react';
import { Box, Typography } from '@mui/material';

const CommentManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Comment Management
      </Typography>
      <Typography variant="body1">
        Admin comment management functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default CommentManagement; 