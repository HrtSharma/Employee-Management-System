import { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, LinearProgress, MenuItem, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Psychology, ArrowBack } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const departments = ['Engineering', 'Design', 'People Operations', 'Sales', 'Marketing'];
const roles = ['Software Engineer', 'Product Designer', 'HR Business Partner', 'Account Executive', 'Growth Manager'];

export default function SignupPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signup } = useAppContext();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', department: '', role: '', terms: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = form.password.length >= 8 ? 'Strong' : form.password.length >= 4 ? 'Medium' : 'Weak';
  const strengthColor = passwordStrength === 'Strong' ? 'success' : passwordStrength === 'Medium' ? 'warning' : 'error';
  const strengthValue = passwordStrength === 'Strong' ? 100 : passwordStrength === 'Medium' ? 60 : 30;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
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
    setLoading(true);
    const result = await signup({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, department: form.department, role: form.role });
    setLoading(false);
    if (result.success) {
      navigate('/login', {
        state: { success: 'Your account was created successfully. Please sign in to continue.' },
        replace: true,
      });
    } else {
      setError(result.message || 'Unable to create your account.');
    }
  };

  return (
    <Box className="auth-background" sx={{ minHeight: '100vh', p: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 720 }} className="animate-fade-up">
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}>
            <Psychology sx={{ color: '#fff', fontSize: 30 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Create your account</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Join the EngageHub employee experience platform</Typography>
        </Box>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(17,24,39,0.8)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>Personal Information</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField fullWidth label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <TextField fullWidth label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </Stack>
            <TextField fullWidth label="Email Address" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />

            <Typography variant="body2" sx={{ fontWeight: 700, my: 1.5, color: 'text.secondary' }}>Security</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField fullWidth label="Password" type="password" margin="normal" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
              <TextField fullWidth label="Confirm Password" type="password" margin="normal" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" />
            </Stack>
            {form.password && (
              <Box sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Password strength</Typography>
                  <Typography variant="caption" sx={{ color: `${strengthColor}.main`, fontWeight: 700 }}>{passwordStrength}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={strengthValue} color={strengthColor} sx={{ mt: 0.5, height: 6, borderRadius: 3 }} />
              </Box>
            )}

            <Typography variant="body2" sx={{ fontWeight: 700, my: 1.5, color: 'text.secondary' }}>Work Details</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField select fullWidth label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {departments.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Job Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {roles.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </TextField>
            </Stack>

            <FormControlLabel
              control={<Checkbox checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />}
              label={<Typography variant="body2">I agree to the terms and conditions</Typography>}
              sx={{ mt: 2 }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" className="btn-glow" disabled={loading} sx={{ mt: 2 }}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
            <Link to="/login" style={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowBack fontSize="small" /> Back to sign in
            </Link>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}