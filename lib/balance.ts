export function calculateBalances(expenses: any[]) {
  const balances: Record<string, number> = {};

  expenses.forEach((exp) => {
    if (!exp.amount) return; // skip invalid expenses

    // ✅ Ensure splitBetween exists and is an array
    const splitBetween = Array.isArray(exp.splitBetween) && exp.splitBetween.length > 0
      ? exp.splitBetween
      : [exp.paidBy]; // fallback: assume only payer

    const splitCount = splitBetween.length;
    const share = exp.amount / splitCount;

    // ✅ Credit the payer
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;

    // ✅ Debit each participant
    splitBetween.forEach((uid: string) => {
      balances[uid] = (balances[uid] || 0) - share;
    });
  });

  return balances;
}
