import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

export default function RecognitionPage() {
  const { recognitions } = useAppContext();
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Recognition Hub</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Recognition Feed</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {recognitions.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Typography fontWeight={700}>{item.name}</Typography>
                    <Typography variant="body2">{item.title}</Typography>
                    <Chip label={item.badge} color="secondary" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Leaderboard</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {recognitions.map((item, index) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography>{index + 1}. {item.name}</Typography>
                  <Typography color="primary.main">{item.points} pts</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
