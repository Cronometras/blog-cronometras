import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type ContactFormData = {
  nombre: string;
  email: string;
  mensaje: string;
  privacyPolicy: boolean;
};

const ContactFormEn: React.FC = () => {
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
        throw new Error(result.error || 'An error occurred while sending the message');
      }

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while sending the message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitStatus === 'success' && (
        <div className="p-4 mb-4 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 rounded-lg" role="alert">
          Message sent successfully! We will contact you soon.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 mb-4 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-lg" role="alert">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name
        </label>
        <input
          id="nombre"
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.nombre ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('nombre', { required: 'Name is required' })}
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
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email is not valid'
            }
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message
        </label>
        <textarea
          id="mensaje"
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
            errors.mensaje ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('mensaje', { required: 'Message is required' })}
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
                required: 'You must accept the privacy policy to continue'
              })}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="privacyPolicy" className={`font-medium dark:text-gray-300 ${
              errors.privacyPolicy ? 'text-red-500' : 'text-gray-700'
            }`}>
              I accept the <a href="/en/privacy" target="_blank" className="text-accent hover:underline">privacy policy</a>
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
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Your data will be processed according to our privacy policy and will not be shared with third parties.
      </p>
    </form>
  );
};

export default ContactFormEn;