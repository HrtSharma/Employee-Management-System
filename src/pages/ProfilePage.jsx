import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

export default function ProfilePage() {
  const { auth } = useAppContext();
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Employee Profile</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>
            <Typography sx={{ mt: 2 }}>Name: {auth.user?.name || 'Ava Patel'}</Typography>
            <Typography>Email: {auth.user?.email || 'ava.patel@company.com'}</Typography>
            <Typography>Role: {auth.user?.role || 'HR Lead'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Skills & Achievements</Typography>
            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
              <Chip label="Leadership" color="primary" />
              <Chip label="Design Systems" color="secondary" />
              <Chip label="Impact Award" />
            </Stack>
            <Typography variant="body1">Recognized for driving cross-team collaboration and elevating employee experience programs.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
