import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

export default function AnnouncementsPage() {
  const { announcements } = useAppContext();
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Announcements</Typography>
      <Grid container spacing={3}>
        {announcements.map((announcement) => (
          <Grid item xs={12} md={6} key={announcement.id}>
            <Card className="card-surface">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{announcement.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{announcement.time}</Typography>
                <Typography sx={{ mt: 2 }}>{announcement.body}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
