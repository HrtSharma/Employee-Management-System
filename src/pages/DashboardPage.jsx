import { Box, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { employeesData } from '../data/mockData';

const growthData = [
  { month: 'Jan', employees: 84 },
  { month: 'Feb', employees: 88 },
  { month: 'Mar', employees: 92 },
  { month: 'Apr', employees: 98 },
  { month: 'May', employees: 104 },
  { month: 'Jun', employees: 112 },
];

const distributionData = [
  { name: 'Engineering', value: 34 },
  { name: 'Design', value: 18 },
  { name: 'People Ops', value: 12 },
  { name: 'Sales', value: 16 },
  { name: 'Marketing', value: 20 },
];

const engagementData = [
  { month: 'Jan', score: 72 },
  { month: 'Feb', score: 75 },
  { month: 'Mar', score: 79 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 86 },
  { month: 'Jun', score: 89 },
];

const attendanceData = [
  { day: 'Mon', attendance: 91 },
  { day: 'Tue', attendance: 93 },
  { day: 'Wed', attendance: 90 },
  { day: 'Thu', attendance: 95 },
  { day: 'Fri', attendance: 96 },
];

export default function DashboardPage() {
  const { loading } = useAppContext();
  const metrics = [
    { label: 'Total Employees', value: '112', detail: '+8% this quarter' },
    { label: 'Active Employees', value: '94%', detail: 'High engagement' },
    { label: 'Remote Employees', value: '41', detail: 'Hybrid-first' },
    { label: 'Satisfaction Score', value: '91%', detail: 'Very strong' },
    { label: 'Engagement Score', value: '89%', detail: '+4 vs last month' },
    { label: 'Upcoming Events', value: '6', detail: '2 this week' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>People & Engagement Overview</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metrics.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item.label}>
            <Card className="card-surface">
              <CardContent>
                <Typography color="text.secondary" variant="body2">{item.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                <Typography variant="body2" color="primary.main">{item.detail}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Employee Growth Trend</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="employees" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Department Distribution</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} fill="#2563eb">
                  {distributionData.map((entry, index) => (<Cell key={`${entry.name}-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#7c3aed'} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Engagement Trend</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Attendance Trend</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Top Performer</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>Mina Chen</Typography>
            <Chip label="Design Excellence" color="primary" sx={{ mt: 1 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Employee of the Month</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>Ava Patel</Typography>
            <Typography color="text.secondary">Leading customer-ready UI experiences</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 4 }} className="card-surface">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Activities</Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {employeesData.slice(0, 3).map((item) => <Typography key={item.id} variant="body2">• {item.name} updated their profile</Typography>)}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
