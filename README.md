# Entrena · Jonathan V2.4

Correcciones UX:
- El botón ✕ ahora cierra de forma fiable incluso con modales anidados.
- Se puede cerrar un modal tocando fuera de la tarjeta (salvo que sea una sesión activa, donde pide confirmación).
- Escape cierra el modal superior en computadora.
- El menú inferior muestra cursor de acción y respuesta hover en escritorio.
- Se actualiza la caché del Service Worker para forzar la nueva versión.

# Entrena · Jonathan V2

PWA mobile-first para registrar entrenamiento con flujo de un ejercicio por pantalla.

## Cambios principales V2
- Registro específico por tipo de actividad: fuerza, cardio, movilidad, respiración y portero.
- Un ejercicio por pantalla durante la sesión.
- Temporizador automático de descanso al marcar una serie de fuerza.
- Dolor de rodilla y abdomen 0–10 dentro de cada bloque.
- Flujo de adaptación si el dolor supera 3/10.
- Resumen final antes de guardar: duración, bloques, volumen, cardio y dolor máximo.
- Progresión automática solo sobre registros de fuerza completados.
- Corrección de fecha local para evitar desfases por UTC.
- Service Worker V2 con actualización de caché.
- Conserva el almacenamiento local anterior porque usa la misma clave localStorage.

## Ejecutar localmente
En esta carpeta:

```bash
python -m http.server 8080
```

Abrir:

```text
http://localhost:8080
```

## Si ya tenías V1 abierta
1. Detén el servidor anterior con Ctrl+C.
2. Sustituye la carpeta por esta V2 o ejecuta el servidor desde esta carpeta.
3. Abre http://localhost:8080.
4. Si Chrome sigue mostrando V1, haz Ctrl+F5 una vez. El Service Worker V2 elimina la caché antigua.

## Datos
La app guarda datos en localStorage del navegador. Conviene usar Ajustes > Respaldar JSON periódicamente antes de cambiar de navegador/equipo.

## Notificaciones
Las notificaciones incluidas dependen de que el navegador o la PWA pueda ejecutarse. Para push confiable con la app completamente cerrada se requiere backend/Web Push.


## V2.1
- El dolor de rodilla o abdomen >3/10 dispara una alerta adaptativa inmediatamente al mover el control.
- El panel de dolor cambia a estado visual de riesgo.


## V2.3
Corrige sincronización de peso entre dispositivos, registra historial de peso y muestra peso actual en Progreso.
