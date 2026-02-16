module.exports = {
  friendlyName: 'Create transaction',
  inputs: {
    accountId: { type: 'string', required: true },
    toAccountId: { type: 'string' },
    amount: { type: 'number', required: true },
    type: { type: 'string', isIn: ['income', 'expense', 'transfer'], required: true },
    category: { type: 'string', required: true },
    date: { type: 'string' },
    note: { type: 'string' }
  },

  fn: async function (inputs) {
    const userId = this.req.session.userId || (this.req.apiUser && this.req.apiUser.userId);

    // 1. Verify Access to "From" Account (Owner OR Member)
    const fromAccount = await Account.findOne({ id: inputs.accountId }).populate('sharedWith');
    if (!fromAccount) return this.res.status(404).json({ message: 'Account not found.' });

    const isMember = fromAccount.owner === userId || fromAccount.sharedWith.some(m => m.id === userId);
    if (!isMember) return this.res.status(403).json({ message: 'Access denied.' });

    const finalDate = inputs.date || new Date().toISOString();
    let absAmount = Math.abs(inputs.amount);

    // ====================================================
    // TRANSFER LOGIC
    // ====================================================
    if (inputs.type === 'transfer') {
      if (!inputs.toAccountId || inputs.accountId === inputs.toAccountId) {
        return this.res.status(400).json({ message: 'Select a valid destination.' });
      }

      // Verify Access to "To" Account
      const toAccount = await Account.findOne({ id: inputs.toAccountId }).populate('sharedWith');
      const isToMember = toAccount && (toAccount.owner === userId || toAccount.sharedWith.some(m => m.id === userId));
      if (!isToMember) return this.res.status(403).json({ message: 'No access to destination account.' });

      // Check Balance
      const allTxns = await Transaction.find({ account: inputs.accountId });
      const currentBalance = allTxns.reduce((sum, txn) => sum + txn.amount, 0);
      if (currentBalance < absAmount) {
        return this.res.status(400).json({ message: `Insufficient funds. Balance: ₹${currentBalance.toLocaleString('en-IN')}` });
      }

      const outgoing = await Transaction.create({
        account: inputs.accountId, amount: -absAmount, type: 'transfer', category: 'Transfer Out', date: finalDate, note: `To ${toAccount.name}: ${inputs.note || ''}`
      }).fetch();

      const incoming = await Transaction.create({
        account: inputs.toAccountId, amount: absAmount, type: 'transfer', category: 'Transfer In', date: finalDate, note: `From ${fromAccount.name}: ${inputs.note || ''}`, linkedTransaction: outgoing.id 
      }).fetch();

      await Transaction.updateOne({ id: outgoing.id }).set({ linkedTransaction: incoming.id });
    } 
    // ====================================================
    // INCOME/EXPENSE LOGIC
    // ====================================================
    else {
      let finalAmount = inputs.type === 'expense' ? -absAmount : absAmount;
      await Transaction.create({ account: inputs.accountId, amount: finalAmount, type: inputs.type, category: inputs.category, date: finalDate, note: inputs.note });
    }

    return this.res.ok();
  }
};