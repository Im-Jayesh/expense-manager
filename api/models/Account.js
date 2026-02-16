module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true,
      maxLength: 200,
    },

    owner: {
      model: 'user',
      required: true
    },

    accountNumber: {
      type: 'string',
      unique: true,
    },

    sharedWith: {
      collection: 'user',
      via: 'sharedAccounts'
    },

  },

  // Lifecycle Callback: Runs automatically before a new record is created
  beforeCreate: async function (valuesToSet, proceed) {
    try {
      // Check if accountNumber wasn't manually provided
      if (!valuesToSet.accountNumber) {
        // Generate the number using your helper
        valuesToSet.accountNumber = await sails.helpers.generateAccountNumber();
      }
      
      // Continue with the creation
      return proceed();
    } catch (err) {
      // Stop creation if there is an error
      return proceed(err);
    }
  }

};