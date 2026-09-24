function computeLedger(ledger) {
  const members = ledger.members || []
  const stats = {}
  members.forEach(member => { stats[member.id] = { member, paidCents: 0, owedCents: 0, balanceCents: 0 } })

  ;(ledger.bills || []).forEach(bill => {
    if (stats[bill.payerId]) stats[bill.payerId].paidCents += Number(bill.amountCents || 0)
    const participants = (bill.participantIds || []).filter(id => stats[id])
    if (!participants.length) return
    const amount = Number(bill.amountCents || 0)
    const base = Math.floor(amount / participants.length)
    let remainder = amount - base * participants.length
    participants.forEach(id => {
      stats[id].owedCents += base + (remainder > 0 ? 1 : 0)
      remainder -= remainder > 0 ? 1 : 0
    })
  })

  const creditors = []
  const debtors = []
  Object.keys(stats).forEach(id => {
    stats[id].balanceCents = stats[id].paidCents - stats[id].owedCents
    if (stats[id].balanceCents > 0) creditors.push({ id, cents: stats[id].balanceCents })
    if (stats[id].balanceCents < 0) debtors.push({ id, cents: -stats[id].balanceCents })
  })

  const transfers = []
  let creditorIndex = 0
  let debtorIndex = 0
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]
    const amountCents = Math.min(creditor.cents, debtor.cents)
    transfers.push({ fromId: debtor.id, toId: creditor.id, amountCents })
    creditor.cents -= amountCents
    debtor.cents -= amountCents
    if (!creditor.cents) creditorIndex += 1
    if (!debtor.cents) debtorIndex += 1
  }

  return { stats, transfers }
}

module.exports = { computeLedger }
