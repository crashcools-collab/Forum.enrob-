"use strict";
// Tableau de bord Sentinelle. Règle de sécurité : aucune donnée n'est insérée en HTML (pas d'innerHTML) —
// les noms de processus, chemins et réponses de l'IA peuvent contenir du texte écrit par un attaquant.

const GRAVITES = ["CRITIQUE", "ELEVE", "MOYEN", "INFO"];
const LIBELLES = { CRITIQUE: "Critique", ELEVE: "Élevé", MOYEN: "Moyen", INFO: "Info" };
const $ = (sel) => document.querySelector(sel);

let jeton = null;
let etat = null;
let filtre = "TOUT";
const ouvertes = new Set();
let idsGravesConnus = null;
let scanPrecedent = false;
let minuteur = null;
let alerteEnCours = null;

function lireStockage(cle) { try { return sessionStorage.getItem(cle); } catch { return null; } }
function ecrireStockage(cle, val) { try { sessionStorage.setItem(cle, val); } catch { /* navigation privée */ } }
function lireLocal(cle) { try { return localStorage.getItem(cle); } catch { return null; } }
function ecrireLocal(cle, val) { try { localStorage.setItem(cle, val); } catch { /* ignoré */ } }

function el(tag, attrs = {}, ...enfants) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : String(v));
  }
  for (const e of enfants.flat()) {
    if (e === null || e === undefined || e === false) continue;
    n.append(e instanceof Node ? e : document.createTextNode(String(e)));
  }
  return n;
}
function vider(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

function heure(ts, avecDate = false) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  return avecDate
    ? d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function toast(texte, niveau = "") {
  const t = el("div", { class: `toast ${niveau}` }, texte);
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 6000);
}

async function api(chemin, corps) {
  const opts = { headers: { "X-Sentinelle-Jeton": jeton }, cache: "no-store" };
  if (corps !== undefined) {
    opts.method = "POST";
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(corps);
  }
  const r = await fetch(chemin, opts);
  const type = r.headers.get("Content-Type") || "";
  const donnees = type.includes("json") ? await r.json() : await r.text();
  if (!r.ok && r.status !== 409) throw new Error((donnees && donnees.erreur) || `HTTP ${r.status}`);
  return donnees;
}

// ---------------------------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------------------------

function compter(alertes) {
  const c = Object.fromEntries(GRAVITES.map((g) => [g, 0]));
  for (const a of alertes) c[a.gravite] = (c[a.gravite] || 0) + 1;
  return c;
}

function rendreEntete() {
  const c = compter(etat.alertes);
  const statut = $("#statut-global");
  if (!etat.dernier_scan) {
    statut.dataset.niveau = "inconnu";
    statut.textContent = etat.scan_en_cours ? "PREMIER SCAN…" : "AUCUN SCAN";
  } else if (c.CRITIQUE) { statut.dataset.niveau = "CRITIQUE"; statut.textContent = "CRITIQUE"; }
  else if (c.ELEVE) { statut.dataset.niveau = "ELEVE"; statut.textContent = "ATTENTION"; }
  else if (c.MOYEN) { statut.dataset.niveau = "MOYEN"; statut.textContent = "À SURVEILLER"; }
  else { statut.dataset.niveau = "ok"; statut.textContent = "SÉCURISÉ"; }

  $("#meta").textContent = `${etat.machine} · ` +
    (etat.dernier_scan ? `dernier scan ${heure(etat.dernier_scan)} (${etat.duree_scan} s)` : "pas encore de scan");
  document.title = (c.CRITIQUE || c.ELEVE ? `(${c.CRITIQUE + c.ELEVE}) ` : "") + "Sentinelle · Contrôle";

  const btn = $("#btn-scan");
  btn.disabled = etat.scan_en_cours;
  btn.textContent = etat.scan_en_cours ? "Scan en cours…" : "Scanner maintenant";
  $("#barre-scan").hidden = !etat.scan_en_cours;
  $("#phase-scan").textContent = etat.scan_en_cours ? `${etat.phase || "Scan"} · ${etat.scan_depuis ?? 0} s` : "";
  $("#journal-chemin").textContent = etat.dossier + (etat.dossier.includes("\\") ? "\\" : "/") + "audit.jsonl";

  for (const g of GRAVITES) {
    $(`#n-${g}`).textContent = etat.dernier_scan ? c[g] : "–";
    $(`.tuile[data-filtre="${g}"]`).classList.toggle("non-nul", c[g] > 0);
  }
}

