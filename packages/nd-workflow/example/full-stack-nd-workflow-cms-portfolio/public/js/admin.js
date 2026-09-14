/* Admin dashboard frontend */
let sessionToken = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', login);
  checkAuth();
});

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    if (res.ok) { const u = await res.json(); showDashboard(u); return; }
  } catch {}
  showLogin();
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (sessionToken) h['X-Session-Token'] = sessionToken;
  return h;
}

async function authFetch(url, options = {}) {
  const headers = { ...authHeaders(), ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    showLogin('Session expired. Please log in again.');
    return null;
  }
  return res;
}

async function login(e) {
  e.preventDefault();
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  const body = { username: document.getElementById('username').value, password: document.getElementById('password').value };
  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.style.display = 'block'; return; }
    sessionToken = null; // cookie-based
    showDashboard(data.user);
  } catch { errEl.textContent = 'Network error'; errEl.style.display = 'block'; }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() });
  sessionToken = null;
  showLogin();
}

function showLogin(msg) {
  document.getElementById('login-section').style.display = '';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'none';
  document.getElementById('user-info').textContent = '';
  const errEl = document.getElementById('login-error');
  if (msg) {
    errEl.textContent = msg;
    errEl.style.display = 'block';
  } else {
    errEl.style.display = 'none';
  }
}

function showDashboard(user) {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard').style.display = '';
  document.getElementById('logout-btn').style.display = '';
  document.getElementById('user-info').textContent = user.username;
  showSection('projects');
}

function showSection(name) {
  document.getElementById('projects-section').style.display = name === 'projects' ? '' : 'none';
  document.getElementById('posts-section').style.display = name === 'posts' ? '' : 'none';
  if (name === 'projects') loadAdminProjects();
  if (name === 'posts') loadAdminPosts();
}

function showForm(type) { document.getElementById(type + '-form').style.display = ''; }
function hideForm(type) { document.getElementById(type + '-form').style.display = 'none'; }

async function loadAdminProjects() {
  const res = await authFetch('/api/projects');
  if (!res) return;
  const projects = await res.json();
  const tbody = document.getElementById('proj-table');
  tbody.innerHTML = projects.map(p => `<tr>
    <td>${esc(p.title)}</td>
    <td>${(p.tags??[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</td>
    <td><button class="btn btn-danger" onclick="deleteProject('${p.id}')">Delete</button></td>
  </tr>`).join('');
}

async function saveProject() {
  const body = {
    title: document.getElementById('proj-title').value,
    description: document.getElementById('proj-desc').value,
    tags: document.getElementById('proj-tags').value.split(',').map(s=>s.trim()).filter(Boolean),
    liveUrl: document.getElementById('proj-live').value,
    repoUrl: document.getElementById('proj-repo').value,
  };
  const res = await authFetch('/api/admin/projects', { method: 'POST', body: JSON.stringify(body) });
  if (!res) return;
  hideForm('project');
  ['proj-title','proj-desc','proj-tags','proj-live','proj-repo'].forEach(id => document.getElementById(id).value = '');
  loadAdminProjects();
}

async function deleteProject(id) {
  const res = await authFetch('/api/admin/projects/' + id, { method: 'DELETE' });
  if (!res) return;
  loadAdminProjects();
}

async function loadAdminPosts() {
  const res = await authFetch('/api/admin/posts');
  if (!res) return;
  const posts = await res.json();
  const tbody = document.getElementById('post-table');
  tbody.innerHTML = posts.map(p => `<tr>
    <td>${esc(p.title)}</td>
    <td><span class="status-badge ${p.published?'status-published':'status-draft'}">${p.published?'Published':'Draft'}</span></td>
    <td><button class="btn btn-danger" onclick="deletePost('${p.id}')">Delete</button></td>
  </tr>`).join('');
}

async function savePost() {
  const body = {
    title: document.getElementById('post-title').value,
    body: document.getElementById('post-body').value,
    tags: document.getElementById('post-tags').value.split(',').map(s=>s.trim()).filter(Boolean),
    published: document.getElementById('post-published').value === 'true',
  };
  const res = await authFetch('/api/admin/posts', { method: 'POST', body: JSON.stringify(body) });
  if (!res) return;
  hideForm('post');
  ['post-title','post-body','post-tags'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('post-published').value = 'false';
  loadAdminPosts();
}

async function deletePost(id) {
  const res = await authFetch('/api/admin/posts/' + id, { method: 'DELETE' });
  if (!res) return;
  loadAdminPosts();
}

function esc(s) { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }
