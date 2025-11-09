async function loadJSON(file) {
  const response = await fetch(file);
  return await response.json();
}

async function loadData() {
  const comments = await loadJSON('data/comments.json');
  const releases = await loadJSON('data/releases.json');

  const commentsList = document.getElementById('comments-list');
  const releasesList = document.getElementById('releases-list');

  commentsList.innerHTML = '';
  releasesList.innerHTML = '';

  comments.forEach(c => {
    const el = document.createElement('div');
    el.className = 'comment';
    el.innerHTML = `
      <img src="${c.thumbnail}" alt="icon">
      <h3>${c.username}</h3>
      <p>${c.text}</p>
      <small>Репозиторий: ${c.repo}</small>
    `;
    commentsList.appendChild(el);
  });

  releases.forEach(r => {
    const el = document.createElement('div');
    el.className = 'release';
    el.innerHTML = `
      <h3>${r.name}</h3>
      <p>Версия: ${r.version}</p>
      <small>${r.date}</small>
    `;
    releasesList.appendChild(el);
  });
}

loadData();
setInterval(loadData, 600000); // автообновление каждые 10 минут