
## DesApp 2024c1
## PPS 202421
### Grupo 4 - Beevents

---
    **Nota**: La sección siguiente proporciona una guía para el despliegue de la API de backend
    para la plataforma "Beevents" y debe actualizarse conforme se agreguen nuevas funcionalidades
    o se realicen cambios en la infraestructura.
---

# Guía de Despliegue de backend Beevents

## Índice
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Requisitos de Infraestructura](#requisitos-de-infraestructura)
3. [Entorno de Desarrollo y Dependencias](#entorno-de-desarrollo-y-dependencias)
4. [Configuración de Entornos](#configuración-de-entornos)
5. [Pasos para el Despliegue](#pasos-para-el-despliegue)
6. [Servicios Externos y Configuración](#servicios-externos-y-configuración)
7. [Verificación Post-Despliegue](#verificación-post-despliegue)
8. [Reversión y Contingencias](#reversión-y-contingencias)

---

### Descripción del Proyecto

El backend de Beevents, es una API para una plataforma de reserva de tickets para eventos como conciertos, conferencias, y actividades deportivas. El sistema permite la creación y gestión de eventos, y la reserva de entradas por parte de los usuarios registrados. No se incluyen funcionalidades de compra o integración con sistemas de pago. 

- **Versión actual**: en desarrollo.
- **Módulos principales**:
  - Gestión de Usuarios: Registro, modificación y autenticación.
  - Gestión de Eventos: Creación, modificación, eliminación y consulta de eventos.
  - Gestión de Tickets: Reserva, consulta y asignación de tickets.
  - Gestión de Predios: Creación y configuración de sectores para eventos.

---

### Requisitos de Infraestructura

1. **Entorno de despliegue**: Actual en [Render](https://beevents.onrender.com/) (puede ser adaptable a otros servicios en la nube o servidores propios on-premise).
2. **Especificaciones mínimas**:
   - Memoria RAM: 512 MB
   - Procesador: 1000 MHz
   - Acceso a red local o Internet (según sea el caso)
   - Base de datos: MongoDB (local o en MongoDB Atlas)

---

### Entorno de Desarrollo y Dependencias

1. **Stack Tecnológico**:
   - **Backend**: NestJS (TypeScript y Mongoose para MongoDB Atlas)

2. **Dependencias Backend:** 
    - Principales: `@nestjs/common`, `@nestjs/config`, `axios`, `bcrypt`, `cloudinary`, `mongoose`, `passport`, `multer`, etc.
    - Desarrollo: `@nestjs/testing`, `jest`, `typescript`, `eslint`, `prettier`, etc.

3. **Variables de Entorno de Backend:**
    `.env` file
     - `MONGO_DB_NAME`, `MONGO_DB_URL`, `PORT`

---

### Configuración de Entornos

1. **Entornos disponibles**:
   - **Backend**: branch dev

2. **Configuración de variables de entorno**:
   - Cada entorno necesita sus propias variables de configuración en archivos `.env`, detalladas en la sección anterior.

---

### Pasos para el Despliegue
1. **Backend**:
   - Clonar el repositorio:
     ```bash
     git clone https://github.com/DesApp-2024c1-Grupo4/beevents-back.git
     cd backend
     git branch dev
     ```
   - Instalar dependencias:
     ```bash
     yarn install --frozen-lockfile
     ```
   - Crear el archivo `.env` con las variables de entorno correspondientes.
   - Crear el build de producción:
     ```bash
     yarn build
     ```
   - Iniciar la aplicación:
     ```bash
     yarn start
     ```

---

### Servicios Externos y Configuración

1. **Servicios de API**:
   - No se requiere integración con servicios de pago ni notificaciones, solo APIs de acceso gratuito.
   
---

### Verificación Post-Despliegue

1. **Pruebas de Integración**:
   - Verificar la conexión con MongoDB Atlas (o base de datos local).
   - Asegurar el funcionamiento de las APIs en los endpoints esperados.

---

### Reversión y Contingencias

1. **Backup y Rollback**:
   - Antes de cada despliegue, realizar un snapshot del estado de la base de datos o un backup completo.
   - Mantener la última versión estable del código en el repositorio de Git para revertir cambios en caso de errores graves.

---

    **Nota**: La sección siguiente, proporciona un detalle de los endpoints que intervienen en
    la API y su utilización para la plataforma "Beevents" y debe actualizarse conforme se
    agreguen nuevas funcionalidades o se realicen cambios en la infraestructura.
---

# Documentación de Endpoints Activos de la API

## Índice
1. [Autenticación](#autenticación)
2. [Gestión de Eventos](#gestión-de-eventos)
3. [Gestión de Tickets](#gestión-de-tickets)
4. [Gestión de Ubicaciones](#gestión-de-ubicaciones)
---

## Autenticación

### Registro de Usuario
- **URL:** `/user/register`
- **Método:** `POST`
- **Descripción:** Permite registrar un nuevo usuario.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "names": "Nombre del usuario",
    "surname": "Apellido del usuario",
    "email": "correo@dominio.com",
    "password": "contraseña_segura"
  }
  ```

### Inicio de Sesión
- **URL:** `/user/login`
- **Método:** `POST`
- **Descripción:** Inicia sesión y devuelve un token de autenticación.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "email": "correo@dominio.com",
    "password": "contraseña_segura"
  }
  ```

## Gestión de Eventos

### Crear Evento
- **URL:** `/event/create`
- **Método:** `POST`
- **Descripción:** Crea un nuevo evento en el sistema.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "name": "Nombre del evento",
    "description": "Descripción del evento",
    "date": "YYYY-MM-DD",
    "location": "Ubicación del evento",
    "type": "Tipo de evento"
  }
  ```

### Obtener Eventos Cercanos
- **URL:** `/event/nearby`
- **Método:** `GET`
- **Descripción:** Devuelve los tres eventos más cercanos a la ubicación del usuario según coordenadas.
- **Parámetros de Consulta:**
  - `lat` (float) - Latitud del usuario.
  - `lon` (float) - Longitud del usuario.

### Obtener Evento por ID
- **URL:** `/event/:id`
- **Método:** `GET`
- **Descripción:** Obtiene la información de un evento específico por su ID.

### Actualizar Evento
- **URL:** `/event/update/:id`
- **Método:** `PUT`
- **Descripción:** Actualiza los datos de un evento existente.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "name": "Nuevo nombre del evento",
    "description": "Nueva descripción del evento",
    "date": "YYYY-MM-DD",
    "location": "Nueva ubicación",
    "type": "Nuevo tipo de evento"
  }
  ```

### Eliminar Evento
- **URL:** `/event/delete/:id`
- **Método:** `DELETE`
- **Descripción:** Elimina un evento del sistema.

## Gestión de Tickets

### Reservar Ticket
- **URL:** `/ticket/book`
- **Método:** `POST`
- **Descripción:** Permite a un usuario reservar un ticket para un evento específico.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "eventId": "ID del evento",
    "userId": "ID del usuario",
    "seat": "Número de asiento (si aplica)"
  }
  ```

### Cancelar Reserva de Ticket
- **URL:** `/ticket/cancel/:id`
- **Método:** `DELETE`
- **Descripción:** Cancela una reserva de ticket específica por su ID.

### Obtener Tickets de Usuario
- **URL:** `/ticket/user/:userId`
- **Método:** `GET`
- **Descripción:** Obtiene todos los tickets reservados por un usuario específico.

## Gestión de Ubicaciones

### Crear Ubicación
- **URL:** `/location/create`
- **Método:** `POST`
- **Descripción:** Crea una nueva ubicación.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "name": "Nombre de la ubicación",
    "address": "Dirección de la ubicación",
    "capacity": "Capacidad total",
    "sectors": [
      {
        "name": "Nombre del sector",
        "seats": "Cantidad de asientos"
      }
    ]
  }
  ```

### Obtener Ubicación por ID
- **URL:** `/location/:id`
- **Método:** `GET`
- **Descripción:** Obtiene los detalles de una ubicación específica por su ID.

### Actualizar Ubicación
- **URL:** `/location/update/:id`
- **Método:** `PUT`
- **Descripción:** Actualiza la información de una ubicación.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "name": "Nuevo nombre de la ubicación",
    "address": "Nueva dirección",
    "capacity": "Nueva capacidad",
    "sectors": [
      {
        "name": "Nombre del sector",
        "seats": "Cantidad de asientos"
      }
    ]
  }
  ```

### Eliminar Ubicación
- **URL:** `/location/delete/:id`
- **Método:** `DELETE`
- **Descripción:** Elimina una ubicación del sistema.

---

---

    **Nota**: La sección siguiente, proporciona un detalle de los endpoints inactivos que
    no intervienen en la API y surgieron como prueba de concepto para futuras funcionalidades
    o funcionalidades que fueron descartadas en esta etapa de desarrollo.
    Quedan aquí documentadas para una futura posible continuidad por otro equipo desarrollador.
---
# Documentación de Endpoints Inactivos de la API

## Índice
1. [Prueba de Gestión de Imágenes](#prueba-de-gestión-de-imágenes)
2. [Prueba de Gestión de Tickets](#prueba-de-gestión-de-tickets)
3. [Prueba de Gestión de Usuarios](#prueba-de-gestión-de-usuarios)
---

## Prueba de Gestión de Imágenes

### Subir Imagen
- **URL:** `/images/upload`
- **Método:** `POST`
- **Descripción:** Sube una imagen a Cloudinary.
- **Cuerpo de la Solicitud (Multipart):**
  - `file`: Archivo de imagen a subir.

### Obtener Todas las Imágenes
- **URL:** `/images`
- **Método:** `GET`
- **Descripción:** Obtiene todas las imágenes almacenadas en Cloudinary.


## Prueba de Gestión de Tickets

### Obtener Todos los Tickets
- **URL:** `/ticket`
- **Método:** `GET`
- **Descripción:** Devuelve una lista de todos los tickets disponibles.

### Obtener Ticket por ID
- **URL:** `/ticket/:id`
- **Método:** `GET`
- **Descripción:** Obtiene los detalles de un ticket específico por su ID.

### Filtrar Tickets Numerados Vendidos
- **URL:** `/ticket/numberedSold/:id`
- **Método:** `GET`
- **Descripción:** Devuelve los tickets numerados vendidos para un evento específico.

### Filtrar Tickets No Numerados Vendidos
- **URL:** `/ticket/notNumberedSold/:id`
- **Método:** `GET`
- **Descripción:** Devuelve los tickets no numerados vendidos para un evento específico.

### Obtener Último Ticket Numerado Vendido
- **URL:** `/ticket/lastFilteredNumbered/:id`
- **Método:** `GET`
- **Descripción:** Obtiene el último ticket numerado vendido para un evento específico.

### Obtener Último Ticket Vendido
- **URL:** `/ticket/lastSold/:eventId/:date/:place`
- **Método:** `GET`
- **Descripción:** Obtiene el último ticket vendido para un evento en una fecha y lugar específicos.

### Cantidad de Tickets Vendidos
- **URL:** `/ticket/quantitySold/:eventId/:date/:place`
- **Método:** `GET`
- **Descripción:** Retorna la cantidad de tickets vendidos para un evento en una fecha y lugar específicos.

### Cantidad de Tickets No Numerados Vendidos
- **URL:** `/ticket/quantityNotNumberedSold/:eventId/:date/:place`
- **Método:** `GET`
- **Descripción:** Retorna la cantidad de tickets no numerados vendidos para un evento en una fecha y lugar específicos.

### Crear Ticket
- **URL:** `/ticket`
- **Método:** `POST`
- **Descripción:** Crea un nuevo ticket.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "eventId": "ID del evento",
    "userId": "ID del usuario",
    "seat": "Número de asiento (si aplica)"
  }
  ```

### Actualizar Ticket Parcialmente
- **URL:** `/ticket/:id`
- **Método:** `PATCH`
- **Descripción:** Realiza una actualización parcial de un ticket existente.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "campo": "valor a actualizar"
  }
  ```

### Actualización Completa de Ticket
- **URL:** `/ticket/:id`
- **Método:** `PUT`
- **Descripción:** Realiza una actualización completa de un ticket existente.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "campo": "valor a actualizar"
  }
  ```

### Eliminar Ticket
- **URL:** `/ticket/:id`
- **Método:** `DELETE`
- **Descripción:** Elimina un ticket específico por su ID.


## Prueba de Gestión de Usuarios

### Restablecimiento de Contraseña
- **URL:** `/user/forgot-password`
- **Método:** `POST`
- **Descripción:** Envía un enlace de restablecimiento de contraseña al correo proporcionado.
- **Cuerpo de la Solicitud:**
  ```json
  {
    "email": "correo@dominio.com"
  }
  ```
