import * as React from "react";
import { createRoot } from "react-dom/client";

// Importar el formulario directamente
import RequestDemoForm from "./RequestDemoForm";

// Componente para el formulario de solicitud de demo
export const RequestDemoFormIsland: React.FC<{ targetId: string }> = ({ targetId }) => {
  // Efecto para registrar la función de carga del formulario
  React.useEffect(() => {
    // Definimos la función para cargar el formulario en el modal
    if (typeof window !== 'undefined') {
      // Variable para almacenar la instancia de root
      let rootInstance: any = null;

      // Función para desmontar componentes React
      const handleBeforeUnload = () => {
        try {
          if (rootInstance) {
            rootInstance.unmount();
            rootInstance = null;
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

          // Desmontar el componente anterior si existe
          if (rootInstance) {
            try {
              rootInstance.unmount();
              console.log("Componente React anterior desmontado correctamente");
            } catch (unmountError) {
              console.warn("Error al desmontar componente React anterior:", unmountError);
            }
          }

          // Limpiar el contenedor antes de cada renderizado
          while (targetElement.firstChild) {
            targetElement.removeChild(targetElement.firstChild);
          }

          // Crear una nueva instancia de root y renderizar
          rootInstance = createRoot(targetElement);
          rootInstance.render(<RequestDemoForm />);

          console.log("Formulario renderizado correctamente con createRoot");
        } catch (error) {
          console.error("Error al cargar el formulario:", error);
        }
      };

      // Definir la función global para descargar el formulario
      window.unloadRequestDemoForm = () => {
        try {
          if (rootInstance) {
            rootInstance.unmount();
            rootInstance = null;
            console.log("Componente React desmontado manualmente");
          }
        } catch (error) {
          console.error("Error al desmontar el formulario:", error);
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
          // Desmontar el componente React si existe
          if (rootInstance) {
            try {
              rootInstance.unmount();
              rootInstance = null;
            } catch (error) {
              console.warn("Error al limpiar componente React:", error);
            }
          }
          window.loadRequestDemoForm = undefined;
          window.unloadRequestDemoForm = undefined;
          window.removeEventListener('beforeunload', handleBeforeUnload);
        }
      };
    }

    // Si window no está definido (SSR), devolver una función de limpieza vacía
    return () => { };
  }, [targetId]);

  return null; // No renderizamos nada directamente
};

export default { RequestDemoFormIsland };