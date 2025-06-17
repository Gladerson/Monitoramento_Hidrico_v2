// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import AddressListPage from './pages/AddressListPage';
import AddressDashboardPage from './pages/AddressDashboardPage';
import RecursoHidricoDashboardPage from './pages/RecursoHidricoDashboardPage';
import DeviceDetailPage from './pages/DeviceDetailPage';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
            path="/" 
            element={
                <PrivateRoute>
                    <DashboardLayout />
                </PrivateRoute>
            }
        >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<AddressListPage />} />
            <Route path="enderecos/:enderecoId" element={<AddressDashboardPage />} />
            <Route path="recursos/:recursoId" element={<RecursoHidricoDashboardPage />} />
            <Route path="dispositivos/:mac" element={<DeviceDetailPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;