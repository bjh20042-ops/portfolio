/* ============================================================
   render.js — data/portfolio.json 을 읽어 페이지를 그린다.
   내용 수정은 JSON만 하면 됨. 이 파일은 거의 건드릴 일 없음.
   ============================================================ */

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function loadData() {
  const res = await fetch("./data/portfolio.json", { cache: "no-store" });
  if (!res.ok) throw new Error("portfolio.json 로드 실패: " + res.status);
  return res.json();
}

function renderNav(d) {
  document.querySelector("[data-brand-name]").textContent = "BJH";
  const links = d.nav.map(n => `<a href="#${esc(n.id)}" data-nav="${esc(n.id)}">${esc(n.label)}</a>`).join("");
  document.querySelector("[data-nav-links]").innerHTML = links;
}

function renderHero(d) {
  const h = d.hero;
  document.querySelector("[data-hero-eyebrow]").textContent = h.eyebrow;
  document.querySelector("[data-hero-lines]").innerHTML =
    h.lines.map(l => `<span class="l"><span>${esc(l)}</span></span>`).join("");
  document.querySelector("[data-hero-intro]").textContent = h.intro;
  document.querySelector("[data-hero-cta]").innerHTML = `
    <a class="btn primary" href="${esc(h.ctaPrimary.href)}">${esc(h.ctaPrimary.label)} <span class="arr">↓</span></a>
    <a class="btn" href="${esc(h.ctaSecondary.href)}">${esc(h.ctaSecondary.label)} <span class="arr">→</span></a>
    <a class="btn" href="${esc(h.ctaGithub.href)}" target="_blank" rel="noreferrer">${esc(h.ctaGithub.label)} <span class="arr">↗</span></a>`;

  // side panel
  const facts = [
    ["Name", d.meta.name + " · " + d.meta.nameEn],
    ["Goal", "자동차 공장 자동화 (FA)"],
    ["Now", "프로그래밍 학습 중"],
    ["Base", "GitHub Pages"]
  ];
  document.querySelector("[data-hero-panel]").innerHTML = `
    <div class="ttl"><span class="mark">${esc(d.meta.name)}</span><span class="badge">OPEN TO WORK</span></div>
    <dl>${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>`;
}

