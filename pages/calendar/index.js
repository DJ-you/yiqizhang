const storage = require('../../utils/storage')
const money = require('../../utils/money')
const month = require('../../utils/month')

const CATEGORY_LABELS = { food: '餐饮', transport: '交通', shopping: '购物', entertainment: '娱乐', housing: '居住', study: '学习', medical: '医疗', other: '其他', salary: '工资', bonus: '奖金' }
const CATEGORY_ICONS = { food: '🍜', transport: '🚇', shopping: '🛍️', entertainment: '🎬', housing: '🏠', study: '📚', medical: '💊', other: '📦', salary: '💰', bonus: '🎁' }
function decorateTransaction(item) { return { ...item, categoryLabel: CATEGORY_LABELS[item.category] || '其他', iconText: CATEGORY_ICONS[item.category] || '📦', amountText: `${item.type === 'expense' ? '-' : '+'}¥${money.centsToYuan(item.amountCents)}` } }

Page({
  data: { viewYear: null, viewMonth: null, monthLabel: '', weekdays: ['一', '二', '三', '四', '五', '六', '日'], calendarCells: [], selectedDate: '', selectedExpenses: [], selectedIncomes: [] },
  onShow() { this.refresh() },
  refresh() {
    const now = new Date(); const viewYear = this.data.viewYear || now.getFullYear(); const viewMonth = this.data.viewMonth || now.getMonth() + 1
    const cells = month.buildCalendarCells(storage.getPersonalTransactions(), viewYear, viewMonth).map(item => item.isBlank ? item : { ...item, expense: item.expenseCents ? money.centsToYuan(item.expenseCents) : '', income: item.incomeCents ? money.centsToYuan(item.incomeCents) : '' })
    this.setData({ viewYear, viewMonth, monthLabel: month.formatMonthLabel(viewYear, viewMonth), calendarCells: cells, selectedDate: '', selectedExpenses: [], selectedIncomes: [] })
  },
  changeMonth(e) { const next = month.shiftMonth(this.data.viewYear, this.data.viewMonth, Number(e.currentTarget.dataset.offset)); this.setData({ viewYear: next.year, viewMonth: next.month }, () => this.refresh()) },
  selectDay(e) {
    const date = e.currentTarget.dataset.date; if (!date) return
    const cell = this.data.calendarCells.find(item => item.date === date); const transactions = cell ? cell.transactions : []
    this.setData({ selectedDate: date, selectedExpenses: transactions.filter(item => item.type === 'expense').map(decorateTransaction), selectedIncomes: transactions.filter(item => item.type === 'income').map(decorateTransaction) })
  }
})
