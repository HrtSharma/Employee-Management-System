import { Avatar } from '@mui/material';

const avatarGradients = ['linear-gradient(135deg, #6366f1, #a855f7)', 'linear-gradient(135deg, #ec4899, #f59e0b)', 'linear-gradient(135deg, #10b981, #0ea5e9)', 'linear-gradient(135deg, #f59e0b, #ef4444)'];

// Deterministic gradient background derived from a name (stable per user)
export function getGradient(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
}

// "Ava Patel" -> "AP"
export function getInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

/**
 * Shared employee/user avatar.
 * Renders the uploaded `src` photo when present, otherwise the initials
 * on a deterministic gradient background.
 */
export default function UserAvatar({ name = '', src, sx, onClick, className }) {
  return (
    <Avatar
      className={className}
      src={src || undefined}
      onClick={onClick}
      sx={{
        background: getGradient(name),
        fontWeight: 700,
        '& .MuiAvatar-img': { objectFit: 'cover' },
        ...sx,
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
}