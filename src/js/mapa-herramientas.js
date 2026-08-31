/* =========================================================================
   mapa-herramientas.js — Ejercicio introductorio (bloque M1).
   El alumno enumera las herramientas de su día a día, para qué usa cada una,
   qué problemas encuentra (datos no unificados), cuánto tiempo pierde al pasar
   info y, opcionalmente, con qué otras herramientas se conecta. Con eso se
   dibuja un MAPA (grafo tipo "mapa de silos") y se puede descargar en PDF.
   Se menciona Toggl para medir tiempos manuales. Persiste en localStorage.
   ========================================================================= */
import { Header } from "../components/index.js";
import { escapeHtml } from "../components/_util.js";
import { load, save } from "./store.js";
/* jsPDF se importa bajo demanda (dynamic import) para no cargarlo hasta que se pulsa el botón. */

const KEY = "herramientas:items";
/** items = [{ id, herramienta, uso, problema, tiempo, conecta:[ids] }] */
let items = load(KEY, []);
let nextId = items.reduce((m, it) => Math.max(m, it.id || 0), 0) + 1;

const persist = () => save(KEY, items);
const short = (s, n = 16) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const app = document.querySelector("#app");
const $ = (s) => document.querySelector(s);

/* ------------------------------ Render (listas) -------------------------- */
function listHtml() {
  if (!items.length) return `<p class="vf-empty">Aún no has añadido ninguna herramienta.</p>`;
  return items
    .map((t) => {
      const conn = (t.conecta || []).map((cid) => items.find((x) => x.id === cid)?.herramienta).filter(Boolean);
      return `<div class="vf-item">
        <div class="vf-item__loc"><strong>${escapeHtml(t.herramienta)}</strong> · ${escapeHtml(t.uso)}</div>
        ${t.tiempo ? `<span class="vf-tag">⏱ ${escapeHtml(t.tiempo)}</span>` : ""}
        <div class="vf-item__imp">${escapeHtml(t.problema)}${conn.length ? ` · <em>↔ ${escapeHtml(conn.join(", "))}</em>` : ""}</div>
        <button type="button" class="vf-item__rm" data-rm="${t.id}" aria-label="Quitar herramienta">✕</button>
      </div>`;
    })
    .join("");
}

function conectaListHtml() {
  if (!items.length) return `<p class="mh-conecta__empty">Añade tu primera herramienta; luego podrás enlazar las siguientes entre sí.</p>`;
  return items
    .map((it) => `<label class="mh-chk"><input type="checkbox" value="${it.id}" /> ${escapeHtml(it.herramienta)}</label>`)
    .join("");
}

