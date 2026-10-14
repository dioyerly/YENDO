import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserAccount,
  ProfessionalProfile,
  ServiceJob,
  AppReport,
  CommissionPaymentRecord,
  ContactChannel,
  PaymentMethod,
  Review,
  VerificationStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROFESSIONALS,
  INITIAL_JOBS,
  INITIAL_REPORTS,
  INITIAL_COMMISSION_PAYMENTS,
} from '../data/mockData';

interface RegisterParams {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone: string;
  zone: string;
  commercialName?: string;
  dniNumber?: string;
  dniFrontUrl?: string;
  dniBackUrl?: string;
  photoUrl?: string;
  specialties?: string[];
  categories?: string[];
  bio?: string;
}

interface AppContextType {
  role: UserRole;
  currentUser: UserAccount | null;
  users: UserAccount[];
  adminAuthenticated: boolean;
  
  // Auth methods
  login: (email: string, password?: string) => { success: boolean; error?: string };
  loginWithGoogle: (preferredRole: UserRole) => void;
  register: (params: RegisterParams) => { success: boolean; error?: string };
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  logout: () => void;
  adminLogin: (passwordOrPin: string) => boolean;
  adminLogout: () => void;
  switchRoleDirect: (role: UserRole) => void;

  commissionRatePercent: number;
  setCommissionRatePercent: (rate: number) => void;
  professionals: ProfessionalProfile[];
  updateProfessionalProfile: (pro: ProfessionalProfile) => void;
  createProfessionalProfile: (pro: Omit<ProfessionalProfile, 'id'>) => ProfessionalProfile;
  verifyProfessionalDNI: (proId: string, status: VerificationStatus, notes?: string) => void;
  
  jobs: ServiceJob[];
  reports: AppReport[];
  commissionPayments: CommissionPaymentRecord[];
  
  // Job & Tracking actions
  initiateContact: (params: {
    proId: string;
    description: string;
    channel: ContactChannel;
    isEmergency: boolean;
  }) => ServiceJob;
  
  updateMilestone: (
    jobId: string,
    milestoneKey: keyof ServiceJob['milestones'],
    note?: string
  ) => void;
  
  respondToExternalContact: (
    jobId: string,
    responded: boolean,
    agreedToWork: boolean,
    note?: string
  ) => void;
  
  updateEstimatedPrice: (jobId: string, price: number) => void;
  reportProFinalPrice: (jobId: string, price: number, paymentMethod: PaymentMethod) => void;
  
  clientConfirmOrContestPayment: (params: {
    jobId: string;
    confirmedAmount: number;
    paymentMethod: PaymentMethod;
    matches: boolean;
    differenceReason?: string;
    receiptNote?: string;
  }) => void;
  
