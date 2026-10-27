// De Gouden Klok: de klok toont de echte tijd in Gent, en een paar rustige animaties.
var rustig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var kanKijken = "IntersectionObserver" in window;

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

// ===== De grote klok =====
(function () {
  var klok = document.querySelector("[data-klok]");
  if (!klok) return;
  var uur = klok.querySelector("[data-uur]");
  var min = klok.querySelector("[data-min]");
  var sec = klok.querySelector("[data-sec]");
  var tekst = document.querySelector("[data-tijd]");
  var vorige = -1, rondjes = 0;

  function zet(t) {
    if (t.s < vorige) rondjes++;
    vorige = t.s;
    uur.style.transform = "rotate(" + ((t.u % 12) * 30 + t.m * 0.5) + "deg)";
    min.style.transform = "rotate(" + (t.m * 6 + t.s * 0.1) + "deg)";
    sec.style.transform = "rotate(" + ((rondjes * 60 + t.s) * 6) + "deg)";
    if (tekst) tekst.textContent = t.u + ":" + String(t.m).padStart(2, "0");
  }

  if (rustig) {
    zet(nuInGent());
    setInterval(function () { zet(nuInGent()); }, 1000);
    return;
  }
  // Bij het laden draaien de wijzers vanaf twaalf uur naar de juiste tijd
  [uur, min, sec].forEach(function (w) { w.style.transition = "none"; w.style.transform = "rotate(0deg)"; });
  if (tekst) { var t0 = nuInGent(); tekst.textContent = t0.u + ":" + String(t0.m).padStart(2, "0"); }
  setTimeout(function () {
    [uur, min].forEach(function (w) { w.style.transition = "transform 2.2s cubic-bezier(.6, 0, .2, 1)"; });
    sec.style.transition = "transform 2.2s cubic-bezier(.6, 0, .2, 1)";
    zet(nuInGent());
    setTimeout(function () {
      uur.style.transition = ""; min.style.transition = ""; sec.style.transition = "";
      setInterval(function () { zet(nuInGent()); }, 1000);
    }, 2300);
  }, 900);
})();

// ===== Kleine klokjes wijzen naar hun uur, titellijn tekent zich =====
(function () {
  var klokjes = document.querySelectorAll("[data-uurklok]");
  var titels = document.querySelectorAll(".titel.wacht");
  function wijs(k) { k.querySelector(".wijzer").style.transform = "rotate(" + k.getAttribute("data-uurklok") + "deg)"; }
  if (rustig || !kanKijken) {
    klokjes.forEach(wijs);
    titels.forEach(function (t) { t.classList.remove("wacht"); });
    return;
  }
  var io = new IntersectionObserver(function (items) {
    items.forEach(function (it) {
      if (!it.isIntersecting) return;
      var el = it.target;
      if (el.hasAttribute("data-uurklok")) wijs(el); else el.classList.remove("wacht");
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  klokjes.forEach(function (k) { io.observe(k); });
  titels.forEach(function (t) { io.observe(t); });
})();

// ===== Gerechten verschijnen een voor een =====
(function () {
  var lijst = document.querySelector("[data-gangen]");
  if (!lijst || rustig || !kanKijken) return;
  var items = lijst.querySelectorAll("li");
  items.forEach(function (li) { li.classList.add("wacht"); });
  var io = new IntersectionObserver(function (e) {
    e.forEach(function (it) {
      if (!it.isIntersecting) return;
      it.target.querySelectorAll("li").forEach(function (li, i) {
        li.style.transitionDelay = (i * 60) + "ms";
        li.classList.remove("wacht");
      });
      io.unobserve(it.target);
    });
  }, { threshold: 0.2 });
  lijst.querySelectorAll(".gang").forEach(function (g) { io.observe(g); });
})();

// ===== Cijfers tellen op =====
(function () {
  var cijfers = document.querySelectorAll("[data-tel]");
  if (rustig || !kanKijken) return;
  var io = new IntersectionObserver(function (e) {
    e.forEach(function (it) {
      if (!it.isIntersecting) return;
      var el = it.target, doel = +el.getAttribute("data-tel"), start = null;
      var van = doel > 1000 ? 1850 : 0;
      function stap(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1400, 1);
        p = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(van + (doel - van) * p);
        if (p < 1) requestAnimationFrame(stap);
      }
      requestAnimationFrame(stap);
      io.unobserve(el);
    });
  }, { threshold: 0.6 });
  cijfers.forEach(function (c) { io.observe(c); });
})();
