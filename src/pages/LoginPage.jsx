import { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Google, Microsoft } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      setSuccess('Welcome back! Redirecting to your dashboard.');
      setTimeout(() => navigate('/dashboard'), 600);
    } else {
      setError(result.message);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid item xs={12} md={7} className="hero-panel" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', p: 6 }}>
        <Box sx={{ color: 'white', maxWidth: 500 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>Welcome to EngageHub</Typography>
          <Typography variant="h6">A modern employee engagement experience for culture, recognition, and growth.</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, background: 'rgba(248,250,252,0.9)' }}>
        <Paper elevation={6} sx={{ width: '100%', maxWidth: 430, p: { xs: 3, md: 4 }, borderRadius: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Sign in</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Access your employee experience dashboard</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email Address" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField fullWidth label="Password" margin="normal" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 2 }}>
              <FormControlLabel control={<Checkbox />} label="Remember me" />
              <Link to="/forgot-password">Forgot password?</Link>
            </Stack>
            <Button type="submit" fullWidth variant="contained" size="large">Login</Button>
          </Box>
          <Typography sx={{ my: 2, textAlign: 'center' }}>or continue with</Typography>
          <Stack direction="row" spacing={2}>
            <Button fullWidth variant="outlined" startIcon={<Google />}>Google</Button>
            <Button fullWidth variant="outlined" startIcon={<Microsoft />}>Microsoft</Button>
          </Stack>
          <Typography sx={{ mt: 3, textAlign: 'center' }}>New employee? <Link to="/signup">Create account</Link></Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
