import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../integrations/supabase/client';
import { Shield, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';

export function AdminSetup() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [step, setStep] = useState<'check' | 'create' | 'signin'>('check');

  const checkForAdmin = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('role', 'admin')
        .limit(1);

      if (error) {
        // Table might not exist, create it
        await createUserRolesTable();
        setStep('create');
      } else if (data && data.length > 0) {
        setMessage({
          type: 'error',
          text: 'An admin account already exists. Please contact your administrator for access.'
        });
      } else {
        setStep('create');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error checking admin status. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUserRolesTable = async () => {
    // First, try to create the table using direct SQL
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_roles (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles(user_id);
        
        -- Temporarily disable RLS for admin setup
        ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
      `
    });
    
    if (createError) {
      console.error('Error creating user_roles table:', createError);
      // If RPC doesn't work, we'll need to handle this differently
    }
  };

  const createAdminAccount = async () => {
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long'
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, try to sign in to see if user already exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!signInError) {
        // User exists and password is correct
        setMessage({
          type: 'success',
          text: `User account already exists! Please follow these steps to complete admin setup:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the supabase-setup.sql script
4. Then run this SQL command (replace with your email):
   INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = '${email}' ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
5. Come back here and click "Sign In" to access the dashboard.`
        });
        setStep('signin');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      // If sign in failed, try to create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        // If user already exists but password is wrong, provide specific guidance
        if (authError.message.includes('already registered')) {
          setMessage({
            type: 'error',
            text: `User with email '${email}' already exists. Please try signing in instead, or if you forgot your password, you'll need to reset it in Supabase Dashboard.

If you want to use a different email, please enter a new email address.`
          });
          setStep('signin');
        } else {
          throw authError;
        }
        return;
      }

      if (authData.user) {
        setMessage({
          type: 'success',
          text: `User account created successfully! Please follow these steps to complete admin setup:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the supabase-setup.sql script
4. Then run this SQL command (replace with your email):
   INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = '${email}' ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
5. Come back here and click "Sign In" to access the dashboard.`
        });

        // Switch to sign-in step
        setStep('signin');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error creating admin account'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInAdmin = async () => {
    if (!email || !password) {
      setMessage({
        type: 'error',
        text: 'Please enter your email and password'
      });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      
      // Check if user has admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleData?.role === 'admin') {
          setMessage({
            type: 'success',
            text: 'Admin access granted! Redirecting to dashboard...'
          });
          
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setMessage({
            type: 'error',
            text: 'You do not have admin privileges. Please complete the manual setup steps first.'
          });
        }
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Error signing in'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setMessage({
        type: 'success',
        text: 'Session cleared successfully. You can now try creating a new account.'
      });
      setStep('check');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: 'Error clearing session: ' + error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'check') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading">Admin Setup</CardTitle>
            <CardDescription>
              Check if admin account exists and create one if needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
                         <Button 
               onClick={checkForAdmin}
               disabled={isLoading}
               className="w-full"
             >
               {isLoading ? 'Checking...' : 'Check Admin Status'}
             </Button>
             
             <Button 
               onClick={clearSession}
               disabled={isLoading}
               variant="outline"
               className="w-full"
             >
               Clear Session & Start Fresh
             </Button>
            
            {message && (
              <Alert className={message.type === 'error' ? 'border-destructive' : 'border-green-500'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Create Admin Account</CardTitle>
          <CardDescription>
            Create the first admin account for this dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          <Button 
            onClick={createAdminAccount}
            disabled={isLoading || !email || !password || !confirmPassword}
            className="w-full"
          >
            {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </Button>
          
                     {message && (
             <Alert className={message.type === 'error' ? 'border-destructive' : 'border-green-500'}>
               {message.type === 'success' ? (
                 <CheckCircle className="h-4 w-4" />
               ) : (
                 <AlertTriangle className="h-4 w-4" />
               )}
               <AlertDescription>{message.text}</AlertDescription>
             </Alert>
           )}
         </CardContent>
       </Card>
     </div>
   );

   if (step === 'signin') {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background p-4">
         <Card className="w-full max-w-md shadow-lg">
           <CardHeader className="text-center">
             <div className="flex justify-center mb-4">
               <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                 <Shield className="h-6 w-6 text-primary-foreground" />
               </div>
             </div>
             <CardTitle className="text-2xl font-heading">Sign In as Admin</CardTitle>
             <CardDescription>
               Sign in with your admin credentials to access the dashboard
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="signin-email">Email</Label>
               <Input
                 id="signin-email"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="admin@example.com"
                 required
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="signin-password">Password</Label>
               <Input
                 id="signin-password"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="Enter password"
                 required
               />
             </div>

             <Button 
               onClick={signInAdmin}
               disabled={isLoading || !email || !password}
               className="w-full"
             >
               {isLoading ? 'Signing In...' : 'Sign In'}
             </Button>
             
             <Button 
               onClick={() => setStep('check')}
               variant="outline"
               className="w-full"
             >
               Back to Setup
             </Button>
             
             {message && (
               <Alert className={message.type === 'error' ? 'border-destructive' : 'border-green-500'}>
                 {message.type === 'success' ? (
                   <CheckCircle className="h-4 w-4" />
                 ) : (
                   <AlertTriangle className="h-4 w-4" />
               )}
                 <AlertDescription>{message.text}</AlertDescription>
               </Alert>
             )}
           </CardContent>
         </Card>
       </div>
     );
   }
}