function rendreBannieres() {
  const b = vider($("#bannieres"));
  if (!etat.admin) b.append(el("div", { class: "banniere MOYEN" }, el("b", {}, "Pas lancé en administrateur. "),
    "Une partie des processus et des connexions est invisible, et le blocage de ports échouera. Relance le tableau de bord en administrateur."));
  if (!etat.reference.existe) b.append(el("div", { class: "banniere" }, el("b", {}, "Aucune référence. "),
    "Sur un PC que tu considères sain, clique sur « Référence » : les scans signaleront ensuite tout nouveau port ou programme de démarrage."));
  if (etat.erreur_ia) b.append(el("div", { class: "banniere MOYEN" }, el("b", {}, "IA : "), etat.erreur_ia));
}

function rendreLMStudio() {
  const l = etat.lmstudio || {};
  const tuile = $("#tuile-lms");
  const details = vider($("#lms-details"));
  let titre, niveau;
  if (!l.actif) { titre = "Serveur arrêté"; niveau = "neutre"; }
  else if (l.expose) { titre = "EXPOSÉ AU RÉSEAU"; niveau = "danger"; }
  else { titre = "Actif · local uniquement"; niveau = "ok"; }
  tuile.dataset.etat = niveau;
  $("#lms-etat").textContent = titre;
  if (l.actif) {
    details.append(el("li", {}, `Port ${l.port} · ${l.authentification ? "authentification activée" : "sans authentification"}`));
    const modeles = (l.modeles || []).filter((m) => !/embed/i.test(m));
    details.append(el("li", {}, modeles.length ? `Modèle : ${l.modele_force || modeles[0]}` : "Aucun modèle de chat chargé"));
  } else {
    details.append(el("li", {}, `Port ${l.port ?? 1234} · LM Studio > Developer > Start Server`));
  }
}

function ordreIA() {
  const ordre = new Map();
  (etat.analyse?.priorites || []).forEach((p, i) => ordre.set(p.id, i));
  return ordre;
}

function rendreAlertes() {
  const liste = vider($("#liste-alertes"));
  const q = $("#recherche").value.trim().toLowerCase();
  const ia = new Map((etat.analyse?.priorites || []).map((p) => [p.id, p]));
  const ordre = ordreIA();
  const alertes = etat.alertes
    .filter((a) => filtre === "TOUT" || a.gravite === filtre)
    .filter((a) => !q || JSON.stringify([a.titre, a.detail, a.preuves, a.id]).toLowerCase().includes(q))
    .sort((a, b) => GRAVITES.indexOf(a.gravite) - GRAVITES.indexOf(b.gravite) || (ordre.get(a.id) ?? 999) - (ordre.get(b.id) ?? 999));

  document.querySelectorAll("#filtres button").forEach((b) => b.classList.toggle("actif", b.dataset.filtre === filtre));

  if (!etat.dernier_scan) {
    liste.append(el("div", { class: "vide" }, etat.scan_en_cours ? "Premier scan en cours…" : "Lance un scan pour voir l'état du PC."));
    return;
  }
  if (!alertes.length) {
    const graves = etat.alertes.some((a) => a.gravite !== "INFO");
    liste.append(el("div", { class: "vide" },
      filtre === "TOUT" && !q && !graves ? el("strong", {}, "Rien d'anormal détecté") : null,
      filtre === "TOUT" && !q ? "Aucune alerte." : "Aucune alerte ne correspond au filtre."));
    return;
  }
  for (const a of alertes) liste.append(carteAlerte(a, ia.get(a.id)));
}

