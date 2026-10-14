import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  ShieldCheck,
  User,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Lock,
  PlusCircle,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenReportModal: () => void;
  onQuickEmergency: () => void;
  onOpenAdminPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuthModal,
  onOpenReportModal,
  onQuickEmergency,
  onOpenAdminPortal,
}) => {
  const { currentUser, role, logout, jobs, adminAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Active jobs count for client or pro
  const activeJobsCount = jobs.filter((j) => {
    if (!currentUser) return false;
    if (role === 'client') return j.clientId === currentUser.id && j.status !== 'closed_commission_paid';
    if (role === 'pro') return j.proId === currentUser.id && j.status !== 'closed_commission_paid';
    return j.status === 'under_review';
  }).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => {
            setCurrentTab('explore');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-2xs">
            <Home className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Soluciones para tu Hogar
            </span>
            <span className="block text-[11px] text-stone-500 font-medium">
              Marketplace de Servicios Profesionales
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setCurrentTab('explore')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'explore'
                ? 'text-stone-900 font-bold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            Buscar Profesionales
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuthModal('login');
              } else {
                setCurrentTab('my-jobs');
              }
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'my-jobs'
                ? 'text-stone-900 font-bold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            <span>Seguimiento de Trabajos</span>
            {activeJobsCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                {activeJobsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuthModal('register');
              } else if (role !== 'pro') {
                setCurrentTab('pro-dashboard');
              } else {
                setCurrentTab('pro-dashboard');
              }
            }}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'pro-dashboard'
                ? 'text-stone-900 font-bold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-stone-500" />
            <span>Soy Profesional / Empresa</span>
          </button>
        </nav>

        {/* Zone 3: Auth & Emergency Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickEmergency}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap cursor-pointer"
            title="Filtrar profesionales disponibles ahora para emergencias"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ayuda urgente</span>
          </button>

          {/* User Auth Module */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-900 text-xs font-medium cursor-pointer"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="max-w-[110px] truncate hidden sm:inline font-semibold">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <p className="font-bold text-stone-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-stone-100 rounded text-stone-700">
                      Rol: {currentUser.role === 'client' ? 'Cliente' : currentUser.role === 'pro' ? 'Profesional' : 'Administradora'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentTab(currentUser.role === 'pro' ? 'pro-dashboard' : 'my-jobs');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Mi Panel</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenReportModal();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-stone-50 text-stone-700 flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                    <span>Reportar Problema</span>
                  </button>

                  <div className="border-t border-stone-100 my-1"></div>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                      setCurrentTab('explore');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="py-1.5 px-3 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                Ingresar
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="py-1.5 px-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              >
                Registrarme
              </button>
            </div>
          )}

          {/* Discrete Administrator Backoffice Link */}
          <button
            onClick={onOpenAdminPortal}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            title="Portal de Administración"
          >
            <ShieldCheck className="w-4 h-4 text-stone-500" />
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-stone-600 hover:text-stone-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {currentUser && (
            <div className="pb-2 border-b border-stone-100 text-xs text-stone-600">
              Sesión activa: <strong className="text-stone-900">{currentUser.name}</strong> ({currentUser.role})
            </div>
          )}

          <button
            onClick={() => {
              setCurrentTab('explore');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 text-sm rounded-lg ${
              currentTab === 'explore' ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-700'
            }`}
          >
            Buscar Profesionales
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuthModal('login');
              } else {
                setCurrentTab('my-jobs');
              }
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 text-sm rounded-lg flex items-center justify-between ${
              currentTab === 'my-jobs' ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-700'
            }`}
          >
            <span>Seguimiento de Trabajos</span>
            {activeJobsCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-200 text-amber-900 rounded">
                {activeJobsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuthModal('register');
              } else {
                setCurrentTab('pro-dashboard');
              }
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left py-2 px-3 text-sm rounded-lg ${
              currentTab === 'pro-dashboard' ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-stone-700'
            }`}
          >
            Panel de Profesional
          </button>

          <button
            onClick={() => {
              onOpenAdminPortal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 text-sm rounded-lg text-stone-700 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-stone-500" />
            <span>Portal de Administración</span>
          </button>

          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenReportModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-stone-600 flex items-center gap-1 py-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Ayuda / Reportar</span>
            </button>
            <button
              onClick={() => {
                onQuickEmergency();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-rose-700 font-semibold py-1"
            >
              🚨 Ayuda Urgente
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
