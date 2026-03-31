# Freepik MCP Workflow (Asistido)

Este proyecto usa Freepik por MCP en modo asistido (fuera del runtime de la app).

## 1) Prerrequisitos

- Codex Desktop reiniciado luego de cambiar `C:\Users\JHONR2\.codex\config.toml`.
- Servidor MCP configurado:

```toml
[mcp_servers.freepik]
url = "https://api.freepik.com/mcp"

[mcp_servers.freepik.http_headers]
"x-freepik-api-key" = "YOUR_FREEPIK_API_KEY"
```

## 2) Flujo de trabajo para assets

1. Definir necesidad visual por pantalla (`generator`, `generating`, `history`, `preview`):
- portada de guia (hero),
- imagen de apoyo de tarjeta,
- set de iconos.
2. Generar o buscar recursos via MCP Freepik desde el asistente.
3. Exportar o descargar los resultados finales.
4. Guardar archivos en frontend, por ejemplo:
- `apps/frontend/public/assets/covers/`
- `apps/frontend/public/assets/icons/`
5. Referenciar en componentes con rutas estaticas (`/assets/...`) y fallback visual local.

## 3) Convenciones recomendadas

- Formatos:
- imagenes: `.webp` o `.jpg`.
- iconos: `.svg` cuando aplique.
- Nombre de archivo:
- `cover-<slug-guia>.webp`
- `icon-<feature>.svg`
- Tamanos de portada:
- tarjeta: `1200x675` (16:9)
- hero: `1536x1024` (3:2)

## 4) Errores comunes

- `401 Unauthorized`: API key invalida, mal copiada o rotada.
- `403 Forbidden`: plan, cuota o permisos insuficientes para endpoint o modelo.
- MCP no aparece en sesion: reiniciar Codex Desktop o abrir nueva sesion.

## 5) Seguridad

- No versionar API keys en el repo.
- Si una key se comparte por chat o commit, rotarla en Freepik Dashboard.
