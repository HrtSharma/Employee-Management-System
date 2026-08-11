import { useEffect, useRef, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Close, Add, CloudUpload, Person } from '@mui/icons-material';
import { MAX_FILE_SIZE, processImageFile } from '../utils/imageUtils';

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
  photo: null,
};

export default function EmployeeFormModal({ open, onClose, employee, onSave }) {
  const isEdit = Boolean(employee);
  // The modal stays mounted while `open` toggles, so initialise to empty and keep
  // the form in sync with the employee being added/edited via the effect below.
  const [form, setForm] = useState(emptyForm);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const photoInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Reset/sync the form whenever the modal opens so switching between Add and
  // Edit (or between two different employees) never shows stale data.
  useEffect(() => {
    if (open) {
      setForm(employee ? { ...employee, skills: [...(employee.skills || [])] } : { ...emptyForm });
      setSkillInput('');
      setError('');
      setUploading(false);
    }
  }, [open, employee]);

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

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError('The selected image is larger than 5 MB. Please choose a smaller photo.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const dataUrl = await processImageFile(file);
      setForm((prev) => ({ ...prev, photo: dataUrl }));
    } catch {
      setError('Could not read that file as an image. Please choose a PNG, JPG, GIF or WEBP photo.');
    } finally {
      setUploading(false);
    }
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
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Profile Photo</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <input ref={photoInputRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              <Avatar
                src={form.photo || undefined}
                sx={{ width: 52, height: 52, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', fontWeight: 700, fontSize: 20, border: '1px solid rgba(99, 102, 241, 0.3)' }}
              >
                {form.name ? form.name.charAt(0).toUpperCase() : <Person fontSize="small" />}
              </Avatar>
              <Button size="small" variant="outlined" startIcon={<CloudUpload />} onClick={() => photoInputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Processing...' : 'Upload Photo'}
              </Button>
              {form.photo && (
                <Button size="small" color="inherit" onClick={() => setForm((prev) => ({ ...prev, photo: null }))}>
                  Remove
                </Button>
              )}
            </Stack>
          </Box>

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