import React from 'react';
import { Text, Link, Section, Hr } from '@react-email/components';
import BaseEmail from '../BaseEmail';

interface ContactFormEmailProps {
  nombre: string;
  email: string;
  mensaje: string;
  dispositivo?: string;
  pais?: string;
}

export const ContactFormEmail: React.FC<ContactFormEmailProps> = ({
  nombre,
  email,
  mensaje,
  dispositivo = 'No disponible',
  pais = 'No disponible'
}) => {
  return (
    <BaseEmail title="Nuevo mensaje de contacto">
      <Text className="text-lg mb-4">
        Has recibido un nuevo mensaje de contacto de <strong>{nombre}</strong>.
      </Text>
      
      <Section className="bg-gray-50 p-4 rounded-lg my-4">
        <Text className="font-semibold mb-2">Información del remitente:</Text>
        <Text className="mb-1">Nombre: {nombre}</Text>
        <Text className="mb-1">
          Email: <Link href={`mailto:${email}`} className="text-accent underline">{email}</Link>
        </Text>
        <Hr className="my-2 border-t border-gray-200" />
        <Text className="font-semibold mb-2">Mensaje:</Text>
        <Text className="whitespace-pre-line">{mensaje}</Text>
      </Section>
      
      <Section className="bg-gray-100 p-4 rounded-lg mt-6 text-sm text-gray-600">
        <Text className="mb-1">Enviado desde: {dispositivo}</Text>
        <Text>País: {pais}</Text>
      </Section>
    </BaseEmail>
  );
};

export default ContactFormEmail; 