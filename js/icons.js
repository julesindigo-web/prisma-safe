/* PRISMA-SAFE — pustaka ikon SVG premium (garis 1.8px, sudut bulat).
   Nol dependensi, nol emoji: seluruh chrome UI memakai window.ic(nama). */
(function(){
"use strict";
var I = {
dashboard: "<rect x='3' y='3' width='7' height='9' rx='1.5'/><rect x='14' y='3' width='7' height='5' rx='1.5'/><rect x='14' y='12' width='7' height='9' rx='1.5'/><rect x='3' y='16' width='7' height='5' rx='1.5'/>",
report: "<path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'/><path d='M14 3v5h5'/><path d='M9 13h6M9 17h4'/>",
inspect: "<rect x='6' y='4' width='12' height='17' rx='2'/><path d='M9 4V2h6v2'/><path d='M9 13l2 2 4-4'/>",
pica: "<circle cx='12' cy='12' r='8'/><path d='M12 2v4M12 18v4M2 12h4M18 12h4'/>",
incident: "<path d='M12 3L2 20h20z'/><path d='M12 9v5'/><path d='M12 17h.01'/>",
risk: "<path d='M3 12h4l3 8 4-16 3 8h4'/>",
jsa: "<rect x='6' y='4' width='12' height='17' rx='2'/><path d='M9 4V2h6v2'/><path d='M9 10h6M9 14h6M9 18h4'/>",
induction: "<path d='M2 9l10-5 10 5-10 5z'/><path d='M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5'/><path d='M22 9v6'/>",
p2h: "<rect x='2' y='6' width='12' height='10' rx='1'/><path d='M14 10h4l4 4v2h-8v-6z'/><circle cx='7' cy='18' r='1.8'/><circle cx='17.5' cy='18' r='1.8'/>",
permit: "<path d='M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'/><path d='M14 3v5h5'/><path d='M9 15l2 2 4-4'/>",
users: "<circle cx='9' cy='8' r='3.5'/><path d='M2.5 20a6.5 6.5 0 0 1 13 0'/><path d='M16 5a3.5 3.5 0 0 1 0 7'/><path d='M17.5 14.5a6.5 6.5 0 0 1 4 5.5'/>",
clinic: "<path d='M12 20.5S3.5 15.4 3.5 9.6A4.6 4.6 0 0 1 8.1 5c1.9 0 3.1 1 3.9 2 .8-1 2-2 3.9-2a4.6 4.6 0 0 1 4.6 4.6c0 5.8-8.5 10.9-8.5 10.9z'/><path d='M6.5 12h3l1.5-2.5 2 4.5 1.5-2H18'/>",
mcu: "<path d='M12 20.5S3.5 15.4 3.5 9.6A4.6 4.6 0 0 1 8.1 5c1.9 0 3.1 1 3.9 2 .8-1 2-2 3.9-2a4.6 4.6 0 0 1 4.6 4.6c0 5.8-8.5 10.9-8.5 10.9z'/>",
apd: "<path d='M4 17a8 8 0 0 1 5-7.4V6h6v3.6A8 8 0 0 1 20 17'/><path d='M2 17h20'/><path d='M12 6V3.5'/>",
program: "<circle cx='12' cy='12' r='9'/><circle cx='12' cy='12' r='5'/><circle cx='12' cy='12' r='1.2' fill='currentColor' stroke='none'/>",
mom: "<path d='M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-3-.4-4.2-1L3 20l1.2-4.1A8.5 8.5 0 1 1 21 11.5z'/><path d='M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01'/>",
regulasi: "<path d='M3 9l9-6 9 6'/><path d='M4 9v10M20 9v10M8 12v5M12 12v5M16 12v5M2 21h20'/>",
dokumen: "<path d='M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/>",
hazard: "<path d='M13 2L4 14h6l-1 8 9-12h-6z'/>",
units: "<path d='M21 8l-9-5-9 5v8l9 5 9-5z'/><path d='M3 8l9 5 9-5'/><path d='M12 13v8'/>",
fatigue: "<path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'/>",
tele: "<path d='M4 15a8 8 0 1 1 16 0'/><path d='M12 15l4-5'/><path d='M2 15h2M20 15h2M2 19h20'/>",
manhours: "<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 3'/>",
muster: "<path d='M5 21V4'/><path d='M5 4h12l-2.5 4L17 12H5'/>",
sos: "<path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'/><path d='M10.3 21a2 2 0 0 0 3.4 0'/>",
sertifikasi: "<circle cx='12' cy='9' r='6'/><path d='M8.5 14L7 22l5-3 5 3-1.5-8'/>",
smkp: "<path d='M3 3v18h18'/><path d='M8 16v-5M13 16V8M18 16v-8'/>",
settings: "<path d='M4 8h10M18 8h2M4 16h2M10 16h10'/><circle cx='16' cy='8' r='2.2'/><circle cx='8' cy='16' r='2.2'/>",
plus: "<path d='M12 5v14M5 12h14'/>",
download: "<path d='M12 3v12'/><path d='M7 10l5 5 5-5'/><path d='M4 17v3h16v-3'/>",
upload: "<path d='M12 15V3'/><path d='M7 8l5-5 5 5'/><path d='M4 17v3h16v-3'/>",
printer: "<path d='M7 8V3h10v5'/><path d='M7 17H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-3'/><rect x='7' y='13' width='10' height='8' rx='1'/>",
x: "<path d='M6 6l12 12M18 6L6 18'/>",
check: "<path d='M4 12.5l5 5L20 6.5'/>",
chevL: "<path d='M14 6l-6 6 6 6'/>",
chevR: "<path d='M10 6l6 6-6 6'/>",
pin: "<path d='M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z'/><circle cx='12' cy='10' r='2.5'/>",
camera: "<rect x='2' y='7' width='20' height='13' rx='2'/><path d='M8 7l1.5-3h5L16 7'/><circle cx='12' cy='13' r='3.5'/>",
sync: "<path d='M21 12a9 9 0 1 1-2.6-6.4'/><path d='M21 3v6h-6'/>",
shield: "<path d='M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z'/><path d='M9 12l2 2 4-4'/>",
phone: "<path d='M5 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'/>",
share: "<circle cx='6' cy='12' r='2.5'/><circle cx='18' cy='6' r='2.5'/><circle cx='18' cy='18' r='2.5'/><path d='M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6'/>",
chart: "<path d='M3 3v18h18'/><path d='M7 14l4-4 3 3 5-6'/>",
eye: "<path d='M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z'/><circle cx='12' cy='12' r='2.8'/>",
clock: "<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 3'/>"
};
function ic(n, c){
  return '<svg class="ic ' + (c || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[n] || "") + "</svg>";
}
window.ICONS = I;
window.ic = ic;
})();
