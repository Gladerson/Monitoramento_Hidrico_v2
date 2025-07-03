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

        // Adiciona um listener para cliques em links para resetar o timer.
        const handleLinkClick = (event) => {
            if (event.target.closest('a')) {
                resetTimer();
            }
        };
        
        // Usar 'mousedown' é uma boa prática para capturar o clique antes da navegação.
        window.addEventListener('mousedown', handleLinkClick);

        // Limpeza: remove os listeners quando o componente é desmontado.
        return () => {
            clearInterval(countdownInterval);
            window.removeEventListener('mousedown', handleLinkClick);
        };

    }, [user, resetTimer, handleLogout]);

    return { timeLeft };
};