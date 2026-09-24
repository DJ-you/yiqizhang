const storage = require('../../utils/storage')
const money = require('../../utils/money')
const month = require('../../utils/month')

const CATEGORY_LABELS = { food: '餐饮', transport: '交通', shopping: '购物', entertainment: '娱乐', housing: '居住', study: '学习', medical: '医疗', other: '其他', salary: '工资', bonus: '奖金' }
const CATEGORY_ICONS = { food: '🍜', transport: '🚇', shopping: '🛍️', entertainment: '🎬', housing: '🏠', study: '📚', medical: '💊', other: '📦', salary: '💰', bonus: '🎁' }

Page({
  data: { viewYear: null, viewMonth: null, monthLabel: '', expense: '0.00', income: '0.00', balance: '0.00', recent: [], categories: [] },

  onShow() { this.refresh() },

  refresh() {
    const all = storage.getPersonalTransactions()
    const now = new Date()
    const viewYear = this.data.viewYear || now.getFullYear()
    const viewMonth = this.data.viewMonth || now.getMonth() + 1
    const monthly = month.filterByMonth(all, viewYear, viewMonth)
    let expenseCents = 0
    let incomeCents = 0
    const categoryTotals = {}
    monthly.forEach(item => {
      if (item.type === 'expense') {
        expenseCents += Number(item.amountCents || 0)
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + Number(item.amountCents || 0)
      } else incomeCents += Number(item.amountCents || 0)
    })
    const categories = Object.keys(categoryTotals).map(key => ({
      key, label: CATEGORY_LABELS[key] || '其他', amount: money.centsToYuan(categoryTotals[key]),
      percent: expenseCents ? Math.round(categoryTotals[key] / expenseCents * 100) : 0
    })).sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 4)
    const recent = monthly.slice(0, 6).map(item => ({ ...item, categoryLabel: CATEGORY_LABELS[item.category] || '其他', iconText: CATEGORY_ICONS[item.category] || '📦', amountText: `${item.type === 'expense' ? '-' : '+'}¥${money.centsToYuan(item.amountCents)}` }))
    this.setData({ viewYear, viewMonth, monthLabel: month.formatMonthLabel(viewYear, viewMonth), expense: money.centsToYuan(expenseCents), income: money.centsToYuan(incomeCents), balance: money.centsToYuan(incomeCents - expenseCents), recent, categories })
  },

  changeMonth(e) {
    const next = month.shiftMonth(this.data.viewYear, this.data.viewMonth, Number(e.currentTarget.dataset.offset))
    this.setData({ viewYear: next.year, viewMonth: next.month }, () => this.refresh())
  },

  deleteTransaction(e) {
    wx.showModal({ title: '删除账单', content: '确认删除这笔账单吗？', success: res => { if (res.confirm) { storage.deletePersonalTransaction(e.currentTarget.dataset.id); this.refresh() } } })
  },
  goAdd() { wx.navigateTo({ url: '/pages/add/index' }) },
  goShared() { wx.switchTab({ url: '/pages/shared/index' }) },
  goCalendar() { wx.navigateTo({ url: '/pages/calendar/index' }) }
})
