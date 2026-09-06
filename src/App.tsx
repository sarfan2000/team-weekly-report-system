import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import { AIChatWidget } from '@/components/AIChatWidget';
import { LoginPage } from '@/pages/LoginPage';
import { ReportEditorPage } from '@/pages/ReportEditorPage';
import { ReportHistoryPage } from '@/pages/ReportHistoryPage';
import { ReportDetailPage } from '@/pages/ReportDetailPage';
import { ManagerDashboardPage } from '@/pages/ManagerDashboardPage';
import { ManagerReviewPage } from '@/pages/ManagerReviewPage';
import { ManagerAnalyticsPage } from '@/pages/ManagerAnalyticsPage';
import { ManagerProjectsPage } from '@/pages/ManagerProjectsPage';
import { ManagerTeamPage } from '@/pages/ManagerTeamPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { Spinner } from '@/components/ui';

function ProtectedRoutes() {
  const { currentUser, loading, isManager } = useAuth();

  if (loading) return <Spinner />;
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/reports/history" element={<ReportHistoryPage />} />
          <Route path="/report/new" element={<ReportEditorPage />} />
          <Route path="/report/edit/:id" element={<ReportEditorPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          {isManager && (
            <>
              <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
              <Route path="/manager/review/:id" element={<ManagerReviewPage />} />
              <Route path="/manager/analytics" element={<ManagerAnalyticsPage />} />
              <Route path="/manager/projects" element={<ManagerProjectsPage />} />
              <Route path="/manager/team" element={<ManagerTeamPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </>
          )}
          <Route path="*" element={<Navigate to={isManager ? '/manager/dashboard' : '/reports/history'} replace />} />
        </Routes>
      </Layout>
      {isManager && <AIChatWidget />}
    </>
  );
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();

  if (loading) return <Spinner />;

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to={currentUser.role === 'manager' ? '/manager/dashboard' : '/reports/history'} replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}
