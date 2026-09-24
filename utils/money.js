function yuanToCents(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100)
}

function centsToYuan(cents) {
  return (Number(cents || 0) / 100).toFixed(2)
}

function signedYuan(cents) {
  const n = Number(cents || 0)
  const sign = n > 0 ? '+' : n < 0 ? '-' : ''
  return `${sign}¥${centsToYuan(Math.abs(n))}`
}

module.exports = { yuanToCents, centsToYuan, signedYuan }
