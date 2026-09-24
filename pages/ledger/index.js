const storage = require('../../utils/storage')
const settlement = require('../../utils/settlement')
const money = require('../../utils/money')

const CATEGORIES = [{ key: 'food', label: '餐饮', icon: '🍜' }, { key: 'transport', label: '交通', icon: '🚇' }, { key: 'shopping', label: '购物', icon: '🛍️' }, { key: 'other', label: '其他', icon: '📦' }]

Page({
  data: { id: '', ledger: null, membersForBill: [], addingMember: false, memberName: '', addingBill: false, amount: '', note: '', payerId: '', participantIds: [], categories: CATEGORIES, category: 'food', displayBills: [], total: '0.00', unsettled: '0.00' },
  onLoad(options) { this.setData({ id: options.id || '' }); this.refresh() },
  refresh() {
    const ledger = storage.getLedger(this.data.id)
    if (!ledger) return
    const members = ledger.members || []
    const result = settlement.computeLedger(ledger)
    const displayBills = (ledger.bills || []).map(bill => ({ ...bill, payerName: (members.find(member => member.id === bill.payerId) || {}).name || '未知成员', participantNames: (bill.participantIds || []).map(id => (members.find(member => member.id === id) || {}).name).filter(Boolean).join('、'), amountText: money.centsToYuan(bill.amountCents) }))
    const totalCents = (ledger.bills || []).reduce((sum, bill) => sum + Number(bill.amountCents || 0), 0)
    const unsettledCents = result.transfers.reduce((sum, item) => sum + item.amountCents, 0)
    this.setData({ ledger, displayBills, membersForBill: members.map(member => ({ ...member, selected: this.data.participantIds.includes(member.id) })), total: money.centsToYuan(totalCents), unsettled: money.centsToYuan(unsettledCents) })
  },
  startMember() { this.setData({ addingMember: true, memberName: '' }) },
  cancelMember() { this.setData({ addingMember: false }) },
  onMemberName(e) { this.setData({ memberName: e.detail.value }) },
  saveMember() {
    const name = this.data.memberName.trim()
    if (!name) { wx.showToast({ title: '请输入成员名称', icon: 'none' }); return }
    const ledger = storage.getLedger(this.data.id); ledger.members = ledger.members || []; ledger.members.push({ id: storage.createId('member'), name }); storage.upsertLedger(ledger); this.setData({ addingMember: false }); this.refresh()
  },
  startBill() {
    const members = (this.data.ledger && this.data.ledger.members) || []
    if (members.length < 2) { wx.showToast({ title: '请先添加至少两名成员', icon: 'none' }); return }
    this.setData({ addingBill: true, amount: '', note: '', payerId: members[0].id, participantIds: members.map(member => member.id), category: 'food' }); this.refresh()
  },
  cancelBill() { this.setData({ addingBill: false }) },
  onAmount(e) { this.setData({ amount: e.detail.value }) },
  onNote(e) { this.setData({ note: e.detail.value }) },
  choosePayer(e) { this.setData({ payerId: e.currentTarget.dataset.id }) },
  toggleParticipant(e) { const id = e.currentTarget.dataset.id; const ids = this.data.participantIds.slice(); const index = ids.indexOf(id); if (index >= 0) ids.splice(index, 1); else ids.push(id); this.setData({ participantIds: ids }); this.refresh() },
  chooseCategory(e) { this.setData({ category: e.currentTarget.dataset.key }) },
  saveBill() {
    const amountCents = money.yuanToCents(this.data.amount)
    if (amountCents <= 0 || !this.data.payerId || !this.data.participantIds.length) { wx.showToast({ title: '请填写金额并选择参与人', icon: 'none' }); return }
    const ledger = storage.getLedger(this.data.id); ledger.bills = ledger.bills || []; ledger.bills.unshift({ id: storage.createId('bill'), amountCents, payerId: this.data.payerId, participantIds: this.data.participantIds.slice(), category: this.data.category, note: this.data.note.trim(), createdAt: Date.now() }); storage.upsertLedger(ledger); this.setData({ addingBill: false }); this.refresh()
  },
  deleteBill(e) { wx.showModal({ title: '删除账单', content: '删除后会自动重算分摊结果，确认吗？', success: res => { if (res.confirm) { const ledger = storage.getLedger(this.data.id); ledger.bills = (ledger.bills || []).filter(item => item.id !== e.currentTarget.dataset.id); storage.upsertLedger(ledger); this.refresh() } } }) },
  goSettlement() { wx.navigateTo({ url: `/pages/settlement/index?id=${this.data.id}` }) }
})
