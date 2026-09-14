/* Public portfolio frontend */
document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
  await loadPosts();
});

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  try {
    const res = await fetch('/api/projects');
    const projects = await res.json();
    if (!projects.length) { grid.innerHTML = '<p>No projects yet.</p>'; return; }
    grid.innerHTML = projects.map(p => `
      <div class="card">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="tags">${(p.tags ?? []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="links">
          ${p.liveUrl ? `<a href="${esc(p.liveUrl)}" target="_blank">Live</a>` : ''}
          ${p.repoUrl ? `<a href="${esc(p.repoUrl)}" target="_blank">Source</a>` : ''}
        </div>
      </div>
    `).join('');
  } catch { grid.innerHTML = '<p>Could not load projects.</p>'; }
}

async function loadPosts() {
  const list = document.getElementById('posts-list');
  if (!list) return;
  try {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    if (!posts.length) { list.innerHTML = '<p>No posts yet.</p>'; return; }
    list.innerHTML = posts.map(p => `
      <div class="post-item">
        <h3>${esc(p.title)}</h3>
        <span class="date">${new Date(p.createdAt).toLocaleDateString()}</span>
        <p>${esc((p.body ?? '').slice(0, 200))}${(p.body ?? '').length > 200 ? '...' : ''}</p>
      </div>
    `).join('');
  } catch { list.innerHTML = '<p>Could not load posts.</p>'; }
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}
