import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLoginedUser } from '../../slices/NavbarSlice/LoginedUserSlice';

const isTokenExpired = () => {
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  const currentTime = new Date().getTime();

  // If tokenExpiry exists and the current time is greater than the token expiry time, return true (expired)
  return tokenExpiry && currentTime > tokenExpiry;
};


const UseLoginedUser = () => {
  const dispatch = useDispatch();
  const loginedUser = useSelector((state) => state.loginedUser.loginedUser);
  const status = useSelector((state) => state.loginedUser.status);
  const error = useSelector((state) => state.loginedUser.error);

  const [isAuthTokenPresent, setIsAuthTokenPresent] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const tokenExpired = isTokenExpired();

    if (authToken && !tokenExpired) {
      setIsAuthTokenPresent(true);
      if (!loginedUser && status === 'idle') {
        dispatch(fetchLoginedUser())
          .unwrap()
          .catch((err) => {
            console.error('Failed to fetch logged-in user:', err);
          });
      }
    } else {
      setIsAuthTokenPresent(false);
      if (tokenExpired) {
        console.error('Token has expired, logging out...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        // Redirect or handle as needed
      }
    }
  }, [dispatch, loginedUser, status]);

  return { loginedUser, status, error, isAuthTokenPresent };
};


export default UseLoginedUser;