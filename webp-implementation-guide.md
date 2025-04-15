# Guía de implementación de imágenes WebP

Se han generado 115 imágenes WebP a partir de 115 imágenes originales.

## Ahorro de espacio
- Tamaño original: 0.00 MB
- Tamaño WebP: 0.00 MB
- Ahorro: NaN%

## Cómo implementar las imágenes WebP en tu sitio

### Opción 1: Usando la etiqueta `<picture>`

La etiqueta `<picture>` permite proporcionar diferentes fuentes de imagen según el soporte del navegador:

```html
<picture>
  <source srcset="/images/webp/nombre-de-imagen.webp" type="image/webp">
  <img src="/images/nombre-de-imagen.png" alt="Descripción de la imagen">
</picture>
```

### Opción 2: Usando JavaScript para detectar soporte de WebP

Puedes usar JavaScript para detectar si el navegador soporta WebP y cargar las imágenes correspondientes:

```javascript
function checkWebpSupport(callback) {
  var img = new Image();
  img.onload = function() {
    var result = (img.width > 0) && (img.height > 0);
    callback(result);
  };
  img.onerror = function() {
    callback(false);
  };
  img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
}

checkWebpSupport(function(support) {
  var images = document.querySelectorAll('img[data-src]');
  images.forEach(function(img) {
    if (support) {
      img.src = img.getAttribute('data-src').replace('/images/', '/images/webp/').replace(/\.(png|jpg|jpeg|gif)$/, '.webp');
    } else {
      img.src = img.getAttribute('data-src');
    }
  });
});
```

Y en tu HTML:

```html
<img data-src="/images/nombre-de-imagen.png" alt="Descripción de la imagen">
```

### Opción 3: Usando Astro para manejar las imágenes

Si estás usando Astro, puedes crear un componente personalizado para manejar las imágenes WebP:

```astro
---
// WebpImage.astro
const { src, alt, width, height, class: className } = Astro.props;
const webpSrc = src.replace('/images/', '/images/webp/').replace(/\.(png|jpg|jpeg|gif)$/, '.webp');
---

<picture>
  <source srcset={webpSrc} type="image/webp">
  <img src={src} alt={alt} width={width} height={height} class={className}>
</picture>
```

Y usarlo en tus páginas:

```astro
---
import WebpImage from '../components/WebpImage.astro';
---

<WebpImage src="/images/nombre-de-imagen.png" alt="Descripción de la imagen" />
```

## Lista de imágenes convertidas

A continuación se muestra una lista de todas las imágenes que se han convertido a formato WebP:

