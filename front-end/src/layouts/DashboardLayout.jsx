// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { House, SignOut, MagnifyingGlass, Drop, Waves, Factory, Broadcast } from '@phosphor-icons/react';
import logo from '../assets/WaterStatios.PNG';

// Helper function to format time
const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Sidebar = () => {
    const { logout, user } = useAuth();
    const { timeLeft } = useSessionTimer();
    const navigate = useNavigate();
    const location = useLocation();

    // *** CORREÇÃO: A função handleLogout foi adicionada de volta. ***
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper function para determinar a classe do link
    const getLinkClass = (path, tipo = null) => {
        const searchParams = new URLSearchParams(location.search);
        const currentTipo = searchParams.get('tipo');
        let isActive = false;

        if (tipo) {
            isActive = location.pathname === path && currentTipo === tipo;
        } else {
            isActive = location.pathname === path && !currentTipo;
        }

        return `nav-link text-white ${isActive ? 'active' : ''}`;
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white" style={{ width: '280px', minHeight: '100vh', backgroundColor: 'var(--sidebar-bg)' }}>
            <a href="/dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <img src={logo} alt="WaterStation Logo" style={{ height: '125px' }} />
            </a>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-2">
                    <span className="nav-link text-white-50">Navegação</span>
                    <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                        <House size={24} className="me-2" /> Início (Tudo)
                    </Link>
                </li>
                
                <li className="nav-item">
                    <span className="nav-link text-white-50">Filtros</span>
                    <Link to="/dashboard?tipo=RESERVATORIO" className={getLinkClass('/dashboard', 'RESERVATORIO')}>
                        <Waves size={24} className="me-2" /> Reservatórios
                    </Link>
                    <Link to="/dashboard?tipo=POCO" className={getLinkClass('/dashboard', 'POCO')}>
                        <Drop size={24} className="me-2" /> Poços
                    </Link>
                    <Link to="/dashboard?tipo=DESSALINIZADOR" className={getLinkClass('/dashboard', 'DESSALINIZADOR')}>
                        <Factory size={24} className="me-2" /> Dessalinizadores
                    </Link>
                    <Link to="/dashboard?tipo=REDE_DISTRIBUICAO" className={getLinkClass('/dashboard', 'REDE_DISTRIBUICAO')}>
                        <Broadcast size={24} className="me-2" /> Rede de distribuição
                    </Link>
                </li>
            </ul>
            <hr />
            <div className="dropdown">
                <a href="#" className="d-flex align-items-center text-white text-decoration-none">
                    <strong>{user?.email}</strong>
                </a>
                <small className="d-block text-white-50 mt-1">
                    {user?.role}
                </small>
                <small className="d-block text-white-50 mt-2">
                    {user?.email !== 'ti.semarh@gmail.com' && `Sessão expira em: ${formatTime(timeLeft)}`}
                </small>
                {/* Este botão depende da função handleLogout */}
                <button className="btn btn-outline-light mt-3 w-100" onClick={handleLogout}>
                    <SignOut size={16} className="me-2" /> Sair
                </button>
            </div>
        </div>
    );
};


const SearchBar = () => (
    <div className="input-group mb-4 shadow-sm">
        <input type="text" className="form-control" placeholder="Digite para pesquisar..." />
        <button className="btn btn-primary" type="button" style={{borderColor: '#ced4da'}}>
            <MagnifyingGlass size={20} />
        </button>
    </div>
);

const DashboardLayout = () => {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="container-fluid p-4" style={{ flex: 1, overflowY: 'auto', height: '100vh' }}>
                <SearchBar />
                <div className="bg-white p-4 rounded shadow-sm">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;