import { useState } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Visibility, VisibilityOff, Google, Microsoft, Psychology, Groups, EmojiEvents, Quiz } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const features = [
  { icon: <Groups />, label: 'Team Directory' },
  { icon: <EmojiEvents />, label: 'Recognition' },
  { icon: <Quiz />, label: 'Pulse Surveys' },
];

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
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
        <Box sx={{ color: 'white', maxWidth: 560, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 3, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <Psychology sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>EngageHub</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2 }}>A modern employee engagement experience 🚀</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, lineHeight: 1.6 }}>
            Connect with your team, celebrate wins, and build a thriving workplace culture — all in one place.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ mt: 5, flexWrap: 'wrap', gap: 1.5 }}>
            {features.map((feature, index) => (
              <Box key={feature.label} className="hero-chip" sx={{ animationDelay: `${index * 0.6}s` }}>
                {feature.icon} {feature.label}
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={4} sx={{ mt: 6 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>112+</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Employees</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>89%</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Engagement</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>6+</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>Departments</Typography>
            </Box>
          </Stack>
        </Box>
      </Grid>
      <Grid item xs={12} md={5} className="auth-background" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 440, px: { xs: 2, sm: 4 } }} className="animate-scale-in">
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}>
              <Psychology sx={{ color: '#fff', fontSize: 30 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Welcome back 👋</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>Sign in to your employee experience dashboard</Typography>
          </Box>
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(17,24,39,0.8)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.08)', border: '1px dashed rgba(99, 102, 241, 0.3)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                💡 Demo: Use any email containing <strong>"admin"</strong> (e.g. admin@company.com) to access the Admin-only Salary Setup area.
              </Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField fullWidth label="Email Address" margin="normal" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
              <TextField
                fullWidth
                label="Password"
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 1.5 }}>
                <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">Remember me</Typography>} />
                <Link to="/forgot-password" style={{ color: theme.palette.primary.main, fontWeight: 600, fontSize: '0.88rem' }}>Forgot password?</Link>
              </Stack>
              <Button type="submit" fullWidth variant="contained" size="large" className="btn-glow" disabled={loading} sx={{ mt: 1 }}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ my: 2.5 }}>
              <Box sx={{ flexGrow: 1, height: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)' }} />
              <Typography variant="caption" color="text.secondary">or continue with</Typography>
              <Box sx={{ flexGrow: 1, height: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)' }} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button fullWidth variant="outlined" startIcon={<Google />} sx={{ py: 1.2 }}>Google</Button>
              <Button fullWidth variant="outlined" startIcon={<Microsoft />} sx={{ py: 1.2 }}>Microsoft</Button>
            </Stack>
            <Typography sx={{ mt: 3, textAlign: 'center', fontSize: '0.9rem' }}>
              New to EngageHub? <Link to="/signup" style={{ color: theme.palette.primary.main, fontWeight: 700 }}>Create account</Link>
            </Typography>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
}