import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import {
  Activity,
  Bot,
  ClipboardList,
  LayoutDashboard
} from "lucide-react";

import Assistant from "./pages/Assistant";
import Cases from "./pages/Cases";
import Dashboard from "./pages/Dashboard";
import Evidence from "./pages/Evidence";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { getHealth } from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

function ProtectedLayout() {
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  
  if (!ready) return <div className="loading-page">Checking session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <AppLayout user={user} onLogout={() => { logout(); navigate('/login'); }} />;
}

function AppLayout({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  const navigation = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "assistant", label: "AI Assistant", icon: Bot },
    { id: "cases", label: "Case Library", icon: ClipboardList },
    { id: "evidence", label: "Evidence", icon: Activity }
  ], []);

  const activePage = location.pathname.split("/")[1] || "assistant";
  const setActivePage = (page) => navigate(`/${page}`);

  const refreshBackend = useCallback(async () => {
    try {
      await getHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    refreshBackend();
  }, [refreshBackend]);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar
        navigation={navigation}
        activePage={activePage}
        setActivePage={setActivePage}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
        backendOnline={backendOnline}
      />
      <main className="main-content">
        <Topbar
          navigation={navigation}
          activePage={activePage}
          backendOnline={backendOnline}
          onRefresh={refreshBackend}
          onOpenMenu={() => setMobileMenu(true)}
        />
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/assistant" replace />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/evidence" element={<Evidence />} />
            <Route path="*" element={<Navigate to="/assistant" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;