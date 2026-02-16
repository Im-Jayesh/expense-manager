module.exports = {

  friendlyName: 'Update account',

  description: 'Rename an existing account owned by the logged in user.',

  inputs: {

    id: {
      type: 'string',
      required: true,
      description: 'The id of the account to update.'
    },

    name: {
      type: 'string',
      required: true,
      maxLength: 200,
      description: 'The new name of the account.'
    }

  },

  exits: {

    notFound: {
      description: 'No account found with that id for this user.',
      responseType: 'notFound'
    }

  },

  fn: async function ({ id, name }) {

    const userId = this.req.apiUser.userId;

    // Update only if the account belongs to the logged-in user
    const updatedAccount = await Account.updateOne({
      id: id,
      owner: userId
    }).set({
      name: name
    });

    // If nothing was updated, account either doesn't exist or user doesn't own it
    if (!updatedAccount) {
      throw 'notFound';
    }

    return updatedAccount;

  }

};
