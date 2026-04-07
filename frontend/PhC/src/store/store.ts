// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './slices/authSlices';
// import cartReducer from './slices/cartSlice';


// export const store = configureStore({
//     reducer: {
//         auth: authReducer,
//         cart: cartReducer,
//     },
//     middleware: (getDefaultMiddleware) =>
//         getDefaultMiddleware({
//             serializableCheck: {
//                 ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
//                 ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
//                 ignoredPaths: ['items.dates'],
//             },
//         }),
// });

// export type AppDispatch = typeof store.dispatch;
// export type AppStore = typeof store;
// export type RootState = ReturnType<typeof store.getState>;