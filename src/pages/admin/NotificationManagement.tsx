import React from 'react';
import { Box, Typography } from '@mui/material';

const NotificationManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Notification Management
      </Typography>
      <Typography variant="body1">
        Admin notification management functionality will be implemented here.
      </Typography>
    </Box>
  );
};

export default NotificationManagement; 