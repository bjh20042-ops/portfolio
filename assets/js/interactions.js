/* ============================================================
   interactions.js — 디테일 전부 (커서/스크롤/네비/탑버튼)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  // ---------- hero load ----------
  requestAnimationFrame(() => document.body.classList.add("loaded"));

  // ---------- live local clock (footer) ----------
  const clockEl = document.querySelector("[data-clock]");
  if (clockEl) {
    const tick = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      clockEl.textContent = `${h}:${m}${ampm} Local`;
    };
    tick();
    setInterval(tick, 1000 * 10);
  }

  // ---------- header scrolled state + to-top progress ----------
  const header = document.querySelector(".site-header");
  const toTop = document.querySelector(".to-top");
  const ring = toTop ? toTop.querySelector(".ring circle") : null;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);
    if (toTop) toTop.classList.toggle("show", y > 600);
    if (ring) {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(y / max, 1) : 0;
      ring.style.strokeDashoffset = String(1 - p);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- mobile nav toggle ----------
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("[data-nav-links]");
  if (toggle && navLinks) {
    toggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  // ---------- custom cursor (desktop only) ----------
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    const dot = document.createElement("div"); dot.className = "cursor-dot";
    const ringEl = document.createElement("div"); ringEl.className = "cursor-ring";
    document.body.append(dot, ringEl);
    let rx = 0, ry = 0, mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function trail() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ringEl.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(trail);
    })();
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .proj, .career-card")) ringEl.classList.add("hot");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .proj, .career-card")) ringEl.classList.remove("hot");
    });
  }

  // ---------- after content rendered: observers ----------
  function setupObservers() {

    const reveals = document.querySelectorAll(".reveal");

    // 모션 비선호 사용자는 애니메이션 없이 즉시 표시
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("in"));
      setupSpyAndSkills();
      return;
    }

    // 숨김 상태 활성화 (이 클래스 없으면 콘텐츠는 항상 보임)
    document.body.classList.add("reveal-on");

    // reveal-on-scroll — 요소 윗부분이 화면 하단에 닿기 전에 미리 트리거
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: "200px 0px 200px 0px" });
    reveals.forEach((el) => io.observe(el));

    // 안전 폴백: 2.5초 뒤 아직 안 보이는 reveal은 위치 상관없이 전부 표시.
    // 포트폴리오에서 콘텐츠가 안 보이는 일은 절대 없어야 함.
    setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
    }, 2500);

    setupSpyAndSkills();
  }

  function setupSpyAndSkills() {
    // skill bars fill when skills section enters
    const skills = document.getElementById("skills");
    if (skills) {
      const sIo = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            skills.querySelectorAll(".bar i").forEach((b, i) => {
              setTimeout(() => { b.style.width = (b.dataset.pct || 0) + "%"; }, i * 90);
            });
            sIo.disconnect();
          }
        });
      }, { threshold: 0.3 });
      sIo.observe(skills);
    }

    // scrollspy — active nav link
    const navAnchors = [...document.querySelectorAll("[data-nav]")];
    const sections = navAnchors
      .map((a) => document.getElementById(a.dataset.nav))
      .filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          const id = en.target.id;
          navAnchors.forEach((a) => a.classList.toggle("active", a.dataset.nav === id));
        }
      });
    }, { threshold: 0.4, rootMargin: "-20% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  // content:ready 가 이미 발생했을 수도 있으므로 양쪽 다 대비
  if (document.querySelector(".reveal")) {
    setupObservers();
  } else {
    document.addEventListener("content:ready", setupObservers, { once: true });
  }
});
