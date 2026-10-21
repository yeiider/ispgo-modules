# Notas: módulo de prueba para IspGo

Módulo de terceros de ejemplo. Prueba que un módulo puede vivir en su propio
repo y llegar a una instancia de IspGo **sin construir una imagen nueva**: la
instancia baja el paquete al arrancar y el panel muestra su interfaz.

Qué hace: notas internas (opcionalmente ligadas a un cliente) guardadas en su
propia tabla, con una pantalla en el panel en **Notas (prueba)**.

## Estructura

| Carpeta / archivo | Para qué |
| --- | --- |
| `module.json` | Clave, versión, provider, autoload, migraciones, interfaz y menú |
| `src/` | Código PHP (se carga con el `autoload.psr-4` de `module.json`, sin composer) |
| `routes/api.php` | Rutas del módulo, bajo `/api/m/demo-notas/` |
| `database/migrations/` | Tablas del módulo, siempre con prefijo `m_demo_notas_` |
| `ui/` | Interfaz ya compilada (aquí HTML + JS sin build). `index.html` es la entrada |
| `ui/ispgo-module-sdk.js` | Kit para hablar con el panel: sesión, tema, avisos y navegación |

## Reglas que pone IspGo

- Las rutas del módulo usan el middleware `module.session:<key>`. Solo aceptan
  la sesión corta que el panel le pasa a la interfaz (15 minutos), nunca el
  token del usuario, y esa sesión no sirve en `/graphql` ni en otras rutas.
- La interfaz corre en un iframe servido por la API (otro origen que el
  panel): no ve las cookies ni la página del panel.
- Desde la interfaz: `const ispgo = await IspGo.connect()`, luego
  `ispgo.api("notes")`, `ispgo.toast("Guardado")`, `ispgo.navigate("/clients/12")`.
- Dependencias PHP: solo las que ya trae IspGo (Laravel, Guzzle...).

## Publicar una versión

1. Sube `version` en `module.json` (por ejemplo `0.1.0`).
2. Crea y sube la etiqueta: `git tag demo-notas-v0.1.0 && git push origin demo-notas-v0.1.0`.
3. La acción **Release** publica `demo-notas-0.1.0.zip` y deja en las notas
   del release la línea lista para la instancia:

   ```
   ISPGO_MODULES=https://github.com/<dueño>/<repo>/releases/download/demo-notas-v0.1.0/demo-notas-0.1.0.zip@sha256:<huella>
   ```

4. En la instancia (app, worker y cron) pon esa variable y reinicia. Al
   arrancar, `php artisan ispgo:modules:sync` baja el paquete, revisa la huella,
   lo deja en `/app/modules/demo-notas` y las migraciones crean su tabla.

Si el repo es **privado**, usa la URL de API del asset
(`https://api.github.com/repos/<dueño>/<repo>/releases/assets/<id>`) y pon un
token de GitHub con lectura en `ISPGO_MODULES_TOKEN`.

## Desarrollar en local

Con IspGo corriendo en local, monta o copia esta carpeta en
`<ispgo>/modules/demo-notas` (no hace falta `ISPGO_MODULES`) y corre
`php artisan migrate`. El menú **Notas (prueba)** aparece en el panel. Los
cambios en `ui/` se ven al recargar.
