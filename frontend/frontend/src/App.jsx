import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  LogOut,
  MapPinned,
  PlaneTakeoff,
  UserCircle2,
} from 'lucide-react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import BudgetPage from './pages/Budget';
import CreateTripPage from './pages/CreateTrip';
import DashboardPage from './pages/Dashboard';
import ItineraryBuilderPage from './pages/ItineraryBuilder';
import LoginPage from './pages/Login';
import MyTripsPage from './pages/MyTrips';
import ProfilePage from './pages/Profile';
import PublicTripPage from './pages/PublicTrip';
import SignupPage from './pages/Signup';
import TripDetailsPage from './pages/TripDetails';

function ProtectedLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/my-trips', label: 'My Trips', icon: Compass },
    { to: '/trips/create', label: 'Create Trip', icon: MapPinned },
    { to: '/profile', label: 'Profile', icon: UserCircle2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/dashboard" className="brand-wrap">
          <PlaneTakeoff size={20} />
          <div>
            <span className="eyebrow">GlobeTrotter</span>
            <strong>Travel planner</strong>
          </div>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-menu">
          <button type="button" className="ghost-button" onClick={() => navigate('/profile')}>
            <UserCircle2 size={16} />
            {user?.name || 'Profile'}
          </button>
          <button type="button" className="logout-button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/public/trips/:token" element={<PublicTripPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-trips" element={<MyTripsPage />} />
        <Route path="/trips/create" element={<CreateTripPage />} />
        <Route path="/trips/:id" element={<TripDetailsPage />} />
        <Route path="/trips/:id/itinerary" element={<ItineraryBuilderPage />} />
        <Route path="/trips/:id/budget" element={<BudgetPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
