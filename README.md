# Sistema de Inscripciones para Gimnasio - Backend

## 1. Descripción del proyecto

Este repositorio contiene el backend del Sistema de Inscripciones para Gimnasio desarrollado para SUPERINKA.

El backend permite gestionar la lógica del sistema, autenticación de usuarios, control de roles, alumnos, clases, horarios, instructores, inscripciones, dashboard y reportes. La API se comunica con una base de datos MySQL y utiliza JWT para proteger las rutas privadas.

El sistema fue diseñado para centralizar la administración de una escuela de gimnasia, permitiendo controlar las inscripciones de alumnos a clases y horarios disponibles.

---

## 2. Tecnologías utilizadas

- Node.js
- Express
- MySQL
- mysql2
- JWT
- bcryptjs
- CORS
- dotenv
- JavaScript
- Render para despliegue del backend
- Railway MySQL para base de datos en la nube

---

## 3. Requisitos previos

Antes de ejecutar el backend, se debe tener instalado:

- Node.js
- npm
- MySQL
- MySQL Workbench opcional
- Base de datos `gym` creada
- Archivo `.env` configurado

---

## 4. Instalación local

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO_BACKEND
```

Ingresar a la carpeta del proyecto:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

---

## 5. Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia el archivo `.env.example`.

Ejemplo para entorno local:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=gym

JWT_SECRET=clave_secreta_segura
```

Ejemplo para entorno de producción usando Railway MySQL:

```env
PORT=3000

DB_HOST=HOST_DE_RAILWAY
DB_PORT=PUERTO_DE_RAILWAY
DB_USER=USUARIO_DE_RAILWAY
DB_PASSWORD=PASSWORD_DE_RAILWAY
DB_NAME=DATABASE_DE_RAILWAY

JWT_SECRET=clave_secreta_segura
```

---

## 6. Ejecución en desarrollo

Para iniciar el backend en modo desarrollo:

```bash
npm run dev
```

También puede ejecutarse con:

```bash
node src/server.js
```

La API quedará disponible en:

```txt
http://localhost:3000
```

---

## 7. Verificación del backend

Para verificar que la API está activa:

```txt
GET http://localhost:3000/health
```

Este endpoint permite confirmar que el servidor backend se encuentra funcionando correctamente.

Para verificar conexión con MySQL:

```txt
GET http://localhost:3000/test-db
```

Este endpoint permite confirmar que el backend puede conectarse correctamente a la base de datos MySQL.

---

## 8. Estructura principal del proyecto

```txt
src/
├── server.js
├── db.js
├── hash-one.js
├── middleware/
│   ├── auth.js
│   ├── authorize.js
│   └── onlyAdmin.js
├── routes/
│   ├── auth.routes.js
│   ├── students.routes.js
│   ├── classes.routes.js
│   ├── schedules.routes.js
│   ├── instructors.routes.js
│   ├── enrollments.routes.js
│   ├── dashboard.routes.js
│   └── reports.routes.js
└── controllers/
    ├── enrollments.controller.js
    └── dashboard.controller.js
```

---

## 9. Base de datos

El sistema utiliza una base de datos MySQL llamada:

```txt
gym
```

Tablas principales:

| Tabla | Descripción |
|---|---|
| admins | Almacena los usuarios internos del sistema, como administradores e instructores. |
| students | Almacena la información de los alumnos registrados. |
| classes | Almacena las clases de gimnasia disponibles. |
| schedules | Almacena los horarios asociados a clases e instructores. |
| enrollments | Almacena las inscripciones de alumnos a horarios específicos. |

---

## 10. Roles del sistema

| Rol | Descripción |
|---|---|
| ADMIN | Usuario con acceso completo al sistema. Puede gestionar alumnos, clases, horarios, instructores, inscripciones, dashboard y reportes. |
| INSTRUCTOR | Usuario con acceso limitado a módulos operativos permitidos. |

---

## 11. Endpoints principales

La URL base en entorno local es:

```txt
http://localhost:3000
```

---

