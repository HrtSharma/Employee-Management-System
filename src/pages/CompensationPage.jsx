import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Chip, Grid, LinearProgress, Paper, Stack, Typography, useTheme } from '@mui/material';
import { AccountBalanceWallet, TrendingUp, Payments, Savings, BusinessCenter, ReceiptLong, History } from '@mui/icons-material';
import { BarChart, Bar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { payrollDB } from '../data/payrollDB';
import { useNavigate } from 'react-router-dom';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatCompactINR(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

function CustomTooltip({ active, payload, label, suffix = '' }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <Box sx={{ background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', color: '#fff', borderRadius: 3, p: 1.5, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>{label}</Typography>
      {payload.map((entry) => (
        <Typography key={entry.dataKey} variant="body2" sx={{ color: entry.color }}>
          {entry.name}: {formatINR(entry.value)}{suffix}
        </Typography>
      ))}
    </Box>
  );
}

export default function CompensationPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { employees } = useAppContext();
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [payBands, setPayBands] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const [structures, bands, records, summaryData] = await Promise.all([
        payrollDB.getSalaryStructures(),
        payrollDB.getPayBands(),
        payrollDB.getPayrollRecords(),
        payrollDB.getPayrollSummary(),
      ]);
      setSalaryStructures(structures);
      setPayBands(bands);
      setPayrollRecords(records);
      setSummary(summaryData);

      // Auto-create salary structures for any employees missing one
      const existingIds = new Set(structures.map((s) => s.employeeId));
      const missingEmployees = employees.filter((emp) => !existingIds.has(emp.id));
      if (missingEmployees.length > 0) {
        const newStructures = [];
        for (const emp of missingEmployees) {
          const structure = await payrollDB.createDefaultSalaryStructure(emp.id, emp);
          newStructures.push(structure);
        }
        if (newStructures.length > 0) {
          setSalaryStructures((prev) => [...prev, ...newStructures]);
        }
      }
    };
    loadData();
  }, [employees]);

  const enrichedStructures = useMemo(() => {
    return salaryStructures.map((structure) => {
      const employee = employees.find((e) => e.id === structure.employeeId);
      const gross = Object.values(structure.components).reduce((sum, v) => sum + v, 0);
      const deductions = Object.values(structure.deductions).reduce((sum, v) => sum + v, 0);
      const net = gross - deductions;
      const band = payBands.find((b) => b.id === structure.payBand);
      return {
        ...structure,
        employee,
        gross,
        deductions,
        net,
        band,
      };
    });
  }, [employees, payBands, salaryStructures]);

  // Pay band distribution data
  const payBandDistribution = useMemo(() => {
    const counts = {};
    enrichedStructures.forEach((s) => {
      counts[s.payBand] = (counts[s.payBand] || 0) + 1;
    });
    return payBands
      .filter((band) => counts[band.id])
      .map((band) => ({
        name: band.label,
        value: counts[band.id],
        color: band.color,
      }));
  }, [enrichedStructures, payBands]);

  // Monthly payroll trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const monthMap = {};
    payrollRecords.forEach((record) => {
      if (!monthMap[record.month]) {
        monthMap[record.month] = { month: record.month, gross: 0, net: 0, deductions: 0 };
      }
      monthMap[record.month].gross += record.grossEarnings;
      monthMap[record.month].net += record.netPay;
      monthMap[record.month].deductions += record.totalDeductions;
    });
    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  }, [payrollRecords]);

  // Department cost distribution
  const departmentCost = useMemo(() => {
    const deptMap = {};
    enrichedStructures.forEach((s) => {
      const dept = s.employee?.department || 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = 0;
      deptMap[dept] += s.ctc;
    });
    return Object.entries(deptMap).map(([name, value]) => ({ name, value }));
  }, [enrichedStructures]);

  const pieColors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9'];

  const metrics = [
    { label: 'Total Monthly Gross', value: summary ? formatINR(summary.totalMonthlyGross) : '...', detail: 'All employees', icon: <Payments />, gradient: 'stat-gradient-blue' },
    { label: 'Total Monthly Net', value: summary ? formatINR(summary.totalMonthlyNet) : '...', detail: 'After deductions', icon: <AccountBalanceWallet />, gradient: 'stat-gradient-green' },
    { label: 'Annual CTC Pool', value: summary ? formatCompactINR(summary.totalAnnualCTC) : '...', detail: 'Total compensation', icon: <Savings />, gradient: 'stat-gradient-purple' },
    { label: 'Avg Annual Salary', value: summary ? formatCompactINR(summary.avgSalary) : '...', detail: 'Per employee', icon: <TrendingUp />, gradient: 'stat-gradient-pink' },
    { label: 'Monthly Tax Deducted', value: summary ? formatINR(summary.taxDeductedThisMonth) : '...', detail: 'Income tax (TDS)', icon: <ReceiptLong />, gradient: 'stat-gradient-orange' },
    { label: 'Next Payroll Run', value: summary?.nextPayrollDate || '...', detail: 'Scheduled', icon: <BusinessCenter />, gradient: 'stat-gradient-cyan' },
  ];

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Compensation Overview</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Track salary structures, pay bands, and total compensation across the organization.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip icon={<Payments />} label="Payroll" onClick={() => navigate('/payroll')} sx={{ fontWeight: 700, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }} />
          <Chip icon={<History />} label="Salary History" onClick={() => navigate('/salary-history')} sx={{ fontWeight: 700, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' } }} />
        </Stack>
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
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1, fontSize: '1.15rem' }}>{item.value}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>{item.detail}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8} className="animate-fade-up animation-delay-2">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Monthly Payroll Trend</Typography>
              <Chip label="Last 6 months" color="primary" size="small" sx={{ fontWeight: 700 }} />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactINR(v)} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
                <Bar dataKey="gross" name="Gross" fill="url(#grossGradient)" radius={[8, 8, 0, 0]} maxBarSize={28} />
                <Bar dataKey="net" name="Net" fill="url(#netGradient)" radius={[8, 8, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4} className="animate-fade-up animation-delay-3">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pay Band Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={payBandDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                  {payBandDistribution.map((entry, index) => (<Cell key={`${entry.name}-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip content={<CustomTooltip suffix=" employees" />} />
              </PieChart>
            </ResponsiveContainer>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'center' }}>
              {payBandDistribution.map((item) => (
                <Chip key={item.name} size="small" label={`${item.name} (${item.value})`} sx={{ bgcolor: `${item.color}18`, color: item.color, fontWeight: 700, borderRadius: 2 }} />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Employee salary table */}
      <Paper className="card-surface" sx={{ mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Salary Structure by Employee</Typography>
          <Chip label={`${enrichedStructures.length} employees`} size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr>
                {['Employee', 'Pay Band', 'Basic', 'HRA', 'Allowances', 'Gross / Month', 'Deductions', 'Net Pay', 'Annual CTC'].map((header) => (
                  <th key={header} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: theme.palette.text.secondary, borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enrichedStructures.map((structure) => (
                <tr key={structure.employeeId} style={{ borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'}'`, transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '14px 16px' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, background: getGradient(structure.employee?.name || ''), fontSize: 14, fontWeight: 700 }}>
                        {(structure.employee?.name || '?').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{structure.employee?.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">{structure.employee?.designation || ''}</Typography>
                      </Box>
                    </Stack>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Chip
                      size="small"
                      label={`${structure.payBand} · ${structure.band?.label || ''}`}
                      sx={{ bgcolor: `${structure.band?.color || '#6366f1'}18`, color: structure.band?.color || '#6366f1', fontWeight: 700, borderRadius: 2 }}
                    />
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{formatINR(structure.components.basic)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{formatINR(structure.components.hra)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{formatINR(structure.components.specialAllowance + structure.components.conveyanceAllowance + structure.components.medicalAllowance + structure.components.lta)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: theme.palette.primary.main }}>{formatINR(structure.gross)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: theme.palette.error.main }}>-{formatINR(structure.deductions)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: theme.palette.success.main }}>{formatINR(structure.net)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{formatCompactINR(structure.ctc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>

      {/* Bottom row: department cost + pay band ranges */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-4">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Compensation by Department</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departmentCost} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.mode === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCompactINR(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.06)' }} />
                <Bar dataKey="value" name="Annual CTC" radius={[0, 8, 8, 0]} maxBarSize={22}>
                  {departmentCost.map((entry, index) => (<Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} className="animate-fade-up animation-delay-5">
          <Paper className="card-surface" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Pay Band Structure</Typography>
            <Stack spacing={2}>
              {payBands.map((band) => {
                const count = enrichedStructures.filter((s) => s.payBand === band.id).length;
                const pct = enrichedStructures.length ? (count / enrichedStructures.length) * 100 : 0;
                return (
                  <Box key={band.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: band.color }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{band.label}</Typography>
                        <Chip size="small" label={band.range} sx={{ fontSize: '0.68rem', fontWeight: 700, borderRadius: 2, height: 20 }} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{count} employee{count !== 1 ? 's' : ''}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
                        '& .MuiLinearProgress-bar': { background: band.color, borderRadius: 4 },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}