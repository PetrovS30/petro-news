import {configureStore} from '@reduxjs/toolkit'
import authReducer from './slice/authSlice'
import {} from './middleware/routeMiddlewareUserDashboard';

const store = configureStore({
    reducer : {authReducer} ,
    devTools: process.env.NODE_ENV !== 'production',

});

export default  store;

// Определяем тип для всего состояния приложения
export type RootState = ReturnType<typeof store.getState>;
// Определяем тип для dispatch
export type AppDispatch = typeof store.dispatch;