// src/services/api.js
import axios from 'axios';

/**
 * Cria uma instância do Axios para centralizar a comunicação com a API.
 * Isso nos permite configurar a URL base e, mais importante,
 * adicionar o token de autenticação em todas as requisições.
 */
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/' // URL base da nossa API Django
});

// Interceptor: Este código é executado ANTES de cada requisição.
api.interceptors.request.use(async config => {
    // Pega o token de acesso do localStorage.
    const accessToken = localStorage.getItem('accessToken');
    
    // Se o token existir, adiciona ao cabeçalho de autorização.
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
