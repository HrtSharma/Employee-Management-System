import { useState } from 'react';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(`A reset link has been sent to ${email || 'your inbox'}.`);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, background: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 100%)' }}>
      <Paper elevation={6} sx={{ width: '100%', maxWidth: 450, p: 4, borderRadius: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Reset password</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Enter your email and we will send a recovery link.</Typography>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="Email Address" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2 }}>Send reset link</Button>
        </Box>
        <Typography sx={{ mt: 2 }}><Link to="/login">Back to login</Link></Typography>
      </Paper>
    </Box>
  );
}
