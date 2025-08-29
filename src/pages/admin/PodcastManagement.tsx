import React from 'react';
import { Box, Typography } from '@mui/material';

const PodcastManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Podcast Management
      </Typography>
      <Typography variant="body1">
        Admin podcast management functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default PodcastManagement; 