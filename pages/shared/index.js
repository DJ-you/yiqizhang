const storage = require('../../utils/storage')
const settlement = require('../../utils/settlement')
const money = require('../../utils/money')

Page({
  data: { ledgers: [], name: '' },
  onShow() { this.refresh() },
  refresh() {
    const ledgers = storage.getLedgers().map(ledger => {
      const result = settlement.computeLedger(ledger)
      const totalCents = (ledger.bills || []).reduce((sum, bill) => sum + Number(bill.amountCents || 0), 0)
      return { ...ledger, memberCount: (ledger.members || []).length, billCount: (ledger.bills || []).length, total: money.centsToYuan(totalCents), openCount: result.transfers.length }
    })
    this.setData({ ledgers })
  },
  onName(e) { this.setData({ name: e.detail.value }) },
  createLedger() {
    const name = this.data.name.trim()
    if (!name) { wx.showToast({ title: '请输入账本名称', icon: 'none' }); return }
    const ledger = { id: storage.createId('ledger'), name, members: [], bills: [], createdAt: Date.now() }
    storage.upsertLedger(ledger)
    this.setData({ name: '' })
    this.refresh()
    wx.navigateTo({ url: `/pages/ledger/index?id=${ledger.id}` })
  },
  openLedger(e) { wx.navigateTo({ url: `/pages/ledger/index?id=${e.currentTarget.dataset.id}` }) }
})
