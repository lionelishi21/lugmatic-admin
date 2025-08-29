import React from 'react';
import { Box, Typography } from '@mui/material';

const ContentModeration: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Content Moderation
      </Typography>
      <Typography variant="body1">
        Admin content moderation functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default ContentModeration; 