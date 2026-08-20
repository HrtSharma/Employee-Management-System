import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Paper, Snackbar, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Add, Close, TrendingUp, History, WorkHistory, ArrowForward, Payments } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { payrollDB } from '../data/payrollDB';

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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const revisionTypes = ['Annual Appraisal', 'Promotion', 'Salary Correction', 'Market Adjustment', 'Special Bonus'];

export default function SalaryHistoryPage() {
  const theme = useTheme();
  const { employees, auth } = useAppContext();
  const [history, setHistory] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [payBands, setPayBands] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // New revision form
  const [revisionForm, setRevisionForm] = useState({
    employeeId: '',
    effectiveDate: '',
    newCTC: '',
    revisionType: 'Annual Appraisal',
    reason: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const isAdmin = auth?.user?.role === 'Admin';
      const currentEmployee = employees.find((e) => e.email?.toLowerCase() === auth?.user?.email?.toLowerCase());
      const [historyData, structures, bands] = await Promise.all([
        isAdmin ? payrollDB.getSalaryHistory() : currentEmployee ? payrollDB.getSalaryHistoryByEmployee(currentEmployee.id) : Promise.resolve([]),
        payrollDB.getSalaryStructures(),
        payrollDB.getPayBands(),
      ]);
      setHistory(historyData);
      setSalaryStructures(structures);
      setPayBands(bands);
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?.email]);

  // Employees are locked to their own salary history.
  useEffect(() => {
    if (auth?.user?.role !== 'Admin') {
      const currentEmployee = employees.find((e) => e.email?.toLowerCase() === auth?.user?.email?.toLowerCase());
      if (currentEmployee) setSelectedEmployeeId(String(currentEmployee.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?.email]);

  const enrichedHistory = useMemo(() => {
    return history
      .map((entry) => {
        const employee = employees.find((e) => e.id === entry.employeeId);
        const structure = salaryStructures.find((s) => s.employeeId === entry.employeeId);
        const band = payBands.find((b) => b.id === entry.payBand);
        const pctChange = entry.previousCTC > 0 ? Math.round(((entry.newCTC - entry.previousCTC) / entry.previousCTC) * 100) : 0;
        return { ...entry, employee, structure, band, pctChange };
      })
      .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
  }, [employees, history, payBands, salaryStructures]);

  const currentEmployee = employees.find((e) => e.email?.toLowerCase() === auth?.user?.email?.toLowerCase());
  const isAdminView = auth?.user?.role === 'Admin';
  const currentEmployeeId = isAdminView ? selectedEmployeeId : String(currentEmployee?.id || 'All');

  const filteredHistory = useMemo(() => {
    if (currentEmployeeId === 'All') return enrichedHistory;
    return enrichedHistory.filter((entry) => entry.employeeId === Number(currentEmployeeId));
  }, [enrichedHistory, currentEmployeeId]);

  // Group by employee for the summary
  const employeeSummaries = useMemo(() => {
    const map = {};
    enrichedHistory.forEach((entry) => {
      if (!map[entry.employeeId]) {
        map[entry.employeeId] = {
          employee: entry.employee,
          currentCTC: entry.structure?.ctc || entry.newCTC,
          revisions: 0,
          totalIncrease: 0,
          firstRevision: entry.effectiveDate,
          lastRevision: entry.effectiveDate,
        };
      }
      map[entry.employeeId].revisions += 1;
      map[entry.employeeId].totalIncrease += entry.newCTC - entry.previousCTC;
      if (new Date(entry.effectiveDate) < new Date(map[entry.employeeId].firstRevision)) {
        map[entry.employeeId].firstRevision = entry.effectiveDate;
      }
      if (new Date(entry.effectiveDate) > new Date(map[entry.employeeId].lastRevision)) {
        map[entry.employeeId].lastRevision = entry.effectiveDate;
      }
    });
    return Object.values(map);
  }, [enrichedHistory]);

  const handleOpenDialog = () => {
    setRevisionForm({
      employeeId: employees[0]?.id || '',
      effectiveDate: '',
      newCTC: '',
      revisionType: 'Annual Appraisal',
      reason: '',
    });
    setDialogOpen(true);
  };

  const handleSaveRevision = async () => {
    if (!revisionForm.employeeId || !revisionForm.effectiveDate || !revisionForm.newCTC) {
      setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
      return;
    }
    const employeeId = Number(revisionForm.employeeId);
    const structure = salaryStructures.find((s) => s.employeeId === employeeId);
    const previousCTC = structure?.ctc || Number(revisionForm.newCTC);
    const newRevision = {
      employeeId,
      effectiveDate: revisionForm.effectiveDate,
      previousCTC,
      newCTC: Number(revisionForm.newCTC),
      revisionType: revisionForm.revisionType,
      payBand: structure?.payBand || 'P1',
      reason: revisionForm.reason || 'Salary revision',
      approvedBy: 'HR Lead',
    };
    const saved = await payrollDB.addSalaryRevision(newRevision);
    setHistory((prev) => [...prev, saved]);
    setDialogOpen(false);
    setSnackbar({ open: true, message: 'Salary revision added successfully.', severity: 'success' });
  };

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Salary History</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {isAdminView ? 'Track salary revisions, appraisals, and promotions across the organization.' : 'Track your salary revisions, appraisals, and promotions.'}
          </Typography>
        </Box>
        {isAdminView && (
          <Button variant="contained" className="btn-glow" startIcon={<Add />} onClick={handleOpenDialog} sx={{ borderRadius: 3, px: 3, py: 1.2 }}>
            New Revision
          </Button>
        )}
      </Box>

      {/* Summary stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-purple">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Total Revisions</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <History />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{enrichedHistory.length}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>All-time revisions</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-blue">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Employees Tracked</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <WorkHistory />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{employeeSummaries.length}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>With revisions</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-green">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Promotions</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <TrendingUp />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{enrichedHistory.filter((h) => h.revisionType === 'Promotion').length}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>Promotion events</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-pink">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Avg Increase</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <Payments />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>
              {enrichedHistory.length > 0 ? `${Math.round(enrichedHistory.reduce((sum, h) => sum + h.pctChange, 0) / enrichedHistory.length)}%` : '—'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>Per revision</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Employee filter */}
      <Paper className="card-surface" sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            {isAdminView ? (
              <TextField select fullWidth label="Filter by Employee" value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
                <MenuItem value="All">All Employees</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField select fullWidth disabled label="Employee" value={currentEmployeeId}>
                <MenuItem value={currentEmployeeId}>{currentEmployee?.name || 'You'}</MenuItem>
              </TextField>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{filteredHistory.length}</strong> salary revisions
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Employee summary cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {employeeSummaries.map((summary, index) => (
          <Grid item xs={12} sm={6} lg={3} key={summary.employee?.id} className={`animate-fade-up animation-delay-${(index % 4) + 1}`}>
            <Paper className="card-surface" sx={{ p: 2.5, height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: getGradient(summary.employee?.name || '') }} />
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ width: 42, height: 42, background: getGradient(summary.employee?.name || ''), fontWeight: 700 }}>
                  {(summary.employee?.name || '?').charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary.employee?.name || 'Unknown'}</Typography>
                  <Typography variant="caption" color="text.secondary">{summary.employee?.designation || ''}</Typography>
                </Box>
              </Stack>
              <Stack spacing={0.8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Current CTC</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{formatCompactINR(summary.currentCTC)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Total Increase</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>+{formatCompactINR(summary.totalIncrease)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Revisions</Typography>
                  <Chip size="small" label={summary.revisions} sx={{ height: 20, fontWeight: 700, borderRadius: 2 }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Last Revision</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(summary.lastRevision)}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Revision timeline */}
      <Paper className="card-surface" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Revision Timeline</Typography>
          <Chip label={`${filteredHistory.length} events`} size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />
        </Box>

        <Stack spacing={3}>
          {filteredHistory.map((entry, index) => {
            const isPromotion = entry.revisionType === 'Promotion';
            return (
              <Box key={entry.id} sx={{ display: 'flex', gap: 2 }}>
                {/* Timeline marker */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isPromotion ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: '#fff',
                      flexShrink: 0,
                      boxShadow: `0 4px 14px ${isPromotion ? 'rgba(245, 158, 11, 0.35)' : 'rgba(99, 102, 241, 0.35)'}`,
                    }}
                  >
                    {isPromotion ? <TrendingUp fontSize="small" /> : <Payments fontSize="small" />}
                  </Box>
                  {index < filteredHistory.length - 1 && (
                    <Box sx={{ width: 2, flexGrow: 1, minHeight: 60, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)' }} />
                  )}
                </Box>

                {/* Content */}
                <Paper
                  variant="outlined"
                  sx={{
                    flexGrow: 1,
                    p: 2.5,
                    borderRadius: 3,
                    mb: 2,
                    borderColor: isPromotion ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.2)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 34, height: 34, background: getGradient(entry.employee?.name || ''), fontSize: 14, fontWeight: 700 }}>
                        {(entry.employee?.name || '?').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{entry.employee?.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">{entry.employee?.designation} · {formatDate(entry.effectiveDate)}</Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={entry.revisionType}
                      color={isPromotion ? 'warning' : 'primary'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 1.5 }}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>Previous CTC</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>{formatINR(entry.previousCTC)}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>New CTC</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>{formatINR(entry.newCTC)}</Typography>
                          {entry.pctChange > 0 && (
                            <Chip size="small" label={`+${entry.pctChange}%`} color="success" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.65rem' }}>Pay Band</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                          <Chip size="small" label={entry.payBand} sx={{ height: 20, fontWeight: 800, fontSize: '0.68rem', bgcolor: `${entry.band?.color || '#6366f1'}18`, color: entry.band?.color || '#6366f1' }} />
                          <Typography variant="caption" color="text.secondary">{entry.band?.label || ''}</Typography>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong style={{ color: theme.palette.text.primary }}>Reason:</strong> {entry.reason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Approved by <strong>{entry.approvedBy}</strong>
                  </Typography>
                </Paper>
              </Box>
            );
          })}
          {filteredHistory.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>No salary history found</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Select a different employee or add a new revision.</Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Add Revision Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>New Salary Revision</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField select fullWidth label="Employee *" value={revisionForm.employeeId} onChange={(e) => setRevisionForm({ ...revisionForm, employeeId: e.target.value })}>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.name} — {emp.designation}</MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Effective Date *"
                type="date"
                value={revisionForm.effectiveDate}
                onChange={(e) => setRevisionForm({ ...revisionForm, effectiveDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="New Annual CTC (₹) *"
                type="number"
                value={revisionForm.newCTC}
                onChange={(e) => setRevisionForm({ ...revisionForm, newCTC: e.target.value })}
                placeholder="e.g. 2600000"
              />
            </Stack>
            <TextField select fullWidth label="Revision Type" value={revisionForm.revisionType} onChange={(e) => setRevisionForm({ ...revisionForm, revisionType: e.target.value })}>
              {revisionTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={revisionForm.reason}
              onChange={(e) => setRevisionForm({ ...revisionForm, reason: e.target.value })}
              placeholder="Describe the reason for this revision..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSaveRevision} variant="contained" className="btn-glow" startIcon={<ArrowForward />}>
            Save Revision
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 3, fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}