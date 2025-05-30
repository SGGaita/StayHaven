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
  CircularProgress,
  Chip,
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
  Money as MoneyIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logout } from '@/redux/features/authSlice';
import { useAuthSync } from '@/hooks/useAuthSync';
import { alpha } from '@mui/material/styles';
import UserAvatar from '@/components/UserAvatar';

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
  
  // Use the auth sync hook to ensure cookies are set for API requests
  useAuthSync();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
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

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch('/api/notifications?limit=5', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAllAsRead: true })
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REJECTED':
        return <BookingIcon />;
      case 'PROPERTY_APPROVED':
      case 'PROPERTY_REJECTED':
        return <HomeIcon />;
      case 'PAYMENT_RECEIVED':
        return <MoneyIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
      case 'PROPERTY_APPROVED':
      case 'PAYMENT_RECEIVED':
        return 'success';
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REJECTED':
      case 'PROPERTY_REJECTED':
        return 'error';
      default:
        return 'primary';
    }
  };

  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          height: 70,
          borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
          background: `linear-gradient(135deg, ${alpha('#FF385C', 0.02)} 0%, ${alpha('#FF385C', 0.01)} 100%)`,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={() => router.push('/')}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: `linear-gradient(135deg, #FF385C, #E61E4D)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha('#FF385C', 0.3)}`,
            }}
          >
            <HomeIcon sx={{ color: 'white', fontSize: '1.25rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: '#FF385C', fontWeight: 700, lineHeight: 1 }}>
            StayHaven
          </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              {user?.role?.toLowerCase().replace('_', ' ')}
          </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha('#FF385C', 0.1),
                color: '#FF385C',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${alpha('#FF385C', 0.1)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <UserAvatar 
            size={48}
            sx={{ 
              background: `linear-gradient(135deg, #FF385C, #E61E4D)`,
              border: `2px solid ${alpha('#FF385C', 0.2)}`,
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ 
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2, overflow: 'auto' }}>
        <List sx={{ px: 2 }}>
        {menuItems.map((item, index) => (
          item.category ? (
              <Box key={item.category} sx={{ mb: 2 }}>
              <Typography
                variant="overline"
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    display: 'block',
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
              >
                {item.category}
              </Typography>
                {item.items.map((subItem, subIndex) => (
                  <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavigation(subItem.path)}
                    sx={{
                        borderRadius: 2,
                        mx: 1,
                        px: 2,
                        py: 1.5,
                        transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                          backgroundColor: alpha('#FF385C', 0.08),
                          transform: 'translateX(4px)',
                          '& .MuiListItemIcon-root': {
                            color: '#FF385C',
                          },
                          '& .MuiListItemText-primary': {
                            color: '#FF385C',
                            fontWeight: 600,
                          },
                      },
                      '&.Mui-selected': {
                          backgroundColor: alpha('#FF385C', 0.12),
                          borderLeft: `3px solid #FF385C`,
                          '& .MuiListItemIcon-root': {
                            color: '#FF385C',
                          },
                          '& .MuiListItemText-primary': {
                            color: '#FF385C',
                            fontWeight: 700,
                          },
                        '&:hover': {
                            backgroundColor: alpha('#FF385C', 0.15),
                        },
                      },
                    }}
                      selected={window.location.pathname === subItem.path}
                  >
                      <ListItemIcon sx={{ 
                        minWidth: 40,
                        color: 'text.secondary',
                        transition: 'color 0.2s ease-in-out',
                      }}>
                        {subItem.icon}
                      </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text} 
                      primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease-in-out',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Box>
          ) : (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                    borderRadius: 2,
                    mx: 1,
                    px: 2,
                    py: 1.5,
                    transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                      backgroundColor: alpha('#FF385C', 0.08),
                      transform: 'translateX(4px)',
                      '& .MuiListItemIcon-root': {
                        color: '#FF385C',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#FF385C',
                        fontWeight: 600,
                      },
                  },
                  '&.Mui-selected': {
                      backgroundColor: alpha('#FF385C', 0.12),
                      borderLeft: `3px solid #FF385C`,
                      '& .MuiListItemIcon-root': {
                        color: '#FF385C',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#FF385C',
                        fontWeight: 700,
                      },
                    '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.15),
                    },
                  },
                }}
                  selected={window.location.pathname === item.path}
              >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    color: 'text.secondary',
                    transition: 'color 0.2s ease-in-out',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease-in-out',
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
      </Box>

      {/* Action Button for Property Managers */}
      {user?.role === 'PROPERTY_MANAGER' && (
        <Box sx={{ p: 3, borderTop: `1px solid ${alpha('#FF385C', 0.1)}` }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() => router.push('/dashboard/properties/new')}
            sx={{
              borderRadius: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: `linear-gradient(135deg, #FF385C, #E61E4D)`,
              boxShadow: `0 4px 16px ${alpha('#FF385C', 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, #E61E4D, #D01242)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 24px ${alpha('#FF385C', 0.4)}`,
              },
            }}
          >
            Add New Property
          </Button>
        </Box>
      )}

      {/* Quick Stats for Customers */}
      {user?.role === 'CUSTOMER' && (
        <Box sx={{ p: 3, borderTop: `1px solid ${alpha('#FF385C', 0.1)}` }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            mb: 2,
            display: 'block',
          }}>
            Quick Stats
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Active Bookings</Typography>
              <Chip 
                label="2" 
                size="small" 
                sx={{ 
                  backgroundColor: alpha('#FF385C', 0.1),
                  color: '#FF385C',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Saved Properties</Typography>
              <Chip 
                label="5" 
                size="small" 
                sx={{ 
                  backgroundColor: alpha('#FF385C', 0.1),
                  color: '#FF385C',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Logout Button */}
      <Box sx={{ p: 3, borderTop: `1px solid ${alpha('#FF385C', 0.1)}`, mt: 'auto' }}>
        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          fullWidth
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderColor: alpha('#FF385C', 0.3),
            color: '#FF385C',
            '&:hover': {
              borderColor: '#FF385C',
              backgroundColor: alpha('#FF385C', 0.05),
              transform: 'translateY(-1px)',
            },
          }}
        >
          Sign Out
        </Button>
      </Box>
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
              borderBottom: `1px solid ${alpha('#FF385C', 0.1)}`,
              boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.06)}`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Toolbar sx={{ height: 70, px: 3 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ 
                  mr: 2, 
                  display: { md: 'none' },
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha('#FF385C', 0.1),
                    color: '#FF385C',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ flexGrow: 1 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tooltip title="Notifications">
                  <IconButton
                    size="large"
                    onClick={handleNotificationsOpen}
                    sx={{ 
                      mr: 1,
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.1),
                        color: '#FF385C',
                      },
                    }}
                  >
                    <Badge 
                      badgeContent={unreadCount} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#FF385C',
                          color: 'white',
                          fontWeight: 600,
                        },
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {user?.role?.toLowerCase().replace('_', ' ')}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{ 
                      ml: 1,
                      '&:hover': {
                        backgroundColor: alpha('#FF385C', 0.1),
                      },
                    }}
                  >
                    <UserAvatar 
                      size={40}
                      sx={{ 
                        background: `linear-gradient(135deg, #FF385C, #E61E4D)`,
                        border: `2px solid ${alpha('#FF385C', 0.2)}`,
                      }}
                    />
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
                <Box sx={{ width: 360, maxHeight: 500 }}>
                  <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {unreadCount > 0 ? `You have ${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </Typography>
                    </Box>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        onClick={markAllAsRead}
                        sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                      >
                        Mark all read
                      </Button>
                    )}
                  </Box>
                  <Divider />
                  
                  {loadingNotifications ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No notifications yet
                        </Typography>
                      </Box>
                  ) : (
                    notifications.map((notification) => (
                      <MenuItem 
                        key={notification.id}
                        sx={{ 
                          px: 2, 
                          py: 1.5,
                          backgroundColor: notification.isRead ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                          borderLeft: notification.isRead ? 'none' : `3px solid ${theme.palette.primary.main}`,
                        }}
                        onClick={() => {
                          if (!notification.isRead) {
                            markNotificationAsRead(notification.id);
                          }
                        }}
                      >
                    <Box sx={{ display: 'flex', gap: 1.5, width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: `${getNotificationColor(notification.type)}.lighter`, 
                              color: `${getNotificationColor(notification.type)}.main`,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                      </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="body2" 
                              fontWeight={notification.isRead ? 'normal' : 'medium'}
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {notification.title}
                        </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              display="block"
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mt: 0.5,
                              }}
                            >
                              {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {formatNotificationTime(notification.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                    ))
                  )}
                  
                  <Divider />
                  <Box sx={{ p: 1.5, textAlign: 'center' }}>
                    <Button
                      color="primary"
                      size="small"
                      onClick={() => {
                        handleNotificationsClose();
                        router.push('/dashboard/notifications');
                      }}
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
                  background: theme.palette.background.paper,
                  borderRight: `1px solid ${alpha('#FF385C', 0.1)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
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
                  background: theme.palette.background.paper,
                  borderRight: `1px solid ${alpha('#FF385C', 0.1)}`,
                  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
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