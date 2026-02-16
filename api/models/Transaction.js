/**
 * User.js
 *
 * A user who can log in to this application.
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    account: {
      model: 'account',
      required: true
    },

    amount: {
      type: 'number',
      required: true,
    },

    type: {
      type: 'string',
      isIn: ['income', 'expense', 'transfer'],
      defaultsTo: 'income',
      description: 'The type of transaction.',
    },

    category: {
        type: 'string',
        required: true,
        description: 'The category of the transaction.',
    },

    date: {
        type: 'string',
        columnType: 'datetime'

    },

    note: {
        type: 'string',
        description: 'Additional notes about the transaction.',
    },

    linkedTransaction: {
      model: 'transaction',
      description: 'The ID of the matching transfer transaction (if any).'
    }

}
};
