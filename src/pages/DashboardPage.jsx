import { Avatar, Box, Chip, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TrendingUp, PeopleAlt, WifiTethering, Mood, WorkspacePremium, EventNote, ArrowUpward, Quiz, GroupAdd } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

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

const pieColors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

function CustomTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <Box sx={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 3, p: 1.5, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>{label}</Typography>
      {payload.map((entry) => (
        <Typography key={entry.dataKey} variant="body2" sx={{ color: entry.color }}>
          {entry.name}: {entry.value}{suffix}
        </Typography>
      ))}
    </Box>
  );
}

export default function DashboardPage() {
  const theme = useTheme();
  const { loading } = useAppContext();
  const metrics = [
    { label: 'Total Employees', value: '112', detail: '+8% this quarter', icon: <PeopleAlt />, gradient: 'stat-gradient-blue' },
    { label: 'Active Employees', value: '94%', detail: 'High engagement', icon: <TrendingUp />, gradient: 'stat-gradient-green' },
    { label: 'Remote Employees', value: '41', detail: 'Hybrid-first', icon: <WifiTethering />, gradient: 'stat-gradient-cyan' },
    { label: 'Satisfaction', value: '91%', detail: 'Very strong', icon: <Mood />, gradient: 'stat-gradient-pink' },
    { label: 'Engagement', value: '89%', detail: '+4 vs last month', icon: <WorkspacePremium />, gradient: 'stat-gradient-purple' },
    { label: 'Upcoming Events', value: '6', detail: '2 this week', icon: <EventNote />, gradient: 'stat-gradient-orange' },
  ];

  const recentActivities = [
    { name: 'Mina Chen', action: 'earned the Star Innovator badge' },
    { name: 'Ava Patel', action: 'completed the wellness challenge' },
    { name: 'Daniel Kim', action: 'posted a new announcement' },
  ];

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          Welcome back, <span className="gradient-text">{loading ? '...' : 'Team'}</span> 👋
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>Here's what's happening across your organization today.</Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {metrics.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item.label} className={`animate-fade-up animation-delay-${index + 1}`}>
            <Box className={`stat-card ${item.gradient}`}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>{item.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  {item.icon}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{item.value}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, position: 'relative', zIndex: 1 }}>
                {item.detail.includes('+') && <ArrowUpward sx={{ fontSize: 14 }} />}
                {item.detail}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8} className="animate-fade-up animation-delay-2">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Employee Growth Trend</Typography>
              <Chip label="+8.3% YoY" color="success" size="small" sx={{ fontWeight: 700 }} icon={<TrendingUp />} />
            </Box>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={growthData}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip suffix=" employees" />} />
                <Line type="monotone" dataKey="employees" stroke="#6366f1" strokeWidth={3.5} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4} className="animate-fade-up animation-delay-3">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Department Distribution</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                  {distributionData.map((entry, index) => (<Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />))}
                </Pie>
                <Tooltip content={<CustomTooltip suffix="%" />} />
              </PieChart>
            </ResponsiveContainer>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'center' }}>
              {distributionData.map((item, index) => (
                <Chip key={item.name} size="small" label={`${item.name}`} sx={{ bgcolor: `${pieColors[index]}18`, color: pieColors[index], fontWeight: 700, borderRadius: 2 }} />
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-3">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Engagement Trend</Typography>
              <Chip label="+4 pts" color="secondary" size="small" sx={{ fontWeight: 700 }} icon={<TrendingUp />} />
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={engagementData}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip suffix=" pts" />} />
                <Line type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={3.5} dot={{ r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-4">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Attendance Trend</Typography>
              <Chip label="93% avg" color="success" size="small" sx={{ fontWeight: 700 }} />
            </Box>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip suffix="%" />} cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }} />
                <Bar dataKey="attendance" radius={[10, 10, 0, 0]} maxBarSize={42}>
                  {attendanceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === 3 ? '#10b981' : '#6ee7b7'} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom row */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4} className="animate-fade-up animation-delay-4">
          <Paper className="card-surface card-clickable" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #f472b6)', color: '#fff' }}>
                <WorkspacePremium fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Top Performer</Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 52, height: 52, background: getGradient('Mina Chen'), fontWeight: 800, fontSize: 20 }}>M</Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Mina Chen</Typography>
                <Typography variant="caption" color="text.secondary">Product Designer</Typography>
              </Box>
            </Stack>
            <Chip label="🏆 Design Excellence" color="primary" sx={{ mt: 2, fontWeight: 700 }} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} className="animate-fade-up animation-delay-5">
          <Paper className="card-surface card-clickable" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff' }}>
                <GroupAdd fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Employee of the Month</Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 52, height: 52, background: getGradient('Ava Patel'), fontWeight: 800, fontSize: 20 }}>A</Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>Ava Patel</Typography>
                <Typography variant="caption" color="text.secondary">Senior Frontend Engineer</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Leading customer-ready UI experiences 🚀</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} className="animate-fade-up animation-delay-5">
          <Paper className="card-surface" sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: '#fff' }}>
                <Quiz fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Activities</Typography>
            </Box>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {recentActivities.map((activity, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 30, height: 30, background: getGradient(activity.name), fontSize: 13, fontWeight: 700 }}>
                    {activity.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                    <strong style={{ color: theme.palette.text.primary }}>{activity.name}</strong> {activity.action}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}