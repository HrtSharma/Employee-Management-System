import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { EventAvailable, EmojiEvents, PeopleAlt, Quiz, TrendingUp, Add, Edit, Delete } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const typeConfig = {
  Challenge: { icon: <EmojiEvents />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  Event: { icon: <EventAvailable />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  Survey: { icon: <Quiz />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const emptyForm = { title: '', type: 'Challenge', participants: '' };

export default function ActivitiesPage() {
  const theme = useTheme();
  const { activities, addActivity, updateActivity, deleteActivity } = useAppContext();

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ===== Form handlers =====

  const openAdd = () => {
    setEditingActivity(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (activity) => {
    setEditingActivity(activity);
    setForm({ title: activity.title, type: activity.type, participants: String(activity.participants) });
    setFormError('');
    setFormOpen(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError('Please provide a title for the activity.');
      return;
    }
    const participants = Number(form.participants);
    if (form.participants === '' || Number.isNaN(participants) || participants < 0) {
      setFormError('Please provide a valid number of participants.');
      return;
    }

    setSaving(true);
    const payload = { title: form.title.trim(), type: form.type, participants };
    if (editingActivity) {
      const result = await updateActivity(editingActivity.id, payload);
      if (result.success) {
        showSnackbar('Activity updated successfully.');
        setFormOpen(false);
      } else {
        showSnackbar(result.message, 'error');
      }
    } else {
      const result = await addActivity(payload);
      if (result.success) {
        showSnackbar('Activity added successfully.');
        setFormOpen(false);
      } else {
        showSnackbar(result.message, 'error');
      }
    }
    setSaving(false);
  };

  // ===== Delete handlers =====

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const result = await deleteActivity(deleteTarget.id);
    if (result.success) {
      showSnackbar('Activity deleted successfully.');
      setDeleteTarget(null);
    } else {
      showSnackbar(result.message, 'error');
      setDeleteTarget(null);
    }
    setDeleteLoading(false);
  };

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Team Activities</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Discover challenges, events, and ways to get involved.</Typography>
        </Box>
        <Button
          variant="contained"
          className="btn-glow"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{ borderRadius: 3, px: 3, py: 1.2, whiteSpace: 'nowrap' }}
        >
          New Activity
        </Button>
      </Box>

      {activities.length === 0 ? (
        <Paper className="card-surface" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>No activities yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Create your first team activity to get things started.</Typography>
          <Button variant="contained" className="btn-glow" startIcon={<Add />} onClick={openAdd} sx={{ mt: 3, borderRadius: 3 }}>
            Add your first activity
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {activities.map((activity, index) => {
            const config = typeConfig[activity.type] || { icon: <TrendingUp />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
            return (
              <Grid item xs={12} md={4} key={activity.id} className={`animate-fade-up animation-delay-${index + 1}`}>
                <Paper className="card-surface card-clickable" sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: config.bg, color: config.color, fontSize: 22 }}>
                      {config.icon}
                    </Box>
                    <Chip label={activity.type} size="small" sx={{ fontWeight: 700, bgcolor: config.bg, color: config.color, borderRadius: 2 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{activity.title}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
                    <PeopleAlt fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary"><strong style={{ color: theme.palette.text.primary }}>{activity.participants}</strong> participants</Typography>
                  </Stack>
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => openEdit(activity)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Edit
                        </Button>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => setDeleteTarget(activity)}
                          sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
{/* Add/Edit Activity Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingActivity ? 'Edit Activity' : 'New Activity'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title *"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="e.g. Quarterly hackathon"
              fullWidth
            />
            <TextField select label="Type" value={form.type} onChange={handleChange('type')} fullWidth>
              {Object.keys(typeConfig).map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Participants *"
              type="number"
              inputProps={{ min: 0 }}
              value={form.participants}
              onChange={handleChange('participants')}
              placeholder="e.g. 25"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingActivity ? 'Save Changes' : 'Add Activity'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Activity</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}