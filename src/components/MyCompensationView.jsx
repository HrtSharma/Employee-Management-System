import { Box, Chip, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import { AccountBalanceWallet, BusinessCenter, History, Payments, ReceiptLong, Savings } from '@mui/icons-material';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function formatCompactINR(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value || 0}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <Box sx={{ background: 'rgba(15, 23, 42, 0.9)', color: '#fff', borderRadius: 3, p: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>{label}</Typography>
      {payload.map((entry) => (
        <Typography key={entry.dataKey} variant="body2" sx={{ color: entry.color }}>{entry.name}: {formatINR(entry.value)}</Typography>
      ))}
    </Box>
  );
}

const earningsRows = [
  { key: 'basic', label: 'Basic Salary' },
  { key: 'hra', label: 'House Rent Allowance (HRA)' },
  { key: 'specialAllowance', label: 'Special Allowance' },
  { key: 'conveyanceAllowance', label: 'Conveyance Allowance' },
  { key: 'medicalAllowance', label: 'Medical Allowance' },
  { key: 'lta', label: 'Leave Travel Allowance (LTA)' },
  { key: 'performanceBonus', label: 'Performance Bonus' },
  { key: 'employerPF', label: 'Employer PF Contribution' },
  { key: 'employerESI', label: 'Employer ESI Contribution' },
  { key: 'gratuity', label: 'Gratuity' },
];

const deductionRows = [
  { key: 'pf', label: 'Provident Fund (PF)' },
  { key: 'professionalTax', label: 'Professional Tax' },
  { key: 'incomeTax', label: 'Income Tax (TDS)' },
  { key: 'insurance', label: 'Insurance Premium' },
];

export default function MyCompensationView({ structure, deductionBreakdown, records = [], summary, employeeName }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const ownRecords = Array.isArray(records) ? records : [];
  const trendMap = {};
  ownRecords.forEach((record) => {
    trendMap[record.month] = { month: record.month, gross: record.grossEarnings, net: record.netPay, deductions: record.totalDeductions };
  });
  const ownTrendData = Object.values(trendMap).sort((a, b) => a.month.localeCompare(b.month));
  const personalMetrics = [
    { label: 'My Monthly Gross', value: structure ? formatINR(structure.gross) : '—', detail: 'Before deductions', icon: <Payments />, gradient: 'stat-gradient-blue' },
    { label: 'My Net Pay', value: structure ? formatINR(structure.net) : '—', detail: 'After all deductions', icon: <AccountBalanceWallet />, gradient: 'stat-gradient-green' },
    { label: 'My Annual CTC', value: structure ? formatCompactINR(structure.ctc) : '—', detail: 'Total cost to company', icon: <Savings />, gradient: 'stat-gradient-purple' },
    { label: 'Monthly Tax (TDS)', value: deductionBreakdown ? formatINR(deductionBreakdown.incomeTax || 0) : '—', detail: 'Income tax deducted', icon: <ReceiptLong />, gradient: 'stat-gradient-orange' },
    { label: 'Pay Band', value: structure?.band?.label || structure?.payBand || '—', detail: structure?.payGrade || 'Current pay grade', icon: <BusinessCenter />, gradient: 'stat-gradient-pink' },
    { label: 'Next Payroll', value: summary?.nextPayrollDate || '—', detail: 'Scheduled', icon: <History />, gradient: 'stat-gradient-cyan' },
  ];
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>My Compensation</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Review your salary structure and payslip details.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip icon={<Payments />} label="My Payslips" onClick={() => navigate('/payroll')} sx={{ fontWeight: 700, borderRadius: 2, cursor: 'pointer' }} />
          <Chip icon={<History />} label="My Salary History" onClick={() => navigate('/salary-history')} sx={{ fontWeight: 700, borderRadius: 2, cursor: 'pointer' }} />
        </Stack>
      </Box>
      {!structure ? (
        <Paper className="card-surface" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>No compensation data available</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Your salary structure has not been set up yet. Please contact the administrator.</Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {personalMetrics.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={item.label} className={`animate-fade-up animation-delay-${index + 1}`}>
                <Box className={`stat-card ${item.gradient}`}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>{item.label}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>{item.icon}</Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1, fontSize: '1.15rem' }}>{item.value}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>{item.detail}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <Paper className="card-surface" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>My Salary Breakup</Typography>
                  <Chip size="small" label={`${structure.payBand} · ${structure.band?.label || ''}`} sx={{ bgcolor: `${structure.band?.color || '#6366f1'}18`, color: structure.band?.color || '#6366f1', fontWeight: 700, borderRadius: 2 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', mb: 1 }}>Earnings (monthly)</Typography>
                {earningsRows.map((row) => (
                  <Box key={row.key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'}` }}>
                    <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatINR(structure.components[row.key] || 0)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, px: 1.5, borderRadius: 2, mt: 1, bgcolor: 'rgba(16, 185, 129, 0.08)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>Gross Earnings</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>{formatINR(structure.gross)}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', mb: 1, mt: 2.5 }}>Deductions (monthly)</Typography>
                {deductionRows.map((row) => (
                  <Box key={row.key} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.7 }}>
                    <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>-{formatINR(deductionBreakdown?.[row.key] || 0)}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, px: 1.5, borderRadius: 2, mt: 1, bgcolor: 'rgba(239, 68, 68, 0.08)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>Total Deductions</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main' }}>-{formatINR(structure.deductions)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2.5, p: 2, borderRadius: 3, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Net Pay / Month</Typography>
                    <Typography variant="caption" color="text.secondary">Credited to {structure.bankAccount || 'your registered account'}</Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {formatINR(structure.net)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={5}>
              <Paper className="card-surface" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>My Payroll Trend</Typography>
                  <Chip label="Last 6 months" color="primary" size="small" sx={{ fontWeight: 700 }} />
                </Box>
                {ownTrendData.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body2" color="text.secondary">No payslips published yet.</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ownTrendData}>
                      <defs>
                        <linearGradient id="myGrossGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                        </linearGradient>
                        <linearGradient id="myNetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactINR(v)} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
                      <Bar dataKey="gross" name="Gross" fill="url(#myGrossGradient)" radius={[8, 8, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="net" name="Net" fill="url(#myNetGradient)" radius={[8, 8, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}