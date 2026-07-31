import { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useAppContext } from '../context/AppContext';

export default function EmployeesPage() {
  const { employees } = useAppContext();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [designation, setDesignation] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const filteredEmployees = useMemo(() => {
    const filtered = employees.filter((employee) => {
      const matchesSearch = `${employee.name} ${employee.department} ${employee.designation}`.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = department === 'All' || employee.department === department;
      const matchesDesignation = designation === 'All' || employee.designation === designation;
      return matchesSearch && matchesDepartment && matchesDesignation;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'experience') return parseInt(b.experience) - parseInt(a.experience);
      return a.department.localeCompare(b.department);
    });
  }, [department, designation, employees, search, sortBy]);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Employee Directory</Typography>
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }} className="card-surface">
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Search employees" value={search} onChange={(e) => setSearch(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              {[...new Set(employees.map((item) => item.department))].map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select fullWidth label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)}>
              <MenuItem value="All">All</MenuItem>
              {[...new Set(employees.map((item) => item.designation))].map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="experience">Experience</MenuItem>
              <MenuItem value="department">Department</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid item xs={12} md={6} lg={4} key={employee.id}>
            <Card className="card-surface">
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{employee.name}</Typography>
                <Typography color="text.secondary">{employee.designation}</Typography>
                <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                  <Chip label={employee.department} color="primary" size="small" />
                  <Chip label={employee.status} size="small" />
                </Stack>
                <Typography variant="body2">Location: {employee.location}</Typography>
                <Typography variant="body2">Experience: {employee.experience}</Typography>
                <Typography variant="body2">Skills: {employee.skills.join(', ')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
