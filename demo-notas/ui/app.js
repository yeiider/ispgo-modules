;(async function () {
  const $ = (id) => document.getElementById(id)
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
  const name = (c) => `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()

  let ispgo
  try {
    ispgo = await IspGo.connect()
  } catch (e) {
    $("who").textContent = e.message
    return
  }

  const me = await ispgo.api("me")
  $("who").textContent = `Abierto por ${me.name}. Estas notas se guardan en la tabla del módulo (m_demo_notas_notes).`

  const customers = new Map()

  async function loadNotes() {
    const notes = await ispgo.api("notes")
    $("notes").innerHTML = notes.length
      ? notes
          .map(
            (n) => `<li class="note">
              <div class="body">
                <div class="text">${esc(n.body)}</div>
                <div class="muted">${esc(n.user_name)} · ${new Date(n.created_at).toLocaleString("es-CO")}${
                  n.customer_id ? ` · <a data-customer="${n.customer_id}">cliente #${n.customer_id}</a>` : ""
                }</div>
              </div>
              <button class="ghost" data-delete="${n.id}">Borrar</button>
            </li>`,
          )
          .join("")
      : `<li class="muted">Todavía no hay notas.</li>`
  }

  let timer
  $("search").addEventListener("input", () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const list = await ispgo.api("customers", { query: { q: $("search").value } })
      list.forEach((c) => customers.set(String(c.id), c))
      $("customer").innerHTML =
        `<option value="">Sin cliente</option>` +
        list.map((c) => `<option value="${c.id}">${esc(name(c))} · ${esc(c.identity_document)}</option>`).join("")
      if (list.length) $("customer").value = String(list[0].id)
    }, 300)
  })

  $("save").addEventListener("click", async () => {
    $("error").textContent = ""
    if (!$("body").value.trim()) return ($("error").textContent = "Escribe la nota.")
    $("save").disabled = true
    try {
      await ispgo.api("notes", { method: "POST", body: { body: $("body").value, customer_id: $("customer").value || null } })
      $("body").value = ""
      ispgo.toast("Nota guardada")
      await loadNotes()
    } catch (e) {
      $("error").textContent = e.message
    } finally {
      $("save").disabled = false
    }
  })

  $("notes").addEventListener("click", async (event) => {
    const del = event.target.closest("[data-delete]")
    if (del) {
      await ispgo.api(`notes/${del.dataset.delete}`, { method: "DELETE" })
      ispgo.toast("Nota borrada")
      return loadNotes()
    }
    const customer = event.target.closest("[data-customer]")
    // Abre la pantalla del cliente en el panel (fuera del iframe).
    if (customer) ispgo.navigate(`/clients/${customer.dataset.customer}`)
  })

  $("reload").addEventListener("click", loadNotes)
  await loadNotes()
})()
