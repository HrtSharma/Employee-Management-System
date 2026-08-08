import { useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Close, Add } from '@mui/icons-material';

const departments = ['Engineering', 'Design', 'People Operations', 'Sales', 'Marketing'];
const statuses = ['Active', 'Remote', 'On Leave', 'Inactive'];
const designations = ['Software Engineer', 'Senior Frontend Engineer', 'Product Designer', 'HR Business Partner', 'Account Executive', 'Growth Manager', 'Backend Engineer', 'Data Analyst'];

const emptyForm = {
  name: '',
  department: '',
  designation: '',
  email: '',
  location: '',
  skills: [],
  experience: '',
  status: 'Active',
  satisfaction: 85,
};

export default function EmployeeFormModal({ open, onClose, employee, onSave }) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState(employee ? { ...employee, skills: [...employee.skills] } : { ...emptyForm });
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm({ ...form, skills: [...form.skills, skill] });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skillToRemove) });
  };

  const handleSubmit = async () => {
    setError('');
    // Validation
    if (!form.name || !form.department || !form.designation || !form.email || !form.location || !form.experience) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setSaving(true);
    const result = await onSave(form);
    setSaving(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'An error occurred while saving.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Stack spacing={2}>
          <TextField fullWidth label="Full Name *" value={form.name} onChange={handleChange('name')} placeholder="e.g. John Smith" />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select fullWidth label="Department *" value={form.department} onChange={handleChange('department')}>
              <MenuItem value="">Select department</MenuItem>
              {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Designation *" value={form.designation} onChange={handleChange('designation')}>
              <MenuItem value="">Select designation</MenuItem>
              {designations.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Stack>

          <TextField fullWidth label="Email Address *" value={form.email} onChange={handleChange('email')} placeholder="john@company.com" />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label="Location *" value={form.location} onChange={handleChange('location')} placeholder="e.g. New York, USA" />
            <TextField fullWidth label="Experience *" value={form.experience} onChange={handleChange('experience')} placeholder="e.g. 5 years" />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select fullWidth label="Status" value={form.status} onChange={handleChange('status')}>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField
              fullWidth
              label="Satisfaction Score"
              type="number"
              value={form.satisfaction}
              onChange={handleChange('satisfaction')}
              inputProps={{ min: 0, max: 100 }}
            />
          </Stack>

          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Skills</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button variant="outlined" onClick={handleAddSkill} startIcon={<Add />} sx={{ whiteSpace: 'nowrap' }}>
                Add
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {form.skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                  size="small"
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                />
              ))}
              {form.skills.length === 0 && (
                <Typography variant="caption" color="text.secondary">No skills added yet.</Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" className="btn-glow" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Employee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}