const storage = require('../../utils/storage')
const money = require('../../utils/money')

const EXPENSE_CATEGORIES = [{ key: 'food', label: '餐饮', icon: '🍜' }, { key: 'transport', label: '交通', icon: '🚇' }, { key: 'shopping', label: '购物', icon: '🛍️' }, { key: 'entertainment', label: '娱乐', icon: '🎬' }, { key: 'housing', label: '居住', icon: '🏠' }, { key: 'study', label: '学习', icon: '📚' }, { key: 'medical', label: '医疗', icon: '💊' }, { key: 'other', label: '其他', icon: '📦' }]
const INCOME_CATEGORIES = [{ key: 'salary', label: '工资', icon: '💰' }, { key: 'bonus', label: '奖金', icon: '🎁' }, { key: 'other', label: '其他', icon: '📦' }]
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

Page({
  data: { type: 'expense', amount: '', note: '', date: today(), categories: EXPENSE_CATEGORIES, category: 'food' },
  setType(e) { const type = e.currentTarget.dataset.type; const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES; this.setData({ type, categories, category: categories[0].key }) },
  onAmount(e) { this.setData({ amount: e.detail.value }) },
  onNote(e) { this.setData({ note: e.detail.value }) },
  onDate(e) { this.setData({ date: e.detail.value }) },
  chooseCategory(e) { this.setData({ category: e.currentTarget.dataset.key }) },
  save() {
    const amountCents = money.yuanToCents(this.data.amount)
    if (amountCents <= 0) { wx.showToast({ title: '请输入有效金额', icon: 'none' }); return }
    storage.addPersonalTransaction({ id: storage.createId('tx'), type: this.data.type, amountCents, category: this.data.category, note: this.data.note.trim(), date: this.data.date, createdAt: Date.now() })
    wx.showToast({ title: '已记下', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 400)
  }
})
