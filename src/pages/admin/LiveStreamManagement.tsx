import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Stream {
  id: number;
  artist: string;
  title: string;
  scheduledDate: string;
  status: 'pending' | 'approved' | 'rejected';
  quality: string;
  viewers: number;
  revenue: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`livestream-tabpanel-${index}`}
      aria-labelledby={`livestream-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LiveStreamManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (stream?: Stream) => {
    setSelectedStream(stream || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStream(null);
  };

  // Mock data - replace with actual API calls
  const streams: Stream[] = [
    {
      id: 1,
      artist: 'John Doe',
      title: 'Summer Concert 2024',
      scheduledDate: '2024-06-15 20:00',
      status: 'pending',
      quality: '1080p',
      viewers: 0,
      revenue: 0,
    },
    // Add more mock data as needed
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Live Stream Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Stream Scheduling" />
          <Tab label="Technical Monitoring" />
          <Tab label="Content Moderation" />
          <Tab label="Analytics" />
          <Tab label="Monetization" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Schedule New Stream
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Artist</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {streams.map((stream) => (
                <TableRow key={stream.id}>
                  <TableCell>{stream.artist}</TableCell>
                  <TableCell>{stream.title}</TableCell>
                  <TableCell>{stream.scheduledDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={stream.status}
                      color={stream.status === 'pending' ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(stream)}>
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
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Stream Quality Monitoring
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stream</TableCell>
                <TableCell>Quality</TableCell>
                <TableCell>Bitrate</TableCell>
                <TableCell>Latency</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Add quality monitoring data */}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Content Moderation
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stream</TableCell>
                <TableCell>Reported Issues</TableCell>
                <TableCell>Moderation Actions</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Add moderation data */}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Stream Analytics
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stream</TableCell>
                <TableCell>Viewers</TableCell>
                <TableCell>Peak Viewers</TableCell>
                <TableCell>Average Watch Time</TableCell>
                <TableCell>Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Add analytics data */}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          Monetization Settings
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Stream</TableCell>
                <TableCell>Subscription Price</TableCell>
                <TableCell>Gift Settings</TableCell>
                <TableCell>Revenue Share</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Add monetization data */}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStream ? 'Edit Stream' : 'Schedule New Stream'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Stream Title"
              fullWidth
              defaultValue={selectedStream?.title}
            />
            <FormControl fullWidth>
              <InputLabel>Artist</InputLabel>
              <Select defaultValue={selectedStream?.artist}>
                <MenuItem value="John Doe">John Doe</MenuItem>
                <MenuItem value="Jane Smith">Jane Smith</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Scheduled Date"
              type="datetime-local"
              fullWidth
              defaultValue={selectedStream?.scheduledDate}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select defaultValue={selectedStream?.status || 'pending'}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            {selectedStream ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LiveStreamManagement; 