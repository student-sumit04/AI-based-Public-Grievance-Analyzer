import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SubmitComplaintPage from "./pages/SubmitComplaintPage.jsx";
import ComplaintsPage from "./pages/ComplaintsPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Shell />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="submit" element={<SubmitComplaintPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
