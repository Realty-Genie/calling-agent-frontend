"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Refresh user data to get latest credits/agents, but only for regular users
                if (parsedUser.role !== 'superadmin') {
                    try {
                        const response = await api.get('/auth/me');
                        const { user: freshUser } = response.data;
                        localStorage.setItem('user', JSON.stringify(freshUser));
                        setUser(freshUser);
                    } catch (err) {
                        console.error("Failed to refresh user on mount", err);
                    }
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            Cookies.set('token', token, { expires: 1 });
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            router.push('/');
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const register = async (name, email, password) => {
        try {
            await api.post('/auth/register', { name, email, password });
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const adminLogin = async (email, password) => {
        try {
            const response = await api.post('/admin/login', { email, password });
            const { token } = response.data;

            // For admin, we might not get a user object back in the same way, or we construct one
            const adminUser = { email, role: 'superadmin' };

            Cookies.set('token', token, { expires: 1 });
            localStorage.setItem('user', JSON.stringify(adminUser));
            setUser(adminUser);
            router.push('/admin/dashboard');
            return { success: true };
        } catch (error) {
            console.error("Admin Login failed", error);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    }

    const logout = () => {
        Cookies.remove('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        if (!user || user.role === 'superadmin') return { success: true };

        try {
            const response = await api.get('/auth/me');
            const { user: freshUser } = response.data;
            localStorage.setItem('user', JSON.stringify(freshUser));
            setUser(freshUser);
            return { success: true, user: freshUser };
        } catch (error) {
            console.error("Refresh user failed", error);
            return { success: false, message: error.response?.data?.message || "Refresh failed" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, adminLogin, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
