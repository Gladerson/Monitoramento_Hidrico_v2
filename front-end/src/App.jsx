// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import AddressListPage from './pages/AddressListPage';
import AddressDashboardPage from './pages/AddressDashboardPage';
import RecursoHidricoDashboardPage from './pages/RecursoHidricoDashboardPage';
import DeviceDetailPage from './pages/DeviceDetailPage';

// ======================================================================
// DEFINIÇÃO DO COMPONENTE PROTECTEDROUTE QUE ESTAVA FALTANDO
// ======================================================================
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Agora o AuthProvider nos deixa acessar o 'loading'.
  // Enquanto estiver carregando, mostramos uma mensagem.
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Carregando...</div>;
  }

  // Se não estiver carregando e não houver usuário, redireciona para o login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário estiver autenticado, renderiza a página protegida.
  return children;
};


function App() {
  return (
    <Routes>
      {/* Rota pública de Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota "pai" que usa o ProtectedRoute para proteger todas as rotas aninhadas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Rotas aninhadas que serão renderizadas dentro do <Outlet /> do DashboardLayout */}
        <Route path="dashboard" element={<AddressListPage />} />
        <Route path="enderecos/:id" element={<AddressDashboardPage />} />
        <Route path="recursos/:recursoId" element={<RecursoHidricoDashboardPage />} />
        <Route path="dispositivos/:macAddress" element={<DeviceDetailPage />} />
        
        {/* Rota padrão para redirecionar a raiz "/" para "/dashboard" */}
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;