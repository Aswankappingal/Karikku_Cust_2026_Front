import { Navigate } from 'react-router-dom';
import UseLoginedUser from './src/store/hook/NavbarHook/useLoginedUser';
import { useEffect } from 'react';

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('authToken');
  const { loginedUser, status } = UseLoginedUser();

  useEffect(() => {
    console.log(status, 'oii');
  }, [status]);

  // Redirect to login page when not authenticated
  if (!token || loginedUser?.length === 0 || status === 'failed') {
    return <Navigate to="/login" replace />;
  }

  // Show loading UI while checking authentication
  if (status === 'loading') {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '18px',
          fontWeight: '500',
        }}
      >
        Loading...
      </div>
    );
  }

  // Render the protected element if authenticated
  return element;
};

export default ProtectedRoute;