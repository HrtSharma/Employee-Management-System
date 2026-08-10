import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, MenuItem, Paper, Snackbar, Stack, Tab, Tabs, TextField, Typography, useTheme,
} from '@mui/material';
import {
  AdminPanelSettings, Save, Search, Lock, Person, Payments, AccountBalanceWallet, TrendingUp, CheckCircle, Edit,
} from '@mui/icons-material';
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

const componentFields = [
  { key: 'basic', label: 'Basic Salary', hint: '40-50% of gross' },
  { key: 'hra', label: 'House Rent Allowance (HRA)', hint: '~45% of basic' },
  { key: 'specialAllowance', label: 'Special Allowance', hint: 'Flexible component' },
  { key: 'conveyanceAllowance', label: 'Conveyance Allowance', hint: 'Max ₹3,200' },
  { key: 'medicalAllowance', label: 'Medical Allowance', hint: '₹1,250 standard' },
  { key: 'lta', label: 'Leave Travel Allowance (LTA)', hint: '~1/12 of basic' },
  { key: 'performanceBonus', label: 'Performance Bonus', hint: 'Variable pay' },
  { key: 'employerPF', label: 'Employer PF Contribution', hint: '12% of basic' },
  { key: 'employerESI', label: 'Employer ESI Contribution', hint: '0 if not applicable' },
  { key: 'gratuity', label: 'Gratuity', hint: '4.81% of basic' },
];

const deductionFields = [
  { key: 'pf', label: 'Provident Fund (PF)', hint: '12% of basic' },
  { key: 'professionalTax', label: 'Professional Tax', hint: '₹200 standard' },
  { key: 'incomeTax', label: 'Income Tax (TDS)', hint: 'As per slab' },
  { key: 'insurance', label: 'Insurance Premium', hint: 'Health/life' },
];

