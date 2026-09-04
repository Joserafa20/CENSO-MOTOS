'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home, FileText, LogOut, Menu, X, User,
  MapPin, CheckCircle, Award, Shield, Sun, Moon, Settings,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from '@/components/theme-provider';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
  { href: '/censos', label: 'Censos', icon: <FileText className="w-5 h-5" /> },
  { href: '/aprobar-censos', label: 'Aprobar Censos', icon: <CheckCircle className="w-5 h-5" />, roles: ['ADMIN'] },
  { href: '/certificados', label: 'Certificados', icon: <Award className="w-5 h-5" />, roles: ['ADMIN'] },
  { href: '/estaciones', label: 'Estaciones', icon: <MapPin className="w-5 h-5" />, roles: ['ADMIN'] },
  { href: '/usuarios', label: 'Usuarios', icon: <Shield className="w-5 h-5" />, roles: ['ADMIN'] },
  { href: '/configuracion', label: 'Configuración', icon: <Settings className="w-5 h-5" />, roles: ['ADMIN'] },
];

export default function DashboardWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, initialized } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    // Wait until initialize() has finished reading localStorage before
    // deciding to redirect. Without this guard, the effect fires with the
    // initial isAuthenticated=false before the store is populated, and any
    // browser that clears storage between navigations gets a false redirect.
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, initialized, router]);

  // Listen for 401 events fired by the api-client interceptor so we can
  // log out and redirect gracefully instead of doing a hard window.location.
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      router.push('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const filteredLinks = navLinks.filter((link) => {
    if (!link.roles) return true;
    return user && link.roles.includes(user.rol);
  });

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">CM</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Censo Motos</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sabanalarga</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {filteredLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); router.push(link.href); }}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                  isActiveLink(link.href)
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`}
              >
                <span className={`mr-3 ${
                  isActiveLink(link.href)
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                }`}>
                  {link.icon}
                </span>
                {link.label}
              </a>
            ))}
          </nav>

          {/* User Info */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center mb-3">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.rol || 'Rol'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="ml-2 text-sm font-bold text-gray-900 dark:text-white">Censo Motos</span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); router.push(link.href); setIsMobileMenuOpen(false); }}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActiveLink(link.href)
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
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
                className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
        <nav className="flex justify-around py-2">
          {filteredLinks.slice(0, 5).map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); router.push(link.href); }}
              className={`flex flex-col items-center px-3 py-1 transition-colors ${
                isActiveLink(link.href) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-xs mt-1">{link.label}</span>
            </a>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center px-3 py-1 text-gray-500 dark:text-gray-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs mt-1">Salir</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
