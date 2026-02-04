# NixTrack - Frontend

Sistema de seguimiento vehicular en tiempo real con gestión integral de escoltas, clientes y órdenes.

## 🚀 Tecnologías

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Redux Toolkit** (State management con extraReducers)
- **Ant Design 5.x** (UI Components)
- **React Router v6** (Routing)
- **Axios** (HTTP Client)
- **Google Maps API** (Mapas y geolocalización)

## 📦 Instalación

```bash
npm install
```

## 🔧 Configuración

1. Copia el archivo `.env.example` a `.env`
2. Configura las variables de entorno:
   - `VITE_API_BASE_URL`: URL del backend API
   - `VITE_GOOGLE_MAPS_API_KEY`: API Key de Google Maps (opcional)

## 🏃‍♂️ Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
src/
├── api/                # Servicios y configuración de Axios
├── assets/            # Recursos estáticos (CSS, imágenes)
├── components/        # Componentes reutilizables
│   ├── common/       # Componentes genéricos
│   └── layout/       # Layout principal (Sidebar, Header)
├── contexts/         # React Contexts (Theme)
├── features/         # Redux slices por módulo
│   ├── auth/        # Autenticación
│   ├── users/       # Gestión de usuarios
│   ├── clients/     # Gestión de clientes
│   ├── vehicles/    # Gestión de vehículos
│   ├── agents/      # Gestión de escoltas
│   ├── orders/      # Gestión de seguimientos
│   └── dashboard/   # Dashboard
├── pages/            # Páginas de la aplicación
├── routes/           # Configuración de rutas
├── store/            # Configuración de Redux store
├── types/            # Definiciones de TypeScript
├── utils/            # Funciones utilitarias
└── config/           # Configuración de entorno
```

## 🔐 Roles y Permisos

- **Administrador**: Acceso completo al sistema
- **Supervisor**: Gestión de seguimientos y visualización
- **Operador**: Creación y seguimiento de órdenes

## 📚 Módulos Implementados

✅ Autenticación (Login, Registro, Recuperación)
✅ Dashboard (Órdenes activas, mapa en tiempo real)
✅ Gestión de Usuarios
✅ Gestión de Clientes
✅ Gestión de Vehículos
✅ Gestión de Escoltas
✅ Gestión de Seguimientos
✅ Detalle de Seguimiento (Timeline, documentos, mapa)
✅ Integración con Google Maps
✅ Tema Oscuro/Claro
✅ Exportación a Excel

## 🎨 Tema

El sistema incluye soporte para tema oscuro/claro utilizando Ant Design Theme.

## 📝 Notas

- Todos los módulos utilizan Redux Toolkit con `extraReducers` para manejo de estado asíncrono
- Las rutas están protegidas según roles de usuario
- El sistema incluye manejo global de errores y notificaciones
- Diseño responsive optimizado para desktop y móvil
