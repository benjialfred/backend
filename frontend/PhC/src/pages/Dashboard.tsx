// src/pages/Dashboard.tsx
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';
import ApprenticeDashboard from '@/components/Dashboard/ApprenticeDashboard';
import WorkerDashboard from '@/components/Dashboard/WorkerDashboard';
import ClientDashboard from '@/components/Dashboard/ClientDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // TEMPORARY: Mock user if not logged in for testing
  const effectiveUser = user || {
    nom: 'Test',
    prenom: 'Admin',
    email: 'admin@test.com',
    role: 'ADMIN', // Default to ADMIN to see everything
    photo_profil: null
  };

  if (!effectiveUser) {
    return <Navigate to="/login" replace />;
  }

  // Role-based routing
  switch (effectiveUser.role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return <AdminDashboard />;
    case 'APPRENTI':
      return <ApprenticeDashboard />;
    case 'WORKER':
      return <WorkerDashboard />;
    case 'CLIENT':
      return <ClientDashboard />;
    // Or simply:
    // return <ClientDashboard />; (if implemented)
    default:
      // Fallback for unknown roles
      return <div className="p-8 text-center">Rôle utilisateur non reconnu. Contactez l'administrateur.</div>;
  }
};

export default Dashboard;
