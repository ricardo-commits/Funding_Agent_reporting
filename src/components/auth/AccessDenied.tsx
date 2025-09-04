import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from './AuthProvider';
import { Shield, AlertTriangle, LogOut } from 'lucide-react';

export function AccessDenied() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-fa-lg border-destructive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive">
              <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Security Notice</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This dashboard contains sensitive customer data and requires admin privileges. 
              Only authorized personnel with admin roles can access this information.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Current user:</span>
              <div className="font-medium text-sm">{user?.email}</div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Required role:</span>
              <div className="font-medium text-sm text-primary">Admin</div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you need access to this dashboard, please contact your administrator 
              to grant you admin privileges.
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/admin-setup'}
                className="w-full"
              >
                <Shield className="mr-2 h-4 w-4" />
                Create Admin Account
              </Button>
              
              <Button 
                onClick={signOut}
                variant="outline" 
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}