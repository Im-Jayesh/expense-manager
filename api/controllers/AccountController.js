module.exports = {

  async index(req, res) {
    try {
      const userId = req.session.userId;

      // 1. Fetch the user and populate the accounts shared WITH them
      const me = await User.findOne({ id: userId }).populate('sharedAccounts');
      
      // 2. Fetch the accounts OWNED by them
      const ownedAccounts = await Account.find({ owner: userId }).populate('owner');

      // 3. Combine both lists (using a Map to ensure unique IDs if someone owns & shares)
      // We also need to populate the owner for shared accounts so the UI doesn't break
      const sharedAccountIds = me.sharedAccounts.map(acc => acc.id);
      const sharedAccountsPopulated = await Account.find({ id: sharedAccountIds }).populate('owner');

      // Merge arrays and remove duplicates
      const allAccounts = [...ownedAccounts, ...sharedAccountsPopulated];
      const uniqueAccounts = Array.from(new Map(allAccounts.map(acc => [acc.id, acc])).values());

      // 4. Fetch transactions to calculate balances (Source of Truth)
      const accountIds = uniqueAccounts.map(acc => acc.id);
      const transactions = await Transaction.find({ account: { in: accountIds } });

      let totalCombinedBalance = 0;
      uniqueAccounts.forEach(acc => {
        const accTxns = transactions.filter(t => t.account === acc.id);
        acc.balance = accTxns.reduce((sum, t) => sum + t.amount, 0);
        totalCombinedBalance += acc.balance;
      });

      // 5. Render
      return res.view('pages/accounts/accounts', {
        accounts: uniqueAccounts,
        totalCombinedBalance: totalCombinedBalance,
        currentUserId: userId
      });

    } catch (err) {
      console.error(err);
      return res.serverError(err);
    }
  },

  async createAccount(req, res) {
    try {
        return res.view('pages/accounts/create');
    } catch (error) {
        return res.serverError(error);
    }
  }

};