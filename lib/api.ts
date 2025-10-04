import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur pour gérer le refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                Cookies.set('access_token', access, { expires: 1 / 24 }); // 1 heure

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Échec du refresh, déconnexion
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    password2: string;
    first_name: string;
    last_name: string;
    phone: string;
    role?: string;
    gender?: string;
    birth_date?: string;
}

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    role_display: string;
    avatar?: string;
    phone?: string;
}

// Services d'authentification
export const authService = {
    async login(credentials: LoginCredentials) {
        const response = await api.post('auth/login/', credentials);
        const { access, refresh } = response.data;

        Cookies.set('access_token', access, { expires: 1 / 24 }); // 1 heure
        Cookies.set('refresh_token', refresh, { expires: 7 }); // 7 jours

        return response.data;
    },

    async register(data: RegisterData) {
        const response = await api.post('/auth/register/', data);
        return response.data;
    },

    async logout() {
        try {
            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
                await api.post('/auth/logout/', { refresh_token: refreshToken });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
        }
    },

    async getProfile(): Promise<User> {
        const response = await api.get('/auth/profile/');
        return response.data;
    },

    async updateProfile(data: Partial<User>) {
        const response = await api.patch('/auth/profile/', data);
        return response.data;
    },

    isAuthenticated(): boolean {
        return !!Cookies.get('access_token');
    },
};