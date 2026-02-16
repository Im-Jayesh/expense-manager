module.exports = {
  friendlyName: 'Destroy transaction',
  inputs: { id: { type: 'string', required: true } },

  fn: async function (inputs) {
    const userId = this.req.session.userId || (this.req.apiUser && this.req.apiUser.userId);
    const txn = await Transaction.findOne({ id: inputs.id }).populate('account');
    if (!txn) return;

    // Verify Member Access
    const account = await Account.findOne({ id: txn.account.id }).populate('sharedWith');
    const hasAccess = account.owner === userId || account.sharedWith.some(m => m.id === userId);
    if (!hasAccess) return this.res.status(403).json({ message: 'Unauthorized.' });

    if (txn.linkedTransaction) {
      await Transaction.destroyOne({ id: txn.linkedTransaction });
    }
    await Transaction.destroyOne({ id: inputs.id });
    
    return this.res.ok();
  }
};