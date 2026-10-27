// De gouden klok toont de echte tijd in Gent.
(function () {
  var klok = document.querySelector("[data-klok]");
  var tekst = document.querySelector("[data-tijd]");
  if (!klok) return;
  var uur = klok.querySelector("[data-uur]");
  var min = klok.querySelector("[data-min]");
  var sec = klok.querySelector("[data-sec]");
  var vorige = -1, rondjes = 0;

  function nuInGent() {
    try {
      var d = {};
      new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
        .formatToParts(new Date()).forEach(function (p) { d[p.type] = p.value; });
      return { u: +d.hour, m: +d.minute, s: +d.second };
    } catch (e) {
      var n = new Date();
      return { u: n.getHours(), m: n.getMinutes(), s: n.getSeconds() };
    }
  }

  function tik() {
    var t = nuInGent();
    if (t.s < vorige) rondjes++;
    vorige = t.s;
    uur.style.transform = "rotate(" + ((t.u % 12) * 30 + t.m * 0.5) + "deg)";
    min.style.transform = "rotate(" + (t.m * 6 + t.s * 0.1) + "deg)";
    sec.style.transform = "rotate(" + ((rondjes * 60 + t.s) * 6) + "deg)";
    if (tekst) tekst.textContent = t.u + ":" + String(t.m).padStart(2, "0");
  }
  tik();
  setInterval(tik, 1000);
})();
