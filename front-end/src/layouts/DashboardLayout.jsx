// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { House, SignOut, MagnifyingGlass } from '@phosphor-icons/react';

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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="d-flex flex-column flex-shrink-0 p-3 text-white" style={{ width: '280px', minHeight: '100vh', backgroundColor: 'var(--sidebar-bg)' }}>
            <a href="/dashboard" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-4">SEMARH</span>
            </a>
            <hr />
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <NavLink to="/dashboard" className={({ isActive }) => "nav-link text-white" + (isActive ? " active" : "")}>
                        <House size={24} className="me-2" /> Início
                    </NavLink>
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