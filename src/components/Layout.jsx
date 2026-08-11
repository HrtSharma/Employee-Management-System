import { AppBar, Avatar, Badge, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon, Dashboard, Groups, EmojiEvents, Assessment, EventAvailable, Campaign, Person, Logout, Brightness4, Brightness7, KeyboardArrowDown, NotificationsNone, Psychology, ChevronLeft, ChevronRight, Payments, Payment, History, AdminPanelSettings } from '@mui/icons-material';
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const drawerWidth = 260;
const collapsedWidth = 88;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <Dashboard fontSize="small" /> },
  { label: 'Employees', path: '/employees', icon: <Groups fontSize="small" /> },
  { label: 'Recognition', path: '/recognition', icon: <EmojiEvents fontSize="small" /> },
  { label: 'Surveys', path: '/surveys', icon: <Assessment fontSize="small" /> },
  { label: 'Activities', path: '/activities', icon: <EventAvailable fontSize="small" /> },
  { label: 'Announcements', path: '/announcements', icon: <Campaign fontSize="small" /> },
  { label: 'Compensation', path: '/compensation', icon: <Payments fontSize="small" /> },
  { label: 'Payroll', path: '/payroll', icon: <Payment fontSize="small" /> },
  { label: 'Salary History', path: '/salary-history', icon: <History fontSize="small" /> },
  { label: 'Salary Setup', path: '/salary-setup', icon: <AdminPanelSettings fontSize="small" /> },
];

const gradientColors = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, logout, toggleTheme, themeMode } = useAppContext();
  const isAdmin = auth?.user?.role === 'Admin';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenu = (e) => setProfileMenu(e.currentTarget);
  const handleProfileClose = () => setProfileMenu(null);

  const effectiveCollapsed = collapsed && !isMobile;
  const currentWidth = effectiveCollapsed ? collapsedWidth : drawerWidth;

  const getAvatarGradient = (name = '') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradientColors[Math.abs(hash) % gradientColors.length];
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(16px)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: effectiveCollapsed ? 'center' : 'space-between', px: effectiveCollapsed ? 1 : 2.5, minHeight: 64 }}>
        {!effectiveCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
              <Psychology sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EngageHub
            </Typography>
          </Box>
        )}
        {!effectiveCollapsed && isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
        {effectiveCollapsed && (
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}>
            <Psychology sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
        )}
      </Box>
      <Divider sx={{ mx: 2 }} />
      <List sx={{ flexGrow: 1, py: 1.5 }}>
        {navItems.map((item) => {
          // Only show Salary Setup to admins
          if (item.path === '/salary-setup' && !isAdmin) return null;
          const active = location.pathname === item.path;
          return (
            <Tooltip key={item.path} title={effectiveCollapsed ? item.label : ''} placement="right" arrow>
              <ListItemButton
                className={`nav-item ${active ? 'nav-item-active' : ''}`}
                selected={active}
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{ justifyContent: effectiveCollapsed ? 'center' : 'flex-start', px: effectiveCollapsed ? 0 : 2 }}
              >
                <ListItemIcon sx={{ minWidth: effectiveCollapsed ? 0 : 40, justifyContent: 'center', color: active ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                {!effectiveCollapsed && <ListItemText primary={item.label} />}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
      <Divider sx={{ mx: 2 }} />
      <Box sx={{ p: effectiveCollapsed ? 1 : 2 }}>
        {!effectiveCollapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 3, background: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)' }}>
            <Avatar sx={{ width: 38, height: 38, background: getAvatarGradient(auth.user?.name || 'Admin'), fontSize: 15, fontWeight: 700 }} src={auth.user?.photo || undefined}>
              {(auth.user?.name || 'A').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{auth.user?.name || 'Admin User'}</Typography>
              <Typography variant="caption" color="text.secondary">{auth.user?.role || 'HR Lead'}</Typography>
            </Box>
            <IconButton size="small" onClick={handleProfileMenu}>
              <KeyboardArrowDown fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title={auth.user?.name || 'Admin'} placement="right" arrow>
              <Avatar sx={{ width: 40, height: 40, background: getAvatarGradient(auth.user?.name || 'Admin'), cursor: 'pointer' }} onClick={handleProfileMenu} src={auth.user?.photo || undefined}>
                {(auth.user?.name || 'A').charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          </Box>
        )}
        <Menu anchorEl={profileMenu} open={Boolean(profileMenu)} onClose={handleProfileClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <MenuItem onClick={() => { handleProfileClose(); navigate('/profile'); }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            My Profile
          </MenuItem>
          <MenuItem onClick={() => { handleProfileClose(); toggleTheme(); }}>
            <ListItemIcon>{themeMode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}</ListItemIcon>
            {themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleProfileClose(); logout(); navigate('/login'); }}>
            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <div className="app-backdrop" />
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}` }}>
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}>
            <MenuIcon />
          </IconButton>
          {!isMobile && (
            <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ mr: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          )}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>
              {navItems.find((item) => item.path === location.pathname)?.label || 'Employee Engagement'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Notifications" arrow>
            <IconButton sx={{ color: 'text.secondary', mr: 0.5 }}>
              <Badge color="error" variant="dot">
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} arrow>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary', mr: 0.5 }}>
              {themeMode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, ml: 1 }}>
            <Avatar
              className="avatar-ring"
              sx={{ width: 36, height: 36, background: getAvatarGradient(auth.user?.name || 'Admin'), fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              onClick={handleProfileMenu}
              src={auth.user?.photo || undefined}
            >
              {(auth.user?.name || 'A').charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>{auth.user?.name || 'Admin'}</Typography>
              <Typography variant="caption" color="text.secondary">{auth.user?.role || 'HR Lead'}</Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: currentWidth }, flexShrink: { md: 0 }, transition: 'width 0.25s ease' }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentWidth, border: 'none', transition: 'width 0.25s ease', overflowX: 'hidden' },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3.5 }, mt: '64px', minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}