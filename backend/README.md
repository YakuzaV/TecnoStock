# TecnoStock – Backend

## 1. Descripción

El backend de TecnoStock corresponde a la capa de lógica de negocio de la aplicación web para la gestión de inventario y análisis de rentabilidad en productos tecnológicos.

Fue desarrollado con Node.js y Express, utilizando PostgreSQL como sistema gestor de base de datos.

Su función principal es procesar las solicitudes realizadas desde el frontend, ejecutar las operaciones correspondientes y gestionar la consulta y persistencia de la información.

## 2. Tecnologías utilizadas

- Node.js: entorno de ejecución de JavaScript.
- Express 5.3.0: framework para la construcción de servicios y rutas HTTP.
- PostgreSQL: sistema gestor de base de datos.
- pg 8.23.1: biblioteca para la conexión con PostgreSQL.
- dotenv 18.0.10: gestión de variables de entorno.
- CORS 2.8.6: configuración de solicitudes entre diferentes orígenes.

## 3. Estructura del backend

```text
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── movimientos.js
│   │   ├── operaciones.js
│   │   ├── productos.js
│   │   └── rentabilidad.js
│   └── server.js
├── package.json
└── package-lock.json
```

## 4. Funcionalidades de los servicios

El backend organiza sus operaciones mediante rutas:

- Productos: gestión y consulta de la información del catálogo.
- Movimientos: registro y consulta de entradas y salidas del inventario.
- Operaciones: gestión de compras y ventas.
- Rentabilidad: consulta de información económica para el análisis de los productos.

La conexión con PostgreSQL se centraliza mediante el módulo de configuración de base de datos.

## 5. Requisitos previos

Para ejecutar el backend se requiere:

- Node.js instalado.
- npm.
- PostgreSQL instalado y en ejecución.
- Base de datos de TecnoStock creada y configurada.

## 6. Instalación

Desde una terminal, ubicarse en la carpeta `backend`:

```bash
cd backend
npm install
```

## 7. Configuración de variables de entorno

El proyecto utiliza dotenv para cargar la configuración del entorno.

Se debe crear un archivo `.env` en la carpeta `backend`, con los parámetros de conexión a PostgreSQL que utiliza el módulo `src/config/database.js`.

Las credenciales deben mantenerse de forma local y no deben publicarse en GitHub.

## 8. Ejecución del servidor

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Para iniciar el servidor mediante el comando de ejecución normal:

```bash
npm start
```

La dirección y el puerto de acceso dependen de la configuración establecida en el servidor.

## 9. Base de datos

TecnoStock utiliza PostgreSQL para almacenar la información de los productos y las operaciones comerciales.

El proyecto incluye scripts SQL en la carpeta `database` de la raíz del repositorio, destinados a complementar la estructura de datos necesaria para las operaciones de compras y ventas.

## 10. Integración con el frontend

El backend proporciona los servicios utilizados por la interfaz desarrollada en React y TypeScript.

La comunicación permite consultar y registrar información relacionada con los productos, movimientos de inventario, compras, ventas y rentabilidad.

## 11. Proyecto académico

Este componente forma parte del proyecto aplicado TecnoStock, desarrollado en el programa de Ingeniería de Sistemas de la Universidad Nacional Abierta y a Distancia (UNAD).