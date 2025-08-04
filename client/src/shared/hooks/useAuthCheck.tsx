import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { setSignIn, setCurrentUser, setIsAuthChecked } from '../../store/slice/authSlice';

import API_BASE_URL from '../../config/api';

export const useAuthCheck = () => {
  	const dispatch = useDispatch();

    function clearAllAppCookies() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
            
            // Attempt to clear with default path and domain
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
        const storedToken = Cookies.get('authToken');

        if (!storedToken) {
            // If no token, user is not authenticated. Clear any old data.
        
            dispatch(setSignIn(false));
            dispatch(setCurrentUser(null));
            dispatch(setIsAuthChecked(true)); // Authentication check is complete
            clearAllAppCookies();
            return;
        }

        // If a token exists, try to fetch the latest user data from the server
        try {
            const response = await fetch(`${API_BASE_URL}api/me`, { // Use /api/me as discussed
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`,
                }
            });

            if (response.ok) {
                const userData = await response.json();
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
            Cookies.remove('authToken'); 
            dispatch(setSignIn(false));
            dispatch(setCurrentUser(null));
            
        } finally {
            dispatch(setIsAuthChecked(true));
        }
    };

    checkAuth();
  }, [dispatch]); 
};