  submitReview: (jobId: string, rating: number, comment: string) => void;
  sendChatMessage: (jobId: string, text: string) => void;
  createReport: (params: { jobId?: string; reason: string; details: string }) => void;
  resolveReport: (reportId: string, resolution: string) => void;
  resolveDispute: (jobId: string, agreedFinalPrice: number, adminNote: string) => void;
  recordCommissionPayment: (record: Omit<CommissionPaymentRecord, 'id' | 'status'>) => void;
  updateCommissionStatus: (
    jobId: string,
    status: ServiceJob['commission']['status'],
    adminNote?: string
  ) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'soluciones_hogar_v2_storage';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USERS[0]); // default Lucía
  const [role, setRole] = useState<UserRole>('client');
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  
  const [commissionRatePercent, setCommissionRatePercentState] = useState<number>(5);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>(INITIAL_PROFESSIONALS);
  const [jobs, setJobs] = useState<ServiceJob[]>(INITIAL_JOBS);
  const [reports, setReports] = useState<AppReport[]>(INITIAL_REPORTS);
  const [commissionPayments, setCommissionPayments] = useState<CommissionPaymentRecord[]>(INITIAL_COMMISSION_PAYMENTS);

  // Load state from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users && Array.isArray(parsed.users)) setUsers(parsed.users);
        if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
        if (parsed.role) setRole(parsed.role);
        if (parsed.adminAuthenticated !== undefined) setAdminAuthenticated(parsed.adminAuthenticated);
        if (typeof parsed.commissionRatePercent === 'number') setCommissionRatePercentState(parsed.commissionRatePercent);
        if (parsed.professionals && Array.isArray(parsed.professionals)) setProfessionals(parsed.professionals);
        if (parsed.jobs && Array.isArray(parsed.jobs)) setJobs(parsed.jobs);
        if (parsed.reports && Array.isArray(parsed.reports)) setReports(parsed.reports);
        if (parsed.commissionPayments && Array.isArray(parsed.commissionPayments)) setCommissionPayments(parsed.commissionPayments);
      }
    } catch {
      // fallback to initial
    }
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          currentUser,
          role,
          adminAuthenticated,
          commissionRatePercent,
          professionals,
          jobs,
          reports,
          commissionPayments,
        })
      );
    } catch {
      // storage quota or private mode
    }
  }, [users, currentUser, role, adminAuthenticated, commissionRatePercent, professionals, jobs, reports, commissionPayments]);

  // Auth: Email & Password login
  const login = (email: string, password?: string) => {
    const trimmed = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === trimmed);

    if (found) {
      setCurrentUser(found);
      setRole(found.role);
      if (found.role === 'admin') {
        setAdminAuthenticated(true);
      }
      return { success: true };
    }

    // If not found, check if it matches a pro email from professionals
    const proFound = professionals.find((p) => p.email.toLowerCase() === trimmed);
    if (proFound) {
      const newProUser: UserAccount = {
        id: `user-${proFound.id}`,
        name: proFound.name,
        email: proFound.email,
        role: 'pro',
        phone: proFound.phone,
        zone: proFound.coverageZones[0] || 'CABA',
        avatarUrl: proFound.photoUrl,
        proProfileId: proFound.id,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newProUser]);
      setCurrentUser(newProUser);
      setRole('pro');
      return { success: true };
    }

    return {
      success: false,
      error: 'No encontramos una cuenta con ese correo. Por favor regístrate como Cliente o Profesional.',
    };
  };

  // Auth: Google Sign-In Simulation
  const loginWithGoogle = (preferredRole: UserRole) => {
    const googleId = `g-${Date.now()}`;
    const name = preferredRole === 'pro' ? 'Emprendedor Google' : 'Usuario Google';
    const email = `usuario.${googleId.slice(-4)}@gmail.com`;

    const existing = users.find((u) => u.email === email);
    if (existing) {
      setCurrentUser(existing);
      setRole(existing.role);
      return;
    }

    const newUser: UserAccount = {
      id: googleId,
      name,
      email,
      role: preferredRole,
      phone: '+54 9 11 5500-1122',
      zone: 'CABA Norte',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      isGoogleAuth: true,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setRole(preferredRole);
  };

  // Auth: Registration
  const register = (params: RegisterParams) => {
    const emailTrim = params.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === emailTrim);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const userId = `user-${Date.now()}`;
    let proId: string | undefined = undefined;

    if (params.role === 'pro') {
      proId = `pro-${Date.now()}`;
      const newPro: ProfessionalProfile = {
        id: proId,
        userId: userId,
        name: params.name.trim(),
        commercialName: params.commercialName?.trim() || params.name.trim(),
        photoUrl: params.photoUrl?.trim() || '/src/assets/images/pro_photo_locksmith_1791985818152.jpg',
        isCompany: false,
        rating: 5.0,
        reviewCount: 0,
        verifiedInAppReviewsCount: 0,
        experienceYears: 3,
        categories: params.categories && params.categories.length > 0 ? params.categories : ['otros'],
        specialties: params.specialties && params.specialties.length > 0 ? params.specialties : ['Servicios generales del hogar'],
        coverageZones: [params.zone || 'CABA'],
        exactAddressProtected: 'Domicilio validado por DNI',
        availability: 'available_now',
        acceptsEmergencies: true,
        scheduleText: 'Lunes a Viernes 08:00 a 19:00 hs',
        workingDays: 'Lunes a Sábados',
        responseTimeText: 'Responde consultas en ~20 min',
        bio: params.bio?.trim() || `Profesional verificado en ${params.zone || 'la zona'}. Atención de calidad con comprobante de DNI y experiencia en el rubro.`,
        portfolioPhotos: [],
        pricingType: 'diagnostic_visit',
        pricingNote: 'Presupuesto transparente previa visita de evaluación técnica.',
        allowedChannels: ['app_chat', 'whatsapp', 'phone'],
        phone: params.phone,
        email: emailTrim,
        whatsappPhone: params.phone,
        reviews: [],
        totalJobsCount: 0,
        dniNumber: params.dniNumber?.trim() || 'DNI en trámite',
        dniFrontUrl: params.dniFrontUrl || 'https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=500&auto=format&fit=crop&q=80',
        dniBackUrl: params.dniBackUrl,
        verificationStatus: 'pending',
        verificationNotes: 'DNI cargado al momento del registro. Requiere validación por la administración.',
      };

      setProfessionals((prev) => [newPro, ...prev]);
    }

    const newUser: UserAccount = {
      id: userId,
      name: params.name.trim(),
      email: emailTrim,
      role: params.role,
      phone: params.phone.trim(),
      zone: params.zone.trim(),
      avatarUrl: params.photoUrl || (params.role === 'pro' ? '/src/assets/images/pro_photo_locksmith_1791985818152.jpg' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'),
      createdAt: new Date().toISOString(),
      proProfileId: proId,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setRole(params.role);

    return { success: true };
  };

  // Auth: Password Reset Request
  const requestPasswordReset = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    return {
      success: true,
      message: `Hemos enviado un enlace seguro de recuperación al correo ${trimmed}. Sigue las instrucciones del mensaje para restablecer tu clave.`,
    };
  };

  // Auth: Logout
  const logout = () => {
    setCurrentUser(null);
    setAdminAuthenticated(false);
  };

  // Admin Login (PIN / Password)
  const adminLogin = (passwordOrPin: string) => {
    const clean = passwordOrPin.trim();
    if (clean === 'admin123' || clean === '1234' || clean.toLowerCase() === 'admin') {
      const adminUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[3];
      setCurrentUser(adminUser);
      setRole('admin');
      setAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setAdminAuthenticated(false);
    if (currentUser?.role === 'admin') {
      setCurrentUser(null);
      setRole('client');
    }
  };

  const switchRoleDirect = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setAdminAuthenticated(true);
      const adminUser = users.find((u) => u.role === 'admin') || INITIAL_USERS[3];
      setCurrentUser(adminUser);
    } else if (newRole === 'pro') {
      const proUser = users.find((u) => u.role === 'pro') || INITIAL_USERS[1];
      setCurrentUser(proUser);
    } else {
      const clientUser = users.find((u) => u.role === 'client') || INITIAL_USERS[0];
      setCurrentUser(clientUser);
    }
  };

  const setCommissionRatePercent = (rate: number) => {
    setCommissionRatePercentState(rate);
  };

  const updateProfessionalProfile = (updated: ProfessionalProfile) => {
    setProfessionals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const createProfessionalProfile = (proData: Omit<ProfessionalProfile, 'id'>): ProfessionalProfile => {
    const newPro: ProfessionalProfile = {
      ...proData,
      id: `pro-${Date.now()}`,
    };
    setProfessionals((prev) => [newPro, ...prev]);
    return newPro;
  };

  const verifyProfessionalDNI = (proId: string, status: VerificationStatus, notes?: string) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === proId ? { ...p, verificationStatus: status, verificationNotes: notes || p.verificationNotes } : p))
    );
  };

  const initiateContact = ({
    proId,
    description,
    channel,
    isEmergency,
  }: {
    proId: string;
    description: string;
    channel: ContactChannel;
    isEmergency: boolean;
  }): ServiceJob => {
    const pro = professionals.find((p) => p.id === proId) || professionals[0];
    const newCode = `SOL-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const clientName = currentUser ? currentUser.name : 'Cliente Anónimo';
    const clientId = currentUser ? currentUser.id : `client-guest-${Date.now()}`;
    const clientPhone = currentUser ? currentUser.phone : '+54 9 11 0000-0000';
    const clientZone = currentUser ? currentUser.zone : 'Zona Metropolitana';

    const newJob: ServiceJob = {
      id: `job-${Date.now()}`,
      code: newCode,
      clientId,
      clientName,
      clientPhone,
      clientZone,
      proId: pro.id,
      proName: pro.name,
      proCommercialName: pro.commercialName,
      categoryId: pro.categories[0] || 'otros',
      categoryName: pro.categories[0]?.toUpperCase() || 'Servicio del Hogar',
      description,
      isEmergency,
      initialChannel: channel,
      createdAt: nowIso,
      status: 'contact_initiated',
      proPaymentConfirmed: false,
      clientPaymentConfirmed: false,
      commission: {
        ratePercent: commissionRatePercent,
        grossAmount: 0,
        platformAmount: 0,
        proAmount: 0,
        status: 'pending_review',
      },
      milestones: {
        contact_initiated: {
          clientConfirmedAt: nowIso,
          clientActorName: clientName,
          note: `Contacto registrado mediante canal: ${channel.toUpperCase()}`,
        },
        pro_responded: {},
        job_accepted: {},
        price_agreed: {},
        visit_scheduled: {},
        work_started: {},
        work_completed: {},
        payment_reported: {},
        client_confirmed: {},
        closed_or_review: {},
      },
      historyEvents: [
        {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          actorRole: 'client',
          actorName: clientName,
          action: `Inició contacto por ${channel}`,
          channel,
          details: `El cliente abrió contacto con ${pro.name}. Se registró fecha y canal previo a la comunicación.`,
        },
      ],
      chatMessages:
        channel === 'app_chat'
          ? [
              {
                id: `msg-${Date.now()}`,
                senderRole: 'client',
                senderName: clientName,
                text: description,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]
          : [],
    };

    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const updateMilestone = (
    jobId: string,
    milestoneKey: keyof ServiceJob['milestones'],
    note?: string
  ) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Usuario';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const currentM = job.milestones[milestoneKey] || {};
        const isClient = role === 'client';
        const isPro = role === 'pro';

        const updatedM = {
          ...currentM,
          ...(isClient
            ? { clientConfirmedAt: nowIso, clientActorName: actorName }
            : {}),
          ...(isPro
            ? { proConfirmedAt: nowIso, proActorName: actorName }
            : {}),
          ...(note ? { note } : {}),
        };

        let newStatus = job.status;
        if (milestoneKey === 'pro_responded') newStatus = 'pro_responded';
        if (milestoneKey === 'visit_scheduled' || milestoneKey === 'job_accepted')
          newStatus = 'in_coordination';
        if (milestoneKey === 'work_started') newStatus = 'work_in_progress';

        const newEvent = {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          actorRole: role,
          actorName: actorName,
          action: `Actualizó hito: ${milestoneKey.replace(/_/g, ' ')}`,
          details: note || `Confirmado por ${actorName}`,
        };

        return {
          ...job,
          status: newStatus,
          milestones: {
            ...job.milestones,
            [milestoneKey]: updatedM,
          },
          historyEvents: [newEvent, ...job.historyEvents],
        };
      })
    );
  };

  const respondToExternalContact = (
    jobId: string,
    responded: boolean,
    agreedToWork: boolean,
    note?: string
  ) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Usuario';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const isClient = role === 'client';
        const updatedMilestones = { ...job.milestones };

        if (responded) {
          updatedMilestones.pro_responded = {
            ...updatedMilestones.pro_responded,
            ...(isClient
              ? { clientConfirmedAt: nowIso, clientActorName: actorName }
              : { proConfirmedAt: nowIso, proActorName: actorName }),
            note: note || 'Contacto confirmado con respuesta.',
          };
        }

        if (agreedToWork) {
          updatedMilestones.job_accepted = {
            ...updatedMilestones.job_accepted,
            ...(isClient
              ? { clientConfirmedAt: nowIso, clientActorName: actorName }
              : { proConfirmedAt: nowIso, proActorName: actorName }),
            note: 'Trabajo aceptado.',
          };
        }

        const newEvent = {
          id: `hist-${Date.now()}`,
          timestamp: nowIso,
          actorRole: role,
          actorName: actorName,
          action: agreedToWork ? 'Acordó realizar trabajo' : responded ? 'Confirmó que hubo respuesta' : 'Indicó sin respuesta aún',
          details: note,
        };

        return {
          ...job,
          status: agreedToWork ? 'in_coordination' : responded ? 'pro_responded' : job.status,
          milestones: updatedMilestones,
          historyEvents: [newEvent, ...job.historyEvents],
        };
      })
    );
  };

  const updateEstimatedPrice = (jobId: string, price: number) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Usuario';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          estimatedPrice: price,
          milestones: {
            ...job.milestones,
            price_agreed: {
              ...(role === 'pro'
                ? { proConfirmedAt: nowIso, proActorName: actorName }
                : { clientConfirmedAt: nowIso, clientActorName: actorName }),
              note: `Precio estimativo informado: $${price.toLocaleString()}`,
            },
          },
          historyEvents: [
            {
              id: `hist-${Date.now()}`,
              timestamp: nowIso,
              actorRole: role,
              actorName: actorName,
              action: `Informó precio estimado de $${price.toLocaleString()}`,
            },
            ...job.historyEvents,
          ],
        };
      })
    );
  };

  const reportProFinalPrice = (jobId: string, price: number, paymentMethod: PaymentMethod) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Profesional';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const rate = job.commission.ratePercent || commissionRatePercent;
        const platformAmt = Math.round(price * (rate / 100));
        const proAmt = price - platformAmt;

        const updatedHistory = [
          {
            id: `hist-${Date.now()}`,
            timestamp: nowIso,
            actorRole: 'pro' as UserRole,
            actorName: actorName,
            action: `Informó monto final cobrado: $${price.toLocaleString()} (${paymentMethod})`,
          },
          ...job.historyEvents,
        ];

        return {
          ...job,
          proFinalPriceReported: price,
          proPaymentMethod: paymentMethod,
          proPaymentConfirmed: true,
          commission: {
            ...job.commission,
            grossAmount: price,
            platformAmount: platformAmt,
            proAmount: proAmt,
          },
          milestones: {
            ...job.milestones,
            work_completed: {
              ...job.milestones.work_completed,
              proConfirmedAt: job.milestones.work_completed.proConfirmedAt || nowIso,
              proActorName: actorName,
            },
            payment_reported: {
              ...job.milestones.payment_reported,
              proConfirmedAt: nowIso,
              proActorName: actorName,
              note: `Profesional declaró $${price.toLocaleString()} abonados mediante ${paymentMethod}`,
            },
          },
          historyEvents: updatedHistory,
        };
      })
    );
  };

  const clientConfirmOrContestPayment = ({
    jobId,
    confirmedAmount,
    paymentMethod,
    matches,
    differenceReason,
    receiptNote,
  }: {
    jobId: string;
    confirmedAmount: number;
    paymentMethod: PaymentMethod;
    matches: boolean;
    differenceReason?: string;
    receiptNote?: string;
  }) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Cliente';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const proPrice = job.proFinalPriceReported || job.estimatedPrice || confirmedAmount;
        const isMatch = matches && proPrice === confirmedAmount;

        const rate = job.commission.ratePercent || commissionRatePercent;
        const platformAmt = Math.round(confirmedAmount * (rate / 100));
        const proAmt = confirmedAmount - platformAmt;

        const newStatus: ServiceJob['status'] = isMatch
          ? 'closed_pending_commission'
          : 'under_review';

        const updatedMilestones = { ...job.milestones };
        updatedMilestones.work_completed = {
          ...updatedMilestones.work_completed,
          clientConfirmedAt: nowIso,
          clientActorName: actorName,
        };
        updatedMilestones.payment_reported = {
          ...updatedMilestones.payment_reported,
          clientConfirmedAt: nowIso,
          clientActorName: actorName,
          note: `Cliente declaró $${confirmedAmount.toLocaleString()} (${paymentMethod})`,
        };
        updatedMilestones.client_confirmed = {
          clientConfirmedAt: nowIso,
          clientActorName: actorName,
          note: isMatch ? 'Resultado y pago confirmados sin objeción' : 'Informó diferencia en el monto',
        };
        updatedMilestones.closed_or_review = {
          ...(isMatch
            ? {
                clientConfirmedAt: nowIso,
                clientActorName: actorName,
                note: 'Cerrado de común acuerdo, pendiente de comisión a la plataforma',
              }
            : {
                clientConfirmedAt: nowIso,
                clientActorName: actorName,
                note: `Enviado a revisión administrativa por discrepancia: ${differenceReason}`,
              }),
        };

        const eventDetail = isMatch
          ? `Cliente confirmó pago idéntico de $${confirmedAmount.toLocaleString()}`
          : `Cliente declaró $${confirmedAmount.toLocaleString()} (discrepancia vs $${proPrice.toLocaleString()}). Motivo: ${differenceReason}`;

        const newEvents = [
          {
            id: `hist-${Date.now()}`,
            timestamp: nowIso,
            actorRole: 'client' as UserRole,
            actorName: actorName,
            action: isMatch ? 'Confirmó pago y resultado' : 'Informó discrepancia de pago',
            details: eventDetail,
          },
          ...job.historyEvents,
        ];

        return {
          ...job,
          clientFinalPriceReported: confirmedAmount,
          clientPaymentMethod: paymentMethod,
          clientPaymentConfirmed: true,
          hasPriceMismatch: !isMatch,
          priceMismatchReason: isMatch ? undefined : differenceReason,
          receiptNote,
          status: newStatus,
          commission: {
            ...job.commission,
            grossAmount: confirmedAmount,
            platformAmount: platformAmt,
            proAmount: proAmt,
            status: isMatch ? 'pending_payment' : 'disputed',
          },
          milestones: updatedMilestones,
          historyEvents: newEvents,
        };
      })
    );
  };

  const submitReview = (jobId: string, rating: number, comment: string) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Cliente';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        const targetProId = job.proId;

        const newReview: Review = {
          id: `rev-${Date.now()}`,
          clientName: job.clientName,
          rating,
          comment,
          date: new Date().toLocaleDateString(),
          isInAppVerified: true,
          serviceName: job.categoryName,
        };

        setProfessionals((proList) =>
          proList.map((p) => {
            if (p.id !== targetProId) return p;
            const updatedReviews = [newReview, ...p.reviews];
            const avgRating = Number(
              (
                updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
                updatedReviews.length
              ).toFixed(1)
            );
            return {
              ...p,
              reviews: updatedReviews,
              rating: avgRating,
              reviewCount: updatedReviews.length,
              verifiedInAppReviewsCount: p.verifiedInAppReviewsCount + 1,
            };
          })
        );

        return {
          ...job,
          reviewSubmitted: {
            rating,
            comment,
            createdAt: nowIso,
          },
          historyEvents: [
            {
              id: `hist-${Date.now()}`,
              timestamp: nowIso,
              actorRole: 'client' as UserRole,
              actorName: actorName,
              action: `Publicó reseña (${rating}/5 estrellas)`,
              details: comment,
            },
            ...job.historyEvents,
          ],
        };
      })
    );
  };

  const sendChatMessage = (jobId: string, text: string) => {
    if (!text.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isPro = role === 'pro';

    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        const newMsg = {
          id: `m-${Date.now()}`,
          senderRole: (isPro ? 'pro' : 'client') as 'client' | 'pro',
          senderName: isPro ? job.proName : job.clientName,
          text: text.trim(),
          timestamp: nowTime,
        };
        return {
          ...job,
          chatMessages: [...job.chatMessages, newMsg],
        };
      })
    );
  };

  const createReport = ({
    jobId,
    reason,
    details,
  }: {
    jobId?: string;
    reason: string;
    details: string;
  }) => {
    const actorName = currentUser ? currentUser.name : 'Usuario';
    const newRep: AppReport = {
      id: `rep-${Date.now()}`,
      jobId,
      reporterRole: role,
      reporterName: actorName,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newRep, ...prev]);
  };

  const resolveReport = (reportId: string, resolution: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved', adminResolution: resolution } : r))
    );
  };

  const resolveDispute = (jobId: string, agreedFinalPrice: number, adminNote: string) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Administradora';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;

        const rate = job.commission.ratePercent || commissionRatePercent;
        const platformAmt = Math.round(agreedFinalPrice * (rate / 100));
        const proAmt = agreedFinalPrice - platformAmt;

        return {
          ...job,
          status: 'closed_pending_commission',
          hasPriceMismatch: false,
          clientFinalPriceReported: agreedFinalPrice,
          proFinalPriceReported: agreedFinalPrice,
          commission: {
            ...job.commission,
            grossAmount: agreedFinalPrice,
            platformAmount: platformAmt,
            proAmount: proAmt,
            status: 'pending_payment',
            adminNote: `Disputa mediada por administración: ${adminNote}`,
          },
          historyEvents: [
            {
              id: `hist-${Date.now()}`,
              timestamp: nowIso,
              actorRole: 'admin',
              actorName: actorName,
              action: `Disputa resuelta por administradora`,
              details: `Monto unificado en $${agreedFinalPrice.toLocaleString()}. Nota: ${adminNote}`,
            },
            ...job.historyEvents,
          ],
        };
      })
    );
  };

  const recordCommissionPayment = (record: Omit<CommissionPaymentRecord, 'id' | 'status'>) => {
    const newRecord: CommissionPaymentRecord = {
      ...record,
      id: `comm-pay-${Date.now()}`,
      status: 'confirmed',
    };
    setCommissionPayments((prev) => [newRecord, ...prev]);
  };

  const updateCommissionStatus = (
    jobId: string,
    status: ServiceJob['commission']['status'],
    adminNote?: string
  ) => {
    const nowIso = new Date().toISOString();
    const actorName = currentUser ? currentUser.name : 'Administradora';
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          status: status === 'paid' ? 'closed_commission_paid' : job.status,
          commission: {
            ...job.commission,
            status,
            adminNote: adminNote || job.commission.adminNote,
            paidAt: status === 'paid' ? nowIso : job.commission.paidAt,
          },
          historyEvents: [
            {
              id: `hist-${Date.now()}`,
              timestamp: nowIso,
              actorRole: 'admin',
              actorName: actorName,
              action: `Estado de comisión actualizado a: ${status}`,
              details: adminNote,
            },
            ...job.historyEvents,
          ],
        };
      })
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setRole('client');
    setAdminAuthenticated(false);
    setCommissionRatePercentState(5);
    setProfessionals(INITIAL_PROFESSIONALS);
    setJobs(INITIAL_JOBS);
    setReports(INITIAL_REPORTS);
    setCommissionPayments(INITIAL_COMMISSION_PAYMENTS);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentUser,
        users,
        adminAuthenticated,
        login,
        loginWithGoogle,
        register,
        requestPasswordReset,
        logout,
        adminLogin,
        adminLogout,
        switchRoleDirect,
        commissionRatePercent,
        setCommissionRatePercent,
        professionals,
        updateProfessionalProfile,
        createProfessionalProfile,
        verifyProfessionalDNI,
        jobs,
        reports,
        commissionPayments,
        initiateContact,
        updateMilestone,
        respondToExternalContact,
        updateEstimatedPrice,
        reportProFinalPrice,
        clientConfirmOrContestPayment,
        submitReview,
        sendChatMessage,
        createReport,
        resolveReport,
        resolveDispute,
        recordCommissionPayment,
        updateCommissionStatus,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
