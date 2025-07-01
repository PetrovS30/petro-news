import {configureStore} from '@reduxjs/toolkit'
import authReducer from './slice/authSlice'
import {} from './middleware/routeMiddlewareUserDashboard';

const store = configureStore({
    reducer : {authReducer} ,
    devTools: process.env.NODE_ENV !== 'production',

});

export default  store;