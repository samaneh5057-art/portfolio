/* ============================================================
   PROJECTS — add your real projects here. The grid always shows
   at least 4 cards: each real project replaces one empty card
   (in order); the rest stay as "Project Coming Soon".
   Example entry (all fields optional except title):
   { title: "Name", description: "What it does.", tags: ["Node.js","PostgreSQL"],
     image: "assets/images/project-1.jpg",
     github: "https://github.com/...", live: "https://..." }
   ============================================================ */
const PROJECTS = [];
const MIN_CARDS = 4;

document.documentElement.classList.add("js");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Footer year */
$("#year").textContent = new Date().getFullYear();

/* ---------- Render projects (safe: uses textContent) ---------- */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
}
function projectCard(p, n) {
  const num = String(n).padStart(2, "0");
  const card = el("article", "pcard");
  const thumb = el("div", "pcard__thumb");
  thumb.append(el("span", "pcard__num", num));
  const body = el("div", "pcard__body");

  if (!p) {
    // Empty, ready-to-fill card
    card.classList.add("pcard--empty");
    card.setAttribute("aria-label", `Project ${num} — coming soon`);
    thumb.classList.add("is-blank");
    const label = el("div", "pcard__label");
    const pill = el("span");
    pill.append(el("i"), document.createTextNode("Project Coming Soon"));
    label.append(pill);
    thumb.append(label);
    body.setAttribute("aria-hidden", "true");
    body.append(el("span", "sk sk--t"), el("span", "sk sk--w"), el("span", "sk sk--s"));
  } else {
    if (p.image) {
      const img = el("img");
      img.src = p.image; img.alt = p.title + " preview"; img.loading = "lazy";
      thumb.append(img);
    } else thumb.classList.add("is-blank");
    body.append(el("h3", "", p.title));
    if (p.description) body.append(el("p", "", p.description));
    if (p.tags?.length) {
      const t = el("div", "tags");
      p.tags.forEach(x => t.append(el("span", "", x)));
      body.append(t);
    }
    const links = el("div", "plinks");
    [["GitHub", p.github], ["Live Demo", p.live]].forEach(([label, href]) => {
      if (!href) return;
      const a = el("a", "", label + " ↗");
      a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
      links.append(a);
    });
    if (links.children.length) body.append(links);
  }
  card.append(thumb, body);
  return card;
}
function renderProjects() {
  const root = $("#projects-root");
  root.textContent = "";
  const grid = el("div", "pgrid");
  const total = Math.max(MIN_CARDS, PROJECTS.length);
  for (let i = 0; i < total; i++) grid.append(projectCard(PROJECTS[i], i + 1));
  root.append(grid);
}
renderProjects();

/* ---------- Navbar: scroll state ---------- */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 24);
onScroll();
addEventListener("scroll", onScroll, { passive: true });

/* ---------- Mobile menu ---------- */
const burger = $("#burger"), menu = $("#menu");
function setMenu(open) {
  burger.classList.toggle("open", open);
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
$$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => e.key === "Escape" && setMenu(false));
matchMedia("(min-width: 821px)").addEventListener("change", () => setMenu(false));

/* ---------- Active section indicator ---------- */
const links = $$(".nav__link");
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* ---------- Scroll reveal (with light stagger) ---------- */
$$(".reveal").forEach(n => {
  const sibs = $$(".reveal", n.parentElement);
  n.style.setProperty("--d", (sibs.indexOf(n) * 0.09) + "s");
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
$$(".reveal").forEach(n => io.observe(n));

/* ---------- Ambient light follows pointer + magnetic buttons + cursor ---------- */
if (finePointer && !reduce) {
  const root = document.documentElement;
  let tx = innerWidth * .7, ty = innerHeight * .2, cx = tx, cy = ty;

  // Custom cursor
  document.body.classList.add("has-cursor");
  const cursor = el("div", "cursor");
  const ring = el("div", "cursor__ring"), dot = el("div", "cursor__dot");
  cursor.append(ring, dot); document.body.append(cursor);
  let rx = 0, ry = 0, mx = 0, my = 0;

  addEventListener("pointermove", e => {
    mx = tx = e.clientX; my = ty = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
  }, { passive: true });

  (function loop() {
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    rx += (mx - rx) * .18; ry += (my - ry) * .18;
    root.style.setProperty("--mx", cx + "px");
    root.style.setProperty("--my", cy + "px");
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();

  // Cursor hover state (delegated, so dynamically created links work too)
  document.addEventListener("pointerover", e => cursor.classList.toggle("hover", !!e.target.closest("a, button")));

  // Magnetic buttons
  $$(".magnetic").forEach(b => {
    b.addEventListener("pointermove", e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });
}
