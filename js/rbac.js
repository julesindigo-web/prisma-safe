/* PRISMA-SAFE — peran lokal / RBAC-lite (Fase 1).
   Hierarki: Operator < Supervisor < Safety Officer < KTT < Admin; Auditor read-only.
   Batas jujur: penegakan sisi-klien untuk kerapian alur kerja, BUKAN keamanan
   server — pelaku jahat dengan akses perangkat dapat mem-bypass. RBAC sungguhan
   butuh backend otentikasi (di luar cakupan tanpa server). */
(function(){
"use strict";
var ROLES = ["Operator", "Supervisor", "Safety Officer", "KTT", "Auditor", "Admin"];
var RULES = {
  add:      ["Operator", "Supervisor", "Safety Officer", "KTT", "Admin"],
  edit:     ["Operator", "Supervisor", "Safety Officer", "KTT", "Admin"],
  check:    ["Operator", "Supervisor", "Safety Officer", "KTT", "Admin"],
  del:      ["Safety Officer", "KTT", "Admin"],
  approve1: ["Supervisor", "Safety Officer", "KTT", "Admin"],
  approve2: ["Safety Officer", "KTT", "Admin"],
  approve3: ["KTT", "Admin"],
  verify:   ["Safety Officer", "KTT", "Admin"],
  reset:    ["KTT", "Admin"]
};
function role(){ try{ return localStorage.getItem("prismasafe.role") || "Safety Officer"; }catch(_){ return "Safety Officer"; } }
function can(a){ var r = RULES[a] || RULES.edit; return r.indexOf(role()) >= 0; }
function denyMsg(a){ return "Peran “" + role() + "” tak berhak: " + a + ". Ganti peran di bar atas bila berwenang."; }
function set(r){
  if(ROLES.indexOf(r) < 0) return;
  try{ localStorage.setItem("prismasafe.role", r); }catch(_){}
  if(window.PSAUDIT) window.PSAUDIT.log("role", "sistem", "-", "peran → " + r);
  toast("Peran aktif: " + r + ".", "ok");
  setTimeout(function(){ location.reload(); }, 350);
}
function init(){
  var s = document.getElementById("roleSel"); if(!s) return;
  s.innerHTML = ROLES.map(function(r){ return '<option' + (r === role() ? " selected" : "") + ">" + r + "</option>"; }).join("");
  s.addEventListener("change", function(){ set(s.value); });
}
window.RBAC = { roles: ROLES, role: role, can: can, deny: denyMsg, set: set, init: init };
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
