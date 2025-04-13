import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type ContactFormData = {
  nombre: string;
  email: string;
  mensaje: string;
  privacyPolicy: boolean;
};

const ContactForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ha ocurrido un error al enviar el mensaje');
      }

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Ha ocurrido un error al enviar el mensaje');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitStatus === 'success' && (
        <div className="p-4 mb-4 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-lg" role="alert">
          ¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 mb-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg" role="alert">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre
        </label>
        <input
          id="nombre"
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.nombre ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('nombre', { required: 'El nombre es obligatorio' })}
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
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

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.mensaje ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('mensaje', { required: 'El mensaje es obligatorio' })}
        ></textarea>
        {errors.mensaje && (
          <p className="mt-1 text-sm text-red-600">{errors.mensaje.message}</p>
        )}
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
            <label htmlFor="privacyPolicy" className={`font-medium dark:text-gray-300 ${
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
          {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Tus datos serán tratados según nuestra política de privacidad y no serán compartidos con terceros.
      </p>
    </form>
  );
};

export default ContactForm;