'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, FileText, Users, LogOut, Menu, X, User, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navLinks: NavLink[] = [
  {
    href: '/',
    label: 'Inicio',
    icon: <Home className="w-5 h-5" />,
  },
  {
    href: '/censos',
    label: 'Censos',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    href: '/estaciones',
    label: 'Estaciones',
    icon: <MapPin className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
  {
    href: '/censistas',
    label: 'Censistas',
    icon: <Users className="w-5 h-5" />,
    roles: ['ADMIN'],
  },
];

export default function DashboardWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const filteredLinks = navLinks.filter((link) => {
    if (!link.roles) return true;
    return user && link.roles.includes(user.rol);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CM</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-900">Censo Motos</p>
              <p className="text-xs text-gray-500">Sabanalarga</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {filteredLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(link.href);
                }}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActiveLink(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span
                  className={`mr-3 ${
                    isActiveLink(link.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                >
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.rol || 'Rol'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="ml-2 text-sm font-semibold text-gray-900">
                Censo Motos
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActiveLink(link.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-3">{link.icon}</span>
                    {link.label}
                  </span>
                </a>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <nav className="flex justify-around py-2">
          {filteredLinks.slice(0, 4).map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(link.href);
              }}
              className={`flex flex-col items-center px-3 py-1 ${
                isActiveLink(link.href) ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-xs mt-1">{link.label}</span>
            </a>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center px-3 py-1 text-gray-500"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs mt-1">Salir</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
