module.exports = {

  friendlyName: 'Get transactions',

  inputs: {
    id: { type: 'string', required: true }
  },

  fn: async function ({ id }) {

    const userId = this.req.apiUser.userId;

    // 1. Find account where (ID matches) AND (I am owner OR I am in sharedWith)
    const account = await Account.findOne({
      id: id,
      or: [
        { owner: userId },
        { sharedWith: { contains: userId } } // This checks the many-to-many collection
      ]
    });

    if (!account) {
      // If the account exists but I'm not the owner/member, this will trigger
      return this.res.forbidden('You do not have access to this account.');
    }

    // 2. Fetch transactions as usual
    const transactions = await Transaction.find({
      account: id
    }).sort('date DESC');

    return transactions;
  }
};