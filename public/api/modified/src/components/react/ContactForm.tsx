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
      const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      try {
        // Intentar analizar la respuesta como JSON independientemente del encabezado
        const responseText = await response.text();
        console.log('Respuesta recibida:', responseText);

        // Intentar analizar el texto como JSON
        let result;
        try {
          result = JSON.parse(responseText);
          console.log('Datos analizados:', result);
        } catch (parseError) {
          console.error('Error al analizar JSON:', parseError);
          throw new Error('Respuesta no válida del servidor');
        }

        if (!response.ok) {
          throw new Error(result.error || 'Ha ocurrido un error al enviar el mensaje');
        }

        setSubmitStatus('success');
        reset();
      } catch (responseError) {
        console.error('Error al procesar la respuesta:', responseError);
        throw new Error('Ha ocurrido un error al enviar el mensaje. El servidor no respondió correctamente.');
      }
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
          ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
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
          type="text"
          id="nombre"
          {...register('nombre', { required: 'El nombre es obligatorio' })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors ${
            errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder="Tu nombre"
        />
        {errors.nombre && <p className="mt-1 text-sm text-red-500">{errors.nombre.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email', { 
            required: 'El email es obligatorio',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Por favor, introduce un email válido'
            }
          })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder="tu@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          {...register('mensaje', { required: 'El mensaje es obligatorio' })}
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent/50 outline-none transition-colors ${
            errors.mensaje ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } dark:bg-gray-700 dark:text-white`}
          placeholder="¿En qué podemos ayudarte?"
        ></textarea>
        {errors.mensaje && <p className="mt-1 text-sm text-red-500">{errors.mensaje.message}</p>}
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="privacyPolicy"
            type="checkbox"
            {...register('privacyPolicy', { required: 'Debes aceptar la política de privacidad' })}
            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-accent/50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="privacyPolicy" className="font-medium text-gray-700 dark:text-gray-300">
            Acepto la <a href="/es/privacy/" className="text-accent hover:underline">política de privacidad</a>
          </label>
          {errors.privacyPolicy && <p className="mt-1 text-sm text-red-500">{errors.privacyPolicy.message}</p>}
        </div>
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
    </form>
  );
};

export default ContactForm;
