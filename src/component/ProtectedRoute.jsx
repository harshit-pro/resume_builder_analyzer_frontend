import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="p-8 text-center">Loading…</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}