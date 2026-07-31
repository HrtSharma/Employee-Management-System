import { Box, Card, CardContent, Grid, LinearProgress, Paper, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

export default function SurveysPage() {
  const { surveys } = useAppContext();
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Pulse Survey</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Daily Mood Check-in</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>How are you feeling today?</Typography>
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography>Employee Happiness Score: 84%</Typography>
                <LinearProgress variant="determinate" value={84} sx={{ mt: 2, height: 10, borderRadius: 5 }} />
              </CardContent>
            </Card>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Survey Results</Typography>
            {surveys.map((item) => (
              <Box key={item.id} sx={{ mt: 2 }}>
                <Typography>{item.label}</Typography>
                <LinearProgress variant="determinate" value={item.score} sx={{ height: 10, borderRadius: 5 }} />
                <Typography variant="body2" color="text.secondary">{item.score}%</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
