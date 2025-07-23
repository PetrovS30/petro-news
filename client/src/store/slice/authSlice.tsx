import type{ PayloadAction } from "@reduxjs/toolkit"; 
import { createSlice} from "@reduxjs/toolkit"; 
import Cookies from "js-cookie";

// Определите тип для вашего объекта пользователя
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Определите интерфейс для всего состояния вашего authSlice
interface AuthState {
  isAuthChecked: boolean;
  isSignIn: boolean;
  isCurrentUser: User | null; // Теперь это User или null
  isUserDashboard: boolean;
}

// ПРИМЕНИТЕ AuthState К initialState ЗДЕСЬ
const initialState: AuthState = {
  isAuthChecked: false,
  isSignIn: Cookies.get('isSignIn') ? true : false,
  isCurrentUser: null, // Изначально null, но тип AuthState позволяет ему стать User
  isUserDashboard: Cookies.get('dashboard') ? true : false
};

const authSlice = createSlice({
  name: 'auth',
  initialState, 
  reducers: {
    setSignIn: (state, action: PayloadAction<boolean>) => {
      state.isSignIn = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => { 
      state.isCurrentUser = action.payload;
    },
    setIsAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    setUserDashboard: (state, action: PayloadAction<boolean>) => {
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