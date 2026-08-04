import { Avatar, Box, Chip, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { Campaign, Schedule, ThumbUpAlt, ChatBubbleOutline } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

const authors = ['Daniel Kim', 'Ava Patel', 'HR Team'];

export default function AnnouncementsPage() {
  const theme = useTheme();
  const { announcements } = useAppContext();

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Announcements</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Stay up to date with company news and updates.</Typography>
      </Box>

      <Grid container spacing={3}>
        {announcements.map((announcement, index) => {
          const author = authors[index % authors.length];
          return (
            <Grid item xs={12} md={6} key={announcement.id} className={`animate-fade-up animation-delay-${index + 1}`}>
              <Paper className="card-surface card-clickable" sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar className="avatar-ring" sx={{ width: 44, height: 44, background: getGradient(author), fontWeight: 800, fontSize: 16 }}>
                    {author.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{author}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule sx={{ fontSize: 13 }} /> {announcement.time}
                    </Typography>
                  </Box>
                  <Chip label="New" color="primary" size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', color: 'primary.main' }}>
                    <Campaign sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{announcement.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>{announcement.body}</Typography>
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <ThumbUpAlt sx={{ fontSize: 18 }} />
                    <Typography variant="caption">{24 + index * 7}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <ChatBubbleOutline sx={{ fontSize: 18 }} />
                    <Typography variant="caption">{4 + index * 3}</Typography>
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