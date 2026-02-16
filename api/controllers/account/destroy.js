module.exports = {
  friendlyName: 'Delete or Leave account',
  inputs: { id: { type: 'string', required: true } },

  fn: async function (inputs) {
    const userId = this.req.session.userId || (this.req.apiUser && this.req.apiUser.userId);
    const account = await Account.findOne({ id: inputs.id });

    if (!account) return this.res.notFound();

    if (account.owner === userId) {
      // OWNER: Delete the whole thing + all transactions
      await Transaction.destroy({ account: inputs.id });
      await Account.destroyOne({ id: inputs.id });
    } else {
      // MEMBER: Just remove the connection (Leave the account)
      await Account.removeFromCollection(inputs.id, 'sharedWith').members([userId]);
    }

    return this.res.redirect('/accounts');
  }
};