const STORAGE_KEY = 'novel_servers'
const CACHE_KEY = 'novel_servers_cache'
let serverAddress = window.location.origin
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// 健康检查，并更新缓存
async function checkServerWithCache(server, cache) {
  const now = Date.now()
  let cached = cache.find(c => c.server === server)
  try {
    const testUrl = `${server}/health`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(testUrl, { signal: controller.signal })
    clearTimeout(timeout)
    const ok = res.ok
    if (cached) cached.lastCheck = now
    else cache.push({ server, lastCheck: now })
    return ok
  } catch {
    if (cached) cached.lastCheck = now
    else cache.push({ server, lastCheck: now })
    return false
  } finally {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  }
}

export async function initServerAddresses() {
  const currentOrigin = window.location.origin
  let servers = []

  try {
    const res = await fetch(`${currentOrigin}/novel/server.json`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        for (const item of data) {
          const server = item?.server_address
          if (server?.startsWith('http')) {
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
            const isHealthy = await checkServerWithCache(server, cache)
            if (isHealthy) servers.push(server)
          }
        }
      }
    }
  } catch {
    // 忽略异常
  }

  if (servers.length === 0) servers = [currentOrigin]

  serverAddress = servers[0]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servers))
}

// 获取默认 server（随机）以及可用 server 列表
export async function getServerAddress() {
  const now = Date.now()
  let servers = []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    await initServerAddresses();
    const storedString = localStorage.getItem(STORAGE_KEY) || '[]';
    servers = JSON.parse(storedString);
  } else {
    try {
      const parsed = JSON.parse(stored)
      servers = Array.isArray(parsed) ? parsed : []
    } catch {
      servers = []
    }
  }

  // 读取 CACHE_KEY
  let cache = []
  const cacheRaw = localStorage.getItem(CACHE_KEY)
  if (cacheRaw) {
    try {
      const parsed = JSON.parse(cacheRaw)
      if (Array.isArray(parsed)) cache = parsed
    } catch {}
  }

  const available = []

  // 优先使用缓存未过期的 server
  for (const server of servers) {
    const cached = cache.find(c => c.server === server)
    if (cached && now - cached.lastCheck <= CACHE_DURATION) {
      available.push(server)
    }
  }

  // 检查缓存过期或未检查的 server
  for (const server of servers) {
    if (!available.includes(server)) {
      if (await checkServerWithCache(server, cache)) {
        available.push(server)
      }
    }
  }

  // 全部失败兜底
  if (available.length === 0) {
    serverAddress = window.location.origin
    const cached = cache.find(c => c.server === serverAddress)
    if (cached) cached.lastCheck = now
    else cache.push({ server: serverAddress, lastCheck: now })
    available.push(serverAddress)
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } else {
    // 随机选择一个作为默认 server
    serverAddress = available[Math.floor(Math.random() * available.length)]
  }

  return { default: serverAddress, available }
}
