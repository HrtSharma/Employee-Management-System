import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

export default function ActivitiesPage() {
  const { activities } = useAppContext();
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Team Activities</Typography>
      <Grid container spacing={3}>
        {activities.map((activity) => (
          <Grid item xs={12} md={4} key={activity.id}>
            <Card className="card-surface">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{activity.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{activity.type}</Typography>
                <Typography sx={{ mt: 2 }}>Participants: {activity.participants}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
