import React from 'react';
import { Text, Link, Section, Hr, Heading } from '@react-email/components';
import BaseEmail from '../BaseEmail';

interface InformationRequestEmailProps {
  nombre: string;
  email: string;
  empresa: string;
  sector: string;
  mensaje?: string;
  dispositivo?: string;
  pais?: string;
}

export const InformationRequestEmail: React.FC<InformationRequestEmailProps> = ({
  nombre,
  email,
  empresa,
  sector,
  mensaje = '',
  dispositivo = 'No disponible',
  pais = 'No disponible'
}) => {
  return (
    <BaseEmail 
      title="Solicitud de información sobre Cronometras App" 
      previewText="Nueva solicitud de información de Cronometras App"
    >
      <Text className="text-lg mb-4">
        Has recibido una nueva solicitud de información sobre Cronometras App de <strong>{nombre}</strong>.
      </Text>
      
      <Section className="bg-gray-50 p-4 rounded-lg my-4">
        <Heading as="h3" className="text-lg font-semibold mb-2">Información del solicitante:</Heading>
        <Text className="mb-1">Nombre: {nombre}</Text>
        <Text className="mb-1">
          Email: <Link href={`mailto:${email}`} className="text-accent underline">{email}</Link>
        </Text>
        <Hr className="my-2 border-t border-gray-200" />
        
        <Heading as="h3" className="text-lg font-semibold mb-2">Información de la empresa:</Heading>
        <Text className="mb-1">Empresa: <strong>{empresa}</strong></Text>
        <Text className="mb-1">Sector: <strong>{sector}</strong></Text>
        
        {mensaje && (
          <>
            <Hr className="my-2 border-t border-gray-200" />
            <Text className="font-semibold mb-2">Mensaje adicional:</Text>
            <Text className="whitespace-pre-line">{mensaje}</Text>
          </>
        )}
      </Section>
      
      <Section className="bg-gray-100 p-4 rounded-lg mt-6 text-sm text-gray-600">
        <Text className="mb-1">Enviado desde: {dispositivo}</Text>
        <Text>País: {pais}</Text>
      </Section>
    </BaseEmail>
  );
};

export default InformationRequestEmail; 