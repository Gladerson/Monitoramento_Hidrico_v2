// src/hooks/useSessionTimer.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos

export const useSessionTimer = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(SESSION_TIMEOUT);

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);

    const resetTimer = useCallback(() => {
        setTimeLeft(SESSION_TIMEOUT);
    }, []);

    useEffect(() => {
        // Não aplica o timer para o usuário especial
        if (user?.email === 'ti.semarh@gmail.com') {
            return;
        }

        // Se não há usuário, não faz nada
        if (!user) {
            return;
        }

        const countdownInterval = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1000) {
                    clearInterval(countdownInterval);
                    handleLogout();
                    return 0;
                }
                return prevTime - 1000;
            });
        }, 1000);

        // Eventos para resetar o timer
        const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Limpeza
        return () => {
            clearInterval(countdownInterval);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };

    }, [user, resetTimer, handleLogout]);

    return { timeLeft };
};
