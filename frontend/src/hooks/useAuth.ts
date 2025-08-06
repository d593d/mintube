import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          logger.error('Failed to get auth session', error);
          throw error;
        }
        setUser(session?.user || null);
      } catch (error) {
        logger.error('Auth session error', error);
        toast.error('Failed to load user session');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info('Auth state changed', { event, userId: session?.user?.id });
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN') {
          toast.success('Welcome back!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Signed out successfully');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      logger.info('User signing out', { userId: user?.id });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logger.error('Sign out failed', error);
      toast.error('Failed to sign out');
    }
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};