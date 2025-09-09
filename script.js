// script.js — small client-side renderer (no build step)
document.addEventListener('DOMContentLoaded', () => {
  // set current year in footers
  document.querySelectorAll('[id^="currentYear"]').forEach(el => el.textContent = new Date().getFullYear());

  // initialize per-page render
  if (document.getElementById('projectsGrid')) loadProjects();
  if (document.getElementById('newsList')) loadNewsletters();
  if (document.getElementById('membersGrid')) loadMembers();

  // search filter
  const search = document.getElementById('searchProjects');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('#projectsGrid .project-card').forEach(card => {
        const title = card.dataset.title.toLowerCase();
        const tags = card.dataset.tags.toLowerCase();
        card.style.display = (title.includes(q) || tags.includes(q)) ? '' : 'none';
      });
    });
  }
});

// fetch helper
async function getJSON(url){ const res = await fetch(url); return res.ok ? res.json() : null; }

/* ---------- Projects ---------- */
async function loadProjects(){
  const data = await getJSON('assets/data/projects.json');
  if (!data) return;
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = data.map(p => projectCardHTML(p)).join('');
  // attach click handlers (delegation)
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-projid]');
    if (!btn) return;
    const id = btn.dataset.projid;
    const project = data.find(x => x.id === id);
    if (project) openProjectModal(project);
  });
}

function projectCardHTML(p){
  const tags = (p.tags || []).join(', ');
  const short = p.shortDescription || '';
  const img = (p.images && p.images[0]) ? p.images[0] : 'assets/images/avatar-placeholder.png';
  return `
    <div class="col-md-4 project-card" data-title="${escapeHtml(p.title)}" data-tags="${escapeHtml(tags)}">
      <div class="card h-100 shadow-sm">
        <img src="${img}" class="card-img-top" alt="${escapeHtml(p.title)}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(p.title)}</h5>
          <p class="card-text text-muted small">${escapeHtml(short)}</p>
          <div class="mt-auto">
            <button class="btn btn-primary" data-projid="${p.id}">Read more</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openProjectModal(project){
  document.getElementById('projectModalTitle').textContent = project.title || 'Project';
  document.getElementById('projectModalDescription').textContent = project.description || '';
  const inner = document.getElementById('projectCarouselInner');
  const images = project.images && project.images.length ? project.images : ['assets/images/avatar-placeholder.png'];
  inner.innerHTML = images.map((src, i) => `
    <div class="carousel-item ${i === 0 ? 'active' : ''}">
      <img src="${src}" class="d-block w-100" alt="${escapeHtml(project.title)} image ${i+1}" style="max-height:500px;object-fit:cover;">
    </div>
  `).join('');
  // reset carousel to first slide
  const carouselElem = document.getElementById('projectCarousel');
  const carousel = bootstrap.Carousel.getInstance(carouselElem);
  if (carousel) carousel.to(0);
  else new bootstrap.Carousel(carouselElem, {ride:false});

  const modal = new bootstrap.Modal(document.getElementById('projectModal'));
  modal.show();
}

/* ---------- Newsletters ---------- */
async function loadNewsletters(){
  const data = await getJSON('assets/data/newsletters.json');
  if (!data) return;
  const el = document.getElementById('newsList');
  el.innerHTML = data.map(n => `
    <div class="col-12">
      <div class="card news-card p-3">
        <div class="d-flex justify-content-between">
          <div>
            <h5>${escapeHtml(n.title)} <small class="text-muted">— ${escapeHtml(n.date)}</small></h5>
            <p class="mb-1">${escapeHtml(n.description || '')}</p>
          </div>
          <div class="text-end">
            <a class="btn btn-outline-primary" href="${n.file}" target="_blank" rel="noopener">View / Download</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ---------- Members ---------- */
async function loadMembers(){
  const data = await getJSON('assets/data/members.json');
  if (!data) return;
  const grid = document.getElementById('membersGrid');
  grid.innerHTML = data.map(m => `
    <div class="col">
      <div class="card h-100 text-center p-3">
        <img src="${m.avatar || 'assets/images/avatar-placeholder.png'}" alt="${escapeHtml(m.name)}" class="rounded-circle mb-2" style="width:88px;height:88px;object-fit:cover;">
        <div class="card-body p-1">
          <h6 class="mb-0">${escapeHtml(m.name)}</h6>
          <small class="text-muted">${escapeHtml(m.role || '')}</small>
        </div>
      </div>
    </div>
  `).join('');
}

/* ---------- Utilities ---------- */
function escapeHtml(s = '') {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
