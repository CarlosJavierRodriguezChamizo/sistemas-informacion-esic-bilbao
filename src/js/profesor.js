/* =========================================================================
   profesor.js — Acceso protegido al material del profesor (solución).
   El fichero .xlsx viaja CIFRADO (AES-GCM, clave derivada de la contraseña
   con PBKDF2). Se descifra en el navegador solo si la clave es correcta;
   el plano nunca está en el repo. Sitio estático: sin servidor.
   ========================================================================= */

const app = document.querySelector("#app");

app.innerHTML = `
  <main id="contenido" class="section section--light"><div class="wrap" style="max-width:640px">
    <div class="tool-intro">
      <span class="badge badge--m3">Material del profesor</span>
      <h1 style="margin-top:var(--sp-2)">Solución del caso (protegida)</h1>
      <p class="lead">Descarga el dataset con la <strong>solución</strong>: celdas resaltadas y la hoja
      «Erratas». Introduce la clave de profesor.</p>
    </div>

    <div class="card" style="margin-top:var(--sp-5)">
      <form id="p-form" class="row" autocomplete="off" style="gap:var(--sp-3)">
        <input id="p-pass" type="password" placeholder="Clave de profesor" aria-label="Clave de profesor"
          style="flex:1 1 220px;padding:.7em 1em;border:1px solid var(--c-line);border-radius:var(--radius-pill);font:inherit" />
        <button class="btn btn--primary" type="submit" id="p-btn">Descargar solución</button>
      </form>
      <p id="p-msg" class="status-live" role="status" aria-live="polite" style="margin-top:var(--sp-3)"></p>
    </div>

    <p class="muted" style="font-size:.82rem;margin-top:var(--sp-5)">El fichero está <strong>cifrado</strong>:
    sin la clave no se puede abrir. Material reservado — no lo compartas con el alumnado.</p>
  </div></main>`;

const $ = (s) => document.querySelector(s);
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function descargar(pw) {
  const meta = await fetch("caso-profesor.enc.json", { cache: "no-store" }).then((r) => {
    if (!r.ok) throw new Error("no-file");
    return r.json();
  });
  const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: b64(meta.salt), iterations: meta.iter, hash: "SHA-256" },
    km,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: b64(meta.iv) }, key, b64(meta.ct));
  const blob = new Blob([pt], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = meta.filename || "material-profesor.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

$("#p-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pw = $("#p-pass").value.trim();
  const msg = $("#p-msg");
  const btn = $("#p-btn");
  if (!pw) return;
  btn.disabled = true;
  msg.style.color = "var(--c-ink-soft)";
  msg.textContent = "Descifrando…";
  try {
    await descargar(pw);
    msg.style.color = "#0a826e";
    msg.textContent = "✓ Descarga iniciada.";
  } catch (err) {
    msg.style.color = "#d33";
    msg.textContent = err.message === "no-file"
      ? "No se encuentra el fichero cifrado."
      : "Clave incorrecta.";
    $("#p-pass").value = "";
    $("#p-pass").focus();
  } finally {
    btn.disabled = false;
  }
});
