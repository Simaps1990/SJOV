import React, { useState, useEffect, forwardRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Lock, Menu, X } from 'lucide-react';
import { useContent } from '../../context/ContentContext';

const Header = forwardRef<HTMLElement>((_, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { associationContent } = useContent();
  const headerIcon: string | undefined = associationContent.headerIcon;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/association', label: 'Notre association' },
    { to: '/blog', label: 'Blog' },
    { to: '/events', label: 'Événements' },
    { to: '/annonces', label: 'Annonces' },
    { to: '/apply', label: 'Postuler' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header
      ref={ref}
      className={`fixed top-0 left-0 right-0 z-50 py-3 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm shadow-sm'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center">
          {headerIcon && (
            <img src={headerIcon} alt="SJOV Logo" className="h-12 w-12" />
          )}
          <div className="ml-3 text-primary-700 leading-tight flex flex-col">
            <span className="text-xl font-bold">SJOV</span>
            <span className="text-sm font-medium text-primary-600">
              Jardins Ouvriers de Villeurbanne
            </span>
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors duration-200 ${
                currentPath === to
                  ? 'text-primary-600'
                  : 'text-neutral-700 hover:text-primary-600'
              }`}
            >
              {label}
            </Link>
          ))}

          <form onSubmit={handleSearch} className="relative w-full max-w-[180px]">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full pl-10 pr-4 py-2 rounded border border-neutral-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
          </form>

          <Link
            to="/login"
            className="text-neutral-700 hover:text-primary-600 p-2"
            aria-label="Administration"
          >
            <Lock size={22} />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-neutral-700 hover:text-primary-600 p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 animate-slide-down">
          <nav className="flex flex-col items-end gap-3 text-sm font-medium mt-3">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium px-3 py-1.5 rounded transition-colors duration-200 ${
                  currentPath === to
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-700 hover:text-primary-600'
                }`}
              >
                {label}
              </Link>
            ))}

            <form
              onSubmit={(e) => {
                handleSearch(e);
                setMobileOpen(false);
              }}
              className="relative w-full max-w-[180px]"
            >
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2 rounded border border-neutral-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            </form>

            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-neutral-700 hover:text-primary-600 p-2"
              aria-label="Administration"
            >
              <Lock size={22} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
});

export default Header;
