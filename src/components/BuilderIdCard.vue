<template>
  <div class="card-scene">
    <div class="card" :class="{ flipped: flipped }" @click="$emit('flip')">
      <div class="card-face card-front">
        <div class="binary-rain" aria-hidden="true"></div>
        <header class="card-header">
          <div class="org">1024 开发者联合会</div>
          <div class="org-sub">BUILDER IDENTITY CARD</div>
          <div class="holo"><span>1024</span></div>
        </header>
        <div class="card-body">
          <div class="photo-wrap">
            <img v-if="stats.avatarUrl" :src="stats.avatarUrl" alt="GitHub 头像" />
            <div class="photo-fallback" v-else>?</div>
            <svg class="stamp" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" stroke-width="4" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="1.5" />
              <g font-size="10.5" fill="currentColor" font-weight="700" text-anchor="middle">
                <text x="60" y="24">已</text>
                <text x="60" y="104">章</text>
                <text x="24" y="64">认</text>
                <text x="96" y="64">证</text>
                <text x="35" y="40" transform="rotate(-45 35 40)">B</text>
                <text x="85" y="40" transform="rotate(45 85 40)">R</text>
                <text x="35" y="92" transform="rotate(45 35 92)">L</text>
                <text x="85" y="92" transform="rotate(-45 85 92)">D</text>
              </g>
              <text x="60" y="66" font-size="20" fill="currentColor" font-weight="900" text-anchor="middle">1024</text>
            </svg>
          </div>
          <dl class="fields">
            <div class="field">
              <dt>姓名</dt>
              <dd class="name">{{ stats.displayName }}</dd>
            </div>
            <div class="field">
              <dt>称号</dt>
              <dd>{{ stats.title }}</dd>
            </div>
            <div class="field">
              <dt>代号</dt>
              <dd class="mono">@{{ stats.login }}</dd>
            </div>
            <div class="field">
              <dt>证号</dt>
              <dd class="mono">{{ stats.cardNo }}</dd>
            </div>
            <div class="field">
              <dt>代码年龄</dt>
              <dd>{{ stats.ageDays }} 天 <span class="dim">= {{ stats.ageUnits1024 }} × 1024</span></dd>
            </div>
            <div class="field">
              <dt>星标资产</dt>
              <dd>{{ stats.totalStars }} <span class="dim">≈ {{ stats.keyboardCount }} 台键盘</span></dd>
            </div>
          </dl>
        </div>
        <footer class="card-footer">
          <div class="barcode" aria-hidden="true"></div>
          <div class="issuer">
            <p>签发机关：GitHub 公开数据 · TRAE 社区代发</p>
            <p>有效期限：10<sup>24</sup> 年</p>
          </div>
        </footer>
      </div>

      <div class="card-face card-back">
        <div class="circuit-bg" aria-hidden="true"></div>
        <header class="card-header back">
          <div class="org">签发记录</div>
          <div class="org-sub">REVERSE SIDE</div>
        </header>
        <div class="lang-section">
          <p class="section-title">主要武器（近 {{ stats.reposScanned }} 个仓库抽样）</p>
          <div v-for="lang in stats.languages" :key="lang.lang" class="lang-row">
            <span class="lang-name">{{ lang.lang }}</span>
            <div class="lang-bar-track">
              <div class="lang-bar" :style="{ width: barWidth(lang.count) + '%' }"></div>
            </div>
            <span class="lang-count mono">×{{ lang.count }}</span>
          </div>
          <p v-if="!stats.languages.length" class="empty-lang">还没有公开仓库，纯血隐私型 Builder</p>
        </div>
        <footer class="card-footer back">
          <div class="pixel-cat" aria-hidden="true"></div>
          <p class="motto">致敬每一个正在 Build 的人</p>
          <p class="since mono">入库于 {{ stats.createdAt.slice(0, 10) }}</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  stats: { type: Object, required: true },
  flipped: { type: Boolean, default: false },
})

defineEmits(['flip'])

function barWidth(count) {
  const max = Math.max(...props.stats.languages.map((l) => l.count), 1)
  return Math.max(8, Math.round((count / max) * 100))
}
</script>

<style scoped>
.card-scene {
  perspective: 1600px;
  width: min(560px, 92vw);
  aspect-ratio: 856 / 540;
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.4, 0.1, 0.2, 1);
  cursor: pointer;
}
.card.flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  overflow: hidden;
  backface-visibility: hidden;
  background:
    radial-gradient(700px 300px at 90% -20%, rgba(61, 255, 160, 0.08), transparent),
    linear-gradient(160deg, #182032 0%, #131826 55%, #10141f 100%);
  border: 1px solid #2c3550;
  box-shadow:
    0 24px 60px -18px rgba(0, 0, 0, 0.75),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
}
.card-back { transform: rotateY(180deg); }

.binary-rain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    115deg,
    rgba(61, 255, 160, 0.045) 0 1px,
    transparent 1px 34px
  );
  mask-image: radial-gradient(ellipse at 20% 30%, #000 0%, transparent 75%);
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 18px 22px 0;
  position: relative;
}
.org {
  font-family: "FangSong", "STFangsong", "KaiTi", serif;
  font-size: 19px;
  letter-spacing: 4px;
  color: #dfe8f5;
}
.org-sub {
  font-size: 9px;
  letter-spacing: 2.5px;
  color: #5c6878;
  font-family: var(--mono);
}
.card-header.back { padding-top: 20px; }

