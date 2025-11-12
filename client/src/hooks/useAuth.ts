import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // If there's an unauthorized error, assume not authenticated
  const isUnauthorized = error && /401.*Unauthorized/.test(error.message);

  // Redirect to login if unauthorized and we're on a protected route
  if (isUnauthorized && window.location.pathname.startsWith('/app')) {
    window.location.href = '/api/login';
  }

  return {
    user,
    isLoading: isLoading && !isUnauthorized,
    isAuthenticated: !!user && !isUnauthorized,
  };
}