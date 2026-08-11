import { useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, Grid, IconButton, LinearProgress, Paper, Snackbar, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Email, Badge, WorkOutline, LocationOn, Star, ThumbUp, EmojiEvents, Psychology, PhotoCamera } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import AvatarUploadModal from '../components/AvatarUploadModal';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

export default function ProfilePage() {
  const theme = useTheme();
  const { auth, updateProfilePhoto } = useAppContext();
  const user = auth.user || { name: 'Ava Patel', email: 'ava.patel@company.com', role: 'HR Lead' };

  // Profile photo upload state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const displayName = user.name || 'Ava Patel';
  const profilePhoto = user.photo || null;

  const profileStats = [
    { label: 'Recognitions', value: '12', icon: <EmojiEvents />, color: '#f59e0b' },
    { label: 'Surveys Answered', value: '28', icon: <ThumbUp />, color: '#10b981' },
    { label: 'Impact Points', value: '1,240', icon: <Star />, color: '#6366f1' },
  ];

  const skills = [
    { name: 'Leadership', level: 92 },
    { name: 'Design Systems', level: 85 },
    { name: 'Cross-team Collaboration', level: 88 },
    { name: 'Strategic Planning', level: 90 },
  ];

  const initials = (name = 'A') => name.split(' ').map((n) => n.charAt(0)).slice(0, 2).join('').toUpperCase();

  const handlePhotoSave = async (photo) => {
    const result = await updateProfilePhoto(photo);
    setSnackbar({
      open: true,
      message: result.success ? 'Profile photo updated successfully.' : (result.message || 'Failed to update your profile photo.'),
      severity: result.success ? 'success' : 'error',
    });
    return result;
  };

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>My Profile</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage your personal and professional information.</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile card */}
        <Grid item xs={12} md={4} className="animate-fade-up animation-delay-1">
          <Paper className="card-surface" sx={{ p: 4, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, background: getGradient(user.name || 'Ava Patel') }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Tooltip title="Click to update your profile photo" arrow>
                <Box
                  onClick={() => setPhotoModalOpen(true)}
                  sx={{ position: 'relative', width: 96, height: 96, mx: 'auto', cursor: 'pointer' }}
                >
                  <Avatar
                    src={profilePhoto || undefined}
                    sx={{ width: 96, height: 96, background: getGradient(displayName), fontSize: 34, fontWeight: 800, border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'transform 0.2s ease', '&:hover': { transform: 'scale(1.05)' }, '& .MuiAvatar-img': { objectFit: 'cover' } }}
                  >
                    {initials(displayName)}
                  </Avatar>
                  <IconButton
                    aria-label="Update profile photo"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoModalOpen(true);
                    }}
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 30,
                      height: 30,
                      color: '#fff',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      border: '2px solid #fff',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                      '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              </Tooltip>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => setPhotoModalOpen(true)}
                sx={{ mt: 1.5, borderRadius: 3, fontWeight: 700 }}
              >
                Change Photo
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5 }}>{displayName}</Typography>
              <Typography color="text.secondary">{user.role || 'HR Lead'}</Typography>
              <Chip label="Active Member" color="success" size="small" sx={{ mt: 1.5, fontWeight: 700, borderRadius: 2 }} />
            </Box>
            <Stack spacing={1.5} sx={{ mt: 3, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email || 'ava.patel@company.com'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Badge fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">Employee ID: EMP-1024</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <WorkOutline fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">Engineering</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2">Seattle, USA</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={8}>
          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {profileStats.map((stat, index) => (
              <Grid item xs={12} sm={4} key={stat.label} className={`animate-fade-up animation-delay-${index + 1}`}>
                <Paper className="card-surface card-clickable" sx={{ p: 2.5, textAlign: 'center' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, mx: 'auto', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${stat.color}18`, color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Skills */}
          <Paper className="card-surface" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
                <Psychology fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Skills & Proficiency</Typography>
            </Box>
            <Stack spacing={2}>
              {skills.map((skill) => (
                <Box key={skill.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{skill.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{skill.level}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={skill.level} sx={{ height: 8, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 4 } }} />
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Badges */}
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #f472b6)', color: '#fff' }}>
                <EmojiEvents fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Achievements & Badges</Typography>
            </Box>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
              <Chip label="🏆 Leadership" sx={{ py: 1.2, px: 0.5, fontWeight: 700, bgcolor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }} />
              <Chip label="🎨 Design Systems" sx={{ py: 1.2, px: 0.5, fontWeight: 700, bgcolor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)' }} />
              <Chip label="💥 Impact Award" sx={{ py: 1.2, px: 0.5, fontWeight: 700, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }} />
              <Chip label="🤝 Team Player" sx={{ py: 1.2, px: 0.5, fontWeight: 700, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }} />
              <Chip label="🚀 Growth Mindset" sx={{ py: 1.2, px: 0.5, fontWeight: 700, bgcolor: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Recognized for driving cross-team collaboration and elevating employee experience programs.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Profile photo upload dialog */}
      <AvatarUploadModal
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhoto={profilePhoto}
        onSave={handlePhotoSave}
      />

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}