import { useEffect, useMemo, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, MenuItem, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import { Search, PictureAsPdf, Visibility, Payments, Download, Close, AccountBalanceWallet, ReceiptLong, CheckCircle } from '@mui/icons-material';
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

function formatMonth(month) {
  const [year, mon] = month.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(mon) - 1]} ${year}`;
}

const earningsLabels = {
  basic: 'Basic Salary',
  hra: 'House Rent Allowance (HRA)',
  specialAllowance: 'Special Allowance',
  conveyanceAllowance: 'Conveyance Allowance',
  medicalAllowance: 'Medical Allowance',
  lta: 'Leave Travel Allowance (LTA)',
  performanceBonus: 'Performance Bonus',
  employerPF: 'Employer PF Contribution',
  employerESI: 'Employer ESI Contribution',
  gratuity: 'Gratuity',
};

const deductionLabels = {
  pf: 'Provident Fund (PF)',
  professionalTax: 'Professional Tax',
  incomeTax: 'Income Tax (TDS)',
  insurance: 'Insurance Premium',
};

export default function PayrollPage() {
  const theme = useTheme();
  const { employees } = useAppContext();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadData = async () => {
      const data = await payrollDB.getPayrollRecords();
      setRecords(data);
    };
    loadData();
  }, []);

  const enrichedRecords = useMemo(() => {
    return records.map((record) => {
      const employee = employees.find((e) => e.id === record.employeeId);
      return { ...record, employee };
    });
  }, [employees, records]);

  const months = useMemo(() => {
    return [...new Set(records.map((r) => r.month))].sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filteredRecords = useMemo(() => {
    return enrichedRecords.filter((record) => {
      const matchesSearch = `${record.employee?.name || ''} ${record.employee?.designation || ''} ${record.employee?.department || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchesMonth = monthFilter === 'All' || record.month === monthFilter;
      return matchesSearch && matchesMonth;
    });
  }, [enrichedRecords, monthFilter, search]);

  const totalNetPay = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.netPay, 0);
  }, [filteredRecords]);

  const totalGross = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.grossEarnings, 0);
  }, [filteredRecords]);

  const totalDeductions = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + r.totalDeductions, 0);
  }, [filteredRecords]);

  const handleViewPayslip = (record) => {
    setSelectedRecord(record);
  };

  const handleDownload = (record) => {
    setSnackbar({ open: true, message: `Payslip for ${record.employee?.name} (${formatMonth(record.month)}) downloaded.`, severity: 'success' });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Payroll & Payslips</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Generate, view, and manage employee payslips.</Typography>
        </Box>
        <Button variant="contained" className="btn-glow" startIcon={<Payments />} sx={{ borderRadius: 3, px: 3, py: 1.2 }}>
          Run Payroll
        </Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-blue">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Total Gross</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <Payments />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{formatINR(totalGross)}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>{filteredRecords.length} payslips</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-green">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Total Deductions</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <ReceiptLong />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{formatINR(totalDeductions)}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>PF, TDS, insurance</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-purple">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Total Net Pay</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <AccountBalanceWallet />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{formatINR(totalNetPay)}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>After all deductions</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box className="stat-card stat-gradient-pink">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600 }}>Paid Status</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 2, background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                <CheckCircle />
              </Box>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, position: 'relative', zIndex: 1 }}>{filteredRecords.filter((r) => r.status === 'Paid').length}/{filteredRecords.length}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5, position: 'relative', zIndex: 1 }}>Processed successfully</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper className="card-surface" sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by employee name, role, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <Search sx={{ color: 'text.secondary' }} />
                  </Box>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select fullWidth label="Month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <MenuItem value="All">All Months</MenuItem>
              {months.map((m) => (
                <MenuItem key={m} value={m}>{formatMonth(m)}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Payslip table */}
      <Paper className="card-surface" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.secondary', borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` } }}>
                <TableCell>Employee</TableCell>
                <TableCell>Month</TableCell>
                <TableCell align="right">Gross</TableCell>
                <TableCell align="right">Deductions</TableCell>
                <TableCell align="right">Net Pay</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} className="table-row-hover" sx={{ '& td': { borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'}` } }}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, background: getGradient(record.employee?.name || ''), fontSize: 14, fontWeight: 700 }}>
                        {(record.employee?.name || '?').charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{record.employee?.name || 'Unknown'}</Typography>
                        <Typography variant="caption" color="text.secondary">{record.employee?.designation || ''}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatMonth(record.month)}</Typography>
                    <Typography variant="caption" color="text.secondary">Paid on {record.paymentDate}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatINR(record.grossEarnings)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>-{formatINR(record.totalDeductions)}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>{formatINR(record.netPay)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={record.status} color="success" size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <TooltipIconButton title="View Payslip" onClick={() => handleViewPayslip(record)}>
                        <Visibility fontSize="small" />
                      </TooltipIconButton>
                      <TooltipIconButton title="Download PDF" onClick={() => handleDownload(record)}>
                        <PictureAsPdf fontSize="small" />
                      </TooltipIconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>No payslips found</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Try adjusting your search or filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payslip Detail Dialog */}
      <Dialog open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        {selectedRecord && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 44, height: 44, background: getGradient(selectedRecord.employee?.name || ''), fontWeight: 800 }}>
                  {(selectedRecord.employee?.name || '?').charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Payslip — {formatMonth(selectedRecord.month)}</Typography>
                  <Typography variant="caption" color="text.secondary">{selectedRecord.employee?.name} · {selectedRecord.employee?.designation}</Typography>
                </Box>
              </Stack>
              <IconButton onClick={() => setSelectedRecord(null)} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {/* Company header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  EngageHub Technologies
                </Typography>
                <Typography variant="caption" color="text.secondary">Salary Statement for the month of {formatMonth(selectedRecord.month)}</Typography>
              </Box>

              {/* Employee info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Employee Name" value={selectedRecord.employee?.name || '—'} />
                  <InfoRow label="Designation" value={selectedRecord.employee?.designation || '—'} />
                  <InfoRow label="Department" value={selectedRecord.employee?.department || '—'} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoRow label="Pay Period" value={formatMonth(selectedRecord.month)} />
                  <InfoRow label="Payment Date" value={selectedRecord.paymentDate} />
                  <InfoRow label="Bank Account" value={selectedRecord.bankAccount} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Earnings & Deductions */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'success.main' }}>Earnings</Typography>
                  <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {Object.entries(earningsLabels).map(([key, label], index) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.2, bgcolor: index % 2 === 0 ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)' ) : 'transparent' }}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatINR(selectedRecord.earnings[key] || 0)}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: 'rgba(16, 185, 129, 0.08)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>Gross Earnings</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>{formatINR(selectedRecord.grossEarnings)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'error.main' }}>Deductions</Typography>
                  <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {Object.entries(deductionLabels).map(([key, label], index) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.2, bgcolor: index % 2 === 0 ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)' ) : 'transparent' }}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>-{formatINR(selectedRecord.deductions[key] || 0)}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: 'rgba(239, 68, 68, 0.08)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>Total Deductions</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main' }}>-{formatINR(selectedRecord.totalDeductions)}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Net pay */}
              <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Net Pay</Typography>
                  <Typography variant="caption" color="text.secondary">Amount credited to {selectedRecord.bankAccount}</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {formatINR(selectedRecord.netPay)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => handleDownload(selectedRecord)} sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Download PDF
                </Button>
                <Button variant="contained" className="btn-glow" startIcon={<Download />} onClick={handlePrint} sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Print
                </Button>
              </Stack>
            </DialogContent>
          </>
        )}
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

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Box>
  );
}

function TooltipIconButton({ title, onClick, children }) {
  return (
    <Tooltip title={title} arrow>
      <IconButton size="small" onClick={onClick} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.08)' } }}>
        {children}
      </IconButton>
    </Tooltip>
  );
}
