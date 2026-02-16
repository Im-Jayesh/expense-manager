module.exports = {
  friendlyName: 'Remove member',
  inputs: {
    accountId: { type: 'string', required: true },
    userIdToRemove: { type: 'string', required: true }
  },
  exits: {
    success: { description: 'Member removed.' },
    forbidden: { responseType: 'forbidden' }
  },
  fn: async function (inputs) {
    const currentUserId = this.req.session.userId || this.req.apiUser.userId;

    // 1. Verify that the person making the request is the OWNER
    const account = await Account.findOne({ id: inputs.accountId });
    if (!account || account.owner !== currentUserId) {
      // Allow a user to remove THEMSELVES even if they aren't the owner (Leave Account)
      if (inputs.userIdToRemove !== currentUserId) {
        throw 'forbidden';
      }
    }

    // 2. Remove the user from the many-to-many collection
    await Account.removeFromCollection(inputs.accountId, 'sharedWith')
      .members([inputs.userIdToRemove]);

    return;
  }
};