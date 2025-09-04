import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
// import { useAuth } from '../components/auth/AuthProvider';

export function useUserRole() {
  // const { user } = useAuth();

  return useQuery({
    queryKey: ['userRole', 'no-auth'],
    queryFn: async () => {
      // No authentication required - return admin role by default
      return 'admin';
      
      // Original authentication code commented out:
      // if (!user?.id) return null;

      // const { data, error } = await supabase
      //   .from('user_roles')
      //   .select('role')
      //   .eq('user_id', user.id)
      //   .single();

      // if (error && error.code !== 'PGRST116') {
      //   throw error;
      // }

      // return data?.role || null;
    },
    enabled: true, // Always enabled since no auth required
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useIsAdmin() {
  const { data: role, isLoading } = useUserRole();
  return {
    isAdmin: role === 'admin',
    isLoading,
  };
}