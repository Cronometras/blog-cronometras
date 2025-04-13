import React, { useState, useEffect } from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';

// Define un tipo para las traducciones
interface Translations {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  privacyPolicy: string;
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  companyRequired: string;
  privacyRequired: string;
  submitButton: string;
  submitting: string;
  thankYouTitle: string;
  thankYouMessage: string;
  closeButton: string;
  optional: string;
  messageLabel: string;
  messagePlaceholder: string;
  requiredFields: string;
  privacyLink: string;
  connectionError: string;
  serverError: string;
}

// Define las traducciones para cada idioma
const translations: Record<string, Translations> = {
  es: {
    fullName: 'Nombre completo *',
    email: 'Email *',
    company: 'Empresa *',
    phone: 'Teléfono',
    message: 'Mensaje',
    privacyPolicy: 'Acepto la',
    nameRequired: 'El nombre es obligatorio',
    emailRequired: 'El email es obligatorio',
    emailInvalid: 'Email inválido',
    companyRequired: 'La empresa es obligatoria',
    privacyRequired: 'Debes aceptar la política de privacidad',
    submitButton: 'Solicitar Demo',
    submitting: 'Enviando...',
    thankYouTitle: '¡Gracias por tu interés!',
    thankYouMessage: 'Hemos recibido tu solicitud de demostración. Nos pondremos en contacto contigo pronto para coordinar una sesión.',
    closeButton: 'Cerrar',
    optional: '(opcional)',
    messageLabel: 'Mensaje',
    messagePlaceholder: 'Cuéntanos más sobre tus necesidades (opcional)',
    requiredFields: 'Los campos marcados con * son obligatorios. Tus datos serán tratados según nuestra política de privacidad.',
    privacyLink: 'política de privacidad',
    connectionError: 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
    serverError: 'Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo.'
  },
  en: {
    fullName: 'Full Name *',
    email: 'Email *',
    company: 'Company *',
    phone: 'Phone',
    message: 'Message',
    privacyPolicy: 'I accept the',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email',
    companyRequired: 'Company is required',
    privacyRequired: 'You must accept the privacy policy',
    submitButton: 'Request Demo',
    submitting: 'Submitting...',
    thankYouTitle: 'Thank you for your interest!',
    thankYouMessage: 'We have received your demo request. We will contact you soon to schedule a session.',
    closeButton: 'Close',
    optional: '(optional)',
    messageLabel: 'Message',
    messagePlaceholder: 'Tell us more about your needs (optional)',
    requiredFields: 'Fields marked with * are required. Your data will be processed according to our privacy policy.',
    privacyLink: 'privacy policy',
    connectionError: 'Connection error. Please check your internet connection and try again.',
    serverError: 'An error occurred while submitting the form. Please try again.'
  }
};

// Define un tipo para el estado del formulario
interface FormState {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  privacyPolicy: boolean;
}

// Tipo para los errores
interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
  privacyPolicy?: string;
}

// Estado inicial del formulario
const initialFormState: FormState = {
  name: '',
  email: '',
  company: '',
  phone: '',
  message: '',
  privacyPolicy: false
};

const RequestDemoForm: React.FC = () => {
  // Detectar el idioma actual
  const [lang, setLang] = useState<string>('es'); // Por defecto español

  // Estados para el formulario
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  // Detectar el idioma actual basado en la URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/en')) {
      setLang('en');
    } else {
      setLang('es');
    }
    console.log("Idioma detectado:", path.startsWith('/en') ? 'en' : 'es');
  }, []);

  // Acceso fácil a las traducciones
  const t = translations[lang];

  // Efecto para limpiar el estado al montar el componente
  // Esto asegura que el formulario empiece limpio cada vez
  useEffect(() => {
    // Inicializar/resetear el formulario
    setFormData(initialFormState);
    setErrors({});
    setIsSubmitting(false);
    setIsSubmitted(false);
    setServerError('');

    console.log("RequestDemoForm montado/inicializado");

    return () => {
      console.log("RequestDemoForm desmontado");
    };
  }, []);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario escribe
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Manejar cambios en el checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));

    // Limpiar error cuando el usuario marca el checkbox
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Validar el formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    if (!formData.company.trim()) {
      newErrors.company = t.companyRequired;
    }

    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = t.privacyRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await fetch('/.netlify/functions/information-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...formData, lang}), // Incluir el idioma en la solicitud
      });

      try {
        // Intentar analizar la respuesta como JSON independientemente del encabezado
        const responseText = await response.text();
        console.log('Respuesta recibida:', responseText);

        // Intentar analizar el texto como JSON
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('Datos analizados:', data);
        } catch (parseError) {
          console.error('Error al analizar JSON:', parseError);
          throw new Error('Respuesta no válida del servidor');
        }

        if (response.ok) {
          setIsSubmitted(true);
          setFormData(initialFormState);
        } else {
          setServerError(data.error || t.serverError);
        }
      } catch (responseError) {
        console.error('Error al procesar la respuesta:', responseError);
        setServerError(t.serverError);
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setServerError(t.connectionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si el formulario se envió con éxito, mostrar mensaje de confirmación
  if (isSubmitted) {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center mb-6">
          <IoCheckmarkCircle className="text-green-500 text-6xl" />
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t.thankYouTitle}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t.thankYouMessage}
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            window.closeRequestDemoModal && window.closeRequestDemoModal();
          }}
          className="bg-accent hover:bg-accent-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {t.closeButton}
        </button>
      </div>
    );
  }

  // Formulario normal
  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="RequestDemoForm">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.fullName}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors ${
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder={lang === 'es' ? "Tu nombre" : "Your name"}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.email}
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder={lang === 'es' ? "Tu email" : "Your email"}
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.company}
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors ${
            errors.company ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder={lang === 'es' ? "Nombre de tu empresa" : "Your company name"}
        />
        {errors.company && <p className="mt-1 text-sm text-red-500">{errors.company}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.phone} {t.optional}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors dark:bg-gray-700 dark:text-white"
          placeholder={lang === 'es' ? "Tu teléfono (opcional)" : "Your phone (optional)"}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors dark:bg-gray-700 dark:text-white"
          placeholder={t.messagePlaceholder}
        ></textarea>
      </div>

      <div className="mt-4">
        <div className={`flex items-start ${errors.privacyPolicy ? 'text-red-500' : ''}`}>
          <div className="flex h-5 items-center">
            <input
              id="privacyPolicy"
              name="privacyPolicy"
              type="checkbox"
              checked={formData.privacyPolicy}
              onChange={handleCheckboxChange}
              className={`h-4 w-4 rounded border-gray-300 accent-accent focus:ring-accent/50 ${
                errors.privacyPolicy ? 'border-red-500' : ''
              }`}
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="privacyPolicy" className={`font-medium ${errors.privacyPolicy ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
              {t.privacyPolicy} <a href={`/${lang}/privacy`} target="_blank" className="text-accent hover:underline">{t.privacyLink}</a> *
            </label>
          </div>
        </div>
        {errors.privacyPolicy && <p className="mt-1 text-sm text-red-500">{errors.privacyPolicy}</p>}
      </div>

      {serverError && (
        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {serverError}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full max-w-xs bg-accent hover:bg-accent-dark text-white font-medium py-3 px-6 rounded-lg transition-colors ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? t.submitting : t.submitButton}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        {t.requiredFields}
      </p>
    </form>
  );
};

export default RequestDemoForm;

// Definir el tipo global para TypeScript
declare global {
  interface Window {
    loadRequestDemoForm?: () => void;
    closeRequestDemoModal?: () => void;
  }
}