/**
 * Kit mínimo para la interfaz de un módulo de IspGo (v1).
 *
 * La interfaz corre en un iframe que sirve la API de IspGo
 * (https://<api>/m/<key>/ui/). El panel le pasa por postMessage una sesión
 * corta que solo sirve en las rutas del módulo (/api/m/<key>/...), el tema y
 * la ruta. El módulo nunca recibe el token del usuario.
 *
 *   const ispgo = await IspGo.connect()
 *   const notas = await ispgo.api("notes")
 *   ispgo.toast("Guardado")
 *   ispgo.navigate("/customers/12")   // abre una pantalla del panel
 */
;(function () {
  const VERSION = 1

  function connect({ timeoutMs = 10000 } = {}) {
    const key = location.pathname.split("/")[2]
    const apiBase = `${location.origin}/api/m/${key}/`
    let session = null
    let pending = null
    const listeners = new Set()

    if (window.parent === window) {
      return Promise.reject(new Error("La interfaz del módulo se abre desde el panel de IspGo."))
    }

    const send = (type, data = {}) => window.parent.postMessage({ source: "ispgo-module", version: VERSION, module: key, type, ...data }, "*")

    function applyTheme(theme) {
      document.documentElement.dataset.theme = theme?.mode === "dark" ? "dark" : "light"
    }

    window.addEventListener("message", (event) => {
      // Solo el panel que nos contiene habla con nosotros.
      if (event.source !== window.parent) return
      const msg = event.data
      if (!msg || msg.source !== "ispgo-panel") return
      if (msg.type === "session") {
        session = { token: msg.token, expiresAt: Date.parse(msg.expiresAt) }
        if (msg.theme) applyTheme(msg.theme)
        if (pending) {
          pending.resolve(msg)
          pending = null
        }
      }
      if (msg.type === "theme") applyTheme(msg.theme)
      listeners.forEach((fn) => fn(msg))
    })

    function requestSession() {
      return new Promise((resolve, reject) => {
        pending = { resolve, reject }
        send("ready")
        setTimeout(() => {
          if (pending) {
            pending.reject(new Error("El panel no respondió."))
            pending = null
          }
        }, timeoutMs)
      })
    }

    async function token() {
      // Se renueva un minuto antes de vencer.
      if (!session || session.expiresAt - Date.now() < 60000) await requestSession()
      return session.token
    }

    async function api(path, { method = "GET", body, query } = {}) {
      const url = new URL(path.replace(/^\//, ""), apiBase)
      Object.entries(query || {}).forEach(([k, v]) => v != null && v !== "" && url.searchParams.set(k, v))
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${await token()}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (res.status === 204) return null
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || `Error ${res.status}`)
      return data
    }

    return requestSession().then((init) => ({
      module: key,
      path: init.path || "/",
      api,
      toast: (message, kind = "success") => send("toast", { message, kind }),
      navigate: (path) => send("navigate", { path }),
      onMessage: (fn) => listeners.add(fn),
    }))
  }

  window.IspGo = { connect, version: VERSION }
})()
