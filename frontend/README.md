# TecnoStock – Frontend

## Descripción

El frontend de TecnoStock corresponde a la capa de presentación de la aplicación web para la gestión de inventario y análisis de rentabilidad en productos tecnológicos.

Fue desarrollado con React y TypeScript, utilizando Vite como herramienta de desarrollo y construcción del proyecto.

Su propósito es proporcionar una interfaz de usuario organizada por módulos para consultar y gestionar la información comercial del sistema.

## Tecnologías utilizadas

- React 19.3.1
- React DOM 19.3.1
- TypeScript 7.0.2
- Vite 8.3.6
- Lucide React 1.72.0
- ESLint 9.0.0

## Estructura del frontend

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── rentabilidad/
│   ├── services/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── package-lock.json
└── vite.config.ts
```

## Módulos de la aplicación

La interfaz integra las siguientes funcionalidades:

- Dashboard: consulta general de indicadores e información del inventario.
- Productos: administración del catálogo de productos tecnológicos.
- Inventario: consulta y control de existencias y movimientos.
- Compras: registro de adquisiciones de productos.
- Ventas: registro de operaciones comerciales.
- Rentabilidad: consulta de ingresos, costos, utilidad y márgenes.
- Reportes: consulta y exportación de información en formato CSV.

## Requisitos previos

- Node.js compatible con la versión de Vite utilizada.
- npm.
- Backend de TecnoStock configurado y en ejecución para utilizar las funcionalidades que requieren conexión con la API.

## Instalación

Desde una terminal, ubicarse en la carpeta `frontend` y ejecutar:

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

Vite iniciará el servidor de desarrollo y mostrará en la terminal la dirección local para acceder a la aplicación.

## Construcción del proyecto

Para generar la versión de producción:

```bash
npm run build
```

## Vista previa de producción

```bash
npm run preview
```

## Verificación del código

Para ejecutar las reglas de análisis estático configuradas:

```bash
npm run lint
```

## Integración con el backend

El frontend consume los servicios de la API de TecnoStock para realizar consultas y operaciones relacionadas con los productos, movimientos de inventario, compras, ventas y rentabilidad.

La disponibilidad de estas funcionalidades depende de la configuración y ejecución del backend y de la conexión con la base de datos PostgreSQL.

## Proyecto académico

Este componente forma parte del proyecto aplicado TecnoStock, desarrollado en el programa de Ingeniería de Sistemas de la Universidad Nacional Abierta y a Distancia (UNAD).