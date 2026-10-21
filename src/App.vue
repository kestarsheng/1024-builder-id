<template>
  <div class="stage">
    <div class="aurora" aria-hidden="true"></div>
    <div class="grid-floor" aria-hidden="true"></div>
    <div class="horizon" aria-hidden="true"></div>
    <div class="noise" aria-hidden="true"></div>

    <header class="topbar">
      <span class="prompt">~/$</span>
      <span class="cmd" :class="{ ok: !!stats, err: !!error }">{{ terminalLine }}</span>
      <span v-if="!stats && !error" class="caret-blink">▋</span>
      <span class="topbar-right mono">TRAE 1024 狂欢周</span>
    </header>

    <main class="content">
      <section class="intro">
        <h1 class="headline">给每个 Build 的人，<br />签一张正经的身份证。</h1>
        <p class="sub">
          输入 GitHub 用户名，我们把公开数据装订成一张
          <b>1024 开发者联合会 · Builder 身份证</b>——
          红章、全息贴纸、条码，一个不少。
        </p>

        <form class="entry" @submit.prevent="issue">
          <label class="entry-label mono" for="gh-input">GITHUB ID</label>
          <span class="entry-at mono">@</span>
          <input
            id="gh-input"
            v-model="username"
            class="entry-input mono"
            type="text"
            placeholder="octocat"
            :disabled="loading"
            autocomplete="off"
            spellcheck="false"
          />
          <button class="entry-btn" type="submit" :disabled="loading || !username.trim()">
            {{ loading ? '制证中…' : '签发证件' }}
          </button>
        </form>

        <div class="status-zone" role="status">
          <p v-if="loading" class="mono scanning">{{ scanLine }}</p>
          <p v-else-if="error" class="error mono">✗ {{ error }}</p>
          <p v-else-if="!stats" class="hint mono">// 证件仅使用公开数据，60 秒内可重复签发</p>
        </div>
      </section>

      <section class="card-zone" v-if="stats" aria-label="证件卡">
        <BuilderIdCard :key="cardKey" :stats="stats" :flipped="flipped" @flip="flipped = !flipped" />
        <div class="card-actions">
          <button class="action-btn" @click="savePng">保存 PNG</button>
          <button class="action-btn ghost" @click="flipped = !flipped">
            {{ flipped ? '看正面' : '看背面' }}
          </button>
        </div>
        <p class="flip-hint mono">// 点卡片也能翻面</p>
      </section>

      <section class="card-zone placeholder" v-else-if="!loading && !error" aria-hidden="true">
        <div class="ghost-card">
          <div class="ghost-line w60"></div>
          <div class="ghost-line w90"></div>
          <div class="ghost-line w75"></div>
          <div class="ghost-photo"></div>
          <div class="ghost-stamp"></div>
          <p class="ghost-text">你的证件会出现在这里</p>
        </div>
      </section>
    </main>

    <footer class="footer mono">
      数据来自 GitHub 公开 API · <a href="https://forum.trae.cn/t/topic/325833" target="_blank" rel="noopener">TRAE 1024 狂欢周</a> · 用 TRAE 手搓
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BuilderIdCard from './components/BuilderIdCard.vue'
import { fetchBuilderProfile } from './api/github.js'
import { exportCardPng } from './utils/exportCard.js'

const username = ref('')
const loading = ref(false)
const stats = ref(null)
const error = ref('')
const flipped = ref(false)
const cardKey = ref(0)
const scanLine = ref('[□□□□□□□□□□] 0%')

let scanTimer = null

const terminalLine = computed(() => {
  if (loading.value) return `whoami --builder ${username.value || '...'} --verify`
  if (stats.value) return `✓ identity issued: @${stats.value.login} · ${stats.value.title}`
  if (error.value) return `✗ ${error.value.slice(0, 60)}`
  const name = username.value.trim().replace(/^@/, '')
  return name ? `whoami --builder ${name}` : 'whoami --builder'
})

