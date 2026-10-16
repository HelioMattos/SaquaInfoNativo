import { useAuth } from '../context/AuthContext';

export function useAdmin() {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
}
