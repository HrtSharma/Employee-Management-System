import { useMemo, useState } from 'react';
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, InputAdornment, MenuItem, Paper, Snackbar, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Search, LocationOn, WorkOutline, Star, FilterAlt, Sort, Add, Edit, Delete, PersonAdd } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import EmployeeFormModal from '../components/EmployeeFormModal';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

export default function EmployeesPage() {
  const theme = useTheme();
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [designation, setDesignation] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const filteredEmployees = useMemo(() => {
    const filtered = employees.filter((employee) => {
      const matchesSearch = `${employee.name} ${employee.department} ${employee.designation} ${employee.skills.join(' ')}`.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = department === 'All' || employee.department === department;
      const matchesDesignation = designation === 'All' || employee.designation === designation;
      return matchesSearch && matchesDepartment && matchesDesignation;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      if (sortBy === 'satisfaction') return b.satisfaction - a.satisfaction;
      return a.department.localeCompare(b.department);
    });
  }, [department, designation, employees, search, sortBy]);

  const getStatusColor = (status) => {
    if (status === 'Active') return 'success';
    if (status === 'Remote') return 'info';
    if (status === 'On Leave') return 'warning';
    return 'default';
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ===== CRUD Handlers =====

  const handleAddClick = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingEmployee) {
      const result = await updateEmployee(editingEmployee.id, formData);
      if (result.success) {
        showSnackbar(`${formData.name}'s information updated successfully.`);
      } else {
        showSnackbar(result.message, 'error');
      }
      return result;
    } else {
      const result = await addEmployee(formData);
      if (result.success) {
        showSnackbar(`${formData.name} was added to the team.`);
      } else {
        showSnackbar(result.message, 'error');
      }
      return result;
    }
  };

  const handleDeleteClick = (employee) => {
    setDeleteTarget(employee);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const result = await deleteEmployee(deleteTarget.id);
    setDeleteLoading(false);
    if (result.success) {
      showSnackbar(`${deleteTarget.name} was removed from the team.`);
      setDeleteTarget(null);
    } else {
      showSnackbar(result.message, 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Box className="animate-fade-up" sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Employee Directory</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Manage, add, and update your team members.</Typography>
        </Box>
        <Button
          variant="contained"
          className="btn-glow"
          startIcon={<PersonAdd />}
          onClick={handleAddClick}
          sx={{ borderRadius: 3, px: 3, py: 1.2 }}
        >
          Add Employee
        </Button>
      </Box>

      <Paper className="card-surface" sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, role, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><FilterAlt fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}>
              <MenuItem value="All">All Departments</MenuItem>
              {[...new Set(employees.map((item) => item.department))].map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select fullWidth label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><WorkOutline fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}>
              <MenuItem value="All">All Roles</MenuItem>
              {[...new Set(employees.map((item) => item.designation))].map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select fullWidth label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Sort fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> }}>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="experience">Experience</MenuItem>
              <MenuItem value="satisfaction">Satisfaction</MenuItem>
              <MenuItem value="department">Department</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{filteredEmployees.length}</strong> of {employees.length} employees
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {filteredEmployees.map((employee, index) => (
          <Grid item xs={12} md={6} lg={4} key={employee.id} className={`animate-fade-up animation-delay-${(index % 4) + 1}`}>
            <Paper className="card-surface" sx={{ p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: getGradient(employee.name) }} />
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar className="avatar-ring" sx={{ width: 58, height: 58, background: getGradient(employee.name), fontWeight: 800, fontSize: 22 }}>
                  {employee.name.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{employee.designation}</Typography>
                </Box>
                <Chip label={employee.status} color={getStatusColor(employee.status)} size="small" sx={{ fontWeight: 700 }} />
              </Stack>

              <Stack direction="row" spacing={1} sx={{ my: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip label={employee.department} size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', fontWeight: 700, borderRadius: 2 }} />
                <Chip label={`${employee.experience} exp`} size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.1)', color: 'secondary.main', fontWeight: 700, borderRadius: 2 }} />
              </Stack>

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{employee.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star fontSize="small" sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Satisfaction: <strong style={{ color: theme.palette.text.primary }}>{employee.satisfaction}%</strong></Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skills</Typography>
                <Stack direction="row" spacing={0.8} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.8 }}>
                  {employee.skills.map((skill) => (
                    <Chip key={skill} label={skill} size="small" variant="outlined" sx={{ borderRadius: 2, fontSize: '0.72rem' }} />
                  ))}
                </Stack>
              </Box>

              {/* Action buttons */}
              <Stack direction="row" spacing={1} sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => handleEditClick(employee)}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Edit
                </Button>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteClick(employee)}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  Delete
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {filteredEmployees.length === 0 && (
        <Paper className="card-surface" sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>No employees found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Try adjusting your search or filters.</Typography>
          <Button variant="contained" className="btn-glow" startIcon={<Add />} onClick={handleAddClick} sx={{ mt: 3, borderRadius: 3 }}>
            Add your first employee
          </Button>
        </Paper>
      )}

      {/* Add/Edit Modal */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        employee={editingEmployee}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
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