function runScanAnimation() {
  const frames = ['-', '\\', '|', '/']
  let i = 0
  let p = 0
  clearInterval(scanTimer)
  scanTimer = setInterval(() => {
    p = Math.min(99, p + 3 + Math.random() * 9)
    const filled = Math.floor(p / 10)
    const bar = '■'.repeat(filled) + '□'.repeat(10 - filled)
    scanLine.value = `[${bar}] ${Math.floor(p)}% ${frames[i++ % 4]} 正在核对 ${username.value || '...'} 的代码档案`
  }, 120)
}

async function issue() {
  const name = username.value.trim().replace(/^@/, '')
  if (!name || loading.value) return
  loading.value = true
  error.value = ''
  stats.value = null
  flipped.value = false
  runScanAnimation()
  try {
    const data = await fetchBuilderProfile(name)
    stats.value = data
    cardKey.value++
    history.replaceState(null, '', `?u=${encodeURIComponent(name)}`)
  } catch (e) {
    error.value = e.message || '签发失败'
  } finally {
    clearInterval(scanTimer)
    loading.value = false
  }
}

function savePng() {
  if (stats.value) exportCardPng(stats.value)
}

onMounted(() => {
  const u = new URLSearchParams(location.search).get('u')
  if (u) {
    username.value = u
    issue()
  }
})
</script>

<style scoped>
.stage {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

.aurora {
  position: fixed;
  inset: -25%;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(620px 320px at 18% 22%, rgba(61, 255, 160, 0.10), transparent 62%),
    radial-gradient(560px 300px at 78% 28%, rgba(97, 180, 255, 0.10), transparent 62%),
    radial-gradient(480px 280px at 52% 78%, rgba(176, 97, 255, 0.09), transparent 62%),
    radial-gradient(400px 240px at 88% 72%, rgba(255, 182, 72, 0.05), transparent 60%);
  animation: auroraDrift 26s ease-in-out infinite alternate;
}
@keyframes auroraDrift {
  0% { transform: translate3d(-2%, -1%, 0) scale(1); }
  50% { transform: translate3d(2%, 2%, 0) scale(1.05); }
  100% { transform: translate3d(-1%, 1.5%, 0) scale(1.02); }
}

.grid-floor {
  position: fixed;
  left: -45%;
  right: -45%;
  bottom: -6%;
  height: 52%;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(61, 255, 160, 0.10) 1px, transparent 1px),
    linear-gradient(90deg, rgba(61, 255, 160, 0.10) 1px, transparent 1px);
  background-size: 46px 46px;
  transform: perspective(620px) rotateX(61deg);
  transform-origin: top center;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 26%, transparent 96%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 26%, transparent 96%);
  animation: gridFlow 3.2s linear infinite;
}
@keyframes gridFlow {
  from { background-position: 0 0, 0 0; }
  to { background-position: 0 46px, 0 46px; }
}

.horizon {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 46%;
  height: 1px;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(90deg, transparent, rgba(61, 255, 160, 0.35) 30%, rgba(97, 180, 255, 0.35) 70%, transparent);
  filter: blur(0.5px);
}

.noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  z-index: 0;
}

.topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 26px;
  font-family: var(--mono);
  font-size: 13px;
  border-bottom: 1px solid #1a2030;
  background: rgba(13, 17, 23, 0.6);
  backdrop-filter: blur(6px);
  min-height: 46px;
}
.prompt { color: #3dffa0; }
.cmd { color: #a8b3c5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cmd.ok { color: #3dffa0; }
.cmd.err { color: #ff6b6b; }
.caret-blink { color: #3dffa0; animation: blink 1s steps(2) infinite; flex-shrink: 0; }
@keyframes blink { 50% { opacity: 0; } }
.topbar-right { margin-left: auto; color: #5c6878; font-size: 11px; flex-shrink: 0; }

.content {
  position: relative;
  z-index: 2;
  flex: 1;
  width: min(1120px, 94vw);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(320px, 460px) minmax(380px, 1fr);
  gap: 56px;
  align-items: center;
  padding: 48px 0 64px;
}
@media (max-width: 900px) {
  .content { grid-template-columns: 1fr; gap: 36px; padding-top: 32px; }
}

.intro { min-width: 0; }

.headline {
  font-family: "FangSong", "STFangsong", "KaiTi", serif;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.35;
  color: #e8ecf3;
  letter-spacing: 1px;
}

.sub {
  margin-top: 16px;
  font-size: 14.5px;
  line-height: 1.9;
  color: #a8b3c5;
  max-width: 42em;
}
.sub b { color: #ffb648; font-weight: 600; }

.entry {
  margin-top: 34px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0d1117;
  border: 1px solid #262e40;
  border-radius: 10px;
  padding: 12px 14px;
  transition: border-color 0.2s;
}
.entry:focus-within { border-color: #3dffa0; }
.entry-label { color: #5c6878; font-size: 11px; letter-spacing: 1px; }
.entry-at { color: #3dffa0; font-size: 15px; }
.entry-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #e8ecf3;
  font-size: 15px;
  font-family: var(--mono);
  min-width: 0;
}
.entry-input::placeholder { color: #333c4d; }
.entry-btn {
  border: none;
  background: #3dffa0;
  color: #0b0e14;
  font-weight: 700;
  font-size: 14px;
  padding: 9px 18px;
  border-radius: 7px;
  transition: transform 0.1s, box-shadow 0.15s;
}
.entry-btn:hover:not(:disabled) { box-shadow: 0 0 18px rgba(61, 255, 160, 0.35); }
.entry-btn:active:not(:disabled) { transform: translateY(1px); }
.entry-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.status-zone { margin-top: 14px; min-height: 22px; font-size: 12.5px; }
.scanning { color: #3dffa0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.error { color: #ff6b6b; }
.hint { color: #425062; }

.card-zone { display: flex; flex-direction: column; align-items: center; gap: 16px; }

.card-actions { display: flex; gap: 12px; }
.action-btn {
  border: 1px solid #3dffa0;
  background: rgba(61, 255, 160, 0.1);
  color: #3dffa0;
  font-size: 13.5px;
  padding: 9px 22px;
  border-radius: 8px;
  transition: background 0.15s;
}
.action-btn:hover { background: rgba(61, 255, 160, 0.22); }
.action-btn.ghost { border-color: #2c3550; color: #a8b3c5; background: transparent; }
.action-btn.ghost:hover { border-color: #a8b3c5; }
.flip-hint { color: #333c4d; font-size: 11px; }

.placeholder { width: min(560px, 92vw); }
.ghost-card {
  width: 100%;
  aspect-ratio: 856 / 540;
  border: 1.5px dashed #262e40;
  border-radius: 18px;
  position: relative;
  display: grid;
  padding: 26px;
  grid-template-columns: 160px 1fr;
  gap: 22px;
  overflow: hidden;
}
.ghost-line { height: 14px; border-radius: 4px; background: #131826; margin: 10px 0; align-self: start; }
.ghost-line:nth-child(1) { margin-top: 8px; }
.w60 { width: 60%; }
.w90 { width: 90%; }
.w75 { width: 75%; }
.ghost-photo {
  grid-row: 1 / 6;
  width: 152px;
  height: 182px;
  border-radius: 6px;
  background: repeating-linear-gradient(135deg, #131826 0 10px, #10141f 10px 20px);
}
.ghost-stamp {
  position: absolute;
  right: 90px;
  top: 200px;
  width: 90px;
  height: 90px;
  border: 3px dashed #3a2430;
  border-radius: 50%;
  opacity: 0.6;
}
.ghost-text {
  position: absolute;
  bottom: 18px;
  right: 24px;
  color: #333c4d;
  font-size: 12px;
  font-family: var(--mono);
}

.footer {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 18px;
  color: #425062;
  font-size: 11px;
  border-top: 1px solid #1a2030;
}
.footer a { color: #3d5a75; text-decoration: none; }
.footer a:hover { color: #3dffa0; }
</style>