/* =========================================================================
   validacion-dato.js — Práctica "Validación del dato" (Sábado).
   Explica la tarea (auditar la calidad del dato del caso ANTES de analizar) y
   ofrece una hoja de trabajo para documentar ≥5 problemas: hoja, celda, tipo
   de error e impacto. Estado en memoria, SIN clave de respuesta (el alumno
   detecta; el profesor corrige). Mismo lenguaje que el resto de herramientas.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml, appUrl } from "../components/_util.js";
import { load, save } from "./store.js";

const MIN = 5;

/* ------------------------------- Estado ---------------------------------- */
const findings = load("validacion:findings", []); // { hoja, celda, tipo, impacto } (persistido)

/* ------------------------------- Render ---------------------------------- */
const app = document.querySelector("#app");

function listHtml() {
  if (!findings.length) return `<p class="vf-empty">Aún no has documentado ningún problema.</p>`;
  return findings
    .map(
      (f, i) => `<div class="vf-item">
        <div class="vf-item__loc"><strong>${escapeHtml(f.hoja)}</strong> · <code>${escapeHtml(f.celda)}</code></div>
        <span class="vf-tag">${escapeHtml(f.tipo)}</span>
        <div class="vf-item__imp">${escapeHtml(f.impacto)}</div>
        <button type="button" class="vf-item__rm" data-rm="${i}" aria-label="Quitar hallazgo">✕</button>
      </div>`
    )
    .join("");
}

app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Validación del dato", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "El reto del Comité", href: "/decks/comite.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <span class="badge badge--m2">Práctica · Calidad del dato</span>
      <h1 style="margin-top:var(--sp-2)">Validación del dato</h1>
      <p class="lead">Antes de analizar nada, hay que <strong>auditar la calidad del dato</strong>. Una IA o un cuadro de mando
      construidos sobre dato sucio aceleran… los errores. Tu trabajo: encontrar los problemas y documentarlos.</p>
      <p style="margin-top:var(--sp-3)"><a class="btn btn--primary" href="${appUrl("/caso-gorbea-datos-alumno.xlsx")}" download>⬇ Descargar el dataset (Excel protegido)</a></p>
      <p class="muted" style="font-size:.85rem;margin-top:var(--sp-2)">🔒 El fichero está <strong>protegido con contraseña</strong>. Ábrelo en Excel con la <strong>clave que te doy en clase</strong>.</p>
    </div>

    <div class="vf-board">
      <section class="vf-col">
        <div class="panel">
          <h3>Qué tienes que hacer</h3>
          <ol class="vf-steps">
            <li>Descarga el <strong>dataset del caso</strong> y ábrelo en <strong>Excel</strong> con la clave de clase. No lo copies a otra herramienta: parte de los fallos solo se ven en el propio fichero.</li>
            <li><strong>Antes</strong> de cualquier análisis, revísalo a fondo.</li>
            <li>Detecta y documenta <strong>al menos ${MIN} problemas</strong> de calidad, indicando para cada uno:
              <span class="vf-fields">hoja y celda · tipo de error · impacto en el análisis</span></li>
            <li>Propón <strong>cómo lo corregirías</strong> (en tu entrega o en el pitch).</li>
          </ol>
          <p class="vf-note">Aquí no hay solución ni pistas: el objetivo es que <strong>tú</strong> detectes los problemas y determines de qué tipo son. Usa la hoja de la derecha para registrarlos y luego cópialos a tu entrega.</p>
        </div>
      </section>

      <aside class="vf-col">
        <div class="panel">
          <h3>Tu registro de hallazgos</h3>
          <form id="vf-form" class="vf-form" autocomplete="off">
            <div class="vf-grid">
              <label>Hoja<input id="vf-hoja" type="text" placeholder="p. ej. Clientes" required /></label>
              <label>Celda / columna<input id="vf-celda" type="text" placeholder="p. ej. B12 o «email»" required /></label>
              <label>Tipo de error<input id="vf-tipo" type="text" placeholder="defínelo tú: ¿qué falla?" required /></label>
              <label>Impacto en el análisis<input id="vf-impacto" type="text" placeholder="¿qué distorsiona?" required /></label>
            </div>
            <button class="btn btn--primary" type="submit">Añadir hallazgo</button>
          </form>
          <div class="vf-status" role="status" aria-live="polite"><span id="vf-count">0</span> / ${MIN} mínimo <span id="vf-ok" class="vf-ok" hidden>✓ objetivo cumplido</span></div>
          <div id="vf-list">${listHtml()}</div>
          <div class="vf-actions">
            <button class="btn btn--ghost" type="button" id="vf-copy">Copiar registro</button>
            <button class="btn btn--ghost" type="button" id="vf-clear">Vaciar</button>
          </div>
        </div>
      </aside>
    </div>
  </div></main>`,
].join("");

/* ------------------------------- Lógica ---------------------------------- */
const $ = (s) => document.querySelector(s);

function repintar() {
  $("#vf-list").innerHTML = listHtml();
  $("#vf-count").textContent = String(findings.length);
  $("#vf-ok").hidden = findings.length < MIN;
  save("validacion:findings", findings);
}

$("#vf-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const hoja = $("#vf-hoja").value.trim();
  const celda = $("#vf-celda").value.trim();
  const tipo = $("#vf-tipo").value.trim();
  const impacto = $("#vf-impacto").value.trim();
  if (!hoja || !celda || !tipo || !impacto) return;
  findings.push({ hoja, celda, tipo, impacto });
  $("#vf-hoja").value = ""; $("#vf-celda").value = ""; $("#vf-tipo").value = ""; $("#vf-impacto").value = "";
  $("#vf-hoja").focus();
  repintar();
});

$("#vf-list").addEventListener("click", (e) => {
  const rm = e.target.closest("[data-rm]");
  if (rm) { findings.splice(Number(rm.dataset.rm), 1); repintar(); }
});

$("#vf-clear").addEventListener("click", () => {
  if (!findings.length) return;
  if (confirm("¿Vaciar todo el registro de hallazgos?")) { findings.length = 0; repintar(); }
});

$("#vf-copy").addEventListener("click", async () => {
  if (!findings.length) return;
  const txt = "Validación del dato — hallazgos\n\n" +
    findings.map((f, i) => `${i + 1}. [${f.hoja} · ${f.celda}] ${f.tipo}\n   Impacto: ${f.impacto}`).join("\n\n");
  const btn = $("#vf-copy");
  try {
    await navigator.clipboard.writeText(txt);
    const prev = btn.textContent; btn.textContent = "✓ Copiado";
    setTimeout(() => (btn.textContent = prev), 1500);
  } catch {
    // Fallback: seleccionar en un textarea temporal
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch { /* noop */ }
    ta.remove();
  }
});

/* Sincroniza los contadores con lo cargado del navegador. */
repintar();