function carteAlerte(a, avis) {
  const ouverte = ouvertes.has(a.id);
  const corps = el("div", { class: "alerte-corps", hidden: !ouverte, id: `corps-${a.id}` },
    el("p", {}, a.detail),
    Object.keys(a.preuves || {}).length
      ? el("dl", { class: "preuves" }, Object.entries(a.preuves).flatMap(([k, v]) =>
          [el("dt", {}, k), el("dd", {}, typeof v === "object" ? JSON.stringify(v) : String(v))]))
      : null,
    avis ? el("div", { class: "bloc-ia" },
      el("span", { class: "etiquette-ia" }, "Avis de l'IA"),
      el("p", {}, avis.explication),
      avis.verification ? el("p", {}, el("b", {}, "À vérifier : "), avis.verification) : null,
      avis.faux_positif_probable ? el("p", { class: "discret" }, "L'IA estime un faux positif probable. La gravité reste celle des règles.") : null)
      : null,
    a.action ? el("div", { class: "ligne-action" },
      a.action_resultat
        ? el("span", { class: "resultat-action" }, `Action exécutée : ${a.action_resultat}`)
        : a.action_executable
          ? el("button", { class: "danger", onclick: () => demanderAction(a) }, a.action_libelle)
          : el("span", { class: "discret" }, a.action_libelle))
      : null,
    el("span", { class: "id-alerte" }, a.id));

  const tete = el("button", {
    class: "alerte-tete", "aria-expanded": ouverte ? "true" : "false", "aria-controls": `corps-${a.id}`,
    onclick: () => {
      ouverte ? ouvertes.delete(a.id) : ouvertes.add(a.id);
      rendreAlertes();
    },
  },
  el("span", { class: `badge ${a.gravite}` }, LIBELLES[a.gravite]),
  el("span", { class: "titre" }, a.titre),
  el("span", {}, avis ? el("span", { class: "badge ia" }, avis.faux_positif_probable ? "IA : faux positif ?" : "IA") : null,
    " ", el("span", { class: "chevron", "aria-hidden": "true" }, "›")));

  return el("article", { class: `alerte ${a.gravite}${ouverte ? " ouverte" : ""}` }, tete, corps);
}

function rendreAnalyse() {
  const zone = vider($("#analyse"));
  const an = etat.analyse;
  if (!an) {
    zone.append(el("p", { class: "discret" }, etat.scan_en_cours && $("#opt-ia").checked
      ? "Le modèle analyse les alertes…"
      : "Pas d'analyse. Active « Analyse IA » et lance un scan (LM Studio doit être démarré avec un modèle chargé)."));
    return;
  }
  if (an.injection_detectee) zone.append(el("div", { class: "alerte-injection" },
    "Le modèle signale une tentative d'injection de prompt dans les données collectées."));
  zone.append(el("p", {}, an.resume || "(résumé vide)"));
  zone.append(el("p", { class: "discret" },
    `Modèle : ${an.modele || "?"} · ${an.priorites.length} alerte(s) commentée(s). L'IA ne peut ni changer une gravité ni lancer une action.`));
}

function rendreSurveillance() {
  const sv = etat.surveillance;
  const actif = document.activeElement;
  if (actif !== $("#surv-active")) $("#surv-active").checked = sv.active;
  if (actif !== $("#surv-intervalle")) $("#surv-intervalle").value = String(sv.intervalle);
  $("#surv-info").textContent = sv.active
    ? (etat.scan_en_cours ? "Scan en cours…" : `Prochain scan dans ${formatDuree(sv.dans ?? 0)}. L'IA n'est réinterrogée que si les alertes changent.`)
    : "Désactivée. Le tableau de bord doit rester ouvert dans la console pour surveiller.";
  $("#surv-notif").checked = lireLocal("sentinelle-notif") === "1" && "Notification" in window && Notification.permission === "granted";
}

