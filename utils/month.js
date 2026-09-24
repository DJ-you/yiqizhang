function padMonth(month) {
  return String(month).padStart(2, '0')
}

function monthKey(year, month) {
  return `${year}-${padMonth(month)}`
}

function formatMonthLabel(year, month) {
  return `${year}年${month}月`
}

function shiftMonth(year, month, offset) {
  const date = new Date(year, month - 1 + offset, 1)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

function filterByMonth(transactions, year, month) {
  const prefix = monthKey(year, month)
  return (transactions || []).filter(item => String(item.date || '').startsWith(prefix))
}

function buildCalendarCells(transactions, year, month) {
  const daily = {}
  filterByMonth(transactions, year, month).forEach(item => {
    const date = String(item.date || '').slice(0, 10)
    if (!daily[date]) daily[date] = { expenseCents: 0, incomeCents: 0, transactions: [] }
    if (item.type === 'expense') daily[date].expenseCents += Number(item.amountCents || 0)
    else daily[date].incomeCents += Number(item.amountCents || 0)
    daily[date].transactions.push(item)
  })

  const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = Array.from({ length: leadingBlanks }, (_, index) => ({ key: `blank-${index}`, isBlank: true }))
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${monthKey(year, month)}-${String(day).padStart(2, '0')}`
    const summary = daily[date] || { expenseCents: 0, incomeCents: 0, transactions: [] }
    cells.push({ key: date, date, day, isBlank: false, ...summary })
  }
  return cells
}

module.exports = { monthKey, formatMonthLabel, shiftMonth, filterByMonth, buildCalendarCells }
