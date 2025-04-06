import React from 'react';

interface TrackedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  category?: string;
  action?: string;
  label?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
}

const TrackedLink: React.FC<TrackedLinkProps> = ({
  href,
  children,
  className = '',
  category = 'link',
  action = 'click',
  label,
  target,
  rel,
  ...rest
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Verificar si gtag está disponible
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // Enviar el evento a Google Analytics
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label || href,
      });
    }
  };

  // Si el enlace se abre en una nueva pestaña, agregar noopener y noreferrer
  const relValue = target === '_blank' ? `${rel || ''} noopener noreferrer`.trim() : rel;

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={relValue}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
};

export default TrackedLink; 