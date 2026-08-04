import { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography, useTheme } from '@mui/material';
import { Psychology, ArrowBack, MailOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(`A reset link has been sent to ${email || 'your inbox'}.`);
    setSent(true);
  };

  return (
    <Box className="auth-background" sx={{ minHeight: '100vh', p: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 460 }} className="animate-scale-in">
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)' }}>
            <Psychology sx={{ color: '#fff', fontSize: 30 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Reset password</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Enter your email and we will send a recovery link.</Typography>
        </Box>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(17,24,39,0.8)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
          {message && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{message}</Alert>}
          {sent && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }} icon={<MailOutline fontSize="small" />}>
              Please check your inbox and follow the link to reset your password.
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email Address" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Button fullWidth type="submit" variant="contained" size="large" className="btn-glow" sx={{ mt: 2 }}>
              Send reset link
            </Button>
          </Box>
          <Link to="/login" style={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 4, mt: 3 }}>
            <ArrowBack fontSize="small" /> Back to login
          </Link>
        </Paper>
      </Box>
    </Box>
  );
}