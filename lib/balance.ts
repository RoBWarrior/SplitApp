export function calculateBalances(expenses: any[]) {
  const balances: Record<string, number> = {};

  expenses.forEach((exp) => {
    const splitBetween = exp.splitBetween || [];
    const splitCount = splitBetween.length;
    if (splitCount === 0) return;

    const share = exp.amount / splitCount;

    // Add total paid to payer
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;

    // Subtract each member's share
    splitBetween.forEach((uid: string) => {
      balances[uid] = (balances[uid] || 0) - share;
    });
  });

  return balances;
}

export function simplifyTransactions(balances: Record<string, number>) {
  const debtors = Object.entries(balances)
    .filter(([_, bal]) => bal < 0)
    .map(([uid, bal]) => ({ uid, amount: -bal }));

  const creditors = Object.entries(balances)
    .filter(([_, bal]) => bal > 0)
    .map(([uid, bal]) => ({ uid, amount: bal }));

  const transactions: { from: string; to: string; amount: number }[] = [];

  debtors.forEach((debtor) => {
    let amountToPay = debtor.amount;
    for (const creditor of creditors) {
      if (amountToPay === 0) break;
      const payAmount = Math.min(amountToPay, creditor.amount);
      if (payAmount > 0) {
        transactions.push({
          from: debtor.uid,
          to: creditor.uid,
          amount: payAmount,
        });
        amountToPay -= payAmount;
        creditor.amount -= payAmount;
      }
    }
  });

  return transactions;
}
