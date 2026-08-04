import { Avatar, Box, Chip, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { EventAvailable, EmojiEvents, PeopleAlt, Quiz, TrendingUp, ArrowForward } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const typeConfig = {
  Challenge: { icon: <EmojiEvents />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  Event: { icon: <EventAvailable />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  Survey: { icon: <Quiz />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

export default function ActivitiesPage() {
  const theme = useTheme();
  const { activities } = useAppContext();

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Team Activities</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Discover challenges, events, and ways to get involved.</Typography>
      </Box>

      <Grid container spacing={3}>
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type] || { icon: <TrendingUp />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
          return (
            <Grid item xs={12} md={4} key={activity.id} className={`animate-fade-up animation-delay-${index + 1}`}>
              <Paper className="card-surface card-clickable" sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${config.color}, ${config.color}88)` }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: config.bg, color: config.color, fontSize: 22 }}>
                    {config.icon}
                  </Box>
                  <Chip label={activity.type} size="small" sx={{ fontWeight: 700, bgcolor: config.bg, color: config.color, borderRadius: 2 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{activity.title}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
                  <PeopleAlt fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary"><strong style={{ color: theme.palette.text.primary }}>{activity.participants}</strong> participants</Typography>
                </Stack>
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      Join now <ArrowForward sx={{ fontSize: 16 }} />
                    </Typography>
                    <Avatar sx={{ width: 28, height: 28, background: getGradient('Mina Chen'), fontWeight: 700, fontSize: 12 }}>M</Avatar>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}