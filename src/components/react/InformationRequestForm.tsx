import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type InformationRequestData = {
  nombre: string;
  email: string;
  empresa: string;
  sector: string;
  mensaje?: string;
  privacyPolicy: boolean;
};

const InformationRequestForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InformationRequestData>();

  const onSubmit = async (data: InformationRequestData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/information-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ha ocurrido un error al enviar la solicitud');
      }

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Ha ocurrido un error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lista de sectores para el selector
  const sectores = [
    'Industria manufacturera',
    'Construcción',
    'Logística y transporte',
    'Comercio',
    'Servicios',
    'Alimentación',
    'Tecnología',
    'Sanidad',
    'Educación',
    'Otros'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitStatus === 'success' && (
        <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          ¡Solicitud enviada correctamente! Nos pondremos en contacto contigo pronto con más información sobre Cronometras App.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('nombre', { required: 'El nombre es obligatorio' })}
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('email', {
              required: 'El email es obligatorio',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'El email no es válido'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <input
            id="empresa"
            type="text"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent ${
              errors.empresa ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('empresa', { required: 'El nombre de la empresa es obligatorio' })}
          />
          {errors.empresa && (
            <p className="mt-1 text-sm text-red-600">{errors.empresa.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
            Sector
          </label>
          <select
            id="sector"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent ${
              errors.sector ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('sector', { required: 'Selecciona un sector' })}
          >
            <option value="">Selecciona un sector</option>
            {sectores.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          {errors.sector && (
            <p className="mt-1 text-sm text-red-600">{errors.sector.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje (opcional)
        </label>
        <textarea
          id="mensaje"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
          placeholder="Escribe aquí cualquier detalle adicional o pregunta específica sobre la aplicación..."
          {...register('mensaje')}
        ></textarea>
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

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Enviando...' : 'Solicitar información'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        Al enviar este formulario, recibirás información detallada sobre Cronometras App
        adaptada a las necesidades de tu empresa y sector. Tus datos serán tratados según nuestra política de privacidad.
      </p>
    </form>
  );
};

export default InformationRequestForm;