### Endpoints generales

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/health` | Verifica que la API esté activa y respondiendo correctamente. |
| GET | `/test-db` | Verifica que el backend pueda conectarse correctamente a la base de datos MySQL. |
| GET | `/me` | Devuelve la información del usuario autenticado a partir del token JWT enviado en la petición. |
| GET | `/api/me` | Devuelve la información del usuario autenticado desde una ruta bajo el prefijo `/api`. |

---

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Permite iniciar sesión con correo y contraseña. Si las credenciales son correctas, devuelve un token JWT y los datos básicos del usuario. |
| GET | `/api/auth/instructors` | Lista los usuarios con rol INSTRUCTOR. Este endpoint debe ser utilizado por un usuario ADMIN autenticado. |

---

### Alumnos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/students` | Lista todos los alumnos registrados en el sistema. |
| POST | `/api/students` | Registra un nuevo alumno con sus datos básicos. |
| PUT | `/api/students/:id` | Actualiza la información de un alumno existente según su identificador. |
| DELETE | `/api/students/:id` | Elimina un alumno registrado en el sistema según su identificador. |

---

### Clases

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/classes` | Lista todas las clases de gimnasia registradas en el sistema. |
| POST | `/api/classes` | Crea una nueva clase indicando nombre, descripción, nivel y capacidad. |
| PUT | `/api/classes/:id` | Actualiza los datos de una clase existente según su identificador. |
| DELETE | `/api/classes/:id` | Elimina una clase registrada en el sistema según su identificador. |

---

### Horarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/schedules` | Lista los horarios de clases registrados en el sistema. |
| POST | `/api/schedules` | Crea un nuevo horario asociando una clase, un instructor, un día, una hora de inicio, una hora de fin y una sala. |
| PUT | `/api/schedules/:id` | Actualiza la información de un horario existente según su identificador. |
| DELETE | `/api/schedules/:id` | Elimina un horario registrado en el sistema según su identificador. |

---

### Instructores

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/instructors` | Lista todos los usuarios registrados con rol INSTRUCTOR. |
| POST | `/api/instructors` | Crea un nuevo usuario instructor con correo y contraseña. |
| PUT | `/api/instructors/:id` | Actualiza los datos de un instructor, como correo o contraseña. |
| DELETE | `/api/instructors/:id` | Elimina un usuario instructor según su identificador. |

---

### Inscripciones

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/enrollments/available` | Lista los horarios que todavía tienen cupos disponibles para realizar inscripciones. |
| GET | `/api/enrollments` | Lista las inscripciones registradas en el sistema, incluyendo información del alumno, clase, instructor y horario. |
| POST | `/api/enrollments` | Registra la inscripción de un alumno en un horario disponible. |
| PUT | `/api/enrollments/:id` | Cambia una inscripción existente hacia otro horario disponible. |
| DELETE | `/api/enrollments/:id` | Cancela una inscripción registrada según su identificador. |

---

### Dashboard

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/dashboard/stats` | Devuelve indicadores generales del sistema, como total de alumnos, clases, horarios, inscripciones, capacidad total y cupos disponibles. |
| GET | `/api/dashboard/top-classes` | Devuelve las clases con mayor cantidad de alumnos inscritos. |
| GET | `/api/dashboard/top-schedules` | Devuelve los horarios con mayor ocupación de alumnos inscritos. |

---

### Reportes

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/reports/enrollments-by-class` | Genera un reporte agrupado por clase, mostrando la cantidad total de alumnos inscritos por cada clase. |
| GET | `/api/reports/enrollments-by-student` | Genera un reporte agrupado por alumno, mostrando la cantidad total de inscripciones registradas por cada alumno. |

---

## 12. Seguridad

El backend implementa:

- Autenticación con JWT.
- Contraseñas cifradas con bcryptjs.
- Middleware para validar token.
- Middleware para validar roles.
- Restricción de endpoints según tipo de usuario.
- Variables sensibles fuera del repositorio.

La mayoría de endpoints del sistema requieren autenticación mediante token JWT.

El token se obtiene al iniciar sesión en:

```txt
POST /api/auth/login
```

Luego debe enviarse en las peticiones protegidas usando el header:

```txt
Authorization: Bearer TOKEN_GENERADO
```

