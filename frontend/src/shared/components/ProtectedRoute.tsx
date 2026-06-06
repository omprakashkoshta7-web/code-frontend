import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/shared/hooks/useUser';
import { userStorage } from '@/shared/utils/userStorage';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const location = useLocation();
  const user = useUser();
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
