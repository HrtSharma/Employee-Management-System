import { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const departments = ['Engineering', 'Design', 'People Operations', 'Sales', 'Marketing'];
const roles = ['Software Engineer', 'Product Designer', 'HR Business Partner', 'Account Executive', 'Growth Manager'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAppContext();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', department: '', role: '', terms: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordStrength = form.password.length >= 8 ? 'Strong' : 'Weak';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword || !form.department || !form.role || !form.terms) {
      setError('Please complete every required field.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please provide a valid email address.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const result = await signup({ firstName: form.firstName, lastName: form.lastName, email: form.email, department: form.department, role: form.role });
    if (result.success) {
      setSuccess('Account created successfully.');
      setTimeout(() => navigate('/dashboard'), 600);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 700, p: { xs: 3, md: 5 }, borderRadius: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Create your account</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Join the EngageHub employee experience platform</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField fullWidth label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <TextField fullWidth label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Stack>
          <TextField fullWidth label="Email Address" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <TextField fullWidth label="Confirm Password" type="password" margin="normal" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </Stack>
          <Typography variant="body2" color={passwordStrength === 'Strong' ? 'success.main' : 'warning.main'} sx={{ mb: 2 }}>Password strength: {passwordStrength}</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField select fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {departments.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Job Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
          </Stack>
          <FormControlLabel control={<Checkbox checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />} label="I agree to the terms and conditions" />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2 }}>Create account</Button>
        </Box>
      </Paper>
    </Box>
  );
}