- adaptada a móviles, táblets y pc-2 -> adaptada a móviles, táblets y pc-2.webp
- adaptada a móviles, táblets y pc -> adaptada a móviles, táblets y pc.webp
- advanced-calculations -> advanced-calculations.webp
- aplicación de suplementos de fatiga OIT -> aplicación de suplementos de fatiga OIT.webp
- app cronometras en TABLET -> app cronometras en TABLET.webp
- Balanceo de Líneas -> Balanceo de Líneas.webp
- banner-img -> banner-img.webp
- calculo de tomas restantes -> calculo de tomas restantes.webp
- calculo de tomas restantes2 -> calculo de tomas restantes2.webp
- ccoo-industria -> ccoo-industria.webp
- clonación de estudios -> clonación de estudios.webp
- clonar -> clonar.webp
- comentarios en los registros de tiempos de un estudio de métodos y tiempos -> comentarios en los registros de tiempos de un estudio de métodos y tiempos.webp
- crea el método de trabajo -> crea el método de trabajo.webp
- crea un nuevo estudio de tiempos de trabajo -> crea un nuevo estudio de tiempos de trabajo.webp
- crear nuevo estudio de métodos y tiempos -> crear nuevo estudio de métodos y tiempos.webp
- creditos -> creditos.webp
- cronoanalisis de tiempos de máquina -> cronoanalisis de tiempos de máquina.webp
- cronometraje de elementos acíclicos en un estudio de tiempos -> cronometraje de elementos acíclicos en un estudio de tiempos.webp
- cronometraje de elementos frecuenciales en un estudio de tiempos -> cronometraje de elementos frecuenciales en un estudio de tiempos.webp
- cronometraje de tiempos de máquina -> cronometraje de tiempos de máquina.webp
- cronometraje industrial continuo con dictyado por voz -> cronometraje industrial continuo con dictyado por voz.webp
- cronometraje industrial de elementos repetitivos encadenados -> cronometraje industrial de elementos repetitivos encadenados.webp
- cronometraje industrial de tiempos repetitivos -> cronometraje industrial de tiempos repetitivos.webp
- Cronometraje y la estandarización de procesos -> Cronometraje y la estandarización de procesos.webp
- cronometras App -> cronometras App.webp
- cronometro repetitivos -> cronometro repetitivos.webp
- cronometro repetitivos2 -> cronometro repetitivos2.webp
- Cálculo de saturación en un estudio de tiempos -> Cálculo de saturación en un estudio de tiempos.webp
- Cálculo del número óptimo de máquinas que debe llevar un operario -> Cálculo del número óptimo de máquinas que debe llevar un operario.webp
- dashboard con todos los estudios de métodos y tiempos -> dashboard con todos los estudios de métodos y tiempos.webp
- dashboard-busqueda -> dashboard-busqueda.webp
- dashboard-navegacion -> dashboard-navegacion.webp
- data-visualization -> data-visualization.webp
- Desactiva elementos para tomar tiempos A elementos individualmente -> Desactiva elementos para tomar tiempos A elementos individualmente.webp
- descargar -> descargar.webp
- edición de tiempos -> edición de tiempos.webp
- edita tiempos frecuenciales en cronometraje industrial -> edita tiempos frecuenciales en cronometraje industrial.webp
- eliminar tiempos de máquina -> eliminar tiempos de máquina.webp
- estadisticas en tiempo real -> estadisticas en tiempo real.webp
- estandarizar tareas -> estandarizar tareas.webp
- estandarizción -> estandarizción.webp
- estudio de tiempos y movimientos -> estudio de tiempos y movimientos.webp
- estudio de tiempos -> estudio de tiempos.webp
- estudio del trabajo -> estudio del trabajo.webp
- estudios compartidos -> estudios compartidos.webp
- Etapas del estudio de tiempos en un cronometraje industrial -> Etapas del estudio de tiempos en un cronometraje industrial.webp
- excel-export -> excel-export.webp
- executive-summary -> executive-summary.webp
- Falta de permiso para editar un estudio de tiempo si no eres el propietario -> Falta de permiso para editar un estudio de tiempo si no eres el propietario.webp
- fases de un proceso industrial -> fases de un proceso industrial.webp
- fatigue-allowances -> fatigue-allowances.webp
- gestion integral de estudios -> gestion integral de estudios.webp
- gsd -> gsd.webp
- Herramientas necesarias para realizar un estudio de tiempos -> Herramientas necesarias para realizar un estudio de tiempos.webp
- hombre trabajando en 2 máquinas -> hombre trabajando en 2 máquinas.webp
- imagen de la app cronometras en pc -> imagen de la app cronometras en pc.webp
- imagen de la app cronometras en tablet -> imagen de la app cronometras en tablet.webp
- implementar el lean manufacturing -> implementar el lean manufacturing.webp
- importar exportar -> importar exportar.webp
- info -> info.webp
- informe automatizado -> informe automatizado.webp
- informe PDF -> informe PDF.webp
- La apreciación de la actividad en el cronometraje industrial -> La apreciación de la actividad en el cronometraje industrial.webp
- La Ergonomía del dolor a la productividad -> La Ergonomía del dolor a la productividad.webp
- library-average -> library-average.webp
- library-create -> library-create.webp
- library-search -> library-search.webp
- library-selection -> library-selection.webp
- library-workflow -> library-workflow.webp
- logo google play -> logo google play.webp
- logo -> logo.webp
- LOGO_ASETEMYT-300x300-1 -> LOGO_ASETEMYT-300x300-1.webp
- machine-fatigue -> machine-fatigue.webp
- mejorar la eficiencia -> mejorar la eficiencia.webp
- metodo - biblioteca de elementos 2 -> metodo - biblioteca de elementos 2.webp
- metodo-biblioteca de elementos 1 -> metodo-biblioteca de elementos 1.webp
- movil -> movil.webp
- muestreo del trabajo -> muestreo del trabajo.webp
- Métodos y Tiempos -> Métodos y Tiempos.webp
- Obeya room Lean -> Obeya room Lean.webp
- Objetivos del Estudio del Trabajo -> Objetivos del Estudio del Trabajo.webp
- optimiza-la-productividad-empresarial-con-el-control-de-tiempos-y-el-cronometraje-industrial -> optimiza-la-productividad-empresarial-con-el-control-de-tiempos-y-el-cronometraje-industrial.webp
- Optimización de sistemas productivos  Clave para la eficiencia industrial -> Optimización de sistemas productivos  Clave para la eficiencia industrial.webp
- pantalla de cronometraje contínuo -> pantalla de cronometraje contínuo.webp
- pantalla para cronometrar tiempos de máquina en un estudio de tiempos -> pantalla para cronometrar tiempos de máquina en un estudio de tiempos.webp
- pasar elementos al método de trabajo en bloque -> pasar elementos al método de trabajo en bloque.webp
- pasar elementos de trabajo al método -> pasar elementos de trabajo al método.webp
- personal-needs -> personal-needs.webp
- preferencias -> preferencias.webp
- propuesta de valor -> propuesta de valor.webp
- realizar estudio de tiempos -> realizar estudio de tiempos.webp
- reconocimiento de voz -> reconocimiento de voz.webp
- reducir el tiempo de entrega -> reducir el tiempo de entrega.webp
- reordena el metodo operatorio -> reordena el metodo operatorio.webp
- reordena el método de trabajo -> reordena el método de trabajo.webp
- report-customization -> report-customization.webp
- resultados en tiempo real -> resultados en tiempo real.webp
- resultados en tiempo real2 -> resultados en tiempo real2.webp
- retrasos en la producción -> retrasos en la producción.webp
- screenshot-1739271847048 -> screenshot-1739271847048.webp
- sistema bedaux -> sistema bedaux.webp
- special-allowances -> special-allowances.webp
- tablet2 -> tablet2.webp
- Takt time -> Takt time.webp
- TAL - cronometrasApp -> TAL - cronometrasApp.webp
- tecnicas de cronometraje industrial -> tecnicas de cronometraje industrial.webp
- tiempo estandar -> tiempo estandar.webp
- tiempos de máquina concurrentes para cálculo ed tiempo estandar -> tiempos de máquina concurrentes para cálculo ed tiempo estandar.webp
- tipos de elemento en un estudio de métodos y tiempos según su relación con la maquinaria -> tipos de elemento en un estudio de métodos y tiempos según su relación con la maquinaria.webp
- tipos de elemento según su frecuencia de aparición en el ciclod e trabajo -> tipos de elemento según su frecuencia de aparición en el ciclod e trabajo.webp
- tipos de elementos en un estudio de tiempos de trabajo -> tipos de elementos en un estudio de tiempos de trabajo.webp
- tipos de repetición en un estudio de métodos y tiempos -> tipos de repetición en un estudio de métodos y tiempos.webp
- tomas restantes -> tomas restantes.webp
- work-conditions -> work-conditions.webp
