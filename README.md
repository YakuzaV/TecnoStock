# TecnoStock
### Sistema web para la gestión de inventario y análisis de rentabilidad en productos tecnológicos

[![Proyecto](https://img.shields.io/badge/Proyecto-Aplicado-blue)]()
[![Universidad](https://img.shields.io/badge/UNAD-Ingeniería%20de%20Sistemas-green)]()
[![Estado](https://img.shields.io/badge/Estado-Prototipo%20funcional-orange)]()

---

## 1. Información institucional

**Universidad:** Universidad Nacional Abierta y a Distancia – UNAD  
**Escuela:** Escuela de Ciencias Básicas, Tecnología e Ingeniería (ECBTI)  
**Programa académico:** Ingeniería de Sistemas  
**Curso:** Proyecto de grado  
**Código del curso:** 202016907  
**Estudiante:** Jesús David Castillo Avirama  
**Centro:** UDR Cali  
**Zona:** Centro Sur (ZCSUR)  
**Proyecto:** Sistema web para la gestión de inventario y análisis de rentabilidad en productos tecnológicos.  
**Fase:** Fase 4 – Desarrollo de la propuesta del proyecto.  
**Año:** 2026

---

## 2. Descripción del proyecto

TecnoStock es un sistema web desarrollado como proyecto aplicado del programa de Ingeniería de Sistemas de la Universidad Nacional Abierta y a Distancia (UNAD).

Su propósito es facilitar la gestión de inventario y el análisis de rentabilidad de productos tecnológicos, integrando información de productos, existencias, compras, ventas y costos en una misma solución.

El proyecto está orientado a pequeños comercializadores de productos tecnológicos que necesitan mejorar el control de sus inventarios, consultar información económica de sus productos y disponer de indicadores que apoyen la toma de decisiones.

La aplicación busca reducir la dispersión de información y facilitar el seguimiento de las operaciones comerciales mediante una interfaz web y una estructura de datos centralizada.

## 3. Objetivo general

Desarrollar un sistema web para la gestión de inventario y análisis de rentabilidad de productos tecnológicos que facilite el control de costos, existencias y la toma de decisiones de pequeños comercializadores en Cali, Valle del Cauca.

## 4. Objetivos específicos

- Analizar las necesidades de gestión de inventario, costos y rentabilidad de pequeños comercializadores de productos tecnológicos.
- Definir los requisitos funcionales y no funcionales del sistema.
- Diseñar la arquitectura de software, el modelo de datos y las interfaces de usuario.
- Desarrollar los módulos de gestión de productos, inventario, compras, ventas y análisis de rentabilidad.
- Establecer y ejecutar pruebas funcionales que permitan verificar el comportamiento del prototipo.

## 5. Funcionalidades del sistema

TecnoStock integra los siguientes módulos:

| Módulo | Descripción |
|---|---|
| Dashboard | Presentación general de indicadores e información del sistema. |
| Productos | Registro, consulta y administración del catálogo de productos tecnológicos. |
| Inventario | Consulta y control de existencias y movimientos. |
| Compras | Registro y seguimiento de operaciones de adquisición de productos. |
| Ventas | Registro de ventas y actualización de existencias. |
| Rentabilidad | Consulta de costos, utilidad y márgenes por producto. |
| Reportes | Consulta y presentación de información consolidada para apoyar decisiones. |

Las funcionalidades disponibles corresponden al alcance implementado en el prototipo.

## 6. Tecnologías utilizadas

**Frontend**
- React.
- TypeScript.
- HTML5.
- CSS.

**Backend**
- Node.js.
- Express.

**Base de datos**
- PostgreSQL.

**Herramientas de desarrollo**
- Visual Studio Code.
- Git.
- GitHub.
- npm.

## 7. Arquitectura general

El sistema utiliza una arquitectura de tres capas:

1. **Capa de presentación:** interfaz web desarrollada con React y TypeScript.
2. **Capa lógica:** servicios y API desarrollados con Node.js y Express, encargados de procesar las operaciones y reglas del sistema.
3. **Capa de datos:** PostgreSQL, responsable del almacenamiento y consulta de la información.

La comunicación entre el frontend y el backend se realiza mediante servicios y solicitudes HTTP a la API.

## 8. Metodología de desarrollo

El proyecto se estructura tomando como referencia el enfoque CDIO (Concebir, Diseñar, Implementar y Operar), articulado con una adaptación de Scrum para el desarrollo individual.

El trabajo se organiza en incrementos funcionales que permiten avanzar desde la identificación de necesidades y definición de requisitos hasta la implementación, integración, pruebas y documentación del prototipo.

Las actividades de desarrollo se orientan a mantener la trazabilidad entre las necesidades identificadas, los requisitos del sistema y las funcionalidades implementadas.

## 9. Estructura del proyecto

La estructura general del repositorio se organiza de acuerdo con los componentes de la aplicación:

```text
TecnoStock/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── ...
│   ├── package.json
│   └── ...
│
├── docs/
│
├── evidencias/
│
├── .gitignore
└── README.md
```

*Nota: la estructura anterior es una referencia organizativa. Los nombres y carpetas deberán corresponder a los archivos realmente incluidos en el repositorio.*

## 10. Requisitos para instalación

Para ejecutar el proyecto en un entorno local se requiere:

- Node.js y npm.
- PostgreSQL.
- Git.
- Un navegador web actualizado.
- Visual Studio Code u otro editor de código.

## 11. Instalación y ejecución

### 11.1. Obtener el proyecto

Clonar el repositorio:

```bash
git clone https://github.com/YakuzaV/TecnoStock.git
cd TecnoStock
```

### 11.2. Configurar el backend

Abrir una terminal:

```bash
cd backend
npm install
```

Configurar las variables de entorno de conexión a PostgreSQL en el archivo `.env`, de acuerdo con la configuración del proyecto.

Iniciar el servidor:

```bash
npm run dev
```

### 11.3. Configurar el frontend

Abrir una segunda terminal desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador la dirección local que indique Vite o el servidor de desarrollo configurado.

### 11.4. Base de datos

Crear la base de datos PostgreSQL y ejecutar los scripts SQL correspondientes al esquema del proyecto, cuando estén disponibles.

La conexión debe configurarse con las credenciales locales del entorno. Los archivos `.env` no deben publicarse en el repositorio.

*Importante: los comandos de ejecución dependen de los scripts definidos en los archivos `package.json` del backend y frontend.*

## 12. Pruebas funcionales

El prototipo contempla verificaciones relacionadas con:

- Registro y consulta de productos.
- Actualización de existencias.
- Registro de movimientos de inventario.
- Registro de compras y ventas.
- Validación de cantidades disponibles.
- Consulta de indicadores de rentabilidad.
- Generación y consulta de reportes.

Los resultados de las pruebas ejecutadas y las evidencias correspondientes se documentan en el informe final del proyecto.

## 13. Evidencias y documentación académica

Este repositorio corresponde al desarrollo tecnológico del proyecto aplicado.

La documentación académica complementaria, las capturas del funcionamiento, los resultados de las pruebas y el video demostrativo de Fase 4 se incorporarán como anexos o recursos documentales de la entrega final.

## 14. Repositorio

**GitHub:**  
https://github.com/YakuzaV/TecnoStock

## 15. Autor

**Jesús David Castillo Avirama**  
Estudiante de Ingeniería de Sistemas  
Universidad Nacional Abierta y a Distancia – UNAD  
Escuela de Ciencias Básicas, Tecnología e Ingeniería (ECBTI)  
UDR Cali – Zona Centro Sur

---

## 16. Licencia

Este proyecto se desarrolla con fines académicos en el marco del curso Proyecto de grado de la UNAD.

La incorporación de una licencia de distribución o reutilización deberá realizarse de acuerdo con la decisión del autor y las condiciones de uso de las dependencias y recursos utilizados.
