// import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
// // import { apiService } from '@/services/api';
// // import type { User, LoginCredentials, RegisterData, AuthState, ErrorResponse } from '@/types';
// import { toast } from 'react-hot-toast';

// // Thunks
// export const loginUser = createAsyncThunk<
//     { user: User; access: string; refresh: string },
//     LoginCredentials,
//     { rejectValue: ErrorResponse }
// >(
//     'auth/login',
//     async (credentials, { rejectWithValue }) => {
//         try {
//             const response = await apiService.login(credentials);
//             const { user, access, refresh } = response;

//             localStorage.setItem('access_token', access);
//             localStorage.setItem('refresh_token', refresh);
//             localStorage.setItem('user', JSON.stringify(user));

//             toast.success('Connexion réussie !');
//             return { user, access, refresh };
//         } catch (error: any) {
//             toast.error(error.response?.data?.message || 'Échec de la connexion');
//             return rejectWithValue(error.response?.data);
//         }
//     }
// );

// export const registerUser = createAsyncThunk<
//     { user: User; access: string; refresh: string },
//     RegisterData,
//     { rejectValue: ErrorResponse }
// >(
//     'auth/register',
//     async (userData, { rejectWithValue }) => {
//         try {
//             const response = await apiService.register(userData);
//             const { user, access, refresh } = response;

//             localStorage.setItem('access_token', access);
//             localStorage.setItem('refresh_token', refresh);
//             localStorage.setItem('user', JSON.stringify(user));

//             toast.success('Inscription réussie ! Bienvenue.');
//             return { user, access, refresh };
//         } catch (error: any) {
//             toast.error(error.response?.data?.message || "Échec de l'inscription");
//             return rejectWithValue(error.response?.data);
//         }
//     }
// );

// export const logoutUser = createAsyncThunk<
//     void,
//     void,
//     { rejectValue: ErrorResponse }
// >(
//     'auth/logout',
//     async (_, { rejectWithValue }) => {
//         try {
//             const refreshToken = localStorage.getItem('refresh_token');
//             if (refreshToken) {
//                 await apiService.logout(refreshToken);
//             }

//             localStorage.removeItem('access_token');
//             localStorage.removeItem('refresh_token');
//             localStorage.removeItem('user');

//             toast.success('Déconnexion réussie');
//         } catch (error: any) {
//             localStorage.removeItem('access_token');
//             localStorage.removeItem('refresh_token');
//             localStorage.removeItem('user');

//             toast.error('Déconnecté de l\'application');
//             return rejectWithValue(error.response?.data);
//         }
//     }
// );

// export const fetchUserProfile = createAsyncThunk<
//     User,
//     void,
//     { rejectValue: ErrorResponse }
// >(
//     'auth/fetchProfile',
//     async (_, { rejectWithValue }) => {
//         try {
//             const user = await apiService.getProfile();
//             localStorage.setItem('user', JSON.stringify(user));
//             return user;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data);
//         }
//     }
// );

// // Initial state
// const initialState: AuthState = {
//     user: JSON.parse(localStorage.getItem('user') || 'null'),
//     token: localStorage.getItem('access_token'),
//     isLoading: false,
//     error: null,
// };

// // Slice
// const authSlice = createSlice({
//     name: 'auth',
//     initialState,
//     reducers: {
//         clearError: (state) => {
//             state.error = null;
//         },
//         updateUser: (state, action: PayloadAction<Partial<User>>) => {
//             if (state.user) {
//                 state.user = { ...state.user, ...action.payload };
//                 localStorage.setItem('user', JSON.stringify(state.user));
//             }
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             // Login
//             .addCase(loginUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(loginUser.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.user = action.payload.user;
//                 state.token = action.payload.access;
//             })
//             .addCase(loginUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload || {
//                     success: false,
//                     message: 'Une erreur est survenue'
//                 };
//             })

//             // Register
//             .addCase(registerUser.pending, (state) => {
//                 state.isLoading = true;
//                 state.error = null;
//             })
//             .addCase(registerUser.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.user = action.payload.user;
//                 state.token = action.payload.access;
//             })
//             .addCase(registerUser.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.error = action.payload || {
//                     success: false,
//                     message: 'Une erreur est survenue'
//                 };
//             })

//             // Logout
//             .addCase(logoutUser.fulfilled, (state) => {
//                 state.user = null;
//                 state.token = null;
//             })

//             // Fetch Profile
//             .addCase(fetchUserProfile.fulfilled, (state, action) => {
//                 state.user = action.payload;
//             });
//     },
// });

// export const { clearError, updateUser } = authSlice.actions;
// export default authSlice.reducer;