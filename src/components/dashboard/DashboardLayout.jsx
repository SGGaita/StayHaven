'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  BookOnline as BookingIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  SupervisorAccount as AdminIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Star as StarIcon,
  Link as LinkIcon,
  Article as ArticleIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/redux/features/authSlice';

const drawerWidth = 240;

// Role-based menu items
const getMenuItems = (role) => {
  if (!role) return []; // Return empty array if no role is provided

  const commonItems = [
    { text: 'Overview', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  const roleBasedItems = {
    ADMIN: [
      {
        category: 'Management',
        items: [
          { text: 'Users', icon: <PersonIcon />, path: '/dashboard/admin/users' },
          { text: 'Properties', icon: <ApartmentIcon />, path: '/dashboard/admin/properties' },
          { text: 'Bookings', icon: <BookingIcon />, path: '/dashboard/admin/bookings' },
        ],
      },
      {
        category: 'Communication',
        items: [
          { text: 'Messages', icon: <MessageIcon />, path: '/dashboard/admin/messages' },
        ],
      },
      {
        category: 'Content Management',
        items: [
          { text: 'Navigation', icon: <LinkIcon />, path: '/dashboard/admin/cms/navigation' },
          { text: 'Pages', icon: <ArticleIcon />, path: '/dashboard/admin/cms/pages' },
          { text: 'Email Templates', icon: <EmailIcon />, path: '/dashboard/admin/cms/email-templates' },
        ],
      },
      {
        category: 'System',
        items: [
          { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/admin/settings' },
          { text: 'Security', icon: <SecurityIcon />, path: '/dashboard/admin/security' },
        ],
      },
    ],
    SUPER_ADMIN: [
      {
        category: 'Management',
        items: [
          { text: 'Users', icon: <PersonIcon />, path: '/dashboard/admin/users' },
          { text: 'Properties', icon: <ApartmentIcon />, path: '/dashboard/admin/properties' },
          { text: 'Bookings', icon: <BookingIcon />, path: '/dashboard/admin/bookings' },
        ],
      },
      {
        category: 'Communication',
        items: [
          { text: 'Messages', icon: <MessageIcon />, path: '/dashboard/admin/messages' },
        ],
      },
      {
        category: 'Content Management',
        items: [
          { text: 'Navigation', icon: <LinkIcon />, path: '/dashboard/admin/cms/navigation' },
          { text: 'Pages', icon: <ArticleIcon />, path: '/dashboard/admin/cms/pages' },
          { text: 'Email Templates', icon: <EmailIcon />, path: '/dashboard/admin/cms/email-templates' },
        ],
      },
      {
        category: 'System',
        items: [
          { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/admin/settings' },
          { text: 'Security', icon: <SecurityIcon />, path: '/dashboard/admin/security' },
        ],
      },
    ],
    PROPERTY_MANAGER: [
      { text: 'My Properties', icon: <ApartmentIcon />, path: '/dashboard/properties' },
      { text: 'Bookings', icon: <BookingIcon />, path: '/dashboard/bookings' },
      { text: 'Messages', icon: <MessageIcon />, path: '/dashboard/messages' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
    ],
    CUSTOMER: [
      { text: 'My Bookings', icon: <BookingIcon />, path: '/dashboard/bookings' },
      { text: 'Favorites', icon: <StarIcon />, path: '/dashboard/favorites' },
      { text: 'Messages', icon: <MessageIcon />, path: '/dashboard/messages' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
    ],
  };

  // Check if the role exists in our defined roles
  if (!roleBasedItems[role]) {
    console.warn(`Unknown role: ${role}, defaulting to empty menu`);
    return [];
  }

  return [...commonItems, ...roleBasedItems[role]];
};

const StyledMenu = ({ anchorEl, open, onClose, children }) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    PaperProps={{
      elevation: 0,
      sx: {
        mt: 1.5,
        overflow: 'visible',
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.08))',
        '&:before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          right: 14,
          width: 10,
          height: 10,
          bgcolor: 'background.paper',
          transform: 'translateY(-50%) rotate(45deg)',
          zIndex: 0,
        },
        '& .MuiMenuItem-root': {
          px: 2,
          py: 1.5,
          my: 0.25,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'primary.lighter',
          },
          '& .MuiListItemIcon-root': {
            color: 'primary.main',
            minWidth: 36,
          },
        },
      },
    }}
  >
    {children}
  </Menu>
);

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle all redirections in a single useEffect
  useEffect(() => {
    if (!user || !user.role) {
      router.push('/auth/signin');
      return;
    }

    // Get the current path from the window location
    const currentPath = window.location.pathname;

    // For admin users, only redirect if they're not in any admin-related path
    if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && 
        !currentPath.startsWith('/dashboard/admin')) {
      router.push('/dashboard/admin');
    }

    // For non-admin users, redirect to their dashboard if they try to access admin routes
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && 
        currentPath.startsWith('/dashboard/admin')) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Get menu items based on user role
  const menuItems = getMenuItems(user?.role);

  // If we haven't yet determined if we're on client side, return null
  if (!isClient) {
    return null;
  }

  // Only render the layout if we have a valid user with a role
  if (!user || !user.role) {
    return null;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/signin');
  };

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
          height: 70,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/')}
        >
          <HomeIcon color="primary" />
          <Typography variant="h6" color="primary" fontWeight="bold">
            StayHaven
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ pt: 2 }}>
        {menuItems.map((item, index) => (
          item.category ? (
            <Box key={item.category}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ px: 3, py: 1.5, display: 'block' }}
              >
                {item.category}
              </Typography>
              {item.items.map((subItem) => (
                <ListItem key={subItem.text} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(subItem.path)}
                    sx={{
                      borderRadius: '0 20px 20px 0',
                      mr: 2,
                      mb: 0.5,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                    selected={router.pathname === subItem.path}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{subItem.icon}</ListItemIcon>
                    <ListItemText 
                      primary={subItem.text} 
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: router.pathname === subItem.path ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Box>
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mr: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  },
                }}
                selected={router.pathname === item.path}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: router.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
      {user?.role === 'PROPERTY_MANAGER' && (
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => router.push('/dashboard/properties/new')}
            sx={{
              borderRadius: '20px',
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add New Property
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Only render the layout if we have a valid user with a role */}
      {user && user.role ? (
        <>
          <AppBar
            position="fixed"
            sx={{
              width: { md: `calc(100% - ${drawerWidth}px)` },
              ml: { md: `${drawerWidth}px` },
              backgroundColor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
            }}
          >
            <Toolbar sx={{ height: 70 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ flexGrow: 1 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title="Notifications">
                  <IconButton
                    size="large"
                    onClick={handleNotificationsOpen}
                    sx={{ mr: 1 }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" color="text.secondary">
                      {user?.role?.toLowerCase().replace('_', ' ')}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '1rem',
                      }}
                    >
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Avatar>
                  </IconButton>
                </Box>
              </Box>

              <StyledMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Signed in as
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Profile" 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: 500
                    }} 
                  />
                </MenuItem>
                {user?.role === 'SUPER_ADMIN' && (
                  <MenuItem onClick={() => handleNavigation('/admin')}>
                    <ListItemIcon>
                      <AdminIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Admin Panel" 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: 500
                      }} 
                    />
                  </MenuItem>
                )}
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon sx={{ color: 'error.main' }}>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sign out" 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: 500,
                      color: 'error.main'
                    }} 
                  />
                </MenuItem>
              </StyledMenu>

              <StyledMenu
                anchorEl={notificationsAnchor}
                open={Boolean(notificationsAnchor)}
                onClose={handleNotificationsClose}
              >
                <Box sx={{ width: 320, maxHeight: 400 }}>
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You have 3 new notifications
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                      <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main' }}>
                        <BookingIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          New Booking Request
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          John Doe requested to book Sunset Villa
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          2 minutes ago
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem sx={{ px: 2, py: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                      <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main' }}>
                        <StarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          New Review
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          5-star review for Mountain View Cabin
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          1 hour ago
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <Divider />
                  <Box sx={{ p: 1.5, textAlign: 'center' }}>
                    <Button
                      color="primary"
                      size="small"
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      View All Notifications
                    </Button>
                  </Box>
                </Box>
              </StyledMenu>
            </Toolbar>
          </AppBar>

          <Box
            component="nav"
            sx={{
              width: { md: drawerWidth },
              flexShrink: { md: 0 },
            }}
          >
            {/* Mobile drawer */}
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better mobile performance
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
            >
              {drawer}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { md: `calc(100% - ${drawerWidth}px)` },
              minHeight: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            <Toolbar sx={{ height: 70 }} /> {/* Spacer for AppBar */}
            {children}
          </Box>
        </>
      ) : null}
    </Box>
  );
} 