const PERSONAL_KEY = 'yiqiji_personal_transactions_v1'
const LEDGER_KEY = 'yiqiji_shared_ledgers_v1'

function ensureData() {
  if (!Array.isArray(wx.getStorageSync(PERSONAL_KEY))) wx.setStorageSync(PERSONAL_KEY, [])
  if (!Array.isArray(wx.getStorageSync(LEDGER_KEY))) wx.setStorageSync(LEDGER_KEY, [])
}

function getPersonalTransactions() {
  ensureData()
  return wx.getStorageSync(PERSONAL_KEY) || []
}

function savePersonalTransactions(list) { wx.setStorageSync(PERSONAL_KEY, list) }

function addPersonalTransaction(item) {
  const list = getPersonalTransactions()
  list.unshift(item)
  savePersonalTransactions(list)
  return item
}

function deletePersonalTransaction(id) {
  savePersonalTransactions(getPersonalTransactions().filter(item => item.id !== id))
}

function getLedgers() {
  ensureData()
  return wx.getStorageSync(LEDGER_KEY) || []
}

function saveLedgers(list) { wx.setStorageSync(LEDGER_KEY, list) }

function getLedger(id) { return getLedgers().find(item => item.id === id) }

function upsertLedger(ledger) {
  const list = getLedgers()
  const index = list.findIndex(item => item.id === ledger.id)
  if (index >= 0) list[index] = ledger
  else list.unshift(ledger)
  saveLedgers(list)
  return ledger
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

module.exports = { ensureData, getPersonalTransactions, savePersonalTransactions, addPersonalTransaction, deletePersonalTransaction, getLedgers, saveLedgers, getLedger, upsertLedger, createId }