---

## 13. Relación con el frontend

El frontend consume esta API mediante la URL configurada en su archivo `.env`:

```env
VITE_API_URL=http://localhost:3000
```

En producción, esta variable debe apuntar a la URL pública del backend desplegado en Render:

```env
VITE_API_URL=https://URL_DEL_BACKEND_EN_RENDER
```

Para que el sistema funcione correctamente, el backend debe estar ejecutándose y conectado a la base de datos.

---

## 14. Backup y restauración de base de datos

Para generar un backup completo de la base de datos local:

```bash
mysqldump -u root -p gym > gym_backup_completo.sql
```

Para restaurar la base de datos:

```bash
mysql -u root -p gym < gym_backup_completo.sql
```

El backup generado puede utilizarse para restaurar la base de datos en otro entorno MySQL, incluyendo Railway MySQL.

---

## 15. Despliegue en Render

Para desplegar el backend en producción se utiliza Render.

Pasos generales:

1. Subir el repositorio actualizado a GitHub.
2. Ingresar a Render.
3. Crear un nuevo Web Service.
4. Conectar el repositorio del backend.
5. Configurar el comando de instalación:

```bash
npm install
```

6. Configurar el comando de inicio. Según la configuración del proyecto, puede ser:

```bash
npm start
```

o:

```bash
node src/server.js
```

7. Agregar las variables de entorno necesarias:

```env
PORT=3000
DB_HOST=HOST_DE_RAILWAY
DB_PORT=PUERTO_DE_RAILWAY
DB_USER=USUARIO_DE_RAILWAY
DB_PASSWORD=PASSWORD_DE_RAILWAY
DB_NAME=DATABASE_DE_RAILWAY
JWT_SECRET=clave_secreta_segura
```

8. Ejecutar el despliegue.
9. Verificar los endpoints `/health` y `/test-db`.

---

## 16. Base de datos en Railway

Para producción, la base de datos puede configurarse en Railway usando MySQL.

Pasos generales:

1. Crear un proyecto en Railway.
2. Agregar una base de datos MySQL.
3. Obtener las variables de conexión.
4. Importar el backup `gym_backup_completo.sql` usando MySQL Workbench o terminal.
5. Configurar esas variables en Render para que el backend se conecte a Railway MySQL.

Variables principales:

```env
DB_HOST=HOST_DE_RAILWAY
DB_PORT=PUERTO_DE_RAILWAY
DB_USER=USUARIO_DE_RAILWAY
DB_PASSWORD=PASSWORD_DE_RAILWAY
DB_NAME=DATABASE_DE_RAILWAY
```

---

## 17. Archivos importantes

| Archivo | Descripción |
|---|---|
| README.md | Documentación principal del backend. |
| .env.example | Ejemplo de variables de entorno. |
| .gitignore | Archivos y carpetas excluidas del repositorio. |
| package.json | Dependencias y scripts del proyecto. |
| src/server.js | Archivo principal del servidor. |
| src/db.js | Configuración de conexión a MySQL. |
| src/middleware/auth.js | Middleware de autenticación mediante JWT. |
| src/middleware/authorize.js | Middleware de autorización por roles. |

---

## 18. Archivo .env.example

El repositorio incluye un archivo `.env.example` como referencia para configurar el proyecto.

Contenido sugerido:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=colocar_password_mysql
DB_NAME=gym

JWT_SECRET=colocar_clave_secreta_segura
```

En producción, los valores de conexión deben reemplazarse por los datos proporcionados por Railway MySQL.

---

## 19. Archivos excluidos del repositorio

El archivo `.gitignore` debe evitar subir archivos sensibles o innecesarios, como:

```gitignore
node_modules
.env
dist
build
.DS_Store
npm-debug.log
```

El archivo `.env` real no debe subirse al repositorio porque puede contener credenciales o claves privadas.

---

## 20. Estado del proyecto

El backend se encuentra actualizado con la última versión estable del Sistema de Inscripciones para Gimnasio desarrollado para SUPERINKA.

La rama principal del repositorio es `main` y contiene la versión preparada para entrega final.