import React from 'react';
import { Text, Link, Button, Section } from '@react-email/components';
import BaseEmail from '../BaseEmail';

interface NewsletterSignupEmailProps {
  nombre?: string;
  email: string;
  confirmUrl: string;
}

export const NewsletterSignupEmail: React.FC<NewsletterSignupEmailProps> = ({
  nombre = 'Usuario',
  email,
  confirmUrl
}) => {
  return (
    <BaseEmail 
      title="Confirma tu suscripción a nuestro newsletter" 
      previewText="Un paso más para recibir nuestras novedades"
    >
      <Text className="text-lg mb-4">
        Hola{nombre !== 'Usuario' ? ` ${nombre}` : ''},
      </Text>
      
      <Text className="mb-4">
        Gracias por suscribirte a nuestro newsletter. Para completar tu suscripción y comenzar a recibir nuestras novedades, necesitamos que confirmes tu dirección de correo electrónico.
      </Text>
      
      <Section className="text-center my-8">
        <Button
          href={confirmUrl}
          className="bg-accent text-white py-3 px-6 rounded-lg font-medium no-underline inline-block"
        >
          Confirmar suscripción
        </Button>
      </Section>
      
      <Text className="mb-4 text-sm text-gray-600">
        Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:
      </Text>
      
      <Text className="text-xs text-gray-500 break-all mb-6">
        <Link href={confirmUrl} className="text-accent">
          {confirmUrl}
        </Link>
      </Text>
      
      <Text className="text-sm text-gray-600 mb-2">
        Si no has solicitado esta suscripción, puedes ignorar este correo electrónico.
      </Text>
      
      <Text className="text-sm text-gray-600">
        El enlace de confirmación expirará en 24 horas.
      </Text>
    </BaseEmail>
  );
};

export default NewsletterSignupEmail; 