function formatDuree(s) {
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m} min ${String(s % 60).padStart(2, "0")}` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
}

function rendreActions() {
  const ul = vider($("#actions"));
  if (!etat.actions.length) { ul.append(el("li", { class: "discret" }, "Aucune action exécutée depuis le démarrage.")); return; }
  for (const a of etat.actions) {
    ul.append(el("li", {}, el("span", { class: "discret" }, heure(a.ts)), " · ", el("b", {}, a.libelle), el("br"),
      el("span", { class: "discret" }, a.resultat)));
  }
}

const NS = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}, texte) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (texte !== undefined) n.textContent = texte;
  return n;
}

function rendreHistorique(points) {
  const zone = vider($("#historique"));
  const W = 320, H = 120, bas = 104, haut = 8, gauche = 22;
  if (!points.length) { zone.append(svg("text", { x: W / 2, y: H / 2, "text-anchor": "middle" }, "Pas encore d'historique")); return; }
  const max = Math.max(1, ...points.map((p) => p.CRITIQUE + p.ELEVE + p.MOYEN));
  const pas = (W - gauche) / Math.max(points.length, 12);
  const echelle = (bas - haut) / max;
  zone.append(svg("line", { x1: gauche, x2: W, y1: bas, y2: bas, class: "axe" }));
  zone.append(svg("text", { x: gauche - 4, y: haut + 6, "text-anchor": "end" }, max));
  zone.append(svg("text", { x: gauche - 4, y: bas, "text-anchor": "end" }, 0));
  points.forEach((p, i) => {
    const x = gauche + i * pas + pas * 0.15, l = Math.max(2, pas * 0.7);
    let y = bas;
    const g = svg("g");
    g.append(svg("title", {}, `${heure(p.ts, true)} — critique ${p.CRITIQUE}, élevé ${p.ELEVE}, moyen ${p.MOYEN}`));
    const total = p.CRITIQUE + p.ELEVE + p.MOYEN;
    if (!total) g.append(svg("rect", { x, y: bas - 2, width: l, height: 2, class: "zero", rx: 1 }));
    for (const gr of ["MOYEN", "ELEVE", "CRITIQUE"]) {
      if (!p[gr]) continue;
      const h = p[gr] * echelle;
      y -= h;
      g.append(svg("rect", { x, y: y + 0.5, width: l, height: Math.max(0, h - 1), class: gr, rx: 1.5 }));
    }
    zone.append(g);
  });
  zone.append(svg("text", { x: gauche, y: H - 2 }, heure(points[0].ts, true)));
  if (points.length > 1) zone.append(svg("text", { x: W, y: H - 2, "text-anchor": "end" }, heure(points[points.length - 1].ts, true)));
}

function rendreJournal(lignes) {
  const corps = vider($("#journal tbody"));
  for (const l of lignes) corps.append(el("tr", {}, el("td", {}, heure(l.ts, true)), el("td", {}, l.evenement), el("td", {}, l.detail)));
}

// ---------------------------------------------------------------------------------------
// Rafraîchissement et notifications
// ---------------------------------------------------------------------------------------

function verifierNouveautes() {
  const graves = etat.alertes.filter((a) => a.gravite === "CRITIQUE" || a.gravite === "ELEVE");
  const ids = new Set(graves.map((a) => a.id));
  if (idsGravesConnus && etat.dernier_scan) {
    const nouvelles = graves.filter((a) => !idsGravesConnus.has(a.id));
    if (nouvelles.length) {
      const texte = nouvelles.slice(0, 4).map((a) => `[${LIBELLES[a.gravite]}] ${a.titre}`).join("\n");
      toast(`${nouvelles.length} nouvelle(s) alerte(s) grave(s)`, nouvelles[0].gravite);
      if (lireLocal("sentinelle-notif") === "1" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Sentinelle — alerte sécurité", { body: texte, tag: "sentinelle" });
      }
    }
  }
  if (etat.dernier_scan) idsGravesConnus = ids;
}

async function rafraichir() {
  clearTimeout(minuteur);
  try {
    etat = await api("/api/etat");
    rendreEntete(); rendreBannieres(); rendreLMStudio(); rendreAlertes(); rendreAnalyse(); rendreSurveillance(); rendreActions();
    verifierNouveautes();
    if (scanPrecedent && !etat.scan_en_cours) { chargerSecondaire(); toast("Scan terminé."); }
    scanPrecedent = etat.scan_en_cours;
  } catch (e) {
    $("#statut-global").dataset.niveau = "inconnu";
    $("#statut-global").textContent = "HORS LIGNE";
    $("#meta").textContent = `Serveur injoignable : ${e.message}`;
  }
  minuteur = setTimeout(rafraichir, etat?.scan_en_cours ? 1500 : 5000);
}

async function chargerSecondaire() {
  try {
    const [h, j] = await Promise.all([api("/api/historique"), api("/api/journal")]);
    rendreHistorique(h); rendreJournal(j);
  } catch { /* affiché par rafraichir */ }
}

// ---------------------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------------------

async function lancerScan() {
  try {
    const r = await api("/api/scan", { ia: $("#opt-ia").checked });
    if (!r.ok) toast(r.message || "Scan impossible.");
  } catch (e) { toast(`Erreur : ${e.message}`, "ELEVE"); }
  rafraichir();
}

async function enregistrerReference() {
  if (!confirm("Enregistrer l'état actuel comme référence saine ?\n\nÀ faire uniquement si tu fais confiance à l'état actuel du PC : tout ce qui est ouvert maintenant sera considéré comme normal.")) return;
  try { await api("/api/reference", {}); toast("Référence enregistrée."); lancerScan(); }
  catch (e) { toast(`Erreur : ${e.message}`, "ELEVE"); }
}

async function majSurveillance() {
  try {
    await api("/api/surveillance", {
      active: $("#surv-active").checked, intervalle: Number($("#surv-intervalle").value), ia: $("#opt-ia").checked,
    });
    rafraichir();
  } catch (e) { toast(`Erreur : ${e.message}`, "ELEVE"); }
}

async function basculerNotifications() {
  const caseNotif = $("#surv-notif");
  if (!caseNotif.checked) { ecrireLocal("sentinelle-notif", "0"); return; }
  if (!("Notification" in window)) { toast("Notifications non prises en charge par ce navigateur."); caseNotif.checked = false; return; }
  const p = await Notification.requestPermission();
  ecrireLocal("sentinelle-notif", p === "granted" ? "1" : "0");
  caseNotif.checked = p === "granted";
  if (p !== "granted") toast("Notifications refusées par le navigateur.");
}

async function exporter() {
  try {
    const texte = await api("/api/rapport");
    const lien = el("a", { href: URL.createObjectURL(new Blob([texte], { type: "text/markdown" })),
      download: `rapport-sentinelle-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.md` });
    document.body.append(lien); lien.click(); lien.remove();
  } catch (e) { toast(`Erreur : ${e.message}`, "ELEVE"); }
}

function demanderAction(a) {
  alerteEnCours = a;
  $("#modale-titre").textContent = a.titre;
  $("#modale-libelle").textContent = a.action_libelle;
  $("#modale-commande").textContent = a.action_commande || "Arrêt du processus via psutil (le programme est revérifié juste avant).";
  $("#modale-saisie").value = "";
  $("#modale-ok").disabled = true;
  $("#modale").showModal();
  $("#modale-saisie").focus();
}

async function confirmerAction() {
  const a = alerteEnCours;
  if (!a || $("#modale-saisie").value !== "OUI") return;
  $("#modale").close();
  try {
    const r = await api("/api/action", { alerte_id: a.id, confirmation: "OUI" });
    toast(`${r.libelle} → ${r.resultat}`, /ÉCHEC|ANNULÉ/.test(r.resultat) ? "ELEVE" : "");
  } catch (e) { toast(`Erreur : ${e.message}`, "ELEVE"); }
  rafraichir(); chargerSecondaire();
}

function demarrer() {
  const m = location.hash.match(/jeton=([\w-]+)/);
  if (m) {
    jeton = m[1];
    ecrireStockage("sentinelle-jeton", jeton);
    history.replaceState(null, "", location.pathname); // retire le jeton de la barre d'adresse et de l'historique
  } else {
    jeton = lireStockage("sentinelle-jeton");
  }
  if (!jeton) {
    $("#statut-global").textContent = "JETON MANQUANT";
    $("#meta").textContent = "Ouvre le lien complet affiché dans la console (il contient #jeton=…).";
    return;
  }
  $("#opt-ia").checked = lireLocal("sentinelle-ia") !== "0";
  $("#opt-ia").addEventListener("change", () => ecrireLocal("sentinelle-ia", $("#opt-ia").checked ? "1" : "0"));
  $("#btn-scan").addEventListener("click", lancerScan);
  $("#btn-ref").addEventListener("click", enregistrerReference);
  $("#btn-export").addEventListener("click", exporter);
  $("#surv-active").addEventListener("change", majSurveillance);
  $("#surv-intervalle").addEventListener("change", majSurveillance);
  $("#surv-notif").addEventListener("change", basculerNotifications);
  $("#recherche").addEventListener("input", rendreAlertes);
  document.querySelectorAll("[data-filtre]").forEach((b) => b.addEventListener("click", () => {
    filtre = filtre === b.dataset.filtre && b.classList.contains("tuile") ? "TOUT" : b.dataset.filtre;
    rendreAlertes();
  }));
  $("#modale-saisie").addEventListener("input", (e) => { $("#modale-ok").disabled = e.target.value !== "OUI"; });
  $("#modale-saisie").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); confirmerAction(); } });
  $("#modale-ok").addEventListener("click", confirmerAction);
  $("#modale-annuler").addEventListener("click", () => $("#modale").close());
  rafraichir();
  chargerSecondaire();
  setInterval(chargerSecondaire, 30000);
}

demarrer();
