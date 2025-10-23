
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { AuthTokens } from '../types/auth.types';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';


// Create axios instance
const api: AxiosInstance = axios.create({
 baseURL: API_URL,
 headers: {
   'Content-Type': 'application/json',
 },
});


// Token management
export const tokenManager = {
 getTokens(): AuthTokens | null {
   const tokensStr = localStorage.getItem('tokens');
   return tokensStr ? JSON.parse(tokensStr) : null;
 },


 setTokens(tokens: AuthTokens): void {
   localStorage.setItem('tokens', JSON.stringify(tokens));
 },


 clearTokens(): void {
   localStorage.removeItem('tokens');
   localStorage.removeItem('user');
 },


 getAccessToken(): string | null {
   const tokens = this.getTokens();
   return tokens ? tokens.access : null;
 },


 getRefreshToken(): string | null {
   const tokens = this.getTokens();
   return tokens ? tokens.refresh : null;
 },
};


// Request interceptor to add token to headers
api.interceptors.request.use(
 (config: InternalAxiosRequestConfig) => {
   const token = tokenManager.getAccessToken();
   if (token && config.headers) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
 },
 (error) => {
   return Promise.reject(error);
 }
);


// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
 resolve: (value?: unknown) => void;
 reject: (reason?: unknown) => void;
}> = [];


const processQueue = (error: AxiosError | null, token: string | null = null) => {
 failedQueue.forEach((prom) => {
   if (error) {
     prom.reject(error);
   } else {
     prom.resolve(token);
   }
 });


 failedQueue = [];
};


api.interceptors.response.use(
 (response) => response,
 async (error: AxiosError) => {
   const originalRequest = error.config as InternalAxiosRequestConfig & {
     _retry?: boolean;
   };


   // Skip token refresh logic for login/register/logout endpoints
   const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login') ||
                         originalRequest.url?.includes('/api/auth/register') ||
                         originalRequest.url?.includes('/api/auth/logout');
  
   // If error is 401 and we haven't tried to refresh yet
   if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
     if (isRefreshing) {
       // If already refreshing, queue this request
       return new Promise((resolve, reject) => {
         failedQueue.push({ resolve, reject });
       })
         .then((token) => {
           if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${token}`;
           }
           return api(originalRequest);
         })
         .catch((err) => {
           return Promise.reject(err);
         });
     }


     originalRequest._retry = true;
     isRefreshing = true;


     const refreshToken = tokenManager.getRefreshToken();


     if (!refreshToken) {
       // No refresh token, logout user
       tokenManager.clearTokens();
       window.location.href = '/login';
       return Promise.reject(error);
     }


     try {
       // Try to refresh the token
       const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
         refresh: refreshToken,
       });


       const { access, refresh } = response.data;
       const newTokens: AuthTokens = { access, refresh };


       tokenManager.setTokens(newTokens);
      
       // Update the authorization header
       if (originalRequest.headers) {
         originalRequest.headers.Authorization = `Bearer ${access}`;
       }


       processQueue(null, access);
       isRefreshing = false;


       // Retry the original request
       return api(originalRequest);
     } catch (refreshError) {
       processQueue(refreshError as AxiosError, null);
       tokenManager.clearTokens();
       window.location.href = '/login';
       isRefreshing = false;
       return Promise.reject(refreshError);
     }
   }


   return Promise.reject(error);
 }
);


export default api;





