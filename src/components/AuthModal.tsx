import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Upload,
  FileText,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ZONES, CATEGORIES } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'client',
}) => {
  const { login, loginWithGoogle, register, requestPasswordReset } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [roleSelection, setRoleSelection] = useState<UserRole>(initialRole);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [phone, setPhone] = useState('');
  const [zone, setZone] = useState('CABA Norte (Palermo, Recoleta, Belgrano)');
  const [selectedCategory, setSelectedCategory] = useState('plomeria');
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  
  // DNI & Photo uploads for pros
  const [dniNumber, setDniNumber] = useState('');
  const [dniFrontUploaded, setDniFrontUploaded] = useState(false);
  const [dniFrontFileName, setDniFrontFileName] = useState('');
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [photoFileName, setPhotoFileName] = useState('');

  // Messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(email, password);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'Credenciales incorrectas');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (roleSelection === 'pro') {
      if (!dniNumber.trim()) {
        setErrorMessage('Por seguridad del cliente, el DNI es obligatorio para profesionales.');
        return;
      }
      if (!dniFrontUploaded) {
        setErrorMessage('Debes adjuntar la foto o archivo del DNI para validar tu identidad.');
        return;
      }
    }

    const res = register({
      name,
      email,
      password,
      role: roleSelection,
      phone,
      zone,
      commercialName: commercialName || name,
      dniNumber: roleSelection === 'pro' ? dniNumber : undefined,
      dniFrontUrl: dniFrontUploaded
        ? 'https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=500&auto=format&fit=crop&q=80'
        : undefined,
      photoUrl: photoUploaded
        ? '/src/assets/images/pro_photo_plumber_1791985818734.jpg'
        : undefined,
      categories: [selectedCategory],
      specialties: specialtyInput ? [specialtyInput] : ['Servicios generales'],
      bio: bioInput,
    });

    if (res.success) {
      setSuccessMessage('¡Cuenta creada con éxito! Bienvenido a la plataforma.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.error || 'No se pudo completar el registro');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const res = requestPasswordReset(email);
    setSuccessMessage(res.message);
  };

  const handleSimulateDniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDniFrontFileName(e.target.files[0].name);
      setDniFrontUploaded(true);
    } else {
      setDniFrontFileName('dni_frente_escaneado.jpg');
      setDniFrontUploaded(true);
    }
  };

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFileName(e.target.files[0].name);
      setPhotoUploaded(true);
    } else {
      setPhotoFileName('foto_perfil_profesional.jpg');
      setPhotoUploaded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {mode === 'login'
                ? 'Iniciar Sesión'
                : mode === 'register'
                ? 'Crear Cuenta Segura'
                : 'Recuperar Contraseña'}
            </h3>
            <p className="text-xs text-stone-500">
              Soluciones para tu Hogar · Plataforma de Servicios
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Login vs Register) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-stone-200 text-xs font-semibold text-center bg-stone-100/50">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-3 transition-colors ${
                mode === 'login'
                  ? 'bg-white text-stone-900 border-b-2 border-amber-600 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-3 transition-colors ${
                mode === 'register'
                  ? 'bg-white text-stone-900 border-b-2 border-amber-600 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Registrarme
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-stone-700">
          {/* Error & Success alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* GOOGLE SIGN-IN BUTTON */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                onClick={() => {
                  loginWithGoogle(roleSelection);
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <span className="relative bg-white px-2.5 text-[11px] text-stone-500 font-medium">
                  o ingresar con correo
                </span>
              </div>
            </div>
          )}

          {/* VIEW 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl bg-stone-50/40 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-700">
                    Contraseña *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage('');
                    }}
                    className="text-[11px] text-amber-800 hover:text-amber-950 underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 border border-stone-300 rounded-xl bg-stone-50/40 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
              >
                Ingresar a mi cuenta
              </button>

              {/* Quick test accounts for easy review */}
              <div className="pt-3 border-t border-stone-100">
                <span className="text-[11px] text-stone-500 font-semibold block mb-1.5">
                  Accesos rápidos de prueba:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      login('lucia.fernandez@example.com');
                      onClose();
                    }}
                    className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-left"
                  >
                    👤 Cliente: Lucía F.
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      login('martin.gomez.cerrajeria@example.com');
                      onClose();
                    }}
                    className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-left"
                  >
                    🔧 Pro: Martín G.
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role selection toggle */}
              <div>
                <label className="block font-semibold text-stone-800 mb-1.5">
                  ¿Cómo deseas utilizar la plataforma?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleSelection('client')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      roleSelection === 'client'
                        ? 'border-amber-600 bg-amber-50 text-stone-950 font-bold shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span className="block text-xs">👤 Soy Cliente</span>
                    <span className="block text-[10px] text-stone-500 font-normal">
                      Busco servicios para mi hogar
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSelection('pro')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      roleSelection === 'pro'
                        ? 'border-amber-600 bg-amber-50 text-stone-950 font-bold shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <span className="block text-xs">🛠️ Soy Profesional / Empresa</span>
                    <span className="block text-[10px] text-stone-500 font-normal">
                      Ofrezco servicios y recibo contactos
                    </span>
                  </button>
                </div>
              </div>

              {/* General fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50/40"
                  />
                </div>

                {roleSelection === 'pro' && (
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Nombre Comercial / Fantasía *
                    </label>
                    <input
                      type="text"
                      required
                      value={commercialName}
                      onChange={(e) => setCommercialName(e.target.value)}
                      placeholder="Ej. Plomería & Gas Express"
                      className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50/40"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50/40"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11 ..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50/40"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Zona de residencia o cobertura *
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-white font-medium"
                  >
                    {ZONES.filter((z) => z !== 'Todas las zonas').map((z, idx) => (
                      <option key={idx} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PROFESSIONAL MANDATORY DNI & PHOTO VERIFICATION */}
              {roleSelection === 'pro' && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/60 space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Verificación de Identidad (Obligatoria para Profesionales)</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Para proteger la seguridad de los clientes en sus hogares, cada profesional debe subir su DNI. La administración lo revisa confidencialmente antes de otorgar la insignia de identidad verificada.
                  </p>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Número de DNI / Documento de Identidad *
                    </label>
                    <input
                      type="text"
                      required
                      value={dniNumber}
                      onChange={(e) => setDniNumber(e.target.value)}
                      placeholder="Ej. 34.891.204"
                      className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                    />
                  </div>

                  {/* DNI File Upload Simulation */}
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Foto o copia del DNI (Frente) *
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="py-2 px-3 bg-white border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-stone-500" />
                        <span>{dniFrontUploaded ? 'Cambiar archivo' : 'Adjuntar DNI'}</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleSimulateDniUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-600 truncate">
                        {dniFrontUploaded ? `✓ ${dniFrontFileName}` : 'Sin archivo seleccionado'}
                      </span>
                    </div>
                  </div>

                  {/* Profile photo upload */}
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Foto de Perfil Profesional (Recomendada)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="py-2 px-3 bg-white border border-stone-300 rounded-lg font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-stone-500" />
                        <span>{photoUploaded ? 'Cambiar foto' : 'Subir foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSimulatePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-600 truncate">
                        {photoUploaded ? `✓ ${photoFileName}` : 'Foto de uniforme o trabajo'}
                      </span>
                    </div>
                  </div>

                  {/* Category and specialties */}
                  <div className="pt-2 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Rubro principal *
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Especialidad principal *
                      </label>
                      <input
                        type="text"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        placeholder="Ej. Destapaciones, urgencias"
                        className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
              >
                Completar Registro y Comenzar
              </button>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-stone-600 leading-relaxed">
                Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl bg-stone-50/40 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSuccessMessage('');
                  }}
                  className="font-semibold text-stone-700 hover:text-stone-900 underline"
                >
                  Volver al inicio de sesión
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Enviar enlace de recuperación
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
