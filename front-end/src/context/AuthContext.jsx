// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Precisamos instalar essa biblioteca

/**
 * Este Contexto provê informações de autenticação (usuário, token)
 * para toda a aplicação, evitando a necessidade de passar props manualmente.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tenta carregar o usuário a partir do token no localStorage ao iniciar
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                // Aqui você pode fazer uma chamada à API para pegar dados atualizados do usuário
                // Ex: api.get(`/users/${decodedUser.user_id}/`).then(response => setUser(response.data));
                // Por simplicidade, vamos usar os dados decodificados do token
                setUser(decodedUser);
            } catch (error) {
                console.error("Token inválido:", error);
                localStorage.removeItem('accessToken');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/token/', { email, password });
        const { access, refresh } = response.data;
        
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        
        const decodedUser = jwtDecode(access);
        setUser(decodedUser);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
    return useContext(AuthContext);
};
