module.exports = {
  friendlyName: 'View trends',
  exits: { success: { responseType: 'view', viewTemplatePath: 'pages/trends' } },

  fn: async function () {
    const userId = this.req.session.userId || (this.req.apiUser && this.req.apiUser.userId);
    
    // ... (Your existing account/transaction fetching logic) ...
    const user = await User.findOne({ id: userId }).populate('sharedAccounts');
    const ownedAccounts = await Account.find({ owner: userId });
    const allAccountIds = [...ownedAccounts.map(a => a.id), ...user.sharedAccounts.map(a => a.id)];
    const transactions = await Transaction.find({ account: { in: allAccountIds } }).sort('date ASC');

    let cumulativeBalance = 0;
    const monthly = {};
    const categories = {};
    const velocityData = [];

    transactions.forEach(txn => {
      const d = new Date(txn.date);
      cumulativeBalance += txn.amount;
      velocityData.push({ x: d, y: cumulativeBalance });

      const mKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      if (!monthly[mKey]) monthly[mKey] = { income: 0, expense: 0 };

      if (txn.type === 'income') monthly[mKey].income += txn.amount;
      else if (txn.type === 'expense') {
        const amt = Math.abs(txn.amount);
        monthly[mKey].expense += amt;
        categories[txn.category] = (categories[txn.category] || 0) + amt;
      }
    });

    // --- REAL CALCULATIONS ---
    const monthKeys = Object.keys(monthly);
    const currentMonthKey = monthKeys[monthKeys.length - 1];
    const currentMonth = monthly[currentMonthKey] || { income: 0, expense: 0 };

    // 1. Stability (Lifetime Savings Rate)
    const totalInc = Object.values(monthly).reduce((s, m) => s + m.income, 0);
    const totalExp = Object.values(monthly).reduce((s, m) => s + m.expense, 0);
    const stability = totalInc > 0 ? (((totalInc - totalExp) / totalInc) * 100).toFixed(1) : 0;

    // 2. Capacity (How much of this month's income is already "burnt")
    // If expense > income, capacity is 100% (Danger Zone)
    const burnCapacity = currentMonth.income > 0 
      ? Math.min(100, (currentMonth.expense / currentMonth.income) * 100).toFixed(0) 
      : 0;

    // 3. Average Monthly Net for Runway
    const last3 = monthKeys.slice(-3);
    const avgNet = last3.reduce((s, k) => s + (monthly[k].income - monthly[k].expense), 0) / (last3.length || 1);

    return {
      currentBalance: cumulativeBalance,
      stability, // Real savings %
      burnCapacity, // Real % of income spent this month
      runway: (cumulativeBalance / (Math.abs(avgNet) || 1)).toFixed(1),
      projection: [cumulativeBalance, cumulativeBalance + avgNet, cumulativeBalance + (avgNet * 2)],
      allData: { monthly, quarterly: {}, yearly: {} }, // (Populate Q and Y as before)
      categoryData: { labels: Object.keys(categories), values: Object.values(categories) },
      velocityData: velocityData.slice(-30)
    };
  }
};