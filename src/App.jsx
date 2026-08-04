import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import ProfilePage from './pages/ProfilePage';
import RecognitionPage from './pages/RecognitionPage';
import SurveysPage from './pages/SurveysPage';
import ActivitiesPage from './pages/ActivitiesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

function AppRoutes() {
  const { auth } = useAppContext();

  return (
    <Routes>
      <Route path="/login" element={auth.isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={auth.isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={auth.isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/recognition" element={<RecognitionPage />} />
        <Route path="/surveys" element={<SurveysPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={auth.isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('engagement-theme') || 'light');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
          secondary: { main: '#a855f7', light: '#c084fc', dark: '#7c3aed' },
          success: { main: '#10b981' },
          warning: { main: '#f59e0b' },
          error: { main: '#ef4444' },
          info: { main: '#0ea5e9' },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#f4f6fb',
            paper: mode === 'dark' ? '#111827' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
            secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
          },
        },
        typography: {
          fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
          h1: { fontWeight: 800 },
          h2: { fontWeight: 800 },
          h3: { fontWeight: 800 },
          h4: { fontWeight: 800, letterSpacing: '-0.02em' },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
          borderRadius: 14,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                padding: '10px 22px',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 8px 22px rgba(99, 102, 241, 0.25)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  '&:hover fieldset': {
                    borderColor: '#a5b4fc',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                    borderWidth: 2,
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.12)',
                  },
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                fontWeight: 600,
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                margin: '4px 10px',
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                borderRadius: 10,
                fontSize: '0.78rem',
              },
            },
          },
          MuiBackdrop: {
            styleOverrides: {
              root: {
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(4px)',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider mode={mode} setMode={setMode}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;