/* ------------------------------- Mapa (SVG) ------------------------------ */
function mapSvg() {
  const n = items.length;
  if (!n) return `<div class="mh-map__empty">Tu mapa aparecerá aquí cuando añadas herramientas. Marca las conexiones para ver cómo se enlazan.</div>`;
  const W = 640, H = Math.max(360, 260 + n * 6), CX = W / 2, CY = H / 2, R = Math.min(150, 55 + n * 11);
  const pos = {};
  items.forEach((it, i) => {
    const a = (-90 + i * (360 / n)) * Math.PI / 180;
    pos[it.id] = [CX + R * Math.cos(a), CY + R * Math.sin(a)];
  });
  const seen = new Set();
  const lines = [];
  items.forEach((it) => (it.conecta || []).forEach((cid) => {
    if (!pos[cid]) return;
    const k = [it.id, cid].sort((a, b) => a - b).join("-");
    if (seen.has(k)) return;
    seen.add(k);
    const [x1, y1] = pos[it.id], [x2, y2] = pos[cid];
    lines.push(`<line x1="${x1.toFixed(0)}" y1="${y1.toFixed(0)}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" class="mh-edge" />`);
  }));
  const nodes = items.map((it) => {
    const [x, y] = pos[it.id];
    return `<g class="mh-node">
      <circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="24" class="mh-node__c" />
      <text x="${x.toFixed(0)}" y="${(y + 43).toFixed(0)}" class="mh-node__lbl">${escapeHtml(short(it.herramienta, 16))}</text>
    </g>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" class="mh-graph" role="img" aria-label="Mapa de tus herramientas y sus conexiones">
    <g>${lines.join("")}</g><g>${nodes}</g></svg>`;
}

/* ------------------------------ Composición ------------------------------ */
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
      con las que trabajas cada día, para qué las usas, <strong>dónde pierdes tiempo</strong> pasando
      información de una a otra y <strong>cómo se conectan</strong> entre sí.</p>
    </div>

    <div class="vf-board">
      <section class="vf-col">
        <div class="panel">
          <h3>Qué tienes que hacer</h3>
          <ol class="vf-steps">
            <li><strong>Enumera todas</strong> las herramientas de tu día a día (Excel, correo, ERP, WhatsApp, una web, un cuaderno…).</li>
            <li>Para cada una: <strong>para qué la usas</strong>, qué <strong>problema</strong> te da (dato no unificado) y con qué otras se <strong>conecta</strong>.</li>
            <li>Estima <strong>cuánto tiempo pierdes</strong> al trasladar la info de un lado a otro.</li>
            <li>Mira el <strong>mapa</strong> que se genera y <strong>descárgalo en PDF</strong>.</li>
          </ol>
          <p class="vf-note"><strong>Mídelo de verdad con Toggl.</strong> Toggl es un cronómetro de tareas:
          arráncalo al empezar una tarea manual (copiar de un sistema a otro, cuadrar un Excel…) y párualo
          al acabar. Así ves <strong>cuánto tardas realmente</strong> en lo manual — y podrás
          <strong>proponer soluciones de SI</strong> que hagan tu flujo más cómodo (menos re-teclear, el dato una sola vez).</p>
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
            <fieldset class="mh-conecta">
              <legend>¿Se conecta con otra herramienta? (opcional)</legend>
              <div id="mh-conecta-list">${conectaListHtml()}</div>
            </fieldset>
            <button class="btn btn--primary" type="submit">Añadir herramienta</button>
          </form>
          <div class="vf-status" role="status" aria-live="polite"><span id="mh-count">${items.length}</span> herramientas <span id="mh-hint" class="vf-ok" ${items.length < 5 ? "hidden" : ""}>✓ buen mapa</span></div>
          <div id="mh-list">${listHtml()}</div>
        </div>

        <div class="panel mh-map-panel">
          <div class="mh-map-head">
            <h3>Tu mapa</h3>
            <button class="btn btn--secondary" type="button" id="mh-pdf">⬇ Descargar mapa (PDF)</button>
          </div>
          <div id="mh-map">${mapSvg()}</div>
          <div class="vf-actions">
            <button class="btn btn--ghost" type="button" id="mh-copy">Copiar en texto</button>
            <button class="btn btn--ghost" type="button" id="mh-clear">Vaciar</button>
          </div>
        </div>
      </aside>
    </div>
  </div></main>`,
].join("");

/* ------------------------------- Lógica ---------------------------------- */
function repintar() {
  $("#mh-list").innerHTML = listHtml();
  $("#mh-conecta-list").innerHTML = conectaListHtml();
  $("#mh-map").innerHTML = mapSvg();
  $("#mh-count").textContent = String(items.length);
  $("#mh-hint").hidden = items.length < 5;
  persist();
}

$("#mh-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const herramienta = $("#mh-tool").value.trim();
  const uso = $("#mh-uso").value.trim();
  const problema = $("#mh-prob").value.trim();
  const tiempo = $("#mh-time").value.trim();
  if (!herramienta || !uso || !problema) return;
  const conecta = [...document.querySelectorAll("#mh-conecta-list input:checked")].map((c) => Number(c.value));
  items.push({ id: nextId++, herramienta, uso, problema, tiempo, conecta });
  $("#mh-tool").value = ""; $("#mh-uso").value = ""; $("#mh-prob").value = ""; $("#mh-time").value = "";
  $("#mh-tool").focus();
  repintar();
});

$("#mh-list").addEventListener("click", (e) => {
  const rm = e.target.closest("[data-rm]");
  if (!rm) return;
  const id = Number(rm.dataset.rm);
  items = items.filter((it) => it.id !== id);
  items.forEach((it) => { it.conecta = (it.conecta || []).filter((cid) => cid !== id); });
  repintar();
});

$("#mh-clear").addEventListener("click", () => {
  if (!items.length) return;
  if (confirm("¿Vaciar todo el mapa de herramientas?")) { items = []; repintar(); }
});

$("#mh-copy").addEventListener("click", async () => {
  if (!items.length) return;
  const txt = "Mi mapa de herramientas\n\n" +
    items.map((t, i) => {
      const conn = (t.conecta || []).map((cid) => items.find((x) => x.id === cid)?.herramienta).filter(Boolean);
      return `${i + 1}. ${t.herramienta} — ${t.uso}\n   Problema: ${t.problema}${t.tiempo ? `\n   Tiempo perdido: ${t.tiempo}` : ""}${conn.length ? `\n   Conecta con: ${conn.join(", ")}` : ""}`;
    }).join("\n\n");
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

/* ------------------------------- PDF del mapa ---------------------------- */
$("#mh-pdf").addEventListener("click", async () => {
  const _btn = $("#mh-pdf"); const _prev = _btn.textContent;
  _btn.disabled = true; _btn.textContent = "Generando…";
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const PW = 595;
  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(0, 19, 63);
  doc.text("Mi mapa de herramientas", 40, 54);
  doc.setDrawColor(10, 228, 195); doc.setLineWidth(2); doc.line(40, 64, PW - 40, 64);

  if (!items.length) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(90, 100, 125);
    doc.text("Aún no has añadido herramientas.", 40, 92);
    doc.save("mi-mapa-herramientas.pdf");
    _btn.disabled = false; _btn.textContent = _prev;
    return;
  }

  // Mapa (mismo layout circular que en pantalla)
  const n = items.length, CX = PW / 2, CY = 235, R = Math.min(150, 55 + n * 11);
  const pos = {};
  items.forEach((it, i) => {
    const a = (-90 + i * (360 / n)) * Math.PI / 180;
    pos[it.id] = [CX + R * Math.cos(a), CY + R * Math.sin(a)];
  });
  doc.setDrawColor(160, 175, 210); doc.setLineWidth(1);
  const seen = new Set();
  items.forEach((it) => (it.conecta || []).forEach((cid) => {
    if (!pos[cid]) return;
    const k = [it.id, cid].sort((a, b) => a - b).join("-");
    if (seen.has(k)) return; seen.add(k);
    const [x1, y1] = pos[it.id], [x2, y2] = pos[cid];
    doc.line(x1, y1, x2, y2);
  }));
  items.forEach((it) => {
    const [x, y] = pos[it.id];
    doc.setFillColor(233, 238, 255); doc.setDrawColor(0, 71, 233); doc.setLineWidth(1.5);
    doc.circle(x, y, 17, "FD");
    doc.setFontSize(8); doc.setTextColor(0, 19, 63);
    doc.text(short(it.herramienta, 20), x, y + 30, { align: "center" });
  });

  // Lista de herramientas
  let y = 430;
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(0, 19, 63);
  doc.text("Tus herramientas", 40, y); y += 8;
  doc.setDrawColor(220, 225, 240); doc.setLineWidth(1); doc.line(40, y, PW - 40, y); y += 18;
  doc.setFontSize(10);
  items.forEach((it, idx) => {
    if (y > 790) { doc.addPage(); y = 54; }
    doc.setFont("helvetica", "bold"); doc.setTextColor(0, 19, 63);
    doc.text(doc.splitTextToSize(`${idx + 1}. ${it.herramienta} — ${it.uso}`, PW - 80), 40, y); y += 14;
    doc.setFont("helvetica", "normal"); doc.setTextColor(70, 80, 105);
    const conn = (it.conecta || []).map((cid) => items.find((x) => x.id === cid)?.herramienta).filter(Boolean);
    const detail = `Problema: ${it.problema}${it.tiempo ? `  ·  Tiempo: ${it.tiempo}` : ""}${conn.length ? `  ·  Conecta con: ${conn.join(", ")}` : ""}`;
    const lines = doc.splitTextToSize(detail, PW - 80);
    doc.text(lines, 40, y); y += 14 * lines.length + 8;
  });

  doc.save("mi-mapa-herramientas.pdf");
  _btn.disabled = false; _btn.textContent = _prev;
});
