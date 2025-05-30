import { Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/features/authSlice';

const UserAvatar = ({ sx, size = 40, ...props }) => {
  const user = useSelector(selectCurrentUser);
  
  // Get avatar from user data - check both avatar and profileInfo.avatar
  const avatarUrl = user?.avatar || user?.profileInfo?.avatar;
  
  // Generate initials from user name
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      const nameParts = user.name.split(' ');
      return nameParts.length > 1 
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : user.name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Avatar
      src={avatarUrl}
      sx={{
        width: size,
        height: size,
        fontSize: size > 40 ? '1.1rem' : '1rem',
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    >
      {getInitials()}
    </Avatar>
  );
};

export default UserAvatar; 