export default function SalarySetupPage() {
  const theme = useTheme();
  const { employees, auth } = useAppContext();
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [payBands, setPayBands] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [tab, setTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Form state
  const [form, setForm] = useState(null);

  const isAdmin = auth?.user?.role === 'Admin';

  useEffect(() => {
    const loadData = async () => {
      const [structures, bands] = await Promise.all([
        payrollDB.getSalaryStructures(),
        payrollDB.getPayBands(),
      ]);
      setSalaryStructures(structures);
      setPayBands(bands);
    };
    loadData();
  }, []);

  const enrichedStructures = useMemo(() => {
    return salaryStructures.map((structure) => {
      const employee = employees.find((e) => e.id === structure.employeeId);
      const gross = Object.values(structure.components).reduce((sum, v) => sum + (Number(v) || 0), 0);
      const deductions = Object.values(structure.deductions).reduce((sum, v) => sum + (Number(v) || 0), 0);
      const band = payBands.find((b) => b.id === structure.payBand);
      return { ...structure, employee, gross, deductions, net: gross - deductions, band };
    });
  }, [employees, payBands, salaryStructures]);

  const filteredStructures = useMemo(() => {
    return enrichedStructures.filter((s) => {
      const query = search.toLowerCase();
      return (
        (s.employee?.name || '').toLowerCase().includes(query) ||
        (s.employee?.designation || '').toLowerCase().includes(query) ||
        (s.employee?.department || '').toLowerCase().includes(query) ||
        (s.payBand || '').toLowerCase().includes(query)
      );
    });
  }, [enrichedStructures, search]);

  const selectedStructure = enrichedStructures.find((s) => s.employeeId === Number(selectedEmployeeId)) || null;

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    const structure = enrichedStructures.find((s) => s.employeeId === Number(employeeId));
    if (structure) {
      setForm(JSON.parse(JSON.stringify(structure)));
    }
    setDirty(false);
    setTab(0);
  };

  const handleComponentChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      components: { ...prev.components, [key]: Number(value) || 0 },
    }));
    setDirty(true);
  };

  const handleDeductionChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      deductions: { ...prev.deductions, [key]: Number(value) || 0 },
    }));
    setDirty(true);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const gross = Object.values(form.components).reduce((sum, v) => sum + (Number(v) || 0), 0);
      const totalDeductions = Object.values(form.deductions).reduce((sum, v) => sum + (Number(v) || 0), 0);
      const netPay = gross - totalDeductions;

      await payrollDB.saveSalaryStructure(form.employeeId, {
        ...form,
        grossEarnings: gross,
        netPay,
      });

      // Refresh local state
      const structures = await payrollDB.getSalaryStructures();
      setSalaryStructures(structures);
      setDirty(false);
      setSnackbar({ open: true, message: 'Salary structure saved successfully.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    handleSave();
  };

  const grossEarnings = form ? Object.values(form.components).reduce((sum, v) => sum + (Number(v) || 0), 0) : 0;
  const totalDeductions = form ? Object.values(form.deductions).reduce((sum, v) => sum + (Number(v) || 0), 0) : 0;
  const netPay = grossEarnings - totalDeductions;

  if (!isAdmin) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'error.main', mb: 3 }}>
          <Lock sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Access Denied</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 400 }}>
          You need administrator privileges to access the Salary Setup area. Please contact your system administrator.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}>
              <AdminPanelSettings sx={{ color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Salary Setup</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>Admin-only: Define and manage employee salary structures.</Typography>
            </Box>
          </Stack>
        </Box>
        <Chip icon={<AdminPanelSettings />} label="Admin Only" color="warning" sx={{ fontWeight: 700, px: 1 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Left: Employee list */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper className="card-surface" sx={{ p: 2.5, position: 'sticky', top: 90 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', pr: 0.5 }}>
              <Stack spacing={1}>
                {filteredStructures.map((structure) => (
                  <Box
                    key={structure.employeeId}
                    onClick={() => handleSelectEmployee(structure.employeeId)}
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      cursor: 'pointer',
                      border: `1.5px solid ${selectedEmployeeId === structure.employeeId ? theme.palette.primary.main : 'transparent'}`,
                      bgcolor: selectedEmployeeId === structure.employeeId ? 'rgba(99, 102, 241, 0.08)' : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: theme.palette.primary.main, bgcolor: 'rgba(99, 102, 241, 0.05)' },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 36, height: 36, background: getGradient(structure.employee?.name || ''), fontSize: 14, fontWeight: 700 }}>
                        {(structure.employee?.name || '?').charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {structure.employee?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {structure.employee?.designation || ''}
                        </Typography>
                      </Box>
                      <Chip size="small" label={structure.payBand} sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                    </Stack>
                  </Box>
                ))}
                {filteredStructures.length === 0 && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No employees found
                  </Typography>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Right: Edit form */}
        <Grid item xs={12} md={7} lg={8}>
          {!selectedStructure || !form ? (
            <Paper className="card-surface" sx={{ p: 8, textAlign: 'center' }}>
                      <Person sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Select an employee</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Choose an employee from the list to view and edit their salary structure.
                </Typography>
              </Paper>
          ) : (
            <Paper className="card-surface" sx={{ p: 3 }}>
              {/* Employee header */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Avatar sx={{ width: 56, height: 56, background: getGradient(selectedStructure.employee?.name || ''), fontSize: 22, fontWeight: 800 }}>
                  {(selectedStructure.employee?.name || '?').charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedStructure.employee?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStructure.employee?.designation} · {selectedStructure.employee?.department}
                  </Typography>
                </Box>
                <Chip
                  icon={<Edit />}
                  label={dirty ? 'Unsaved changes' : 'Saved'}
                  color={dirty ? 'warning' : 'success'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {/* Tabs */}
              <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700 } }}>
                <Tab icon={<Payments fontSize="small" />} iconPosition="start" label="Earnings" />
                <Tab icon={<AccountBalanceWallet fontSize="small" />} iconPosition="start" label="Deductions" />
                <Tab icon={<TrendingUp fontSize="small" />} iconPosition="start" label="Pay Band & CTC" />
              </Tabs>

              {tab === 0 && (
                <Grid container spacing={2}>
                  {componentFields.map((field) => (
                    <Grid item xs={12} sm={6} key={field.key}>
                      <TextField
                        fullWidth
                        label={field.label}
                        type="number"
                        value={form.components[field.key] || 0}
                        onChange={(e) => handleComponentChange(field.key, e.target.value)}
                        helperText={field.hint}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {tab === 1 && (
                <Grid container spacing={2}>
                  {deductionFields.map((field) => (
                    <Grid item xs={12} sm={6} key={field.key}>
                      <TextField
                        fullWidth
                        label={field.label}
                        type="number"
                        value={form.deductions[field.key] || 0}
                        onChange={(e) => handleDeductionChange(field.key, e.target.value)}
                        helperText={field.hint}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {tab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Pay Band"
                      value={form.payBand}
                      onChange={(e) => handleFieldChange('payBand', e.target.value)}
                    >
                      {payBands.map((band) => (
                        <MenuItem key={band.id} value={band.id}>
                          {band.id} — {band.label} ({band.range})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Annual CTC (₹)"
                      type="number"
                      value={form.ctc}
                      onChange={(e) => handleFieldChange('ctc', Number(e.target.value) || 0)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Effective Date"
                      type="date"
                      value={form.effectiveDate || ''}
                      onChange={(e) => handleFieldChange('effectiveDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bank Account"
                      value={form.bankAccount || ''}
                      onChange={(e) => handleFieldChange('bankAccount', e.target.value)}
                    />
                  </Grid>
                </Grid>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Summary */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.08)', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gross / Month</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>{formatINR(grossEarnings)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.08)', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deductions</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main' }}>-{formatINR(totalDeductions)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(16, 185, 129, 0.08)', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net Pay</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'success.main' }}>{formatINR(netPay)}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={() => setConfirmOpen(true)}
                  disabled={!dirty || saving}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Confirm Save Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 800 }}>
          <CheckCircle color="success" /> Confirm Save
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to save the updated salary structure for <strong>{selectedStructure?.employee?.name}</strong>?
          </Typography>
          <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.06)' }}>
            <Typography variant="body2"><strong>Gross:</strong> {formatINR(grossEarnings)}</Typography>
            <Typography variant="body2"><strong>Deductions:</strong> {formatINR(totalDeductions)}</Typography>
            <Typography variant="body2"><strong>Net Pay:</strong> {formatINR(netPay)}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmSave} variant="contained" color="primary" startIcon={<Save />}>
            Confirm Save
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