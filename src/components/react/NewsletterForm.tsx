import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type NewsletterFormData = {
  nombre?: string;
  email: string;
  privacyPolicy: boolean;
};

interface NewsletterFormProps {
  showNameField?: boolean;
  className?: string;
}

const NewsletterForm: React.FC<NewsletterFormProps> = ({ 
  showNameField = false,
  className = ""
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NewsletterFormData>();
  
  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Ha ocurrido un error al procesar tu suscripción');
      }
      
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Ha ocurrido un error al procesar tu suscripción');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${className}`}>
      {submitStatus === 'success' && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          ¡Gracias por suscribirte! Por favor, revisa tu correo electrónico para confirmar tu suscripción.
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        {showNameField && (
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre (opcional)
            </label>
            <input
              id="nombre"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
              placeholder="Tu nombre"
              {...register('nombre')}
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="email"
              type="email"
              className={`flex-grow px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="tucorreo@ejemplo.com"
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'El email no es válido'
                }
              })}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-6 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enviando...' : 'Suscribirse'}
            </button>
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="privacyPolicy"
              type="checkbox"
              className={`h-4 w-4 rounded border-gray-300 accent-accent focus:ring-accent ${
                errors.privacyPolicy ? 'border-red-500' : ''
              }`}
              {...register('privacyPolicy', { 
                required: 'Debes aceptar la política de privacidad para continuar' 
              })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="privacyPolicy" className={`font-medium ${
              errors.privacyPolicy ? 'text-red-500' : 'text-gray-700'
            }`}>
              Acepto la <a href="/es/privacy" target="_blank" className="text-accent hover:underline">política de privacidad</a>
            </label>
          </div>
        </div>
        {errors.privacyPolicy && (
          <p className="mt-1 text-sm text-red-600">{errors.privacyPolicy.message}</p>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        Recibirás nuestro newsletter con novedades sobre Cronometras App, consejos sobre productividad y actualizaciones relevantes.
        No compartiremos tu correo con terceros y puedes darte de baja en cualquier momento.
      </p>
    </form>
  );
};

export default NewsletterForm; 