import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Leaf,
  Map,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Megaphone,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { useNotifications } from '../../context/NotificationsContext';


const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { associationContent } = useContent();
  const { nonTraitees, annoncesEnAttente } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();





  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    {
      path: '/admin',
      label: 'Tableau de bord',
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: '/admin/blog',
      label: 'Blog',
      icon: <FileText size={20} />,
    },
    {
      path: '/admin/events',
      label: 'Événements',
      icon: <Calendar size={20} />,
    },
    {
      path: '/admin/applications',
      label: 'Demandes',
      icon: (
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Users size={20} />
          {nonTraitees > 0 && (
            <span className="absolute -top-2 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
              {nonTraitees}
            </span>
          )}
        </div>
      ),
    },
    {
      path: '/admin/jardiniers',
      label: 'Jardiniers',
      icon: <Leaf size={20} />,
    },
    {
      path: '/admin/parcelles',
      label: 'Parcelles',
      icon: <Map size={20} />,
    },
    {
  path: '/admin/annonces',
  label: 'Annonces',
  icon: (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <Megaphone size={20} />
      {annoncesEnAttente > 0 && (
        <span className="absolute -top-2 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
          {annoncesEnAttente}
        </span>
      )}
    </div>
  ),
},


    {
      path: '/admin/settings',
      label: 'Paramètres',
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 text-neutral-600 hover:text-primary-600 mr-2"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center">
<img
  src={associationContent?.headerIcon || '/src/assets/logo.svg'}
  alt="SJOV Logo"
  className="h-8 w-8 object-contain"
/>

              <h1 className="text-xl font-bold ml-2 text-primary-700 leading-none mb-0">
                Espace Administration
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-neutral-600 hover:text-primary-600 flex items-center"
              aria-label="Retour au site"
            >
              <Home size={20} />
              <span className="ml-2 hidden sm:inline">Voir le site</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-error-600 hover:text-error-700 flex items-center"
              aria-label="Se déconnecter"
            >
              <LogOut size={20} />
              <span className="ml-2 hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Overlay pour mobile */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={toggleSidebar}
        ></div>

        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-neutral-200 w-64 flex-shrink-0 fixed md:static top-14 bottom-0 md:inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="h-full overflow-y-auto py-6 px-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 px-6 mt-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
