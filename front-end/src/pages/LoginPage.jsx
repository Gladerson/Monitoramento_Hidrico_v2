// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard'); // Redireciona após login bem-sucedido
        } catch (err) {
            setError('Falha no login. Verifique seu e-mail e senha.');
            console.error('Erro de login:', err);
        }
    };

    return (
        // Container principal que ocupa toda a tela e centraliza o conteúdo
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="card p-4 shadow-lg" style={{ 
                width: '100%', 
                maxWidth: '420px', 
                backgroundColor: 'rgba(255, 255, 255, 0.9)' // Fundo branco semi-transparente
            }}>
                <h3 className="card-title text-center mb-4">Monitoramento Hídrico</h3>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="emailInput" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="emailInput"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="passwordInput" className="form-label">Senha</label>
                        <input
                            type="password"
                            className="form-control"
                            id="passwordInput"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button type="submit" className="btn btn-primary w-100">Entrar</button>
                    {/* Futuramente: um link para "Esqueci minha senha" */}
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
