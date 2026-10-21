const API_BASE = 'https://api.github.com'

async function requestJson(path) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (resp.status === 404) {
    throw new Error('这个 GitHub 用户不存在，检查一下拼写？')
  }
  if (resp.status === 403 || resp.status === 429) {
    throw new Error('GitHub API 限流了，喝口水一分钟后再试')
  }
  if (!resp.ok) {
    throw new Error(`GitHub API 异常（${resp.status}）`)
  }
  return resp.json()
}

function daysBetween(fromIso, toIso) {
  const ms = new Date(toIso) - new Date(fromIso)
  return Math.max(0, Math.floor(ms / 86400000))
}

async function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

function decideTitle(stats) {
  if (stats.totalStars >= 1024) return 'Star 收割机'
  if (stats.ageDays >= 3650) return '十年老 Build 手'
  if (stats.publicRepos >= 30) return '仓库囤积症患者'
  if (stats.followers >= 100) return '社区发光体'
  if (stats.ageDays >= 1024) return '1024 天幸存者'
  return '正在 Build 的人'
}

export async function fetchBuilderProfile(username) {
  const name = username.trim().replace(/^@/, '')
  if (!name) throw new Error('先输入一个 GitHub 用户名')

  const [user, repos] = await Promise.all([
    requestJson(`/users/${encodeURIComponent(name)}`),
    requestJson(`/users/${encodeURIComponent(name)}/repos?per_page=100&sort=pushed`),
  ])

  const today = new Date().toISOString()
  const ageDays = daysBetween(user.created_at, today)

  const langCounter = {}
  let totalStars = 0
  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0
    if (repo.language) {
      langCounter[repo.language] = (langCounter[repo.language] || 0) + 1
    }
  }
  const languages = Object.entries(langCounter)
    .map(([lang, count]) => ({ lang, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const stats = {
    login: user.login,
    displayName: user.name || user.login,
    bio: user.bio || '',
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    createdAt: user.created_at,
    ageDays,
    ageUnits1024: (ageDays / 1024).toFixed(2),
    publicRepos: user.public_repos,
    followers: user.followers,
    totalStars,
    languages,
    reposScanned: repos.length,
    keyboardCount: (totalStars / 1024).toFixed(3),
  }
  stats.title = decideTitle(stats)
  stats.cardNo = makeCardNo(user.login, user.id)

  stats.avatarImg = await loadImage(user.avatar_url)
  return stats
}

function makeCardNo(login, numericId) {
  let hash = (numericId || 0) + 1024
  for (let i = 0; i < login.length; i++) {
    hash = (hash * 31 + login.charCodeAt(i)) >>> 0
  }
  const part = (n, len) => String(hash % (10 ** len)).padStart(len, '0')
  return `1024-${part(hash >> 4, 4)}-${part(hash, 4)}`
}