function renderAbout(d) {
  const a = d.about;
  setHead("about", a.eyebrow, "01", a.heading || "About");
  document.querySelector("[data-about-lead]").textContent = a.title;
  document.querySelector("[data-about-body]").textContent = a.body;
  document.querySelector("[data-about-stack]").innerHTML =
    a.stack.map(s => `<span class="chip">${esc(s)}</span>`).join("");
  document.querySelector("[data-about-facts]").innerHTML =
    a.facts.map(f => `<div class="row"><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join("");
}

function renderEducation(d) {
  const e = d.education;
  setHead("education", e.eyebrow, "02", e.title);
  document.querySelector("[data-edu]").innerHTML = e.items.map(it => `
    <div class="edu-card reveal">
      <div>
        <h3>${esc(it.school)}</h3>
        <p class="dept">${esc(it.dept)}</p>
        <p class="period">${esc(it.period)}</p>
        <div class="edu-courses">${it.courses.map(c => `<span class="chip">${esc(c)}</span>`).join("")}</div>
      </div>
      <div class="edu-meta">
        <div class="gpa">${esc(it.gpa.split("/")[0].trim())}<small> / ${esc(it.gpa.split("/")[1].trim())}</small></div>
        <div class="yr">${esc(it.year)}</div>
      </div>
    </div>`).join("");
}

function renderSkills(d) {
  const s = d.skills;
  setHead("skills", s.eyebrow, "03", s.title, s.note);
  document.querySelector("[data-skills]").innerHTML = s.groups.map((g, gi) => `
    <div class="skill-card reveal" data-d="${gi + 1}">
      <h3>${esc(g.label)}</h3>
      ${g.items.map(it => `
        <div class="skill-row">
          <div class="top"><span class="n">${esc(it.name)}</span><span class="lv">${esc(it.level)}</span></div>
          <div class="bar"><i data-pct="${Number(it.pct) || 0}"></i></div>
        </div>`).join("")}
    </div>`).join("");
}

function renderProjects(d) {
  const p = d.projects;
  setHead("projects", p.eyebrow, "04", p.title, p.note);
  document.querySelector("[data-projects]").innerHTML = p.items.map(it => {
    const links = [];
    links.push(it.github
      ? `<a class="accent" href="${esc(it.github)}" target="_blank" rel="noreferrer">GitHub ↗</a>`
      : `<span class="muted">GitHub — 준비 중</span>`);
    links.push(it.demo
      ? `<a class="accent" href="${esc(it.demo)}" target="_blank" rel="noreferrer">Demo ↗</a>`
      : `<span class="muted">Demo — 준비 중</span>`);

    return `
    <article class="proj reveal">
      <div class="proj-head">
        <div>
          <h3>${esc(it.title)}</h3>
          <p class="summary">${esc(it.summary)}</p>
        </div>
        <div style="display:flex;gap:1rem;align-items:flex-start;">
          <span class="status">${esc(it.status)}</span>
          <span class="idx">${esc(it.index)}</span>
        </div>
      </div>
      <div class="proj-body">
        <div class="proj-field">
          <h4>Period</h4><p>${esc(it.period)}</p>
          <h4 style="margin-top:1.4rem">Role</h4><p>${esc(it.role)}</p>
          <h4 style="margin-top:1.4rem">Tech Stack</h4>
          <div class="proj-stack">${it.stack.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        </div>
        <div class="proj-field">
          <h4>Key Features</h4>
          <ul>${it.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
          ${it.goals && it.goals.length ? `
            <h4 style="margin-top:1.4rem">Target Metrics <span style="color:var(--ink-4)">· 설계 목표</span></h4>
            <div class="goals"><ul>${it.goals.map(g => `<li>${esc(g)}</li>`).join("")}</ul></div>` : ""}
        </div>
        <div class="proj-links">${links.join("")}</div>
      </div>
    </article>`;
  }).join("");
}

function renderExperience(d) {
  const e = d.experience;
  setHead("experience", e.eyebrow, "05", e.title);
  const wrap = document.querySelector("[data-experience]");
  let html = e.note ? `<p class="exp-note reveal">${esc(e.note)}</p>` : "";
  html += `<div style="display:grid;gap:1.2rem">` + e.items.map(it => `
    <div class="exp-item reveal">
      <div class="top"><h3>${esc(it.title)}</h3><span class="period">${esc(it.period)}</span></div>
      <ul>${it.points.map(pt => {
        const m = String(pt).match(/^([^:：]+[:：])([\s\S]*)$/);
        return m ? `<li><strong>${esc(m[1])}</strong>${esc(m[2])}</li>` : `<li>${esc(pt)}</li>`;
      }).join("")}</ul>
    </div>`).join("") + `</div>`;
  wrap.innerHTML = html;
}

function renderCareer(d) {
  const c = d.career;
  setHead("career", c.eyebrow, "06", c.title);
  document.querySelector("[data-career]").innerHTML = c.items.map((it, i) => `
    <div class="career-card reveal" data-d="${i + 1}">
      <span class="num">0${i + 1}</span>
      <h3>${esc(it.title)}</h3>
      <p>${esc(it.desc)}</p>
    </div>`).join("");
}

function renderContact(d) {
  const c = d.contact;
  setHead("contact", c.eyebrow, "07", c.title);
  document.querySelector("[data-contact-body]").textContent = c.body;
  document.querySelector("[data-contact-list]").innerHTML = c.items.map(it => `
    <a href="${esc(it.href)}" ${it.href.startsWith("http") ? 'target="_blank" rel="noreferrer"' : ""}>
      <span class="lbl">${esc(it.label)}</span>
      <span class="val">${esc(it.value)} <span style="color:var(--ink-4)">↗</span></span>
    </a>`).join("");
  document.querySelector("[data-contact-resume]").setAttribute("href", c.resume);
}

function renderFooter(d) {
  const fname = d.meta.footerName || d.meta.name;
  document.querySelector("[data-footer-copy]").textContent = `© ${d.meta.year} ${fname}`;
}

// shared: section head
function setHead(id, eyebrow, idx, title, note) {
  const sec = document.getElementById(id);
  const head = sec.querySelector("[data-head]");
  head.querySelector("[data-idx]").textContent = `${idx} —`;
  head.querySelector("[data-eyebrow]").textContent = eyebrow;
  const t = sec.querySelector("[data-title]");
  if (t) t.textContent = title || "";
  const n = head.querySelector("[data-note]");
  if (n) { if (note) { n.textContent = note; n.style.display = ""; } else n.style.display = "none"; }
}

(async function init() {
  try {
    const d = await loadData();
    document.title = `${d.meta.name} — ${d.meta.role}`;
    renderNav(d);
    renderHero(d);
    renderAbout(d);
    renderEducation(d);
    renderSkills(d);
    renderProjects(d);
    renderExperience(d);
    renderCareer(d);
    renderContact(d);
    renderFooter(d);
    document.dispatchEvent(new CustomEvent("content:ready"));
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="padding:4rem;font-family:monospace;color:#f2f4f7">
      <h1 style="color:#ffb528">데이터 로드 오류</h1>
      <p>data/portfolio.json 을 확인하세요. (로컬에서 file:// 로 열면 fetch가 막힙니다 — 로컬 서버로 여세요.)</p>
      <pre style="color:#7f8893">${esc(err.message)}</pre></div>`;
  }
})();
