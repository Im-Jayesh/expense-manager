module.exports = {

  friendlyName: 'Share account',

  description: 'Share an account with another user via email.',

  inputs: {
    accountId: { type: 'string', required: true },
    email: { type: 'string', required: true, isEmail: true }
  },

  exits: {
    success: {
      description: 'Account shared successfully.'
    },
    badRequest: {
      description: 'Invalid user or request.',
      responseType: 'badRequest'
    }
  },

  fn: async function (inputs) {
    const cleanEmail = inputs.email.toLowerCase();

    // 1. Query using the CORRECT attribute name: emailAddress
    const userToAdd = await User.findOne({
      emailAddress: cleanEmail
    });

    if (!userToAdd) {
      throw { badRequest: { message: 'User with this email does not exist.' } };
    }

    // 2. Prevent sharing with self
    if (userToAdd.id === this.req.apiUser.userId) {
      throw { badRequest: { message: 'You already own this account.' } };
    }

    try {
      // 3. Add to collection
      // This establishes the many-to-many link in the join table
      await Account.addToCollection(inputs.accountId, 'sharedWith')
        .members([userToAdd.id]);
        
      return;
      
    } catch (err) {
      // Handle the case where they are already added to prevent another 500
      if (err.code === 'E_UNIQUE' || err.name === 'UsageError') {
        throw { badRequest: { message: 'This user already has access to this account.' } };
      }
      throw err;
    }
  }

};