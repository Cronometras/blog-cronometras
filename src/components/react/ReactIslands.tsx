import * as React from "react";
import ReactDOM from "react-dom";

// Importar el formulario directamente
import RequestDemoForm from "./RequestDemoForm";

// Componente para el formulario de solicitud de demo
export const RequestDemoFormIsland: React.FC<{ targetId: string }> = ({ targetId }) => {
  // Efecto para registrar la función de carga del formulario
  React.useEffect(() => {
    // Definimos la función para cargar el formulario en el modal
    if (typeof window !== 'undefined') {
      // Función para desmontar componentes React
      const handleBeforeUnload = () => {
        try {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            // @ts-ignore
            ReactDOM.unmountComponentAtNode(targetElement);
            console.log("Componente React desmontado al descargar la página");
          }
        } catch (error) {
          // Ignorar errores en la descarga
        }
      };

      // Definir la función global para cargar el formulario
      window.loadRequestDemoForm = () => {
        try {
          // Buscar el contenedor del formulario
          const targetElement = document.getElementById(targetId);
          if (!targetElement) {
            console.error("Contenedor de formulario no encontrado:", targetId);
            return;
          }

          // Primero desmontamos cualquier componente React que pudiera estar
          // montado en el contenedor usando unmountComponentAtNode
          try {
            // @ts-ignore - TypeScript no reconoce unmountComponentAtNode en tipos modernos
            // pero lo necesitamos para limpiar correctamente los componentes React
            ReactDOM.unmountComponentAtNode(targetElement);
            console.log("Componente React desmontado correctamente");
          } catch (unmountError) {
            console.warn("Error al desmontar componente React:", unmountError);
          }

          // Limpiar el contenedor antes de cada renderizado
          while (targetElement.firstChild) {
            targetElement.removeChild(targetElement.firstChild);
          }

          // Renderizar directamente usando ReactDOM.render clásico
          // en lugar de usar Hooks y createRoot para evitar errores
          ReactDOM.render(
            <RequestDemoForm />,
            targetElement
          );

          console.log("Formulario renderizado correctamente");
        } catch (error) {
          console.error("Error al cargar el formulario:", error);
        }
      };

      // Llamar a la función inmediatamente para asegurarnos de que esté disponible
      console.log("Registrando función loadRequestDemoForm en el ámbito global");

      // Verificar si el modal ya está abierto y cargar el formulario si es necesario
      setTimeout(() => {
        const modal = document.getElementById('requestDemoModal');
        if (modal && !modal.classList.contains('hidden')) {
          console.log("Modal ya está abierto, cargando formulario automáticamente");
          window.loadRequestDemoForm();
        }
      }, 500);

      // Registrar el evento de limpieza al descargar la página
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Limpieza al desmontar
      return () => {
        if (typeof window !== 'undefined') {
          window.loadRequestDemoForm = undefined;
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }
      };
    }

    // Si window no está definido (SSR), devolver una función de limpieza vacía
    return () => {};
  }, [targetId]);

  return null; // No renderizamos nada directamente
};

export default { RequestDemoFormIsland };