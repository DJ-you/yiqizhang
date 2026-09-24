const storage = require('../../utils/storage')
const settlement = require('../../utils/settlement')
const money = require('../../utils/money')

Page({
  data: { ledger: null, stats: [], transfers: [], totalTransfer: '0.00' },
  onLoad(options) { this.setData({ id: options.id || '' }); this.refresh() },
  refresh() {
    const ledger = storage.getLedger(this.data.id)
    if (!ledger) return
    const result = settlement.computeLedger(ledger)
    const stats = Object.keys(result.stats).map(id => { const item = result.stats[id]; return { ...item, paid: money.centsToYuan(item.paidCents), owed: money.centsToYuan(item.owedCents), balance: money.signedYuan(item.balanceCents) } })
    const transfers = result.transfers.map(item => ({ ...item, fromName: (ledger.members || []).find(member => member.id === item.fromId)?.name || '未知成员', toName: (ledger.members || []).find(member => member.id === item.toId)?.name || '未知成员', amount: money.centsToYuan(item.amountCents) }))
    this.setData({ ledger, stats, transfers, totalTransfer: money.centsToYuan(result.transfers.reduce((sum, item) => sum + item.amountCents, 0)) })
  }
})
