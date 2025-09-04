import { useAuth } from './AuthProvider';
import { useIsAdmin } from '../../hooks/useUserRole';
import { LoginForm } from './LoginForm';
import { AccessDenied } from './AccessDenied';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();

  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}