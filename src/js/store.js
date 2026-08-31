/* =========================================================================
   store.js — Persistencia ligera en localStorage (sin registro, sin servidor).
   Guarda las selecciones del usuario para que no empiece de cero cada vez.
   Todo va bajo el prefijo "gorbea:" y protegido por try/catch (modo privado).
   ========================================================================= */
const NS = "gorbea:";

/** Lee un valor (JSON) del almacenamiento; devuelve `fallback` si no existe o falla. */
export function load(key, fallback) {
  try {
    const v = localStorage.getItem(NS + key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

/** Guarda un valor (se serializa a JSON). Silencioso si el navegador no deja. */
export function save(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento (modo privado, cuota…): seguimos en memoria */
  }
}

/** Borra una clave. */
export function remove(key) {
  try {
    localStorage.removeItem(NS + key);
  } catch {
    /* noop */
  }
}
