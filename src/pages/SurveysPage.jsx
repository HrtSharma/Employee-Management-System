import { useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Grid, LinearProgress, Paper, Snackbar,
  Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { Mood, SentimentSatisfied, SentimentDissatisfied, Quiz, TrendingUp, EmojiEmotions, Add, Edit, Delete } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const moodOptions = [
  { label: 'Great', icon: <EmojiEmotions />, color: '#10b981' },
  { label: 'Okay', icon: <SentimentSatisfied />, color: '#f59e0b' },
  { label: 'Stressed', icon: <SentimentDissatisfied />, color: '#ef4444' },
];

const emptyForm = { label: '', score: '' };

export default function SurveysPage() {
  const theme = useTheme();
  const { surveys, addSurvey, updateSurvey, deleteSurvey } = useAppContext();
  const [selectedMood, setSelectedMood] = useState(null);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
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
    setEditingSurvey(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (survey) => {
    setEditingSurvey(survey);
    setForm({ label: survey.label, score: String(survey.score) });
    setFormError('');
    setFormOpen(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.label.trim()) {
      setFormError('Please provide a survey label.');
      return;
    }
    const score = Number(form.score);
    if (form.score === '' || Number.isNaN(score) || score < 0 || score > 100) {
      setFormError('Please provide a score between 0 and 100.');
      return;
    }

    setSaving(true);
    const payload = { label: form.label.trim(), score };
    if (editingSurvey) {
      const result = await updateSurvey(editingSurvey.id, payload);
      if (result.success) {
        showSnackbar('Survey updated successfully.');
        setFormOpen(false);
      } else {
        showSnackbar(result.message, 'error');
      }
    } else {
      const result = await addSurvey(payload);
      if (result.success) {
        showSnackbar('Survey added successfully.');
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
    const result = await deleteSurvey(deleteTarget.id);
    if (result.success) {
      showSnackbar('Survey deleted successfully.');
    } else {
      showSnackbar(result.message, 'error');
    }
    setDeleteTarget(null);
    setDeleteLoading(false);
  };

  const overallAverage = surveys.length
    ? Math.round(surveys.reduce((sum, s) => sum + s.score, 0) / surveys.length)
    : 0;

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Pulse Survey</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Share how you're feeling and help shape the workplace.</Typography>
        </Box>
        <Button
          variant="contained"
          className="btn-glow"
          startIcon={<Add />}
          onClick={openAdd}
          sx={{ borderRadius: 3, px: 3, py: 1.2, whiteSpace: 'nowrap' }}
        >
          New Survey
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-1">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: '#fff' }}>
                <Mood fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Daily Mood Check-in</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>How are you feeling today?</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              {moodOptions.map((option) => (
                <Box
                  key={option.label}
                  onClick={() => setSelectedMood(option.label)}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: `2px solid ${selectedMood === option.label ? option.color : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
                    background: selectedMood === option.label ? `${option.color}15` : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' },
                  }}
                >
                  <Box sx={{ color: option.color, fontSize: 32, mb: 0.5 }}>{option.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{option.label}</Typography>
                </Box>
              ))}
            </Stack>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Employee Happiness Score</Typography>
                <Chip label="84%" color="success" size="small" sx={{ fontWeight: 800 }} />
              </Box>
              <LinearProgress variant="determinate" value={84} sx={{ height: 10, borderRadius: 5, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 5 } }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {selectedMood ? `Thanks for sharing! You're feeling ${selectedMood.toLowerCase()} today.` : 'Tap a mood above to check in.'}
              </Typography>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-2">
          <Paper className="card-surface" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
                <Quiz fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Survey Results</Typography>
            </Box>

            {surveys.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `1px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)'}` }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>No surveys yet</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>Add your first survey to start tracking engagement.</Typography>
                <Button variant="contained" className="btn-glow" startIcon={<Add />} onClick={openAdd} sx={{ mt: 2, borderRadius: 3 }}>
                  Add your first survey
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2.5}>
                {surveys.map((item, index) => (
                  <Box key={item.id} className={`animate-fade-up animation-delay-${index + 1}`}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 800, color: item.score >= 85 ? 'success.main' : item.score >= 80 ? 'warning.main' : 'error.main' }}>{item.score}%</Typography>
                        <Button size="small" onClick={() => openEdit(item)} sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}><Edit fontSize="small" /></Button>
                        <Button size="small" color="error" onClick={() => setDeleteTarget(item)} sx={{ minWidth: 0, p: 0.5 }}><Delete fontSize="small" /></Button>
                      </Stack>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.score}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)',
                        '& .MuiLinearProgress-bar': {
                          background: item.score >= 85 ? 'linear-gradient(90deg, #10b981, #34d399)' : item.score >= 80 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)',
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.08))', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#10b981', fontSize: 18 }} /> Overall: {overallAverage}% positive
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Recognition and wellbeing scores are trending up this quarter. Keep it up!
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Add/Edit Survey Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingSurvey ? 'Edit Survey' : 'New Survey'}
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Survey Label *"
              value={form.label}
              onChange={handleChange('label')}
              placeholder="e.g. Collaboration"
              fullWidth
            />
            <TextField
              label="Score (%) *"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={form.score}
              onChange={handleChange('score')}
              placeholder="e.g. 85"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setFormOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : editingSurvey ? 'Save Changes' : 'Add Survey'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Survey</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.label}</strong>? This action cannot be undone.
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

