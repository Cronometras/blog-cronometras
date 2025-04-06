import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Img,
  Row,
  Column,
  Hr,
  Link,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

interface BaseEmailProps {
  previewText?: string;
  title: string;
  children: React.ReactNode;
  footerText?: string;
  logoUrl?: string;
}

export const BaseEmail: React.FC<BaseEmailProps> = ({
  previewText = 'Correo de Cronometras App',
  title,
  children,
  footerText = '© ' + new Date().getFullYear() + ' Cronometras App. Todos los derechos reservados.',
  logoUrl = 'https://cronometras.com/images/logo.png',
}) => {
  return (
    <Html>
      <Head>
        {previewText && <title>{previewText}</title>}
        {previewText && <meta name="description" content={previewText} />}
      </Head>
      <Tailwind>
        <Body className="bg-gray-100 text-gray-800 font-sans">
          <Container className="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <Section className="bg-accent text-white p-6">
              <Row>
                <Column>
                  <Img
                    src={logoUrl}
                    alt="Cronometras Logo"
                    width="150"
                    height="auto"
                    className="mb-4"
                  />
                  <Heading className="text-2xl font-bold">{title}</Heading>
                </Column>
              </Row>
            </Section>
            
            <Section className="px-8 py-6">
              {children}
            </Section>
            
            <Hr className="border-t border-gray-300 my-0" />
            
            <Section className="bg-gray-50 px-8 py-4 text-center text-gray-600 text-xs">
              <Text>{footerText}</Text>
              <Text>
                <Link href="https://cronometras.com" className="text-accent underline">
                  cronometras.com
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BaseEmail; 