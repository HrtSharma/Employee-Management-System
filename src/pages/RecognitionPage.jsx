import { Avatar, Box, Card, Chip, Grid, LinearProgress, Paper, Stack, Typography, useTheme } from '@mui/material';
import { EmojiEvents, WorkspacePremium, Celebration, Stars, MilitaryTech } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

const badgeIcons = {
  'Star Innovator': <Stars />,
  'Impact Maker': <MilitaryTech />,
  'Care Catalyst': <Celebration />,
};

const badgeColors = {
  'Star Innovator': '#6366f1',
  'Impact Maker': '#f59e0b',
  'Care Catalyst': '#10b981',
};

export default function RecognitionPage() {
  const theme = useTheme();
  const { recognitions } = useAppContext();
  const maxPoints = Math.max(...recognitions.map((item) => item.points));

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Recognition Hub</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Celebrate wins and appreciate your teammates.</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Recognition feed */}
        <Grid item xs={12} md={7} className="animate-fade-up animation-delay-1">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
                <EmojiEvents fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recognition Feed</Typography>
            </Box>
            <Stack spacing={2}>
              {recognitions.map((item, index) => (
                <Card key={item.id} elevation={0} className={`animate-fade-up animation-delay-${index + 1}`} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`, p: 2, transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(99,102,241,0.12)' } }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar className="avatar-ring" sx={{ width: 48, height: 48, background: getGradient(item.name), fontWeight: 800, fontSize: 18 }}>
                      {item.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.title}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip label={item.points + ' pts'} size="small" sx={{ fontWeight: 800, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', borderRadius: 2 }} />
                    </Box>
                  </Stack>
                  <Box sx={{ mt: 1.5 }}>
                    <Chip
                      label={item.badge}
                      size="small"
                      icon={badgeIcons[item.badge]}
                      sx={{
                        fontWeight: 700,
                        bgcolor: `${badgeColors[item.badge] || '#6366f1'}1a`,
                        color: badgeColors[item.badge] || '#6366f1',
                        border: `1px solid ${badgeColors[item.badge] || '#6366f1'}40`,
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Leaderboard */}
        <Grid item xs={12} md={5} className="animate-fade-up animation-delay-2">
          <Paper className="card-surface" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #f472b6)', color: '#fff' }}>
                <WorkspacePremium fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Leaderboard</Typography>
            </Box>
            <Stack spacing={2.5}>
              {recognitions.map((item, index) => {
                const medalColors = ['#f59e0b', '#94a3b8', '#d97706'];
                const isTop = index < 3;
                return (
                  <Box key={item.id}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: isTop ? '#fff' : 'text.secondary', bgcolor: isTop ? medalColors[index] : 'rgba(148,163,184,0.15)' }}>
                        {index + 1}
                      </Box>
                      <Avatar sx={{ width: 38, height: 38, background: getGradient(item.name), fontWeight: 700, fontSize: 14 }}>
                        {item.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.badge}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{item.points} pts</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(item.points / maxPoints) * 100}
                      sx={{ mt: 1, ml: 7, height: 6, borderRadius: 3, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)', '& .MuiLinearProgress-bar': { background: isTop ? medalColors[index] : 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: 3 } }}
                    />
                  </Box>
                );
              })}
            </Stack>
            <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEvents sx={{ color: '#f59e0b', fontSize: 18 }} /> Keep it up!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Mina is leading this month. Nominate a teammate to show appreciation.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}