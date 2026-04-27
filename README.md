# Sistema de Inscripciones para Gimnasio - Backend

## 1. Descripción del proyecto

Este repositorio contiene el backend del Sistema de Inscripciones para Gimnasio desarrollado para SUPERINKA.

El backend permite gestionar la lógica del sistema, autenticación de usuarios, control de roles, alumnos, clases, horarios, instructores, inscripciones, dashboard y reportes. La API se comunica con una base de datos MySQL y utiliza JWT para proteger las rutas privadas.

## 2. Tecnologías utilizadas

- Node.js
- Express
- MySQL
- JWT
- bcryptjs
- CORS
- dotenv
- JavaScript

## 3. Requisitos previos

Antes de ejecutar el backend, se debe tener instalado:

- Node.js
- npm
- MySQL
- MySQL Workbench opcional
- Base de datos `gym` creada
- Archivo `.env` configurado


## Endpoints principales del backend

La API del backend expone endpoints para autenticación, gestión de alumnos, clases, horarios, instructores, inscripciones, dashboard y reportes.  

Endpoints generales
| Método | Endpoint   | Descripción                                                                                    |
| ------ | ---------- | ---------------------------------------------------------------------------------------------- |
| GET    | `/health`  | Verifica que la API esté activa y respondiendo correctamente.                                  |
| GET    | `/test-db` | Verifica que el backend pueda conectarse correctamente a la base de datos MySQL.               |
| GET    | `/me`      | Devuelve la información del usuario autenticado a partir del token JWT enviado en la petición. |



Autenticación
| Método | Endpoint                | Descripción                                                                                                                               |
| ------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/login`       | Permite iniciar sesión con correo y contraseña; si las credenciales son correctas, devuelve un token JWT y los datos básicos del usuario. |
| GET    | `/api/auth/instructors` | Lista los usuarios con rol INSTRUCTOR; solo puede ser utilizado por un usuario ADMIN autenticado.                                         |


Alumnos
| Método | Endpoint            | Descripción                                                                             |
| ------ | ------------------- | --------------------------------------------------------------------------------------- |
| GET    | `/api/students`     | Lista todos los alumnos registrados en el sistema.                                      |
| POST   | `/api/students`     | Registra un nuevo alumno con sus datos básicos como nombres, apellidos, DNI y teléfono. |
| PUT    | `/api/students/:id` | Actualiza la información de un alumno existente según su identificador.                 |
| DELETE | `/api/students/:id` | Elimina un alumno registrado en el sistema según su identificador.                      |



Clases

| Método | Endpoint           | Descripción                                                            |
| ------ | ------------------ | ---------------------------------------------------------------------- |
| GET    | `/api/classes`     | Lista todas las clases de gimnasia registradas en el sistema.          |
| POST   | `/api/classes`     | Crea una nueva clase indicando nombre, descripción, nivel y capacidad. |
| PUT    | `/api/classes/:id` | Actualiza los datos de una clase existente según su identificador.     |
| DELETE | `/api/classes/:id` | Elimina una clase registrada en el sistema según su identificador.     |



Horarios

| Método | Endpoint             | Descripción                                                                                                       |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/schedules`     | Lista los horarios de clases registrados; si el usuario es INSTRUCTOR, puede mostrar solo sus horarios asignados. |
| POST   | `/api/schedules`     | Crea un nuevo horario asociando una clase, un instructor, un día, una hora de inicio, una hora de fin y una sala. |
| PUT    | `/api/schedules/:id` | Actualiza la información de un horario existente según su identificador.                                          |
| DELETE | `/api/schedules/:id` | Elimina un horario registrado en el sistema según su identificador.                                               |



Instructores
| Método | Endpoint               | Descripción                                                     |
| ------ | ---------------------- | --------------------------------------------------------------- |
| GET    | `/api/instructors`     | Lista todos los usuarios registrados con rol INSTRUCTOR.        |
| POST   | `/api/instructors`     | Crea un nuevo usuario instructor con correo y contraseña.       |
| PUT    | `/api/instructors/:id` | Actualiza los datos de un instructor, como correo o contraseña. |
| DELETE | `/api/instructors/:id` | Elimina un usuario instructor según su identificador.           |



Inscripciones
| Método | Endpoint                     | Descripción                                                                                                        |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| GET    | `/api/enrollments/available` | Lista los horarios que todavía tienen cupos disponibles para realizar inscripciones.                               |
| GET    | `/api/enrollments`           | Lista las inscripciones registradas en el sistema, incluyendo información del alumno, clase, instructor y horario. |
| POST   | `/api/enrollments`           | Registra la inscripción de un alumno en un horario disponible.                                                     |
| PUT    | `/api/enrollments/:id`       | Cambia una inscripción existente hacia otro horario disponible.                                                    |
| DELETE | `/api/enrollments/:id`       | Cancela una inscripción registrada según su identificador.                                                         |


Dashboard
| Método | Endpoint                       | Descripción                                                                                                                              |
| ------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/dashboard/stats`         | Devuelve indicadores generales del sistema, como total de alumnos, clases, horarios, inscripciones, capacidad total y cupos disponibles. |
| GET    | `/api/dashboard/top-classes`   | Devuelve las clases con mayor cantidad de alumnos inscritos.                                                                             |
| GET    | `/api/dashboard/top-schedules` | Devuelve los horarios con mayor ocupación de alumnos inscritos.                                                                          |


Reportes
| Método | Endpoint                              | Descripción                                                                                                      |
| ------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/reports/enrollments-by-class`   | Genera un reporte agrupado por clase, mostrando la cantidad total de alumnos inscritos por cada clase.           |
| GET    | `/api/reports/enrollments-by-student` | Genera un reporte agrupado por alumno, mostrando la cantidad total de inscripciones registradas por cada alumno. |



## 4. Instalación local

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO_BACKEND