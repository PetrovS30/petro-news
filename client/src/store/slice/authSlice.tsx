import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";


const initialState = {
  isAuthChecked: false,
  isSignIn: Cookies.get('isSignIn') ? true : false,
  isCurrentUser: null,
  isUserDashboard : Cookies.get('dashboard') ? true : false
};


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      setSignIn: (state, action) => {
        state.isSignIn = action.payload;
      },
      setCurrentUser: (state, action) => {
        state.isCurrentUser = action.payload;
      },
      setIsAuthChecked: (state, action) => {
        state.isAuthChecked = action.payload;
      },
      setUserDashboard: (state, action) => {
        state.isUserDashboard = action.payload;
      }
    }
    
});

export const { 
  setSignIn, 
  setCurrentUser, 
  setIsAuthChecked,
  setUserDashboard
} = authSlice.actions;

export default authSlice.reducer;