.holo {
  position: relative;
  margin-left: auto;
  width: 66px;
  height: 38px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: repeating-linear-gradient(
    -38deg,
    #c9d3e0 0 2px,
    #97a6ba 2px 4px,
    #6d7d94 4px 6px,
    #aebccd 6px 8px,
    #8494ab 8px 10px
  );
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 -5px 8px rgba(0, 0, 0, 0.22),
    0 1px 3px rgba(0, 0, 0, 0.4);
}
.holo::after {
  content: "";
  position: absolute;
  inset: -20%;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(120, 255, 200, 0.35) 48%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(120, 255, 200, 0.35) 52%,
    transparent 60%
  );
  transform: translateX(-90%);
  animation: sheen 4.2s ease-in-out infinite;
}
@keyframes sheen {
  0%, 55% { transform: translateX(-90%); }
  85%, 100% { transform: translateX(90%); }
}
.holo span {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-family: var(--mono);
  font-weight: 900;
  font-size: 12px;
  color: #0a0d13;
  letter-spacing: 1px;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
}

.card-body {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 16px 22px 0;
  min-height: 0;
}

.photo-wrap {
  position: relative;
  width: 152px;
  height: 182px;
  flex-shrink: 0;
}
.photo-wrap img,
.photo-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  display: block;
  background: #0d1117;
  border: 1px solid #2c3550;
}
.photo-fallback {
  display: grid;
  place-items: center;
  font-size: 40px;
  color: #2c3550;
  font-family: var(--mono);
}

.stamp {
  position: absolute;
  right: -34px;
  bottom: -30px;
  width: 108px;
  height: 108px;
  color: #e5484d;
  opacity: 0.82;
  transform: rotate(-14deg);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
  animation: stampIn 0.5s cubic-bezier(0.2, 2.2, 0.4, 0.9) both;
  animation-delay: 0.35s;
}
@keyframes stampIn {
  0% { transform: rotate(-14deg) scale(2.4); opacity: 0; }
  100% { transform: rotate(-14deg) scale(1); opacity: 0.82; }
}

.fields {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px 14px;
  align-content: start;
  min-width: 0;
}
.field { min-width: 0; }
.field dt {
  font-size: 10px;
  color: #5c6878;
  letter-spacing: 2px;
  margin-bottom: 2px;
}
.field dd {
  font-size: 14.5px;
  color: #e8ecf3;
  font-family: "FangSong", "STFangsong", "KaiTi", serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.field dd.name { font-size: 21px; letter-spacing: 2px; }
.field dd.mono { font-family: var(--mono); font-size: 13px; color: #3dffa0; }
.dim { color: #5c6878; font-size: 11px; }

.card-footer {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 22px 16px;
}
.barcode {
  width: 210px;
  height: 34px;
  flex-shrink: 0;
  background: repeating-linear-gradient(
    90deg,
    #cdd6e4 0 2px, transparent 2px 5px,
    #cdd6e4 5px 6px, transparent 6px 11px,
    #cdd6e4 11px 14px, transparent 14px 15px,
    #cdd6e4 15px 16px, transparent 16px 21px
  );
  opacity: 0.75;
}
.issuer p {
  font-size: 10.5px;
  color: #7c8798;
  line-height: 1.7;
  font-family: "FangSong", "STFangsong", "KaiTi", serif;
}
.issuer sup { font-size: 7px; }

.card-back .circuit-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(61, 255, 160, 0.12) 1px, transparent 0);
  background-size: 26px 26px;
  mask-image: linear-gradient(200deg, #000 20%, transparent 70%);
}

.lang-section {
  flex: 1;
  padding: 14px 24px 0;
  min-height: 0;
}
.section-title {
  font-size: 11px;
  color: #5c6878;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.lang-row {
  display: grid;
  grid-template-columns: 92px 1fr 52px;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.lang-name {
  font-size: 13px;
  color: #dbe4f0;
  font-family: var(--mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lang-bar-track {
  height: 10px;
  border-radius: 5px;
  background: #0d1117;
  overflow: hidden;
}
.lang-bar {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #1f7a55, #3dffa0);
}
.lang-count {
  font-size: 11px;
  color: #5c6878;
  text-align: right;
}
.empty-lang {
  font-size: 12px;
  color: #5c6878;
  padding: 20px 0;
  font-family: "FangSong", "STFangsong", serif;
}

.card-footer.back {
  justify-content: space-between;
  align-items: center;
}
.pixel-cat {
  width: 56px;
  height: 48px;
  flex-shrink: 0;
  background: #3dffa0;
  box-shadow:
    10px 0 #3dffa0, 20px 0 #3dffa0, 30px 0 #3dffa0, 40px 0 #3dffa0,
    0 8px #3dffa0, 10px 8px #3dffa0, 20px 8px #0b0e14, 30px 8px #0b0e14, 40px 8px #3dffa0, 50px 8px #3dffa0,
    0 16px #3dffa0, 10px 16px #0b0e14, 20px 16px #3dffa0, 30px 16px #3dffa0, 40px 16px #0b0e14, 50px 16px #3dffa0,
    0 24px #3dffa0, 10px 24px #3dffa0, 20px 24px #3dffa0, 30px 24px #3dffa0, 40px 24px #3dffa0, 50px 24px #3dffa0,
    10px 32px #2aa06b, 20px 32px #2aa06b, 30px 32px #2aa06b, 40px 32px #2aa06b;
  image-rendering: pixelated;
}
.motto {
  font-family: "FangSong", "STFangsong", "KaiTi", serif;
  font-size: 15px;
  letter-spacing: 3px;
  color: #dbe4f0;
}
.since {
  font-size: 10px;
  color: #5c6878;
  align-self: flex-end;
}
</style>