module.exports = {

  friendlyName: 'View account',

  inputs: {
    id: { type: 'string', required: true }
  },

  exits: {
    success: { responseType: 'view', viewTemplatePath: 'pages/accounts/view' },
    notFound: { responseType: 'notFound' }
  },

  fn: async function ({id}) {
    // 1. Get current User ID
    const userId = this.req.session.userId || (this.req.apiUser && this.req.apiUser.userId);

    // 2. Fetch the account by ID ONLY, but populate the collections
    const account = await Account.findOne({ id: id })
      .populate('owner')
      .populate('sharedWith');

    if (!account) { throw 'notFound'; }

    // 3. MANUAL PERMISSION CHECK
    // Check if you are the owner
    const isOwner = account.owner.id === userId;
    // Check if you are in the 'sharedWith' list
    const isMember = account.sharedWith.some(user => user.id === userId);

    if (!isOwner && !isMember) {
      // If you aren't the owner and not a member, you don't exist to this account
      throw 'notFound';
    }

    // 4. Fetch your other accounts (Owned + Shared) for the Transfer Dropdown
    // We fetch these separately to avoid the same 'plural association' error
    const ownedAccounts = await Account.find({ owner: userId });
    const userWithShared = await User.findOne({ id: userId }).populate('sharedAccounts');
    
    // Combine them and remove duplicates
    const allMyAccess = [...ownedAccounts, ...userWithShared.sharedAccounts];
    const uniqueMyAccounts = Array.from(new Map(allMyAccess.map(acc => [acc.id, acc])).values());

    // 5. Fetch Transactions
    const transactions = await Transaction.find({
      account: id
    }).sort('date DESC');

    // 6. Calculate Balance
    let currentBalance = 0;
    transactions.forEach(txn => {
      currentBalance += txn.amount;
    });
    account.balance = currentBalance;

    return {
      account: account,
      myAccounts: uniqueMyAccounts, // Passed to the transfer dropdown
      transactions: transactions,
      currentUserId: userId
    };
  }
};