import { useState } from 'react';
import {
  Alert, Avatar, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Grid, LinearProgress, MenuItem, Paper, Snackbar,
  Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { EmojiEvents, WorkspacePremium, Celebration, Stars, MilitaryTech, Add, Edit, Delete } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

const badgeList = ['Star Innovator', 'Impact Maker', 'Care Catalyst'];

const badgeIcons = {
  'Star Innovator': <Stars />,
  'Impact Maker': <MilitaryTech />,
  'Care Catalyst': <Celebration />,
};

const badgeColors = {
  'Star Innovator': '#6366f1',
  'Impact Maker': '#f59e0b',
  'Care Catalyst': '#10b981',
};

const emptyForm = { name: '', title: '', points: '', badge: badgeList[0] };

export default function RecognitionPage() {
  const theme = useTheme();
  const { recognitions, addRecognition, updateRecognition, deleteRecognition } = useAppContext();
  const maxPoints = Math.max(...recognitions.map((item) => item.points));

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecognition, setEditingRecognition] = useState(null);
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
    setEditingRecognition(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingRecognition(item);
    setForm({ name: item.name, title: item.title, points: String(item.points), badge: item.badge });
    setFormError('');
    setFormOpen(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Please provide the recipient name.');
      return;
    }
    if (!form.title.trim()) {
      setFormError('Please provide a recognition title.');
      return;
    }
    const points = Number(form.points);
    if (form.points === '' || Number.isNaN(points) || points < 0) {
      setFormError('Please provide a valid points value.');
      return;
    }

    setSaving(true);
    const payload = { name: form.name.trim(), title: form.title.trim(), points, badge: form.badge };
    if (editingRecognition) {
      const result = await updateRecognition(editingRecognition.id, payload);
      if (result.success) {
        showSnackbar('Recognition updated successfully.');
        setFormOpen(false);
      } else {
        showSnackbar(result.message, 'error');
      }
    } else {
      const result = await addRecognition(payload);
      if (result.success) {
        showSnackbar('Recognition added successfully.');
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
    const result = await deleteRecognition(deleteTarget.id);
    if (result.success) {
      showSnackbar('Recognition deleted successfully.');
    } else {
      showSnackbar(result.message, 'error');
    }
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Recognition Hub</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Celebrate wins and appreciate your teammates.</Typography>
        </Box>
        <Button
          variant="contained"
          className="btn-glow"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{ borderRadius: 3, px: 3, py: 1.2, whiteSpace: 'nowrap' }}
        >
          New Recognition
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Recognition feed */}
        <Grid item xs={12} md={7} className="animate-fade-up animation-delay-1">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
                <EmojiEvents fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recognition Feed</Typography>
            </Box>

            {recognitions.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `1px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)'}` }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>No recognitions yet</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Nominate a teammate to show appreciation.</Typography>
                <Button variant="contained" className="btn-glow" startIcon={<Add />} onClick={openAdd} sx={{ mt: 2, borderRadius: 3 }}>
                  Add your first recognition
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {recognitions.map((item, index) => (
                  <Card key={item.id} elevation={0} className={`animate-fade-up animation-delay-${index + 1}`} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`, p: 2, transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(99,102,241,0.12)' } }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar className="avatar-ring" sx={{ width: 48, height: 48, background: getGradient(item.name), fontWeight: 800, fontSize: 18 }}>
                        {item.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.title}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip label={item.points + ' pts'} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', borderRadius: 2 }} />
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={item.badge}
                        size="small"
                        icon={badgeIcons[item.badge]}
                        sx={{
                          fontWeight: 700,
                          color: badgeColors[item.badge] || '#6366f1',
                          border: `1px solid ${badgeColors[item.badge] || '#6366f1'}40`,
                          borderRadius: 2,
                        }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => openEdit(item)} sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}><Edit fontSize="small" /></Button>
                        <Button size="small" color="error" onClick={() => setDeleteTarget(item)} sx={{ minWidth: 0, p: 0.5 }}><Delete fontSize="small" /></Button>
                      </Stack>
                    </Box>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={5} className="animate-fade-up animation-delay-2">
          <Paper className="card-surface" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #f472b6)', color: '#fff' }}>
                <WorkspacePremium fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Leaderboard</Typography>
            </Box>
            {recognitions.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No recognitions to rank yet.</Typography>
            ) : (
              <Stack spacing={2.5}>
                {recognitions.map((item, index) => {
                  const medalColors = ['#f59e0b', '#94a3b8', '#d97706'];
                  const isTop = index < 3;
                  return (
                    <Box key={item.id}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: isTop ? '#fff' : 'text.secondary', bgcolor: isTop ? medalColors[index] : 'rgba(148,163,184,0.15)' }}>
                          {index + 1}
                        </Box>
                        <Avatar sx={{ width: 38, height: 38, background: getGradient(item.name), fontWeight: 700, fontSize: 14 }}>
                          {item.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.badge}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{item.points} pts</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={(item.points / maxPoints) * 100}
                        sx={{ mt: 1, ml: 7, height: 6, borderRadius: 3, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)', '& .MuiLinearProgress-bar': { background: isTop ? medalColors[index] : 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 3 } }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
            <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents sx={{ color: '#f59e0b', fontSize: 18 }} /> Keep it up!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Nominate a teammate to show appreciation.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Recognition Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingRecognition ? 'Edit Recognition' : 'New Recognition'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Recipient Name *"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Mina Chen"
              fullWidth
            />
            <TextField
              label="Recognition Title *"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="e.g. Design Excellence"
              fullWidth
            />
            <TextField
              label="Points *"
              type="number"
              inputProps={{ min: 0 }}
              value={form.points}
              onChange={handleChange('points')}
              placeholder="e.g. 120"
              fullWidth
            />
            <TextField select label="Badge" value={form.badge} onChange={handleChange('badge')} fullWidth>
              {badgeList.map((badge) => (
                <MenuItem key={badge} value={badge}>{badge}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingRecognition ? 'Save Changes' : 'Add Recognition'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Recognition</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove the recognition for <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
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

