import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setSignIn, setCurrentUser, setIsAuthChecked } from '../../store/slice/authSlice';

export const useAuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = Cookies.get('authToken');

      if (!storedToken) {
        // If no token, user is not authenticated. Clear any old data.
        console.log('No authentication token found. User is not signed in.');
        dispatch(setSignIn(false));
        dispatch(setCurrentUser(null));
        dispatch(setIsAuthChecked(true)); // Authentication check is complete
        return;
      }

      // If a token exists, try to fetch the latest user data from the server
      try {
        const response = await fetch('http://localhost:3000/api/me', { // Use /api/me as discussed
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User data successfully loaded on app start:', userData);
          dispatch(setCurrentUser(userData)); // Assuming /api/me returns the user object directly
          dispatch(setSignIn(true)); // User is signed in
        } else {
          // Token might be expired or invalid on the server side
          console.error('Authentication check failed:', response.status, response.statusText);
          Cookies.remove('authToken'); // Remove invalid token
          dispatch(setSignIn(false));
          dispatch(setCurrentUser(null));
        }
      } catch (error) {
        console.error('Network or server error during authentication check:', error);
        Cookies.remove('authToken'); // Clean up token on error
        dispatch(setSignIn(false));
        dispatch(setCurrentUser(null));
      } finally {
        // Always set isAuthChecked to true once the check is done (regardless of success or failure)
        dispatch(setIsAuthChecked(true));
      }
    };

    checkAuth();
  }, [dispatch]); // Dependency array: run only when dispatch changes (which is rare)
};