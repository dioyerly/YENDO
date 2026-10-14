import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeSearchView } from './components/HomeSearchView';
import { ProProfileModal } from './components/ProProfileModal';
import { ContactFlowModal } from './components/ContactFlowModal';
import { JobDetailView } from './components/JobDetailView';
import { ClientDashboard } from './components/ClientDashboard';
import { ProDashboard } from './components/ProDashboard';
import { AdminPanel } from './components/AdminPanel';
import { HelpReportModal } from './components/HelpReportModal';
import { AuthModal } from './components/AuthModal';
import { ProfessionalProfile, ServiceJob, UserRole } from './types';
import { ShieldCheck, Home, Phone, Mail, Lock, Shield, User } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, role, adminAuthenticated, switchRoleDirect } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('explore');
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [inspectingPro, setInspectingPro] = useState<ProfessionalProfile | null>(null);
  const [contactingPro, setContactingPro] = useState<ProfessionalProfile | null>(null);
  
  // Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('client');

  // Reports
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportJobId, setReportJobId] = useState<string | undefined>(undefined);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register', preferredRole: UserRole = 'client') => {
    setAuthModalMode(mode);
    setAuthModalRole(preferredRole);
    setAuthModalOpen(true);
  };

  const handleOpenContact = (pro: ProfessionalProfile) => {
    setContactingPro(pro);
  };

  const handleOpenReportModal = (jobId?: string) => {
    setReportJobId(jobId);
    setReportModalOpen(true);
  };

  const handleContactCreated = (newJob: ServiceJob) => {
    setSelectedJob(newJob);
    setCurrentTab('my-jobs');
  };

  const handleQuickEmergency = () => {
    setSelectedJob(null);
    setCurrentTab('explore');
    setEmergencyActive(true);
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans">
      {/* Primary Top Bar (Public Marketplace View) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedJob(null);
          setCurrentTab(tab);
        }}
        onOpenAuthModal={(mode) => handleOpenAuth(mode)}
        onOpenReportModal={() => handleOpenReportModal()}
        onQuickEmergency={handleQuickEmergency}
        onOpenAdminPortal={() => {
          setSelectedJob(null);
          setCurrentTab('admin');
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {selectedJob ? (
          <JobDetailView
            job={selectedJob}
            onBack={() => setSelectedJob(null)}
            onOpenReportModal={handleOpenReportModal}
          />
        ) : (
          <>
            {currentTab === 'explore' && (
              <HomeSearchView
                onContact={handleOpenContact}
                onViewDetails={(pro) => setInspectingPro(pro)}
                emergencyActive={emergencyActive}
                setEmergencyActive={setEmergencyActive}
              />
            )}

            {currentTab === 'my-jobs' && (
              <ClientDashboard
                onSelectJob={(job) => setSelectedJob(job)}
                onExplore={() => {
                  setSelectedJob(null);
                  setCurrentTab('explore');
                }}
                onOpenReportModal={handleOpenReportModal}
              />
            )}

            {currentTab === 'pro-dashboard' && (
              <ProDashboard onSelectJob={(job) => setSelectedJob(job)} />
            )}

            {currentTab === 'admin' && (
              <AdminPanel
                onSelectJob={(job) => setSelectedJob(job)}
                onExitAdmin={() => setCurrentTab('explore')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
              <Home className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-bold text-stone-800">
              Soluciones para tu Hogar
            </span>
            <span aria-hidden="true">·</span>
            <span>Marketplace de Servicios Profesionales en Latinoamérica</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-stone-600">
            <button
              onClick={() => handleOpenReportModal()}
              className="hover:text-stone-900 underline cursor-pointer"
            >
              Reportar problema o mediación
            </button>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <button
              onClick={() => {
                setSelectedJob(null);
                setCurrentTab('admin');
              }}
              className="hover:text-stone-900 underline cursor-pointer flex items-center gap-1 font-semibold text-stone-800"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Portal de Administración Central</span>
            </button>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Identidad & DNI Verificados</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProProfileModal
        pro={inspectingPro}
        onClose={() => setInspectingPro(null)}
        onContact={(pro) => {
          setInspectingPro(null);
          handleOpenContact(pro);
        }}
      />

      <ContactFlowModal
        pro={contactingPro}
        onClose={() => setContactingPro(null)}
        onContactCreated={handleContactCreated}
      />

      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          initialRole={authModalRole}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {reportModalOpen && (
        <HelpReportModal
          jobId={reportJobId}
          onClose={() => {
            setReportModalOpen(false);
            setReportJobId(undefined);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
