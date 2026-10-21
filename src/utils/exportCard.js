function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawStamp(ctx, cx, cy, r, angle) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.strokeStyle = '#e5484d'
  ctx.fillStyle = '#e5484d'
  ctx.globalAlpha = 0.85
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(0, 0, r - 14, 0, Math.PI * 2)
  ctx.stroke()
  ctx.font = '900 34px "Arial", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('1024', 0, 2)
  ctx.font = '700 19px "Arial", sans-serif'
  const marks = ['已', '认', '证', '章', 'B', 'R', 'L', 'D']
  for (let i = 0; i < marks.length; i++) {
    const a = (i / marks.length) * Math.PI * 2 - Math.PI / 2
    const mx = Math.cos(a) * (r - 7)
    const my = Math.sin(a) * (r - 7)
    ctx.save()
    ctx.translate(mx, my)
    ctx.rotate(a + Math.PI / 2)
    ctx.fillText(marks[i], 0, 0)
    ctx.restore()
  }
  ctx.restore()
}

function drawBarcode(ctx, x, y, w, h, seed) {
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  ctx.fillStyle = '#cdd6e4'
  let cx = x
  while (cx < x + w) {
    const bw = 2 + Math.floor(rand() * 6)
    if (rand() > 0.35) ctx.fillRect(cx, y, bw, h)
    cx += bw + 1 + Math.floor(rand() * 3)
  }
  ctx.font = '12px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('*1024* BUILDER *CERTIFIED*', x + w / 2, y + h + 16)
}

function drawHolo(ctx, x, y, w, h) {
  const colors = ['#c9d3e0', '#97a6ba', '#6d7d94', '#aebccd', '#8494ab']
  ctx.save()
  roundRect(ctx, x, y, w, h, 8)
  ctx.clip()
  const step = 5
  let cx = x - h
  let ci = 0
  while (cx < x + w + h) {
    ctx.fillStyle = colors[ci % colors.length]
    ctx.beginPath()
    ctx.moveTo(cx, y + h)
    ctx.lineTo(cx + step, y + h)
    ctx.lineTo(cx + step + h, y)
    ctx.lineTo(cx + h, y)
    ctx.closePath()
    ctx.fill()
    cx += step
    ci++
  }
  const sheen = ctx.createLinearGradient(x, y + h, x + w, y)
  sheen.addColorStop(0.4, 'rgba(120,255,200,0)')
  sheen.addColorStop(0.48, 'rgba(120,255,200,0.35)')
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.55)')
  sheen.addColorStop(0.52, 'rgba(120,255,200,0.35)')
  sheen.addColorStop(0.6, 'rgba(120,255,200,0)')
  ctx.fillStyle = sheen
  ctx.fillRect(x, y, w, h)
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1
  roundRect(ctx, x, y, w, h, 8)
  ctx.stroke()
  ctx.fillStyle = '#0a0d13'
  ctx.font = '900 12px "Courier New", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('1024', x + w / 2, y + h / 2 + 1)
}

export function exportCardPng(stats) {
  const scale = 2
  const W = 856 * scale
  const H = 540 * scale
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  const bg = ctx.createLinearGradient(0, 0, 856, 540)
  bg.addColorStop(0, '#182032')
  bg.addColorStop(0.55, '#131826')
  bg.addColorStop(1, '#10141f')
  ctx.fillStyle = bg
  roundRect(ctx, 0, 0, 856, 540, 18)
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.strokeStyle = 'rgba(61,255,160,0.06)'
  ctx.lineWidth = 1
  for (let i = -540; i < 856; i += 34) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + 540, 540)
    ctx.stroke()
  }
  ctx.restore()

  ctx.fillStyle = '#dfe8f5'
  ctx.font = '19px "FangSong", "STFangsong", "KaiTi", serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('1 0 2 4  开 发 者 联 合 会', 22, 38)
  ctx.font = '9px "Courier New", monospace'
  ctx.fillStyle = '#5c6878'
  ctx.fillText('B U I L D E R   I D E N T I T Y   C A R D', 22, 52)

  drawHolo(ctx, 768, 18, 66, 38)

  const px = 22
  const py = 70
  const pw = 152
  const ph = 182
  if (stats.avatarImg) {
    ctx.save()
    roundRect(ctx, px, py, pw, ph, 6)
    ctx.clip()
    ctx.drawImage(stats.avatarImg, px, py, pw, ph)
    ctx.restore()
  }
  ctx.strokeStyle = '#2c3550'
  ctx.lineWidth = 1
  roundRect(ctx, px, py, pw, ph, 6)
  ctx.stroke()
  drawStamp(ctx, px + pw - 10, py + ph - 6, 54, -0.24)

  const fx = px + pw + 22
  const fields = [
    ['姓 名', stats.displayName, 'name'],
    ['称 号', stats.title, ''],
    ['代 号', '@' + stats.login, 'mono'],
    ['证 号', stats.cardNo, 'mono'],
    ['代码年龄', `${stats.ageDays} 天 = ${stats.ageUnits1024} × 1024`, ''],
    ['星标资产', `${stats.totalStars} ≈ ${stats.keyboardCount} 台键盘`, ''],
  ]
  fields.forEach((f, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = fx + col * 180
    const y = 86 + row * 62
    ctx.fillStyle = '#5c6878'
    ctx.font = '10px "Arial", sans-serif'
    ctx.fillText(f[0].split('').join(' '), x, y)
    if (f[2] === 'name') {
      ctx.fillStyle = '#e8ecf3'
      ctx.font = '21px "FangSong", "STFangsong", "KaiTi", serif'
    } else if (f[2] === 'mono') {
      ctx.fillStyle = '#3dffa0'
      ctx.font = '13px "Courier New", monospace'
    } else {
      ctx.fillStyle = '#e8ecf3'
      ctx.font = '14.5px "FangSong", "STFangsong", "KaiTi", serif'
    }
    ctx.fillText(f[1], x, y + 22)
  })

  const seed = stats.login.split('').reduce((a, c) => a + c.charCodeAt(0) * 31, 1024)
  drawBarcode(ctx, 22, 466, 210, 34, seed)

  ctx.fillStyle = '#7c8798'
  ctx.font = '10.5px "FangSong", "STFangsong", "KaiTi", serif'
  ctx.textAlign = 'left'
  ctx.fillText('签发机关：GitHub 公开数据 · TRAE 社区代发', 258, 480)
  ctx.fillText('有效期限：10^24 年', 258, 500)
  ctx.textAlign = 'right'
  ctx.fillStyle = '#3d5a75'
  ctx.font = '9px "Courier New", monospace'
  ctx.fillText('1024-builder-id · ' + new Date().toISOString().slice(0, 10), 834, 522)

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `1024-builder-id-${stats.login}.png`
  a.click()
}