module.exports = {
  friendlyName: 'Update transaction',
  inputs: {
    id: { type: 'string', required: true },
    amount: { type: 'number' },
    type: { type: 'string', isIn: ['income', 'expense', 'transfer'] },
    category: { type: 'string' },
    date: { type: 'string' },
    note: { type: 'string' }
  },

  fn: async function (inputs) {
    const userId = this.req.session.userId || (this.req.apiUser && this.req.apiUser.userId);
    const txn = await Transaction.findOne({ id: inputs.id }).populate('account');
    if (!txn) return this.res.status(404).json({ message: 'Not found.' });

    // Verify Member Access
    const account = await Account.findOne({ id: txn.account.id }).populate('sharedWith');
    const hasAccess = account.owner === userId || account.sharedWith.some(m => m.id === userId);
    if (!hasAccess) return this.res.status(403).json({ message: 'Unauthorized.' });

    let finalAmount = Math.abs(inputs.amount);
    if (inputs.type === 'expense') finalAmount = -finalAmount;
    else if (inputs.type === 'transfer') {
      if (txn.amount < 0) finalAmount = -finalAmount;
    }

    await Transaction.updateOne({ id: inputs.id }).set({
      amount: finalAmount, type: inputs.type, category: inputs.category, date: inputs.date, note: inputs.note
    });

    if (txn.type === 'transfer' && txn.linkedTransaction) {
      const twin = await Transaction.findOne({ id: txn.linkedTransaction });
      if (twin) {
        await Transaction.updateOne({ id: twin.id }).set({
          amount: -finalAmount, date: inputs.date // Twin is always the opposite sign
        });
      }
    }
    return this.res.ok();
  }
};