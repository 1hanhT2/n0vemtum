import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // If there's an unauthorized error, assume not authenticated
  const isUnauthorized = error && /401.*Unauthorized/.test(error.message);

  return {
    user,
    isLoading: isLoading && !isUnauthorized,
    isAuthenticated: !!user && !isUnauthorized,
  };
}