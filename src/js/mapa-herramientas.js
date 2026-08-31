/* =========================================================================
   mapa-herramientas.js — Ejercicio introductorio (bloque M1).
   Cada alumno enumera las herramientas de su día a día, explica para qué
   usa cada una (su mapa), qué problemas encuentra (datos no unificados) y
   cuánto tiempo pierde al trasladar información de un sitio a otro.
   Se menciona Toggl para medir de verdad los tiempos manuales y enfocar
   la propuesta de soluciones de SI. Estado en memoria, sin clave.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";

/* ------------------------------- Estado ---------------------------------- */
const items = []; // { herramienta, uso, problema, tiempo }

const app = document.querySelector("#app");

function listHtml() {
  if (!items.length) return `<p class="vf-empty">Aún no has añadido ninguna herramienta.</p>`;
  return items
    .map(
      (t, i) => `<div class="vf-item">
        <div class="vf-item__loc"><strong>${escapeHtml(t.herramienta)}</strong> · ${escapeHtml(t.uso)}</div>
        ${t.tiempo ? `<span class="vf-tag">⏱ ${escapeHtml(t.tiempo)}</span>` : ""}
        <div class="vf-item__imp">${escapeHtml(t.problema)}</div>
        <button type="button" class="vf-item__rm" data-rm="${i}" aria-label="Quitar herramienta">✕</button>
      </div>`
    )
    .join("");
}

app.innerHTML = [
  Header({
    variant: "light",
    breadcrumb: [
      { label: "Hub", href: "/index.html" },
      { label: "Mi mapa de herramientas", current: true },
    ],
    nav: [{ label: "Hub", href: "/index.html" }, { label: "Deck M1", href: "/decks/m1.html" }],
  }),
  `<main id="contenido" class="section section--light"><div class="wrap">
    <div class="tool-intro">
      <span class="badge badge--m1">Ejercicio · Introducción</span>
      <h1 style="margin-top:var(--sp-2)">Mi mapa de herramientas</h1>
      <p class="lead">Antes de hablar de sistemas de información, mira los tuyos. Enumera las herramientas
      con las que trabajas cada día, para qué las usas y <strong>dónde pierdes tiempo</strong> pasando
      información de una a otra.</p>
    </div>

    <div class="vf-board">
      <section class="vf-col">
        <div class="panel">
          <h3>Qué tienes que hacer</h3>
          <ol class="vf-steps">
            <li><strong>Enumera todas</strong> las herramientas de tu día a día (Excel, correo, ERP, WhatsApp, una web, un cuaderno…).</li>
            <li>Dibuja tu <strong>mapa</strong>: para cada una, <strong>para qué la usas</strong> y qué información entra y sale.</li>
            <li>Anota los <strong>problemas</strong>: datos que <strong>no están unificados</strong> (el mismo dato en dos sitios, formatos distintos, copiar-pegar).</li>
            <li>Estima <strong>cuánto tiempo pierdes</strong> al trasladar la info de un lado a otro (por tarea y por día).</li>
          </ol>
          <p class="vf-note"><strong>Mídelo de verdad con Toggl.</strong> Toggl es un cronómetro de tareas:
          arráncalo cuando empieces una tarea manual (copiar de un sistema a otro, cuadrar un Excel…) y
          párualo al acabar. Así ves <strong>cuánto tardas realmente</strong> en lo manual — y podrás
          <strong>proponer soluciones de SI</strong> que te hagan el flujo más cómodo (menos re-teclear,
          menos duplicar, el dato una sola vez).</p>
          <p class="vf-note" style="margin-top:var(--sp-3)"><strong>El objetivo:</strong> identificar los
          tiempos manuales y plantear cómo un sistema de información los reduciría.</p>
        </div>
      </section>

      <aside class="vf-col">
        <div class="panel">
          <h3>Tus herramientas</h3>
          <form id="mh-form" class="vf-form" autocomplete="off">
            <div class="vf-grid">
              <label>Herramienta<input id="mh-tool" type="text" placeholder="p. ej. Excel de pedidos" required /></label>
              <label>¿Para qué la usas?<input id="mh-uso" type="text" placeholder="p. ej. controlar el stock" required /></label>
              <label>Problema / dato no unificado<input id="mh-prob" type="text" placeholder="p. ej. lo copio del correo a mano" required /></label>
              <label>Tiempo perdido al pasar info<input id="mh-time" type="text" placeholder="p. ej. 20 min/día" /></label>
            </div>
            <button class="btn btn--primary" type="submit">Añadir herramienta</button>
          </form>
          <div class="vf-status" role="status" aria-live="polite"><span id="mh-count">0</span> herramientas <span id="mh-hint" class="vf-ok" hidden>✓ buen mapa</span></div>
          <div id="mh-list">${listHtml()}</div>
          <div class="vf-actions">
            <button class="btn btn--ghost" type="button" id="mh-copy">Copiar mi mapa</button>
            <button class="btn btn--ghost" type="button" id="mh-clear">Vaciar</button>
          </div>
        </div>
      </aside>
    </div>
  </div></main>`,
].join("");

/* ------------------------------- Lógica ---------------------------------- */
const $ = (s) => document.querySelector(s);

function repintar() {
  $("#mh-list").innerHTML = listHtml();
  $("#mh-count").textContent = String(items.length);
  $("#mh-hint").hidden = items.length < 5;
}

$("#mh-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const herramienta = $("#mh-tool").value.trim();
  const uso = $("#mh-uso").value.trim();
  const problema = $("#mh-prob").value.trim();
  const tiempo = $("#mh-time").value.trim();
  if (!herramienta || !uso || !problema) return;
  items.push({ herramienta, uso, problema, tiempo });
  $("#mh-tool").value = ""; $("#mh-uso").value = ""; $("#mh-prob").value = ""; $("#mh-time").value = "";
  $("#mh-tool").focus();
  repintar();
});

$("#mh-list").addEventListener("click", (e) => {
  const rm = e.target.closest("[data-rm]");
  if (rm) { items.splice(Number(rm.dataset.rm), 1); repintar(); }
});

$("#mh-clear").addEventListener("click", () => {
  if (!items.length) return;
  if (confirm("¿Vaciar todo el mapa de herramientas?")) { items.length = 0; repintar(); }
});

$("#mh-copy").addEventListener("click", async () => {
  if (!items.length) return;
  const txt = "Mi mapa de herramientas\n\n" +
    items.map((t, i) => `${i + 1}. ${t.herramienta} — ${t.uso}\n   Problema: ${t.problema}${t.tiempo ? `\n   Tiempo perdido: ${t.tiempo}` : ""}`).join("\n\n");
  const btn = $("#mh-copy");
  try {
    await navigator.clipboard.writeText(txt);
    const prev = btn.textContent; btn.textContent = "✓ Copiado";
    setTimeout(() => (btn.textContent = prev), 1500);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch { /* noop */ }
    ta.remove();
  }
});
