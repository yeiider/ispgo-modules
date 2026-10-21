# Módulos de IspGo

Módulos que se instalan en una instancia de IspGo **sin construir una imagen
nueva**: la instancia baja el paquete al arrancar (`php artisan
ispgo:modules:sync`) y el panel muestra su interfaz en `/m/<clave>`.

Cada carpeta es un módulo:

| Carpeta | Qué es |
| --- | --- |
| [`demo-notas/`](demo-notas/) | Módulo de prueba: notas internas con su propia tabla y pantalla |

## Publicar una versión

1. Sube `version` en `<carpeta>/module.json`.
2. Crea la etiqueta `<carpeta>-v<versión>` y súbela (o corre la acción **Release** a mano en Actions con esa etiqueta):
   `git tag demo-notas-v0.1.0 && git push origin demo-notas-v0.1.0`.
3. La acción **Release** publica `<clave>-<versión>.zip` y deja en las notas
   del release la línea para la instancia:
   `ISPGO_MODULES=<url del zip>@sha256:<huella>`.
4. En la instancia pon esa variable en app, worker y cron (varios módulos
   separados por coma) y haz Redeploy.

Si el repo es privado, la instancia necesita `ISPGO_MODULES_TOKEN` (token de
GitHub con lectura de contenido) y la URL de API del asset:
`https://api.github.com/repos/yeiider/ispgo-modules/releases/assets/<id>`.

Cómo se arma un módulo: ver [`demo-notas/README.md`](demo-notas/README.md).
