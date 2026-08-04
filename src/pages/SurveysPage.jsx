import { useState } from 'react';
import { Box, Card, Chip, Grid, LinearProgress, Paper, Stack, Typography, useTheme } from '@mui/material';
import { Mood, SentimentSatisfied, SentimentDissatisfied, Quiz, TrendingUp, EmojiEmotions } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

const moodOptions = [
  { label: 'Great', icon: <EmojiEmotions />, color: '#10b981' },
  { label: 'Okay', icon: <SentimentSatisfied />, color: '#f59e0b' },
  { label: 'Stressed', icon: <SentimentDissatisfied />, color: '#ef4444' },
];

export default function SurveysPage() {
  const theme = useTheme();
  const { surveys } = useAppContext();
  const [selectedMood, setSelectedMood] = useState(null);

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Pulse Survey</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Share how you're feeling and help shape the workplace.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-1">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: '#fff' }}>
                <Mood fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Daily Mood Check-in</Typography>
            </Box>
            <Typography color="text.secondary" sx={{ mb: 2 }}>How are you feeling today?</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              {moodOptions.map((option) => (
                <Box
                  key={option.label}
                  onClick={() => setSelectedMood(option.label)}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: `2px solid ${selectedMood === option.label ? option.color : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
                    background: selectedMood === option.label ? `${option.color}15` : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' },
                  }}
                >
                  <Box sx={{ color: option.color, fontSize: 32, mb: 0.5 }}>{option.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{option.label}</Typography>
                </Box>
              ))}
            </Stack>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Employee Happiness Score</Typography>
                <Chip label="84%" color="success" size="small" sx={{ fontWeight: 800 }} />
              </Box>
              <LinearProgress variant="determinate" value={84} sx={{ height: 10, borderRadius: 5, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.1)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 5 } }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {selectedMood ? `Thanks for sharing! You're feeling ${selectedMood.toLowerCase()} today.` : 'Tap a mood above to check in.'}
              </Typography>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-2">
          <Paper className="card-surface" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
                <Quiz fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Survey Results</Typography>
            </Box>
            <Stack spacing={2.5}>
              {surveys.map((item, index) => (
                <Box key={item.id} className={`animate-fade-up animation-delay-${index + 1}`}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: item.score >= 85 ? 'success.main' : item.score >= 80 ? 'warning.main' : 'error.main' }}>{item.score}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.score}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.08)',
                      '& .MuiLinearProgress-bar': {
                        background: item.score >= 85 ? 'linear-gradient(90deg, #10b981, #34d399)' : item.score >= 80 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)',
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
            <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(14,165,233,0.08))', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#10b981', fontSize: 18 }} /> Overall: 82% positive
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Recognition and wellbeing scores are trending up this quarter. Keep it up!
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}