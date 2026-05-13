// TEMPORARY DEMO MODE - AUTH DISABLED
// ProtectedRoute now always allows access without checks

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TEMPORARY DEMO MODE - Bypass all auth checks, always render children
  return <>{children}</>;
};

export default ProtectedRoute;
