// .github/workflows/update-comments.js
import fs from "fs";
import fetch from "node-fetch";

const GITHUB_USER = "EEee1406"; // твой ник или организация
const TOKEN = process.env.GITHUB_TOKEN; // токен создаст сам GitHub Actions
const HEADERS = { 
  Authorization: `token ${TOKEN}`, 
  "User-Agent": "LYC-AutoUpdater"
};

const COMMENT_FILE = "data/comments.json";
const RELEASE_FILE = "data/releases.json";
const USERDATA_FILE = "data/userdata.json";

async function fetchRepos() {
  const tags = ["LYC", "LYC1.0", "LYC2.0", "LYC3.0"];
  let results = [];

  for (const tag of tags) {
    const res = await fetch(`https://api.github.com/search/repositories?q=topic:${tag}+user:${GITHUB_USER}`, { headers: HEADERS });
    const data = await res.json();
    if (data.items) results.push(...data.items);
  }
  return results;
}

async function fetchFile(repoFullName, path) {
  const res = await fetch(`https://raw.githubusercontent.com/${repoFullName}/main/${path}`);
  if (!res.ok) return null;
  return await res.json().catch(() => null);
}

async function update() {
  console.log("🔍 Ищу репозитории с тегами LYC...");
  const repos = await fetchRepos();

  const comments = [];
  const releases = [];
  const users = new Map();

  for (const repo of repos) {
    console.log(`📦 Проверка ${repo.full_name}`);

    const commentMeta = await fetchFile(repo.full_name, "CommentLY.json");
    const commentText = await fetchFile(repo.full_name, "Comment-text-LY.json");

    if (commentMeta && commentText) {
      comments.push({
        username: commentMeta.username || repo.owner.login,
        thumbnail: `https://raw.githubusercontent.com/${repo.full_name}/main/Icon.png`,
        repo: repo.full_name,
        text: commentText.text || ""
      });

      users.set(repo.owner.login, {
        username: repo.owner.login,
        avatar: repo.owner.avatar_url,
        reposCount: (users.get(repo.owner.login)?.reposCount || 0) + 1
      });
    }

    // ищем релизы
    const relRes = await fetch(`https://api.github.com/repos/${repo.full_name}/releases`, { headers: HEADERS });
    const relData = await relRes.json();
    if (Array.isArray(relData) && relData.length > 0) {
      relData.forEach(r => {
        releases.push({
          name: repo.name,
          version: r.tag_name || "unknown",
          date: r.published_at || "n/a"
        });
      });
    }
  }

  // Сохраняем в data/
  fs.writeFileSync(COMMENT_FILE, JSON.stringify(comments, null, 2));
  fs.writeFileSync(RELEASE_FILE, JSON.stringify(releases, null, 2));
  fs.writeFileSync(USERDATA_FILE, JSON.stringify([...users.values()], null, 2));

  console.log("✅ Обновлено:");
  console.log(` - ${comments.length} комментариев`);
  console.log(` - ${releases.length} релизов`);
  console.log(` - ${users.size} пользователей`);
}

update();