# Unidades Chile — Sitio web y panel admin

Sitio de **Unidades Chile Automotriz** ([www.unidadeschile.cl](https://www.unidadeschile.cl)): catálogo de vehículos,
ficha de producto, financiamiento, consignación y un panel de administración con fotos y CRM.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Vite · React 19 · TypeScript · React Router 7 · lucide-react |
| Catálogo | Supabase (tabla de catálogo multi-tenant, tenant `unidades-chile`) con respaldo local en `src/data/cars.ts` |
| API | Funciones serverless de Vercel en `/api` (Node.js) |
| Fotos | Vercel Blob (subida desde el panel) + portadas desde Google Drive |
| Email | Resend (formulario de consignación) |
| Hosting | Vercel (SPA con rewrites, headers de seguridad y CSP en `vercel.json`) |

## Funcionalidades

**Sitio público**
- Home, catálogo con filtros (`/catalogo`) y ficha (`/catalogo/:id`), con redirecciones desde las rutas antiguas `/inventario`.
- Financiamiento con simulador referencial (Autofin), comparador, novedades y contacto.
- Consigna tu vehículo (`/consigna-tu-vehiculo`): el formulario llega por email vía `/api/consigna`.
- Prueba de manejo y modales de leads, chat, banner de cookies y páginas legales (privacidad, términos, cookies, aviso de crédito, condiciones de reserva).
- SEO: `robots.txt`, `sitemap.xml`, `site.webmanifest`, favicons, imagen OG y `security.txt`.

**Panel admin** (`/admin`)
- Login validado en el servidor (`/api/admin/login`): hash de contraseña y secreto de sesión **solo en variables de servidor**; la cookie de sesión va firmada con HMAC y sin `ADMIN_SESSION_SECRET` el login falla cerrado.
- Inventario: editor de catálogo, gestor de fotos (subida a Blob, portada y orden), marcar vendidos (`/api/admin/sell`) y lista de vendidos.
- Sincronización con la pestaña **UNIDADES CHILE** de Google Sheets (`/api/admin/sync`, que dispara el sync del hub) y patentes vigentes (`/api/sheet-plates`).
- CRM de leads, publicaciones, contenido, reportes, telemetría y configuración.

## Estructura

```
api/            Funciones serverless (admin: login, logout, vehicles, photos, sell, sync; consigna; sheet-plates)
src/pages/      Páginas públicas
src/admin/      Panel de administración (hubs de inventario, CRM y configuración)
src/components/ UI compartida (cards, header, modales de leads, comparador…)
src/lib/        Supabase, catálogo, fotos, Autofin, cliente de la API admin
src/store/      Estado de datos y sesión admin
scripts/        Utilitarios (export a Supabase, importación de stock, favicons)
public/         Assets estáticos, SEO y favicons
```

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar valores; nunca commitear .env / .env.local
npm run dev                  # http://localhost:5173
```

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Typecheck (`tsc --noEmit`) + build de producción |
| `npm run preview` | Sirve el build localmente |

> Las funciones de `/api` corren en Vercel. Para probarlas en local usa `vercel dev`.

## Variables de entorno

Ver [`.env.example`](.env.example). Solo nombres; los valores van en `.env.local` o en el proyecto de Vercel.

| Variable | Dónde | Uso |
|----------|-------|-----|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Cliente | Lectura pública del catálogo |
| `VITE_ADMIN_USER` | Cliente (opcional) | Usuario mostrado en el login. Nunca poner hashes en `VITE_*` |
| `ADMIN_USER`, `ADMIN_PASSWORD_HASH` | Servidor | Credenciales del panel |
| `ADMIN_SESSION_SECRET` | Servidor | Firma de la cookie de sesión |
| `SUPABASE_SERVICE_ROLE_KEY` | Servidor | Escritura del catálogo desde `/api/admin` |
| `CRON_SECRET` | Servidor | Autoriza el sync contra el hub |
| `BLOB_READ_WRITE_TOKEN` | Servidor | Subida de fotos a Vercel Blob |
| `RESEND_API_KEY`, `CONSIGNA_TO`, `CONSIGNA_FROM` | Servidor | Email de consignación |
| `UC_SYNC_URL`, `UC_CATALOG_WRITE_URL` | Servidor (opcional) | Endpoints del hub de sync |

## Despliegue

1. Importar el repo en Vercel (framework **Vite**).
2. Cargar las variables de servidor y de cliente en el proyecto.
3. Apuntar el dominio `www.unidadeschile.cl`. Los rewrites de `vercel.json` sirven la SPA y dejan pasar `/api`, imágenes y archivos SEO.

## Autor

Desarrollado por [**MathiasAlejandr0**](https://github.com/MathiasAlejandr0).