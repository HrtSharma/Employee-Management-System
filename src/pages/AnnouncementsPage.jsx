import { useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Grid, MenuItem, Paper, Snackbar, Stack,
  TextField, Typography, useTheme,
} from '@mui/material';
import { Campaign, Schedule, ThumbUpAlt, ChatBubbleOutline, Add, Edit, Delete } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

const authors = ['Daniel Kim', 'Ava Patel', 'HR Team'];

const emptyForm = { author: authors[0], title: '', body: '' };

export default function AnnouncementsPage() {
  const theme = useTheme();
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAppContext();

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
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
    setEditingAnnouncement(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditingAnnouncement(item);
    setForm({ author: item.author || authors[0], title: item.title, body: item.body });
    setFormError('');
    setFormOpen(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError('Please provide an announcement title.');
      return;
    }
    if (!form.body.trim()) {
      setFormError('Please provide announcement content.');
      return;
    }

    setSaving(true);
    const payload = {
      author: form.author,
      title: form.title.trim(),
      body: form.body.trim(),
      time: editingAnnouncement ? editingAnnouncement.time : 'Just now',
    };
    if (editingAnnouncement) {
      const result = await updateAnnouncement(editingAnnouncement.id, payload);
      if (result.success) {
        showSnackbar('Announcement updated successfully.');
        setFormOpen(false);
      } else {
        showSnackbar(result.message, 'error');
      }
    } else {
      const result = await addAnnouncement(payload);
      if (result.success) {
        showSnackbar('Announcement added successfully.');
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
    const result = await deleteAnnouncement(deleteTarget.id);
    if (result.success) {
      showSnackbar('Announcement deleted successfully.');
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Announcements</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Stay up to date with company news and updates.</Typography>
        </Box>
        <Button
          variant="contained"
          className="btn-glow"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{ borderRadius: 3, px: 3, py: 1.2, whiteSpace: 'nowrap' }}
        >
          New Announcement
        </Button>
      </Box>

      {announcements.length === 0 ? (
        <Paper className="card-surface" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>No announcements yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Post your first company announcement to get things started.</Typography>
          <Button variant="contained" className="btn-glow" startIcon={<Add />} onClick={openAdd} sx={{ mt: 3, borderRadius: 3 }}>
            Add your first announcement
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {announcements.map((announcement, index) => {
            const author = announcement.author || authors[index % authors.length];
            return (
              <Grid item xs={12} md={6} key={announcement.id} className={`animate-fade-up animation-delay-${index + 1}`}>
                <Paper className="card-surface card-clickable" sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar className="avatar-ring" sx={{ width: 44, height: 44, background: getGradient(author), fontWeight: 800, fontSize: 16 }}>
                      {author.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{author}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Schedule sx={{ fontSize: 13 }} /> {announcement.time}
                      </Typography>
                    </Box>
                    <Chip label="New" color="primary" size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />
                  </Stack>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', color: 'primary.main' }}>
                        <Campaign sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{announcement.title}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => openEdit(announcement)} sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}><Edit fontSize="small" /></Button>
                      <Button size="small" color="error" onClick={() => setDeleteTarget(announcement)} sx={{ minWidth: 0, p: 0.5 }}><Delete fontSize="small" /></Button>
                    </Stack>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>{announcement.body}</Typography>
                  <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <ThumbUpAlt sx={{ fontSize: 18 }} />
                      <Typography variant="caption">{24 + index * 7}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <ChatBubbleOutline sx={{ fontSize: 18 }} />
                      <Typography variant="caption">{4 + index * 3}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Announcement Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Author" value={form.author} onChange={handleChange('author')} fullWidth>
              {authors.map((author) => (
                <MenuItem key={author} value={author}>{author}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Title *"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="e.g. Office reopening dates"
              fullWidth
            />
            <TextField
              label="Message *"
              value={form.body}
              onChange={handleChange('body')}
              placeholder="Write the announcement content..."
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingAnnouncement ? 'Save Changes' : 'Add Announcement'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Announcement</DialogTitle>
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

