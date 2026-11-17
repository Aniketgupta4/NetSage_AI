import {
  ChevronDown,
  RefreshCw,
  Menu,
  Sparkles,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Topbar({
  navigation,
  activePage,
  backendOnline,
  onRefresh,
  onOpenMenu
}) {
  const { user, setUser } = useAuth();
  const nav = useNavigate();

  const currentPage = navigation.find(
    (item) => item.id === activePage
  );

  function handleLogout() {
    localStorage.removeItem("netsage_token");
    setUser(null);
    nav("/login");
  }

  return (
    <>
      <style>{`
        .user-profile-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #131d2b;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 2rem;
          padding: 0.25rem 0.25rem 0.25rem 0.75rem;
          margin-left: 0.5rem;
        }

        .user-profile-pill .user-icon {
          color: #22d3ee;
        }

        .user-profile-pill span {
          font-size: 0.75rem;
          font-weight: 500;
          color: #e2e8f0;
          max-width: 100px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.375rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-left">
          <button
            className="mobile-menu-button"
            onClick={onOpenMenu}
          >
            <Menu size={20} />
          </button>

          <div className="breadcrumb">
            <span>NETSAGE AI</span>
            <ChevronDown size={13} />
            <strong>{currentPage?.label}</strong>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="model-pill">
            <Sparkles size={14} />
          </div>

          <div
            className={`backend-indicator ${
              backendOnline ? "online" : ""
            }`}
          >
            <span />
            {backendOnline ? "Connected" : "Offline"}
          </div>

          <button
            className="icon-button"
            title="Refresh backend status"
            onClick={onRefresh}
          >
            <RefreshCw size={17} />
          </button>

          {/* New User Profile & Logout Section */}
          {user && (
            <div className="user-profile-pill">
              <User size={14} className="user-icon" />
              <span>{user.name || 'User'}</span>
              <button 
                className="logout-btn" 
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
          
        </div>
      </header>
    </>
  );
}

export default Topbar;